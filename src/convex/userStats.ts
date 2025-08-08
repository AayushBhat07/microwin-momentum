import { v } from "convex/values";
import { query } from "./_generated/server";
import { getCurrentUser } from "./users";

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
      .collect();

    // Get this week's achievements
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const weeklyAchievements = totalAchievements.filter(
      (achievement) => achievement._creationTime > oneWeekAgo
    );

    // Calculate total points
    const totalPoints = totalAchievements.reduce(
      (sum, achievement) => sum + achievement.points,
      0
    );

    // Calculate weekly streak (simplified - days with achievements this week)
    const weeklyDates = new Set(
      weeklyAchievements.map((achievement) =>
        new Date(achievement._creationTime).toDateString()
      )
    );

    return {
      totalAchievements: totalAchievements.length,
      weeklyAchievements: weeklyAchievements.length,
      totalPoints,
      weeklyStreak: weeklyDates.size,
    };
  },
});