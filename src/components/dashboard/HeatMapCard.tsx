import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function HeatMapCard() {
  const heatMapData = useQuery(api.achievements.getHeatMapData);

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
    if (count === 0) return 'bg-muted/50';
    if (count <= 2) return 'bg-chart-2/60';
    if (count <= 4) return 'bg-chart-2/80';
    return 'bg-chart-2';
  };

  return (
    <motion.div
      className="bg-background/80 backdrop-blur-sm border-primary/50 shadow-[4px_4px_0px_var(--primary)] font-pixel p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <h3 className="text-lg text-foreground mb-4">Contribution History</h3>
      
      <div className="grid grid-rows-7 grid-flow-col gap-1">
        {dates.map((date, index) => {
          const count = dataMap[date] || 0;
          
          return (
            <motion.div
              key={date}
              className={`w-3 h-3 border border-foreground/20 ${getIntensity(count)}`}
              whileHover={{ scale: 1.5, border: "1px solid var(--foreground)" }}
              title={`${date}: ${count} achievements`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.01 }}
            />
          );
        })}
      </div>

      <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
        <span>Less</span>
        <div className="flex space-x-1">
          <div className="w-3 h-3 bg-muted/50 border border-foreground/20" />
          <div className="w-3 h-3 bg-chart-2/60 border border-foreground/20" />
          <div className="w-3 h-3 bg-chart-2/80 border border-foreground/20" />
          <div className="w-3 h-3 bg-chart-2 border border-foreground/20" />
        </div>
        <span>More</span>
      </div>
    </motion.div>
  );
}