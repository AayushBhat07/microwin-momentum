import { useAuth } from "@/hooks/use-auth";
import { Spinner } from "@/components/ui/spinner";
import { AuthButton } from "@/components/auth/AuthButton";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ProfileSetupPage from "./onboarding/ProfileSetup";
import GoalSettingPage from "./onboarding/GoalSetting";
import { useNavigate } from "react-router";

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
    <motion.div
      key="step3"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <CardHeader className="items-center text-center font-pixel">
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
  const navigate = useNavigate();
  const completeStep = useMutation(api.onboarding.completeOnboardingStep);

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

  const onCompleteStep = (step: number) => {
    completeStep({ step }).catch((err) => {
      toast.error("Failed to save progress.");
      console.error(err);
    });
  };

  const renderStep = () => {
    const currentStep = user.onboardingStep ?? 0;
    switch (currentStep) {
      case 0:
        return <ProfileSetupPage onComplete={() => onCompleteStep(1)} />;
      case 1:
        return <GoalSettingPage onComplete={() => onCompleteStep(2)} />;
      case 2:
        return <OnboardingStep3 onComplete={() => navigate('/dashboard')} />;
      default:
        return (
          <motion.div
            key="step-complete"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CardHeader>
              <CardTitle>Onboarding Complete!</CardTitle>
              <CardDescription>You're all set. Time to start winning.</CardDescription>
            </CardHeader>
            <CardContent>
              <p>You have finished the onboarding process.</p>
            </CardContent>
            <CardFooter>
              <Button onClick={() => navigate('/dashboard')} className="w-full">Go to Dashboard</Button>
            </CardFooter>
          </motion.div>
        );
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center"
      style={{ backgroundImage: "url('/assets/onboarding2.png')" }}
    >
      <div className="absolute inset-0 bg-black/50" />
      <Card className="w-full max-w-md z-10 bg-background/80 backdrop-blur-sm border-foreground/20 shadow-[8px_8px_0px_#00000090]">
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>
      </Card>
    </div>
  );
}