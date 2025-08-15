import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";
import { internalAction, internalQuery } from "./_generated/server";

export const getUsersNeedingPlans = internalQuery({
  args: {},
  handler: async (ctx) => {
    // For now, return all users. In production, you'd filter by timezone and last plan generation
    return await ctx.db.query("users").take(100);
  },
});

export const generateDailyPlansForUsers = internalAction({
  args: {},
  handler: async (ctx) => {
    // Get all users who need daily plan generation
    // This runs every hour and checks if it's end-of-day for each user
    const users = await ctx.runQuery(internal.crons.getUsersNeedingPlans);
    
    for (const user of users) {
      try {
        await ctx.runAction(internal.aiPlanning.generateDailyPlan, {
          userId: user._id,
        });
      } catch (error) {
        console.error(`Failed to generate plan for user ${user._id}:`, error);
      }
    }
  },
});

const crons = cronJobs();

// Run every hour to check for users who need daily plan generation
crons.interval("generate daily plans", { hours: 1 }, internal.crons.generateDailyPlansForUsers, {});

export default crons;