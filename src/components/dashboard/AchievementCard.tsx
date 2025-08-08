import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { Heart, MessageCircle, Share2, Trophy, User } from "lucide-react";
import { ACHIEVEMENT_CATEGORIES } from "@/convex/schema";
import { Doc } from "@/convex/_generated/dataModel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router";

interface AchievementCardProps {
  achievement: Doc<"achievements"> & { user?: Doc<"users"> };
  showUser?: boolean;
}

export function AchievementCard({ achievement, showUser = false }: AchievementCardProps) {
  const category = ACHIEVEMENT_CATEGORIES.find(c => c.slug === achievement.category);

  return (
    <Card className="overflow-hidden">
      {achievement.photoUrl && (
        <img src={achievement.photoUrl} alt={achievement.title} className="w-full h-48 object-cover" />
      )}
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            {category && (
              <Badge style={{ backgroundColor: category.colorHex, color: 'white' }} className="mb-2">
                {category.name}
              </Badge>
            )}
            <h3 className="font-bold text-lg">{achievement.title}</h3>
            {achievement.description && <p className="text-sm text-muted-foreground mt-1">{achievement.description}</p>}
          </div>
          <div className="text-right flex-shrink-0 ml-4">
            <div className="flex items-center gap-1 font-bold text-lg text-amber-500">
              <Trophy className="w-5 h-5" />
              <span>{achievement.pointsEarned}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(achievement.loggedAt), { addSuffix: true })}
            </p>
          </div>
        </div>

        {showUser && achievement.user && (
          <Link to={`/u/${achievement.user.username}`} className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
            <Avatar className="h-8 w-8">
              <AvatarImage src={achievement.user.image} />
              <AvatarFallback>
                <User className="w-4 h-4" />
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm">{achievement.user.name}</p>
              <p className="text-xs text-muted-foreground">@{achievement.user.username}</p>
            </div>
          </Link>
        )}

        <div className="flex items-center justify-between mt-4 text-muted-foreground">
          <div className="flex gap-4">
            <Button variant="ghost" size="sm" className="flex items-center gap-1">
              <Heart className="w-4 h-4" /> 0
            </Button>
            <Button variant="ghost" size="sm" className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4" /> 0
            </Button>
          </div>
          <Button variant="ghost" size="sm">
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}