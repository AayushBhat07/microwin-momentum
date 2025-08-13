import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

const badgeData = [
  // 1. Total Wins (Progress)
  { slug: "wins_1", name: "First Win!", description: "Log your very first win.", icon: "Award", family: "wins", threshold: 1, rarity: "common", isActive: true },
  { slug: "wins_10", name: "Win Collector", description: "Log 10 wins.", icon: "Medal", family: "wins", threshold: 10, rarity: "common", isActive: true },
  { slug: "wins_25", name: "Winning Habit", description: "Log 25 wins.", icon: "Medal", family: "wins", threshold: 25, rarity: "common", isActive: true },
  { slug: "wins_50", name: "Serious Winner", description: "Log 50 wins.", icon: "Trophy", family: "wins", threshold: 50, rarity: "uncommon", isActive: true },
  { slug: "wins_100", name: "Centurion", description: "Log 100 wins.", icon: "Trophy", family: "wins", threshold: 100, rarity: "uncommon", isActive: true },
  { slug: "wins_250", name: "Win Machine", description: "Log 250 wins.", icon: "Gem", family: "wins", threshold: 250, rarity: "rare", isActive: true },
  { slug: "wins_500", name: "Victory Incarnate", description: "Log 500 wins.", icon: "Gem", family: "wins", threshold: 500, rarity: "rare", isActive: true },
  { slug: "wins_1000", name: "Legend of Winning", description: "Log 1,000 wins.", icon: "Crown", family: "wins", threshold: 1000, rarity: "epic", isActive: true },

  // 2. Streaks (Daily Consistency)
  { slug: "streak_3", name: "On a Roll", description: "Maintain a 3-day streak.", icon: "Flame", family: "streak", threshold: 3, rarity: "common", isActive: true },
  { slug: "streak_7", name: "Week of Wins", description: "Maintain a 7-day streak.", icon: "Flame", family: "streak", threshold: 7, rarity: "uncommon", isActive: true },
  { slug: "streak_14", name: "Fortnight of Fire", description: "Maintain a 14-day streak.", icon: "Flame", family: "streak", threshold: 14, rarity: "uncommon", isActive: true },
  { slug: "streak_30", name: "Monthly Momentum", description: "Maintain a 30-day streak.", icon: "Flame", family: "streak", threshold: 30, rarity: "rare", isActive: true },
  { slug: "streak_100", name: "100 Days of Dedication", description: "Maintain a 100-day streak.", icon: "Flame", family: "streak", threshold: 100, rarity: "epic", isActive: true },
  { slug: "streak_365", name: "Year of Victory", description: "Maintain a 365-day streak.", icon: "Flame", family: "streak", threshold: 365, rarity: "epic", isActive: true },

  // 3. Category Mastery
  { slug: "health_10", name: "Health Novice", description: "Log 10 Health & Fitness wins.", icon: "Heart", family: "category", categorySlug: "health", threshold: 10, rarity: "common", isActive: true },
  { slug: "health_25", name: "Fitness Fanatic", description: "Log 25 Health & Fitness wins.", icon: "HeartPulse", family: "category", categorySlug: "health", threshold: 25, rarity: "uncommon", isActive: true },
  { slug: "work_10", name: "Productivity Pro", description: "Log 10 Work & Career wins.", icon: "Briefcase", family: "category", categorySlug: "work", threshold: 10, rarity: "common", isActive: true },
  { slug: "work_25", name: "Career Captain", description: "Log 25 Work & Career wins.", icon: "Briefcase", family: "category", categorySlug: "work", threshold: 25, rarity: "uncommon", isActive: true },
  { slug: "learning_10", name: "Curious Mind", description: "Log 10 Learning & Growth wins.", icon: "BookOpen", family: "category", categorySlug: "learning", threshold: 10, rarity: "common", isActive: true },
  { slug: "learning_25", name: "Knowledge Seeker", description: "Log 25 Learning & Growth wins.", icon: "BrainCircuit", family: "category", categorySlug: "learning", threshold: 25, rarity: "uncommon", isActive: true },
  { slug: "social_10", name: "Social Butterfly", description: "Log 10 Social wins.", icon: "Users", family: "category", categorySlug: "social", threshold: 10, rarity: "common", isActive: true },
  { slug: "social_25", name: "Relationship Rockstar", description: "Log 25 Social wins.", icon: "Users", family: "category", categorySlug: "social", threshold: 25, rarity: "uncommon", isActive: true },
  { slug: "creative_10", name: "Creative Spark", description: "Log 10 Creative wins.", icon: "Palette", family: "category", categorySlug: "creative", threshold: 10, rarity: "common", isActive: true },
  { slug: "creative_25", name: "Hobby Hero", description: "Log 25 Creative wins.", icon: "Palette", family: "category", categorySlug: "creative", threshold: 25, rarity: "uncommon", isActive: true },
  { slug: "personal_10", name: "Self-Care Starter", description: "Log 10 Personal Care wins.", icon: "Sparkles", family: "category", categorySlug: "personal", threshold: 10, rarity: "common", isActive: true },
  { slug: "personal_25", name: "Mindful Master", description: "Log 25 Personal Care wins.", icon: "Sparkles", family: "category", categorySlug: "personal", threshold: 25, rarity: "uncommon", isActive: true },

  // 4. Variety (Breadth)
  { slug: "variety_7d_3cats", name: "Versatile Victor", description: "Log wins in 3 different categories in 7 days.", icon: "Shapes", family: "variety", threshold: 3, window: "7d", rarity: "uncommon", isActive: true },
  { slug: "variety_14d_4cats", name: "Dynamic Dabbler", description: "Log wins in 4 different categories in 14 days.", icon: "Shapes", family: "variety", threshold: 4, window: "14d", rarity: "rare", isActive: true },
  { slug: "variety_month_5cats", name: "Jack of All Trades", description: "Log wins in 5 different categories in 30 days.", icon: "Shapes", family: "variety", threshold: 5, window: "30d", rarity: "epic", isActive: true },

  // 5. Mode/Medium (Exploration)
  { slug: "first_text", name: "Word Weaver", description: "Log your first win using text.", icon: "Type", family: "mode", rarity: "common", isActive: true },
  { slug: "first_voice", name: "Orator", description: "Log your first win using your voice.", icon: "Mic", family: "mode", rarity: "common", isActive: true },
  { slug: "first_photo", name: "Photographer", description: "Log your first win with a photo.", icon: "Camera", family: "mode", rarity: "common", isActive: true },
  { slug: "photo_7_in_30", name: "Shutterbug", description: "Log 7 wins with photos in 30 days.", icon: "Camera", family: "mode", threshold: 7, window: "30d", rarity: "rare", isActive: true },

  // 6. Onboarding/Starter
  { slug: "welcome", name: "Welcome Aboard!", description: "Create your account and start your journey.", icon: "Hand", family: "onboarding", rarity: "common", isActive: true },
  { slug: "profile_complete", name: "Identity Verified", description: "Complete your user profile.", icon: "UserCheck", family: "onboarding", rarity: "common", isActive: true },
  { slug: "first_win_onboarding", name: "Ready for Action", description: "Log your very first win during onboarding.", icon: "Rocket", family: "onboarding", rarity: "common", isActive: true },
  { slug: "streak_intro", name: "First Steps", description: "Set up your first daily goals.", icon: "Footprints", family: "onboarding", rarity: "common", isActive: true },

  // 7. Exploration/Feature Adoption
  { slug: "try_usersearch", name: "Explorer", description: "Use the user search feature for the first time.", icon: "Search", family: "explore", rarity: "common", isActive: true },
  { slug: "try_badgewall", name: "Trophy Hunter", description: "Visit your badge wall for the first time.", icon: "Shield", family: "explore", rarity: "common", isActive: true },
  { slug: "try_milestones", name: "Goal Setter", description: "Check out your milestones.", icon: "Flag", family: "explore", rarity: "common", isActive: true },

  // 8. Admin/Manual
  { slug: "spotlight_user", name: "Community Spotlight", description: "Awarded for outstanding community contributions.", icon: "Star", family: "admin", rarity: "epic", isActive: true },
  { slug: "community_hero", name: "Community Hero", description: "A special award for being a hero in the community.", icon: "HeartHandshake", family: "admin", rarity: "epic", isActive: true },
];

export const seedBadges = internalMutation({
  args: {},
  handler: async (ctx) => {
    const existingBadges = await ctx.db.query("badges").collect();
    if (existingBadges.length > 0) {
      console.log("Badges table is not empty, skipping seed.");
      return "Badges table already seeded.";
    }

    console.log(`Seeding ${badgeData.length} badges...`);
    for (const badge of badgeData) {
      await ctx.db.insert("badges", badge as any);
    }
    console.log("Badge seeding complete.");
    return `Seeded ${badgeData.length} badges.`;
  },
});