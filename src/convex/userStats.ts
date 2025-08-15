import { query, internalMutation, internalQuery } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

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

export const getTodayStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return {
        todayPoints: 0,
        todayAchievements: 0,
      };
    }

    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    // Get today's stats from userStats table
    const todayStats = await ctx.db
      .query("userStats")
      .withIndex("by_user_and_date", (q) => q.eq("userId", userId).eq("date", today))
      .unique();

    return {
      todayPoints: todayStats?.pointsEarned || 0,
      todayAchievements: todayStats?.achievementsCount || 0,
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

export const getStreak = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("user_streaks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
  },
});

export const getCategoryTotals = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("userCategoryTotals")
      .withIndex("by_user_and_category", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const getEarnedBadgeSlugs = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("userBadges")
      .withIndex("by_user_and_badge", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const updateStatsForNewWin = internalMutation({
  args: {
    userId: v.id("users"),
    categorySlug: v.string(),
    points: v.number(),
    source: v.string(),
  },
  handler: async (ctx, { userId, categorySlug, points, source }) => {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const isPhoto = source === "photo";
    const isVoice = source === "voice";
    // "text" or "quick" logs fall under the text category for badges
    const isText = !isPhoto && !isVoice;

    // --- 1. Handle User Totals (points, achievements, and mode counts) ---
    const userTotals = await ctx.db
      .query("user_totals")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (userTotals) {
      await ctx.db.patch(userTotals._id, {
        totalPoints: userTotals.totalPoints + points,
        totalAchievements: userTotals.totalAchievements + 1,
        lastPointsUpdateAt: Date.now(),
        totalPhotoCount: (userTotals.totalPhotoCount ?? 0) + (isPhoto ? 1 : 0),
        totalVoiceCount: (userTotals.totalVoiceCount ?? 0) + (isVoice ? 1 : 0),
        totalTextCount: (userTotals.totalTextCount ?? 0) + (isText ? 1 : 0),
      });
    } else {
      await ctx.db.insert("user_totals", {
        userId,
        totalPoints: points,
        totalAchievements: 1,
        lastPointsUpdateAt: Date.now(),
        totalPhotoCount: isPhoto ? 1 : 0,
        totalVoiceCount: isVoice ? 1 : 0,
        totalTextCount: isText ? 1 : 0,
      });
    }

    // --- 2. Handle Streak ---
    const userStreak = await ctx.db
      .query("user_streaks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (userStreak) {
      if (userStreak.lastActivityDate !== today) {
        const lastActivityDate = new Date(userStreak.lastActivityDate);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        let newStreak = userStreak.currentStreak;
        if (lastActivityDate.toISOString().split("T")[0] === yesterday.toISOString().split("T")[0]) {
          newStreak++;
        } else {
          newStreak = 1;
        }
        await ctx.db.patch(userStreak._id, {
          currentStreak: newStreak,
          longestStreak: Math.max(newStreak, userStreak.longestStreak),
          lastActivityDate: today,
        });
      }
    } else {
      await ctx.db.insert("user_streaks", {
        userId,
        currentStreak: 1,
        longestStreak: 1,
        lastActivityDate: today,
        streakStartDate: today,
      });
    }

    // --- 3. Handle Daily Stats ---
    const dailyStat = await ctx.db
      .query("userStats")
      .withIndex("by_user_and_date", (q) => q.eq("userId", userId).eq("date", today))
      .unique();

    if (dailyStat) {
      await ctx.db.patch(dailyStat._id, {
        achievementsCount: dailyStat.achievementsCount + 1,
        pointsEarned: dailyStat.pointsEarned + points,
        photoCount: dailyStat.photoCount + (isPhoto ? 1 : 0),
        categories: [...new Set([...(dailyStat.categories || []), categorySlug])],
      });
    } else {
      await ctx.db.insert("userStats", {
        userId,
        date: today,
        achievementsCount: 1,
        pointsEarned: points,
        goalsCompleted: 0,
        categories: [categorySlug],
        photoCount: isPhoto ? 1 : 0,
      });
    }

    // --- 4. Handle Category Totals ---
    const categoryTotal = await ctx.db
      .query("userCategoryTotals")
      .withIndex("by_user_and_category", (q) => q.eq("userId", userId).eq("categorySlug", categorySlug))
      .unique();
    
    if (categoryTotal) {
      await ctx.db.patch(categoryTotal._id, {
        totalWins: categoryTotal.totalWins + 1,
      });
    } else {
      await ctx.db.insert("userCategoryTotals", {
        userId,
        categorySlug,
        totalWins: 1,
      });
    }

    // Return the final, updated user_totals document
    return await ctx.db
      .query("user_totals")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
  },
});