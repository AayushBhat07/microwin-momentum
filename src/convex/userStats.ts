import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

// Get user stats for a date range
export const getUserStats = query({
  args: {
    userId: v.optional(v.id("users")),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);
    const targetUserId = args.userId || currentUser?._id;
    
    if (!targetUserId) {
      return [];
    }

    let query = ctx.db
      .query("userStats")
      .withIndex("by_user_and_date", (q) => q.eq("userId", targetUserId));

    if (args.startDate) {
      query = query.filter((q) => q.gte(q.field("date"), args.startDate!));
    }
    if (args.endDate) {
      query = query.filter((q) => q.lte(q.field("date"), args.endDate!));
    }

    const stats = await query.order("desc").collect();
    return stats;
  },
});

// Get weekly stats for the current user
export const getWeeklyStats = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return {
        totalAchievements: 0,
        weeklyAchievements: 0,
        totalPoints: 0,
        weeklyStreak: 0,
      };
    }

    // Get total achievements
    const totalAchievements = await ctx.db
      .query("achievements")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect()
      .then(achievements => achievements.length);

    // Get this week's achievements
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const oneWeekAgoStr = oneWeekAgo.toISOString().split('T')[0];

    const weeklyStats = await ctx.db
      .query("userStats")
      .withIndex("by_user_and_date", (q) => q.eq("userId", user._id))
      .filter((q) => q.gte(q.field("date"), oneWeekAgoStr))
      .collect();

    const weeklyAchievements = weeklyStats.reduce((sum, stat) => sum + stat.achievementsCount, 0);
    const weeklyStreak = Math.min(user.currentStreak || 0, 7); // Cap at 7 for weekly display

    return {
      totalAchievements,
      weeklyAchievements,
      totalPoints: user.totalPoints || 0,
      weeklyStreak,
    };
  },
});

// Update user login streak
export const updateLoginStreak = mutation({
  args: {},
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Must be authenticated");
    }

    const now = Date.now();
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Check if user already logged in today
    const todayStats = await ctx.db
      .query("userStats")
      .withIndex("by_user_and_date", (q) => q.eq("userId", user._id).eq("date", today))
      .unique();

    if (todayStats) {
      // Already logged in today, just update lastLogin
      await ctx.db.patch(user._id, { lastLogin: now });
      return { streakUpdated: false };
    }

    // Check if user logged in yesterday
    const yesterdayStats = await ctx.db
      .query("userStats")
      .withIndex("by_user_and_date", (q) => q.eq("userId", user._id).eq("date", yesterday))
      .unique();

    let newStreak = 1;
    if (yesterdayStats) {
      // Continue streak
      newStreak = (user.currentStreak || 0) + 1;
    }

    // Update user streak
    const longestStreak = Math.max(user.longestStreak || 0, newStreak);
    
    await ctx.db.patch(user._id, {
      currentStreak: newStreak,
      longestStreak,
      lastLogin: now,
    });

    // Create today's stats entry
    await ctx.db.insert("userStats", {
      userId: user._id,
      date: today,
      achievementsCount: 0,
      pointsEarned: 0,
      goalsCompleted: 0,
    });

    // Award streak badges
    if (newStreak === 7) {
      await ctx.db.insert("badges", {
        userId: user._id,
        badgeName: "Week Warrior",
        dateEarned: now,
      });
    } else if (newStreak === 30) {
      await ctx.db.insert("badges", {
        userId: user._id,
        badgeName: "Month Master",
        dateEarned: now,
      });
    }

    return { streakUpdated: true, newStreak, longestStreak };
  },
});