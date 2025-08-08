import { useAuth } from "@/hooks/use-auth";
import { Spinner } from "@/components/ui/spinner";
import { AuthButton } from "@/components/auth/AuthButton";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Settings, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function PreferencesPage() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const completeStep = useMutation(api.onboarding.completeOnboardingStep);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [publicProfile, setPublicProfile] = useState(false);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
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
      await completeStep({ step: 4 });
      toast.success("Setup Complete! You've earned the 'Customization Master' badge!");
      navigate("/dashboard");
    } catch (error) {
      toast.error("Failed to complete setup.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <CardHeader className="items-center text-center">
            <Settings className="w-12 h-12 text-blue-500" />
            <CardTitle className="mt-4">Customize Your Experience</CardTitle>
            <CardDescription>
              Set your preferences to make MicroWin work best for you.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Get notified about achievements and streaks</p>
              </div>
              <Switch
                id="email-notifications"
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="public-profile">Public Profile</Label>
                <p className="text-sm text-muted-foreground">Let others see your achievements</p>
              </div>
              <Switch
                id="public-profile"
                checked={publicProfile}
                onCheckedChange={setPublicProfile}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="weekly-digest">Weekly Digest</Label>
                <p className="text-sm text-muted-foreground">Receive weekly progress summaries</p>
              </div>
              <Switch
                id="weekly-digest"
                checked={weeklyDigest}
                onCheckedChange={setWeeklyDigest}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleContinue} disabled={isSubmitting} className="w-full">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Complete Setup
            </Button>
          </CardFooter>
        </motion.div>
      </Card>
    </div>
  );
}
