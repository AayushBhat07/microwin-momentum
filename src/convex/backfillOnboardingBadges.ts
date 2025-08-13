import { internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";

export const backfillOnboardingBadges = internalMutation({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    let totalAwarded = 0;
    let usersProcessed = 0;

    for (const user of users) {
      if (user.onboardingStep && user.onboardingStep >= 1) {
        usersProcessed++;
        
        // Award "Welcome Aboard" badge
        const welcomeAwarded = await ctx.runMutation(internal.badges.awardBadge, {
          userId: user._id,
          badgeSlug: "welcome-aboard",
          reason: "Backfill: Completed onboarding",
        });
        if (welcomeAwarded) totalAwarded++;

        // Award "Profile Master" badge
        const profileAwarded = await ctx.runMutation(internal.badges.awardBadge, {
          userId: user._id,
          badgeSlug: "profile-master",
          reason: "Backfill: Completed profile setup",
        });
        if (profileAwarded) totalAwarded++;
      }
    }

    console.log(`Onboarding backfill complete. Awarded ${totalAwarded} badges to ${usersProcessed} users.`);
    return { totalAwarded, usersProcessed };
  },
});
