"use node";

import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { query, mutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import OpenAI from "openai";

export const generateMicroGoals = internalAction({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, { userId }) => {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.error("OPENROUTER_API_KEY not set");
      return;
    }

    try {
      // Get user's most recent mood entry
      const latestMood = await ctx.runQuery(internal.aiPlanningMutations.getLatestUserMood, { userId });
      if (!latestMood) {
        console.log("No mood entries found for user, skipping AI plan.");
        return;
      }

      const openai = new OpenAI({
        apiKey: apiKey,
        baseURL: "https://openrouter.ai/api/v1",
      });

      const today = new Date().toISOString().split('T')[0];

      const prompt = `
You are a compassionate AI wellness coach. Based on the user's latest mood entry, create a personalized micro-goal plan for today.

User's latest mood: ${latestMood.mood}
Optional note: ${latestMood.note || "N/A"}

Create a plan with 2-3 micro-goals for today (${today}). Each goal should:
- Be achievable in 5-15 minutes
- Be directly related to improving or maintaining their current mood
- Include variety across categories (health, work, learning, social, creative, personal)
- Be encouraging and supportive

Return as JSON with this structure.
{
  "goals": [
    {
      "title": "Take a 5-minute walk outside",
      "categorySlug": "health"
    },
    {
      "title": "Write down one thing you're grateful for",
      "categorySlug": "personal"
    }
  ]
}
`;

      const completion = await openai.chat.completions.create({
        model: "anthropic/claude-3-haiku:beta",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8,
        response_format: { type: "json_object" },
      });

      const responseContent = completion.choices[0].message.content;
      if (!responseContent) {
        throw new Error("AI returned empty response");
      }

      const planData = JSON.parse(responseContent);
      
      // Save the goals to the dailyGoals table
      await ctx.runMutation(internal.aiPlanningMutations.addMicroGoalsToDailyPlan, {
        userId,
        goals: planData.goals,
        date: today,
      });

    } catch (error) {
      console.error("Error generating AI micro-goals:", error);
    }
  },
});

// Legacy function for backward compatibility
export const generateDailyPlan = internalAction({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, { userId }): Promise<void> => {
    // Just call the new micro-goals function
    await ctx.runAction(internal.aiPlanning.generateMicroGoals, { userId });
  },
});