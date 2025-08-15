import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api, internal } from "./_generated/api";

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

    let entryId;
    if (existing) {
      // Update existing entry
      await ctx.db.patch(existing._id, { mood, note });
      entryId = existing._id;
    } else {
      // Create new entry
      entryId = await ctx.db.insert("moodEntries", {
        userId,
        mood,
        note,
        period,
        date: today,
      });
    }

    // --- New AI Trigger Logic ---
    const allMoodEntries = await ctx.db
      .query("moodEntries")
      .withIndex("by_user_and_date", (q) => q.eq("userId", userId))
      .collect();

    // After every 3rd mood entry, generate a new micro-plan
    if (allMoodEntries.length > 0 && allMoodEntries.length % 3 === 0) {
      await ctx.scheduler.runAfter(0, internal.aiPlanning.generateMicroGoals, {
        userId,
      });
    }
    // --- End New AI Trigger Logic ---

    return entryId;
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