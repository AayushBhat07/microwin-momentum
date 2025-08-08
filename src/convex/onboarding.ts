import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { api } from "./_generated/api";
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
      2: "Ready for Action",
      3: "Achievement Scholar",
      4: "Customization Master",
    };

    const badgeName = badgeNames[args.step];
    if (badgeName) {
      await ctx.runMutation(api.badges.awardBadge, {
        userId: user._id,
        badgeName,
      });
    }
  },
});