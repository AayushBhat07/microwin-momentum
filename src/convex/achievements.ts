import { action, internalQuery, query, mutation, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getAllForUser = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("achievements")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

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

export const getCategories = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("achievement_categories").collect();
  },
});

export const getPublicFeed = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("achievements")
      .filter((q) => q.eq(q.field("isPublic"), true))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const getHeatMapData = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }
    
    const achievements = await ctx.db
      .query("achievements")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Group by date and count
    const dateMap: Record<string, number> = {};
    achievements.forEach(achievement => {
      const date = new Date(achievement.loggedAt).toISOString().split('T')[0];
      dateMap[date] = (dateMap[date] || 0) + 1;
    });

    return Object.entries(dateMap).map(([date, count]) => ({ date, count }));
  },
});

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
    
    return {
      total: achievements.length,
      totalAchievements: achievements.length,
      byCategory: achievements.reduce((acc: Record<string, number>, achievement) => {
        acc[achievement.categorySlug] = (acc[achievement.categorySlug] || 0) + 1;
        return acc;
      }, {}),
      categories: Object.entries(
        achievements.reduce((acc: Record<string, number>, achievement) => {
          acc[achievement.categorySlug] = (acc[achievement.categorySlug] || 0) + 1;
          return acc;
        }, {})
      ).map(([name, count]) => ({ name, count, points: count * 20 }))
    };
  },
});

export const internalLogAchievement = mutation({
    args: {
        title: v.string(),
        description: v.optional(v.string()),
        categorySlug: v.string(),
        pointsEarned: v.number(),
        isPublic: v.boolean(),
        source: v.string(),
        userId: v.id("users"),
    },
    handler: async (ctx, { userId, title, description, categorySlug, pointsEarned, isPublic, source }) => {
        const achievementId = await ctx.db.insert("achievements", {
            userId,
            title,
            description,
            category: categorySlug as any,
            categorySlug,
            points: pointsEarned,
            pointsEarned,
            isPublic,
            source: source as any,
            loggedAt: Date.now(),
            clientId: `backfill-${Date.now()}`,
        });

        await ctx.runMutation(internal.userStats.updateStatsForNewWin, {
            userId,
            categorySlug,
            points: pointsEarned,
            source,
        });

        // Badge checking is now handled by the award engine

        return achievementId;
    }
});

export const log = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    category: v.string(),
    pointsEarned: v.number(),
    isPublic: v.boolean(),
    source: v.string(),
  },
  handler: async (ctx, args): Promise<any> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const achievementId = await ctx.db.insert("achievements", {
      userId,
      title: args.title,
      description: args.description,
      category: args.category as any,
      categorySlug: args.category,
      points: args.pointsEarned,
      pointsEarned: args.pointsEarned,
      isPublic: args.isPublic,
      source: args.source as any,
      loggedAt: Date.now(),
      clientId: `log-${Date.now()}`,
    });

    const updatedTotals = await ctx.runMutation(internal.userStats.updateStatsForNewWin, {
        userId,
        categorySlug: args.category,
        points: args.pointsEarned,
        source: args.source,
    });

    return achievementId;
  },
});

export const createAchievement = internalMutation({
    args: {
        userId: v.id("users"),
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
        audioStorageId: v.optional(v.id("_storage")),
        tags: v.optional(v.array(v.string())),
        isPublic: v.boolean(),
    },
    handler: async (ctx, args) => {
        const { userId, categorySlug, ...rest } = args;

        const categoryDetails = await ctx.db
            .query("achievement_categories")
            .withIndex("by_slug", q => q.eq("slug", categorySlug))
            .unique();
        
        const points = categoryDetails?.basePoints ?? 10;

        const achievementId = await ctx.db.insert("achievements", {
            userId,
            categorySlug,
            pointsEarned: points,
            loggedAt: Date.now(),
            category: categorySlug as any, // for compatibility
            points: points, // for compatibility
            ...rest
        });

        // The logWin action is now responsible for calling updateStatsForNewWin
        return achievementId;
    }
});

export const get = internalQuery({
    args: { id: v.id("achievements") },
    handler: async (ctx, { id }) => {
        return await ctx.db.get(id);
    }
});