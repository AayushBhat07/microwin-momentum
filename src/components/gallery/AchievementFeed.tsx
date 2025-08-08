import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Trophy } from "lucide-react";
import { ACHIEVEMENT_CATEGORIES } from "@/convex/schema";
import { Doc } from "@/convex/_generated/dataModel";

export function AchievementFeed() {
  const achievements = useQuery(api.achievements.getMyAchievements, {});

  if (!achievements) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Achievements</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
      {achievements.map((achievement: Doc<"achievements">, index: number) => {
        const category = ACHIEVEMENT_CATEGORIES.find(c => c.slug === achievement.category);
        return (
          <motion.div
            key={achievement._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-4 border rounded-lg"
          >
            <div className="flex items-center gap-3">
              <Trophy className="w-5 h-5 text-amber-500" />
              <div>
                <h4 className="font-semibold">{achievement.title}</h4>
                {category && (
                  <Badge variant="secondary" className="text-xs">
                    {category.name}
                  </Badge>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-amber-500">+{achievement.pointsEarned}</p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(achievement.loggedAt), { addSuffix: true })}
              </p>
            </div>
          </motion.div>
        );
      })}
      </CardContent>
    </Card>
  );
}