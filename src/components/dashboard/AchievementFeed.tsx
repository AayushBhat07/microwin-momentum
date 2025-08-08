import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { usePaginatedQuery, useQuery } from "convex/react";
import { motion } from "framer-motion";
import { Award, Globe, Loader2 } from "lucide-react";
import { AchievementCard } from "./AchievementCard";

interface AchievementFeedProps {
  showPublic?: boolean;
}

const UserFeed = () => {
  const userAchievements = useQuery(api.achievements.getUserAchievements, {
    limit: 20,
  });

  return (
    <div className="space-y-4">
      {userAchievements === undefined ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-24 bg-muted rounded-lg"></div>
            </div>
          ))}
        </div>
      ) : userAchievements.length === 0 ? (
        <div className="text-center py-12">
          <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">
            No achievements yet
          </h3>
          <p className="text-sm text-muted-foreground">
            Start logging your wins to see them here!
          </p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          {userAchievements.map((achievement, index) => (
            <motion.div
              key={achievement._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <AchievementCard achievement={achievement} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

const PublicFeed = () => {
  const {
    results: publicFeed,
    status: publicFeedStatus,
    loadMore: loadMorePublic,
  } = usePaginatedQuery(
    api.achievements.getPublicFeed,
    {},
    { initialNumItems: 10 },
  );

  return (
    <div className="space-y-4">
      {publicFeedStatus === "LoadingFirstPage" ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-24 bg-muted rounded-lg"></div>
            </div>
          ))}
        </div>
      ) : publicFeed.length === 0 ? (
        <div className="text-center py-12">
          <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">
            No public achievements yet
          </h3>
          <p className="text-sm text-muted-foreground">
            Be the first to share your wins with the community!
          </p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          {publicFeed.map((achievement, index) => (
            <motion.div
              key={achievement._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <AchievementCard achievement={achievement} showUser={true} />
            </motion.div>
          ))}

          {publicFeedStatus === "CanLoadMore" && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={() => loadMorePublic(5)}
                className="flex items-center space-x-2"
              >
                <span>Load More</span>
              </Button>
            </div>
          )}

          {publicFeedStatus === "LoadingMore" && (
            <div className="flex justify-center pt-4">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export function AchievementFeed({ showPublic = false }: AchievementFeedProps) {
  if (showPublic) {
    return <PublicFeed />;
  }
  return <UserFeed />;
}