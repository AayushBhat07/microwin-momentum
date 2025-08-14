import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

export const completeOnboardingStep = mutation({
    args: { step: v.number(), date: v.optional(v.string()) },
    handler: async (ctx, { step, date }) => {
        const user = await ctx.runQuery(internal.users.getCurrentUser);
        if (!user) {
            throw new Error("User must be authenticated.");
        }

        // Update user's onboarding progress
        await ctx.db.patch(user._id, { onboardingStep: step });
    },
});