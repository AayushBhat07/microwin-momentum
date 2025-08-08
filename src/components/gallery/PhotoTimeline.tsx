import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { ACHIEVEMENT_CATEGORIES } from "@/convex/schema";
import { Doc } from "@/convex/_generated/dataModel";

export function PhotoTimeline() {
  const achievements = useQuery(api.achievements.getMyAchievements, {});

  if (!achievements) {
    return <div className="animate-pulse h-64 bg-muted rounded" />;
  }

  const photoAchievements = achievements.filter((a: Doc<"achievements">) => a.photoStorageId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Photo Memories</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photoAchievements.map((achievement: Doc<"achievements">) => {
            const category = ACHIEVEMENT_CATEGORIES.find(c => c.slug === achievement.category);
            return (
              <motion.div
                key={achievement._id}
                whileHover={{ scale: 1.05 }}
                className="relative group cursor-pointer"
              >
                <img
                  src={`/api/storage/${achievement.photoStorageId}`}
                  alt={achievement.title}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex flex-col justify-end p-3">
                  <h4 className="text-white font-semibold text-sm">{achievement.title}</h4>
                  {category && (
                    <Badge variant="secondary" className="text-xs w-fit mt-1">
                      {category.name}
                    </Badge>
                  )}
                  <p className="text-white/80 text-xs mt-1">
                    {formatDistanceToNow(new Date(achievement.loggedAt), { addSuffix: true })}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}