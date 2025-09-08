import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";

export const add = internalMutation({
  args: {
    userId: v.id("appUsers"),
    action: v.string(),
    details: v.any(),
    projectId: v.optional(v.id("projects")),
  },
  handler: async (ctx, args) => {
    const logId = await ctx.db.insert("actionLogs", {
      userId: args.userId,
      action: args.action,
      details: args.details,
      timestamp: Date.now(),
    });
    return logId;
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    // Fetch logs with user information
    const logs = await ctx.db
      .query("actionLogs")
      .order("desc")
      .collect();

    // Fetch user information for each log
    const logsWithUsers = await Promise.all(
      logs.map(async (log) => {
        const user = await ctx.db.get(log.userId);
        return {
          ...log,
          user: user,
        };
      })
    );

    return logsWithUsers;
  },
});
