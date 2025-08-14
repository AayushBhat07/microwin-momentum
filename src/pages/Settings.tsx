// ... keep existing code
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import {
// ... keep existing code
import { Sidebar } from "@/components/dashboard/Sidebar";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router";

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const resetOnboarding = useMutation(api.users.resetOnboarding);
  const deleteAccount = useMutation(api.users.deleteAccount);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const navigate = useNavigate();

  const handleResetOnboarding = async () => {
    setIsResetting(true);
    try {
      await resetOnboarding();
      toast.success("Onboarding has been reset.");
      navigate("/onboarding");
    } catch (error) {
      toast.error("Failed to reset onboarding. Please try again.");
      setIsResetting(false);
    }
  };

  const handleDelete = async () => {
// ... keep existing code
              <CardContent className="space-y-6 font-pixel">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-white">Your Profile</h3>
// ... keep existing code
                    <p><span className="font-bold text-white">Email:</span> {user?.email}</p>
                    <p><span className="font-bold text-white">Bio:</span> {user?.bio || "Not set"}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-white">Account Actions</h3>
                  <div className="p-4 bg-black/50 border-2 border-blue-900/80 space-y-3">
                    <p className="text-blue-300">
                      Need to set up your wellness profile again? You can restart the onboarding process here.
                    </p>
                    <Button 
                      onClick={handleResetOnboarding} 
                      disabled={isResetting}
                      variant="secondary"
                      className="font-pixel"
                    >
                      {isResetting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Restart Onboarding
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-red-500">Danger Zone</h3>
                  <div className="p-4 bg-red-900/20 border-2 border-red-500/50 space-y-3">
// ... keep existing code
