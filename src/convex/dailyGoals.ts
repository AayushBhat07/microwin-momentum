import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";
import { categoryValidator } from "./schema";

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
    const goalCount = await ctx.db
      .query("dailyGoals")
      .withIndex("by_user_and_date", (q) => q.eq("userId", user._id))
      .collect()
      .then(goals => goals.length);

    if (goalCount === 1) {
      await ctx.db.insert("badges", {
        userId: user._id,
        badgeName: "Goal Setter",
        dateEarned: Date.now(),
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

// Complete a daily goal (alias for complete)
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

    // Update user stats for today
    const today = new Date().toISOString().split('T')[0];
    const existingStat = await ctx.db
      .query("userStats")
      .withIndex("by_user_and_date", (q) => q.eq("userId", user._id).eq("date", today))
      .unique();

    if (existingStat) {
      await ctx.db.patch(existingStat._id, {
        goalsCompleted: existingStat.goalsCompleted + 1,
        pointsEarned: existingStat.pointsEarned + 10, // Award 10 points for completing a goal
      });
    } else {
      await ctx.db.insert("userStats", {
        userId: user._id,
        date: today,
        achievementsCount: 0,
        pointsEarned: 10,
        goalsCompleted: 1,
      });
    }

    // Update user's total points
    await ctx.db.patch(user._id, {
      totalPoints: (user.totalPoints || 0) + 10,
    });

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