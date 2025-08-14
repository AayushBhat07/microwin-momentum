import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based as needed
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

// Achievement categories for the gamification system
export const ACHIEVEMENT_CATEGORIES = [
  { slug: "health", name: "Health & Fitness", basePoints: 20, colorHex: "#10b981", iconName: "Heart" },
  { slug: "work", name: "Work & Career", basePoints: 15, colorHex: "#3b82f6", iconName: "Briefcase" },
  { slug: "learning", name: "Learning & Growth", basePoints: 25, colorHex: "#8b5cf6", iconName: "BookOpen" },
  { slug: "social", name: "Social & Relationships", basePoints: 15, colorHex: "#f59e0b", iconName: "Users" },
  { slug: "creative", name: "Creative & Hobbies", basePoints: 20, colorHex: "#ef4444", iconName: "Palette" },
  { slug: "personal", name: "Personal Care", basePoints: 10, colorHex: "#06b6d4", iconName: "Sparkles" },
] as const;

export const categoryValidator = v.union(
  v.literal("health"),
  v.literal("work"),
  v.literal("learning"),
  v.literal("social"),
  v.literal("creative"),
  v.literal("personal"),
);

export const BADGE_FAMILIES = v.union(
  v.literal("wins"),
  v.literal("streak"),
  v.literal("category"),
  v.literal("variety"),
  v.literal("mode"),
  v.literal("onboarding"),
  v.literal("explore"),
  v.literal("community"),
  v.literal("event"),
  v.literal("admin")
);

export const BADGE_RARITY = v.union(
  v.literal("common"),
  v.literal("uncommon"),
  v.literal("rare"),
  v.literal("epic"),
  v.literal("legendary")
);

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
    timezone: v.optional(v.string()), // For timezone-aware streak calculation
    onboardingStep: v.optional(v.number()),
    wellnessSetupCompletedAt: v.optional(v.number()), // For re-entry wellness flow
    
    // Gamification fields
    totalPoints: v.optional(v.number()),
    totalAchievements: v.optional(v.number()),
    currentStreak: v.optional(v.number()),
    longestStreak: v.optional(v.number()),
  })
    .index("email", ["email"]) // index for the email. do not remove or modify
    .index("by_username", ["username"]),

  achievement_categories: defineTable({
    slug: v.string(),
    name: v.string(),
    basePoints: v.number(),
    colorHex: v.string(),
    iconName: v.string(),
    isActive: v.boolean(),
  }).index("by_slug", ["slug"]),

  achievements: defineTable({
    userId: v.id("users"),
    clientId: v.string(), // For idempotency and offline sync
    categorySlug: v.string(),
    category: categoryValidator, // Keep existing field
    title: v.string(),
    description: v.optional(v.string()),
    photoStorageId: v.optional(v.id("_storage")),
    audioStorageId: v.optional(v.id("_storage")),
    pointsEarned: v.number(),
    points: v.number(), // Keep existing field
    source: v.union(
      v.literal("quick"),
      v.literal("text"),
      v.literal("voice"),
      v.literal("photo"),
    ),
    tags: v.optional(v.array(v.string())),
    isOffline: v.optional(v.boolean()),
    isPublic: v.boolean(), // Keep existing field
    loggedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_client_id", ["userId", "clientId"]),

  user_streaks: defineTable({
    userId: v.id("users"),
    currentStreak: v.number(),
    longestStreak: v.number(),
    lastActivityDate: v.string(), // YYYY-MM-DD format
    streakStartDate: v.string(), // YYYY-MM-DD format
  }).index("by_user", ["userId"]),

  wellnessIntake: defineTable({
    userId: v.id("users"),
    challenges: v.array(v.string()),
    intensities: v.record(v.string(), v.number()),
    notes: v.optional(v.string()),
    privacyFlag: v.boolean(),
  }).index("by_user", ["userId"]),

  userPresets: defineTable({
    userId: v.id("users"),
    title: v.string(),
    categorySlug: v.string(),
    effortMinutes: v.number(),
    defaultPrivate: v.boolean(),
    source: v.union(
      v.literal("onboarding"),
      v.literal("custom"),
      v.literal("system")
    ),
  })
  .index("by_user", ["userId"])
  .index("by_user_and_source", ["userId", "source"])
  .index("by_user_and_title", ["userId", "title"]),

  user_totals: defineTable({
    userId: v.id("users"),
    totalPoints: v.number(),
    totalAchievements: v.number(),
    lastPointsUpdateAt: v.number(),
  }).index("by_user", ["userId"]),

  user_preferences: defineTable({
    userId: v.id("users"),
    reducedMotion: v.boolean(),
    soundEnabled: v.boolean(),
    pushEnabled: v.boolean(),
  }).index("by_user", ["userId"]),

  badges: defineTable({
    slug: v.string(),
    name: v.string(),
    description: v.string(),
    icon_url: v.string(), // Lucide icon name or URL
    family: BADGE_FAMILIES,
    modeType: v.optional(v.union(v.literal("photo"), v.literal("voice"), v.literal("text"), v.literal("quick"))),
    categorySlug: v.optional(v.string()), // For category mastery badges
    threshold: v.optional(v.number()),
    window: v.optional(v.union(v.literal("7d"), v.literal("14d"), v.literal("30d"), v.literal("month"))),
    rarity: BADGE_RARITY,
    isActive: v.boolean(),
  }).index("by_slug", ["slug"]),

  userBadges: defineTable({
    userId: v.id("users"),
    badgeSlug: v.string(),
    earnedAt: v.number(),
    isFeatured: v.optional(v.boolean()),
  })
    .index("by_user_and_earned_at", ["userId", "earnedAt"])
    .index("by_user_and_badge", ["userId", "badgeSlug"]),

  userCategoryTotals: defineTable({
    userId: v.id("users"),
    categorySlug: v.string(),
    totalWins: v.number(),
  }).index("by_user_and_category", ["userId", "categorySlug"]),

  // Additional tables needed by existing code
  userStats: defineTable({
    userId: v.id("users"),
    date: v.string(), // YYYY-MM-DD format
    achievementsCount: v.number(),
    pointsEarned: v.number(),
    goalsCompleted: v.number(),
    // for badge rolling windows
    categories: v.array(v.string()),
    photoCount: v.number(),
  }).index("by_user_and_date", ["userId", "date"]),

  dailyGoals: defineTable({
    userId: v.id("users"),
    title: v.string(),
    description: v.optional(v.string()),
    category: categoryValidator,
    targetDate: v.string(), // Changed from v.number() to v.string() for date format
    isCompleted: v.boolean(),
    completedAt: v.optional(v.number()),
  })
    .index("by_user_and_date", ["userId", "targetDate"])
    .index("by_user", ["userId"]),

  motivationalContent: defineTable({
    content: v.string(),
    author: v.string(),
    category: categoryValidator,
    isActive: v.boolean(),
  }),

  motivationalQuotes: defineTable({
    quote: v.string(),
    author: v.string(),
  }),
},
{
  schemaValidation: false
});

export default schema;