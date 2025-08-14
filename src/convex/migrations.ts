import { mutation } from "./_generated/server";
import { internal } from "./_generated/api";

/**
 * Backfills habits (userPresets) for users who completed onboarding
 * but for whom the goals-to-habits conversion failed.
 */
export const backfillOnboardingHabits = mutation({
  handler: async (ctx) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);
    if (!user) {
      throw new Error("User must be authenticated.");
    }

    // 1. Only run for users who have passed the goal-setting step.
    if (!user.onboardingStep || user.onboardingStep < 3) {
      return { success: false, message: "Onboarding not completed yet." };
    }

    // 2. Check if they already have onboarding habits. If so, they don't need a backfill.
    const existingHabits = await ctx.db
      .query("userPresets")
      .withIndex("by_user_and_source", (q) =>
        q.eq("userId", user._id).eq("source", "onboarding")
      )
      .collect();

    if (existingHabits.length > 0) {
      return { success: true, message: "Habits already exist. No backfill needed." };
    }

    // 3. Find the user's very first set of daily goals. These are assumed to be their onboarding goals.
    const firstGoal = await ctx.db
      .query("dailyGoals")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("asc") // Order by _creationTime
      .first();

    if (!firstGoal) {
      return { success: true, message: "No daily goals found to create habits from." };
    }

    // 4. Get all goals created on that same target date.
    const onboardingDate = firstGoal.targetDate;
    const onboardingGoals = await ctx.db
      .query("dailyGoals")
      .withIndex("by_user_and_date", (q) =>
        q.eq("userId", user._id).eq("targetDate", onboardingDate)
      )
      .collect();

    if (onboardingGoals.length === 0) {
        return { success: true, message: "Could not find goals from onboarding day." };
    }

    // 5. Create habits from these goals.
    let count = 0;
    for (const goal of onboardingGoals) {
      const existing = await ctx.db.query("userPresets").withIndex("by_user_and_title", q => q.eq("userId", user._id).eq("title", goal.title)).first();
      if (!existing) {
        await ctx.db.insert("userPresets", {
            userId: user._id,
            title: goal.title,
            categorySlug: goal.category,
            effortMinutes: 0,
            defaultPrivate: false,
            source: "onboarding",
        });
        count++;
      }
    }

    return { success: true, message: `Successfully restored ${count} habits!` };
  },
});