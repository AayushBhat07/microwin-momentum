import { v } from "convex/values";
import { internalMutation, mutation } from "./_generated/server";
import { internal } from "./_generated/api";

export const completeOnboardingStep = mutation({
  args: {
    step: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);
    if (!user) {
      throw new Error("User not authenticated");
    }

    // Update onboarding step
    await ctx.db.patch(user._id, {
      onboardingStep: args.step,
    });

    // Award "Welcome" on the first step
    if (args.step === 1) {
      await ctx.runMutation(internal.badges.awardBadge, {
        userId: user._id,
        badgeSlug: "welcome",
        reason: "Completed first onboarding step",
      });
    }

    // Award "Profile Complete" badge for completing profile step.
    if (args.step === 1) {
      await ctx.runMutation(internal.badges.awardBadge, {
        userId: user._id,
        badgeSlug: "profile_complete",
        reason: `Completed onboarding step ${args.step}`,
      });
    }
  },
});

export const completeOnboardingStepInternal = internalMutation({
  args: {
    step: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);
    if (!user) {
      throw new Error("User not authenticated");
    }

    // Update onboarding step
    await ctx.db.patch(user._id, {
      onboardingStep: args.step,
    });

    // Award badges
    if (args.step === 1) {
      await ctx.runMutation(internal.badges.awardBadge, {
        userId: user._id,
        badgeSlug: "welcome",
        reason: "Completed first onboarding step",
      });
      
      await ctx.runMutation(internal.badges.awardBadge, {
        userId: user._id,
        badgeSlug: "profile_complete",
        reason: `Completed onboarding step ${args.step}`,
      });
    }
  },
});