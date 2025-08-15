import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const debugUserData = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return { error: "Not authenticated" };
    }

    // Get all achievements
    const achievements = await ctx.db
      .query("achievements")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Get user totals
    const userTotals = await ctx.db
      .query("user_totals")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    // Get earned badges
    const earnedBadges = await ctx.db
      .query("userBadges")
      .withIndex("by_user_and_badge", (q) => q.eq("userId", userId))
      .collect();

    return {
      userId,
      achievementCount: achievements.length,
      achievements: achievements.map(a => ({ title: a.title, loggedAt: a.loggedAt })),
      userTotals,
      earnedBadges: earnedBadges.map(b => b.badgeSlug),
    };
  },
});
