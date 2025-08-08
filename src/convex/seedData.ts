import { mutation } from "./_generated/server";
import { ACHIEVEMENT_CATEGORIES } from "./schema";

export const seedMotivationalContent = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if data already exists
    const existing = await ctx.db.query("motivationalContent").first();
    if (existing) {
      return { message: "Data already seeded" };
    }

    const motivationalContent = [
      {
        content: "Every small step forward is progress worth celebrating!",
        author: "MicroWin Team",
        category: ACHIEVEMENT_CATEGORIES.PERSONAL,
        isActive: true,
      },
      {
        content: "Your consistency today builds the momentum for tomorrow.",
        author: "MicroWin Team", 
        category: ACHIEVEMENT_CATEGORIES.WORK,
        isActive: true,
      },
      {
        content: "Health is built one healthy choice at a time.",
        author: "MicroWin Team",
        category: ACHIEVEMENT_CATEGORIES.HEALTH,
        isActive: true,
      },
      {
        content: "Learning never stops - every new skill is a victory!",
        author: "MicroWin Team",
        category: ACHIEVEMENT_CATEGORIES.LEARNING,
        isActive: true,
      },
      {
        content: "Creativity flows when you give yourself permission to try.",
        author: "MicroWin Team",
        category: ACHIEVEMENT_CATEGORIES.CREATIVITY,
        isActive: true,
      },
      {
        content: "Strong relationships are built through small, consistent acts of kindness.",
        author: "MicroWin Team",
        category: ACHIEVEMENT_CATEGORIES.SOCIAL,
        isActive: true,
      },
    ];

    for (const content of motivationalContent) {
      await ctx.db.insert("motivationalContent", content);
    }

    // Seed some motivational quotes
    const quotes = [
      {
        quote: "The journey of a thousand miles begins with one step.",
        author: "Lao Tzu",
      },
      {
        quote: "Success is the sum of small efforts repeated day in and day out.",
        author: "Robert Collier",
      },
      {
        quote: "Don't watch the clock; do what it does. Keep going.",
        author: "Sam Levenson",
      },
      {
        quote: "Progress, not perfection, is the goal.",
        author: "Unknown",
      },
      {
        quote: "Small daily improvements over time lead to stunning results.",
        author: "Robin Sharma",
      },
    ];

    for (const quote of quotes) {
      await ctx.db.insert("motivationalQuotes", quote);
    }

    return { message: "Motivational content seeded successfully" };
  },
});