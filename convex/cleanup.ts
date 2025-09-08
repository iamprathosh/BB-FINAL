import { mutation } from "./_generated/server";

export const clearAllData = mutation({
  args: {},
  handler: async (ctx) => {
    // Clear all data in the correct order (to avoid foreign key constraints)
    
    // Clear inventory transactions first
    const transactions = await ctx.db.query("inventoryTransactions").collect();
    for (const transaction of transactions) {
      await ctx.db.delete(transaction._id);
    }

    // Note: Purchase order line items are embedded in purchaseOrders, not a separate table

    // Clear purchase orders
    const purchaseOrders = await ctx.db.query("purchaseOrders").collect();
    for (const po of purchaseOrders) {
      await ctx.db.delete(po._id);
    }

    // Clear vendor products
    const vendorProducts = await ctx.db.query("vendorProducts").collect();
    for (const vp of vendorProducts) {
      await ctx.db.delete(vp._id);
    }

    // Clear products
    const products = await ctx.db.query("products").collect();
    for (const product of products) {
      await ctx.db.delete(product._id);
    }

    // Clear vendors
    const vendors = await ctx.db.query("vendors").collect();
    for (const vendor of vendors) {
      await ctx.db.delete(vendor._id);
    }

    // Clear projects
    const projects = await ctx.db.query("projects").collect();
    for (const project of projects) {
      await ctx.db.delete(project._id);
    }

    // Clear categories
    const categories = await ctx.db.query("categories").collect();
    for (const category of categories) {
      await ctx.db.delete(category._id);
    }

    // Clear units of measure
    const units = await ctx.db.query("unitsOfMeasure").collect();
    for (const unit of units) {
      await ctx.db.delete(unit._id);
    }

    // Clear action logs
    const logs = await ctx.db.query("actionLogs").collect();
    for (const log of logs) {
      await ctx.db.delete(log._id);
    }

    return {
      success: true,
      message: "All data cleared successfully",
      deleted: {
        transactions: transactions.length,
        // poLineItems are embedded in purchaseOrders
        purchaseOrders: purchaseOrders.length,
        vendorProducts: vendorProducts.length,
        products: products.length,
        vendors: vendors.length,
        projects: projects.length,
        categories: categories.length,
        units: units.length,
        logs: logs.length
      }
    };
  }
});

export const clearDataExceptUsers = mutation({
  args: {},
  handler: async (ctx) => {
    // Clear all data except users table
    
    const transactions = await ctx.db.query("inventoryTransactions").collect();
    for (const transaction of transactions) {
      await ctx.db.delete(transaction._id);
    }

    // Note: Purchase order line items are embedded in purchaseOrders, not a separate table

    const purchaseOrders = await ctx.db.query("purchaseOrders").collect();
    for (const po of purchaseOrders) {
      await ctx.db.delete(po._id);
    }

    const vendorProducts = await ctx.db.query("vendorProducts").collect();
    for (const vp of vendorProducts) {
      await ctx.db.delete(vp._id);
    }

    const products = await ctx.db.query("products").collect();
    for (const product of products) {
      await ctx.db.delete(product._id);
    }

    const vendors = await ctx.db.query("vendors").collect();
    for (const vendor of vendors) {
      await ctx.db.delete(vendor._id);
    }

    const projects = await ctx.db.query("projects").collect();
    for (const project of projects) {
      await ctx.db.delete(project._id);
    }

    const categories = await ctx.db.query("categories").collect();
    for (const category of categories) {
      await ctx.db.delete(category._id);
    }

    const units = await ctx.db.query("unitsOfMeasure").collect();
    for (const unit of units) {
      await ctx.db.delete(unit._id);
    }

    const logs = await ctx.db.query("actionLogs").collect();
    for (const log of logs) {
      await ctx.db.delete(log._id);
    }

    return {
      success: true,
      message: "All data cleared successfully (users preserved)",
      deleted: {
        transactions: transactions.length,
        // poLineItems are embedded in purchaseOrders
        purchaseOrders: purchaseOrders.length,
        vendorProducts: vendorProducts.length,
        products: products.length,
        vendors: vendors.length,
        projects: projects.length,
        categories: categories.length,
        units: units.length,
        logs: logs.length
      }
    };
  }
});
