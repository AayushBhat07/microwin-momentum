import { internalMutation } from "./_generated/server";

const badgeData = [
  // Win-based badges
  { name: "First Win", description: "Log your very first achievement.", slug: "first_win", family: "wins", threshold: 1, icon_url: "/badges/wins/1.png", points: 10, rarity: "common" },
  { name: "10 Wins", description: "Log 10 achievements.", slug: "wins_10", family: "wins", threshold: 10, icon_url: "/badges/wins/10.png", points: 50, rarity: "common" },
  { name: "50 Wins", description: "Log 50 achievements.", slug: "wins_50", family: "wins", threshold: 50, icon_url: "/badges/wins/50.png", points: 100, rarity: "rare" },
  { name: "100 Wins", description: "Log 100 achievements.", slug: "wins_100", family: "wins", threshold: 100, icon_url: "/badges/wins/100.png", points: 200, rarity: "epic" },

  // Streak-based badges
  { name: "3-Day Streak", description: "Log an achievement for 3 days in a row.", slug: "streak_3", family: "streak", threshold: 3, icon_url: "/badges/streak/3.png", points: 30, rarity: "common" },
  { name: "7-Day Streak", description: "Keep the momentum for a full week.", slug: "streak_7", family: "streak", threshold: 7, icon_url: "/badges/streak/7.png", points: 70, rarity: "rare" },
  { name: "30-Day Streak", description: "A whole month of consistency!", slug: "streak_30", family: "streak", threshold: 30, icon_url: "/badges/streak/30.png", points: 300, rarity: "legendary" },

  // Mode-based badges
  { name: "Photographer", description: "Log your first photo achievement.", slug: "photo_1", family: "mode", modeType: "photo", threshold: 1, icon_url: "/badges/mode/photo_1.png", points: 20, rarity: "common" },
  { name: "Shutterbug", description: "Log 10 photo achievements.", slug: "photo_10", family: "mode", modeType: "photo", threshold: 10, icon_url: "/badges/mode/photo_10.png", points: 100, rarity: "rare" },
  { name: "Podcaster", description: "Log your first voice achievement.", slug: "voice_1", family: "mode", modeType: "voice", threshold: 1, icon_url: "/badges/mode/voice_1.png", points: 20, rarity: "common" },
  { name: "Orator", description: "Log 10 voice achievements.", slug: "voice_10", family: "mode", modeType: "voice", threshold: 10, icon_url: "/badges/mode/voice_10.png", points: 100, rarity: "rare" },
  { name: "Scribe", description: "Log your first text achievement.", slug: "text_1", family: "mode", modeType: "text", threshold: 1, icon_url: "/badges/mode/text_1.png", points: 20, rarity: "common" },
  { name: "Author", description: "Log 10 text achievements.", slug: "text_10", family: "mode", modeType: "text", threshold: 10, icon_url: "/badges/mode/text_10.png", points: 100, rarity: "rare" },

  // Category-based badges (examples)
  { name: "Fitness Fanatic", description: "Log 5 fitness achievements.", slug: "category_fitness_5", family: "category", categorySlug: "fitness", threshold: 5, icon_url: "/badges/category/fitness.png", points: 50, rarity: "common" },
  { name: "Career Climber", description: "Log 5 work-related achievements.", slug: "category_work_5", family: "category", categorySlug: "work", threshold: 5, icon_url: "/badges/category/work.png", points: 50, rarity: "common" },
];

export const seedBadges = internalMutation({
  handler: async (ctx) => {
    // Clear existing badges to avoid duplicates during development
    const existingBadges = await ctx.db.query("badges").collect();
    await Promise.all(existingBadges.map(badge => ctx.db.delete(badge._id)));
    console.log(`Deleted ${existingBadges.length} existing badges.`);

    // Insert new badge data
    for (const badge of badgeData) {
      await ctx.db.insert("badges", { 
        ...badge, 
        family: badge.family as "wins" | "streak" | "category" | "mode",
        rarity: badge.rarity as "common" | "uncommon" | "rare" | "epic" | "legendary",
        modeType: badge.modeType as "quick" | "text" | "voice" | "photo" | undefined,
        isActive: true 
      });
    }
    console.log(`Seeded ${badgeData.length} new badges.`);
  },
});