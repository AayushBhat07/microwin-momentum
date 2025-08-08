import { useAuth } from "@/hooks/use-auth";
import { Spinner } from "@/components/ui/spinner";
import { AuthButton } from "@/components/auth/AuthButton";
import { StatsOverview } from "@/components/dashboard/StatsOverview";
import { CreateAchievement } from "@/components/dashboard/CreateAchievement";
import { AchievementFeed } from "@/components/dashboard/AchievementFeed";
import { UserButton } from "@/components/auth/UserButton";
import { Button } from "@/components/ui/button";
import { Plus, Sparkles } from "lucide-react";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MotivationalQuote } from "@/components/dashboard/MotivationalQuote";
import { DailyGoals } from "@/components/dashboard/DailyGoals";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

export default function Dashboard() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const [activeTab, setActiveTab] = useState("my-wins");

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
        <p>You need to sign in to access your dashboard.</p>
        <AuthButton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold tracking-tighter">MicroWin</span>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <Button variant="outline" size="sm" onClick={handleSeed}>
              Seed Data
            </Button>
            <CreateAchievement
              trigger={
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  New Win
                </Button>
              }
            />
            <UserButton />
          </div>
        </div>
      </header>

      <main className="container py-8">
        <MotivationalQuote />
        <div className="mt-8">
          <StatsOverview />
        </div>

        <div className="mt-8 grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="my-wins">My Wins</TabsTrigger>
                <TabsTrigger value="community">Community Feed</TabsTrigger>
              </TabsList>
              <TabsContent value="my-wins" className="mt-4">
                <AchievementFeed />
              </TabsContent>
              <TabsContent value="community" className="mt-4">
                <AchievementFeed showPublic={true} />
              </TabsContent>
            </Tabs>
          </div>
          <div>
            <DailyGoals />
          </div>
        </div>
      </main>
    </div>
  );
}