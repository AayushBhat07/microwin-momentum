import { mutation } from "./_generated/server";
import { ACHIEVEMENT_CATEGORIES } from "./schema";

export const seedDatabase = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      const message = "Not authenticated. Cannot seed database.";
      console.error(message);
      return { success: false, message };
    }
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email!))
      .unique();

    if (!user) {
      const message = "User not found in database. Cannot seed.";
      console.error(message);
      return { success: false, message };
    }

    // Check if already seeded for this user
    const anyAchievement = await ctx.db.query("achievements").filter(q => q.eq(q.field("userId"), user._id)).first();
    if (anyAchievement) {
      const message = "Database already appears to be seeded for this user. Skipping.";
      console.log(message);
      return { success: true, message };
    }

    console.log("Seeding database with sample data for user:", user.email);

    // 1. Seed Achievements
    await ctx.db.insert("achievements", {
      userId: user._id,
      title: "Cleaned the entire kitchen",
      category: ACHIEVEMENT_CATEGORIES.PERSONAL,
      points: 20,
      isPublic: true,
    });
    await ctx.db.insert("achievements", {
      userId: user._id,
      title: "Went for a 30-minute run",
      category: ACHIEVEMENT_CATEGORIES.HEALTH,
      points: 15,
      isPublic: false,
    });
    await ctx.db.insert("achievements", {
      userId: user._id,
      title: "Finished a major work project ahead of schedule",
      category: ACHIEVEMENT_CATEGORIES.WORK,
      points: 50,
      isPublic: true,
    });
     await ctx.db.insert("achievements", {
      userId: user._id,
      title: "Read a chapter of a book",
      category: ACHIEVEMENT_CATEGORIES.LEARNING,
      points: 10,
      isPublic: true,
    });

    // 2. Seed Daily Goals
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    await ctx.db.insert("dailyGoals", {
      userId: user._id,
      title: "Drink 8 glasses of water",
      category: ACHIEVEMENT_CATEGORIES.HEALTH,
      targetDate: today.getTime(),
      isCompleted: false,
    });
    await ctx.db.insert("dailyGoals", {
      userId: user._id,
      title: "Write morning pages",
      category: ACHIEVEMENT_CATEGORIES.CREATIVITY,
      targetDate: today.getTime(),
      isCompleted: true,
      completedAt: today.getTime() - 3600 * 1000, // an hour ago
    });
    await ctx.db.insert("dailyGoals", {
      userId: user._id,
      title: "Review daily tasks",
      category: ACHIEVEMENT_CATEGORIES.WORK,
      targetDate: yesterday.getTime(),
      isCompleted: true,
      completedAt: yesterday.getTime(),
    });

    // 3. Seed User Stats for the last 7 days
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split("T")[0];

      await ctx.db.insert("userStats", {
        userId: user._id,
        date: dateString,
        achievementsCount: Math.floor(Math.random() * 5) + 1,
        pointsEarned: Math.floor(Math.random() * 50) + 10,
        goalsCompleted: Math.floor(Math.random() * 3),
      });
    }
    
    const message = "Database seeded successfully!";
    console.log(message);
    return { success: true, message };
  },
});