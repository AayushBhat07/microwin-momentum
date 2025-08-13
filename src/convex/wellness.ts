import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { getCurrentUser } from "./users";

// ===== Constants =====
const SUGGESTION_RULES: Record<string, { categorySlug: string; effortMinutes: number; title: string }[]> = {
    "work-stress": [
        { title: "2-minute breath break", categorySlug: "personal", effortMinutes: 2 },
        { title: "One-line plan for your next task", categorySlug: "work", effortMinutes: 3 },
        { title: "Tidy one item on your desk", categorySlug: "work", effortMinutes: 2 },
    ],
    "anxiety": [
        { title: "Box-breathing for 4 cycles", categorySlug: "personal", effortMinutes: 3 },
        { title: "Step outside for 2 minutes", categorySlug: "personal", effortMinutes: 2 },
        { title: "Text a supportive person", categorySlug: "social", effortMinutes: 3 },
    ],
    "feeling-low": [
        { title: "Open curtains/window", categorySlug: "personal", effortMinutes: 2 },
        { title: "Drink a glass of water", categorySlug: "health", effortMinutes: 2 },
        { title: "Write down 1 thing you did today", categorySlug: "personal", effortMinutes: 3 },
    ],
    "sleep-trouble": [
        { title: "No screens 10 min before bed", categorySlug: "health", effortMinutes: 10 },
        { title: "Write tomorrow's first step", categorySlug: "work", effortMinutes: 3 },
        { title: "Do 3 slow breaths before sleep", categorySlug: "personal", effortMinutes: 2 },
    ],
    "low-energy": [
        { title: "Stand and stretch for 30s", categorySlug: "health", effortMinutes: 2 },
        { title: "Walk to get a glass of water", categorySlug: "health", effortMinutes: 3 },
        { title: "Do the smallest 1-minute next step", categorySlug: "work", effortMinutes: 2 },
    ],
    "fitness-confidence": [
        { title: "5 wall push-ups or 10s plank", categorySlug: "health", effortMinutes: 3 },
        { title: "1-minute walk in place", categorySlug: "health", effortMinutes: 2 },
        { title: "Lay out workout clothes for tomorrow", categorySlug: "personal", effortMinutes: 2 },
    ],
    "social-disconnection": [
        { title: "Send a quick check-in text", categorySlug: "social", effortMinutes: 3 },
        { title: "Share a private photo memory with someone", categorySlug: "social", effortMinutes: 3 },
    ],
    "focus-adhd": [
        { title: "Set a 5-minute timer for one micro-task", categorySlug: "work", effortMinutes: 5 },
        { title: "Put your phone away for 5 min", categorySlug: "personal", effortMinutes: 5 },
        { title: "Write a 3-bullet micro plan", categorySlug: "work", effortMinutes: 3 },
    ],
    "overwhelm": [
        { title: "Write down all tasks, then pick the tiniest one", categorySlug: "work", effortMinutes: 5 },
        { title: "2-minute guided meditation", categorySlug: "personal", effortMinutes: 2 },
        { title: "Say 'no' to one small thing", categorySlug: "personal", effortMinutes: 2 },
    ],
    "grief-caregiving": [
        { title: "Acknowledge one feeling without judgment", categorySlug: "personal", effortMinutes: 2 },
        { title: "Listen to one comforting song", categorySlug: "personal", effortMinutes: 3 },
        { title: "Ask for one small bit of help", categorySlug: "social", effortMinutes: 5 },
    ],
    "other": [
        { title: "Drink a glass of water", categorySlug: "health", effortMinutes: 2 },
        { title: "Stand and stretch for 30s", categorySlug: "health", effortMinutes: 2 },
        { title: "Tidy one item near you", categorySlug: "personal", effortMinutes: 2 },
    ]
};

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
    handler: async (ctx, { challenges }) => {
        const suggestions = new Map<string, { title: string; categorySlug: string; effortMinutes: number; }>();

        challenges.forEach(challenge => {
            const rule = SUGGESTION_RULES[challenge] || SUGGESTION_RULES["other"];
            rule.forEach(suggestion => {
                if (!suggestions.has(suggestion.title)) {
                    suggestions.set(suggestion.title, suggestion);
                }
            });
        });

        const result = Array.from(suggestions.values()).slice(0, 10);
        return result.map(s => ({ ...s, defaultPrivate: true, source: 'system' as const }));
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
        const user = await getCurrentUser(ctx);
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