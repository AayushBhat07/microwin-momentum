import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";
import { categoryValidator } from "./schema";
import { api } from "./_generated/api";

// Create a daily goal
export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    category: categoryValidator,
    targetDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Must be authenticated to create goals");
    }

    // Default to today if no target date provided
    const targetDate = args.targetDate || Date.now();

    const goalId = await ctx.db.insert("dailyGoals", {
      userId: user._id,
      title: args.title,
      description: args.description,
      category: args.category,
      targetDate,
      isCompleted: false,
    });

    // Award "Goal Setter" badge if this is user's first goal
    const allGoals = await ctx.db
      .query("dailyGoals")
      .withIndex("by_user_and_date", (q) => q.eq("userId", user._id))
      .collect();
    const goalCount = allGoals.length;

    if (goalCount === 1) {
      await ctx.runMutation(api.badges.awardBadge, {
        userId: user._id,
        badgeSlug: "goal-setter",
      });
    }

    return goalId;
  },
});

// Get goals for a specific date
export const getGoalsForDate = query({
  args: {
    date: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return [];
    }

    const targetDateStart = new Date(args.date);
    targetDateStart.setHours(0, 0, 0, 0);
    const targetDateEnd = new Date(args.date);
    targetDateEnd.setHours(23, 59, 59, 999);

    const goals = await ctx.db
      .query("dailyGoals")
      .withIndex("by_user_and_date", (q) => q.eq("userId", user._id))
      .filter((q) => 
        q.and(
          q.gte(q.field("targetDate"), targetDateStart.getTime()),
          q.lte(q.field("targetDate"), targetDateEnd.getTime())
        )
      )
      .order("desc")
      .collect();

    return goals;
  },
});

// Complete a daily goal
export const completeGoal = mutation({
  args: {
    goalId: v.id("dailyGoals"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Must be authenticated to complete goals");
    }

    const goal = await ctx.db.get(args.goalId);
    if (!goal || goal.userId !== user._id) {
      throw new Error("Goal not found or access denied");
    }

    if (goal.isCompleted) {
      throw new Error("Goal is already completed");
    }

    await ctx.db.patch(args.goalId, {
      isCompleted: true,
      completedAt: Date.now(),
    });

    // Update user's total points
    const userTotals = await ctx.db
      .query("user_totals")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    if (userTotals) {
      await ctx.db.patch(userTotals._id, {
        totalPoints: userTotals.totalPoints + 10,
        lastPointsUpdateAt: Date.now(),
      });
    } else {
      await ctx.db.insert("user_totals", {
        userId: user._id,
        totalPoints: 10,
        totalAchievements: 0,
        lastPointsUpdateAt: Date.now(),
      });
    }

    return { success: true, pointsEarned: 10 };
  },
});

// Delete a daily goal
export const deleteGoal = mutation({
  args: {
    goalId: v.id("dailyGoals"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Must be authenticated to delete goals");
    }

    const goal = await ctx.db.get(args.goalId);
    if (!goal || goal.userId !== user._id) {
      throw new Error("Goal not found or access denied");
    }

    await ctx.db.delete(args.goalId);
    return { success: true };
  },
});

// Get user's daily goals
export const getUserGoals = query({
  args: {
    targetDate: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return [];
    }

    let query = ctx.db
      .query("dailyGoals")
      .withIndex("by_user_and_date", (q) => q.eq("userId", user._id));

    if (args.targetDate) {
      const targetDateStart = new Date(args.targetDate);
      targetDateStart.setHours(0, 0, 0, 0);
      const targetDateEnd = new Date(args.targetDate);
      targetDateEnd.setHours(23, 59, 59, 999);

      query = query.filter((q) => 
        q.and(
          q.gte(q.field("targetDate"), targetDateStart.getTime()),
          q.lte(q.field("targetDate"), targetDateEnd.getTime())
        )
      );
    }

    const goals = await query
      .order("desc")
      .take(args.limit || 50);

    return goals;
  },
});