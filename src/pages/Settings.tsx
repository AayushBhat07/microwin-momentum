import { Sidebar } from "@/components/dashboard/Sidebar";
import { useLazyImage } from "@/hooks/use-lazy-image";
import { motion } from "framer-motion";
import { useState } from "react";

export default function SettingsPage() {
  const backgroundUrl = useLazyImage("/assets/onboarding1.png");
  const [activeTab, setActiveTab] = useState("settings");

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
              className="mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl font-pixel text-white text-shadow-pixel mb-2">
                Settings
              </h1>
              <p className="text-blue-300 font-pixel text-lg">
                Manage your account and preferences.
              </p>
            </motion.div>

            <div className="text-center py-16 border-2 border-dashed border-blue-800/50 bg-blue-900/20">
              <p className="text-lg text-blue-300">
                Settings page is under construction.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}