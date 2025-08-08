import { motion } from "framer-motion";
import { Trophy, CheckCircle } from "lucide-react";

interface StatsCardProps {
  type: "badges" | "streak";
  value: number;
  label: string;
}

export function StatsCard({ type, value, label }: StatsCardProps) {
  const Icon = type === "badges" ? Trophy : CheckCircle;
  const iconColor = type === "badges" ? "text-yellow-600 bg-yellow-100" : "text-green-600 bg-green-100";

  return (
    <motion.div
      className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center space-x-3"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: type === "badges" ? 0.4 : 0.5 }}
      whileHover={{ scale: 1.02 }}
    >
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconColor}`}>
        <Icon className="w-5 h-5" />
      </div>
      
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">
          {label}: <span className="font-bold">{value}</span>
        </p>
      </div>
    </motion.div>
  );
}
