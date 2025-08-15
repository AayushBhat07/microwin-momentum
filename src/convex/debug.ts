"use node";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { action } from "./_generated/server";

// Public action that can be called from the command line to trigger the plan
export const triggerPlanForUser = action({
  args: { email: v.string() },
  handler: async (ctx, { email }): Promise<string> => {
    console.log(`Attempting to trigger plan for ${email}`);

    // Find the user by email
    const user = await ctx.runQuery(internal.aiPlanningMutations.getUserByEmail, { email });

    if (!user) {
      return `Error: User with email ${email} not found.`;
    }

    if (!user._id) {
        return `Error: User ID not found for ${email}.`;
    }

    try {
      // Trigger the AI plan generation for the specific user
      await ctx.runAction(internal.aiPlanning.generateDailyPlan, {
        userId: user._id,
      });
      return `Successfully triggered AI plan generation for ${user.name} (${email}).`;
    } catch (error: any) {
      console.error("Error triggering plan:", error);
      return `Failed to trigger plan. Error: ${error.message}`;
    }
  },
});