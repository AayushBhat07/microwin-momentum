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
        // Check if user has enough mood entries
        const moodEntryCount = await ctx.runQuery(internal.aiPlanningMutations.countUserMoodEntries, { userId: user._id });
        if (moodEntryCount < 2) {
          console.log(`Skipping plan for user ${user._id}, not enough mood entries (${moodEntryCount}). Needs 2.`);
          continue;
        }

        // Check if a plan was generated recently
        const latestPlan = await ctx.runQuery(internal.aiPlanningMutations.getLatestPlanForUser, { userId: user._id });
        if (latestPlan) {
          const twentyFourHours = 24 * 60 * 60 * 1000;
          if (Date.now() - latestPlan.generatedAt < twentyFourHours) {
            console.log(`Skipping plan for user ${user._id}, plan generated recently.`);
            continue;
          }
        }

        await ctx.runAction(internal.aiPlanning.generateDailyPlan, {
          userId: user._id,
        });
        console.log(`Successfully triggered AI plan generation for user ${user._id}.`);

      } catch (error) {
        console.error(`Failed to process plan for user ${user._id}:`, error);
      }
    }
  },
});

const crons = cronJobs();

// Run every hour to check for users who need daily plan generation
crons.interval("generate daily plans", { hours: 1 }, internal.crons.generateDailyPlansForUsers, {});

export default crons;