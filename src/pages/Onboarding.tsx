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
        return <WellnessSupport onComplete={() => navigate('/dashboard')} source="onboarding" />;
      default:
        navigate('/dashboard');
        return null;
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center"
      style={{ backgroundImage: "url('/assets/onboarding2.png')" }}
    >
      <div className="absolute inset-0 bg-black/50" />
      <Card className="w-full max-w-xl z-10 bg-background/80 backdrop-blur-sm border-foreground/20 shadow-[8px_8px_0px_#00000090]">
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>
      </Card>
    </div>
  );
}