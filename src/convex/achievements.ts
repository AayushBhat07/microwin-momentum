import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { categoryValidator } from "./schema";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";

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

// Create achievement
export const create = mutation({
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
      v.literal("photo"),
    ),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const clientId = `${userId}-${Date.now()}-${Math.random()}`;

    const achievementId = await ctx.db.insert("achievements", {
      userId,
      clientId,
      categorySlug: args.category,
      category: args.category,
      title: args.title,
      description: args.description,
      photoUrl: args.photoUrl,
      pointsEarned: args.pointsEarned,
      points: args.pointsEarned, // Also set points for consistency
      source: args.source,
      tags: args.tags,
      isPublic: args.isPublic,
      loggedAt: Date.now(),
    });

    return achievementId;
  },
});

// Get heat map data for calendar visualization
export const getHeatMapData = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const achievements = await ctx.db
      .query("achievements")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Group by date
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