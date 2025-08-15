import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useLocation } from "react-router";

export function useMoodModal() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPeriod, setCurrentPeriod] = useState<"am" | "pm" | null>(null);
  const location = useLocation();
  
  const todayEntries = useQuery(api.moodTracking.getTodayMoodEntries);

  useEffect(() => {
    // Only show on dashboard page
    if (location.pathname !== "/dashboard") {
      return;
    }

    // Don't show if data is still loading
    if (todayEntries === undefined) {
      return;
    }

    const now = new Date();
    const hour = now.getHours();
    
    // Determine current period
    let period: "am" | "pm" | null = null;
    if (hour >= 6 && hour < 10) {
      period = "am";
    } else if (hour >= 19 && hour < 23) { // 7 PM to 11 PM
      period = "pm";
    }

    if (!period) {
      return; // Not in a mood check window
    }

    // Check if user already completed mood check for this period today
    const hasEntryForPeriod = todayEntries.some(entry => entry.period === period);
    
    if (!hasEntryForPeriod) {
      setCurrentPeriod(period);
      setIsModalOpen(true);
    }
  }, [location.pathname, todayEntries]);

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentPeriod(null);
  };

  return {
    isModalOpen,
    currentPeriod,
    closeModal,
  };
}
