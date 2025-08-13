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
        userTotals: v.optional(v.any()), // Accept fresh user totals
    },
    handler: async (ctx, { userId, achievement, userTotals }): Promise<Doc<"badges">[]> => {
        const newlyAwarded: Doc<"badges">[] = [];

        // 1. Get all data needed for evaluation
        // No longer need to query for userTotals, it's passed in.
        const userStreak = await ctx.runQuery(internal.userStats.getStreak, { userId });
        const categoryTotals = await ctx.runQuery(internal.userStats.getCategoryTotals, { userId });
        const allBadges = await ctx.runQuery(internal.badges.getBadgeCatalogInternal);
        const earnedSlugs = (await ctx.runQuery(internal.userStats.getEarnedBadgeSlugs, { userId })).map((b: any) => b.badgeSlug);
        const earnedSlugsSet = new Set(earnedSlugs);

        const categoryMap = new Map(categoryTotals.map((c: any) => [c.categorySlug, c.totalWins]));
        const totalAchievements = userTotals?.totalAchievements ?? 0;
        const currentStreak = userStreak?.currentStreak ?? 0;
        const totalPhotoCount = (userTotals as any)?.totalPhotoCount ?? 0;
        const totalVoiceCount = (userTotals as any)?.totalVoiceCount ?? 0;
        const totalTextCount = (userTotals as any)?.totalTextCount ?? 0;

        // 2. Evaluate all unearned badges
        for (const badge of allBadges) {
            if (earnedSlugsSet.has(badge.slug)) {
                continue; // Skip already earned badges
            }

            let shouldAward = false;
            if (badge.threshold) {
                switch (badge.family) {
                    case "wins":
                        if (totalAchievements >= badge.threshold) shouldAward = true;
                        break;
                    case "streak":
                        if (currentStreak >= badge.threshold) shouldAward = true;
                        break;
                    case "category":
                        if (badge.categorySlug) {
                            const categoryCount = categoryMap.get(badge.categorySlug) ?? 0;
                            if (categoryCount >= (badge.threshold || 0)) shouldAward = true;
                        }
                        break;
                    case "mode":
                        if (badge.modeType === "photo" && totalPhotoCount >= badge.threshold) {
                            shouldAward = true;
                        } else if (badge.modeType === "voice" && totalVoiceCount >= badge.threshold) {
                            shouldAward = true;
                        } else if (badge.modeType === "text" && totalTextCount >= badge.threshold) {
                            shouldAward = true;
                        }
                        break;
                }
            }

            if (shouldAward) {
                const awarded = await ctx.runMutation(internal.badges.awardBadge, {
                    userId,
                    badgeSlug: badge.slug,
                    reason: `Met criteria for ${badge.name}`,
                });
                if (awarded) {
                    newlyAwarded.push(awarded);
                    earnedSlugsSet.add(badge.slug); // Avoid re-awarding in the same run
                }
            }
        }

        // Special case for first win, as totalAchievements will be 1
        if (totalAchievements === 1 && !earnedSlugsSet.has("first_win")) {
             const awarded = await ctx.runMutation(internal.badges.awardBadge, {
                userId,
                badgeSlug: "first_win",
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
    const badgeDetailsPromises = badgeSlugs.map(slug => 
        ctx.db.query("badges").withIndex("by_slug", q => q.eq("slug", slug)).unique()
    );
    const badgeDetailsResults = await Promise.all(badgeDetailsPromises);

    const results = userBadges.map((ub, i) => ({
        userBadge: ub,
        badgeDetails: badgeDetailsResults[i]
    }));

    // Filter out any results where badge details were not found
    return results.filter(r => r.badgeDetails !== null);
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

    // 1. Get all badges from the catalog
    const allBadges = await ctx.db.query("badges").filter(q => q.eq(q.field("isActive"), true)).collect();

    // 2. Get all earned badge slugs for the user
    const earnedUserBadges = await ctx.db
      .query("userBadges")
      .withIndex("by_user_and_badge", (q) => q.eq("userId", userId))
      .collect();
    const earnedBadgeSlugs = new Set(earnedUserBadges.map(b => b.badgeSlug));

    // 3. Get user's stats
    const userTotals = await ctx.db.query("user_totals").withIndex("by_user", q => q.eq("userId", userId)).unique();
    const userStreak = await ctx.db.query("user_streaks").withIndex("by_user", q => q.eq("userId", userId)).unique();
    const userCategoryTotals = await ctx.db.query("userCategoryTotals").withIndex("by_user_and_category", q => q.eq("userId", userId)).collect();
    
    const totalAchievements = userTotals?.totalAchievements ?? 0;
    const currentStreak = userStreak?.currentStreak ?? 0;
    const categoryMap = new Map(userCategoryTotals.map(c => [c.categorySlug, c.totalWins]));

    const nearMisses = [];

    for (const badge of allBadges) {
      if (earnedBadgeSlugs.has(badge.slug) || !badge.threshold) {
        continue; // Skip if already earned or no threshold
      }

      let current = 0;
      const target = badge.threshold;
      let isNearMiss = false;

      switch (badge.family) {
        case "wins":
          current = totalAchievements;
          if (current > 0 && current < target) isNearMiss = true;
          break;
        case "streak":
          current = currentStreak;
          if (current > 0 && current < target) isNearMiss = true;
          break;
        case "category":
          if (badge.categorySlug) {
            current = categoryMap.get(badge.categorySlug) ?? 0;
            if (current > 0 && current < target) isNearMiss = true;
          }
          break;
        // Not implemented yet: variety, mode, explore, community
      }

      if (isNearMiss) {
        nearMisses.push({
          ...badge,
          progress: (current / target) * 100,
          current,
          target,
        });
      }
    }

    // Sort by progress descending and return top 3-5
    return nearMisses.sort((a, b) => b.progress - a.progress).slice(0, 3);
  },
});