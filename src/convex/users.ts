import { internalQuery, mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

// Internal function to get user, callable from other backend functions
export const getCurrentUser = internalQuery({
    handler: async (ctx: QueryCtx) => {
        const userId = await getAuthUserId(ctx);
        if (userId === null) {
            return null;
        }
        return await ctx.db.get(userId);
    },
});

// Public query for the frontend to get the current user
export const currentUser = query({
    args: {},
    handler: async (ctx: QueryCtx) => {
        const userId = await getAuthUserId(ctx);
        if (userId === null) {
            return null;
        }
        return await ctx.db.get(userId);
    },
});

// Search users by username (needed by UserSearch component)
export const searchUsers = query({
    args: { query: v.string() },
    handler: async (ctx, { query }) => {
        if (query.length < 2) return [];
        
        return await ctx.db
            .query("users")
            .filter((q) => q.or(
                q.eq(q.field("name"), query),
                q.eq(q.field("username"), query)
            ))
            .take(10);
    },
});

// Get user profile by username (needed by UserProfilePage)
export const getProfileByUsername = query({
    args: { username: v.string() },
    handler: async (ctx, { username }) => {
        return await ctx.db
            .query("users")
            .withIndex("by_username", (q) => q.eq("username", username))
            .unique();
    },
});

export const resetOnboarding = mutation({
  handler: async (ctx: MutationCtx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User must be authenticated to reset onboarding.");
    }
    await ctx.db.patch(userId, { onboardingStep: 0 });
  },
});

export const deleteAccount = mutation({
  handler: async (ctx: MutationCtx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User must be authenticated to delete their account.");
    }

    // This is a simplified deletion. In a real app, you'd want to delete
    // all associated data (achievements, goals, etc.) in a more robust way,
    // likely using an action to transactionally delete everything.
    await ctx.db.delete(userId);
  },
});