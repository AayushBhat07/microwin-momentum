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
import type * as dailyGoals from "../dailyGoals.js";
import type * as http from "../http.js";
import type * as motivationalContent from "../motivationalContent.js";
import type * as seedData from "../seedData.js";
import type * as userStats from "../userStats.js";
import type * as users from "../users.js";

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
  dailyGoals: typeof dailyGoals;
  http: typeof http;
  motivationalContent: typeof motivationalContent;
  seedData: typeof seedData;
  userStats: typeof userStats;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
