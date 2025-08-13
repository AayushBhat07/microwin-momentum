import { toast } from "sonner";
import { Doc } from "@/convex/_generated/dataModel";

type LogResult = {
  success: boolean;
  achievement: Doc<"achievements">;
  totals: Doc<"user_totals"> | null;
  streak: Doc<"user_streaks"> | null;
  badges_unlocked: Doc<"badges">[];
};

export const postLogSuccess = (result: LogResult) => {
  console.log("postLogSuccess received result:", result);

  // Basic success toast
  toast.success(`Achievement logged: "${result.achievement.title}"`, {
    description: `+${result.achievement.pointsEarned} points!`,
  });

  // Celebrate unlocked badges
  if (result.badges_unlocked && result.badges_unlocked.length > 0) {
    result.badges_unlocked.forEach((badge, index) => {
      setTimeout(() => {
        toast.success("✨ New Badge Unlocked! ✨", {
          description: badge.name,
          icon: "🏆",
        });
      }, (index + 1) * 700); // Stagger notifications
    });
  }

  // TODO: Add query invalidation here for react-query or similar
  // For Convex, live queries should update automatically, but sometimes
  // a manual refetch might be needed if data is passed between components
  // without being part of a live query.
};