import { internalMutation } from "./_generated/server";

const badges = [
  {
    slug: "profile-pioneer",
    badgeName: "Profile Pioneer",
    description: "Completed the first step of onboarding by setting up your profile.",
    icon: "User",
    type: "special" as const,
  },
  {
    slug: "ready-for-action",
    badgeName: "Ready for Action",
    description: "Completed goal setting during onboarding.",
    icon: "Target",
    type: "special" as const,
  },
  {
    slug: "achievement-scholar",
    badgeName: "Achievement Scholar",
    description: "Learned about achievements during onboarding.",
    icon: "BookOpen",
    type: "special" as const,
  },
  {
    slug: "customization-master",
    badgeName: "Customization Master",
    description: "Set your preferences during onboarding.",
    icon: "Settings",
    type: "special" as const,
  },
];

export const seedBadges = internalMutation({
  handler: async (ctx) => {
    for (const badge of badges) {
      const existing = await ctx.db
        .query("badges")
        .withIndex("by_slug", (q) => q.eq("slug", badge.slug))
        .unique();

      if (!existing) {
        await ctx.db.insert("badges", badge);
      }
    }
    console.log("Badges have been seeded.");
  },
});