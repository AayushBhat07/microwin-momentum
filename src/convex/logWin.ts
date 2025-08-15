"use node";

import { v } from "convex/values";
import { action, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { Doc, Id } from "./_generated/dataModel";
import { evaluateAndAwardBadges } from "./awardEngine";

// Main action to log a win with full gamification
export const logWin = action({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    categorySlug: v.string(),
    mode: v.union(v.literal("text"), v.literal("voice"), v.literal("photo")),
    photoStorageId: v.optional(v.id("_storage")),
    audioStorageId: v.optional(v.id("_storage")),
    tags: v.optional(v.array(v.string())),
    isPublic: v.optional(v.boolean()),
    clientId: v.string(),
  },
  handler: async (ctx, args): Promise<{
    success: boolean;
    achievement: Doc<"achievements">;
    totals: Doc<"user_totals"> | null;
    streak: Doc<"user_streaks"> | null;
    badges_unlocked: any[]; // TODO: type this
  }> => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);
    if (!user) throw new Error("User not found");

    // 1. Create Achievement
    const achievementId = await ctx.runMutation(internal.achievements.createAchievement, {
      userId: user._id,
      clientId: args.clientId,
      title: args.title.trim(),
      description: args.description?.trim() ?? "",
      categorySlug: args.categorySlug,
      photoStorageId: args.photoStorageId,
      audioStorageId: args.audioStorageId,
      tags: args.tags,
      isPublic: args.isPublic ?? true,
      source: args.mode,
    });
    const achievement = (await ctx.runQuery(internal.achievements.get, { id: achievementId }))!;

    // 2. Update Stats and get the latest totals
    const updatedTotals = await ctx.runMutation(internal.userStats.updateStatsForNewWin, {
      userId: user._id,
      categorySlug: args.categorySlug,
      points: achievement.pointsEarned,
      source: args.mode,
    });

    // 3. Evaluate and award new badges - handled by the achievement logging mutation
    const badges_unlocked: any[] = [];

    // 4. Get latest streak info to return to client
    const streak = await ctx.runQuery(internal.userStats.getStreak, { userId: user._id });

    // 5. Return full payload
    return {
      success: true,
      achievement,
      totals: updatedTotals,
      streak,
      badges_unlocked,
    };
  },
});