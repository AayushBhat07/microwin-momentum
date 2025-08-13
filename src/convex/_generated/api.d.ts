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
import type * as auth_emailOtp from "../auth/emailOtp.js";
import type * as auth from "../auth.js";
import type * as badges from "../badges.js";
import type * as dailyGoals from "../dailyGoals.js";
import type * as files from "../files.js";
import type * as gamification from "../gamification.js";
import type * as goals from "../goals.js";
import type * as http from "../http.js";
import type * as logWin from "../logWin.js";
import type * as logWinHelpers from "../logWinHelpers.js";
import type * as memories from "../memories.js";
import type * as motivationalContent from "../motivationalContent.js";
import type * as onboarding from "../onboarding.js";
import type * as seed from "../seed.js";
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
  "auth/emailOtp": typeof auth_emailOtp;
  auth: typeof auth;
  badges: typeof badges;
  dailyGoals: typeof dailyGoals;
  files: typeof files;
  gamification: typeof gamification;
  goals: typeof goals;
  http: typeof http;
  logWin: typeof logWin;
  logWinHelpers: typeof logWinHelpers;
  memories: typeof memories;
  motivationalContent: typeof motivationalContent;
  onboarding: typeof onboarding;
  seed: typeof seed;
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
