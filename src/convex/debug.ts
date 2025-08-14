import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * A debug query to fetch all badge and stat-related information for the
 * currently logged-in user. This helps diagnose why badges are not being
 * awarded.
 */
export const getMyStatsAndBadgesForDebugging = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            return "USER NOT AUTHENTICATED - Please log in to the application before running this query.";
        }

        const user = await ctx.db.get(userId);
        if (!user) {
            return `USER NOT FOUND IN 'users' TABLE - ID: ${userId}`;
        }

        // 1. Get all badges the user has earned
        const earnedBadges = await ctx.db
            .query("userBadges")
            .withIndex("by_user_and_badge", (q) => q.eq("userId", userId))
            .collect();

        // 2. Get the user's aggregate stats
        const userTotals = await ctx.db
            .query("user_totals")
            .withIndex("by_user", q => q.eq("userId", userId))
            .unique();
        
        // 3. Get the user's streak info
        const userStreak = await ctx.db
            .query("user_streaks")
            .withIndex("by_user", q => q.eq("userId", userId))
            .unique();

        return {
            message: "Successfully fetched debug data. Please copy this entire object and paste it in the chat.",
            userId: user._id,
            userEmail: user.email,
            stats: {
                totals: userTotals,
                streak: userStreak,
            },
            earnedBadges: {
                count: earnedBadges.length,
                badges: earnedBadges,
            }
        };
    },
});
