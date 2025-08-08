import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

export function HeatMapCalendar() {
  const heatMapData = useQuery(api.achievements.getHeatMapData) || [];

  // Create a map for quick lookup
  const dataMap = heatMapData.reduce((acc: Record<string, any>, item: any) => {
    acc[item.date] = item;
    return acc;
  }, {});

  // Generate calendar grid for the last year
  const generateCalendarData = () => {
    const data = [];
    const today = new Date();
    const startDate = new Date(today);
    startDate.setFullYear(today.getFullYear() - 1);
    
    for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const dayData = dataMap[dateStr];
      data.push({
        date: dateStr,
        count: dayData?.count || 0,
        points: dayData?.points || 0,
      });
    }
    return data;
  };

  const calendarData = generateCalendarData();
  
  if (heatMapData === undefined) {
    return (
      <div className="flex justify-center py-8">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  const maxCount = Math.max(...heatMapData.map((d: any) => d.count), 1);

  const getIntensity = (count: number) => {
    if (count === 0) return 0;
    if (count <= maxCount * 0.25) return 1;
    if (count <= maxCount * 0.5) return 2;
    if (count <= maxCount * 0.75) return 3;
    return 4;
  };

  const getColor = (intensity: number) => {
    const colors = [
      'bg-muted',
      'bg-primary/20',
      'bg-primary/40',
      'bg-primary/60',
      'bg-primary/80',
    ];
    return colors[intensity];
  };

  // Group by weeks
  const weeks = [];
  for (let i = 0; i < calendarData.length; i += 7) {
    weeks.push(calendarData.slice(i, i + 7));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Heat Map</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Calendar Grid */}
          <div className="overflow-x-auto">
            <div className="grid grid-cols-53 gap-1 min-w-[800px]">
              {calendarData.map((day) => {
                const intensity = getIntensity(day.count);
                return (
                  <div
                    key={day.date}
                    className={`w-3 h-3 rounded-sm ${getColor(intensity)} border border-border/50`}
                    title={`${day.date}: ${day.count} achievements, ${day.points} points`}
                  />
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>Less</span>
              {[0, 1, 2, 3, 4].map((intensity) => (
                <div
                  key={intensity}
                  className={`w-3 h-3 rounded-sm ${getColor(intensity)} border border-border/50`}
                />
              ))}
              <span>More</span>
            </div>
            <div>
              {heatMapData.reduce((sum: number, item: any) => sum + item.count, 0)} total achievements
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}