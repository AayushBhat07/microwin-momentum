import { query } from "./_generated/server";
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