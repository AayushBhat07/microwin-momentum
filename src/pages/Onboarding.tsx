import { useAuth } from "@/hooks/use-auth";
import { Spinner } from "@/components/ui/spinner";
import { AuthButton } from "@/components/auth/AuthButton";
import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ProfileSetupPage from "./onboarding/ProfileSetup";
import WellnessSupport from "./onboarding/WellnessSupport";
import GoalSettingPage from "./onboarding/GoalSetting";
import { useNavigate } from "react-router";

function OnboardingStep4({ onComplete }: { onComplete: () => void }) {
  const completeStep = useMutation(api.onboarding.completeOnboardingStep);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContinue = async () => {
    setIsSubmitting(true);
    try {
      await completeStep({ step: 4 });
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
      key="step4"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <CardHeader className="items-center text-center font-pixel">
        <div className="p-4 bg-yellow-400/20 border-2 border-yellow-500">
            <Trophy className="w-12 h-12 text-yellow-400" />
        </div>
        <CardTitle className="mt-4 text-2xl text-white text-shadow-pixel">You're Ready to Win!</CardTitle>
        <CardDescription className="text-blue-300">
          Start logging your accomplishments, big and small. Each entry earns you points and helps build momentum.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-blue-300 bg-black/50 border-2 border-blue-900/80 p-4 space-y-2">
          <p className="font-bold text-white">What's an achievement?</p>
          <p>Anything you're proud of! Finished a workout, learned something new, or completed a task at work? Log it!</p>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleContinue} 
          disabled={isSubmitting} 
          className="w-full font-pixel text-lg bg-blue-600 text-white border-2 border-blue-700 shadow-[4px_4px_0px_#000] hover:bg-blue-700 active:translate-y-1 active:translate-x-1 active:shadow-none transition-all"
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Let's Go!
        </Button>
      </CardFooter>
    </motion.div>
  );
}

export default function Onboarding() {
  const { isLoading, isAuthenticated, user, signOut } = useAuth();
  const navigate = useNavigate();
  const completeStep = useMutation(api.onboarding.completeOnboardingStep);
  const [showNotFoundError, setShowNotFoundError] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated && !user) {
      const timer = setTimeout(() => {
        setShowNotFoundError(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isLoading, isAuthenticated, user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="h-12 w-12" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <p>You need to sign in to continue.</p>
        <AuthButton />
      </div>
    );
  }

  if (showNotFoundError) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center"
        style={{ backgroundImage: "url('/assets/onboarding2.png')" }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <Card className="w-full max-w-md z-10 bg-background/80 backdrop-blur-sm border-foreground/20 shadow-[8px_8px_0px_#00000090]">
          <CardHeader className="items-center text-center font-pixel">
            <CardTitle className="mt-4 text-2xl text-white text-shadow-pixel">Account Not Found</CardTitle>
            <CardDescription className="text-blue-300">
              The account for this session could not be found. It may have been deleted.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-center text-blue-300">Please sign out and sign in again. If you believe this is an error, please contact support.</p>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={() => {
                signOut();
                navigate('/');
              }} 
              className="w-full font-pixel text-lg bg-blue-600 text-white border-2 border-blue-700 shadow-[4px_4px_0px_#000] hover:bg-blue-700 active:translate-y-1 active:translate-x-1 active:shadow-none transition-all"
            >
              Sign Out
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // If we are authenticated but the user object is still loading, show a spinner.
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="h-12 w-12" />
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
        return <WellnessSupport onComplete={() => onCompleteStep(2)} source="onboarding" />;
      case 2:
        return <GoalSettingPage onComplete={() => onCompleteStep(3)} />;
      case 3:
        return <OnboardingStep4 onComplete={() => navigate('/dashboard')} />;
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