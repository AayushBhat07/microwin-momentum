import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { AchievementCard } from "./AchievementCard";
import { motion, AnimatePresence } from "framer-motion";

export function AchievementFeed() {
  const [activeTab, setActiveTab] = useState("my");
  
  const myAchievements = useQuery(api.achievements.getUserAchievements, { limit: 10 });
  const publicFeed = useQuery(api.achievements.getPublicFeed, {
    paginationOpts: { numItems: 10, cursor: null }
  });
  const followingFeed = useQuery(api.achievements.getFollowingFeed, {
    paginationOpts: { numItems: 10, cursor: null }
  });

  const isLoading = myAchievements === undefined || publicFeed === undefined;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Achievements</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="my">My Achievements</TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
          </TabsList>

          <TabsContent value="my" className="mt-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : myAchievements && myAchievements.length > 0 ? (
              <div className="space-y-3">
                <AnimatePresence>
                  {myAchievements.map((achievement, index) => (
                    <motion.div
                      key={achievement._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
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

          <TabsContent value="following" className="mt-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : followingFeed && followingFeed.page.length > 0 ? (
              <div className="space-y-3">
                <AnimatePresence>
                  {followingFeed.page.map((achievement, index) => (
                    <motion.div
                      key={achievement._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                    >
                      <AchievementCard achievement={achievement} showUser />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  Follow other users to see their achievements here.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="community" className="mt-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : publicFeed && publicFeed.page.length > 0 ? (
              <div className="space-y-3">
                <AnimatePresence>
                  {publicFeed.page.map((achievement, index) => (
                    <motion.div
                      key={achievement._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
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