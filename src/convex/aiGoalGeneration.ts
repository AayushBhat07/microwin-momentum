"use node";

import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import OpenAI from "openai";

export const generateSingleGoal = internalAction({
  args: {
    userId: v.id("users"),
    completedGoalTitle: v.string(),
    completedGoalCategory: v.string(),
  },
  handler: async (ctx, { userId, completedGoalTitle, completedGoalCategory }) => {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.error("OPENROUTER_API_KEY not set");
      return;
    }

    try {
      // Get user's recent achievements for context
      const recentAchievements = await ctx.runQuery(internal.habits.getRecentUserAchievements, { userId });
      
      const openai = new OpenAI({
        apiKey: apiKey,
        baseURL: "https://openrouter.ai/api/v1",
      });

      const achievementsContext = recentAchievements.length > 0 
        ? `Recent achievements: ${recentAchievements.map(a => `${a.title} (${a.categorySlug})`).join(', ')}`
        : "No recent achievements";

      const prompt = `
You are a supportive AI wellness coach. A user just completed: "${completedGoalTitle}" in the ${completedGoalCategory} category.

${achievementsContext}

Based on their completion and momentum, create ONE new micro-goal that:
- Builds on their success
- Takes 5-15 minutes to complete
- Is encouraging and achievable
- Can be in any relevant category (health, work, learning, social, creative, personal)

Return as JSON:
{
  "title": "Your new goal title",
  "categorySlug": "category"
}
`;

      const completion = await openai.chat.completions.create({
        model: "mistralai/mistral-7b-instruct:free",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8,
        response_format: { type: "json_object" },
      });

      const responseContent = completion.choices[0].message.content;
      if (!responseContent) {
        throw new Error("AI returned empty response");
      }

      const goalData = JSON.parse(responseContent);
      
      // Add the new goal as a user preset
      await ctx.runMutation(internal.habits.addGeneratedGoal, {
        userId,
        title: goalData.title,
        categorySlug: goalData.categorySlug,
      });

      return goalData;
    } catch (error) {
      console.error("Error generating single AI goal:", error);
    }
  },
});