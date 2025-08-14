import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { Doc } from "./_generated/dataModel";

export const backfillOnboardingHabits = action({
   args: {},
   handler: async (ctx): Promise<string> => {
       const user: Doc<"users"> | null = await ctx.runQuery(internal.users.getCurrentUser);
       if (!user) {
           return "ERROR: No authenticated user found.";
       }

       const goals: Doc<"dailyGoals">[] = await ctx.runQuery(internal.goals.getAllForUser);
       if (!goals || goals.length === 0) {
           return "No past goals found to create habits from.";
       }

       console.log(`Found ${goals.length} goals for user ${user._id}. Converting to habits.`);

       for (const goal of goals) {
           try {
               await ctx.runMutation(internal.habits.createHabitFromGoal, {
                   userId: user._id,
                   title: goal.title,
                   categorySlug: goal.category,
               });
           } catch (e) {
               console.error(`Failed to create habit for goal: ${goal.title}`, e);
           }
       }

       return `Successfully processed ${goals.length} goals. Please refresh the Habits page.`;
   }
});