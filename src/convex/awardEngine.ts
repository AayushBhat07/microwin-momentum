import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { Doc } from "./_generated/dataModel";

// --- Badge Evaluation Engine ---
export const evaluateAndAwardBadges = internalMutation({
    args: {
        userId: v.id("users"),
        achievement: v.any(), // This is Doc<"achievements">
        userTotals: v.any(), // This is Doc<"user_totals">
    },
    handler: async (ctx, { userId, userTotals }): Promise<Doc<"badges">[]> => {
        const newlyAwarded: Doc<"badges">[] = [];

        // 1. Get all data needed for evaluation
        const categoryTotals = await ctx.db
            .query("userCategoryTotals")
            .withIndex("by_user_and_category", (q) => q.eq("userId", userId))
            .collect();
        const allBadges = await ctx.db.query("badges").collect();
        const earnedBadges = await ctx.db
            .query("userBadges")
            .withIndex("by_user_and_badge", (q) => q.eq("userId", userId))
            .collect();
        const earnedSlugsSet = new Set(earnedBadges.map((b) => b.badgeSlug));
        
        const categoryMap = new Map(categoryTotals.map((c) => [c.categorySlug, c.totalWins]));
        const totalAchievements = userTotals?.totalAchievements ?? 0;
        const userStreak = await ctx.db
            .query("user_streaks")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .unique();
        const currentStreak = userStreak?.currentStreak ?? 0;
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
                        if (totalAchievements >= badge.threshold) {
                            shouldAward = true;
                        }
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

        console.log(`Finished evaluation. Awarded ${newlyAwarded.length} new badges:`, newlyAwarded.map(b => b.slug));
        return newlyAwarded;
    }
});