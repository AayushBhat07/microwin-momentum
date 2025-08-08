import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { Star, Calendar } from "lucide-react";

interface AchievementCardProps {
  achievement: {
    _id: string;
    title: string;
    description?: string;
    category: string;
    points: number;
    _creationTime: number;
    user?: {
      name?: string;
      image?: string;
    } | null;
  };
  showUser?: boolean;
}

export function AchievementCard({ achievement, showUser = false }: AchievementCardProps) {
  const categoryColors = {
    HEALTH: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    WORK: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    PERSONAL: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    SOCIAL: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
    LEARNING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    CREATIVITY: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    OTHER: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-semibold text-lg leading-tight mb-1">
                {achievement.title}
              </h3>
              {achievement.description && (
                <p className="text-sm text-muted-foreground mb-2">
                  {achievement.description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-1 text-yellow-600 ml-2">
              <Star className="h-4 w-4 fill-current" />
              <span className="text-sm font-medium">{achievement.points}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge 
                variant="secondary" 
                className={categoryColors[achievement.category as keyof typeof categoryColors]}
              >
                {achievement.category.toLowerCase()}
              </Badge>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {new Date(achievement._creationTime).toLocaleDateString()}
              </div>
            </div>

            {showUser && achievement.user && (
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={achievement.user.image} />
                  <AvatarFallback className="text-xs">
                    {achievement.user.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground">
                  {achievement.user.name || "Anonymous"}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}