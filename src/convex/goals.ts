import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";
import { categoryValidator } from "./schema";
import { Doc, Id } from "./_generated/dataModel";

/**
 * Retrieves all goals for the current user for today.
 */
export const getTodaysGoals = query({
  args: {
    date: v.string(), // Expect YYYY-MM-DD from client
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
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
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
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
    const user = await getCurrentUser(ctx);
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
    const user = await getCurrentUser(ctx);
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