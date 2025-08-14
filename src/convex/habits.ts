import { query, mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { Doc } from "./_generated/dataModel";
import { internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { categoryValidator } from "./schema";

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
      .withIndex("by_user_and_source", (q) =>
        q.eq("userId", user._id).eq("source", "onboarding")
      )
      .collect();

    return habits;
  },
});

export const backfillHabits = mutation({
    args: {},
    handler: async (ctx): Promise<{ success: boolean; message: string }> => {
        const user: Doc<"users"> | null = await ctx.runQuery(internal.users.getCurrentUser);
        if (!user) {
            throw new Error("Not authenticated");
        }

        const goals: Doc<"dailyGoals">[] = await ctx.runQuery(internal.goals.getAllForUser);
        if (!goals || goals.length === 0) {
            return { success: false, message: "No past goals found." };
        }

        for (const goal of goals) {
            await ctx.runMutation(internal.habits.createHabitFromGoal, {
                userId: user._id,
                title: goal.title,
                categorySlug: goal.category,
            });
        }

        return { success: true, message: `Restored habits from ${goals.length} goals.` };
    }
});

export const createHabitFromGoal = internalMutation({
   args: {
       userId: v.id("users"),
       title: v.string(),
       categorySlug: categoryValidator,
   },
   handler: async (ctx, { userId, title, categorySlug }) => {
       const existing = await ctx.db
           .query("userPresets")
           .withIndex("by_user_and_title", (q) => q.eq("userId", userId).eq("title", title))
           .first();

       if (existing) {
           console.log("Skipping existing habit: " + title);
           return;
       }

       await ctx.db.insert("userPresets", {
           userId,
           title,
           categorySlug,
           effortMinutes: 0,
           defaultPrivate: false,
           source: "onboarding",
       });
       console.log("Created habit: " + title);
   }
});