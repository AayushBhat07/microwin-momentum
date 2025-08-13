import { internal } from "./_generated/api";
import { internalAction, internalMutation, internalQuery, query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";
import { getAuthUserId } from "@convex-dev/auth/server";

// --- Idempotent Badge Awarding ---
export const awardBadge = internalMutation({
  args: {
    userId: v.id("users"),
    badgeSlug: v.string(),
    reason: v.optional(v.string()), // For logging/auditing
  },
  handler: async (ctx, { userId, badgeSlug, reason }) => {
    const existing = await ctx.db
      .query("userBadges")
      .withIndex("by_user_and_badge", (q) =>
        q.eq("userId", userId).eq("badgeSlug", badgeSlug)
      )
      .unique();

    if (existing) {
      return null; // Already awarded
    }

    const badge = await ctx.db
      .query("badges")
      .withIndex("by_slug", (q) => q.eq("slug", badgeSlug))
      .unique();

    if (!badge) {
      console.warn(`Badge with slug "${badgeSlug}" not found.`);
      return null;
    }

    await ctx.db.insert("userBadges", {
      userId,
      badgeSlug,
      earnedAt: Date.now(),
    });

    console.log(`Awarded badge "${badgeSlug}" to user ${userId}. Reason: ${reason}`);
    return badge;
  },
});

// --- Badge Evaluation Engine ---
export const checkAllBadges = internalAction({
    args: {
        userId: v.id("users"),
        achievement: v.optional(v.any()), 
    },
    handler: async (ctx, { userId, achievement }): Promise<Doc<"badges">[]> => {
        const newlyAwarded: Doc<"badges">[] = [];

        const userTotals = await ctx.runQuery(internal.users.getUserTotals, { userId });
        if (userTotals?.totalAchievements === 1) {
            const awarded: Doc<"badges"> | null = await ctx.runMutation(internal.badges.awardBadge, {
                userId,
                badgeSlug: "wins_1",
                reason: "First achievement logged",
            });
            if (awarded) newlyAwarded.push(awarded);
        }

        return newlyAwarded;
    }
});

export const getBadgeCatalogInternal = internalQuery({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("badges").collect();
    }
});

// --- Public APIs ---
export const getCatalog = query({
  handler: async (ctx) => {
    return await ctx.db.query("badges").filter(q => q.eq(q.field("isActive"), true)).collect();
  },
});

export const getUserBadges = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const userBadges = await ctx.db
      .query("userBadges")
      .withIndex("by_user_and_earned_at", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
    
    const badgeSlugs = userBadges.map(ub => ub.badgeSlug);
    const badgeDetails = await Promise.all(
        badgeSlugs.map(slug => ctx.db.query("badges").withIndex("by_slug", q => q.eq("slug", slug)).unique())
    );

    return userBadges.map((ub, i) => ({
        userBadge: ub,
        badgeDetails: badgeDetails[i]!
    }));
  },
});

export const featureBadge = mutation({
  args: {
    badgeSlug: v.string(),
    isFeatured: v.boolean(),
  },
  handler: async (ctx, { badgeSlug, isFeatured }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const userBadge = await ctx.db
      .query("userBadges")
      .withIndex("by_user_and_badge", (q) =>
        q.eq("userId", userId).eq("badgeSlug", badgeSlug)
      )
      .unique();

    if (!userBadge) {
      throw new Error("Badge not found");
    }

    await ctx.db.patch(userBadge._id, {
      isFeatured,
    });
  },
});

export const getNearMissBadges = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    // Get user stats for progress calculation
    const userTotals = await ctx.db
      .query("user_totals")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    const totalAchievements = userTotals?.totalAchievements || 0;

    // Return near-miss badges with progress
    const nearMissBadges = [];
    
    // Example: First Win badge (if user has 0 achievements)
    if (totalAchievements === 0) {
      nearMissBadges.push({
        _id: "wins_1",
        name: "First Victory",
        description: "Log your first achievement",
        progress: 0,
        current: 0,
        target: 1
      });
    }
    
    // Example: 10 Wins badge (if user has 1-9 achievements)
    if (totalAchievements > 0 && totalAchievements < 10) {
      nearMissBadges.push({
        _id: "wins_10",
        name: "Getting Started",
        description: "Log 10 achievements",
        progress: (totalAchievements / 10) * 100,
        current: totalAchievements,
        target: 10
      });
    }

    return nearMissBadges;
  },
});