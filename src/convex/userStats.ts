import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";
import { api } from "./_generated/api";

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

    // Get user totals
    const userTotals = await ctx.db
      .query("user_totals")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    // Get user streak
    const userStreak = await ctx.db
      .query("user_streaks")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    // Get this week's achievements
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const oneWeekAgoTime = oneWeekAgo.getTime();

    const weeklyAchievements = await ctx.db
      .query("achievements")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.gte(q.field("loggedAt"), oneWeekAgoTime))
      .collect()
      .then(achievements => achievements.length);

    return {
      totalAchievements,
      weeklyAchievements,
      totalPoints: userTotals?.totalPoints || 0,
      weeklyStreak: Math.min(userStreak?.currentStreak || 0, 7),
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

    // Get or create user streak record
    let streakData = await ctx.db
      .query("user_streaks")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    if (!streakData) {
      // Create initial streak record
      await ctx.db.insert("user_streaks", {
        userId: user._id,
        currentStreak: 1,
        longestStreak: 1,
        lastActivityDate: today,
        streakStartDate: today,
      });
      return { streakUpdated: true, newStreak: 1, longestStreak: 1 };
    }

    // Check if already logged in today
    if (streakData.lastActivityDate === today) {
      return { streakUpdated: false };
    }

    // Calculate streak continuation
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    let newStreak = 1;
    
    if (streakData.lastActivityDate === yesterday) {
      newStreak = streakData.currentStreak + 1;
    }

    const longestStreak = Math.max(streakData.longestStreak, newStreak);

    await ctx.db.patch(streakData._id, {
      currentStreak: newStreak,
      longestStreak,
      lastActivityDate: today,
    });

    // Award streak badges
    if (newStreak === 7) {
      await ctx.runMutation(api.badges.awardBadge, {
        userId: user._id,
        badgeName: "Week Warrior",
      });
    } else if (newStreak === 30) {
      await ctx.runMutation(api.badges.awardBadge, {
        userId: user._id,
        badgeName: "Month Master",
      });
    }

    return { streakUpdated: true, newStreak, longestStreak };
  },
});