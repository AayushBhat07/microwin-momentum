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
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
  },
});

// Award a badge to a user
export const awardBadge = mutation({
  args: {
    badgeName: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Check if badge already exists
    const existingBadge = await ctx.db
      .query("badges")
      .filter((q) => q.eq(q.field("badgeName"), args.badgeName))
      .first();

    let badgeId;
    if (existingBadge) {
      badgeId = existingBadge._id;
    } else {
      // Create new badge
      badgeId = await ctx.db.insert("badges", {
        badgeName: args.badgeName,
        description: `Badge: ${args.badgeName}`,
        icon: "star",
        type: "special",
      });
    }

    // Check if user already has this badge
    const userHasBadge = await ctx.db
      .query("userBadges")
      .withIndex("by_user_and_badge", (q) => 
        q.eq("userId", args.userId).eq("badgeId", badgeId)
      )
      .first();

    if (userHasBadge) {
      return; // Already has badge
    }

    // Award the badge
    await ctx.db.insert("userBadges", {
      userId: args.userId,
      badgeId,
      dateEarned: Date.now(),
    });
  },
});