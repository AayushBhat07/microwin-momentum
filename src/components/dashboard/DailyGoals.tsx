import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";

export function DailyGoals() {
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dailyGoals = useQuery(api.dailyGoals.getGoalsForDate, {
    date: today.getTime(),
  });

  const createGoal = useMutation(api.dailyGoals.create);
  const completeGoal = useMutation(api.dailyGoals.completeGoal);
  const deleteGoal = useMutation(api.dailyGoals.deleteGoal);

  const handleCreateGoal = async () => {
    if (newGoalTitle.trim() === "") {
      toast.error("Goal title cannot be empty.");
      return;
    }
    setIsCreating(true);
    try {
      await createGoal({
        title: newGoalTitle.trim(),
        // Using 'PERSONAL' as a default category for simplicity
        category: "PERSONAL",
        targetDate: today.getTime(),
      });
      setNewGoalTitle("");
      toast.success("New goal added!");
    } catch (error) {
      toast.error("Failed to add goal.");
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCompleteGoal = async (goalId: any, isCompleted: boolean) => {
    try {
      if (isCompleted) {
        await completeGoal({ goalId });
        toast.success("Goal completed! Great job!");
      }
      // Note: There's no "uncomplete" functionality in the backend yet.
      // We are only handling the completion.
    } catch (error) {
      toast.error("Failed to update goal.");
      console.error(error);
    }
  };

  const handleDeleteGoal = async (goalId: any) => {
    try {
      await deleteGoal({ goalId });
      toast.success("Goal removed.");
    } catch (error) {
      toast.error("Failed to remove goal.");
      console.error(error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Today's Goals</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Add a new goal for today..."
            value={newGoalTitle}
            onChange={(e) => setNewGoalTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreateGoal()}
            disabled={isCreating}
          />
          <Button onClick={handleCreateGoal} disabled={isCreating}>
            {isCreating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="space-y-2">
          {dailyGoals === undefined && (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}
          {dailyGoals && dailyGoals.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No goals for today yet. Add one to get started!
            </p>
          )}
          <AnimatePresence>
            {dailyGoals?.map((goal) => (
              <motion.div
                key={goal._id}
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <Checkbox
                    id={goal._id}
                    checked={goal.isCompleted}
                    onCheckedChange={(checked) =>
                      handleCompleteGoal(goal._id, checked as boolean)
                    }
                  />
                  <label
                    htmlFor={goal._id}
                    className={`text-sm ${
                      goal.isCompleted ? "line-through text-muted-foreground" : ""
                    }`}
                  >
                    {goal.title}
                  </label>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleDeleteGoal(goal._id)}
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}