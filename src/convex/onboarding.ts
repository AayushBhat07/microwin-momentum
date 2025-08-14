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

        // When completing the goal-setting step (step 3), convert today's goals into habits.
        if (step === 3) {
            const todayString = date || new Date().toISOString().split('T')[0];
            const todaysGoals = await ctx.db
                .query("dailyGoals")
                .withIndex("by_user_and_date", (q) =>
                    q.eq("userId", user._id).eq("targetDate", todayString)
                )
                .collect();

            for (const goal of todaysGoals) {
                // Directly insert the habit, bypassing the duplicate check for onboarding.
                await ctx.db.insert("userPresets", {
                    userId: user._id,
                    title: goal.title,
                    categorySlug: goal.category,
                    effortMinutes: 0, 
                    defaultPrivate: false,
                    source: "onboarding",
                });
            }
        }

        // Update user's onboarding progress
        await ctx.db.patch(user._id, { onboardingStep: step });
    },
});