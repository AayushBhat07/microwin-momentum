import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ACHIEVEMENT_CATEGORIES, categoryValidator } from "@/convex/schema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Infer } from "convex/values";

type Category = Infer<typeof categoryValidator>;

const getLocalDate = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function GoalSettingPage({ onComplete }: { onComplete: () => void }) {
  const todaysGoals = useQuery(api.goals.getTodaysGoals, { date: getLocalDate() });
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalCategory, setNewGoalCategory] = useState<Category | "">("");

  const createGoal = useMutation(api.goals.create);
  const completeStep = useMutation(api.onboarding.completeOnboardingStep);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim() || !newGoalCategory) {
      toast.error("Please provide a title and category for your goal.");
      return;
    }
    try {
      await createGoal({
        title: newGoalTitle,
        category: newGoalCategory as Category,
        targetDate: getLocalDate(),
      });
      setNewGoalTitle("");
      setNewGoalCategory("");
      toast.success("Goal added!");
    } catch (error) {
      console.error("Failed to add goal:", error);
      toast.error("Failed to add goal. Please try again.");
    }
  };

  const handleContinue = async () => {
    setIsSubmitting(true);
    try {
      await completeStep({ step: 3 });
      toast.success("Step 3 Complete! You've earned the 'Ready for Action' badge!");
      onComplete();
    } catch (error) {
      toast.error("Failed to complete step.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
      <CardHeader className="font-pixel">
        <CardTitle>Set Your First Goals</CardTitle>
        <CardDescription>What do you want to accomplish today? Add at least one goal to continue.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleAddGoal} className="flex items-end gap-2">
          <div className="flex-grow space-y-1">
            <Label htmlFor="goal-title">Goal</Label>
            <Input id="goal-title" placeholder="e.g., Go for a 30-min walk" value={newGoalTitle} onChange={(e) => setNewGoalTitle(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="goal-category">Category</Label>
            <Select value={newGoalCategory} onValueChange={(v) => setNewGoalCategory(v as Category)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(ACHIEVEMENT_CATEGORIES).map((cat) => (
                  <SelectItem key={cat.slug} value={cat.slug}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" size="icon" variant="outline"><Plus className="h-4 w-4" /></Button>
        </form>
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Today's Goals</h4>
          <AnimatePresence>
            {todaysGoals === undefined && (
              <div className="flex justify-center items-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}
            {todaysGoals && todaysGoals.length > 0 ? (
              todaysGoals.map((goal: any) => (
                <motion.div key={goal._id} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} className="flex items-center justify-between text-sm p-2 bg-secondary rounded-md">
                  <span>{goal.title}</span>
                  <span className="text-xs px-2 py-1 bg-background rounded-full">{goal.category?.toLowerCase()}</span>
                </motion.div>
              ))
            ) : (
              todaysGoals && <p className="text-sm text-muted-foreground text-center py-4">Add your first goal for today.</p>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleContinue} disabled={(todaysGoals?.length ?? 0) === 0 || isSubmitting} className="w-full">
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Continue
        </Button>
      </CardFooter>
    </motion.div>
  );
}