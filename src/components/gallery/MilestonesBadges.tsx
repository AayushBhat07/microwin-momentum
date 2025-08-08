import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { Trophy, Target, Flame, Star } from "lucide-react";

export function MilestonesBadges() {
  const stats = useQuery(api.achievements.getAchievementStats, {});

  if (stats === undefined || stats === null) {
    return <div>Loading...</div>;
  }

  const milestones = [
    {
      id: "first-win",
      title: "First Win",
      description: "Logged your first achievement",
      icon: Star,
      threshold: 1,
      current: stats.totalAchievements,
      earned: stats.totalAchievements >= 1,
    },
    {
      id: "10-wins",
      title: "Getting Started",
      description: "Logged 10 achievements",
      icon: Target,
      threshold: 10,
      current: stats.totalAchievements,
      earned: stats.totalAchievements >= 10,
    },
    {
      id: "50-wins",
      title: "Momentum Builder",
      description: "Logged 50 achievements",
      icon: Flame,
      threshold: 50,
      current: stats.totalAchievements,
      earned: stats.totalAchievements >= 50,
    },
    {
      id: "100-wins",
      title: "Century Club",
      description: "Logged 100 achievements",
      icon: Trophy,
      threshold: 100,
      current: stats.totalAchievements,
      earned: stats.totalAchievements >= 100,
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Your Milestones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {milestones.map((milestone, index) => {
              const progress = Math.min((milestone.current / milestone.threshold) * 100, 100);
              const Icon = milestone.icon;
              
              return (
                <motion.div
                  key={milestone.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className={`relative overflow-hidden ${milestone.earned ? 'ring-2 ring-primary' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${milestone.earned ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-sm">{milestone.title}</h3>
                            {milestone.earned && (
                              <Badge variant="secondary" className="text-xs">
                                Earned!
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mb-3">
                            {milestone.description}
                          </p>
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                              <span>{milestone.current} / {milestone.threshold}</span>
                              <span>{Math.round(progress)}%</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}