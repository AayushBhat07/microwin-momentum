import { mutation } from "./_generated/server";
import { internal } from "./_generated/api";

const badgeCatalog = [
  // Onboarding
  { slug: "welcome", name: "Welcome Aboard!", description: "Joined MicroWin Momentum.", icon: "Hand", category: "onboarding", rarity: "common", isActive: true },
  { slug: "profile_complete", name: "Identity Unlocked", description: "Completed your profile setup.", icon: "UserCheck", category: "onboarding", rarity: "common", isActive: true },
  { slug: "first_win", name: "First Victory", description: "Logged your very first achievement.", icon: "Sparkles", category: "onboarding", rarity: "uncommon", isActive: true },
  { slug: "streak_intro", name: "Fire Starter", description: "Learned about how streaks work.", icon: "Flame", category: "onboarding", rarity: "common", isActive: true },

  // Wins Milestones
  { slug: "wins_10", name: "Ten Wins", description: "Logged 10 achievements.", icon: "Award", category: "wins", threshold: 10, rarity: "common", isActive: true },
  { slug: "wins_25", name: "Quarter Century", description: "Logged 25 achievements.", icon: "Award", category: "wins", threshold: 25, rarity: "common", isActive: true },
  { slug: "wins_50", name: "Half Century", description: "Logged 50 achievements.", icon: "Award", category: "wins", threshold: 50, rarity: "uncommon", isActive: true },
  { slug: "wins_100", name: "Centurion", description: "Logged 100 achievements.", icon: "Shield", category: "wins", threshold: 100, rarity: "rare", isActive: true },
  { slug: "wins_250", name: "Momentum Master", description: "Logged 250 achievements.", icon: "ShieldCheck", category: "wins", threshold: 250, rarity: "epic", isActive: true },
  { slug: "wins_500", name: "Legendary", description: "Logged 500 achievements.", icon: "Crown", category: "wins", threshold: 500, rarity: "epic", isActive: true },

  // Streak Milestones
  { slug: "streak_3", name: "3-Day Streak", description: "Maintained a 3-day streak.", icon: "Flame", category: "streak", threshold: 3, rarity: "common", isActive: true },
  { slug: "streak_7", name: "7-Day Streak", description: "Maintained a 7-day streak.", icon: "Flame", category: "streak", threshold: 7, rarity: "uncommon", isActive: true },
  { slug: "streak_14", name: "14-Day Streak", description: "Maintained a 14-day streak.", icon: "Flame", category: "streak", threshold: 14, rarity: "rare", isActive: true },
  { slug: "streak_30", name: "30-Day Streak", description: "Maintained a 30-day streak.", icon: "Flame", category: "streak", threshold: 30, rarity: "epic", isActive: true },
  { slug: "streak_100", name: "100-Day Streak", description: "A true force of habit!", icon: "Flame", category: "streak", threshold: 100, rarity: "epic", isActive: true },

  // Category Mastery
  { slug: "category_mastery_health_20", name: "Health Hero", description: "Logged 20 wins in Health & Fitness.", icon: "Heart", category: "category", threshold: 20, rarity: "rare", isActive: true },
  { slug: "category_mastery_work_20", name: "Career Champion", description: "Logged 20 wins in Work & Career.", icon: "Briefcase", category: "category", threshold: 20, rarity: "rare", isActive: true },
  { slug: "category_mastery_learning_20", name: "Learning Luminary", description: "Logged 20 wins in Learning & Growth.", icon: "BookOpen", category: "category", threshold: 20, rarity: "rare", isActive: true },
  { slug: "category_mastery_social_20", name: "Social Star", description: "Logged 20 wins in Social & Relationships.", icon: "Users", category: "category", threshold: 20, rarity: "rare", isActive: true },
  { slug: "category_mastery_creative_20", name: "Creative Force", description: "Logged 20 wins in Creative & Hobbies.", icon: "Palette", category: "category", threshold: 20, rarity: "rare", isActive: true },
  { slug: "category_mastery_personal_20", name: "Self-Care Specialist", description: "Logged 20 wins in Personal Care.", icon: "Sparkles", category: "category", threshold: 20, rarity: "rare", isActive: true },

  // Mode/Story
  { slug: "voice_first", name: "Voice of Victory", description: "Logged your first win using your voice.", icon: "Mic", category: "mode", rarity: "uncommon", isActive: true },
  { slug: "photo_first", name: "Picture Perfect", description: "Logged your first win with a photo.", icon: "Camera", category: "mode", rarity: "uncommon", isActive: true },
  { slug: "photo_7_in_30", name: "Photographer", description: "Logged 7 photo wins in 30 days.", icon: "Images", category: "mode", threshold: 7, rarity: "rare", isActive: true },
];

export const seedBadges = mutation({
  handler: async (ctx) => {
    for (const badge of badgeCatalog) {
      const existing = await ctx.db
        .query("badges")
        .withIndex("by_slug", (q) => q.eq("slug", badge.slug))
        .unique();

      if (!existing) {
        await ctx.db.insert("badges", badge as any);
      }
    }
    return { success: true };
  },
});