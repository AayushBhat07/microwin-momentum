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
            throw new Error("OPENROUTER_API_KEY environment variable not set.");
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
Return the goals as a valid JSON array of objects. Do not include any other text or explanations in your response, only the JSON.
Each object must have the following properties:
- "title": a string for the goal's title.
- "categorySlug": a string for the category. It must be one of the following values: ${categorySlugs}.
- "effortMinutes": a number representing the time in minutes to complete the goal (1-10).

Example response:
[
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
`;

        try {
            const completion = await openai.chat.completions.create({
                model: "anthropic/claude-3-haiku",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.8,
                response_format: { type: "json_object" },
            });

            const responseContent = completion.choices[0].message.content;
            if (!responseContent) {
                throw new Error("AI returned an empty response.");
            }
            
            // The model might wrap the array in a root object, so we need to handle that.
            let parsedResponse;
            try {
                const rawParsed = JSON.parse(responseContent);
                // Check if the response is an object with a single array-valued key
                if (typeof rawParsed === 'object' && !Array.isArray(rawParsed)) {
                    const keys = Object.keys(rawParsed);
                    if (keys.length > 0 && Array.isArray(rawParsed[keys[0]])) {
                        parsedResponse = rawParsed[keys[0]];
                    } else {
                        // It's an object but not in the expected wrapper format
                        throw new Error("AI response is an object but not in the expected format.");
                    }
                } else if (Array.isArray(rawParsed)) {
                    parsedResponse = rawParsed;
                } else {
                    throw new Error("AI response is not a JSON array or a wrapping object.");
                }
            } catch (e) {
                 console.error("Failed to parse AI response:", e);
                 throw new Error("AI returned invalid JSON.");
            }


            return parsedResponse.map((s: any) => ({
                ...s,
                defaultPrivate: true,
                source: 'system' as const
            }));

        } catch (error) {
            console.error("Error calling OpenRouter:", error);
            // Fallback to a simple default goal if AI fails
            return [{
                title: "Take a 2-minute stretch break",
                categorySlug: "health",
                effortMinutes: 2,
                defaultPrivate: true,
                source: 'system' as const
            }];
        }
    },
});
