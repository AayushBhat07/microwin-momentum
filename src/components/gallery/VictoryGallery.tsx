import { useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Share2 } from "lucide-react";
import { AchievementFeed } from "./AchievementFeed";
import { ProgressCharts } from "./ProgressCharts";
import { MilestonesBadges } from "./MilestonesBadges";
import { PhotoTimeline } from "./PhotoTimeline";
import { useAuth } from "@/hooks/use-auth";

export function VictoryGallery() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("journey");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Victory Gallery</h1>
              <p className="text-muted-foreground">Your journey of small wins</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Log Win
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="journey">My Journey</TabsTrigger>
            <TabsTrigger value="charts">Progress Charts</TabsTrigger>
            <TabsTrigger value="milestones">Milestones</TabsTrigger>
            <TabsTrigger value="memories">Memories</TabsTrigger>
          </TabsList>

          <TabsContent value="journey" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <AchievementFeed />
            </motion.div>
          </TabsContent>

          <TabsContent value="charts" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <ProgressCharts />
            </motion.div>
          </TabsContent>

          <TabsContent value="milestones" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <MilestonesBadges />
            </motion.div>
          </TabsContent>

          <TabsContent value="memories" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <PhotoTimeline />
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}