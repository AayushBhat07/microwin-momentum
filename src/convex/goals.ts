import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";
import { categoryValidator } from "./schema";

/**
 * Creates a new daily goal for the authenticated user.
 */
export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    category: categoryValidator,
    targetDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("User must be authenticated to create a goal.");
    }

    const today = new Date();
    const targetDate = args.targetDate || today.toISOString().split('T')[0];

    const goalId = await ctx.db.insert("dailyGoals", {
      userId: user._id,
      title: args.title,
      description: args.description,
      category: args.category,
      targetDate,
      isCompleted: false,
    });

    return goalId;
  },
});

/**
 * Retrieves all goals for the current user for today.
 */
export const getTodaysGoals = query({
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return [];
    }

    const today = new Date();
    const todayString = today.toISOString().split('T')[0];

    return await ctx.db
      .query("dailyGoals")
      .withIndex("by_user_and_date", (q) =>
        q
          .eq("userId", user._id)
          .eq("targetDate", todayString)
      )
      .order("desc")
      .collect();
  },
});

/**
 * Marks a specific goal as complete.
 */
export const complete = mutation({
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