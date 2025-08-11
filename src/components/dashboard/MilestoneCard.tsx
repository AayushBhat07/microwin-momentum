import { motion } from "framer-motion";
import { Trophy } from "lucide-react";

interface MilestoneCardProps {
  milestone: number;
  title?: string;
}

export function MilestoneCard({ milestone, title = "You've hit 50 Wins!" }: MilestoneCardProps) {
  return (
    <motion.div
      className="bg-background/80 backdrop-blur-sm border-secondary/50 shadow-[4px_4px_0px_var(--secondary)] font-pixel p-6 relative overflow-hidden"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <div className="relative z-10 flex flex-col items-center text-center">
        <motion.div 
          className="w-24 h-24 mb-4 bg-secondary flex items-center justify-center border-4 border-foreground"
          animate={{
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        >
          <Trophy className="w-12 h-12 text-secondary-foreground" />
        </motion.div>

        <h3 className="text-xl text-foreground leading-tight">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground mt-2">Keep up the great work!</p>
      </div>
    </motion.div>
  );
}