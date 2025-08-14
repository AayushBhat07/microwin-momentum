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

export default function MilestonesPage() {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("milestones");
  const [isLogSheetOpen, setIsLogSheetOpen] = useState(false);
  const backgroundUrl = useLazyImage("/assets/onboarding1.png");

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
                onClick={() => setIsLogSheetOpen(true)}
                className="font-pixel text-lg bg-blue-600 text-white border-2 border-blue-700 shadow-[4px_4px_0px_#000] hover:bg-blue-700 active:translate-y-1 active:translate-x-1 active:shadow-none transition-all px-6 py-3 hidden md:block"
              >
                Log a Win
              </button>
            </motion.div>
            
            <section className="mb-12">
              <h2 className="text-2xl font-pixel text-white text-shadow-pixel mb-4">Almost There!</h2>
              <NearMissMilestones />
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-pixel text-white text-shadow-pixel mb-4">Recent Unlocks</h2>
              <RecentUnlocks />
            </section>

            <section>
              <h2 className="text-2xl font-pixel text-white text-shadow-pixel mb-4">Badge Catalog</h2>
              <BadgeCatalog />
            </section>

          </div>
        </div>
        <LogAchievementSheet open={isLogSheetOpen} onOpenChange={setIsLogSheetOpen} />
      </div>
    </div>
  );
}