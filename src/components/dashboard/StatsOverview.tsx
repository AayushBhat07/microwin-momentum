import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { Award, Calendar, Star, TrendingUp, Zap } from "lucide-react";
import { MotivationalQuote } from "./MotivationalQuote";

export function StatsOverview() {
  const userStats = useQuery(api.userStats.getUserStats);
  const weeklySummary = useQuery(api.userStats.getWeeklySummary);

  if (!userStats || !weeklySummary) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-20"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-16 mb-2"></div>
              <div className="h-3 bg-muted rounded w-24"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats = [
    {
      title: "Current Streak",
      value: userStats.currentStreak,
      suffix: userStats.currentStreak === 1 ? "day" : "days",
      icon: Zap,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Total Points",
      value: userStats.totalPoints,
      suffix: "pts",
      icon: Star,
      color: "text-chart-2",
      bgColor: "bg-chart-2/10",
    },
    {
      title: "Level",
      value: userStats.level,
      suffix: "",
      icon: Award,
      color: "text-chart-3",
      bgColor: "bg-chart-3/10",
    },
    {
      title: "This Week",
      value: weeklySummary.totalAchievements,
      suffix: weeklySummary.totalAchievements === 1 ? "win" : "wins",
      icon: TrendingUp,
      color: "text-chart-4",
      bgColor: "bg-chart-4/10",
    },
  ];

  return (
    <div className="space-y-6">
      <MotivationalQuote />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stat.value}
                  {stat.suffix && (
                    <span className="text-sm font-normal text-muted-foreground ml-1">
                      {stat.suffix}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
