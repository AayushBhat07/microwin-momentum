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
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
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
              stroke="#f3f4f6"
              strokeWidth="8"
              fill="none"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="url(#progressGradient)"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-out"
            />
            {/* Gradient definition */}
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Center icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <Sun className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Text content */}
        <h3 className="text-lg font-bold text-gray-900 mb-1">Monthly Wins</h3>
        <p className="text-sm text-gray-600">{current} of {target}</p>
        <p className="text-2xl font-bold text-teal-600 mt-2">{progress}%</p>
      </div>
    </motion.div>
  );
}
