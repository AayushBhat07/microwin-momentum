"use node";

import { v } from "convex/values";
import { action, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { Doc, Id } from "./_generated/dataModel";

// Main action to log a win with full gamification
export const logWin = action({
  args: {
    clientId: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    categorySlug: v.string(),
    source: v.union(
      v.literal("quick"),
      v.literal("text"),
      v.literal("voice"),
      v.literal("photo")
    ),
    photoStorageId: v.optional(v.id("_storage")),
    audioStorageId: v.optional(v.id("_storage")),
    tags: v.optional(v.array(v.string())),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args): Promise<{
    achievement: Doc<"achievements">;
    totals: Doc<"user_totals"> | null;
    streak: Doc<"user_streaks"> | null;
    unlockedBadges: Doc<"badges">[];
  } | { achievement: null, unlockedBadges: [] }> => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);
    if (!user) throw new Error("User not found");

    // Idempotency check
    const existing = await ctx.runQuery(internal.achievements.getAchievementByClientId, { clientId: args.clientId });
    if (existing) {
      return { achievement: existing, unlockedBadges: [] };
    }

    // 1. Create Achievement
    const achievementId = await ctx.runMutation(internal.achievements.createAchievement, {
      userId: user._id,
      ...args,
      isPublic: args.isPublic ?? true,
    });
    const achievement = (await ctx.runQuery(internal.achievements.get, { id: achievementId }))!;

    // 2. Update Stats
    await ctx.runMutation(internal.userStats.updateStatsForNewWin, {
      userId: user._id,
      categorySlug: args.categorySlug,
      points: achievement.pointsEarned,
      source: args.source,
    });

    // 3. Check for new badges
    const unlockedBadges = await ctx.runAction(internal.badges.checkAllBadges, {
      userId: user._id,
      achievement,
    });

    // 4. Fetch updated totals for return payload
    const totals = await ctx.runQuery(internal.users.getUserTotals, { userId: user._id });
    const streak = await ctx.runQuery(internal.userStats.getStreak, { userId: user._id });

    return {
      achievement,
      totals,
      streak,
      unlockedBadges,
    };
  },
});