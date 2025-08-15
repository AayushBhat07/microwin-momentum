import { query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Doc, Id } from "./_generated/dataModel";

export type Memory = Doc<"achievements"> & {
  photoUrl: string | null;
  audioUrl: string | null;
};

export const getMemories = query({
  args: {},
  handler: async (ctx): Promise<Memory[]> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const achievements = await ctx.db
      .query("achievements")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .filter((q) =>
        q.or(
          q.neq(q.field("photoStorageId"), undefined),
          q.neq(q.field("audioStorageId"), undefined)
        )
      )
      .collect();

    const memories = await Promise.all(
      achievements.map(async (achievement) => {
        const photoUrl = achievement.photoStorageId
          ? await ctx.storage.getUrl(achievement.photoStorageId)
          : null;
        const audioUrl = achievement.audioStorageId
          ? await ctx.storage.getUrl(achievement.audioStorageId)
          : null;
        return {
          ...achievement,
          photoUrl,
          audioUrl,
        };
      })
    );

    // Sort with photos first, then audio, both newest to oldest
    return memories.sort((a, b) => {
        if (a.photoUrl && !b.photoUrl) return -1;
        if (!a.photoUrl && b.photoUrl) return 1;
        return b.loggedAt - a.loggedAt;
    });
  },
});

export const getPhotoMemory = query({
    args: {
        storageId: v.id("_storage")
    },
    handler: async (ctx, { storageId }) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return null;

        const achievement = await ctx.db.query("achievements")
            .withIndex("by_user", q => q.eq("userId", userId))
            .filter(q => q.eq(q.field("photoStorageId"), storageId))
            .first();

        if (!achievement) return null;

        const photoUrl = await ctx.storage.getUrl(storageId);

        return {
            ...achievement,
            photoUrl
        }
    }
})