import { toast } from "sonner";

interface LogResponse {
  achievement: any;
  pointsEarned: number;
  newStreak: number;
  totalPoints: number;
  totalAchievements: number;
  unlockedBadges: any[];
}

export function postLogSuccess(logResponse: LogResponse) {
  const { achievement, pointsEarned, newStreak, totalPoints, totalAchievements, unlockedBadges } = logResponse;

  // Show success toast
  toast.success(`Achievement logged! +${pointsEarned} points`, {
    description: achievement.title,
  });

  // Show badge celebrations if any badges were unlocked
  if (unlockedBadges?.length > 0) {
    unlockedBadges.forEach((badge) => {
      toast.success(`🏆 Badge Unlocked: ${badge.name}!`, {
        description: badge.description,
        duration: 5000,
      });
    });
  }

  // Trigger custom events for component updates
  window.dispatchEvent(new CustomEvent('achievementLogged', {
    detail: {
      achievement,
      pointsEarned,
      newStreak,
      totalPoints,
      totalAchievements,
      unlockedBadges
    }
  }));

  // Trigger heatmap pulse animation
  window.dispatchEvent(new CustomEvent('heatmapPulse', {
    detail: {
      date: new Date(achievement.loggedAt).toISOString().split('T')[0],
      points: pointsEarned
    }
  }));
}
