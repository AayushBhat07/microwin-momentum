import { v } from "convex/values";
import { internalQuery, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";

export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return null;
    }
    const user = await ctx.db.get(userId);
    if (!user) return null;

    const needsWellnessSetup = !user.wellnessSetupCompletedAt;

    return {
      ...user,
      needsWellnessSetup,
    };
  },
});

export const getCurrentUser = async (ctx: any) => {
  const userId = await getAuthUserId(ctx);
  if (userId === null) {
    return null;
  }
  return await ctx.db.get(userId);
};

export const get = internalQuery({
    args: { userId: v.id("users") },
    handler: async (ctx, { userId }) => {
        return await ctx.db.get(userId);
    }
});

export const searchUsers = query({
  args: { searchTerm: v.string() },
  handler: async (ctx, { searchTerm }) => {
    if (!searchTerm.trim()) return [];
    
    return await ctx.db
      .query("users")
      .filter((q) => 
        q.or(
          q.eq(q.field("username"), searchTerm),
          q.eq(q.field("name"), searchTerm)
        )
      )
      .take(10);
  },
});

export const getProfileByUsername = query({
  args: { username: v.string() },
  handler: async (ctx, { username }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", username))
      .unique();
    
    if (!user) return null;

    // Get user badges
    const userBadges = await ctx.db
      .query("userBadges")
      .withIndex("by_user_and_earned_at", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    const badgesWithDetails = await Promise.all(
      userBadges.map(async (userBadge) => {
        const badgeDetails = await ctx.db
          .query("badges")
          .withIndex("by_slug", (q) => q.eq("slug", userBadge.badgeSlug))
          .unique();
        return {
          userBadge,
          badgeDetails,
        };
      })
    );

    // Get user achievements (public only for profile view)
    const achievements = await ctx.db
      .query("achievements")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("isPublic"), true))
      .order("desc")
      .take(5);

    return {
      ...user,
      badges: badgesWithDetails.filter(b => b.badgeDetails),
      achievements,
    };
  },
});