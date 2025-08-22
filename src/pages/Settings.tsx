import { Sidebar } from "@/components/dashboard/Sidebar";
import { useLazyImage } from "@/hooks/use-lazy-image";
import { motion } from "framer-motion";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertTriangle } from "lucide-react";

export default function SettingsPage() {
  const backgroundUrl = useLazyImage("/assets/onboarding1.png");
  const [activeTab, setActiveTab] = useState("settings");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResettingGoals, setIsResettingGoals] = useState(false);
  const resetOnboarding = useMutation(api.users.resetOnboarding);
  const deleteOnboardingGoals = useMutation(api.goals.deleteOnboardingGoals);
  const navigate = useNavigate();

  const handleResetOnboarding = async () => {
    if (window.confirm("Are you sure you want to reset your onboarding progress? This action cannot be undone.")) {
      setIsSubmitting(true);
      try {
        await resetOnboarding();
        toast.success("Onboarding has been reset. Redirecting...");
        navigate("/onboarding");
      } catch (error) {
        toast.error("Failed to reset onboarding.");
        console.error(error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleResetGoals = async () => {
    if (window.confirm("Are you sure you want to reset your onboarding goals? This will delete the initial goals and habits you set up.")) {
      setIsResettingGoals(true);
      try {
        const result = await deleteOnboardingGoals();
        toast.success(`Onboarding goals have been reset. ${result.goalsDeleted} goals and ${result.habitsDeleted} habits deleted.`);
        await resetOnboarding();
        toast.info("Redirecting to onboarding to set new goals.");
        navigate("/onboarding");
      } catch (error) {
        toast.error("Failed to reset onboarding goals.");
        console.error(error);
      } finally {
        setIsResettingGoals(false);
      }
    }
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-fixed transition-opacity duration-1000" 
      style={{ 
        backgroundImage: `url(${backgroundUrl})`,
        opacity: backgroundUrl ? 1 : 0,
      }}
    >
      <div className="min-h-screen bg-black/60 flex">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl font-pixel text-white text-shadow-pixel mb-2">
                Settings
              </h1>
              <p className="text-blue-300 font-pixel text-lg">
                Manage your account and preferences.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="bg-blue-900/20 border-blue-800/50">
                <CardHeader>
                  <CardTitle className="text-white font-pixel flex items-center gap-2"><AlertTriangle className="text-yellow-400" /> Danger Zone</CardTitle>
                  <CardDescription className="text-blue-300">
                    These actions are destructive and cannot be easily undone.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between rounded-lg border border-destructive/50 p-4">
                    <div>
                      <h3 className="font-bold text-white">Reset Onboarding</h3>
                      <p className="text-sm text-muted-foreground text-blue-300/80">
                        This will reset your onboarding progress and allow you to go through the setup process again.
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      onClick={handleResetOnboarding}
                      disabled={isSubmitting}
                    >
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Reset
                    </Button>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-destructive/50 p-4 mt-4">
                    <div>
                      <h3 className="font-bold text-white">Reset Onboarding Goals</h3>
                      <p className="text-sm text-muted-foreground text-blue-300/80">
                        This will delete the goals and habits you created during the onboarding process.
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      onClick={handleResetGoals}
                      disabled={isResettingGoals}
                    >
                      {isResettingGoals && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Reset Goals
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}