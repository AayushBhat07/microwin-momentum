import { v } from "convex/values";
import { internal } from "./_generated/api";
import { Doc, Id } from "./_generated/dataModel";
import {
  internalAction,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// ===== PUBLIC APIs =====

export const getCatalog = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("badges").filter(q => q.eq(q.field("isActive"), true)).collect();
  },
});

export const getUserBadges = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const userBadges = await ctx.db
      .query("userBadges")
      .withIndex("by_user_and_earned_at", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    const badgesWithDetails = await Promise.all(
      userBadges.map(async (userBadge) => {
        const badgeDetails = await ctx.db
          .query("badges")
          .withIndex("by_slug", (q) => q.eq("slug", userBadge.badgeSlug))
          .unique();
        return { userBadge, badgeDetails };
      })
    );

    return badgesWithDetails.filter(b => b.badgeDetails !== null) as { userBadge: Doc<"userBadges">, badgeDetails: Doc<"badges"> }[];
  },
});

export const getRecent = query({
    args: { limit: v.optional(v.number()) },
    handler: async (ctx, { limit = 3 }) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];

        const userBadges = await ctx.db
            .query("userBadges")
            .withIndex("by_user_and_earned_at", (q) => q.eq("userId", userId))
            .order("desc")
            .take(limit);
        
        const badges = await Promise.all(userBadges.map(ub => 
            ctx.db.query("badges").withIndex("by_slug", q => q.eq("slug", ub.badgeSlug)).unique()
        ));

        return badges.filter(b => b !== null);
    }
});

export const featureBadge = mutation({
  args: {
    badgeSlug: v.string(),
    isFeatured: v.boolean(),
  },
  handler: async (ctx, { badgeSlug, isFeatured }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const userBadge = await ctx.db
      .query("userBadges")
      .withIndex("by_user_and_badge", (q) =>
        q.eq("userId", userId).eq("badgeSlug", badgeSlug)
      )
      .unique();

    if (!userBadge) {
      throw new Error("Badge not found or not earned by user.");
    }

    if (isFeatured) {
        const featuredCount = (await ctx.db.query("userBadges").withIndex("by_user_and_earned_at", q => q.eq("userId", userId)).filter(q => q.eq(q.field("isFeatured"), true)).collect()).length;
        if (featuredCount >= 5) {
            throw new Error("Maximum number of featured badges reached.");
        }
    }

    await ctx.db.patch(userBadge._id, { isFeatured });
    return { success: true };
  },
});

export const getNearMissBadges = query({
    args: {},
    handler: async (ctx) => {
        try {
            const userId = await getAuthUserId(ctx);
            if (!userId) return [];

            const user = await ctx.db.get(userId);
            if (!user) return [];

            const allBadges = await ctx.db.query("badges").filter(q => q.eq(q.field("isActive"), true)).collect();
            const earnedBadges = await ctx.db.query("userBadges").withIndex("by_user_and_badge", q => q.eq("userId", userId)).collect();
            const earnedBadgeSlugs = new Set(earnedBadges.map(b => b.badgeSlug));

            const userCategoryTotals = await ctx.db.query("userCategoryTotals").withIndex("by_user_and_category", q => q.eq("userId", userId)).collect();
            const categoryTotalsMap = new Map(userCategoryTotals.map(uct => [uct.categorySlug, uct.totalWins]));

            const nearMisses = allBadges
                .filter(badge => !earnedBadgeSlugs.has(badge.slug) && badge.threshold && badge.threshold > 0)
                .map(badge => {
                    let progress = 0;
                    let current = 0;
                    const target = badge.threshold!;

                    if (badge.family === "wins") {
                        current = user.totalAchievements || 0;
                    } else if (badge.family === "streak") {
                        current = user.currentStreak || 0;
                    } else if (badge.family === "category" && badge.slug.startsWith("category_mastery_")) {
                        const slugParts = badge.slug.split('_');
                        if (slugParts.length >= 3) {
                            const categorySlug = slugParts[2];
                            current = categoryTotalsMap.get(categorySlug) || 0;
                        } else {
                            return null; // malformed slug
                        }
                    } else {
                        return null; // Not a progress-based badge
                    }

                    if (target > 0) {
                        progress = Math.min((current / target) * 100, 100);
                    }
                    
                    if (progress > 0 && progress < 100) {
                        return {
                            ...badge,
                            progress,
                            current,
                            target
                        };
                    }
                    return null;
                })
                .filter((b): b is Doc<"badges"> & { progress: number; current: number; target: number; } => b !== null);

            return nearMisses.sort((a, b) => b.progress - a.progress).slice(0, 3);
        } catch (error) {
            console.error("Error in getNearMissBadges:", error);
            throw error; // Rethrow to notify the client of failure
        }
    }
});

// ===== INTERNAL AWARDING LOGIC =====

export const awardBadge = internalMutation({
  args: {
    userId: v.id("users"),
    badgeSlug: v.string(),
  },
  handler: async (ctx, { userId, badgeSlug }) => {
    const existing = await ctx.db
      .query("userBadges")
      .withIndex("by_user_and_badge", (q) =>
        q.eq("userId", userId).eq("badgeSlug", badgeSlug)
      )
      .unique();

    if (existing) {
      return null; // Already earned
    }

    const badge = await ctx.db.query("badges").withIndex("by_slug", q => q.eq("slug", badgeSlug)).unique();
    if (!badge) {
        console.warn(`Badge with slug "${badgeSlug}" not found in catalog.`);
        return null;
    }

    await ctx.db.insert("userBadges", {
      userId,
      badgeSlug,
      earnedAt: Date.now(),
      isFeatured: false,
    });

    return badge;
  },
});

export const evaluateOnboarding = internalMutation({
    args: { userId: v.id("users"), step: v.string() },
    handler: async (ctx, { userId, step }): Promise<any> => {
        const badgeMap: Record<string, string> = {
            welcome: "welcome",
            profile_complete: "profile_complete",
            first_win: "first_win",
            streak_intro: "streak_intro"
        };

        const badgeSlug = badgeMap[step];
        if (badgeSlug) {
            return await ctx.runMutation(internal.badges.awardBadge, { userId, badgeSlug });
        }
        return null;
    }
});

export const evaluateAchievement = internalAction({
  args: {
    userId: v.id("users"),
    achievement: v.any(), // Doc<"achievements">
  },
  handler: async (ctx, { userId, achievement }) => {
    const unlockedBadges: Doc<"badges">[] = [];

    const user = await ctx.runQuery(internal.users.get, { userId });
    if (!user) return [];

    const allBadges = await ctx.runQuery(internal.badges.getAllBadges);
    const userBadges = await ctx.runQuery(internal.badges.getAllUserBadges, { userId });
    const userBadgeSlugs = new Set(userBadges.map((b: any) => b.badgeSlug));

    // 1. Wins Milestones
    const totalAchievements = user.totalAchievements ? user.totalAchievements + 1 : 1;
    const winBadges = allBadges.filter((b: any) => b.family === "wins" && b.threshold);
    for (const badge of winBadges) {
        if (!userBadgeSlugs.has(badge.slug) && totalAchievements >= badge.threshold!) {
            const unlocked = await ctx.runMutation(internal.badges.awardBadge, { userId, badgeSlug: badge.slug });
            if(unlocked) unlockedBadges.push(unlocked);
        }
    }

    // 2. Streak Milestones
    const streakBadges = allBadges.filter((b: any) => b.family === "streak" && b.threshold);
    for (const badge of streakBadges) {
        if (!userBadgeSlugs.has(badge.slug) && user.currentStreak === badge.threshold!) {
            const unlocked = await ctx.runMutation(internal.badges.awardBadge, { userId, badgeSlug: badge.slug });
            if(unlocked) unlockedBadges.push(unlocked);
        }
    }

    // 3. Category Mastery
    const categorySlug = achievement.categorySlug;
    const categoryTotal = await ctx.runQuery(internal.badges.getCategoryTotal, { userId, categorySlug });
    const newCategoryTotal = (categoryTotal?.totalWins ?? 0) + 1;
    
    await ctx.runMutation(internal.badges.updateCategoryTotal, { userId, categorySlug, newTotal: newCategoryTotal });

    const categoryBadgeSlug = `category_mastery_${categorySlug}_20`;
    const categoryBadge = allBadges.find((b: any) => b.slug === categoryBadgeSlug);
    if (categoryBadge && !userBadgeSlugs.has(categoryBadge.slug) && newCategoryTotal >= categoryBadge.threshold!) {
        const unlocked = await ctx.runMutation(internal.badges.awardBadge, { userId, badgeSlug: categoryBadge.slug });
        if(unlocked) unlockedBadges.push(unlocked);
    }

    // 4. Mode Badges
    if (achievement.source === 'voice' && !userBadgeSlugs.has('voice_first')) {
        const unlocked = await ctx.runMutation(internal.badges.awardBadge, { userId, badgeSlug: "voice_first" });
        if(unlocked) unlockedBadges.push(unlocked);
    }
    if (achievement.photoStorageId && !userBadgeSlugs.has('photo_first')) {
        const unlocked = await ctx.runMutation(internal.badges.awardBadge, { userId, badgeSlug: "photo_first" });
        if(unlocked) unlockedBadges.push(unlocked);
    }
    
    // TODO: photo_7_in_30 logic would require querying achievements in a time window.

    return unlockedBadges;
  },
});


// ===== HELPERS =====
export const getAllBadges = internalQuery({
    args: {},
    handler: async (ctx) => await ctx.db.query("badges").collect()
});

export const getAllUserBadges = internalQuery({
    args: { userId: v.id("users") },
    handler: async (ctx, { userId }) => await ctx.db.query("userBadges").withIndex("by_user_and_badge", q => q.eq("userId", userId)).collect()
});

export const getCategoryTotal = internalQuery({
    args: { userId: v.id("users"), categorySlug: v.string() },
    handler: async (ctx, { userId, categorySlug }) => {
        return await ctx.db.query("userCategoryTotals").withIndex("by_user_and_category", q => q.eq("userId", userId).eq("categorySlug", categorySlug)).unique();
    }
});

export const updateCategoryTotal = internalMutation({
    args: { userId: v.id("users"), categorySlug: v.string(), newTotal: v.number() },
    handler: async (ctx, { userId, categorySlug, newTotal }) => {
        const existing = await ctx.db.query("userCategoryTotals").withIndex("by_user_and_category", q => q.eq("userId", userId).eq("categorySlug", categorySlug)).unique();
        if (existing) {
            await ctx.db.patch(existing._id, { totalWins: newTotal });
        } else {
            await ctx.db.insert("userCategoryTotals", { userId, categorySlug, totalWins: newTotal });
        }
    }
});