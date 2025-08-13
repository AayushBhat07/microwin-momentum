import { query, internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

export const getWeeklyStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return {
        totalAchievements: 0,
        weeklyAchievements: 0,
        totalPoints: 0,
        weeklyStreak: 0,
      };
    }

    // Get total points from user_totals
    const userTotals = await ctx.db
      .query("user_totals")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    // Get total achievements
    const allAchievements = await ctx.db
      .query("achievements")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Get current streak from user_streaks
    const userStreak = await ctx.db
      .query("user_streaks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    // Calculate weekly achievements
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const weeklyAchievements = allAchievements.filter(
      (a) => a.loggedAt > oneWeekAgo.getTime()
    ).length;

    return {
      totalAchievements: allAchievements.length,
      weeklyAchievements: weeklyAchievements,
      totalPoints: userTotals?.totalPoints || 0,
      weeklyStreak: userStreak?.currentStreak || 0,
    };
  },
});

export const updateUserPoints = internalMutation({
  args: { userId: v.id("users"), points: v.number() },
  handler: async (ctx, { userId, points }) => {
    const userTotals = await ctx.db
      .query("user_totals")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (userTotals) {
      await ctx.db.patch(userTotals._id, {
        totalPoints: userTotals.totalPoints + points,
        lastPointsUpdateAt: Date.now(),
      });
    } else {
      await ctx.db.insert("user_totals", {
        userId,
        totalPoints: points,
        totalAchievements: 1,
        lastPointsUpdateAt: Date.now(),
      });
    }
  },
});

export const updateUserStreak = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    const userStreak = await ctx.db
      .query("user_streaks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (userStreak) {
      const lastActivityDate = new Date(userStreak.lastActivityDate);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      if (userStreak.lastActivityDate === today) {
        // Already active today, do nothing
        return;
      }

      let newStreak = userStreak.currentStreak;
      if (
        lastActivityDate.toISOString().split("T")[0] ===
        yesterday.toISOString().split("T")[0]
      ) {
        // Continued streak
        newStreak++;
      } else {
        // Streak broken
        newStreak = 1;
      }

      await ctx.db.patch(userStreak._id, {
        currentStreak: newStreak,
        longestStreak: Math.max(newStreak, userStreak.longestStreak),
        lastActivityDate: today,
      });
    } else {
      // First activity
      await ctx.db.insert("user_streaks", {
        userId,
        currentStreak: 1,
        longestStreak: 1,
        lastActivityDate: today,
        streakStartDate: today,
      });
    }
  },
});

export const updateUserDailyStats = internalMutation({
  args: { userId: v.id("users"), points: v.number() },
  handler: async (ctx, { userId, points }) => {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    const dailyStat = await ctx.db
      .query("userStats")
      .withIndex("by_user_and_date", (q) =>
        q.eq("userId", userId).eq("date", today)
      )
      .unique();

    if (dailyStat) {
      await ctx.db.patch(dailyStat._id, {
        achievementsCount: dailyStat.achievementsCount + 1,
        pointsEarned: dailyStat.pointsEarned + points,
      });
    } else {
      await ctx.db.insert("userStats", {
        userId,
        date: today,
        achievementsCount: 1,
        pointsEarned: points,
        goalsCompleted: 0, // Assuming goals are handled elsewhere
        categories: ["general"], // Default category
        photoCount: 0, // Default to 0, can be updated if needed
      });
    }
  },
});