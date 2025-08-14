"use node";

import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import OpenAI from "openai";
import { Id } from "./_generated/dataModel";

const achievementCategories = [
    { "name": "Personal Growth", "slug": "personal" },
    { "name": "Work & Productivity", "slug": "work" },
    { "name": "Health & Fitness", "slug": "health" },
    { "name": "Social & Relationships", "slug": "social" },
    { "name": "Hobbies & Fun", "slug": "hobbies" },
    { "name": "Home & Organization", "slug": "home" }
];

const categorySlugs = achievementCategories.map(c => c.slug).join(", ");

export const generateSuggestionsWithAI = internalAction({
    args: {
        challenges: v.array(v.string()),
        intensities: v.record(v.string(), v.number()),
        userId: v.id("users"),
    },
    handler: async (ctx, { challenges, intensities }) => {
        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
            throw new Error("OPENROUTER_API_KEY environment variable not set. Please add it in your project settings.");
        }

        const openai = new OpenAI({
            apiKey: apiKey,
            baseURL: "https://openrouter.ai/api/v1",
        });

        const challengesText = challenges.join(", ");
        const intensitiesText = challenges.map(c => `${c}: ${intensities[c]}/5`).join(", ");

        const prompt = `
You are a compassionate wellness coach AI. A user is facing the following challenges: ${challengesText}.
The user has rated the intensity of these challenges as follows (out of 5): ${intensitiesText}.

Please generate 7 unique, actionable, and empathetic micro-goals to help them.
The goals should be very small, taking 1-10 minutes to complete.

Return the goals as a valid JSON object. Do not include any other text or explanations in your response, only the JSON.
The JSON object must have a single key named "suggestions" which contains an array of goal objects.
Each object must have the following properties:
- "title": a string for the goal's title.
- "categorySlug": a string for the category. It must be one of the following values: ${categorySlugs}.
- "effortMinutes": a number representing the time in minutes to complete the goal (1-10).

Example response:
{
  "suggestions": [
    {
      "title": "Step outside and take 3 deep breaths",
      "categorySlug": "personal",
      "effortMinutes": 2
    },
    {
      "title": "Write down one task that can wait until tomorrow",
      "categorySlug": "work",
      "effortMinutes": 3
    }
  ]
}
`;

        try {
            const completion = await openai.chat.completions.create({
                model: "mistralai/mixtral-8x7b-instruct",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.8,
                response_format: { type: "json_object" },
            });

            const responseContent = completion.choices[0].message.content;
            if (!responseContent) {
                throw new Error("AI returned an empty response.");
            }
            
            let suggestions;
            try {
                const parsed = JSON.parse(responseContent);
                if (parsed && Array.isArray(parsed.suggestions)) {
                    suggestions = parsed.suggestions;
                } else if (Array.isArray(parsed)) {
                    // Fallback for models that might ignore the prompt and return an array directly
                    suggestions = parsed;
                } else {
                    console.error("AI response was not in the expected format.", { responseContent });
                    throw new Error("AI returned data in an unexpected format.");
                }
            } catch (e) {
                 console.error("Failed to parse AI JSON response:", e, { responseContent });
                 throw new Error("AI returned invalid JSON.");
            }

            return suggestions.map((s: any) => ({
                ...s,
                defaultPrivate: true,
                source: 'system' as const
            }));

        } catch (error) {
            console.error("Error calling OpenRouter:", error);
            throw new Error("Failed to get suggestions from AI service. Please check your API key and the service status.");
        }
    },
});