import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";
import { categoryValidator } from "./schema";
import { internal } from "./_generated/api";

// This file provides enhanced goal functionality
// Currently redirects to dailyGoals for compatibility
export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    category: categoryValidator,
    targetDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Redirect to dailyGoals.create for now
    return await ctx.runMutation(internal.dailyGoals.create, args);
  },
});

export const getTodaysGoals = query({
  handler: async (ctx) => {
    // Redirect to dailyGoals.getTodaysGoals for now
    return await ctx.runQuery(internal.dailyGoals.getTodaysGoals);
  },
});

export const complete = mutation({
  args: {
    goalId: v.id("dailyGoals"),
  },
  handler: async (ctx, args) => {
    // Redirect to dailyGoals.complete for now
    return await ctx.runMutation(internal.dailyGoals.complete, args);
  },
});

export const remove = mutation({
  args: {
    goalId: v.id("dailyGoals"),
  },
  handler: async (ctx, args) => {
    // Redirect to dailyGoals.remove for now
    return await ctx.runMutation(internal.dailyGoals.remove, args);
  },
});