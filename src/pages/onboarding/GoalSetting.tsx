import { useAuth } from "@/hooks/use-auth";
import { Spinner } from "@/components/ui/spinner";
import { AuthButton } from "@/components/auth/AuthButton";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ACHIEVEMENT_CATEGORIES, categoryValidator } from "@/convex/schema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router";
import { Infer } from "convex/values";

type Category = Infer<typeof categoryValidator>;

export default function GoalSettingPage() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const todaysGoals = useQuery(api.dailyGoals.getTodaysGoals);
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalCategory, setNewGoalCategory] = useState<Category | "">("");

  const createGoal = useMutation(api.dailyGoals.create);
  const completeStep = useMutation(api.onboarding.completeOnboardingStep);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="h-12 w-12" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <p>You need to sign in to continue.</p>
        <AuthButton />
      </div>
    );
  }

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
      await completeStep({ step: 2 });
      toast.success("Step 2 Complete! You've earned the 'Ready for Action' badge!");
      navigate("/onboarding/achievements");
    } catch (error) {
      toast.error("Failed to complete step.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center"
      style={{ backgroundImage: "url('/assets/onboarding2.png')" }}
    >
      <div className="absolute inset-0 bg-black/50" />
      <Card className="w-full max-w-md z-10 bg-background/80 backdrop-blur-sm border-foreground/20 shadow-[8px_8px_0px_#00000090]">
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
                  todaysGoals.map((goal) => (
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
      </Card>
    </div>
  );
}