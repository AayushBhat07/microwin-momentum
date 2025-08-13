import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, Star } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import * as Icons from "lucide-react";
import type { Doc } from "@/convex/_generated/dataModel";

const getIcon = (name: string | undefined): LucideIcon => {
  if (!name) return Star;
  const icon = (Icons as any)[name];
  return icon || Star;
};

interface QuickPresetsTabProps {
  onSelect: (goal: Doc<"dailyGoals">) => void;
}

const getLocalDate = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export function QuickPresetsTab({ onSelect }: QuickPresetsTabProps) {
  const todaysGoals = useQuery(api.goals.getTodaysGoals, { date: getLocalDate() });
  const categories = useQuery(api.achievements.getCategories);

  if (todaysGoals === undefined || categories === undefined) {
    return (
      <div className="flex h-24 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (todaysGoals.length === 0) {
    return (
      <div className="flex h-24 items-center justify-center text-center text-sm text-muted-foreground">
        You have no daily goals set.
      </div>
    );
  }

  const goalsWithIcons = todaysGoals.map((goal: any) => {
    const categoryInfo = categories.find((c) => c.slug === goal.category);
    const Icon = getIcon(categoryInfo?.iconName);
    return { ...goal, Icon };
  });

  return (
    <div className="grid grid-cols-3 gap-4">
      {goalsWithIcons.map((goal: any) => (
        <Button
          key={goal._id}
          variant="outline"
          className="h-24 flex flex-col gap-2"
          onClick={() => onSelect(goal)}
          disabled={goal.isCompleted}
        >
          {goal.isCompleted ? (
            <CheckCircle className="h-6 w-6 text-green-500" />
          ) : (
            <goal.Icon className="h-6 w-6" />
          )}
          <span className="text-center text-xs">{goal.title}</span>
        </Button>
      ))}
    </div>
  );
}