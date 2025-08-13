import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { BadgeCard } from "./BadgeCard";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Doc } from "@/convex/_generated/dataModel";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type BadgeWithStatus = {
  badgeDetails: Doc<"badges">;
  userBadge: Doc<"userBadges"> | null;
  isEarned: boolean;
};

function LockedBadgeCard({ badge }: { badge: Doc<"badges"> }) {
  const rarityColor = {
    common: "border-stone-500",
    uncommon: "border-green-700",
    rare: "border-blue-700",
    epic: "border-purple-800",
  }[badge.rarity || "common"];

  return (
    <div
      className={`p-1 bg-gray-900/50 rounded-lg ${rarityColor} border-2 image-rendering-pixelated filter grayscale`}
    >
      <div className="bg-gray-900/80 p-4 rounded-md text-center h-full flex flex-col items-center justify-center">
        <p className="text-3xl mb-2">{badge.icon || "❓"}</p>
        <h3 className="text-base font-bold text-gray-400 font-press-start leading-tight">
          {badge.name}
        </h3>
        <p className="text-xs text-gray-500 mt-2 flex-grow">
          {badge.description}
        </p>
        <p className="text-xs text-gray-600 mt-2 uppercase font-bold tracking-widest">
          Locked
        </p>
      </div>
    </div>
  );
}

export function BadgeCatalog() {
  const catalog = useQuery(api.badges.getCatalog);
  const userBadges = useQuery(api.badges.getUserBadges);
  const [filter, setFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const badgesWithStatus = useMemo<BadgeWithStatus[] | undefined>(() => {
    if (!catalog || !userBadges) return undefined;

    const earnedBadgeMap = new Map(
      userBadges
        .filter(({ badgeDetails }) => badgeDetails !== null)
        .map(({ userBadge, badgeDetails }) => [badgeDetails!.slug, userBadge])
    );

    return catalog.map((badge) => {
      const userBadge = earnedBadgeMap.get(badge.slug) || null;
      return {
        badgeDetails: badge,
        userBadge,
        isEarned: !!userBadge,
      };
    });
  }, [catalog, userBadges]);

  const filteredBadges = useMemo(() => {
    if (!badgesWithStatus) return [];
    return badgesWithStatus.filter(b => {
      const categoryMatch = filter === 'all' || b.badgeDetails.family === filter;
      const statusMatch = statusFilter === 'all' || (statusFilter === 'earned' && b.isEarned) || (statusFilter === 'locked' && !b.isEarned);
      return categoryMatch && statusMatch;
    });
  }, [badgesWithStatus, filter, statusFilter]);

  if (badgesWithStatus === undefined) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-300" />
      </div>
    );
  }

  const filterCategories = ["all", "wins", "streak", "category", "variety", "mode", "explore", "community", "event"];

  return (
    <div>
      <div className="flex flex-wrap gap-4 mb-6">
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList className="bg-gray-800/50">
            {filterCategories.map(cat => (
              <TabsTrigger key={cat} value={cat} className="capitalize data-[state=active]:bg-blue-600 font-pixel">
                {cat}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList className="bg-gray-800/50">
            <TabsTrigger value="all" className="capitalize data-[state=active]:bg-blue-600 font-pixel">All</TabsTrigger>
            <TabsTrigger value="earned" className="capitalize data-[state=active]:bg-blue-600 font-pixel">Earned</TabsTrigger>
            <TabsTrigger value="locked" className="capitalize data-[state=active]:bg-blue-600 font-pixel">Locked</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {filteredBadges.length === 0 && (
        <div className="text-center py-12 px-6 bg-black/50 border-2 border-blue-900/80 font-pixel">
            <h3 className="text-xl text-white mb-2">No Badges Found</h3>
            <p className="text-blue-300">
            Try adjusting your filters.
            </p>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filteredBadges.map(({ badgeDetails, userBadge, isEarned }, index) => (
          <motion.div
            key={badgeDetails._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
          >
            {isEarned && userBadge ? (
              <BadgeCard badge={{ userBadge, badgeDetails }} />
            ) : (
              <LockedBadgeCard badge={badgeDetails} />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}