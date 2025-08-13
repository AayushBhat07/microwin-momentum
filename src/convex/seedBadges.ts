import { internalMutation } from "./_generated/server";

const badgeData = [
  // === PROGRESS: TOTAL WINS ===
  { "slug": "wins_10", "name": "10 Wins", "description": "Log 10 total wins.", "family": "wins", "threshold": 10, "rarity": "common", "icon_url": "/icons/wins_10.svg" },
  { "slug": "wins_25", "name": "25 Wins", "description": "Log 25 total wins.", "family": "wins", "threshold": 25, "rarity": "common", "icon_url": "/icons/wins_25.svg" },
  { "slug": "wins_50", "name": "50 Wins", "description": "Log 50 total wins.", "family": "wins", "threshold": 50, "rarity": "uncommon", "icon_url": "/icons/wins_50.svg" },
  { "slug": "wins_100", "name": "100 Wins", "description": "Log 100 total wins.", "family": "wins", "threshold": 100, "rarity": "rare", "icon_url": "/icons/wins_100.svg" },
  { "slug": "wins_250", "name": "250 Wins", "description": "Log 250 total wins.", "family": "wins", "threshold": 250, "rarity": "epic", "icon_url": "/icons/wins_250.svg" },
  { "slug": "wins_500", "name": "500 Wins", "description": "Log 500 total wins.", "family": "wins", "threshold": 500, "rarity": "epic", "icon_url": "/icons/wins_500.svg" },
  { "slug": "wins_1000", "name": "1000 Wins", "description": "Log 1000 total wins.", "family": "wins", "threshold": 1000, "rarity": "legendary", "icon_url": "/icons/wins_1000.svg" },

  // === STREAKS ===
  { "slug": "streak_3", "name": "3-Day Streak", "description": "Log wins 3 days in a row.", "family": "streak", "threshold": 3, "rarity": "common", "icon_url": "/icons/streak_3.svg" },
  { "slug": "streak_7", "name": "7-Day Streak", "description": "Log wins 7 days in a row.", "family": "streak", "threshold": 7, "rarity": "common", "icon_url": "/icons/streak_7.svg" },
  { "slug": "streak_14", "name": "14-Day Streak", "description": "Log wins 14 days in a row.", "family": "streak", "threshold": 14, "rarity": "uncommon", "icon_url": "/icons/streak_14.svg" },
  { "slug": "streak_30", "name": "30-Day Streak", "description": "Log wins 30 days in a row.", "family": "streak", "threshold": 30, "rarity": "rare", "icon_url": "/icons/streak_30.svg" },
  { "slug": "streak_100", "name": "100-Day Streak", "description": "Log wins 100 days in a row.", "family": "streak", "threshold": 100, "rarity": "epic", "icon_url": "/icons/streak_100.svg" },
  { "slug": "streak_365", "name": "Year Streak", "description": "Log wins 365 days in a row.", "family": "streak", "threshold": 365, "rarity": "legendary", "icon_url": "/icons/streak_365.svg" },

  // === CATEGORY MASTERY ===
  { "slug": "category_mastery_health_10", "name": "Health Mastery I", "description": "Log 10 Health wins.", "family": "category", "threshold": 10, "rarity": "common", "icon_url": "/icons/health_mastery_1.svg", "categorySlug": "health" },
  { "slug": "category_mastery_health_20", "name": "Health Mastery II", "description": "Log 20 Health wins.", "family": "category", "threshold": 20, "rarity": "uncommon", "icon_url": "/icons/health_mastery_2.svg", "categorySlug": "health" },
  { "slug": "category_mastery_health_50", "name": "Health Mastery III", "description": "Log 50 Health wins.", "family": "category", "threshold": 50, "rarity": "rare", "icon_url": "/icons/health_mastery_3.svg", "categorySlug": "health" },

  { "slug": "category_mastery_work_10", "name": "Work Mastery I", "description": "Log 10 Work wins.", "family": "category", "threshold": 10, "rarity": "common", "icon_url": "/icons/work_mastery_1.svg", "categorySlug": "work" },
  { "slug": "category_mastery_work_20", "name": "Work Mastery II", "description": "Log 20 Work wins.", "family": "category", "threshold": 20, "rarity": "uncommon", "icon_url": "/icons/work_mastery_2.svg", "categorySlug": "work" },
  { "slug": "category_mastery_work_50", "name": "Work Mastery III", "description": "Log 50 Work wins.", "family": "category", "threshold": 50, "rarity": "rare", "icon_url": "/icons/work_mastery_3.svg", "categorySlug": "work" },

  { "slug": "category_mastery_social_10", "name": "Social Mastery I", "description": "Log 10 Social wins.", "family": "category", "threshold": 10, "rarity": "common", "icon_url": "/icons/social_mastery_1.svg", "categorySlug": "social" },
  { "slug": "category_mastery_social_20", "name": "Social Mastery II", "description": "Log 20 Social wins.", "family": "category", "threshold": 20, "rarity": "uncommon", "icon_url": "/icons/social_mastery_2.svg", "categorySlug": "social" },
  { "slug": "category_mastery_social_50", "name": "Social Mastery III", "description": "Log 50 Social wins.", "family": "category", "threshold": 50, "rarity": "rare", "icon_url": "/icons/social_mastery_3.svg", "categorySlug": "social" },

  { "slug": "category_mastery_learning_10", "name": "Learning Mastery I", "description": "Log 10 Learning wins.", "family": "category", "threshold": 10, "rarity": "common", "icon_url": "/icons/learning_mastery_1.svg", "categorySlug": "learning" },
  { "slug": "category_mastery_learning_20", "name": "Learning Mastery II", "description": "Log 20 Learning wins.", "family": "category", "threshold": 20, "rarity": "uncommon", "icon_url": "/icons/learning_mastery_2.svg", "categorySlug": "learning" },
  { "slug": "category_mastery_learning_50", "name": "Learning Mastery III", "description": "Log 50 Learning wins.", "family": "category", "threshold": 50, "rarity": "rare", "icon_url": "/icons/learning_mastery_3.svg", "categorySlug": "learning" },

  // === VARIETY ===
  { "slug": "variety_7d_3cats", "name": "Variety Starter", "description": "Log wins in 3+ categories within 7 days.", "family": "variety", "threshold": 3, "rarity": "uncommon", "icon_url": "/icons/variety_7d.svg" },
  { "slug": "variety_14d_4cats", "name": "Variety Explorer", "description": "Log wins in 4+ categories within 14 days.", "family": "variety", "threshold": 4, "rarity": "rare", "icon_url": "/icons/variety_14d.svg" },
  { "slug": "variety_month_5cats", "name": "Variety Champion", "description": "Log wins in 5+ categories within a month.", "family": "variety", "threshold": 5, "rarity": "epic", "icon_url": "/icons/variety_month.svg" },

  // === MODE ===
  { "slug": "first_text", "name": "First Text Win", "description": "Log your first text win.", "family": "mode", "threshold": 1, "rarity": "common", "icon_url": "/icons/first_text.svg" },
  { "slug": "first_voice", "name": "First Voice Win", "description": "Log your first voice win.", "family": "mode", "threshold": 1, "rarity": "common", "icon_url": "/icons/first_voice.svg" },
  { "slug": "first_photo", "name": "First Photo Win", "description": "Log your first photo win.", "family": "mode", "threshold": 1, "rarity": "common", "icon_url": "/icons/first_photo.svg" },
  { "slug": "photo_7_in_30", "name": "Photo Enthusiast", "description": "Attach photos to 7 wins within 30 days.", "family": "mode", "threshold": 7, "rarity": "rare", "icon_url": "/icons/photo_7_in_30.svg" },

  // === ONBOARDING ===
  { "slug": "welcome", "name": "Welcome!", "description": "Join MicroWin.", "family": "onboarding", "threshold": null, "rarity": "common", "icon_url": "/icons/welcome.svg" },
  { "slug": "profile_complete", "name": "Profile Complete", "description": "Fill out your profile information.", "family": "onboarding", "threshold": null, "rarity": "common", "icon_url": "/icons/profile_complete.svg" },
  { "slug": "first_win", "name": "First Win", "description": "Log your first win.", "family": "onboarding", "threshold": 1, "rarity": "common", "icon_url": "/icons/first_win.svg" },
  { "slug": "streak_intro", "name": "Streak Starter", "description": "Log wins 2 days in a row.", "family": "onboarding", "threshold": 2, "rarity": "common", "icon_url": "/icons/streak_intro.svg" },

  // === EXPLORATION ===
  { "slug": "try_quicklog", "name": "Quick Logger", "description": "Use Quick Log for the first time.", "family": "explore", "threshold": 1, "rarity": "uncommon", "icon_url": "/icons/quicklog.svg" },
  { "slug": "try_usersearch", "name": "People Explorer", "description": "Search for another user.", "family": "explore", "threshold": 1, "rarity": "uncommon", "icon_url": "/icons/usersearch.svg" },
  { "slug": "try_badgewall", "name": "Badge Board Explorer", "description": "Open the Badge Wall.", "family": "explore", "threshold": 1, "rarity": "uncommon", "icon_url": "/icons/badgewall.svg" },
  { "slug": "try_milestones", "name": "Milestone Explorer", "description": "Open the Milestones page.", "family": "explore", "threshold": 1, "rarity": "uncommon", "icon_url": "/icons/milestones.svg" },

  // === COMMUNITY ===
  { "slug": "cheer_given_first", "name": "First Cheer Given", "description": "Send your first cheer to another user.", "family": "community", "threshold": 1, "rarity": "common", "icon_url": "/icons/cheer_given.svg" },
  { "slug": "cheer_received_first", "name": "First Cheer Received", "description": "Receive your first cheer from another user.", "family": "community", "threshold": 1, "rarity": "common", "icon_url": "/icons/cheer_received.svg" },
  { "slug": "kind_responder_10", "name": "Kind Responder", "description": "Give 10 cheers to others.", "family": "community", "threshold": 10, "rarity": "uncommon", "icon_url": "/icons/kind_responder.svg" }
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
          slug: badge.slug,
          name: badge.name,
          description: badge.description,
          icon_url: badge.icon_url,
          family: badge.family as any,
          rarity: badge.rarity as any,
          threshold: badge.threshold ?? undefined,
          categorySlug: badge.categorySlug,
          isActive: true,
        });
        seededCount++;
      } else {
        existingCount++;
      }
    }
    console.log(`Seeded ${seededCount} new badges. ${existingCount} badges already existed.`);
  },
});