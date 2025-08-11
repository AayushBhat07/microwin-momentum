import { useAuth } from "@/hooks/use-auth";
import { Spinner } from "@/components/ui/spinner";
import { AuthButton } from "@/components/auth/AuthButton";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Check, Loader2, Plus, Trash2, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ACHIEVEMENT_CATEGORIES, categoryValidator } from "@/convex/schema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { Infer } from "convex/values";

type Category = Infer<typeof categoryValidator>;

function OnboardingStep1({ onComplete }: { onComplete: () => void }) {
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const updateProfile = useMutation(api.userProfile.updateProfile);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username.length < 3) {
      toast.error("Username must be at least 3 characters long.");
      return;
    }
    setIsLoading(true);
    try {
      await updateProfile({ username, bio });
      toast.success("Profile updated!");
      onComplete();
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
      <CardHeader>
        <CardTitle>Set Up Your Profile</CardTitle>
        <CardDescription>Choose a unique username and tell us a bit about yourself.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g., win-master-99"
              required
              minLength={3}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio (Optional)</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Your personal motto or a short intro."
              disabled={isLoading}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Continue
          </Button>
        </CardFooter>
      </form>
    </motion.div>
  );
}

function OnboardingStep2({ onComplete }: { onComplete: () => void }) {
  const [goals, setGoals] = useState<Partial<Doc<"dailyGoals">>[]>([]);
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalCategory, setNewGoalCategory] = useState<Category | "">("");

  const createGoal = useMutation(api.dailyGoals.create);
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
        category: newGoalCategory,
      });
      setGoals([...goals, { title: newGoalTitle, category: newGoalCategory }]);
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
      onComplete();
    } catch (error) {
      toast.error("Failed to complete step.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
      <CardHeader>
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
                {Object.entries(ACHIEVEMENT_CATEGORIES).map(([key, value]) => (
                  <SelectItem key={key} value={value.slug}>{key.charAt(0) + key.slice(1).toLowerCase()}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" size="icon" variant="outline"><Plus className="h-4 w-4" /></Button>
        </form>
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Today's Goals</h4>
          <AnimatePresence>
            {goals.length > 0 ? (
              goals.map((goal, index) => (
                <motion.div key={index} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} className="flex items-center justify-between text-sm p-2 bg-secondary rounded-md">
                  <span>{goal.title}</span>
                  <span className="text-xs px-2 py-1 bg-background rounded-full">{goal.category?.toLowerCase()}</span>
                </motion.div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">Add your first goal for today.</p>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleContinue} disabled={goals.length === 0 || isSubmitting} className="w-full">
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Continue
        </Button>
      </CardFooter>
    </motion.div>
  );
}

function OnboardingStep3({ onComplete }: { onComplete: () => void }) {
  const completeStep = useMutation(api.onboarding.completeOnboardingStep);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContinue = async () => {
    setIsSubmitting(true);
    try {
      await completeStep({ step: 3 });
      toast.success("Onboarding Complete! You've earned the 'Achievement Scholar' badge!");
      onComplete();
    } catch (error) {
      toast.error("Failed to complete step.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
      <CardHeader className="items-center text-center">
        <Trophy className="w-12 h-12 text-yellow-500" />
        <CardTitle className="mt-4">You're Ready to Win!</CardTitle>
        <CardDescription>
          Start logging your accomplishments, big and small. Each entry earns you points and helps build momentum.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground bg-secondary p-4 rounded-lg">
          <p className="font-semibold">What's an achievement?</p>
          <p>Anything you're proud of! Finished a workout, learned something new, or completed a task at work? Log it!</p>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleContinue} disabled={isSubmitting} className="w-full">
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Let's Go!
        </Button>
      </CardFooter>
    </motion.div>
  );
}

export default function Onboarding() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const [currentStep, setCurrentStep] = useState(user?.onboardingStep ?? 0);

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

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <OnboardingStep1 onComplete={() => setCurrentStep(1)} />;
      case 1:
        return <OnboardingStep2 onComplete={() => setCurrentStep(2)} />;
      case 2:
        return <OnboardingStep3 onComplete={() => setCurrentStep(3)} />;
      // Future steps will be rendered here
      default:
        return (
          <div>
            <CardHeader>
              <CardTitle>Onboarding Complete!</CardTitle>
              <CardDescription>You're all set. Time to start winning.</CardDescription>
            </CardHeader>
            <CardContent>
              <p>You have finished the onboarding process.</p>
            </CardContent>
            <CardFooter>
              <Button onClick={() => window.location.href = '/dashboard'} className="w-full">Go to Dashboard</Button>
            </CardFooter>
          </div>
        );
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center"
      style={{ backgroundImage: "url('/assets/onboarding2.png')" }}
    >
      <div className="absolute inset-0 bg-black/50" />
      <Card className="w-full max-w-md z-10 bg-background/80 backdrop-blur-sm border-white/20">
        {renderStep()}
      </Card>
    </div>
  );
}