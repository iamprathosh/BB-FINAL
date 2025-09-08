import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { auth } from "./auth";

// Function to create or get user after authentication
export const store = mutation({
  args: {
    name: v.optional(v.string()),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      // If no auth context, it might be too early - let's try to wait a bit
      console.log("No auth user ID found, authentication may not be complete yet");
      throw new Error("Authentication not complete yet - please try again");
    }

    // Check if user already exists in our users table
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_auth_id", (q) => q.eq("authId", userId))
      .unique();

    if (existingUser) {
      return existingUser._id;
    }

    // Check if this is the first user (to make them admin)
    const existingUsers = await ctx.db.query("users").collect();
    const isFirstUser = existingUsers.length === 0;

    // Get user profile data from args with defaults
    const userName = args.name || "Anonymous";
    const userEmail = args.email || "";
    
    // Create new user in our users table
    const newUserId = await ctx.db.insert("users", {
      authId: userId,
      name: userName,
      email: userEmail,
      role: isFirstUser ? "admin" : "worker", // First user becomes admin
    });

    return newUserId;
  },
});

export const current = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_auth_id", (q) => q.eq("authId", userId))
      .unique();

    return user;
  },
});

export const updateUserRole = mutation({
  args: {
    userId: v.id("users"),
    role: v.union(v.literal("admin"), v.literal("supervisor"), v.literal("worker")),
  },
  handler: async (ctx, args) => {
    const authUserId = await getAuthUserId(ctx);
    if (!authUserId) {
      throw new Error("Not authenticated");
    }

    // Get current user to check if they can update roles
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_auth_id", (q) => q.eq("authId", authUserId))
      .unique();

    // Only allow admins to update roles
    if (currentUser?.role !== "admin") {
      throw new Error("Only administrators can update user roles");
    }

    // Update the user's role
    await ctx.db.patch(args.userId, {
      role: args.role,
    });

    return "User role updated successfully";
  },
});

export const listUsers = query({
  args: {},
  handler: async (ctx) => {
    const authUserId = await getAuthUserId(ctx);
    if (!authUserId) {
      return [];
    }

    // Get current user to check if they can list users
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_auth_id", (q) => q.eq("authId", authUserId))
      .unique();

    // Only allow admins to list users
    if (currentUser?.role !== "admin") {
      return [];
    }

    return await ctx.db.query("users").collect();
  },
});
