import { mutation } from "./_generated/server";
import { ACHIEVEMENT_CATEGORIES } from "./schema";

export const seedCategories = mutation({
  handler: async (ctx) => {
    // Check if categories already exist to prevent duplicates
    const existing = await ctx.db.query("achievement_categories").first();
    if (existing) {
      return "Categories already seeded.";
    }

    for (const category of ACHIEVEMENT_CATEGORIES) {
      await ctx.db.insert("achievement_categories", {
        slug: category.slug,
        name: category.name,
        basePoints: category.basePoints,
        colorHex: category.colorHex,
        iconName: category.iconName,
        isActive: true,
      });
    }

    return "Seeded categories successfully.";
  },
});