import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { getCurrentUser } from "./users";

// Log a new achievement with full gamification
export const log = mutation({
  args: {
    clientId: v.string(),
    categorySlug: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    photoUrl: v.optional(v.string()),
    source: v.union(
      v.literal("quick"),
      v.literal("text"),
      v.literal("voice"),
      v.literal("photo")
    ),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Must be authenticated");
    }

    // Check for duplicate clientId (idempotency)
    const existing = await ctx.db
      .query("achievements")
      .withIndex("by_user_and_client_id", (q) => 
        q.eq("userId", user._id).eq("clientId", args.clientId)
      )
      .unique();

    if (existing) {
      return { achievementId: existing._id, duplicate: true };
    }

    // Get category info
    const category = await ctx.db
      .query("achievement_categories")
      .withIndex("by_slug", (q) => q.eq("slug", args.categorySlug))
      .unique();

    if (!category) {
      throw new Error("Invalid category");
    }

    // Calculate points with streak multiplier
    const streakData = await ctx.db
      .query("user_streaks")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    const basePoints = category.basePoints;
    const streakMultiplier = streakData 
      ? Math.min(1 + (streakData.currentStreak * 0.1), 1.5) 
      : 1;
    const pointsEarned = Math.floor(basePoints * streakMultiplier);

    // Create achievement
    const achievementId = await ctx.db.insert("achievements", {
      userId: user._id,
      clientId: args.clientId,
      categorySlug: args.categorySlug,
      category: args.categorySlug as any,
      title: args.title,
      description: args.description,
      photoUrl: args.photoUrl,
      pointsEarned,
      points: pointsEarned,
      source: args.source,
      tags: args.tags,
      isPublic: true,
      loggedAt: Date.now(),
    });

    // Update streak and totals in background
    await ctx.scheduler.runAfter(0, internal.gamification.updateUserStats, {
      userId: user._id,
      pointsEarned,
    });

    return { achievementId, pointsEarned };
  },
});

// Internal function to update user stats
export const updateUserStats = internalMutation({
  args: {
    userId: v.id("users"),
    pointsEarned: v.number(),
  },
  handler: async (ctx, args) => {
    const today = new Date().toISOString().split('T')[0];

    // Update streak
    const streakData = await ctx.db
      .query("user_streaks")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();

    if (streakData) {
      const lastDate = new Date(streakData.lastActivityDate);
      const todayDate = new Date(today);
      const daysDiff = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff === 0) {
        // Same day, no streak change
      } else if (daysDiff === 1) {
        // Consecutive day, increment streak
        await ctx.db.patch(streakData._id, {
          currentStreak: streakData.currentStreak + 1,
          longestStreak: Math.max(streakData.longestStreak, streakData.currentStreak + 1),
          lastActivityDate: today,
        });
      } else {
        // Streak broken, reset to 1
        await ctx.db.patch(streakData._id, {
          currentStreak: 1,
          lastActivityDate: today,
          streakStartDate: today,
        });
      }
    } else {
      // First achievement, create streak record
      await ctx.db.insert("user_streaks", {
        userId: args.userId,
        currentStreak: 1,
        longestStreak: 1,
        lastActivityDate: today,
        streakStartDate: today,
      });
    }

    // Update total points
    const totals = await ctx.db
      .query("user_totals")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();

    if (totals) {
      await ctx.db.patch(totals._id, {
        totalPoints: totals.totalPoints + args.pointsEarned,
        lastPointsUpdateAt: Date.now(),
      });
    } else {
      await ctx.db.insert("user_totals", {
        userId: args.userId,
        totalPoints: args.pointsEarned,
        totalAchievements: 1,
        lastPointsUpdateAt: Date.now(),
      });
    }
  },
});

// Get achievement categories
export const getCategories = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("achievement_categories")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

// Get user's streak status
export const getStreakStatus = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    return await ctx.db
      .query("user_streaks")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();
  },
});