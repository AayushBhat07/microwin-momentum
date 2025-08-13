import { internalMutation } from "./_generated/server";

export const seedBadges = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Check if badges already exist
    const existingBadges = await ctx.db.query("badges").first();
    if (existingBadges) {
      console.log("Badges already seeded");
      return;
    }

    const badges = [
      // Total Wins Badges
      {
        slug: "wins_1",
        name: "First Victory",
        description: "Log your first achievement",
        icon: "🎯",
        family: "wins" as const,
        threshold: 1,
        rarity: "common" as const,
        isActive: true,
      },
      {
        slug: "wins_10",
        name: "Getting Started",
        description: "Log 10 achievements",
        icon: "🚀",
        family: "wins" as const,
        threshold: 10,
        rarity: "common" as const,
        isActive: true,
      },
      {
        slug: "wins_50",
        name: "Achiever",
        description: "Log 50 achievements",
        icon: "⭐",
        family: "wins" as const,
        threshold: 50,
        rarity: "uncommon" as const,
        isActive: true,
      },
      {
        slug: "wins_100",
        name: "Century Club",
        description: "Log 100 achievements",
        icon: "💯",
        family: "wins" as const,
        threshold: 100,
        rarity: "rare" as const,
        isActive: true,
      },
      // Category Mastery Badges
      {
        slug: "health_master",
        name: "Health Master",
        description: "Log 25 health achievements",
        icon: "❤️",
        family: "category" as const,
        categorySlug: "health",
        threshold: 25,
        rarity: "uncommon" as const,
        isActive: true,
      },
      {
        slug: "work_master",
        name: "Work Master",
        description: "Log 25 work achievements",
        icon: "💼",
        family: "category" as const,
        categorySlug: "work",
        threshold: 25,
        rarity: "uncommon" as const,
        isActive: true,
      },
    ];

    for (const badge of badges) {
      await ctx.db.insert("badges", badge);
    }

    console.log(`Seeded ${badges.length} badges`);
  },
});