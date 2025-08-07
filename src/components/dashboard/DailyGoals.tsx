import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ACHIEVEMENT_CATEGORIES } from "@/convex/schema";
import { useMutation, useQuery } from "convex/react";
import { motion } from "framer-motion";
import { Plus, Target, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface DailyGoalsProps {
  expanded?: boolean;
}

const categoryLabels = {
  HEALTH: "Health & Wellness",
  WORK: "Work & Career", 
  PERSONAL: "Personal Growth",
  SOCIAL: "Social & Relationships",
  LEARNING: "Learning & Education",
  CREATIVITY: "Creativity & Arts",
  OTHER: "Other",
};

export function DailyGoals({ expanded = false }: DailyGoalsProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<keyof typeof ACHIEVEMENT_CATEGORIES>("PERSONAL");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const today = new Date();
  today.setHours(12, 0, 0, 0); // Set to noon to avoid timezone issues
  
  const goals = useQuery(api.dailyGoals.getGoalsForDate, {
    date: today.getTime(),
  });
  
  const createGoal = useMutation(api.dailyGoals.create);
  const completeGoal = useMutation(api.dailyGoals.completeGoal);
  const deleteGoal = useMutation(api.dailyGoals.deleteGoal);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await createGoal({
        title: title.trim(),
        description: description.trim() || undefined,
        category: ACHIEVEMENT_CATEGORIES[category],
        targetDate: today.getTime(),
      });

      toast.success("Goal added! You've got this! 💪");
      
      setTitle("");
      setDescription("");
      setCategory("PERSONAL");
      setOpen(false);
    } catch (error) {
      toast.error("Failed to add goal. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComplete = async (goalId: string) => {
    try {
      await completeGoal({ goalId: goalId as any });
      toast.success("Goal completed! Great job! 🎉");
    } catch (error) {
      toast.error("Failed to complete goal. Please try again.");
    }
  };

  const handleDelete = async (goalId: string) => {
    try {
      await deleteGoal({ goalId: goalId as any });
      toast.success("Goal deleted");
    } catch (error) {
      toast.error("Failed to delete goal");
    }
  };

  if (!goals) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-primary" />
            <span>Today's Goals</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center space-x-3">
                <div className="w-4 h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded flex-1"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const completedGoals = goals.filter(goal => goal.isCompleted);
  const pendingGoals = goals.filter(goal => !goal.isCompleted);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-primary" />
            <span>Today's Goals</span>
            {goals.length > 0 && (
              <span className="text-sm text-muted-foreground">
                ({completedGoals.length}/{goals.length})
              </span>
            )}
          </CardTitle>
          
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-1" />
                Add Goal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Set a Daily Goal</DialogTitle>
                <DialogDescription>
                  What would you like to accomplish today?
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="goal-title">Goal *</Label>
                  <Input
                    id="goal-title"
                    placeholder="e.g., Read for 30 minutes"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="goal-description">Details (optional)</Label>
                  <Textarea
                    id="goal-description"
                    placeholder="Add any additional details..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={category} onValueChange={(value: keyof typeof ACHIEVEMENT_CATEGORIES) => setCategory(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(categoryLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting || !title.trim()}>
                    {isSubmitting ? "Adding..." : "Add Goal"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        {goals.length === 0 ? (
          <div className="text-center py-6">
            <Target className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No goals set for today</p>
            <p className="text-sm text-muted-foreground">Add your first goal to get started!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingGoals.map((goal, index) => (
              <motion.div
                key={goal._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-center space-x-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <Checkbox
                  checked={false}
                  onCheckedChange={() => handleComplete(goal._id)}
                />
                <div className="flex-1">
                  <p className="font-medium">{goal.title}</p>
                  {goal.description && (
                    <p className="text-sm text-muted-foreground">{goal.description}</p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(goal._id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </motion.div>
            ))}
            
            {completedGoals.length > 0 && (
              <>
                <div className="border-t pt-3 mt-4">
                  <p className="text-sm font-medium text-muted-foreground mb-2">Completed</p>
                </div>
                {completedGoals.map((goal) => (
                  <motion.div
                    key={goal._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center space-x-3 p-3 rounded-lg bg-accent/30"
                  >
                    <Checkbox checked={true} disabled />
                    <div className="flex-1">
                      <p className="font-medium line-through text-muted-foreground">{goal.title}</p>
                      {goal.description && (
                        <p className="text-sm text-muted-foreground line-through">{goal.description}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}