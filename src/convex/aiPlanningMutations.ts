import { v } from "convex/values";
import { internalMutation, internalQuery, query, mutation } from "./_generated/server";
import { Doc } from "./_generated/dataModel";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get user's most recent mood entry
export const getLatestUserMood = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }): Promise<Doc<"moodEntries"> | null> => {
    return await ctx.db
      .query("moodEntries")
      .withIndex("by_user_and_date", (q) => q.eq("userId", userId))
      .order("desc")
      .first();
  },
});

// Count user's mood entries
export const countUserMoodEntries = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const entries = await ctx.db
      .query("moodEntries")
      .withIndex("by_user_and_date", (q) => q.eq("userId", userId))
      .collect();
    return entries.length;
  },
});

// Get user by email
export const getUserByEmail = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    return await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", email))
      .first();
  },
});

// Get latest plan for user
export const getLatestPlanForUser = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("aiPlans")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .first();
  },
});

// Add AI-generated micro-goals to the user's daily plan
export const addMicroGoalsToDailyPlan = internalMutation({
  args: {
    userId: v.id("users"),
    date: v.string(),
    goals: v.array(
      v.object({
        title: v.string(),
        category: v.string(),
      })
    ),
  },
  handler: async (ctx, { userId, date, goals }) => {
    for (const goal of goals) {
      // Avoid adding duplicate goals for the same day
      const existing = await ctx.db
        .query("dailyGoals")
        .withIndex("by_user_and_date", (q) =>
          q.eq("userId", userId).eq("targetDate", date)
        )
        .filter((q) => q.eq(q.field("title"), goal.title))
        .first();

      if (!existing) {
        await ctx.db.insert("dailyGoals", {
          userId,
          title: goal.title,
          category: goal.category as any, // Assuming category string matches validator
          targetDate: date,
          isCompleted: false,
        });
      }
    }
  },
});

// Add missing functions that components expect
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

export const markGoalCompleted = mutation({
  args: {
    planId: v.id("aiPlans"),
    date: v.string(),
    goalIndex: v.number(),
  },
  handler: async (ctx, { planId, date, goalIndex }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("User not authenticated");

    const plan = await ctx.db.get(planId);
    if (!plan || plan.userId !== userId) {
      throw new Error("Plan not found or unauthorized");
    }

    const updatedPlan = plan.plan.map(day => {
      if (day.date === date) {
        const updatedGoals = day.goals.map((goal, index) => {
          if (index === goalIndex) {
            return { ...goal, completed: true };
          }
          return goal;
        });
        return { ...day, goals: updatedGoals };
      }
      return day;
    });

    await ctx.db.patch(planId, { plan: updatedPlan });
  },
});