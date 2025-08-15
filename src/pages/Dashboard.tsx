import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { HeatMapCard } from "@/components/dashboard/HeatMapCard";
import { UserSearch } from "@/components/dashboard/UserSearch";
import { StatsOverview } from "@/components/dashboard/StatsOverview";
import { LogAchievementSheet } from "@/components/logging/LogAchievementSheet";
import { BadgesMilestonesSection } from "@/components/dashboard/BadgesMilestonesSection";
import { useNavigate } from "react-router";
import { Loader2 } from "lucide-react";
import { useLazyImage } from "@/hooks/use-lazy-image";
import { MoodModal } from "@/components/mood/MoodModal";
import { useMoodModal } from "@/hooks/use-mood-modal";

export default function Dashboard() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isLogSheetOpen, setIsLogSheetOpen] = useState(false);
  const backgroundUrl = useLazyImage("/assets/onboarding1.png");
  
  // Add mood modal hook
  const { isModalOpen, currentPeriod, closeModal } = useMoodModal();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && !user) {
        // If authenticated but no user profile, start onboarding
        navigate("/onboarding");
      } else if (user && (user as any).needsWellnessSetup) {
        // Existing user needs to complete a specific step
        navigate("/wellness-setup");
      }
    }
  }, [user, isLoading, isAuthenticated, navigate]);

  // Show a loading screen while auth state is being determined or if we are waiting for redirection.
  if (isLoading || (isAuthenticated && !user) || !backgroundUrl) {
    return (
      <div 
        className="min-h-screen bg-black flex items-center justify-center" 
      >
        <div className="z-10 text-center">
          <div className="font-pixel text-white text-3xl mb-4 animate-pulse">Loading Your Quest Log...</div>
          <Loader2 className="h-12 w-12 text-blue-400 animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-fixed transition-opacity duration-1000" 
      style={{ 
        backgroundImage: `url(${backgroundUrl})`,
        opacity: backgroundUrl ? 1 : 0,
      }}
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
                  Welcome back, {user?.name || 'Champion'}!
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
        
        {/* Mood Check Modal */}
        {currentPeriod && (
          <MoodModal 
            isOpen={isModalOpen} 
            onClose={closeModal} 
            period={currentPeriod} 
          />
        )}
      </div>
    </div>
  );
}