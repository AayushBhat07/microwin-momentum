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
import { GuidedTour } from "@/components/tour/GuidedTour";
import { useGuidedTour } from "@/hooks/use-guided-tour";
import { useSearchParams } from "react-router";
import { ExpandableChatDemo } from "@/components/chat/ExpandableChatDemo";

const tourSteps = [
  {
    targetId: 'sidebar-navigation',
    title: 'Welcome to LevelUp!',
    content: 'This is your navigation sidebar. Use it to explore different sections of your journey.',
    position: 'right' as const,
  },
  {
    targetId: 'log-win-button',
    title: 'Log Your Wins',
    content: 'This is the most important button! Click here whenever you achieve something to earn points and track progress.',
    position: 'bottom' as const,
  },
  {
    targetId: 'stats-overview',
    title: 'Your Progress Stats',
    content: 'Keep track of your total points, current streak, and achievements at a glance.',
    position: 'bottom' as const,
  },
  {
    targetId: 'heatmap-card',
    title: 'Activity Heat Map',
    content: 'This shows your consistency over time. The more active you are, the more colorful it gets!',
    position: 'top' as const,
  },
  {
    targetId: 'badges-section',
    title: 'Badges & Milestones',
    content: 'Earn badges and unlock milestones as you progress. This gamifies your journey!',
    position: 'top' as const,
  },
];

export default function Dashboard() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isLogSheetOpen, setIsLogSheetOpen] = useState(false);
  const backgroundUrl = useLazyImage("/assets/onboarding1.png");
  
  // Add guided tour
  const { startTour, isTourActive } = useGuidedTour();
  
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

  const restartTour = () => {
    if (user) {
      // Clear the tour completion flags for all pages in the tour
      localStorage.removeItem(`tour-completed-${user._id}`);
      localStorage.removeItem(`tour-completed-${user._id}-goals`);
      // Also clear the next step in the tour, just in case
      localStorage.removeItem(`tour-completed-${user._id}-memories`); 
    }
    startTour(tourSteps, () => {
      if (user) {
        localStorage.setItem(`tour-completed-${user._id}`, 'true');
        navigate('/goals?tour=true');
      }
    });
  };

  // Start tour for new users
  useEffect(() => {
    if (user && !isTourActive) {
      const hasCompletedFullTour = localStorage.getItem(`full-tour-completed-${user._id}`);
      if (hasCompletedFullTour) return;

      // Check if user has seen the tour before (you can add this to user profile later)
      const hasSeenTour = localStorage.getItem(`tour-completed-${user._id}`);
      const isTourFromRedirect = searchParams.get('tour') === 'true';

      if (!hasSeenTour || isTourFromRedirect) {
        setTimeout(() => startTour(tourSteps, () => {
          localStorage.setItem(`tour-completed-${user._id}`, 'true');
          navigate('/goals?tour=true');
        }), 1000);
      }
    }
  }, [user, startTour, isTourActive, navigate, searchParams]);

  // Mark tour as completed when it ends
  useEffect(() => {
    if (user && !isTourActive) {
      const hasSeenTour = localStorage.getItem(`tour-completed-${user._id}`);
      if (hasSeenTour === null) {
        localStorage.setItem(`tour-completed-${user._id}`, 'true');
      }
    }
  }, [user, isTourActive]);

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
      className="h-screen overflow-hidden bg-cover bg-center bg-fixed transition-opacity duration-1000" 
      style={{ 
        backgroundImage: `url(${backgroundUrl})`,
        opacity: backgroundUrl ? 1 : 0,
      }}
    >
      <div className="h-full bg-black/60 flex">
        {/* Sidebar */}
        <div id="sidebar-navigation">
          <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* Main Content */}
        <div className="flex-1 p-2 overflow-y-auto">
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
              <div className="hidden md:flex items-center gap-4">
                <button
                  onClick={restartTour}
                  className="font-pixel text-lg bg-purple-600 text-white border-2 border-purple-700 shadow-[4px_4px_0px_#000] hover:bg-purple-700 active:translate-y-1 active:translate-x-1 active:shadow-none transition-all px-6 py-3"
                >
                  Restart Tour
                </button>
                <button 
                  id="log-win-button"
                  onClick={() => setIsLogSheetOpen(true)}
                  className="font-pixel text-lg bg-blue-600 text-white border-2 border-blue-700 shadow-[4px_4px_0px_#000] hover:bg-blue-700 active:translate-y-1 active:translate-x-1 active:shadow-none transition-all px-6 py-3"
                >
                  Log a Win
                </button>
              </div>
            </motion.div>

            {/* Main Grid */}
            <div className="space-y-8">
              {/* Stats Overview - Full Width on Top */}
              <div id="stats-overview">
                <StatsOverview />
              </div>

              {/* Heat Map & User Search */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div id="heatmap-card" className="lg:col-span-2">
                  <HeatMapCard />
                </div>
                <div className="lg:col-span-1">
                  <UserSearch />
                </div>
              </div>

              {/* Badges & Milestones Section */}
              <div id="badges-section">
                <BadgesMilestonesSection />
              </div>

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

        {/* Guided Tour */}
        <GuidedTour />
      </div>
      <ExpandableChatDemo />
    </div>
  );
}