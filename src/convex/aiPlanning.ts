"use node";

import { internalAction, internalQuery, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api, internal } from "./_generated/api";
import OpenAI from "openai";

export const generateDailyPlan = internalAction({
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
      // Get user's recent mood entries (last 7 days)
      const moodEntries = await ctx.runQuery(internal.aiPlanningMutations.getUserMoodHistory, { userId });
      
      // Get user's recent achievements (last 7 days)
      const achievements = await ctx.runQuery(internal.aiPlanningMutations.getUserAchievementHistory, { userId });

      // Get user's current goals/presets
      const presets = await ctx.runQuery(internal.aiPlanningMutations.getUserPresets, { userId });

      const openai = new OpenAI({
        apiKey: apiKey,
        baseURL: "https://openrouter.ai/api/v1",
      });

      const prompt = `
You are a compassionate AI wellness coach. Based on the user's recent mood and achievement data, create a personalized 3-day micro-goal plan.

Recent mood entries: ${JSON.stringify(moodEntries)}
Recent achievements: ${JSON.stringify(achievements)}
User's goal presets: ${JSON.stringify(presets)}

Create a 3-day plan with 2-4 micro-goals per day. Each goal should:
- Be achievable in 5-15 minutes
- Build on their recent patterns and mood
- Include variety across categories (health, work, learning, social, creative, personal)
- Be encouraging and supportive

Return as JSON with this structure:
{
  "plan": [
    {
      "date": "2024-01-15",
      "goals": [
        {
          "title": "Take a 5-minute walk outside",
          "categorySlug": "health",
          "completed": false
        }
      ]
    }
  ]
}
`;

      const completion = await openai.chat.completions.create({
        model: "deepseek/deepseek-chat-v3-0324:free",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        response_format: { type: "json_object" },
      });

      const responseContent = completion.choices[0].message.content;
      if (!responseContent) {
        throw new Error("AI returned empty response");
      }

      const planData = JSON.parse(responseContent);
      
      // Save the plan
      await ctx.runMutation(api.aiPlanningMutations.createPlan, {
        userId,
        plan: planData.plan,
      });

    } catch (error) {
      console.error("Error generating AI plan:", error);
    }
  },
});