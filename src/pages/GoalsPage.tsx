import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Check, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Link } from "react-router";
import { useLazyImage } from "@/hooks/use-lazy-image";

export default function GoalsPage() {
  const quests = useQuery(api.habits.getDailyQuests);
  const completeQuest = useMutation(api.habits.completeDailyQuest);
  const deleteAllPresets = useMutation(api.habits.deleteAllMyPresets);
  const [completedQuestIds, setCompletedQuestIds] = useState<Set<Id<"userPresets">>>(new Set());
  const [completingId, setCompletingId] = useState<Id<"userPresets"> | null>(null);
  const backgroundUrl = useLazyImage("/assets/onboarding1.png");

  const handleCompleteQuest = async (presetId: Id<"userPresets">) => {
    if (completedQuestIds.has(presetId) || completingId) return;

    setCompletingId(presetId);
    try {
      const result = await completeQuest({ presetId });
      toast.success(`+10 XP! Completed: ${result.title}`, {
        description: "Your heroic deed has been recorded!",
      });
      setCompletedQuestIds(prev => new Set(prev).add(presetId));
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setCompletingId(null);
    }
  };

  const isLoading = quests === undefined || !backgroundUrl;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="z-10 text-center">
          <div className="font-pixel text-white text-3xl mb-4 animate-pulse">Loading Quests...</div>
          <Loader2 className="h-12 w-12 text-blue-400 animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-fixed transition-opacity duration-1000" 
      style={{ 
        backgroundImage: `url(${backgroundUrl})`,
        opacity: backgroundUrl ? 1 : 0,
      }}
    >
      <div className="min-h-screen bg-black/60">
        <div className="container mx-auto p-4 sm:p-6 font-pixel">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-8 text-center">
              <h1 className="text-3xl md:text-4xl text-white text-shadow-pixel mb-2">Daily Quests</h1>
              <p className="text-lg text-blue-300 max-w-2xl mx-auto">
                Complete these micro-goals from your wellness setup.
              </p>
            </div>

            {quests.length === 0 ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
                <div className="text-center bg-black/30 border-2 border-blue-900/80 p-8 max-w-md mx-auto">
                    <h3 className="text-xl font-semibold mb-2 text-white">No Quests Available!</h3>
                    <p className="text-blue-300 mb-6">
                      Visit the wellness setup to get your personalized quests.
                    </p>
                    <Button asChild className="font-pixel text-lg bg-blue-600 text-white border-2 border-blue-700 shadow-[4px_4px_0px_#000] hover:bg-blue-700 active:translate-y-1 active:translate-x-1 active:shadow-none transition-all">
                      <Link to="/wellness-setup">Start Setup</Link>
                    </Button>
                </div>
              </motion.div>
            ) : (
              <>
                <div className="mb-6 text-center">
                  <Button 
                    onClick={async () => {
                      try {
                        const result = await deleteAllPresets({});
                        toast.success(`Cleared ${result.deletedCount} old goals. Please refresh the page.`);
                        window.location.reload();
                      } catch (error) {
                        toast.error("Failed to clear goals. Please try again.");
                      }
                    }}
                    variant="outline"
                    className="font-pixel text-sm bg-red-600/20 text-red-300 border-2 border-red-700 hover:bg-red-600/40"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear All Goals
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <AnimatePresence>
                    {quests.map((quest, index) => {
                      const isCompleted = completedQuestIds.has(quest._id);
                      const isCompleting = completingId === quest._id;

                      return (
                        <motion.div
                          key={quest._id}
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                          <div 
                            className={`
                              p-4 transition-all duration-200 border-2
                              ${isCompleted 
                                ? 'bg-green-800/50 border-green-500 text-gray-400' 
                                : 'bg-black/30 border-blue-900/80 text-white hover:bg-blue-900/50'
                              }
                            `}
                          >
                            <div className="flex-1 pr-4">
                              <p className="text-base font-pixel mb-2">{quest.title}</p>
                              <p className={`text-xs font-pixel ${isCompleted ? 'text-gray-500' : 'text-blue-300'}`}>
                                {quest.effortMinutes > 0 ? `${quest.effortMinutes} min • ` : ''}{quest.categorySlug}
                              </p>
                            </div>
                            <div className="mt-4">
                              <Button
                                onClick={() => handleCompleteQuest(quest._id)}
                                disabled={isCompleted || isCompleting}
                                className={`w-full font-pixel text-base transition-all ${
                                  isCompleted 
                                    ? 'bg-green-600 text-white border-2 border-green-700 cursor-not-allowed'
                                    : 'bg-blue-600 text-white border-2 border-blue-700 shadow-[2px_2px_0px_#000] hover:bg-blue-700 active:translate-y-0.5 active:translate-x-0.5 active:shadow-none'
                                }`}
                              >
                                {isCompleting ? (
                                  <Loader2 className="w-5 h-5 animate-spin" />
                                ) : isCompleted ? (
                                  <div className="flex items-center justify-center">
                                    <Check className="w-5 h-5 mr-2" /> Quest Complete!
                                  </div>
                                ) : (
                                  'Complete Quest'
                                )}
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}