import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { BadgeCard } from "./BadgeCard";
import { ProgressRingCard } from "./ProgressRingCard";
import { Loader2 } from "lucide-react";

export function BadgesMilestonesSection() {
  const userBadges = useQuery(api.badges.getUserBadges);
  const nearMissBadges = useQuery(api.badges.getNearMissBadges);

  const recentBadges = userBadges?.slice(0, 6);
  const featuredBadges = userBadges?.filter(b => b.userBadge.isFeatured);

  if (userBadges === undefined || nearMissBadges === undefined) {
    return (
      <div className="bg-black/50 backdrop-blur-sm border border-blue-500/50 rounded-lg p-6 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-300" />
        <p className="font-pixel text-blue-300 mt-2">Loading Badges...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Featured Badges */}
      {featuredBadges && featuredBadges.length > 0 && (
        <div>
          <h2 className="text-2xl font-pixel text-shadow-pixel text-white mb-4">Featured Badges</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {featuredBadges.map((badge) => (
              <BadgeCard key={badge.userBadge._id} badge={badge} />
            ))}
          </div>
        </div>
      )}

      {/* Near-Miss Milestones */}
      <div>
        <h2 className="text-2xl font-pixel text-shadow-pixel text-white mb-4">Almost There!</h2>
        {nearMissBadges.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {nearMissBadges.map((badge) => (
               <ProgressRingCard
                 key={badge._id}
                 progress={Math.round(badge.progress)}
                 current={badge.current}
                 target={badge.target}
                 name={badge.name}
                 description={badge.description}
               />
            ))}
          </div>
        ) : (
           <div className="bg-black/50 backdrop-blur-sm border border-blue-500/50 rounded-lg p-6">
            <p className="font-pixel text-blue-300 text-center">No milestones in progress. Keep logging wins to unlock more!</p>
          </div>
        )}
      </div>

      {/* Recent Badges */}
      <div>
        <h2 className="text-2xl font-pixel text-shadow-pixel text-white mb-4">Recent Unlocks</h2>
        {recentBadges && recentBadges.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {recentBadges.map((badge) => (
              <BadgeCard key={badge.userBadge._id} badge={badge} />
            ))}
          </div>
        ) : (
          <div className="bg-black/50 backdrop-blur-sm border border-blue-500/50 rounded-lg p-6">
            <p className="font-pixel text-blue-300 text-center">Your badge collection is empty. Log your first win to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
}