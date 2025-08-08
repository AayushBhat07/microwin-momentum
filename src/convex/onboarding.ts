import { v } from "convex/values";
import { mutation } from "./_generated/server";
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

    // Award "Profile Pioneer" badge for completing step 1
    if (args.step === 1) {
      const existingBadge = await ctx.db
        .query("badges")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .filter((q) => q.eq(q.field("badgeName"), "Profile Pioneer"))
        .first();

      if (!existingBadge) {
        await ctx.db.insert("badges", {
          userId: user._id,
          badgeName: "Profile Pioneer",
          dateEarned: Date.now(),
        });
      }
    } else if (args.step === 2) {
      // Award "Ready for Action" badge for completing step 2
      const existingBadge = await ctx.db
        .query("badges")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .filter((q) => q.eq(q.field("badgeName"), "Ready for Action"))
        .first();
      
      if (!existingBadge) {
        await ctx.db.insert("badges", {
          userId: user._id,
          badgeName: "Ready for Action",
          dateEarned: Date.now(),
        });
      }
    } else if (args.step === 3) {
      // Award "Achievement Scholar" badge for completing step 3
      const existingBadge = await ctx.db
        .query("badges")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .filter((q) => q.eq(q.field("badgeName"), "Achievement Scholar"))
        .first();
      
      if (!existingBadge) {
        await ctx.db.insert("badges", {
          userId: user._id,
          badgeName: "Achievement Scholar",
          dateEarned: Date.now(),
        });
      }
    }
    
    // Future steps can award other badges here
  },
});