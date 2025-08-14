import { query } from "./_generated/server";
import { internal } from "./_generated/api";
import { Doc } from "./_generated/dataModel";

/**
 * Fetches the habits (user presets) that were created during the onboarding flow.
 */
export const getOnboardingHabits = query({
  args: {},
  handler: async (ctx, args): Promise<Doc<"userPresets">[]> => {
    const user: Doc<"users"> | null = await ctx.runQuery(internal.users.getCurrentUser);
    if (!user) {
      return [];
    }

    // Fetches presets that were specifically created during the "onboarding" process.
    const habits: Doc<"userPresets">[] = await ctx.db
      .query("userPresets")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("source"), "onboarding"))
      .collect();

    return habits;
  },
});