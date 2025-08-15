import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const saveMoodEntry = mutation({
  args: {
    mood: v.string(),
    note: v.optional(v.string()),
    period: v.union(v.literal("am"), v.literal("pm")),
  },
  handler: async (ctx, { mood, note, period }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("User not authenticated");

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

    // Check if entry already exists for this period today
    const existing = await ctx.db
      .query("moodEntries")
      .withIndex("by_user_and_date", (q) => q.eq("userId", userId).eq("date", today))
      .filter((q) => q.eq(q.field("period"), period))
      .first();

    if (existing) {
      // Update existing entry
      await ctx.db.patch(existing._id, { mood, note });
      return existing._id;
    } else {
      // Create new entry
      return await ctx.db.insert("moodEntries", {
        userId,
        mood,
        note,
        period,
        date: today,
      });
    }
  },
});

export const getTodayMoodEntries = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const today = new Date().toISOString().split('T')[0];

    return await ctx.db
      .query("moodEntries")
      .withIndex("by_user_and_date", (q) => q.eq("userId", userId).eq("date", today))
      .collect();
  },
});

export const getRecentMoodEntries = query({
  args: { days: v.optional(v.number()) },
  handler: async (ctx, { days = 7 }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const entries = await ctx.db
      .query("moodEntries")
      .withIndex("by_user_and_date", (q) => q.eq("userId", userId))
      .order("desc")
      .take(days * 2); // Up to 2 entries per day (AM/PM)

    return entries;
  },
});
