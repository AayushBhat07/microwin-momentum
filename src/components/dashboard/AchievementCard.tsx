import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useMutation, useQuery } from "convex/react";
import { motion } from "framer-motion";
import { Calendar, Heart, MessageCircle, Sparkles, Star, Trash2, Zap } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

interface AchievementCardProps {
  achievement: any;
  showUser?: boolean;
}

const categoryEmojis = {
  health: "💪",
  work: "💼",
  personal: "🌱",
  social: "👥",
  learning: "📚",
  creativity: "🎨",
  other: "⭐",
};

export function AchievementCard({ achievement, showUser = false }: AchievementCardProps) {
  const { user } = useAuth();
  const celebrate = useMutation(api.achievements.celebrate);
  const deleteAchievement = useMutation(api.achievements.deleteAchievement);
  const celebrations = useQuery(api.achievements.getCelebrations, {
    achievementId: achievement._id,
  });

  const isOwner = user?._id === achievement.userId;
  const userCelebration = celebrations?.find(c => c.userId === user?._id);

  const handleCelebrate = async (type: "celebrate" | "inspire" | "motivate") => {
    try {
      await celebrate({
        achievementId: achievement._id,
        type,
      });
      toast.success("Celebration sent! 🎉");
    } catch (error) {
      toast.error("Failed to celebrate. Please try again.");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this achievement?")) return;
    
    try {
      await deleteAchievement({ achievementId: achievement._id });
      toast.success("Achievement deleted");
    } catch (error) {
      toast.error("Failed to delete achievement");
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-lg">
                {categoryEmojis[achievement.category as keyof typeof categoryEmojis]}
              </span>
              {showUser && achievement.user && (
                <span className="text-sm font-medium text-muted-foreground">
                  {achievement.user.name || "Anonymous"}
                </span>
              )}
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                <span>{formatDistanceToNow(achievement.completedAt)} ago</span>
              </div>
            </div>
            
            <h3 className="font-semibold text-lg mb-1">{achievement.title}</h3>
            
            {achievement.description && (
              <p className="text-muted-foreground text-sm mb-3">
                {achievement.description}
              </p>
            )}
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1 text-primary">
                <Star className="w-4 h-4" />
                <span className="text-sm font-medium">{achievement.points} pts</span>
              </div>
              
              {achievement.celebrationCount > 0 && (
                <div className="flex items-center space-x-1 text-muted-foreground">
                  <Heart className="w-4 h-4" />
                  <span className="text-sm">{achievement.celebrationCount}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {isOwner && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
        
        {!isOwner && (
          <div className="flex items-center space-x-2 mt-4 pt-3 border-t">
            <Button
              variant={userCelebration?.type === "celebrate" ? "default" : "outline"}
              size="sm"
              onClick={() => handleCelebrate("celebrate")}
              className="flex items-center space-x-1"
            >
              <Sparkles className="w-3 h-3" />
              <span>Celebrate</span>
            </Button>
            <Button
              variant={userCelebration?.type === "inspire" ? "default" : "outline"}
              size="sm"
              onClick={() => handleCelebrate("inspire")}
              className="flex items-center space-x-1"
            >
              <Heart className="w-3 h-3" />
              <span>Inspire</span>
            </Button>
            <Button
              variant={userCelebration?.type === "motivate" ? "default" : "outline"}
              size="sm"
              onClick={() => handleCelebrate("motivate")}
              className="flex items-center space-x-1"
            >
              <Zap className="w-3 h-3" />
              <span>Motivate</span>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
