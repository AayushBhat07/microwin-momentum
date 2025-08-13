import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";

export const updateProfile = mutation({
  args: {
    username: v.string(),
    bio: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);
    if (!user) {
      throw new Error("User not authenticated");
    }

    // Check for username uniqueness
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .unique();

    if (existingUser && existingUser._id !== user._id) {
      throw new Error("Username is already taken.");
    }

    await ctx.db.patch(user._id, {
      username: args.username,
      bio: args.bio,
    });

    // Call internal mutation to complete step 1
    await ctx.runMutation(internal.onboarding.completeOnboardingStepInternal, { step: 1 });
  },
});

export const updateGeneralProfile = mutation({
  args: {
    username: v.string(),
    bio: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);
    if (!user) {
      throw new Error("User not authenticated");
    }

    // Check for username uniqueness
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .unique();

    if (existingUser && existingUser._id !== user._id) {
      throw new Error("Username is already taken.");
    }

    await ctx.db.patch(user._id, {
      username: args.username,
      bio: args.bio,
    });
  },
});