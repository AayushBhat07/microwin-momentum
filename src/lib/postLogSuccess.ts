import { toast } from "sonner";
import { Doc } from "@/convex/_generated/dataModel";

interface LogResponse {
  achievement: Doc<"achievements">;
  totals: Doc<"user_totals"> | null;
  streak: Doc<"user_streaks"> | null;
  unlockedBadges: Doc<"badges">[];
}

export function postLogSuccess(logResponse: LogResponse) {
  const { achievement, unlockedBadges } = logResponse;

  // Show success toast for the achievement
  toast.success(`Achievement logged! +${achievement.pointsEarned} points`, {
    description: achievement.title,
  });

  // Show badge celebrations if any badges were unlocked
  if (unlockedBadges?.length > 0) {
    // Use a timeout to stagger the badge announcements
    setTimeout(() => {
      unlockedBadges.forEach((badge, index) => {
        setTimeout(() => {
          toast.success(`🏆 Badge Unlocked: ${badge.name}!`, {
            description: badge.description,
            duration: 5000,
            icon: '🎉',
          });
        }, index * 1500); // Stagger each badge toast
      });
    }, 1000); // Initial delay after the main achievement toast
  }

  // Convex's reactivity handles UI updates automatically.
  // We can still fire events if needed for non-reactive components or animations.
  
  // Trigger heatmap pulse animation
  window.dispatchEvent(new CustomEvent('heatmapPulse', {
    detail: {
      date: new Date(achievement.loggedAt).toISOString().split('T')[0],
      points: achievement.pointsEarned
    }
  }));
}