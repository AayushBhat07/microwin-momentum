import { useParams, useNavigate } from "react-router";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Star, Trophy, Flame, Users, UserPlus } from "lucide-react";
import { motion } from "framer-motion";
import { AchievementCard } from "@/components/dashboard/AchievementCard";
import { BadgeCard } from "@/components/dashboard/BadgeCard";
import { Badge } from "@/components/ui/badge";

export default function UserProfilePage() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  
  const userProfile = useQuery(
    api.users.getProfileByUsername,
    username ? { username } : "skip"
  );

  if (!username) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Invalid Profile URL</h1>
          <Button onClick={() => navigate("/dashboard")}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (userProfile === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="h-12 w-12" />
      </div>
    );
  }

  if (userProfile === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">User Not Found</h1>
          <p className="text-muted-foreground mb-4">
            The user @{username} doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate("/dashboard")}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser?._id === userProfile._id;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex-1" />
        </div>
      </header>

      <main className="container py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="mb-8">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-start gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={userProfile.image} />
                  <AvatarFallback className="text-2xl">
                    {userProfile.name?.charAt(0) || userProfile.username?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold">@{userProfile.username}</h1>
                    {isOwnProfile && (
                      <Badge variant="secondary">Your Profile</Badge>
                    )}
                  </div>
                  
                  {userProfile.name && (
                    <p className="text-xl text-muted-foreground mb-2">{userProfile.name}</p>
                  )}
                  
                  {userProfile.bio && (
                    <p className="text-muted-foreground mb-4">{userProfile.bio}</p>
                  )}

                  <div className="flex items-center gap-6 text-sm">
                    {/* Follower/Following counts removed */}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  {userProfile.totalPoints}
                </div>
                <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                  <Star className="h-4 w-4" />
                  Total Points
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-orange-500 mb-2">
                  {userProfile.currentStreak}
                </div>
                <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                  <Flame className="h-4 w-4" />
                  Current Streak
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-green-500 mb-2">
                  {userProfile.longestStreak}
                </div>
                <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                  <Flame className="h-4 w-4" />
                  Longest Streak
                </div>
              </CardContent>
            </Card>
          </div>

          {(userProfile as any).badges && (userProfile as any).badges.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Badges
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {(userProfile as any).badges?.map((badge: any) => (
                    <BadgeCard key={badge.userBadge._id} badge={badge} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {(!(userProfile as any).achievements || (userProfile as any).achievements.length === 0) && (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">
                  {isOwnProfile 
                    ? "You haven't shared any public achievements yet."
                    : `@${userProfile.username} hasn't shared any public achievements yet.`
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </main>
    </div>
  );
}