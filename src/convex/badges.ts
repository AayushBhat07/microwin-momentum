import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

// Get user's badges
export const getUserBadges = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return [];
    }

    return await ctx.db
      .query("userBadges")
      .withIndex("by_user_and_earned_at", (q) => q.eq("userId", user._id))
      .collect();
  },
});

// Award a badge to a user
export const awardBadge = mutation({
  args: {
    badgeSlug: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Check if badge already exists
    const existingBadge = await ctx.db
      .query("badges")
      .withIndex("by_slug", (q) => q.eq("slug", args.badgeSlug))
      .first();

    if (!existingBadge) {
      throw new Error(`Badge ${args.badgeSlug} not found`);
    }

    // Check if user already has this badge
    const userHasBadge = await ctx.db
      .query("userBadges")
      .withIndex("by_user_and_badge", (q) => 
        q.eq("userId", args.userId).eq("badgeSlug", args.badgeSlug)
      )
      .first();

    if (userHasBadge) {
      return; // Already has badge
    }

    // Award the badge
    await ctx.db.insert("userBadges", {
      userId: args.userId,
      badgeSlug: args.badgeSlug,
      earnedAt: Date.now(),
    });
  },
});