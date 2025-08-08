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
        category: "personal" as const,
        isActive: true,
      },
      {
        content: "Your consistency today builds the momentum for tomorrow.",
        author: "MicroWin Team", 
        category: "work" as const,
        isActive: true,
      },
      {
        content: "Health is built one healthy choice at a time.",
        author: "MicroWin Team",
        category: "health" as const,
        isActive: true,
      },
      {
        content: "Learning never stops - every new skill is a victory!",
        author: "MicroWin Team",
        category: "learning" as const,
        isActive: true,
      },
      {
        content: "Creativity flows when you give yourself permission to try.",
        author: "MicroWin Team",
        category: "creative" as const,
        isActive: true,
      },
      {
        content: "Strong relationships are built through small, consistent acts of kindness.",
        author: "MicroWin Team",
        category: "social" as const,
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

export const seedAchievementCategories = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if categories already exist
    const existing = await ctx.db.query("achievement_categories").first();
    if (existing) {
      return { message: "Categories already seeded" };
    }

    const categories = [
      { slug: "health", name: "Health & Fitness", basePoints: 25, colorHex: "#10b981", iconName: "Heart" },
      { slug: "work", name: "Work & Career", basePoints: 20, colorHex: "#3b82f6", iconName: "Briefcase" },
      { slug: "learning", name: "Learning & Growth", basePoints: 35, colorHex: "#8b5cf6", iconName: "BookOpen" },
      { slug: "social", name: "Social & Relationships", basePoints: 25, colorHex: "#f59e0b", iconName: "Users" },
      { slug: "creative", name: "Creative & Hobbies", basePoints: 30, colorHex: "#ef4444", iconName: "Palette" },
      { slug: "personal", name: "Personal Care", basePoints: 25, colorHex: "#06b6d4", iconName: "Sparkles" },
    ];

    for (const category of categories) {
      await ctx.db.insert("achievement_categories", {
        ...category,
        isActive: true,
      });
    }

    return { message: "Achievement categories seeded successfully" };
  },
});