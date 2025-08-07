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
    targetDate: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Must be authenticated to create goals");
    }

    return await ctx.db.insert("dailyGoals", {
      userId: user._id,
      title: args.title,
      description: args.description,
      category: args.category,
      targetDate: args.targetDate,
      isCompleted: false,
    });
  },
});

// Get user's goals for a specific date
export const getGoalsForDate = query({
  args: {
    date: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return [];
    }

    const startOfDay = new Date(args.date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(args.date);
    endOfDay.setHours(23, 59, 59, 999);

    return await ctx.db
      .query("dailyGoals")
      .withIndex("by_user_and_date", (q) => 
        q.eq("userId", user._id)
         .gte("targetDate", startOfDay.getTime())
         .lte("targetDate", endOfDay.getTime())
      )
      .collect();
  },
});

// Complete a goal
export const completeGoal = mutation({
  args: {
    goalId: v.id("dailyGoals"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Must be authenticated");
    }

    const goal = await ctx.db.get(args.goalId);
    if (!goal || goal.userId !== user._id) {
      throw new Error("Goal not found or unauthorized");
    }

    await ctx.db.patch(args.goalId, {
      isCompleted: true,
      completedAt: Date.now(),
    });

    // Update daily stats
    const today = new Date().toISOString().split('T')[0];
    const existingStats = await ctx.db
      .query("userStats")
      .withIndex("by_user_and_date", (q) => q.eq("userId", user._id).eq("date", today))
      .unique();

    if (existingStats) {
      await ctx.db.patch(existingStats._id, {
        goalsCompleted: existingStats.goalsCompleted + 1,
      });
    } else {
      await ctx.db.insert("userStats", {
        userId: user._id,
        date: today,
        achievementsCount: 0,
        pointsEarned: 0,
        goalsCompleted: 1,
      });
    }
  },
});

// Delete a goal
export const deleteGoal = mutation({
  args: {
    goalId: v.id("dailyGoals"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Must be authenticated");
    }

    const goal = await ctx.db.get(args.goalId);
    if (!goal || goal.userId !== user._id) {
      throw new Error("Goal not found or unauthorized");
    }

    await ctx.db.delete(args.goalId);
  },
});
