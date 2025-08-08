import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

// Follow a user
export const follow = mutation({
  args: {
    followingId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Must be authenticated to follow users");
    }

    if (user._id === args.followingId) {
      throw new Error("You cannot follow yourself");
    }

    // Check if already following
    const existingFollow = await ctx.db
      .query("userFollows")
      .withIndex("by_follower_and_following", (q) =>
        q.eq("followerId", user._id).eq("followingId", args.followingId)
      )
      .unique();

    if (existingFollow) {
      // Already following, do nothing
      return;
    }

    await ctx.db.insert("userFollows", {
      followerId: user._id,
      followingId: args.followingId,
    });
  },
});

// Unfollow a user
export const unfollow = mutation({
  args: {
    followingId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Must be authenticated to unfollow users");
    }

    const existingFollow = await ctx.db
      .query("userFollows")
      .withIndex("by_follower_and_following", (q) =>
        q.eq("followerId", user._id).eq("followingId", args.followingId)
      )
      .unique();

    if (existingFollow) {
      await ctx.db.delete(existingFollow._id);
    }
  },
});

// Check if the current user is following a specific user
export const isFollowing = query({
  args: {
    followingId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return false;
    }

    const follow = await ctx.db
      .query("userFollows")
      .withIndex("by_follower_and_following", (q) =>
        q.eq("followerId", user._id).eq("followingId", args.followingId)
      )
      .unique();

    return !!follow;
  },
});

// Get follower and following counts for a user
export const getFollowCounts = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const followers = await ctx.db
      .query("userFollows")
      .withIndex("by_following", (q) => q.eq("followingId", args.userId))
      .collect();

    const following = await ctx.db
      .query("userFollows")
      .withIndex("by_follower", (q) => q.eq("followerId", args.userId))
      .collect();

    return {
      followersCount: followers.length,
      followingCount: following.length,
    };
  },
});
