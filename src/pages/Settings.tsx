import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
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
    setIsDeleting(true);
    try {
      await deleteAccount();
      toast.success("Your account has been deleted.");
      signOut();
      navigate("/");
    } catch (error) {
      toast.error("Failed to delete account. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-fixed" 
      style={{ backgroundImage: "url('/assets/onboarding1.png')" }}
    >
      <div className="min-h-screen bg-black/60 flex">
        <Sidebar activeTab="settings" onTabChange={() => {}} />
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-black/60 backdrop-blur-sm border-2 border-blue-900/80 text-blue-200">
              <CardHeader>
                <CardTitle className="text-3xl font-pixel text-white text-shadow-pixel">Settings</CardTitle>
                <CardDescription className="font-pixel text-blue-300">
                  Manage your account settings and preferences.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 font-pixel">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-white">Your Profile</h3>
                  <div className="p-4 bg-black/50 border-2 border-blue-900/80 space-y-2">
                    <p><span className="font-bold text-white">Username:</span> {user?.name}</p>
                    <p><span className="font-bold text-white">Email:</span> {user?.email}</p>
                    <p><span className="font-bold text-white">Bio:</span> {(user as any)?.bio || "Not set"}</p>
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
                    <p className="text-red-300">
                      Deleting your account is a permanent action and cannot be undone. All your data will be lost.
                    </p>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="font-pixel">
                          Delete Account
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="font-pixel bg-black/80 border-red-500 text-white">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription className="text-red-300">
                            This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={handleDelete} 
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Yes, delete my account
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}