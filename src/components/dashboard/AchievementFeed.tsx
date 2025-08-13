import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AnimatePresence, motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { AchievementCard } from "./AchievementCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Doc } from "@/convex/_generated/dataModel";

export function AchievementFeed() {
  const [activeTab, setActiveTab] = useState("my");

  const myAchievements = useQuery(api.achievements.getMyAchievements, {});
  const publicFeedResult = useQuery(api.achievements.getPublicFeed, { 
    paginationOpts: { numItems: 20, cursor: null }
  });

  const isLoadingMy = myAchievements === undefined;
  const isLoadingPublic = publicFeedResult === undefined;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Achievement Feed</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="my">My Wins</TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
          </TabsList>

          <TabsContent value="my" className="mt-4">
            {isLoadingMy ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : myAchievements && myAchievements.length > 0 ? (
              <div className="space-y-3">
                <AnimatePresence>
                  {myAchievements.map((achievement: Doc<"achievements">, index: number) => (
                    <motion.div
                      key={achievement._id}
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <AchievementCard achievement={achievement} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  No achievements yet. Start by logging your first win!
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="community" className="mt-4">
            {isLoadingPublic ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : publicFeedResult && publicFeedResult.page.length > 0 ? (
              <div className="space-y-3">
                <AnimatePresence>
                  {publicFeedResult.page.map((achievement: Doc<"achievements">, index: number) => (
                    <motion.div
                      key={achievement._id}
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <AchievementCard achievement={achievement} showUser />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No public achievements yet. Be the first to share!
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}