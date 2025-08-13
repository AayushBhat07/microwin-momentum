import { internalMutation } from "./_generated/server";

const slugMapping: Record<string, string> = {
  "welcome-aboard": "welcome",
  "profile-master": "profile_complete",
  "wins_1": "first_win",
  "wins_10": "wins_10",
  "wins_50": "wins_50",
  "wins_100": "wins_100",
  // Add other mappings here if any other slugs changed.
  // The ones from the old seed file that are not in the new one are omitted.
};

export const syncBadgeSlugs = internalMutation({
  handler: async (ctx) => {
    let updatedCount = 0;
    for (const [oldSlug, newSlug] of Object.entries(slugMapping)) {
      const userBadgesToUpdate = await ctx.db
        .query("userBadges")
        .filter((q) => q.eq(q.field("badgeSlug"), oldSlug))
        .collect();

      for (const userBadge of userBadgesToUpdate) {
        await ctx.db.patch(userBadge._id, { badgeSlug: newSlug });
        updatedCount++;
      }
    }
    console.log(`Synced ${updatedCount} user badge slugs.`);
    return { updatedCount };
  },
});