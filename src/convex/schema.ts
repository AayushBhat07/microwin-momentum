import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

// Achievement categories
export const ACHIEVEMENT_CATEGORIES = {
  HEALTH: "health",
  WORK: "work", 
  PERSONAL: "personal",
  SOCIAL: "social",
  LEARNING: "learning",
  CREATIVITY: "creativity",
  OTHER: "other",
} as const;

export const categoryValidator = v.union(
  v.literal(ACHIEVEMENT_CATEGORIES.HEALTH),
  v.literal(ACHIEVEMENT_CATEGORIES.WORK),
  v.literal(ACHIEVEMENT_CATEGORIES.PERSONAL),
  v.literal(ACHIEVEMENT_CATEGORIES.SOCIAL),
  v.literal(ACHIEVEMENT_CATEGORIES.LEARNING),
  v.literal(ACHIEVEMENT_CATEGORIES.CREATIVITY),
  v.literal(ACHIEVEMENT_CATEGORIES.OTHER),
);

export type Category = Infer<typeof categoryValidator>;

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

      role: v.optional(roleValidator), // role of the user. do not remove
      
      // MicroWin specific fields
      totalPoints: v.optional(v.number()),
      currentStreak: v.optional(v.number()),
      longestStreak: v.optional(v.number()),
      level: v.optional(v.number()),
      bio: v.optional(v.string()),
      isPublic: v.optional(v.boolean()),
    }).index("email", ["email"]), // index for the email. do not remove or modify

    // Achievements/MicroWins table
    achievements: defineTable({
      userId: v.id("users"),
      title: v.string(),
      description: v.optional(v.string()),
      category: categoryValidator,
      points: v.number(),
      isPublic: v.boolean(),
      celebrationCount: v.optional(v.number()),
      completedAt: v.number(),
    })
      .index("by_user", ["userId"])
      .index("by_user_and_date", ["userId", "completedAt"])
      .index("by_public_and_date", ["isPublic", "completedAt"])
      .index("by_category", ["category"]),

    // Celebrations (likes/reactions to achievements)
    celebrations: defineTable({
      achievementId: v.id("achievements"),
      userId: v.id("users"),
      type: v.union(v.literal("celebrate"), v.literal("inspire"), v.literal("motivate")),
    })
      .index("by_achievement", ["achievementId"])
      .index("by_user", ["userId"])
      .index("by_achievement_and_user", ["achievementId", "userId"]),

    // Comments on achievements
    comments: defineTable({
      achievementId: v.id("achievements"),
      userId: v.id("users"),
      content: v.string(),
    })
      .index("by_achievement", ["achievementId"])
      .index("by_user", ["userId"]),

    // Daily goals/intentions
    dailyGoals: defineTable({
      userId: v.id("users"),
      title: v.string(),
      description: v.optional(v.string()),
      category: categoryValidator,
      targetDate: v.number(),
      isCompleted: v.boolean(),
      completedAt: v.optional(v.number()),
    })
      .index("by_user", ["userId"])
      .index("by_user_and_date", ["userId", "targetDate"])
      .index("by_user_and_completed", ["userId", "isCompleted"]),

    // Motivational quotes/messages
    motivationalContent: defineTable({
      content: v.string(),
      author: v.optional(v.string()),
      category: v.optional(categoryValidator),
      isActive: v.boolean(),
    })
      .index("by_active", ["isActive"])
      .index("by_category", ["category"]),

    // User streaks and statistics
    userStats: defineTable({
      userId: v.id("users"),
      date: v.string(), // YYYY-MM-DD format
      achievementsCount: v.number(),
      pointsEarned: v.number(),
      goalsCompleted: v.number(),
    })
      .index("by_user", ["userId"])
      .index("by_user_and_date", ["userId", "date"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;