import { motion } from "framer-motion";
import { Sun } from "lucide-react";

interface ProgressRingCardProps {
  progress: number; // 0-100
  current: number;
  target: number;
}

export function ProgressRingCard({ progress, current, target }: ProgressRingCardProps) {
  const circumference = 2 * Math.PI * 45; // radius of 45
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <motion.div
      className="bg-black/60 backdrop-blur-sm p-6 border-2 border-blue-900/80 font-pixel"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col items-center">
        {/* Progress Ring */}
        <div className="relative w-32 h-32 mb-4">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="var(--blue-900)"
              strokeWidth="8"
              fill="none"
            />
            {/* Progress circle */}
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              stroke="var(--blue-500)"
              strokeWidth="8"
              fill="none"
              strokeLinecap="butt"
              strokeDasharray={strokeDasharray}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </svg>
          
          {/* Center icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 bg-blue-900/30 flex items-center justify-center border-2 border-blue-700">
              <Sun className="w-8 h-8 text-blue-300" />
            </div>
          </div>
        </div>

        {/* Text content */}
        <h3 className="text-lg text-blue-200 mb-1 font-pixel">Monthly Wins</h3>
        <p className="text-sm text-blue-400 font-pixel">{current} of {target}</p>
        <p className="text-2xl text-white mt-2 font-pixel">{progress}%</p>
      </div>
    </motion.div>
  );
}