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
    ];

    for (const quote of motivationalQuotes) {
      await ctx.db.insert("motivationalContent", quote);
    }

    return "Motivational content seeded successfully!";
  },
});