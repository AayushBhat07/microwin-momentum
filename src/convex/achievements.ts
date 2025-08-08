import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
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
    });

    // Update user stats for today
    const today = new Date().toISOString().split('T')[0];
    const existingStat = await ctx.db
      .query("userStats")
      .withIndex("by_user_and_date", (q) => q.eq("userId", user._id).eq("date", today))
      .unique();

    if (existingStat) {
      await ctx.db.patch(existingStat._id, {
        achievementsCount: existingStat.achievementsCount + 1,
        pointsEarned: existingStat.pointsEarned + args.points,
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

    return achievementId;
  },
});

// Get user's achievements
export const getUserAchievements = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return [];
    }

    const achievements = await ctx.db
      .query("achievements")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(args.limit || 50);

    return achievements;
  },
});

// Get public achievements feed
export const getPublicFeed = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const achievements = await ctx.db
      .query("achievements")
      .filter((q) => q.eq(q.field("isPublic"), true))
      .order("desc")
      .paginate(args.paginationOpts);

    // Get user data for each achievement
    const achievementsWithUsers = await Promise.all(
      achievements.page.map(async (achievement) => {
        const user = await ctx.db.get(achievement.userId);
        return {
          ...achievement,
          user: user ? { name: user.name, image: user.image } : null,
        };
      })
    );

    return {
      ...achievements,
      page: achievementsWithUsers,
    };
  },
});

// Get achievements from users the current user is following
export const getFollowingFeed = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return { page: [], isDone: true, continueCursor: "" };
    }

    const following = await ctx.db
      .query("userFollows")
      .withIndex("by_follower", (q) => q.eq("followerId", user._id))
      .collect();

    const followingIds = following.map((f) => f.followingId);

    if (followingIds.length === 0) {
      return { page: [], isDone: true, continueCursor: "" };
    }

    // This is not efficient for large number of followed users.
    // A better approach would be to use search or a different data model.
    // But for this project, this should be acceptable.
    const achievements = await ctx.db
      .query("achievements")
      .order("desc")
      .filter((q) =>
        q.and(
          q.eq(q.field("isPublic"), true),
          q.or(...followingIds.map((id) => q.eq(q.field("userId"), id)))
        )
      )
      .paginate(args.paginationOpts);

    // Get user data for each achievement
    const achievementsWithUsers = await Promise.all(
      achievements.page.map(async (achievement) => {
        const user = await ctx.db.get(achievement.userId);
        return {
          ...achievement,
          user: user ? { name: user.name, image: user.image, username: user.username } : null,
        };
      })
    );

    return {
      ...achievements,
      page: achievementsWithUsers,
    };
  },
});