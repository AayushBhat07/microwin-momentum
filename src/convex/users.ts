import { internalQuery, query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";
import { getAuthUserId } from "@convex-dev/auth/server";

export const deleteAccount = mutation({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User must be authenticated to delete their account.");
    }

    // This is a simplified deletion. In a real app, you'd want to delete
    // all associated data (achievements, goals, etc.) in a more robust way,
    // likely using an action to transactionally delete everything.
    await ctx.db.delete(userId);
  },
});

export const getCurrentUser = internalQuery({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }
    return await ctx.db.get(userId);
  }
});

export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }
    return await ctx.db.get(userId);
  },
});

export const getUserTotals = internalQuery({
    args: { userId: v.id("users") },
    handler: async (ctx, { userId }) => {
        return await ctx.db
            .query("user_totals")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .unique();
    }
});

export const getAll = internalQuery({
    handler: async (ctx) => {
        return await ctx.db.query("users").collect();
    }
});

export const searchUsers = query({
  args: { query: v.string() },
  handler: async (ctx, { query }) => {
    if (!query.trim()) {
      return [];
    }
    
    return await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.gte("username", query))
      .take(10);
  },
});

export const getProfileByUsername = query({
  args: { username: v.string() },
  handler: async (ctx, { username }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", username))
      .unique();
    
    if (!user) {
      return null;
    }

    // Get user achievements
    const achievements = await ctx.db
      .query("achievements")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    // Get user badges
    const userBadges = await ctx.db
      .query("userBadges")
      .withIndex("by_user_and_earned_at", (q) => q.eq("userId", user._id))
      .collect();

    return {
      ...user,
      achievements,
      badges: userBadges,
    };
  },
});