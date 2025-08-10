import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getPhotoMemories = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const achievements = await ctx.db
      .query("achievements")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.neq(q.field("photoStorageId"), undefined))
      .order("desc")
      .take(10);

    const memoriesWithUrls = await Promise.all(
      achievements.map(async (achievement) => {
        const photoUrl = achievement.photoStorageId 
          ? await ctx.storage.getUrl(achievement.photoStorageId)
          : null;
        
        return {
          ...achievement,
          photoUrl,
        };
      })
    );

    return memoriesWithUrls.filter(memory => memory.photoUrl !== null);
  },
});
