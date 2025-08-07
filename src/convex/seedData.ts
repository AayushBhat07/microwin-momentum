import { mutation } from "./_generated/server";
import { ACHIEVEMENT_CATEGORIES } from "./schema";

export const seedInitialData = mutation({
  args: {},
  handler: async (ctx) => {
    // Seed motivational content
    const motivationalQuotes = [
      {
        content: "Progress, not perfection. Every small win counts! 🌟",
        author: "MicroWin Team",
        category: ACHIEVEMENT_CATEGORIES.PERSONAL,
        isActive: true,
      },
      {
        content: "You don't have to be great to get started, but you have to get started to be great.",
        author: "Les Brown",
        category: ACHIEVEMENT_CATEGORIES.PERSONAL,
        isActive: true,
      },
      {
        content: "Small daily improvements over time lead to stunning results.",
        author: "Robin Sharma",
        category: ACHIEVEMENT_CATEGORIES.PERSONAL,
        isActive: true,
      },
      {
        content: "The secret to getting ahead is getting started.",
        author: "Mark Twain",
        category: ACHIEVEMENT_CATEGORIES.WORK,
        isActive: true,
      },
      {
        content: "Your body can do it. It's your mind you need to convince.",
        author: "Unknown",
        category: ACHIEVEMENT_CATEGORIES.HEALTH,
        isActive: true,
      },
      {
        content: "Learning never exhausts the mind.",
        author: "Leonardo da Vinci",
        category: ACHIEVEMENT_CATEGORIES.LEARNING,
        isActive: true,
      },
      {
        content: "Creativity is intelligence having fun.",
        author: "Albert Einstein",
        category: ACHIEVEMENT_CATEGORIES.CREATIVITY,
        isActive: true,
      },
      {
        content: "Alone we can do so little; together we can do so much.",
        author: "Helen Keller",
        category: ACHIEVEMENT_CATEGORIES.SOCIAL,
        isActive: true,
      },
      {
        content: "The journey of a thousand miles begins with one step.",
        author: "Lao Tzu",
        category: ACHIEVEMENT_CATEGORIES.PERSONAL,
        isActive: true,
      },
      {
        content: "Success is the sum of small efforts repeated day in and day out.",
        author: "Robert Collier",
        category: ACHIEVEMENT_CATEGORIES.WORK,
        isActive: true,
      },
    ];

    // Check if motivational content already exists
    const existingContent = await ctx.db
      .query("motivationalContent")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .first();

    if (!existingContent) {
      for (const quote of motivationalQuotes) {
        await ctx.db.insert("motivationalContent", quote);
      }
    }

    return "Initial data seeded successfully!";
  },
});
