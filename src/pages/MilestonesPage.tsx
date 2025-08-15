import { Sidebar } from "@/components/dashboard/Sidebar";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { motion } from "framer-motion";
import { LogAchievementSheet } from "@/components/logging/LogAchievementSheet";
import { NearMissMilestones } from "@/components/dashboard/NearMissMilestones";
import { RecentUnlocks } from "@/components/dashboard/RecentUnlocks";
import { BadgeCatalog } from "@/components/dashboard/BadgeCatalog";
import { useLazyImage } from "@/hooks/use-lazy-image";
import { Loader2 } from "lucide-react";
import { useGuidedTour, GuidedTour } from "@/hooks/use-guided-tour";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";

export default function MilestonesPage() {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("milestones");
  const [isLogSheetOpen, setIsLogSheetOpen] = useState(false);
  const backgroundUrl = useLazyImage("/assets/onboarding1.png");
  const { startTour, isTourActive } = useGuidedTour();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (user && !isTourActive && searchParams.get('tour') === 'true') {
      const hasSeenTour = localStorage.getItem(`tour-completed-${user._id}-milestones`);
      if (!hasSeenTour) {
        const tourSteps = [
          {
            targetId: 'milestones-header',
            title: 'Milestones',
            content: 'This page tracks your major achievements and progress towards unlocking new badges.',
            position: 'bottom' as const,
          },
          {
            targetId: 'log-a-win-button-milestones',
            title: 'Log a Win',
            content: 'Log your wins here to make progress towards your milestones and unlock badges.',
            position: 'bottom' as const,
          },
          {
            targetId: 'almost-there-section',
            title: 'Almost There!',
            content: 'See which milestones are within your reach. A little more effort and you\'ll unlock them!',
            position: 'top' as const,
          },
          {
            targetId: 'recent-unlocks-section',
            title: 'Recent Unlocks',
            content: 'Celebrate the milestones and badges you have recently earned.',
            position: 'top' as const,
          },
          {
            targetId: 'badge-catalog-section',
            title: 'Badge Catalog',
            content: 'Browse the entire collection of badges you can earn on your journey.',
            position: 'top' as const,
          },
        ];
        
        setTimeout(() => startTour(tourSteps, () => {
          localStorage.setItem(`tour-completed-${user._id}-milestones`, 'true');
          localStorage.setItem(`full-tour-completed-${user._id}`, 'true');
          toast.success("Congratulations, Champion!", {
            description: "You've completed the grand tour. Your adventure begins now!",
            duration: 5000,
          });
          navigate('/dashboard');
        }), 1000);
      }
    }
  }, [user, startTour, isTourActive, navigate, searchParams]);

  if (isLoading || !backgroundUrl) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <Loader2 className="h-12 w-12 text-blue-400 animate-spin mx-auto" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Please sign in to access your milestones.</p>
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
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <motion.div
              id="milestones-header"
              className="mb-8 flex justify-between items-center"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div>
                <h1 className="text-4xl font-pixel text-white text-shadow-pixel mb-2">
                  Milestones
                </h1>
                <p className="text-blue-300 font-pixel text-lg">
                  Track your progress, see what's close, and celebrate what you've unlocked.
                </p>
              </div>
              <button 
                id="log-a-win-button-milestones"
                onClick={() => setIsLogSheetOpen(true)}
                className="font-pixel text-lg bg-blue-600 text-white border-2 border-blue-700 shadow-[4px_4px_0px_#000] hover:bg-blue-700 active:translate-y-1 active:translate-x-1 active:shadow-none transition-all px-6 py-3 hidden md:block"
              >
                Log a Win
              </button>
            </motion.div>
            
            <section id="almost-there-section" className="mb-12">
              <h2 className="text-2xl font-pixel text-white text-shadow-pixel mb-4">Almost There!</h2>
              <NearMissMilestones />
            </section>

            <section id="recent-unlocks-section" className="mb-12">
              <h2 className="text-2xl font-pixel text-white text-shadow-pixel mb-4">Recent Unlocks</h2>
              <RecentUnlocks />
            </section>

            <section id="badge-catalog-section">
              <h2 className="text-2xl font-pixel text-white text-shadow-pixel mb-4">Badge Catalog</h2>
              <BadgeCatalog />
            </section>

          </div>
        </div>
        <LogAchievementSheet open={isLogSheetOpen} onOpenChange={setIsLogSheetOpen} />
        <GuidedTour />
      </div>
    </div>
  );
}