import { motion } from "framer-motion";
import { Trophy } from "lucide-react";

interface MilestoneCardProps {
  milestone: number;
  title?: string;
}

export function MilestoneCard({ milestone, title = "You've hit 50 Wins!" }: MilestoneCardProps) {
  return (
    <motion.div
      className="bg-black/60 backdrop-blur-sm p-6 border-2 border-blue-900/80 font-pixel relative overflow-hidden"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <div className="relative z-10 flex flex-col items-center text-center">
        <motion.div 
          className="w-24 h-24 mb-4 bg-blue-900/30 flex items-center justify-center border-4 border-blue-700"
          animate={{
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        >
          <Trophy className="w-12 h-12 text-blue-300" />
        </motion.div>

        <h3 className="text-xl text-white leading-tight font-pixel">
          {title}
        </h3>
        <p className="text-sm text-blue-400 mt-2 font-pixel">Keep up the great work!</p>
      </div>
    </motion.div>
  );
}