import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { internal } from "./_generated/api";

export const getTrendingChallenges = query({
    args: {},
    handler: async (ctx) => {
        return [
            { slug: "work-stress", label: "Work Stress" },
            { slug: "anxiety", label: "Anxiety" },
            { slug: "feeling-low", label: "Feeling Low" },
            { slug: "focus-adhd", label: "Focus/ADHD" },
            { slug: "sleep-trouble", label: "Sleep Trouble" },
            { slug: "overwhelm", label: "Overwhelm" },
        ];
    }
});

export const generateSuggestions = action({
    args: {
        challenges: v.array(v.string()),
        intensities: v.record(v.string(), v.number()),
    },
    handler: async (ctx, { challenges, intensities }): Promise<any[]> => {
        const user: any = await ctx.runQuery(internal.users.getCurrentUser);
        if (!user) throw new Error("User not authenticated");

        // Call the internal AI action to get suggestions
        const suggestions: any[] = await ctx.runAction(internal.ai.generateSuggestionsWithAI, {
            challenges,
            intensities,
            userId: user._id,
        });

        return suggestions;
    },
});

export const saveWellnessAndSuggestions = mutation({
    args: {
        intake: v.object({
            challenges: v.array(v.string()),
            intensities: v.record(v.string(), v.number()),
            notes: v.optional(v.string()),
            consentToSaveNotes: v.boolean(),
            privacyFlag: v.boolean(),
        }),
        suggestions: v.array(v.object({
            title: v.string(),
            categorySlug: v.string(),
            effortMinutes: v.number(),
            defaultPrivate: v.boolean(),
            source: v.union(v.literal("onboarding"), v.literal("custom"), v.literal("system")),
        })),
        fromOnboarding: v.optional(v.boolean()),
    },
    handler: async (ctx, { intake, suggestions, fromOnboarding }) => {
        const user = await ctx.runQuery(internal.users.getCurrentUser);
        if (!user) throw new Error("User not authenticated");

        // 1. Save wellness intake
        await ctx.db.insert("wellnessIntake", {
            userId: user._id,
            challenges: intake.challenges,
            intensities: intake.intensities,
            privacyFlag: intake.privacyFlag,
            notes: intake.consentToSaveNotes ? intake.notes : undefined,
        });

        // 2. Save selected suggestions to user presets
        for (const suggestion of suggestions) {
            const existing = await ctx.db.query("userPresets")
                .withIndex("by_user_and_title", q => q.eq("userId", user._id).eq("title", suggestion.title))
                .first();

            if (!existing) {
                await ctx.db.insert("userPresets", {
                    userId: user._id,
                    ...suggestion,
                });
            }
        }

        // 3. Mark step as complete
        const patchData: Partial<typeof user> = {
            wellnessSetupCompletedAt: Date.now(),
        };

        if (fromOnboarding) {
            patchData.onboardingStep = 2;
        }

        await ctx.db.patch(user._id, patchData);

        return { success: true };
    }
});