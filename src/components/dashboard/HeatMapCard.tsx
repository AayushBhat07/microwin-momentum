import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function HeatMapCard() {
  const heatMapData = useQuery(api.achievements.getHeatMapData);

  // Generate last 3 months of dates
  const generateDateGrid = () => {
    const dates = [];
    const today = new Date();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(today.getMonth() - 3);

    for (let d = new Date(threeMonthsAgo); d <= today; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d).toISOString().split('T')[0]);
    }
    return dates;
  };

  const dates = generateDateGrid();
  const dataMap = heatMapData?.reduce((acc, item) => {
    acc[item.date] = item.count;
    return acc;
  }, {} as Record<string, number>) || {};

  const getIntensity = (count: number) => {
    if (count === 0) return 'bg-gray-100';
    if (count <= 2) return 'bg-green-200';
    if (count <= 4) return 'bg-green-400';
    if (count <= 6) return 'bg-green-600';
    return 'bg-green-800';
  };

  return (
    <motion.div
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <h3 className="text-base font-semibold text-gray-900 mb-4">Achievement Heat Map</h3>
      
      <div className="grid grid-cols-7 gap-1">
        {dates.map((date, index) => {
          const count = dataMap[date] || 0;
          const dayOfWeek = new Date(date).getDay();
          
          return (
            <motion.div
              key={date}
              className={`w-3 h-3 rounded-sm ${getIntensity(count)} cursor-pointer`}
              whileHover={{ scale: 1.2 }}
              title={`${date}: ${count} achievements`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.01 }}
            />
          );
        })}
      </div>

      <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
        <span>Less</span>
        <div className="flex space-x-1">
          <div className="w-3 h-3 bg-gray-100 rounded-sm" />
          <div className="w-3 h-3 bg-green-200 rounded-sm" />
          <div className="w-3 h-3 bg-green-400 rounded-sm" />
          <div className="w-3 h-3 bg-green-600 rounded-sm" />
          <div className="w-3 h-3 bg-green-800 rounded-sm" />
        </div>
        <span>More</span>
      </div>
    </motion.div>
  );
}
