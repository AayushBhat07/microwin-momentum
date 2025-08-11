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

  const dailyGoals = useQuery(api.goals.getTodaysGoals);

  const createGoal = useMutation(api.goals.create);
  const completeGoal = useMutation(api.goals.complete);
  const deleteGoal = useMutation(api.goals.remove);

  const handleCreateGoal = async () => {
    if (newGoalTitle.trim() === "") {
      toast.error("Quest title cannot be empty.");
      return;
    }
    setIsCreating(true);
    try {
      await createGoal({
        title: newGoalTitle.trim(),
        category: "personal",
      });
      setNewGoalTitle("");
      toast.success("New Quest Added!");
    } catch (error) {
      toast.error("Failed to add quest.");
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCompleteGoal = async (goalId: any, isCompleted: boolean) => {
    try {
      if (isCompleted) {
        await completeGoal({ goalId });
        toast.success("Quest Complete! +10 XP");
      }
    } catch (error) {
      toast.error("Failed to update quest.");
      console.error(error);
    }
  };

  const handleDeleteGoal = async (goalId: any) => {
    try {
      await deleteGoal({ goalId });
      toast.success("Quest Abandoned.");
    } catch (error) {
      toast.error("Failed to remove quest.");
      console.error(error);
    }
  };

  return (
    <Card className="bg-background/80 backdrop-blur-sm border-primary/50 shadow-[4px_4px_0px_var(--primary)] font-pixel">
      <CardHeader>
        <CardTitle className="text-primary text-2xl">Today's Quests</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Add a new quest..."
            value={newGoalTitle}
            onChange={(e) => setNewGoalTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreateGoal()}
            disabled={isCreating}
            className="font-pixel bg-background/80 focus:ring-secondary"
          />
          <Button onClick={handleCreateGoal} disabled={isCreating} variant="secondary" className="font-pixel">
            {isCreating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
          {dailyGoals === undefined && (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
          {dailyGoals && dailyGoals.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No quests for today. Add one to begin your adventure!
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
                className="flex items-center justify-between p-3 rounded-md bg-black/20"
              >
                <div className="flex items-center gap-3">
                  <Checkbox
                    id={goal._id}
                    checked={goal.isCompleted}
                    onCheckedChange={(checked) =>
                      handleCompleteGoal(goal._id, checked as boolean)
                    }
                    className="border-primary data-[state=checked]:bg-primary"
                  />
                  <label
                    htmlFor={goal._id}
                    className={`text-base text-white ${
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
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}