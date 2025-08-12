import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useRef, useState } from "react";

// Custom hook to get the previous value of a prop or state
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

export function HeatMapCard() {
  const heatMapData = useQuery(api.achievements.getHeatMapData);
  const prevHeatMapData = usePrevious(heatMapData);
  const [highlightedDate, setHighlightedDate] = useState<string | null>(null);

  useEffect(() => {
    if (prevHeatMapData && heatMapData) {
      const prevMap = (prevHeatMapData || []).reduce((acc, item) => {
        acc[item.date] = item.count;
        return acc;
      }, {} as Record<string, number>);

      const currentMap = (heatMapData || []).reduce((acc, item) => {
        acc[item.date] = item.count;
        return acc;
      }, {} as Record<string, number>);

      // Find a date where the count has increased
      const updatedDate = Object.keys(currentMap).find(date => 
        currentMap[date] > (prevMap[date] || 0)
      );

      if (updatedDate) {
        setHighlightedDate(updatedDate);
        const timer = setTimeout(() => setHighlightedDate(null), 2000); // Highlight for 2 seconds
        return () => clearTimeout(timer);
      }
    }
  }, [heatMapData, prevHeatMapData]);

  // Generate last 14 weeks of dates
  const generateDateGrid = () => {
    const dates = [];
    const today = new Date();
    const daysToDisplay = 7 * 14; // 14 weeks
    const startDate = new Date();
    startDate.setDate(today.getDate() - daysToDisplay + 1);
    
    for (let i = 0; i < daysToDisplay; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  };

  const dates = generateDateGrid();
  const dataMap = heatMapData?.reduce((acc, item) => {
    acc[item.date] = item.count;
    return acc;
  }, {} as Record<string, number>) || {};

  const getIntensity = (count: number) => {
    if (count === 0) return 'bg-blue-900/30';
    if (count <= 2) return 'bg-blue-600/60';
    if (count <= 4) return 'bg-blue-600/80';
    return 'bg-blue-500';
  };

  return (
    <motion.div
      className="bg-black/60 backdrop-blur-sm p-6 border-2 border-blue-900/80 font-pixel"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <h3 className="text-lg text-blue-200 mb-4 font-pixel">Contribution History</h3>
      
      <div className="grid grid-rows-7 grid-flow-col gap-1">
        {dates.map((date, index) => {
          const count = dataMap[date] || 0;
          const isHighlighted = date === highlightedDate;
          
          return (
            <motion.div
              key={date}
              className={`w-3 h-3 border border-blue-800/50 ${getIntensity(count)}`}
              whileHover={{ scale: 1.5, border: "1px solid #60a5fa" }}
              title={`${date}: ${count} achievements`}
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: 1,
                scale: isHighlighted ? [1, 1.8, 1] : 1,
                boxShadow: isHighlighted ? "0 0 8px #3b82f6" : "none",
              }}
              transition={{ 
                delay: index * 0.01,
                duration: 0.2,
                scale: { duration: 0.5, ease: "easeInOut" },
                boxShadow: { duration: 0.5, ease: "easeInOut" },
              }}
            />
          );
        })}
      </div>

      <div className="flex items-center justify-between mt-4 text-xs text-blue-400 font-pixel">
        <span>Less</span>
        <div className="flex space-x-1">
          <div className="w-3 h-3 bg-blue-900/30 border border-blue-700/50" />
          <div className="w-3 h-3 bg-blue-600/60 border border-blue-700/50" />
          <div className="w-3 h-3 bg-blue-600/80 border border-blue-700/50" />
          <div className="w-3 h-3 bg-blue-500 border border-blue-700/50" />
        </div>
        <span>More</span>
      </div>
    </motion.div>
  );
}