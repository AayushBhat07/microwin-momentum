// ... keep existing code
import { getAuthUserId } from "@convex-dev/auth/server";

export const resetOnboarding = mutation({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User must be authenticated to reset onboarding.");
    }
    await ctx.db.patch(userId, { onboardingStep: 0 });
  },
});

export const deleteAccount = mutation({
  handler: async (ctx) => {
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