import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";
import { categoryValidator } from "./schema";

// Create a new achievement
export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    category: categoryValidator,
    points: v.number(),
    isPublic: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Must be authenticated to create achievements");
    }

    const achievementId = await ctx.db.insert("achievements", {
      userId: user._id,
      title: args.title,
      description: args.description,
      category: args.category,
      points: args.points,
      isPublic: args.isPublic,
      celebrationCount: 0,
      completedAt: Date.now(),
    });

    // Update user stats
    const today = new Date().toISOString().split('T')[0];
    const existingStats = await ctx.db
      .query("userStats")
      .withIndex("by_user_and_date", (q) => q.eq("userId", user._id).eq("date", today))
      .unique();

    if (existingStats) {
      await ctx.db.patch(existingStats._id, {
        achievementsCount: existingStats.achievementsCount + 1,
        pointsEarned: existingStats.pointsEarned + args.points,
      });
    } else {
      await ctx.db.insert("userStats", {
        userId: user._id,
        date: today,
        achievementsCount: 1,
        pointsEarned: args.points,
        goalsCompleted: 0,
      });
    }

    // Update user total points
    const currentPoints = user.totalPoints || 0;
    await ctx.db.patch(user._id, {
      totalPoints: currentPoints + args.points,
    });

    return achievementId;
  },
});

// Get user's achievements
export const getUserAchievements = query({
  args: {
    userId: v.optional(v.id("users")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const targetUserId = args.userId || user?._id;
    
    if (!targetUserId) {
      return [];
    }

    const achievements = await ctx.db
      .query("achievements")
      .withIndex("by_user_and_date", (q) => q.eq("userId", targetUserId))
      .order("desc")
      .take(args.limit || 50);

    return achievements;
  },
});

// Get public achievements feed
export const getPublicFeed = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const achievements = await ctx.db
      .query("achievements")
      .withIndex("by_public_and_date", (q) => q.eq("isPublic", true))
      .order("desc")
      .take(args.limit || 20);

    // Get user info for each achievement
    const achievementsWithUsers = await Promise.all(
      achievements.map(async (achievement) => {
        const user = await ctx.db.get(achievement.userId);
        return {
          ...achievement,
          user: user ? { name: user.name, image: user.image } : null,
        };
      })
    );

    return achievementsWithUsers;
  },
});

// Celebrate an achievement
export const celebrate = mutation({
  args: {
    achievementId: v.id("achievements"),
    type: v.union(v.literal("celebrate"), v.literal("inspire"), v.literal("motivate")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Must be authenticated to celebrate achievements");
    }

    // Check if user already celebrated this achievement
    const existing = await ctx.db
      .query("celebrations")
      .withIndex("by_achievement_and_user", (q) => 
        q.eq("achievementId", args.achievementId).eq("userId", user._id)
      )
      .unique();

    if (existing) {
      // Update celebration type
      await ctx.db.patch(existing._id, { type: args.type });
    } else {
      // Create new celebration
      await ctx.db.insert("celebrations", {
        achievementId: args.achievementId,
        userId: user._id,
        type: args.type,
      });

      // Increment celebration count
      const achievement = await ctx.db.get(args.achievementId);
      if (achievement) {
        await ctx.db.patch(args.achievementId, {
          celebrationCount: (achievement.celebrationCount || 0) + 1,
        });
      }
    }
  },
});

// Get celebrations for an achievement
export const getCelebrations = query({
  args: {
    achievementId: v.id("achievements"),
  },
  handler: async (ctx, args) => {
    const celebrations = await ctx.db
      .query("celebrations")
      .withIndex("by_achievement", (q) => q.eq("achievementId", args.achievementId))
      .collect();

    const celebrationsWithUsers = await Promise.all(
      celebrations.map(async (celebration) => {
        const user = await ctx.db.get(celebration.userId);
        return {
          ...celebration,
          user: user ? { name: user.name, image: user.image } : null,
        };
      })
    );

    return celebrationsWithUsers;
  },
});

// Delete achievement
export const deleteAchievement = mutation({
  args: {
    achievementId: v.id("achievements"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Must be authenticated");
    }

    const achievement = await ctx.db.get(args.achievementId);
    if (!achievement || achievement.userId !== user._id) {
      throw new Error("Achievement not found or unauthorized");
    }

    await ctx.db.delete(args.achievementId);
  },
});
