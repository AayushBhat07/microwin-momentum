import { motion } from "framer-motion";
import { Trophy, CheckCircle } from "lucide-react";

interface StatsCardProps {
  type: "badges" | "streak";
  value: number;
  label: string;
}

export function StatsCard({ type, value, label }: StatsCardProps) {
  const Icon = type === "badges" ? Trophy : CheckCircle;
  const iconColor = type === "badges" ? "bg-yellow-400" : "bg-green-400";

  return (
    <motion.div
      className="bg-background/80 backdrop-blur-sm border-primary/50 shadow-[4px_4px_0px_var(--primary)] font-pixel p-4 flex items-center space-x-4"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: type === "badges" ? 0.4 : 0.5 }}
      whileHover={{ scale: 1.02 }}
    >
      <div className={`w-12 h-12 flex items-center justify-center ${iconColor} border-2 border-foreground`}>
        <Icon className="w-6 h-6 text-foreground" />
      </div>
      
      <div className="flex-1">
        <p className="text-base text-foreground">
          {label}: <span className="text-lg">{value}</span>
        </p>
      </div>
    </motion.div>
  );
}