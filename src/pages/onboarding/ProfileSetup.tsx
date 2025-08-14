import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function ProfileSetupPage({ onComplete }: { onComplete?: () => void }) {
  const { user } = useAuth();
  const [username, setUsername] = useState(user?.username || "");
  const [bio, setBio] = useState(user?.bio || "");
  const updateProfile = useMutation(api.userProfile.updateProfile);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username.length < 3) {
      toast.error("Username must be at least 3 characters long.");
      return;
    }
    setIsSubmitting(true);
    try {
      // Now we advance the step directly in this mutation
      await updateProfile({ username, bio, onboardingStep: 1 });
      toast.success("Profile updated! Welcome!");
      // The onComplete prop is no longer needed as the user object will reactively update
      // and the parent component will render the next step.
      if (onComplete) onComplete();
    } catch (error: any) {
      toast.error(error.data?.message || "Failed to update profile. Username might be taken.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
      <CardHeader className="font-pixel text-center">
        <CardTitle className="text-white text-shadow-pixel text-2xl">Set Up Your Profile</CardTitle>
        <CardDescription className="text-blue-300">Choose a unique username and tell us a bit about yourself.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6 p-8">
          <div className="space-y-2">
            <Label htmlFor="username" className="font-pixel text-white">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g., win-master-99"
              required
              minLength={3}
              disabled={isSubmitting}
              className="font-pixel bg-black/30 border-2 border-blue-900/80 text-white placeholder:text-blue-300/50 focus:border-blue-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio" className="font-pixel text-white">Bio (Optional)</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Your personal motto or a short intro."
              disabled={isSubmitting}
              className="font-pixel bg-black/30 border-2 border-blue-900/80 text-white placeholder:text-blue-300/50 focus:border-blue-500 min-h-[80px]"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSubmitting} className="w-full font-pixel text-lg bg-blue-600 text-white border-2 border-blue-700 shadow-[4px_4px_0px_#000] hover:bg-blue-700 active:translate-y-1 active:translate-x-1 active:shadow-none transition-all">
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Continue
          </Button>
        </CardFooter>
      </form>
    </motion.div>
  );
}