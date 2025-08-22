import { mutation, query, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

export const getLatestUserMood = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const moodEntries = await ctx.db
      .query("moodEntries")
      .withIndex("by_user_and_date", (q) => q.eq("userId", userId))
      .order("desc")
      .take(1);
    return moodEntries.length > 0 ? moodEntries[0] : null;
  },
});

export const addMicroGoalsToDailyPlan = mutation({
  args: {
    userId: v.id("users"),
    date: v.string(),
    goals: v.array(v.object({
      title: v.string(),
      categorySlug: v.string(),
    })),
  },
  handler: async (ctx, { userId, date, goals }) => {
    const existingPlan = await ctx.db
      .query("aiPlans")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .first();

    const newPlanEntry = {
      date,
      goals: goals.map(g => ({ ...g, completed: false })),
    };

    if (existingPlan) {
      const dateExists = existingPlan.plan.some(p => p.date === date);
      if (dateExists) {
        // Replace goals for the existing date
        const updatedPlan = existingPlan.plan.map(p => p.date === date ? newPlanEntry : p);
        await ctx.db.patch(existingPlan._id, { plan: updatedPlan });
      } else {
        // Add new date entry to the plan
        await ctx.db.patch(existingPlan._id, { plan: [...existingPlan.plan, newPlanEntry] });
      }
    } else {
      // Create a new plan
      await ctx.db.insert("aiPlans", {
        userId,
        plan: [newPlanEntry],
        generatedAt: Date.now(),
      });
    }
  },
});

export const getLatestPlan = query({
  args: {},
  handler: async (ctx): Promise<any> => {
    const user: any = await ctx.runQuery(internal.users.getCurrentUser);
    if (!user) return null;

    return await ctx.db
      .query("aiPlans")
      .withIndex("by_user", (q: any) => q.eq("userId", user._id))
      .order("desc")
      .first();
  }
});

export const markGoalCompleted = mutation({
  args: {
    planId: v.id("aiPlans"),
    date: v.string(),
    goalIndex: v.number(),
  },
  handler: async (ctx, { planId, date, goalIndex }) => {
    const plan = await ctx.db.get(planId);
    if (!plan) throw new Error("Plan not found");

    const user = await ctx.runQuery(internal.users.getCurrentUser);
    if (!user || plan.userId !== user._id) throw new Error("Unauthorized");

    const dayPlan = plan.plan.find(p => p.date === date);
    if (!dayPlan || !dayPlan.goals[goalIndex]) throw new Error("Goal not found");

    // Mark as completed
    dayPlan.goals[goalIndex].completed = true;
    await ctx.db.patch(planId, { plan: plan.plan });

    // Log an achievement to trigger stat updates
    const goal = dayPlan.goals[goalIndex];
    await ctx.runMutation(internal.achievements.createAchievement, {
      userId: user._id,
      clientId: `ai-goal-${date}-${goalIndex}`,
      title: goal.title,
      description: "Completed an AI-suggested micro-goal.",
      categorySlug: goal.categorySlug,
      source: "quick",
      isPublic: false, // AI goals are private by default
    });

    return true;
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
  },
});

export const getUserByEmail = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    return await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", email))
      .unique();
  },
});