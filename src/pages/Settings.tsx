import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
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
import { Sidebar } from "@/components/dashboard/Sidebar";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router";

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const deleteAccount = useMutation(api.users.deleteAccount);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteAccount();
      toast.success("Your account has been successfully deleted.");
      signOut();
      navigate("/");
    } catch (error) {
      toast.error("Failed to delete your account. Please try again.");
      setIsDeleting(false);
    }
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-fixed" 
      style={{ backgroundImage: "url('/assets/onboarding1.png')" }}
    >
      <div className="min-h-screen bg-black/60 flex">
        <Sidebar activeTab="settings" onTabChange={() => {}} />
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-3xl mx-auto">
            <Card className="bg-background/80 backdrop-blur-sm border-foreground/20 shadow-[8px_8px_0px_#00000090]">
              <CardHeader>
                <CardTitle className="font-pixel text-2xl text-white">Settings</CardTitle>
                <CardDescription className="text-blue-300">
                  Manage your account information and settings.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 font-pixel">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-white">Your Profile</h3>
                  <div className="p-4 bg-black/50 border-2 border-blue-900/80 space-y-2 text-blue-300">
                    <p><span className="font-bold text-white">Username:</span> {user?.username}</p>
                    <p><span className="font-bold text-white">Email:</span> {user?.email}</p>
                    <p><span className="font-bold text-white">Bio:</span> {user?.bio || "Not set"}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-red-500">Danger Zone</h3>
                  <div className="p-4 bg-red-900/20 border-2 border-red-500/50 space-y-3">
                    <p className="text-red-300">
                      Deleting your account is a permanent action. All of your data, including achievements, badges, and progress, will be lost forever. This cannot be undone.
                    </p>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="font-pixel text-lg bg-red-600 text-white border-2 border-red-700 shadow-[4px_4px_0px_#000] hover:bg-red-700 active:translate-y-1 active:translate-x-1 active:shadow-none transition-all">
                          Delete My Account
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
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
