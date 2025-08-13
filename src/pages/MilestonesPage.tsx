import { Sidebar } from "@/components/dashboard/Sidebar";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { motion } from "framer-motion";
import { FloatingLogButton } from "@/components/logging/FloatingLogButton";
import { LogAchievementSheet } from "@/components/logging/LogAchievementSheet";

export default function MilestonesPage() {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("milestones");
  const [isLogSheetOpen, setIsLogSheetOpen] = useState(false);

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
        <p>Please sign in to access your milestones.</p>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-fixed" 
      style={{ backgroundImage: "url('/assets/onboarding1.png')" }}
    >
      <div className="min-h-screen bg-black/60 flex">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl font-pixel text-white text-shadow-pixel mb-2">
                Milestones
              </h1>
              <p className="text-blue-300 font-pixel text-lg">
                Track your progress, see what’s close, and celebrate what you’ve unlocked.
              </p>
            </motion.div>
            
            <div className="text-white font-pixel">
              Milestones page content coming soon...
            </div>

          </div>
        </div>
        <FloatingLogButton onClick={() => setIsLogSheetOpen(true)} />
        <LogAchievementSheet open={isLogSheetOpen} onOpenChange={setIsLogSheetOpen} />
      </div>
    </div>
  );
}
