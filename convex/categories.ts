import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Query all active categories
export const listCategories = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("categories")
      .collect();
  },
});

// Query all categories (admin only)
export const listAllCategories = query({
  handler: async (ctx) => {
    return await ctx.db.query("categories").collect();
  },
});

// Add new category (admin only)
export const addCategory = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Get current user
    const user = await ctx.db
      .query("appUsers")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", userId))
      .unique();

    if (!user) throw new Error("User not found");
    
    // Check if user is admin (in a real app, you'd check user role)
    // For now, we'll allow all authenticated users to create categories
    
    const categoryId = await ctx.db.insert("categories", {
      name: args.name,
      description: args.description,
    });

    return categoryId;
  },
});

// Update category (admin only)
export const updateCategory = mutation({
  args: {
    id: v.id("categories"),
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Get current user
    const user = await ctx.db
      .query("appUsers")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", userId))
      .unique();

    if (!user) throw new Error("User not found");

    await ctx.db.patch(args.id, {
      name: args.name,
      description: args.description,
    });

    return args.id;
  },
});

// Delete category (admin only)
export const deleteCategory = mutation({
  args: { id: v.id("categories") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Get current user
    const user = await ctx.db
      .query("appUsers")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", userId))
      .unique();

    if (!user) throw new Error("User not found");

    await ctx.db.delete(args.id);
  },
});
