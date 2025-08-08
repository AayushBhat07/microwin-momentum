import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

// Award a badge to a user
export const awardBadge = mutation({
  args: {
    userId: v.id("users"),
    badgeName: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user already has this badge
    const existingBadge = await ctx.db
      .query("badges")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("badgeName"), args.badgeName))
      .unique();

    if (existingBadge) {
      return { alreadyHas: true };
    }

    // Award the badge
    await ctx.db.insert("badges", {
      userId: args.userId,
      badgeName: args.badgeName,
      dateEarned: Date.now(),
    });

    return { success: true };
  },
});

// Get user's badges
export const getUserBadges = query({
  args: { userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);
    const targetUserId = args.userId || currentUser?._id;
    
    if (!targetUserId) {
      return [];
    }

    const badges = await ctx.db
      .query("badges")
      .withIndex("by_user", (q) => q.eq("userId", targetUserId))
      .order("desc")
      .collect();

    return badges;
  },
});

// Check if user has specific badge
export const hasBadge = query({
  args: {
    userId: v.optional(v.id("users")),
    badgeName: v.string(),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);
    const targetUserId = args.userId || currentUser?._id;
    
    if (!targetUserId) {
      return false;
    }

    const badge = await ctx.db
      .query("badges")
      .withIndex("by_user", (q) => q.eq("userId", targetUserId))
      .filter((q) => q.eq(q.field("badgeName"), args.badgeName))
      .unique();

    return !!badge;
  },
});
