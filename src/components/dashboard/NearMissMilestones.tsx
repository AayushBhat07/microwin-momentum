import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ProgressRingCard } from "./ProgressRingCard";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export function NearMissMilestones() {
  const nearMisses = useQuery(api.badges.getNearMissBadges);

  if (nearMisses === undefined) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="w-8 h-8 animate-spin text-blue-300" />
      </div>
    );
  }

  if (nearMisses.length === 0) {
    return (
      <div className="text-center py-12 px-6 bg-black/50 border-2 border-blue-900/80 font-pixel">
        <h3 className="text-xl text-white mb-2">No Milestones in Progress</h3>
        <p className="text-blue-300">
          Start logging your wins to work towards your first badge!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {nearMisses.map((badge, index) => (
        <motion.div
          key={badge._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <ProgressRingCard
            name={badge.name}
            description={badge.description}
            progress={badge.progress}
            current={badge.current}
            target={badge.target}
          />
        </motion.div>
      ))}
    </div>
  );
}
