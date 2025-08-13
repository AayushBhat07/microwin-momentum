"use node";

import { v } from "convex/values";
import { internalAction, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { Doc, Id } from "./_generated/dataModel";

// --- Badge Evaluation Engine ---
export const evaluateAndAwardBadges = internalAction({
    args: {
        userId: v.id("users"),
        achievement: v.any(),
        userTotals: v.any(),
        userStreak: v.any(),
    },
    handler: async (ctx, { userId, achievement, userTotals, userStreak }): Promise<Doc<"badges">[]> => {
        const newlyAwarded: Doc<"badges">[] = [];

        // 1. Get all data needed for evaluation
        const categoryTotals = await ctx.runQuery(internal.userStats.getCategoryTotals, { userId });
        const allBadges = await ctx.runQuery(internal.badges.getBadgeCatalogInternal);
        const earnedSlugs = (await ctx.runQuery(internal.userStats.getEarnedBadgeSlugs, { userId })).map((b: any) => b.badgeSlug);
        const earnedSlugsSet = new Set(earnedSlugs);

        const categoryMap = new Map(categoryTotals.map((c: any) => [c.categorySlug, c.totalWins]));
        const totalAchievements = userTotals?.totalAchievements ?? 0;
        const currentStreak = userStreak?.currentStreak ?? 0;
        const totalPhotoCount = userTotals?.totalPhotoCount ?? 0;
        const totalVoiceCount = userTotals?.totalVoiceCount ?? 0;
        const totalTextCount = userTotals?.totalTextCount ?? 0;

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
