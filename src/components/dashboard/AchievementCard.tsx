import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { Star, Globe, Lock } from "lucide-react";
import { Doc } from "@/convex/_generated/dataModel";

interface AchievementCardProps {
  achievement: Doc<"achievements"> & {
    user?: { name?: string; image?: string } | null;
  };
  showUser?: boolean;
}

export function AchievementCard({ achievement, showUser = false }: AchievementCardProps) {
  const getCategoryColor = (category: string) => {
    const colors = {
      HEALTH: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      WORK: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      PERSONAL: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      SOCIAL: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
      LEARNING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      CREATIVITY: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      OTHER: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
    };
    return colors[category as keyof typeof colors] || colors.OTHER;
  };

  const formatCategory = (category: string) => {
    return category.charAt(0) + category.slice(1).toLowerCase();
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {showUser && achievement.user && (
              <div className="flex items-center space-x-2 mb-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={achievement.user.image} />
                  <AvatarFallback className="text-xs">
                    {achievement.user.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground">
                  {achievement.user.name || "Anonymous"}
                </span>
              </div>
            )}
            <h3 className="font-semibold text-lg leading-tight">
              {achievement.title}
            </h3>
            {achievement.description && (
              <p className="text-muted-foreground text-sm mt-1">
                {achievement.description}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2 ml-4">
            {achievement.isPublic ? (
              <Globe className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Lock className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge className={getCategoryColor(achievement.category)}>
              {formatCategory(achievement.category)}
            </Badge>
            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
              <Star className="h-3 w-3 fill-current text-yellow-500" />
              <span>{achievement.points} points</span>
            </div>
          </div>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(achievement._creationTime), {
              addSuffix: true,
            })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}