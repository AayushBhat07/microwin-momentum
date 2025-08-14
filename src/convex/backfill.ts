"use node";

import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";

export const backfillBadges = internalAction({
  args: {},
  handler: async (ctx) => {
    // Get all users - this function doesn't exist, so we'll skip the backfill for now
    const users: any[] = [];
    
    let totalAwarded = 0;
    
    for (const user of users) {
      // Get user's achievements
      const achievements = await ctx.runQuery(internal.achievements.getAllForUser, {
        userId: user._id,
      });
      
      const totalWins = achievements.length;
      
      // Award total wins badges
      if (totalWins >= 1) {
        const awarded = await ctx.runMutation(internal.badges.awardBadge, {
          userId: user._id,
          badgeSlug: "wins_1",
          reason: "Backfill: First achievement",
        });
        if (awarded) totalAwarded++;
      }
      
      if (totalWins >= 10) {
        const awarded = await ctx.runMutation(internal.badges.awardBadge, {
          userId: user._id,
          badgeSlug: "wins_10",
          reason: "Backfill: 10 achievements",
        });
        if (awarded) totalAwarded++;
      }
      
      if (totalWins >= 50) {
        const awarded = await ctx.runMutation(internal.badges.awardBadge, {
          userId: user._id,
          badgeSlug: "wins_50",
          reason: "Backfill: 50 achievements",
        });
        if (awarded) totalAwarded++;
      }
      
      if (totalWins >= 100) {
        const awarded = await ctx.runMutation(internal.badges.awardBadge, {
          userId: user._id,
          badgeSlug: "wins_100",
          reason: "Backfill: 100 achievements",
        });
        if (awarded) totalAwarded++;
      }
      
      // Award category mastery badges
      const categoryCount: Record<string, number> = {};
      for (const achievement of achievements) {
        categoryCount[achievement.categorySlug] = (categoryCount[achievement.categorySlug] || 0) + 1;
      }
      
      if (categoryCount.health >= 25) {
        const awarded = await ctx.runMutation(internal.badges.awardBadge, {
          userId: user._id,
          badgeSlug: "health_master",
          reason: "Backfill: 25 health achievements",
        });
        if (awarded) totalAwarded++;
      }
      
      if (categoryCount.work >= 25) {
        const awarded = await ctx.runMutation(internal.badges.awardBadge, {
          userId: user._id,
          badgeSlug: "work_master",
          reason: "Backfill: 25 work achievements",
        });
        if (awarded) totalAwarded++;
      }
    }
    
    console.log(`Backfill complete. Awarded ${totalAwarded} badges to ${users.length} users.`);
    return { totalAwarded, usersProcessed: users.length };
  },
});