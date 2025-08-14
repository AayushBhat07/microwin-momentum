import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const updateProfile = mutation({
    args: {
        username: v.string(),
        bio: v.optional(v.string()),
        onboardingStep: v.optional(v.number()),
    },
    handler: async (ctx, { username, bio, onboardingStep }) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error("User must be authenticated to update profile.");
        }

        // Check if username is already taken by another user
        const existingUser = await ctx.db
            .query("users")
            .withIndex("by_username", (q) => q.eq("username", username))
            .unique();

        if (existingUser && existingUser._id !== userId) {
            throw new Error("Username is already taken. Please choose another one.");
        }

        const dataToPatch: { username: string; bio?: string; onboardingStep?: number } = {
            username: username,
            bio: bio,
        };

        if (onboardingStep !== undefined) {
            dataToPatch.onboardingStep = onboardingStep;
        }

        await ctx.db.patch(userId, dataToPatch);
    },
});