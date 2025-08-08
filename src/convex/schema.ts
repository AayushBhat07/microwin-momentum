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

export const ACHIEVEMENT_CATEGORIES = {
  HEALTH: "HEALTH",
  WORK: "WORK",
  PERSONAL: "PERSONAL",
  SOCIAL: "SOCIAL",
  LEARNING: "LEARNING",
  CREATIVITY: "CREATIVITY",
  OTHER: "OTHER",
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
export type AchievementCategory = Infer<typeof categoryValidator>;

const schema = defineSchema({
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

    // User Profile & Gamification
    username: v.optional(v.string()),
    bio: v.optional(v.string()),
    totalPoints: v.optional(v.number()),
    currentStreak: v.optional(v.number()),
    longestStreak: v.optional(v.number()),
    lastLogin: v.optional(v.number()),
    onboardingStep: v.optional(v.number()),
  })
    .index("email", ["email"]) // index for the email. do not remove or modify
    .index("by_username", ["username"]),
  
  achievements: defineTable({
    userId: v.id("users"),
    title: v.string(),
    description: v.optional(v.string()),
    category: categoryValidator,
    points: v.number(),
    isPublic: v.boolean(),
  }).index("by_user", ["userId"]),

  badges: defineTable({
    userId: v.id("users"),
    badgeName: v.string(),
    dateEarned: v.number(),
  }).index("by_user", ["userId"]),

  dailyGoals: defineTable({
    userId: v.id("users"),
    title: v.string(),
    description: v.optional(v.string()),
    category: categoryValidator,
    targetDate: v.number(),
    isCompleted: v.boolean(),
    completedAt: v.optional(v.number()),
  }).index("by_user_and_date", ["userId", "targetDate"]),

  userStats: defineTable({
    userId: v.id("users"),
    date: v.string(), // YYYY-MM-DD
    achievementsCount: v.number(),
    pointsEarned: v.number(),
    goalsCompleted: v.number(),
  }).index("by_user_and_date", ["userId", "date"]),

  motivationalContent: defineTable({
    content: v.string(),
    author: v.optional(v.string()),
    category: categoryValidator,
    isActive: v.boolean(),
  })
    .index("by_active", ["isActive"])
    .index("by_category", ["category"]),

  motivationalQuotes: defineTable({
    quote: v.string(),
    author: v.optional(v.string()),
  }),

},
{
  schemaValidation: false
});

export default schema;