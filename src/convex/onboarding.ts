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

    // Award badges for completing steps
    const badgeNames: { [key: number]: string } = {
      1: "Profile Pioneer",
      2: "Self-Care Champion",
      3: "Ready for Action",
      4: "Achievement Scholar",
      5: "Customization Master",
    };

    const badgeName = badgeNames[args.step];
    if (badgeName) {
      const badgeSlug = badgeName.toLowerCase().replace(/\s+/g, '-');
      await ctx.runMutation(internal.badges.awardBadge, {
        userId: user._id,
        badgeSlug,
      });
    }
  },
});