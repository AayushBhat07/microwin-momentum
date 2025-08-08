import { v } from "convex/values";
import { query } from "./_generated/server";
import { categoryValidator } from "./schema";

// Get random motivational content
export const getRandomContent = query({
  args: {
    category: v.optional(categoryValidator),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("motivationalContent")
      .filter((q) => q.eq(q.field("isActive"), true));

    if (args.category) {
      query = query.filter((q) => q.eq(q.field("category"), args.category));
    }

    const content = await query.collect();
    
    if (content.length === 0) {
      return null;
    }

    // Return random content
    const randomIndex = Math.floor(Math.random() * content.length);
    return content[randomIndex];
  },
});

// Get random motivational quote
export const getRandomQuote = query({
  args: {},
  handler: async (ctx) => {
    const quotes = await ctx.db.query("motivationalQuotes").collect();
    
    if (quotes.length === 0) {
      return null;
    }

    // Return random quote
    const randomIndex = Math.floor(Math.random() * quotes.length);
    return quotes[randomIndex];
  },
});

// Get all motivational content (admin)
export const getAllContent = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("motivationalContent").collect();
  },
});

// Get random motivational content (alias for getRandomContent)
export const getRandomMotivation = query({
  args: {},
  handler: async (ctx) => {
    const content = await ctx.db
      .query("motivationalContent")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
    
    if (content.length === 0) {
      return null;
    }

    // Return random content
    const randomIndex = Math.floor(Math.random() * content.length);
    return content[randomIndex];
  },
});