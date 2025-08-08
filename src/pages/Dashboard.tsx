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
import { CreateAchievement } from "@/components/dashboard/CreateAchievement";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  
  // Fetch user stats
  const weeklyStats = useQuery(api.userStats.getWeeklyStats);
  const achievements = useQuery(api.achievements.getMyAchievements);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
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
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {user.name || 'Champion'}! 👋
            </h1>
            <p className="text-gray-600">
              Here's your achievement overview for today.
            </p>
          </motion.div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {/* Progress Ring Card - Top Left */}
            <div className="lg:col-span-1">
              <ProgressRingCard
                progress={Math.round(progress)}
                current={currentWins}
                target={monthlyTarget}
              />
            </div>

            {/* Milestone Card - Top Right */}
            <div className="lg:col-span-1">
              <MilestoneCard
                milestone={currentWins}
                title={`You've hit ${currentWins} Wins!`}
              />
            </div>

            {/* Stats Cards - Top Right (stacked) */}
            <div className="lg:col-span-1 space-y-4">
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

            {/* Heat Map Card - Middle Left */}
            <div className="lg:col-span-1">
              <HeatMapCard />
            </div>

            {/* Photo Memory Card - Middle Center */}
            <div className="lg:col-span-1">
              <PhotoMemoryCard />
            </div>

            {/* Empty space for future cards */}
            <div className="lg:col-span-1">
              {/* Placeholder for future features */}
            </div>
          </div>

          {/* Quick Actions Footer */}
          <motion.div
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Ready to log your next win?
                </h3>
                <p className="text-sm text-gray-600">
                  Quick log your next micro-win and keep the momentum going!
                </p>
              </div>
              
              <CreateAchievement
                trigger={
                  <Button className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-full">
                    <Plus className="w-5 h-5 mr-2" />
                    Log a Win
                  </Button>
                }
              />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}