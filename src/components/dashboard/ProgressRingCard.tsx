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
      className="bg-background/80 backdrop-blur-sm border-primary/50 shadow-[4px_4px_0px_var(--primary)] font-pixel p-6"
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
              stroke="var(--muted)"
              strokeWidth="8"
              fill="none"
            />
            {/* Progress circle */}
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              stroke="var(--chart-1)"
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
            <div className="w-16 h-16 bg-secondary flex items-center justify-center border-2 border-foreground">
              <Sun className="w-8 h-8 text-secondary-foreground" />
            </div>
          </div>
        </div>

        {/* Text content */}
        <h3 className="text-lg text-foreground mb-1">Monthly Wins</h3>
        <p className="text-sm text-muted-foreground">{current} of {target}</p>
        <p className="text-2xl text-primary mt-2">{progress}%</p>
      </div>
    </motion.div>
  );
}