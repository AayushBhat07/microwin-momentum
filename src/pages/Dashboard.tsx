import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { ProgressRingCard } from "@/components/dashboard/ProgressRingCard";
import { MilestoneCard } from "@/components/dashboard/MilestoneCard";
import { HeatMapCard } from "@/components/dashboard/HeatMapCard";
import { PhotoMemoryCard } from "@/components/dashboard/PhotoMemoryCard";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { FloatingLogButton } from "@/components/logging/FloatingLogButton";
import { LogAchievementSheet } from "@/components/logging/LogAchievementSheet";
import { DailyGoals } from "@/components/dashboard/DailyGoals";

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isLogSheetOpen, setIsLogSheetOpen] = useState(false);
  
  // Fetch user stats
  const weeklyStats = useQuery(api.userStats.getWeeklyStats);
  const achievements = useQuery(api.achievements.getMyAchievements);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="font-pixel text-white text-2xl animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Please sign in to access your dashboard.</p>
      </div>
    );
  }

  // Calculate progress data
  const monthlyTarget = 20;
  const currentWins = weeklyStats?.totalAchievements || 0;
  const progress = Math.min((currentWins / monthlyTarget) * 100, 100);

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-fixed" 
      style={{ backgroundImage: "url('/assets/onboarding1.png')" }}
    >
      <div className="min-h-screen bg-black/60 flex">
        {/* Sidebar */}
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl font-pixel text-white text-shadow-pixel mb-2">
                Welcome back, {user.name || 'Champion'}!
              </h1>
              <p className="text-blue-300 font-pixel text-lg">
                Here's your quest log for today.
              </p>
            </motion.div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {/* Daily Goals Card - Full Width on Top */}
              <div className="lg:col-span-3">
                <DailyGoals />
              </div>

              {/* Progress Ring Card */}
              <div className="lg:col-span-1">
                <ProgressRingCard
                  progress={Math.round(progress)}
                  current={currentWins}
                  target={monthlyTarget}
                />
              </div>

              {/* Milestone Card */}
              <div className="lg:col-span-1">
                <MilestoneCard
                  milestone={currentWins}
                  title={`You've hit ${currentWins} Wins!`}
                />
              </div>

              {/* Stats Cards (stacked) */}
              <div className="lg:col-span-1 space-y-6">
                <StatsCard
                  type="badges"
                  value={12} // TODO: Replace with real badge count
                  label="Badges Earned"
                />
                <StatsCard
                  type="streak"
                  value={weeklyStats?.weeklyStreak || 0}
                  label="Streak"
                />
              </div>

              {/* Heat Map Card */}
              <div className="lg:col-span-2">
                <HeatMapCard />
              </div>

              {/* Photo Memory Card */}
              <div className="lg:col-span-1">
                <PhotoMemoryCard />
              </div>
            </div>
          </div>
        </div>

        {/* Gamified Logging System */}
        <FloatingLogButton onClick={() => setIsLogSheetOpen(true)} />
        <LogAchievementSheet open={isLogSheetOpen} onOpenChange={setIsLogSheetOpen} />
      </div>
    </div>
  );
}