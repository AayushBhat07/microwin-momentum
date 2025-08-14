import { query, mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { Doc } from "./_generated/dataModel";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

/**
 * Fetches the daily quests for the user.
 * These are micro-goals created during onboarding or added manually as "custom".
 */
export const getDailyQuests = query({
  args: {},
  handler: async (ctx): Promise<Doc<"userPresets">[]> => {
    const user: Doc<"users"> | null = await ctx.runQuery(internal.users.getCurrentUser);
    if (!user) {
      return [];
    }

    // Fetch presets from onboarding
    const onboardingQuests = await ctx.db
      .query("userPresets")
      .withIndex("by_user_and_source", (q) =>
        q.eq("userId", user._id).eq("source", "onboarding")
      )
      .collect();

    // Fetch presets added manually by the user
    const customQuests = await ctx.db
      .query("userPresets")
      .withIndex("by_user_and_source", (q) =>
        q.eq("userId", user._id).eq("source", "custom")
      )
      .collect();

    return [...onboardingQuests, ...customQuests];
  },
});

/**
 * Completes a daily quest, creating an achievement and awarding points.
 */
export const completeDailyQuest = mutation({
  args: {
    presetId: v.id("userPresets"),
  },
  handler: async (ctx, { presetId }) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);
    if (!user) {
      throw new Error("Not authenticated");
    }

    const preset = await ctx.db.get(presetId);
    if (!preset || preset.userId !== user._id) {
      throw new Error("Quest not found or not owned by user");
    }

    // This will create an achievement, award points, and update streaks
    await ctx.runMutation(internal.achievements.createAchievement, {
      userId: user._id,
      clientId: `quest-${presetId}-${Date.now()}`,
      title: preset.title,
      description: "Completed a daily quest.",
      categorySlug: preset.categorySlug,
      source: "quick",
      isPublic: !preset.defaultPrivate,
    });

    return { title: preset.title };
  },
});