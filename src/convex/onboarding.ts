import { mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

export const completeOnboardingStep = mutation({
    args: { step: v.number() },
    handler: async (ctx, { step }) => {
        const user = await ctx.runQuery(internal.users.getCurrentUser);
        if (!user) {
            throw new Error("User must be authenticated.");
        }

        // When completing the goal-setting step (step 3), convert today's goals into habits.
        if (step === 3) {
            const todayString = new Date().toISOString().split('T')[0];
            const todaysGoals = await ctx.db
                .query("dailyGoals")
                .withIndex("by_user_and_date", (q) =>
                    q.eq("userId", user._id).eq("targetDate", todayString)
                )
                .collect();

            for (const goal of todaysGoals) {
                // Avoid creating duplicate presets if this step is somehow repeated.
                const existingPreset = await ctx.db
                    .query("userPresets")
                    .withIndex("by_user_and_title", (q) =>
                        q.eq("userId", user._id).eq("title", goal.title)
                    )
                    .first();

                if (!existingPreset) {
                    await ctx.db.insert("userPresets", {
                        userId: user._id,
                        title: goal.title,
                        categorySlug: goal.category,
                        effortMinutes: 0, // Default value, can be customized later
                        defaultPrivate: false,
                        source: "onboarding",
                    });
                }
            }
        }

        // Update user's onboarding progress
        await ctx.db.patch(user._id, { onboardingStep: step });
    },
});