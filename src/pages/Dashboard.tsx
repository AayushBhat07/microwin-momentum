import { useAuth } from "@/hooks/use-auth";
import { Spinner } from "@/components/ui/spinner";
import { AuthButton } from "@/components/auth/AuthButton";
import { StatsOverview } from "@/components/dashboard/StatsOverview";
import { CreateAchievement } from "@/components/dashboard/CreateAchievement";
import { AchievementFeed } from "@/components/dashboard/AchievementFeed";
import { UserButton } from "@/components/auth/UserButton";
import { Sparkles } from "lucide-react";
import { useEffect } from "react";
import { MotivationalQuote } from "@/components/dashboard/MotivationalQuote";
import { DailyGoals } from "@/components/dashboard/DailyGoals";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate } from "react-router";
import { UserSearch } from "@/components/dashboard/UserSearch";
import { LogAchievementSheet } from "@/components/dashboard/LogAchievementSheet";

export default function Dashboard() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const updateLoginStreak = useMutation(api.userStats.updateLoginStreak);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      updateLoginStreak();
    }
  }, [isAuthenticated, updateLoginStreak]);

  useEffect(() => {
    // Redirect to onboarding if not completed. Now 4 steps total.
    if (user && (!user.onboardingStep || user.onboardingStep < 4)) {
      if (!user.onboardingStep || user.onboardingStep === 0) {
        navigate("/onboarding/profile");
      } else if (user.onboardingStep === 1) {
        navigate("/onboarding/goals");
      } else if (user.onboardingStep === 2) {
        navigate("/onboarding/achievements");
      } else if (user.onboardingStep === 3) {
        navigate("/onboarding/preferences");
      }
    }
  }, [user, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="h-12 w-12" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    // This part might be redundant due to the <Protected> wrapper,
    // but it's good for explicit handling and local development without the wrapper.
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <p>You need to sign in to access your dashboard.</p>
        <AuthButton />
      </div>
    );
  }
  
  // Render nothing or a loading indicator while redirecting
  if (!user.onboardingStep || user.onboardingStep < 4) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="h-12 w-12" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold tracking-tighter">MicroWin</span>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <CreateAchievement />
            <UserButton />
          </div>
        </div>
      </header>

      <main className="container py-8">
        <MotivationalQuote />
        <div className="mt-8">
          <StatsOverview />
        </div>

        <div className="mt-8 grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2">
            <AchievementFeed />
          </div>
          <div className="space-y-6">
            <DailyGoals />
            <UserSearch />
          </div>
        </div>
      </main>

      {/* Floating Action Button for Logging Achievements */}
      <LogAchievementSheet />
    </div>
  );
}