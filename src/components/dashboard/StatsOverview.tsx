import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { Award, Calendar, Star, TrendingUp } from "lucide-react";

export function StatsOverview() {
  const stats = useQuery(api.userStats.getWeeklyStats, {});

  if (stats === undefined) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-black/50 p-4 rounded-lg border-2 border-blue-900/50 animate-pulse">
            <div className="h-4 bg-slate-700 rounded w-20 mb-4"></div>
            <div className="h-8 bg-slate-700 rounded w-16 mb-1"></div>
            <div className="h-3 bg-slate-700 rounded w-24"></div>
          </div>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Achievements",
      value: stats.totalAchievements,
      icon: Award,
      description: "All time wins",
      color: "text-yellow-400",
    },
    {
      title: "This Week",
      value: stats.weeklyAchievements,
      icon: Calendar,
      description: "Achievements this week",
      color: "text-green-400",
    },
    {
      title: "Total Points",
      value: stats.totalPoints,
      icon: Star,
      description: "Points earned",
      color: "text-blue-400",
    },
    {
      title: "Weekly Streak",
      value: stats.weeklyStreak,
      icon: TrendingUp,
      description: "Days active this week",
      color: "text-purple-400",
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <div className="bg-black/60 backdrop-blur-sm p-5 rounded-lg border-2 border-blue-900/80 hover:border-blue-600 transition-colors duration-300 h-full">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-pixel text-blue-300">
                {stat.title}
              </h3>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <div>
              <div className="text-3xl font-bold font-pixel text-white">{stat.value}</div>
              <p className="text-xs text-gray-400 font-pixel">{stat.description}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}