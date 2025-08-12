import { test } from "convex/server";
import { internal } from "./_generated/api";
import { ROLES } from "./schema";

// Initialize the testing environment
const setup = async (ctx: any) => {
  await ctx.runMutation(internal.users.create, {
    email: "test@example.com",
    role: ROLES.USER,
  });
  const user = await ctx.runQuery(internal.users.get, {
    email: "test@example.com",
  });
  if (!user) throw new Error("Test user not found");
  return { user };
};

test("should award a badge to a user", async (ctx) => {
  const { user } = await setup(ctx);

  // Award the 'first-win' badge
  await ctx.runMutation(internal.badges.awardBadge, {
    userId: user._id,
    badgeSlug: "first-win",
  });

  // Verify the badge was awarded
  const userBadges = await ctx.db
    .query("userBadges")
    .withIndex("by_user_and_badge", (q) =>
      q.eq("userId", user._id).eq("badgeSlug", "first-win")
    )
    .collect();

  // Assert that the user has exactly one 'first-win' badge
  expect(userBadges.length).toBe(1);
  expect(userBadges[0].badgeSlug).toBe("first-win");
});

test("should not award a duplicate badge", async (ctx) => {
  const { user } = await setup(ctx);

  // Award the badge twice
  await ctx.runMutation(internal.badges.awardBadge, {
    userId: user._id,
    badgeSlug: "first-win",
  });
  await ctx.runMutation(internal.badges.awardBadge, {
    userId: user._id,
    badgeSlug: "first-win",
  });

  // Verify only one badge was awarded
  const userBadges = await ctx.db
    .query("userBadges")
    .withIndex("by_user_and_badge", (q) =>
      q.eq("userId", user._id).eq("badgeSlug", "first-win")
    )
    .collect();

  // Assert that the user still only has one badge
  expect(userBadges.length).toBe(1);
});
