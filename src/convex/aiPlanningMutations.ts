import { mutation, query, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createPlan = mutation({
  args: {
    userId: v.id("users"),
    plan: v.array(
      v.object({
        date: v.string(),
        goals: v.array(
          v.object({
            title: v.string(),
            categorySlug: v.string(),
            completed: v.boolean(),
          })
        ),
      })
    ),
  },
  handler: async (ctx, { userId, plan }) => {
    return await ctx.db.insert("aiPlans", {
      userId,
      plan,
      generatedAt: Date.now(),
    });
  },
});

export const getLatestPlan = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    return await ctx.db
      .query("aiPlans")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .first();
  },
});

export const getLatestPlanForUser = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("aiPlans")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .first();
  }
});

export const countUserMoodEntries = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const entries = await ctx.db
      .query("moodEntries")
      .withIndex("by_user_and_date", (q) => q.eq("userId", userId))
      .collect();
    return entries.length;
  }
});

export const markGoalCompleted = mutation({
  args: {
    planId: v.id("aiPlans"),
    date: v.string(),
    goalIndex: v.number(),
  },
  handler: async (ctx, { planId, date, goalIndex }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const plan = await ctx.db.get(planId);
    if (!plan || plan.userId !== userId) {
      throw new Error("Plan not found");
    }

    const updatedPlan = plan.plan.map(dayPlan => {
      if (dayPlan.date === date) {
        const updatedGoals = [...dayPlan.goals];
        if (updatedGoals[goalIndex]) {
          updatedGoals[goalIndex].completed = true;
        }
        return { ...dayPlan, goals: updatedGoals };
      }
      return dayPlan;
    });

    await ctx.db.patch(planId, { plan: updatedPlan });
  },
});

export const getUserMoodHistory = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const cutoffDate = sevenDaysAgo.toISOString().split('T')[0];

    return await ctx.db
      .query("moodEntries")
      .withIndex("by_user_and_date", (q) => q.eq("userId", userId))
      .filter((q) => q.gte(q.field("date"), cutoffDate))
      .collect();
  },
});

export const getUserAchievementHistory = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);

    return await ctx.db
      .query("achievements")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.gte(q.field("loggedAt"), sevenDaysAgo))
      .collect();
  },
});

export const getUserPresets = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("userPresets")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .take(10);
  },
});

export const getUserByEmail = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", email))
      .unique();
    return user;
  },
});