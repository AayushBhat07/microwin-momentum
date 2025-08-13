import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { getCurrentUser } from "./users";

export const completeOnboardingStep = mutation({
  args: {
    step: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("User not authenticated");
    }

    // Update onboarding step
    await ctx.db.patch(user._id, {
      onboardingStep: args.step,
    });

    // Award "Welcome Aboard" on the first step
    if (args.step === 1) {
      await ctx.runMutation(internal.badges.awardBadge, {
        userId: user._id,
        badgeSlug: "welcome-aboard",
        reason: "Completed first onboarding step",
      });
    }

    // Award badges for completing steps
    const badgeNames: { [key:number]: string } = {
      1: "Profile Master",
      2: "Self-Care Champion",
      3: "Ready for Action",
      4: "Achievement Scholar",
      5: "Customization Master",
    };

    const badgeName = badgeNames[args.step];
    if (badgeName) {
      const badgeSlug = badgeName.toLowerCase().replace(/\s+/g, "-");
      await ctx.runMutation(internal.badges.awardBadge, {
        userId: user._id,
        badgeSlug,
        reason: `Completed onboarding step ${args.step}`,
      });
    }
  },
});