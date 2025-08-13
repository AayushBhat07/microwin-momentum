import { motion } from "framer-motion";
import { Sun } from "lucide-react";

interface ProgressRingCardProps {
  progress: number; // 0-100
  current: number;
  target: number;
  name: string;
  description: string;
}

export function ProgressRingCard({ progress, current, target, name, description }: ProgressRingCardProps) {
  const circumference = 2 * Math.PI * 40; // radius of 40
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <motion.div
      className="bg-black/60 backdrop-blur-sm p-3 border-2 border-blue-900/80 font-pixel h-full flex flex-col"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col items-center flex-grow justify-center">
        {/* Progress Ring */}
        <div className="relative w-24 h-24 mb-3">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="var(--blue-900)"
              strokeWidth="6"
              fill="none"
            />
            {/* Progress circle */}
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              stroke="var(--blue-500)"
              strokeWidth="6"
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
            <div className="w-12 h-12 bg-blue-900/30 flex items-center justify-center border-2 border-blue-700">
              <Sun className="w-6 h-6 text-blue-300" />
            </div>
          </div>
        </div>

        {/* Text content */}
        <h3 className="text-base text-blue-200 mb-1 font-pixel text-center">{name}</h3>
        <p className="text-xs text-blue-400 font-pixel text-center mb-2 flex-grow">{description}</p>
        <p className="text-xl text-white font-pixel">{progress}%</p>
        <p className="text-xs text-blue-300 font-pixel mt-1">{current} / {target}</p>
      </div>
    </motion.div>
  );
}