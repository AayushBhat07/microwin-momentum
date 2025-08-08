import { getAuthUserId } from "@convex-dev/auth/server";
import { action, internalMutation, mutation, query } from "./_generated/server";
import { categoryValidator } from "./schema";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

// Get achievements for the logged-in user
export const getMyAchievements = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }
    return await ctx.db
      .query("achievements")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

// Get public feed for community features
export const getPublicFeed = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const achievements = await ctx.db
      .query("achievements")
      .filter((q) => q.eq(q.field("isPublic"), true))
      .order("desc")
      .paginate(args.paginationOpts);

    const page = await Promise.all(
      achievements.page.map(async (achievement) => {
        const user = await ctx.db.get(achievement.userId);
        return { ...achievement, user };
      })
    );

    return { ...achievements, page };
  },
});

// New internal mutation for creating an achievement
export const internalCreate = internalMutation({
  args: {
    userId: v.id("users"),
    title: v.string(),
    description: v.optional(v.string()),
    category: categoryValidator,
    pointsEarned: v.number(),
    photoStorageId: v.optional(v.id("_storage")),
    isPublic: v.boolean(),
    source: v.union(
      v.literal("quick"),
      v.literal("text"),
      v.literal("voice"),
      v.literal("photo")
    ),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const clientId = `${args.userId}-${Date.now()}-${Math.random()}`;

    const achievementId = await ctx.db.insert("achievements", {
      userId: args.userId,
      clientId,
      categorySlug: args.category,
      category: args.category,
      title: args.title,
      description: args.description,
      photoStorageId: args.photoStorageId,
      pointsEarned: args.pointsEarned,
      points: args.pointsEarned,
      source: args.source,
      tags: args.tags,
      isPublic: args.isPublic,
      loggedAt: Date.now(),
    });

    return achievementId;
  },
});

// New log action that orchestrates everything
export const log = action({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    category: categoryValidator,
    pointsEarned: v.number(),
    photoUrl: v.optional(v.string()),
    isPublic: v.boolean(),
    source: v.union(
      v.literal("quick"),
      v.literal("text"),
      v.literal("voice"),
      v.literal("photo")
    ),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const userId = identity.subject as Id<"users">;

    // 1. Create the achievement
    await ctx.runMutation(internal.achievements.internalCreate, {
      userId,
      ...args,
    });

    // 2. Update user points
    await ctx.runMutation(internal.userStats.updateUserPoints, {
      userId,
      points: args.pointsEarned,
    });

    // 3. Update user streak
    await ctx.runMutation(internal.userStats.updateUserStreak, { userId });

    // 4. Update daily stats
    await ctx.runMutation(internal.userStats.updateUserDailyStats, {
      userId,
      points: args.pointsEarned,
    });
  },
});

// Get heat map data for calendar visualization
export const getHeatMapData = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const sevenMonthsAgo = new Date();
    sevenMonthsAgo.setMonth(sevenMonthsAgo.getMonth() - 7);

    const achievements = await ctx.db
      .query("achievements")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter(q => q.gt(q.field("_creationTime"), sevenMonthsAgo.getTime()))
      .collect();

    const dailyStats = achievements.reduce((acc, achievement) => {
      const date = new Date(achievement.loggedAt).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { date, count: 0, points: 0 };
      }
      acc[date].count++;
      acc[date].points += achievement.pointsEarned;
      return acc;
    }, {} as Record<string, { date: string; count: number; points: number }>);

    return Object.values(dailyStats);
  },
});

// Get achievement stats for progress visualization
export const getAchievementStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const achievements = await ctx.db
      .query("achievements")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Group by category
    const categoryStats = achievements.reduce((acc, achievement) => {
      const category = achievement.category;
      if (!acc[category]) {
        acc[category] = { name: category, count: 0, points: 0 };
      }
      acc[category].count++;
      acc[category].points += achievement.pointsEarned;
      return acc;
    }, {} as Record<string, { name: string; count: number; points: number }>);

    return {
      totalAchievements: achievements.length,
      totalPoints: achievements.reduce((sum, a) => sum + a.pointsEarned, 0),
      categories: Object.values(categoryStats),
    };
  },
});

// Alias for getUserAchievements (used by gallery components)
export const getUserAchievements = getMyAchievements;