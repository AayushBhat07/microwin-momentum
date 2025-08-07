import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { Award, Calendar, Heart, MessageCircle, Sparkles, Star, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { AchievementCard } from "./AchievementCard";

interface AchievementFeedProps {
  limit?: number;
  showHeader?: boolean;
  title?: string;
  showPublic?: boolean;
}

export function AchievementFeed({ 
  limit, 
  showHeader = false, 
  title = "Achievements",
  showPublic = false 
}: AchievementFeedProps) {
  const userAchievements = useQuery(
    api.achievements.getUserAchievements, 
    showPublic ? "skip" : { limit }
  );
  const publicFeed = useQuery(
    api.achievements.getPublicFeed,
    showPublic ? { limit } : "skip"
  );

  const achievements = showPublic ? publicFeed : userAchievements;

  if (!achievements) {
    return (
      <Card>
        {showHeader && (
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-primary" />
              <span>{title}</span>
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (achievements.length === 0) {
    return (
      <Card>
        {showHeader && (
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-primary" />
              <span>{title}</span>
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="text-center py-8">
            <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {showPublic ? "No community wins yet" : "No achievements yet"}
            </h3>
            <p className="text-muted-foreground">
              {showPublic 
                ? "Be the first to share your wins with the community!" 
                : "Start celebrating your daily wins, no matter how small!"
              }
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      {showHeader && (
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-primary" />
            <span>{title}</span>
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className="space-y-4">
        {achievements.map((achievement, index) => (
          <motion.div
            key={achievement._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <AchievementCard 
              achievement={achievement} 
              showUser={showPublic}
            />
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}