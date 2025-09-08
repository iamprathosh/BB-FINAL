import { mutation } from "./_generated/server";

// Clear all data from database to allow schema migration
export const clearAllData = mutation({
  args: {},
  handler: async (ctx) => {
    console.log("Starting to clear all data for schema migration...");
    
    let deletedCount = 0;
    
    try {
      // Clear all tables in the right order to avoid foreign key issues
      
      // Clear inventory transactions first
      const transactions = await ctx.db.query("inventoryTransactions").collect();
      for (const item of transactions) {
        await ctx.db.delete(item._id);
        deletedCount++;
      }
      
      // Clear purchase orders
      const purchaseOrders = await ctx.db.query("purchaseOrders").collect();
      for (const item of purchaseOrders) {
        await ctx.db.delete(item._id);
        deletedCount++;
      }
      
      // Clear products
      const products = await ctx.db.query("products").collect();
      for (const item of products) {
        await ctx.db.delete(item._id);
        deletedCount++;
      }
      
      // Clear vendor products
      const vendorProducts = await ctx.db.query("vendorProducts").collect();
      for (const item of vendorProducts) {
        await ctx.db.delete(item._id);
        deletedCount++;
      }
      
      // Clear vendors
      const vendors = await ctx.db.query("vendors").collect();
      for (const item of vendors) {
        await ctx.db.delete(item._id);
        deletedCount++;
      }
      
      // Clear projects
      const projects = await ctx.db.query("projects").collect();
      for (const item of projects) {
        await ctx.db.delete(item._id);
        deletedCount++;
      }
      
      // Clear categories
      const categories = await ctx.db.query("categories").collect();
      for (const item of categories) {
        await ctx.db.delete(item._id);
        deletedCount++;
      }
      
      // Clear units
      const units = await ctx.db.query("unitsOfMeasure").collect();
      for (const item of units) {
        await ctx.db.delete(item._id);
        deletedCount++;
      }
      
      // Clear action logs
      const logs = await ctx.db.query("actionLogs").collect();
      for (const item of logs) {
        await ctx.db.delete(item._id);
        deletedCount++;
      }
      
      // Clear files
      const files = await ctx.db.query("files").collect();
      for (const item of files) {
        await ctx.db.delete(item._id);
        deletedCount++;
      }
      
      // Clear appUsers (new table)
      try {
        const appUsers = await ctx.db.query("appUsers").collect();
        for (const item of appUsers) {
          await ctx.db.delete(item._id);
          deletedCount++;
        }
      } catch (error) {
        console.log("appUsers table doesn't exist yet, skipping");
      }
      
      console.log(`Successfully cleared all data! Deleted ${deletedCount} records.`);
      
      return {
        success: true,
        message: `Successfully cleared all data! Deleted ${deletedCount} records.`,
        deletedCount
      };
      
    } catch (error) {
      console.error("Error clearing data:", error);
      throw new Error(`Failed to clear data: ${error}`);
    }
  },
});
