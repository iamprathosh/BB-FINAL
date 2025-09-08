import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Manual function to make the first user an admin
export const makeFirstUserAdmin = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    // Find user by email in auth users table
    const authUsers = await ctx.db.query("appUsers").collect();
    const authUser = authUsers.find(user => user.email === args.email);
    
    if (!authUser) {
      throw new Error(`No auth user found with email: ${args.email}`);
    }

    // Check if user already exists in appUsers
    const existingAppUser = await ctx.db
      .query("appUsers")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", authUser._id))
      .unique();

    if (existingAppUser) {
      // Update existing user to admin
      await ctx.db.patch(existingAppUser._id, {
        role: "admin",
      });
      return `User ${args.email} updated to admin role`;
    } else {
      // Create new appUser with admin role
      await ctx.db.insert("appUsers", {
        name: authUser.name || "Admin",
        email: authUser.email || args.email,
        role: "admin",
        tokenIdentifier: authUser._id,
      });
      return `User ${args.email} created with admin role`;
    }
  },
});
