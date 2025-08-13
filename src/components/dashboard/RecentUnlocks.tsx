import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { BadgeCard } from "./BadgeCard";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export function RecentUnlocks() {
  const userBadges = useQuery(api.badges.getUserBadges);

  if (userBadges === undefined) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="w-8 h-8 animate-spin text-blue-300" />
      </div>
    );
  }

  const recentBadges = userBadges.slice(0, 6);

  if (recentBadges.length === 0) {
    return (
      <div className="text-center py-12 px-6 bg-black/50 border-2 border-blue-900/80 font-pixel">
        <h3 className="text-xl text-white mb-2">Your First Badge is Waiting!</h3>
        <p className="text-blue-300">
          Your recently unlocked badges will appear here. Start logging wins to earn them!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {recentBadges.map((badge, index) => (
        <motion.div
          key={badge.userBadge._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <BadgeCard badge={badge} />
        </motion.div>
      ))}
    </div>
  );
}
