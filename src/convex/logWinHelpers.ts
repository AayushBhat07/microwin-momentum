import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";
import { getCurrentUser } from "./users";

// Internal query to check for duplicates
export const checkDuplicate = internalQuery({
  args: { clientId: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("User not authenticated");
    }

    return await ctx.db
      .query("achievements")
      .withIndex("by_user_and_client_id", (q) =>
        q.eq("userId", user._id).eq("clientId", args.clientId)
      )
      .first();
  },
});

// Internal mutation to create win with full gamification logic
export const createWinWithGameification = internalMutation({
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
    tags: v.optional(v.array(v.string())),
    isPublic: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("User not authenticated");
    }

    // Get category info
    const category = await ctx.db
      .query("achievement_categories")
      .withIndex("by_slug", (q) => q.eq("slug", args.categorySlug))
      .first();

    if (!category) {
      throw new Error("Invalid category");
    }

    // Calculate points with bonuses and multipliers
    let basePoints = category.basePoints;
    
    // Source-based bonuses
    const sourceBonuses = {
      quick: 0,
      text: 5,
      voice: 10,
      photo: 15,
    };
    
    const sourceBonus = sourceBonuses[args.source] || 0;
    let totalPoints = basePoints + sourceBonus;

    // Get current streak for multiplier
    const userStreak = await ctx.db
      .query("user_streaks")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    const currentStreak = userStreak?.currentStreak || 0;
    
    // Streak multipliers (every 7 days adds 10% bonus, max 50%)
    const streakMultiplier = Math.min(1 + (Math.floor(currentStreak / 7) * 0.1), 1.5);
    totalPoints = Math.floor(totalPoints * streakMultiplier);

    // Daily point cap check
    const today = new Date().toISOString().split('T')[0];
    const todayStats = await ctx.db
      .query("userStats")
      .withIndex("by_user_and_date", (q) => 
        q.eq("userId", user._id).eq("date", today)
      )
      .first();

    const dailyPointsEarned = todayStats?.pointsEarned || 0;
    const DAILY_POINT_CAP = 500;
    
    if (dailyPointsEarned >= DAILY_POINT_CAP) {
      totalPoints = Math.min(totalPoints, 10); // Minimal points after cap
    }

    // Create the achievement
    const achievementId = await ctx.db.insert("achievements", {
      userId: user._id,
      clientId: args.clientId,
      categorySlug: args.categorySlug,
      category: args.categorySlug as any,
      title: args.title,
      description: args.description,
      photoStorageId: args.photoStorageId,
      pointsEarned: totalPoints,
      points: totalPoints,
      source: args.source,
      tags: args.tags,
      isPublic: args.isPublic,
      loggedAt: Date.now(),
    });

    // Update user totals
    const userTotals = await ctx.db
      .query("user_totals")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    if (userTotals) {
      await ctx.db.patch(userTotals._id, {
        totalPoints: userTotals.totalPoints + totalPoints,
        totalAchievements: userTotals.totalAchievements + 1,
        lastPointsUpdateAt: Date.now(),
      });
    } else {
      await ctx.db.insert("user_totals", {
        userId: user._id,
        totalPoints: totalPoints,
        totalAchievements: 1,
        lastPointsUpdateAt: Date.now(),
      });
    }

    // Update streak (timezone-aware)
    const userTimezone = user.timezone || 'UTC';
    const userToday = new Date().toLocaleDateString('en-CA', { timeZone: userTimezone });
    
    let newStreak = 1;
    if (userStreak) {
      const lastActivityDate = userStreak.lastActivityDate;
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
        .toLocaleDateString('en-CA', { timeZone: userTimezone });
      
      if (lastActivityDate === yesterday) {
        newStreak = userStreak.currentStreak + 1;
      } else if (lastActivityDate === userToday) {
        newStreak = userStreak.currentStreak; // Same day, no streak change
      }
      
      await ctx.db.patch(userStreak._id, {
        currentStreak: newStreak,
        longestStreak: Math.max(userStreak.longestStreak, newStreak),
        lastActivityDate: userToday,
      });
    } else {
      await ctx.db.insert("user_streaks", {
        userId: user._id,
        currentStreak: 1,
        longestStreak: 1,
        lastActivityDate: userToday,
        streakStartDate: userToday,
      });
    }

    // Update daily stats
    if (todayStats) {
      await ctx.db.patch(todayStats._id, {
        achievementsCount: todayStats.achievementsCount + 1,
        pointsEarned: todayStats.pointsEarned + totalPoints,
      });
    } else {
      await ctx.db.insert("userStats", {
        userId: user._id,
        date: today,
        achievementsCount: 1,
        pointsEarned: totalPoints,
        goalsCompleted: 0,
      });
    }

    // Award badges based on streaks and achievement counts
    const totalAchievements = (userTotals?.totalAchievements || 0) + 1;
    
    // TODO: Implement badge system when badges.ts is created

    return {
      achievementId,
      pointsEarned: totalPoints,
      newStreak,
      totalPoints: (userTotals?.totalPoints || 0) + totalPoints,
      totalAchievements,
      achievement: await ctx.db.get(achievementId),
    };
  },
});