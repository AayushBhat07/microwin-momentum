import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { HeatMapCard } from "@/components/dashboard/HeatMapCard";
import { UserSearch } from "@/components/dashboard/UserSearch";
import { StatsOverview } from "@/components/dashboard/StatsOverview";
import { FloatingLogButton } from "@/components/logging/FloatingLogButton";
import { LogAchievementSheet } from "@/components/logging/LogAchievementSheet";
import { BadgesMilestonesSection } from "@/components/dashboard/BadgesMilestonesSection";
import { useNavigate } from "react-router";
import { useEffect } from "react";

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isLogSheetOpen, setIsLogSheetOpen] = useState(false);

  useEffect(() => {
    // Redirect to wellness setup if needed, but only when we have a user object
    if (user && user.needsWellnessSetup) {
      navigate("/wellness-setup");
    }
  }, [user, navigate]);
  
  // Primary loading state from useAuth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="font-pixel text-white text-2xl animate-pulse">Loading...</div>
      </div>
    );
  }

  // This handles the case where auth is loaded, but the user object is null.
  // This can happen during initial user creation or if there's an issue.
  // We show a more appropriate loading message instead of "Please sign in".
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="font-pixel text-white text-2xl animate-pulse">Loading your profile...</div>
      </div>
    );
  }

  // If user needs wellness setup, show loader while redirecting via useEffect
  if (user.needsWellnessSetup) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="font-pixel text-white text-2xl animate-pulse">Loading...</div>
      </div>
    );
  }

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
              className="mb-8 flex justify-between items-center"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div>
                <h1 className="text-4xl font-pixel text-white text-shadow-pixel mb-2">
                  Welcome back, {user.name || 'Champion'}!
                </h1>
                <p className="text-blue-300 font-pixel text-lg">
                  Here's your quest log for today.
                </p>
              </div>
              <button 
                onClick={() => setIsLogSheetOpen(true)}
                className="font-pixel text-lg bg-blue-600 text-white border-2 border-blue-700 shadow-[4px_4px_0px_#000] hover:bg-blue-700 active:translate-y-1 active:translate-x-1 active:shadow-none transition-all px-6 py-3 hidden md:block"
              >
                Log a Win
              </button>
            </motion.div>

            {/* Main Grid */}
            <div className="space-y-8">
              {/* Stats Overview - Full Width on Top */}
              <StatsOverview />

              {/* Heat Map & User Search */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <HeatMapCard />
                </div>
                <div className="lg:col-span-1">
                  <UserSearch />
                </div>
              </div>

              {/* Badges & Milestones Section */}
              <BadgesMilestonesSection />

            </div>
          </div>
        </div>

        {/* Gamified Logging System */}
        <LogAchievementSheet open={isLogSheetOpen} onOpenChange={setIsLogSheetOpen} />
      </div>
    </div>
  );
}