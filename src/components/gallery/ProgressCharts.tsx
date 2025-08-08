import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { ACHIEVEMENT_CATEGORIES } from "@/convex/schema";

export function ProgressCharts() {
  const stats = useQuery(api.achievements.getAchievementStats, {});

  if (!stats) {
    return <div className="animate-pulse h-64 bg-muted rounded" />;
  }

  const categoryData = stats.categories.map((cat: { name: string; count: number; points: number }) => {
    const categoryInfo = ACHIEVEMENT_CATEGORIES.find(c => c.slug === cat.name);
    return {
      name: categoryInfo?.name || cat.name,
      count: cat.count,
      points: cat.points,
      color: categoryInfo?.colorHex || "#8884d8"
    };
  });

  const pieData = categoryData.map((data: { name: string; count: number; color: string }) => ({
    name: data.name,
    value: data.count,
    fill: data.color
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Achievements by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="var(--color-primary)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Category Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}