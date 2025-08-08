import { v } from "convex/values";
import { internalMutation, mutation } from "./_generated/server";
import { getCurrentUser } from "./users";
import { api } from "./_generated/api";

export const updateProfile = mutation({
  args: {
    username: v.string(),
    bio: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
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
    await ctx.runMutation(api.onboarding.completeOnboardingStep, { step: 1 });
  },
});