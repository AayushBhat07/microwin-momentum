import { useAuth } from "@/hooks/use-auth";
import { Spinner } from "@/components/ui/spinner";
import { AuthButton } from "@/components/auth/AuthButton";
import { StatsOverview } from "@/components/dashboard/StatsOverview";
import { CreateAchievement } from "@/components/dashboard/CreateAchievement";
import { AchievementFeed } from "@/components/dashboard/AchievementFeed";
import { UserButton } from "@/components/auth/UserButton";
import { Sparkles, BarChart3, Award, Trophy, Target } from "lucide-react";
import { useEffect, useState } from "react";
import { MotivationalQuote } from "@/components/dashboard/MotivationalQuote";
import { DailyGoals } from "@/components/dashboard/DailyGoals";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate, Navigate } from "react-router";
import { UserSearch } from "@/components/dashboard/UserSearch";
import { LogAchievementSheet } from "@/components/dashboard/LogAchievementSheet";
import { VictoryGallery } from "@/components/gallery/VictoryGallery";

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const [activeView, setActiveView] = useState("overview");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="h-12 w-12" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
          <div className="flex flex-col flex-grow bg-card border-r border-border">
            {/* Logo */}
            <div className="flex items-center flex-shrink-0 px-6 py-4">
              <Sparkles className="h-8 w-8 text-primary" />
              <span className="ml-2 text-xl font-bold">MicroWin</span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 pb-4 space-y-1">
              <button
                onClick={() => setActiveView("overview")}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeView === "overview"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                <BarChart3 className="mr-3 h-4 w-4" />
                Overview
              </button>
              
              <button
                onClick={() => setActiveView("gallery")}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeView === "gallery"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                <Award className="mr-3 h-4 w-4" />
                Victory Gallery
              </button>

              <button
                onClick={() => setActiveView("achievements")}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeView === "achievements"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                <Trophy className="mr-3 h-4 w-4" />
                Achievements
              </button>

              <button
                onClick={() => setActiveView("goals")}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeView === "goals"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                <Target className="mr-3 h-4 w-4" />
                Goals
              </button>
            </nav>

            {/* User Profile */}
            <div className="flex-shrink-0 p-4 border-t border-border">
              <UserButton />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:pl-64 flex flex-col flex-1">
          {/* Mobile Header */}
          <div className="lg:hidden bg-card border-b border-border px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Sparkles className="h-6 w-6 text-primary" />
                <span className="ml-2 text-lg font-bold">MicroWin</span>
              </div>
              <UserButton />
            </div>
          </div>

          {/* Page Content */}
          <main className="flex-1">
            {activeView === "overview" && (
              <div className="p-6">
                <div className="mb-8">
                  <h1 className="text-3xl font-bold tracking-tight">
                    Welcome back, {user.name || "there"}! 👋
                  </h1>
                  <p className="text-muted-foreground mt-2">
                    Ready to log another win today?
                  </p>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                  <div className="lg:col-span-2 space-y-6">
                    <StatsOverview />
                    <AchievementFeed />
                  </div>
                  <div className="space-y-6">
                    <CreateAchievement />
                    {/* Add other sidebar components here */}
                  </div>
                </div>
              </div>
            )}

            {activeView === "gallery" && <VictoryGallery />}

            {activeView === "achievements" && (
              <div className="p-6">
                <h1 className="text-3xl font-bold tracking-tight mb-6">All Achievements</h1>
                <AchievementFeed />
              </div>
            )}

            {activeView === "goals" && (
              <div className="p-6">
                <h1 className="text-3xl font-bold tracking-tight mb-6">Goals & Challenges</h1>
                <div className="text-center py-12">
                  <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Goals feature coming soon!</p>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}