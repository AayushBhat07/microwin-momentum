"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";

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
  handler: async (ctx, args): Promise<any> => {
    // Check for duplicate using clientId (idempotency)
    const existingWin: any = await ctx.runQuery(internal.logWinHelpers.checkDuplicate, {
      clientId: args.clientId,
    });

    if (existingWin) {
      return existingWin;
    }

    // Create the achievement and update all related data
    const result: any = await ctx.runMutation(internal.logWinHelpers.createWinWithGameification, {
      ...args,
      isPublic: args.isPublic ?? true,
    });

    // Return comprehensive data for UI updates
    return {
      achievement: result.achievement,
      pointsEarned: result.pointsEarned,
      newStreak: result.newStreak,
      totalPoints: result.totalPoints,
      totalAchievements: result.totalAchievements,
      unlockedBadges: result.unlockedBadges || []
    };
  },
});