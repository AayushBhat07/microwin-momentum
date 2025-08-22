/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as achievements from "../achievements.js";
import type * as ai from "../ai.js";
import type * as aiGoalGeneration from "../aiGoalGeneration.js";
import type * as aiPlanning from "../aiPlanning.js";
import type * as aiPlanningMutations from "../aiPlanningMutations.js";
import type * as auth_emailOtp from "../auth/emailOtp.js";
import type * as auth from "../auth.js";
import type * as awardEngine from "../awardEngine.js";
import type * as backfill from "../backfill.js";
import type * as backfillOnboardingBadges from "../backfillOnboardingBadges.js";
import type * as badges from "../badges.js";
import type * as crons from "../crons.js";
import type * as dailyGoals from "../dailyGoals.js";
import type * as debug from "../debug.js";
import type * as debugBadges from "../debugBadges.js";
import type * as files from "../files.js";
import type * as gamification from "../gamification.js";
import type * as goals from "../goals.js";
import type * as habits from "../habits.js";
import type * as http from "../http.js";
import type * as logWin from "../logWin.js";
import type * as logWinHelpers from "../logWinHelpers.js";
import type * as memories from "../memories.js";
import type * as migrations from "../migrations.js";
import type * as moodTracking from "../moodTracking.js";
import type * as motivationalContent from "../motivationalContent.js";
import type * as onboarding from "../onboarding.js";
import type * as seed from "../seed.js";
import type * as seedBadges from "../seedBadges.js";
import type * as seedData from "../seedData.js";
import type * as userProfile from "../userProfile.js";
import type * as userStats from "../userStats.js";
import type * as users from "../users.js";
import type * as wellness from "../wellness.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  achievements: typeof achievements;
  ai: typeof ai;
  aiGoalGeneration: typeof aiGoalGeneration;
  aiPlanning: typeof aiPlanning;
  aiPlanningMutations: typeof aiPlanningMutations;
  "auth/emailOtp": typeof auth_emailOtp;
  auth: typeof auth;
  awardEngine: typeof awardEngine;
  backfill: typeof backfill;
  backfillOnboardingBadges: typeof backfillOnboardingBadges;
  badges: typeof badges;
  crons: typeof crons;
  dailyGoals: typeof dailyGoals;
  debug: typeof debug;
  debugBadges: typeof debugBadges;
  files: typeof files;
  gamification: typeof gamification;
  goals: typeof goals;
  habits: typeof habits;
  http: typeof http;
  logWin: typeof logWin;
  logWinHelpers: typeof logWinHelpers;
  memories: typeof memories;
  migrations: typeof migrations;
  moodTracking: typeof moodTracking;
  motivationalContent: typeof motivationalContent;
  onboarding: typeof onboarding;
  seed: typeof seed;
  seedBadges: typeof seedBadges;
  seedData: typeof seedData;
  userProfile: typeof userProfile;
  userStats: typeof userStats;
  users: typeof users;
  wellness: typeof wellness;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
