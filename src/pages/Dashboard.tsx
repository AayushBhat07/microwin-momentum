// TODO: THIS IS THE DEFAULT DASHBOARD PAGE THAT THE USER WILL SEE AFTER AUTHENTICATION. ADD MAIN FUNCTIONALITY HERE.
// This is the entry point for users who have just signed in

import { Protected } from "@/lib/protected-page";
import { motion } from "framer-motion";
import { useState } from "react";
import { AchievementFeed } from "@/components/dashboard/AchievementFeed";
import { CreateAchievement } from "@/components/dashboard/CreateAchievement";
import { DailyGoals } from "@/components/dashboard/DailyGoals";
import { StatsOverview } from "@/components/dashboard/StatsOverview";
import { UserButton } from "@/components/auth/UserButton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Award, Home, Plus, Star, Target, TrendingUp, Users } from "lucide-react";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <Protected>
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-primary/5">
        {/* Header */}
        <motion.header 
          className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <Star className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <span className="text-xl font-bold tracking-tight">MicroWin</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <CreateAchievement 
                  trigger={
                    <Button size="sm" className="shadow-sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Win
                    </Button>
                  }
                />
                <UserButton />
              </div>
            </div>
          </div>
        </motion.header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
                <TabsTrigger value="overview" className="flex items-center space-x-2">
                  <Home className="w-4 h-4" />
                  <span className="hidden sm:inline">Overview</span>
                </TabsTrigger>
                <TabsTrigger value="achievements" className="flex items-center space-x-2">
                  <Award className="w-4 h-4" />
                  <span className="hidden sm:inline">My Wins</span>
                </TabsTrigger>
                <TabsTrigger value="goals" className="flex items-center space-x-2">
                  <Target className="w-4 h-4" />
                  <span className="hidden sm:inline">Goals</span>
                </TabsTrigger>
                <TabsTrigger value="community" className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span className="hidden sm:inline">Community</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  <StatsOverview />
                </motion.div>
                
                <div className="grid lg:grid-cols-2 gap-6">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    <DailyGoals />
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                  >
                    <AchievementFeed limit={5} showHeader={true} title="Recent Wins" />
                  </motion.div>
                </div>
              </TabsContent>

              <TabsContent value="achievements">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <AchievementFeed showHeader={true} title="My Achievements" />
                </motion.div>
              </TabsContent>

              <TabsContent value="goals">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <DailyGoals expanded={true} />
                </motion.div>
              </TabsContent>

              <TabsContent value="community">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <AchievementFeed 
                    showPublic={true} 
                    showHeader={true} 
                    title="Community Wins" 
                  />
                </motion.div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </Protected>
  );
}