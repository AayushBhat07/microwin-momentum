import { internalMutation } from "./_generated/server";
import { BADGE_FAMILIES, BADGE_RARITY } from "./schema";

const badgeData = [
  // Onboarding
  {
    slug: "welcome-aboard",
    name: "Welcome Aboard!",
    description: "Completed the first step of onboarding.",
    icon: "Ship",
    family: "onboarding",
    rarity: "common",
    isActive: true,
  },
  {
    slug: "profile-master",
    name: "Profile Master",
    description: "Set up your user profile during onboarding.",
    icon: "UserCog",
    family: "onboarding",
    rarity: "common",
    isActive: true,
  },
  {
    slug: "self-care-champion",
    name: "Self-Care Champion",
    description: "Completed the wellness setup.",
    icon: "HeartHandshake",
    family: "onboarding",
    rarity: "common",
    isActive: true,
  },
  {
    slug: "ready-for-action",
    name: "Ready for Action",
    description: "Set your first goals during onboarding.",
    icon: "Goal",
    family: "onboarding",
    rarity: "common",
    isActive: true,
  },
  {
    slug: "achievement-scholar",
    name: "Achievement Scholar",
    description: "Learned about the different ways to log wins.",
    icon: "GraduationCap",
    family: "onboarding",
    rarity: "common",
    isActive: true,
  },
  {
    slug: "customization-master",
    name: "Customization Master",
    description: "Customized your app preferences.",
    icon: "Settings2",
    family: "onboarding",
    rarity: "common",
    isActive: true,
  },

  // Wins
  {
    slug: "wins_1",
    name: "First Victory",
    description: "Logged your first achievement.",
    icon: "Trophy",
    family: "wins",
    rarity: "common",
    threshold: 1,
    isActive: true,
  },
  {
    slug: "wins_10",
    name: "Getting Started",
    description: "Logged 10 achievements.",
    icon: "Milestone",
    family: "wins",
    rarity: "uncommon",
    threshold: 10,
    isActive: true,
  },
  {
    slug: "wins_50",
    name: "Dedicated Winner",
    description: "Logged 50 achievements.",
    icon: "Award",
    family: "wins",
    rarity: "rare",
    threshold: 50,
    isActive: true,
  },
  {
    slug: "wins_100",
    name: "Century Club",
    description: "Logged 100 achievements.",
    icon: "Crown",
    family: "wins",
    rarity: "epic",
    threshold: 100,
    isActive: true,
  },
];

export const seedBadges = internalMutation({
  handler: async (ctx) => {
    let seededCount = 0;
    let existingCount = 0;

    for (const badge of badgeData) {
      const existing = await ctx.db
        .query("badges")
        .withIndex("by_slug", (q) => q.eq("slug", badge.slug))
        .unique();

      if (!existing) {
        await ctx.db.insert("badges", {
          ...badge,
          family: badge.family as any, // Cast to any to satisfy validator
          rarity: badge.rarity as any, // Cast to any to satisfy validator
        });
        seededCount++;
      } else {
        existingCount++;
      }
    }
    console.log(`Seeded ${seededCount} new badges. ${existingCount} badges already existed.`);
  },
});