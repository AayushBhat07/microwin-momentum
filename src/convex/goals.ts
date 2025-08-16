import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { categoryValidator } from "./schema";
import { Doc, Id } from "./_generated/dataModel";
import { internalQuery } from "./_generated/server";

/**
 * Retrieves all goals for the current user for today.
 */
export const getTodaysGoals = query({
  args: {
    date: v.string(), // Expect YYYY-MM-DD from client
  },
  handler: async (ctx, args): Promise<any> => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);
    if (!user) {
      return [];
    }

    const goals = await ctx.db
      .query("dailyGoals")
      .withIndex("by_user_and_date", (q) =>
        q.eq("userId", user._id).eq("targetDate", args.date)
      )
      .collect();

    return goals;
  },
});

/**
 * Creates a new daily goal for the authenticated user.
 */
export const create = mutation({
  args: {
    title: v.string(),
    category: categoryValidator,
    description: v.optional(v.string()),
    targetDate: v.string(), // Expect YYYY-MM-DD from client
  },
  handler: async (ctx, args): Promise<any> => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);
    if (!user) {
      throw new Error("User not authenticated");
    }

    const goalId = await ctx.db.insert("dailyGoals", {
      userId: user._id,
      title: args.title,
      description: args.description,
      category: args.category,
      targetDate: args.targetDate,
      isCompleted: false,
      completedAt: undefined,
    });

    return await ctx.db.get(goalId);
  },
});

/**
 * Marks a specific goal as complete.
 */
export const completeGoal = mutation({
  args: {
    goalId: v.id("dailyGoals"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);
    if (!user) {
      throw new Error("User must be authenticated to complete a goal.");
    }

    const goal = await ctx.db.get(args.goalId);
    if (!goal || goal.userId !== user._id) {
      throw new Error("Goal not found or user does not have permission.");
    }

    if (goal.isCompleted) {
      return;
    }

    await ctx.db.patch(args.goalId, {
      isCompleted: true,
      completedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Deletes a specific goal.
 */
export const remove = mutation({
  args: {
    goalId: v.id("dailyGoals"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);
    if (!user) {
      throw new Error("User must be authenticated to delete a goal.");
    }

    const goal = await ctx.db.get(args.goalId);
    if (!goal || goal.userId !== user._id) {
      throw new Error("Goal not found or user does not have permission.");
    }

    await ctx.db.delete(args.goalId);
    return { success: true };
  },
});

export const deleteOnboardingGoals = mutation({
  args: {},
  handler: async (ctx): Promise<{ success: boolean; habitsDeleted: number; goalsDeleted: number }> => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);
    if (!user) {
      throw new Error("User must be authenticated.");
    }

    // Delete onboarding habits
    const habits = await ctx.db
      .query("userPresets")
      .withIndex("by_user_and_source", (q) =>
        q.eq("userId", user._id).eq("source", "onboarding")
      )
      .collect();

    for (const habit of habits) {
      await ctx.db.delete(habit._id);
    }

    // Find and delete onboarding daily goals
    const firstGoal = await ctx.db
      .query("dailyGoals")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("asc")
      .first();

    if (firstGoal) {
      const onboardingDate = firstGoal.targetDate;
      const onboardingGoals = await ctx.db
        .query("dailyGoals")
        .withIndex("by_user_and_date", (q) =>
          q.eq("userId", user._id).eq("targetDate", onboardingDate)
        )
        .collect();

      for (const goal of onboardingGoals) {
        await ctx.db.delete(goal._id);
      }
      return { success: true, habitsDeleted: habits.length, goalsDeleted: onboardingGoals.length };
    }

    return { success: true, habitsDeleted: habits.length, goalsDeleted: 0 };
  },
});

export const getAllForUser = internalQuery({
   args: {},
   handler: async (ctx): Promise<Doc<"dailyGoals">[]> => {
       const user: Doc<"users"> | null = await ctx.runQuery(internal.users.getCurrentUser);
       if (!user) {
           return [];
       }
       return await ctx.db
           .query("dailyGoals")
           .withIndex("by_user", (q) => q.eq("userId", user._id))
           .collect();
   }
});