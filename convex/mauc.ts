import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { Doc, Id } from "./_generated/dataModel";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Simplified inventory management without MAUC fields
 * 
 * Since the new schema only has quantity and price fields,
 * we'll use price as the current unit cost and update it
 * using weighted average when receiving inventory.
 */

export const calculateWeightedAverage = internalMutation({
  args: {
    productId: v.id("products"),
    newQuantity: v.number(),
    newUnitCost: v.number(),
    transactionType: v.string(), // "receive", "adjust", "return"
  },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.productId);
    if (!product) {
      throw new Error("Product not found");
    }

    let newQuantity: number;
    let newPrice: number; // This will be our weighted average unit cost

    if (args.transactionType === "receive" || args.transactionType === "return") {
      // Calculate weighted average when receiving inventory
      const currentValue = product.quantity * product.price;
      const newValue = args.newQuantity * args.newUnitCost;
      const totalValue = currentValue + newValue;
      
      newQuantity = product.quantity + args.newQuantity;
      newPrice = newQuantity > 0 ? totalValue / newQuantity : args.newUnitCost;
      
    } else if (args.transactionType === "pull") {
      // When pulling inventory, quantity decreases but price stays same
      if (args.newQuantity > product.quantity) {
        throw new Error("Cannot remove more inventory than available");
      }
      newQuantity = product.quantity - Math.abs(args.newQuantity);
      newPrice = product.price; // Price remains the same
      
    } else if (args.transactionType === "adjustment") {
      // Inventory adjustment
      newQuantity = product.quantity + args.newQuantity;
      if (args.newQuantity > 0) {
        // Positive adjustment - calculate weighted average
        const currentValue = product.quantity * product.price;
        const adjustValue = args.newQuantity * args.newUnitCost;
        const totalValue = currentValue + adjustValue;
        newPrice = newQuantity > 0 ? totalValue / newQuantity : args.newUnitCost;
      } else {
        // Negative adjustment - price stays the same
        newPrice = product.price;
      }
    } else {
      throw new Error(`Unsupported transaction type: ${args.transactionType}`);
    }

    // Update the product
    await ctx.db.patch(args.productId, {
      quantity: Math.max(0, newQuantity),
      price: newPrice,
    });

    return {
      oldQuantity: product.quantity,
      newQuantity: Math.max(0, newQuantity),
      oldPrice: product.price,
      newPrice: newPrice,
    };
  },
});

interface WeightedAverageResult {
  oldQuantity: number;
  newQuantity: number;
  oldPrice: number;
  newPrice: number;
}

export const receiveInventory = mutation({
  args: {
    productId: v.id("products"),
    quantity: v.number(),
    unitCost: v.number(),
    projectId: v.optional(v.id("projects")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<Id<"inventoryTransactions">> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("appUsers")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", userId))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const product = await ctx.db.get(args.productId);
    if (!product) {
      throw new Error("Product not found");
    }

    // Update inventory using weighted average
    const result = await ctx.runMutation(internal.mauc.calculateWeightedAverage, {
      productId: args.productId,
      newQuantity: args.quantity,
      newUnitCost: args.unitCost,
      transactionType: "receive"
    });

    // Create transaction record
    const transactionId: Id<"inventoryTransactions"> = await ctx.db.insert("inventoryTransactions", {
      productId: args.productId,
      projectId: args.projectId,
      type: "receive",
      quantityChange: args.quantity,
      unitCostAtTransaction: args.unitCost,
      date: Date.now(),
      userId: user._id,
      notes: args.notes,
    });

    // Log the action
    const unit = await ctx.db.get(product.unitOfMeasureId);
    await ctx.scheduler.runAfter(0, internal.logs.add, {
      userId: user._id,
      action: "Inventory Received",
      details: `Received ${args.quantity} ${unit?.abbreviation || 'units'} of ${product.name} at $${args.unitCost.toFixed(2)} per unit. New average cost: $${result.newPrice.toFixed(2)}`,
      projectId: args.projectId,
    });

    return transactionId;
  },
});

export const getPriceHistory = query({
  args: {
    productId: v.id("products"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    
    const transactions = await ctx.db
      .query("inventoryTransactions")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .filter((q) => q.or(
        q.eq(q.field("type"), "receive"),
        q.eq(q.field("type"), "adjustment")
      ))
      .order("desc")
      .take(limit);

    // Enrich with user and project information
    const enrichedTransactions = await Promise.all(
      transactions.map(async (transaction) => {
        const user = transaction.userId ? await ctx.db.get(transaction.userId) : null;
        const project = transaction.projectId ? await ctx.db.get(transaction.projectId) : null;
        
        return {
          ...transaction,
          user,
          project,
        };
      })
    );

    return enrichedTransactions;
  },
});

export const getProductAnalytics = query({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.productId);
    if (!product) {
      throw new Error("Product not found");
    }

    // Get all receive transactions for this product
    const receiveTransactions = await ctx.db
      .query("inventoryTransactions")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .filter((q) => q.eq(q.field("type"), "receive"))
      .order("desc")
      .collect();

    // Calculate price variance statistics from transaction costs
    const prices = receiveTransactions.map(t => t.unitCostAtTransaction);
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
    const avgPrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;
    
    // Calculate current inventory value
    const inventoryValue = product.quantity * product.price;

    return {
      product,
      currentPrice: product.price,
      totalQuantity: product.quantity,
      inventoryValue: inventoryValue,
      
      priceStatistics: {
        minPrice,
        maxPrice,
        avgPrice,
        priceVariance: maxPrice - minPrice,
        priceVariancePercent: minPrice > 0 ? ((maxPrice - minPrice) / minPrice) * 100 : 0,
      },
      
      totalReceiveTransactions: receiveTransactions.length,
      recentTransactions: receiveTransactions.slice(0, 5),
    };
  },
});

// Utility function to initialize price for existing products
export const initializePriceForProduct = mutation({
  args: {
    productId: v.id("products"),
    initialPrice: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.productId);
    if (!product) {
      throw new Error("Product not found");
    }

    // Use provided initial price, or current price as fallback
    const initialPrice = args.initialPrice || product.price;
    
    await ctx.db.patch(args.productId, {
      price: initialPrice,
    });

    return {
      productId: args.productId,
      initializedPrice: initialPrice,
      currentQuantity: product.quantity,
      inventoryValue: product.quantity * initialPrice,
    };
  },
});
