import { mutation } from "./_generated/server";

export const clearAuthUsers = mutation({
  args: {},
  handler: async (ctx) => {
    try {
      // Clear all users from the auth users table
      const users = await ctx.db.query("users").collect();
      
      for (const user of users) {
        await ctx.db.delete(user._id);
      }
      
      console.log(`Cleared ${users.length} users from auth table`);
      
      return {
        success: true,
        message: `Cleared ${users.length} users from auth table`,
        deletedCount: users.length
      };
    } catch (error) {
      console.error("Error clearing auth users:", error);
      throw new Error(`Failed to clear auth users: ${error}`);
    }
  },
});
