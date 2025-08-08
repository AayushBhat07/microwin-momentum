import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { categoryValidator, ACHIEVEMENT_CATEGORIES } from "./schema";

// Get random motivational content
export const getRandomMotivation = query({
  args: {
    category: v.optional(categoryValidator),
  },
  handler: async (ctx, args) => {
    let content;

    if (args.category !== undefined) {
      content = await ctx.db
        .query("motivationalContent")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .filter((q) => q.eq(q.field("isActive"), true))
        .collect();
    } else {
      content = await ctx.db
        .query("motivationalContent")
        .withIndex("by_active", (q) => q.eq("isActive", true))
        .collect();
    }
    
    if (content.length === 0) {
      return {
        content: "Every small step forward is progress worth celebrating! 🌟",
        author: "MicroWin Team",
      };
    }

    const randomIndex = Math.floor(Math.random() * content.length);
    return content[randomIndex];
  },
});

// Seed initial motivational content (admin only)
export const seedMotivationalContent = mutation({
  args: {},
  handler: async (ctx) => {
    // To avoid duplicates, let's check if content already exists.
    const existingContent = await ctx.db.query("motivationalContent").collect();
    if (existingContent.length > 0) {
      return "Motivational content already seeded.";
    }

    const motivationalQuotes = [
      // Personal
      { content: "Progress, not perfection. Every small win counts! 🌟", author: "MicroWin Team", category: ACHIEVEMENT_CATEGORIES.PERSONAL, isActive: true },
      { content: "You don't have to be great to get started, but you have to get started to be great.", author: "Les Brown", category: ACHIEVEMENT_CATEGORIES.PERSONAL, isActive: true },
      { content: "Small daily improvements over time lead to stunning results.", author: "Robin Sharma", category: ACHIEVEMENT_CATEGORIES.PERSONAL, isActive: true },
      { content: "The journey of a thousand miles begins with a single step.", author: "Lao Tzu", category: ACHIEVEMENT_CATEGORIES.PERSONAL, isActive: true },
      { content: "Believe you can and you're halfway there.", author: "Theodore Roosevelt", category: ACHIEVEMENT_CATEGORIES.PERSONAL, isActive: true },

      // Work
      { content: "The secret to getting ahead is getting started.", author: "Mark Twain", category: ACHIEVEMENT_CATEGORIES.WORK, isActive: true },
      { content: "The only way to do great work is to love what you do.", author: "Steve Jobs", category: ACHIEVEMENT_CATEGORIES.WORK, isActive: true },
      { content: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier", category: ACHIEVEMENT_CATEGORIES.WORK, isActive: true },
      { content: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson", category: ACHIEVEMENT_CATEGORIES.WORK, isActive: true },

      // Health
      { content: "Your body can do it. It's your mind you need to convince.", author: "Unknown", category: ACHIEVEMENT_CATEGORIES.HEALTH, isActive: true },
      { content: "The greatest wealth is health.", author: "Virgil", category: ACHIEVEMENT_CATEGORIES.HEALTH, isActive: true },
      { content: "Take care of your body. It's the only place you have to live.", author: "Jim Rohn", category: ACHIEVEMENT_CATEGORIES.HEALTH, isActive: true },

      // Learning
      { content: "Learning never exhausts the mind.", author: "Leonardo da Vinci", category: ACHIEVEMENT_CATEGORIES.LEARNING, isActive: true },
      { content: "Live as if you were to die tomorrow. Learn as if you were to live forever.", author: "Mahatma Gandhi", category: ACHIEVEMENT_CATEGORIES.LEARNING, isActive: true },
      { content: "The beautiful thing about learning is that no one can take it away from you.", author: "B.B. King", category: ACHIEVEMENT_CATEGORIES.LEARNING, isActive: true },

      // Creativity
      { content: "Creativity is intelligence having fun.", author: "Albert Einstein", category: ACHIEVEMENT_CATEGORIES.CREATIVITY, isActive: true },
      { content: "You can't use up creativity. The more you use, the more you have.", author: "Maya Angelou", category: ACHIEVEMENT_CATEGORIES.CREATIVITY, isActive: true },
      { content: "The chief enemy of creativity is good sense.", author: "Pablo Picasso", category: ACHIEVEMENT_CATEGORIES.CREATIVITY, isActive: true },

      // Social
      { content: "Alone we can do so little; together we can do so much.", author: "Helen Keller", category: ACHIEVEMENT_CATEGORIES.SOCIAL, isActive: true },
      { content: "The best way to find yourself is to lose yourself in the service of others.", author: "Mahatma Gandhi", category: ACHIEVEMENT_CATEGORIES.SOCIAL, isActive: true },
    ];

    for (const quote of motivationalQuotes) {
      await ctx.db.insert("motivationalContent", quote);
    }

    return "Motivational content seeded successfully!";
  },
});