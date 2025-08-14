import { internalQuery, mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

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
        // We are using runQuery here to call an internal query.
        return await ctx.runQuery(internal.users.getCurrentUser);
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