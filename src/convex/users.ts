import { getAuthUserId } from "@convex-dev/auth/server";
import { query, QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

/**
 * Get the current signed in user. Returns null if the user is not signed in.
 * Usage: const signedInUser = await ctx.runQuery(api.authHelpers.currentUser);
 * THIS FUNCTION IS READ-ONLY. DO NOT MODIFY.
 */
export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);

    if (user === null) {
      return null;
    }

    return user;
  },
});

/**
 * Use this function internally to get the current user data. Remember to handle the null user case.
 * @param ctx
 * @returns
 */
export const getCurrentUser = async (ctx: QueryCtx) => {
  const userId = await getAuthUserId(ctx);
  if (userId === null) {
    return null;
  }
  return await ctx.db.get(userId);
};

// Search users by username
export const searchUsers = query({
  args: {
    searchTerm: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    if (!args.searchTerm.trim()) {
      return [];
    }

    const users = await ctx.db
      .query("users")
      .withIndex("by_username")
      .filter((q) => 
        q.and(
          q.neq(q.field("username"), undefined),
          q.gte(q.field("username"), args.searchTerm.toLowerCase()),
          q.lt(q.field("username"), args.searchTerm.toLowerCase() + "\uffff")
        )
      )
      .take(args.limit || 10);

    // Return public user data only
    return users.map(user => ({
      _id: user._id,
      username: user.username,
      name: user.name,
      image: user.image,
      bio: user.bio,
      totalPoints: user.totalPoints || 0,
      currentStreak: user.currentStreak || 0,
    }));
  },
});

// Get public user profile
export const getPublicProfile = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      return null;
    }

    // Get user's public achievements
    const achievements = await ctx.db
      .query("achievements")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("isPublic"), true))
      .order("desc")
      .take(10);

    // Get user's badges
    const badges = await ctx.db
      .query("badges")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    return {
      _id: user._id,
      username: user.username,
      name: user.name,
      image: user.image,
      bio: user.bio,
      totalPoints: user.totalPoints || 0,
      currentStreak: user.currentStreak || 0,
      longestStreak: user.longestStreak || 0,
      achievements,
      badges,
    };
  },
});

// Get public user profile by username
export const getProfileByUsername = query({
  args: {
    username: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .unique();

    if (!user) {
      return null;
    }

    // Get user's public achievements
    const achievements = await ctx.db
      .query("achievements")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("isPublic"), true))
      .order("desc")
      .take(10);

    // Get user's badges
    const badges = await ctx.db
      .query("badges")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
      
    // Get follow counts directly from database to avoid circular reference
    const followers = await ctx.db
      .query("userFollows")
      .withIndex("by_following", (q) => q.eq("followingId", user._id))
      .collect();

    const following = await ctx.db
      .query("userFollows")
      .withIndex("by_follower", (q) => q.eq("followerId", user._id))
      .collect();

    return {
      _id: user._id,
      username: user.username,
      name: user.name,
      image: user.image,
      bio: user.bio,
      totalPoints: user.totalPoints || 0,
      currentStreak: user.currentStreak || 0,
      longestStreak: user.longestStreak || 0,
      achievements,
      badges,
      followersCount: followers.length,
      followingCount: following.length,
    };
  },
});