import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";

export const listProducts = query({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db
      .query("products")
      .order("desc")
      .collect();
    return products;
  },
});

export const getProductsByCategory = query({
  args: { categoryId: v.id("categories") },
  handler: async (ctx, args) => {
    const products = await ctx.db
      .query("products")
      .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
      .order("desc")
      .collect();
    return products;
  },
});

// New flexible query for filtering products with optional category filter
export const getFilteredProducts = query({
  args: { 
    categoryId: v.optional(v.id("categories")),
  },
  handler: async (ctx, args) => {
    if (args.categoryId) {
      // Filter by specific category
      return await ctx.db
        .query("products")
        .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
        .order("desc")
        .collect();
    } else {
      // Return all products if no category specified
      return await ctx.db
        .query("products")
        .order("desc")
        .collect();
    }
  },
});

export const getProduct = query({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.id);
    return product;
  },
});

// Generate auto SKU
export const generateSKU = mutation({
  args: {
    category: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    // Get category prefix (first 3 letters, uppercase)
    const categoryPrefix = args.category.replace(/[^A-Za-z]/g, '').substring(0, 3).toUpperCase();
    
    // Get name prefix (first 3 letters, uppercase)
    const namePrefix = args.name.replace(/[^A-Za-z]/g, '').substring(0, 3).toUpperCase();
    
    // Get current count of products to generate sequence number
    const products = await ctx.db.query("products").collect();
    const sequenceNumber = String(products.length + 1).padStart(4, '0');
    
    // Generate timestamp-based suffix for uniqueness
    const timestamp = Date.now().toString().slice(-4);
    
    // Combine to create SKU: CAT-NAM-0001-1234
    const sku = `${categoryPrefix}-${namePrefix}-${sequenceNumber}-${timestamp}`;
    
    return sku;
  },
});

export const createProduct = mutation({
  args: {
    name: v.string(),
    sku: v.optional(v.string()), // Make SKU optional for auto-generation
    quantity: v.number(),
    price: v.number(),
    categoryId: v.id("categories"),
    unitOfMeasureId: v.id("unitsOfMeasure"),
    description: v.optional(v.string()),
    partNumber: v.optional(v.string()),
    location: v.optional(v.string()),
    imageId: v.optional(v.id("files")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Get current user
    const user = await ctx.db
      .query("users")
      .withIndex("by_auth_id", (q) => q.eq("authId", userId))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Auto-generate SKU if not provided
    let sku = args.sku;
    if (!sku) {
      // Get category info for SKU generation
      const category = await ctx.db.get(args.categoryId);
      const categoryName = category?.name || "UNK";
      
      // Get category prefix (first 3 letters, uppercase)
      const categoryPrefix = categoryName.replace(/[^A-Za-z]/g, '').substring(0, 3).toUpperCase();
      
      // Get name prefix (first 3 letters, uppercase)
      const namePrefix = args.name.replace(/[^A-Za-z]/g, '').substring(0, 3).toUpperCase();
      
      // Get current count of products to generate sequence number
      const products = await ctx.db.query("products").collect();
      const sequenceNumber = String(products.length + 1).padStart(4, '0');
      
      // Generate timestamp-based suffix for uniqueness
      const timestamp = Date.now().toString().slice(-4);
      
      // Combine to create SKU: CAT-NAM-0001-1234
      sku = `${categoryPrefix}-${namePrefix}-${sequenceNumber}-${timestamp}`;
    }
    
    // Create the product
    const productId = await ctx.db.insert("products", {
      name: args.name,
      sku: sku,
      quantity: args.quantity,
      price: args.price,
      categoryId: args.categoryId,
      unitOfMeasureId: args.unitOfMeasureId,
      description: args.description,
      partNumber: args.partNumber,
      location: args.location,
      imageId: args.imageId,
    });

    // Log the action
    await ctx.scheduler.runAfter(0, internal.logs.add, {
      userId: user._id,
      action: "Product Added",
      details: `Added product: ${args.name} (SKU: ${sku})`,
    });

    return productId;
  },
});

export const updateProduct = mutation({
  args: {
    id: v.id("products"),
    name: v.string(),
    sku: v.string(),
    quantity: v.number(),
    price: v.number(),
    categoryId: v.id("categories"),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Get current user
    const user = await ctx.db
      .query("users")
      .withIndex("by_auth_id", (q) => q.eq("authId", userId))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Update the product
    await ctx.db.patch(args.id, {
      name: args.name,
      sku: args.sku,
      quantity: args.quantity,
      price: args.price,
      categoryId: args.categoryId,
      description: args.description,
    });

    // Log the action
    await ctx.scheduler.runAfter(0, internal.logs.add, {
      userId: user._id,
      action: "Product Updated",
      details: `Updated product: ${args.name} (SKU: ${args.sku})`,
    });

    return args.id;
  },
});

export const deleteProduct = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Get current user
    const user = await ctx.db
      .query("users")
      .withIndex("by_auth_id", (q) => q.eq("authId", userId))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Get product details for logging
    const product = await ctx.db.get(args.id);
    if (!product) {
      throw new Error("Product not found");
    }

    // Delete the product
    await ctx.db.delete(args.id);

    // Log the action
    await ctx.scheduler.runAfter(0, internal.logs.add, {
      userId: user._id,
      action: "Product Deleted",
      details: `Deleted product: ${product.name} (SKU: ${product.sku})`,
    });

    return args.id;
  },
});

export const pullInventory = mutation({
  args: {
    productId: v.id("products"),
    quantity: v.number(),
    projectId: v.optional(v.id("projects")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Get current user
    const user = await ctx.db
      .query("users")
      .withIndex("by_auth_id", (q) => q.eq("authId", userId))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Get product
    const product = await ctx.db.get(args.productId);
    if (!product) {
      throw new Error("Product not found");
    }

    // Check if enough stock
    if (product.quantity < args.quantity) {
      throw new Error("Insufficient stock");
    }

    // Update product quantity
    await ctx.db.patch(args.productId, {
      quantity: product.quantity - args.quantity,
    });

    // Create transaction record
    await ctx.db.insert("inventoryTransactions", {
      productId: args.productId,
      projectId: args.projectId,
      userId: user._id,
      type: "pull",
      quantityChange: -args.quantity, // Negative for pulls
      unitCostAtTransaction: product.price,
      date: Date.now(),
      notes: args.notes,
    });

    // Log the action
    await ctx.scheduler.runAfter(0, internal.logs.add, {
      userId: user._id,
      action: "Inventory Pulled",
      details: `Pulled ${args.quantity} units of ${product.name} (SKU: ${product.sku})`,
      projectId: args.projectId,
    });

    return args.productId;
  },
});

export const returnInventory = mutation({
  args: {
    productId: v.id("products"),
    quantity: v.number(),
    projectId: v.optional(v.id("projects")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Get current user
    const user = await ctx.db
      .query("users")
      .withIndex("by_auth_id", (q) => q.eq("authId", userId))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Get product
    const product = await ctx.db.get(args.productId);
    if (!product) {
      throw new Error("Product not found");
    }

    // Update product quantity
    await ctx.db.patch(args.productId, {
      quantity: product.quantity + args.quantity,
    });

    // Create transaction record
    await ctx.db.insert("inventoryTransactions", {
      productId: args.productId,
      projectId: args.projectId,
      userId: user._id,
      type: "return",
      quantityChange: args.quantity, // Positive for returns
      unitCostAtTransaction: product.price,
      date: Date.now(),
      notes: args.notes,
    });

    // Log the action
    await ctx.scheduler.runAfter(0, internal.logs.add, {
      userId: user._id,
      action: "Inventory Returned",
      details: `Returned ${args.quantity} units of ${product.name} (SKU: ${product.sku})`,
      projectId: args.projectId,
    });

    return args.productId;
  },
});

export const receiveInventory = mutation({
  args: {
    productId: v.id("products"),
    quantity: v.number(),
    unitPrice: v.number(),
    reference: v.optional(v.string()),
    vendorId: v.optional(v.id("vendors")),
    deliveryReceiptNumber: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Get current user
    const user = await ctx.db
      .query("users")
      .withIndex("by_auth_id", (q) => q.eq("authId", userId))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Get product
    const product = await ctx.db.get(args.productId);
    if (!product) {
      throw new Error("Product not found");
    }

    // Calculate weighted average price with safe MAUC initialization
    const currentPrice = product.price ?? args.unitPrice ?? 0;
    const currentQuantity = product.quantity ?? 0;
    
    const currentValue = currentQuantity * currentPrice;
    const newValue = args.quantity * args.unitPrice;
    const totalValue = currentValue + newValue;
    const newQuantity = currentQuantity + args.quantity;
    const newPrice = newQuantity > 0 ? totalValue / newQuantity : args.unitPrice;

    // Update product with new quantity and weighted average price
    await ctx.db.patch(args.productId, {
      quantity: newQuantity,
      price: newPrice,
    });

    // Create transaction record with MAUC data
    await ctx.db.insert("inventoryTransactions", {
      productId: args.productId,
      userId: user._id,
      type: "receive",
      quantityChange: args.quantity,
      unitCostAtTransaction: args.unitPrice,
      date: Date.now(),
      notes: args.notes,
    });

    // Log the action
    await ctx.scheduler.runAfter(0, internal.logs.add, {
      userId: user._id,
      action: "Inventory Received",
      details: `Received ${args.quantity} units of ${product.name} (SKU: ${product.sku}) at $${args.unitPrice} per unit`,
    });

    return {
      productId: args.productId,
      newPrice: newPrice,
      previousPrice: product.price,
      quantityAdded: args.quantity,
      newTotalQuantity: newQuantity,
    };
  },
});
