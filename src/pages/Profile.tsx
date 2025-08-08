import { useAuth } from "@/hooks/use-auth";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserButton } from "@/components/auth/UserButton";
import { Sparkles, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Doc } from "@/convex/_generated/dataModel";

function EditProfileDialog({ user }: { user: any }) {
  const [username, setUsername] = useState(user.username ?? "");
  const [bio, setBio] = useState(user.bio ?? "");
  const [isOpen, setIsOpen] = useState(false);
  const updateProfile = useMutation(api.userProfile.updateGeneralProfile);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username.length < 3) {
      toast.error("Username must be at least 3 characters long.");
      return;
    }
    setIsLoading(true);
    try {
      await updateProfile({ username, bio });
      toast.success("Profile updated successfully!");
      setIsOpen(false);
    } catch (error: any) {
      toast.error(error.data?.message || "Failed to update profile. The username might be taken.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Edit Profile</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              minLength={3}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              disabled={isLoading}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost" disabled={isLoading}>Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const userBadges = useQuery(api.badges.getUserBadges, {});

  if (isLoading || (user && userBadges === undefined)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="h-12 w-12" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>You must be logged in to view this page.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
       <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
          <div className="flex items-center gap-2">
            <a href="/dashboard" className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary" />
                <span className="text-xl font-bold tracking-tighter">MicroWin</span>
            </a>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <UserButton />
          </div>
        </div>
      </header>
      <main className="container py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.image} alt={user.username ?? ""} />
                <AvatarFallback>{user.username?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{user.username}</CardTitle>
                <CardDescription>{user.email}</CardDescription>
              </div>
            </div>
            <EditProfileDialog user={user} />
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
                <h3 className="font-semibold">Bio</h3>
                <p className="text-muted-foreground">{user.bio || "No bio provided."}</p>
            </div>
             <div>
                <h3 className="font-semibold">Stats</h3>
                <div className="flex gap-4 mt-2 flex-wrap">
                    <Badge variant="outline">Total Points: {user.totalPoints ?? 0}</Badge>
                    <Badge variant="outline">Current Streak: {user.currentStreak ?? 0} days</Badge>
                    <Badge variant="outline">Longest Streak: {user.longestStreak ?? 0} days</Badge>
                </div>
            </div>
             <div>
                <h3 className="font-semibold">Badges</h3>
                <div className="flex gap-2 mt-2 flex-wrap">
                    {userBadges && userBadges.length > 0 ? (
                        userBadges.map((badge) => (
                            <Badge key={badge._id} variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 font-semibold">
                                🏆 Badge
                            </Badge>
                        ))
                    ) : (
                        <p className="text-sm text-muted-foreground">No badges earned yet.</p>
                    )}
                </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}