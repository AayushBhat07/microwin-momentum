import { useAuth } from "@/hooks/use-auth";
import { Spinner } from "@/components/ui/spinner";
import { AuthButton } from "@/components/auth/AuthButton";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Trophy, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router";

export default function AchievementIntroPage() {
  const { isLoading, isAuthenticated, user } = useAuth();
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

  const handleContinue = async () => {
    setIsSubmitting(true);
    try {
      await completeStep({ step: 3 });
      toast.success("Step 3 Complete! You've earned the 'Achievement Scholar' badge!");
      navigate("/onboarding/preferences");
    } catch (error) {
      toast.error("Failed to complete step.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
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
      </Card>
    </div>
  );
}