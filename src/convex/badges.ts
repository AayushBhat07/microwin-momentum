
import { internal } from "./_generated/api";
import { internalAction, internalMutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";

// --- Idempotent Badge Awarding ---
export const awardBadge = internalMutation({
  args: {
    userId: v.id("users"),
    badgeSlug: v.string(),
    reason: v.optional(v.string()), // For logging/auditing
  },
  handler: async (ctx, { userId, badgeSlug, reason }) => {
    const existing = await ctx.db
      .query("userBadges")
      .withIndex("by_user_and_badge", (q) =>
        q.eq("userId", userId).eq("badgeSlug", badgeSlug)
      )
      .unique();

    if (existing) {
      return null; // Already awarded
    }

    const badge = await ctx.db
      .query("badges")
      .withIndex("by_slug", (q) => q.eq("slug", badgeSlug))
      .unique();

    if (!badge) {
      console.warn(`Badge with slug "${badgeSlug}" not found.`);
      return null;
    }

    await ctx.db.insert("userBadges", {
      userId,
      badgeSlug,
      earnedAt: Date.now(),
    });

    console.log(`Awarded badge "${badgeSlug}" to user ${userId}. Reason: ${reason}`);
    return badge;
  },
});

// --- Badge Evaluation Engine ---
// This action will be the central point for checking and awarding all badges.
export const checkAllBadges = internalAction({
    args: {
        userId: v.id("users"),
        // We can pass the context of the trigger, e.g., the new achievement
        achievement: v.optional(v.any()), 
    },
    handler: async (ctx, { userId, achievement }): Promise<Doc<"badges">[]> => {
        const newlyAwarded: Doc<"badges">[] = [];

        // In a full implementation, we would check all badge families here
        // based on the detailed rules provided in the prompt.
        // For now, this is a placeholder for the full engine.
        
        // Example: Check for "first_win" badge
        const userTotals = await ctx.runQuery(internal.users.getUserTotals, { userId });
        if (userTotals?.totalAchievements === 1) {
            const awarded: Doc<"badges"> | null = await ctx.runMutation(internal.badges.awardBadge, {
                userId,
                badgeSlug: "wins_1",
                reason: "First achievement logged",
            });
            if (awarded) newlyAwarded.push(awarded);
        }

        // The full engine would continue to check streaks, progress, categories, etc.

        return newlyAwarded;
    }
});

// --- Public APIs ---
export const getCatalog = query({
  handler: async (ctx) => {
    return await ctx.db.query("badges").filter(q => q.eq(q.field("isActive"), true)).collect();
  },
});

export const getUserBadges = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    // In a real app, you'd verify ownership or that the profile is public
    const userBadges = await ctx.db
      .query("userBadges")
      .withIndex("by_user_and_earned_at", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
    
    const badgeSlugs = userBadges.map(ub => ub.badgeSlug);
    const badgeDetails = await Promise.all(
        badgeSlugs.map(slug => ctx.db.query("badges").withIndex("by_slug", q => q.eq("slug", slug)).unique())
    );

    return userBadges.map((ub, i) => ({
        ...ub,
        details: badgeDetails[i]
    }));
  },
});