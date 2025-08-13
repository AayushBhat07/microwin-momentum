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
    },
    handler: async (ctx, { userId, achievement, userTotals }): Promise<Doc<"badges">[]> => {
        const newlyAwarded: Doc<"badges">[] = [];

        // 1. Get all data needed for evaluation
        const categoryTotals = await ctx.runQuery(internal.userStats.getCategoryTotals, { userId });
        const allBadges = await ctx.runQuery(internal.badges.getBadgeCatalogInternal);
        const earnedBadges = await ctx.runQuery(internal.userStats.getEarnedBadgeSlugs, { userId });
        const earnedSlugsSet = new Set(earnedBadges.map((b: any) => b.badgeSlug));
        
        const categoryMap = new Map(categoryTotals.map((c: any) => [c.categorySlug, c.totalWins]));
        const totalAchievements = userTotals?.totalAchievements ?? 0;
        const currentStreak = (await ctx.runQuery(internal.userStats.getStreak, { userId }))?.currentStreak ?? 0;
        const totalPhotoCount = userTotals?.totalPhotoCount ?? 0;
        const totalVoiceCount = userTotals?.totalVoiceCount ?? 0;
        const totalTextCount = userTotals?.totalTextCount ?? 0;

        console.log(`Evaluating badges for user ${userId}`, { totalAchievements, currentStreak, totalPhotoCount, earnedSlugs: [...earnedSlugsSet] });

        // 2. Evaluate all unearned badges
        for (const badge of allBadges) {
            if (earnedSlugsSet.has(badge.slug)) {
                continue; // Skip already earned badges
            }

            let shouldAward = false;
            if (badge.threshold) {
                switch (badge.family) {
                    case "wins":
                        console.log(`Checking badge '${badge.slug}': totalAchievements (${totalAchievements}) >= threshold (${badge.threshold})`);
                        if (totalAchievements >= badge.threshold) shouldAward = true;
                        break;
                    case "streak":
                         console.log(`Checking badge '${badge.slug}': currentStreak (${currentStreak}) >= threshold (${badge.threshold})`);
                        if (currentStreak >= badge.threshold) shouldAward = true;
                        break;
                    case "category":
                        if (badge.categorySlug) {
                            const categoryCount = categoryMap.get(badge.categorySlug) ?? 0;
                            console.log(`Checking badge '${badge.slug}': categoryCount for '${badge.categorySlug}' (${categoryCount}) >= threshold (${badge.threshold})`);
                            if (categoryCount >= (badge.threshold || 0)) shouldAward = true;
                        }
                        break;
                    case "mode":
                        if (badge.modeType === "photo") {
                            console.log(`Checking badge '${badge.slug}': totalPhotoCount (${totalPhotoCount}) >= threshold (${badge.threshold})`);
                            if (totalPhotoCount >= badge.threshold) shouldAward = true;
                        } else if (badge.modeType === "voice") {
                             console.log(`Checking badge '${badge.slug}': totalVoiceCount (${totalVoiceCount}) >= threshold (${badge.threshold})`);
                            if (totalVoiceCount >= badge.threshold) shouldAward = true;
                        } else if (badge.modeType === "text") {
                             console.log(`Checking badge '${badge.slug}': totalTextCount (${totalTextCount}) >= threshold (${badge.threshold})`);
                            if (totalTextCount >= badge.threshold) shouldAward = true;
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

        // The "first_win" badge is now handled by the generic "wins" family logic with threshold: 1.
        // The special case has been removed to avoid redundancy.

        console.log(`Finished evaluation. Awarded ${newlyAwarded.length} new badges:`, newlyAwarded.map(b => b.slug));
        return newlyAwarded;
    }
});