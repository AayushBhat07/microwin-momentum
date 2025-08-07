import { v } from "convex/values";
import { query } from "./_generated/server";
import { getCurrentUser } from "./users";

// Get user's current streak and stats
export const getUserStats = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return null;
    }

    // Get recent stats to calculate streak
    const recentStats = await ctx.db
      .query("userStats")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(30);

    // Calculate current streak
    let currentStreak = 0;
    const today = new Date().toISOString().split('T')[0];
    let checkDate = new Date();
    
    for (let i = 0; i < 30; i++) {
      const dateStr = checkDate.toISOString().split('T')[0];
      const dayStats = recentStats.find(stat => stat.date === dateStr);
      
      if (dayStats && (dayStats.achievementsCount > 0 || dayStats.goalsCompleted > 0)) {
        currentStreak++;
      } else if (dateStr !== today) {
        break;
      }
      
      checkDate.setDate(checkDate.getDate() - 1);
    }

    // Calculate total achievements and points
    const allAchievements = await ctx.db
      .query("achievements")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const totalAchievements = allAchievements.length;
    const totalPoints = user.totalPoints || 0;
    const level = Math.floor(totalPoints / 100) + 1;

    return {
      currentStreak,
      totalAchievements,
      totalPoints,
      level,
      recentStats: recentStats.slice(0, 7), // Last 7 days
    };
  },
});

// Get weekly summary
export const getWeeklySummary = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return null;
    }

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoStr = weekAgo.toISOString().split('T')[0];

    const weeklyStats = await ctx.db
      .query("userStats")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.gte(q.field("date"), weekAgoStr))
      .collect();

    const totalAchievements = weeklyStats.reduce((sum, stat) => sum + stat.achievementsCount, 0);
    const totalPoints = weeklyStats.reduce((sum, stat) => sum + stat.pointsEarned, 0);
    const totalGoals = weeklyStats.reduce((sum, stat) => sum + stat.goalsCompleted, 0);

    return {
      totalAchievements,
      totalPoints,
      totalGoals,
      activeDays: weeklyStats.length,
    };
  },
});
