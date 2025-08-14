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
import { GoalsRadarChart } from "@/components/goals/GoalsRadarChart";

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

  const inProgressQuests = quests?.filter(q => !completedQuestIds.has(q._id)) ?? [];
  const completedQuests = quests?.filter(q => completedQuestIds.has(q._id)) ?? [];

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

            {quests && quests.length > 0 && (
              <GoalsRadarChart quests={quests} completedQuestIds={completedQuestIds} />
            )}

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

                {/* In-Progress Quests */}
                <div className="mb-12">
                  <h2 className="text-2xl md:text-3xl text-white text-shadow-pixel mb-4 text-center">In-Progress Quests ({inProgressQuests.length})</h2>
                  {inProgressQuests.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <AnimatePresence>
                        {inProgressQuests.map((quest, index) => {
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
                              {/* Card Component */}
                              <div className={`
                                font-pixel rounded-xl transition-all duration-300
                                bg-gray-900 border-4 border-blue-500
                                shadow-lg p-1
                              `}>
                                <div className={`bg-gray-800 rounded-md border-2 border-gray-600`}>
                                  <div className={`flex justify-between items-center p-2 rounded-t-md bg-black/20`}>
                                    <h3 className={`text-base font-bold text-white`}>{quest.title.substring(0, 25)}{quest.title.length > 25 && '...'}</h3>
                                    <div className="flex items-center gap-2">
                                      <span className={`text-xs font-bold text-yellow-400`}>{quest.effortMinutes > 0 ? `${quest.effortMinutes} MIN` : 'QUICK'}</span>
                                    </div>
                                  </div>
                                  <div className={`h-20 flex items-center justify-center text-center my-2 mx-2 border-4 border-blue-800 bg-black/30`}>
                                    <p className={`text-lg leading-tight font-bold px-2 text-white`}>
                                      {quest.title}
                                    </p>
                                  </div>
                                  <div className={`p-2 mx-2 mb-2 border-2 bg-black/20 border-gray-700`}>
                                    <p className={`text-xs text-gray-300`}>
                                      Category: <span className="font-bold uppercase">{quest.categorySlug}</span>
                                    </p>
                                    <p className={`text-xs mt-1 text-gray-300`}>
                                      A small step towards a greater victory. Complete this quest to build your streak.
                                    </p>
                                  </div>
                                  <div className="p-2">
                                    <Button
                                      onClick={() => handleCompleteQuest(quest._id)}
                                      disabled={isCompleting}
                                      className={`w-full font-pixel text-base transition-all uppercase bg-green-600 text-white border-2 border-green-700 shadow-[2px_2px_0px_#000] hover:bg-green-700 active:translate-y-0.5 active:translate-x-0.5 active:shadow-none`}
                                    >
                                      {isCompleting ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                      ) : (
                                        'Complete Quest'
                                      )}
                                    </Button>
                                  </div>
                                  <div className={`text-center text-xs p-1 border-t-2 text-gray-400 border-gray-700`}>
                                    <p>Quest Card - Level Up Your Life</p>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )
                        })}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <p className="text-center text-blue-300">No quests in progress. Great job!</p>
                  )}
                </div>

                {/* Completed Quests */}
                <div>
                  <h2 className="text-2xl md:text-3xl text-white text-shadow-pixel mb-4 text-center">Completed Quests ({completedQuests.length})</h2>
                  {completedQuests.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <AnimatePresence>
                        {completedQuests.map((quest, index) => (
                          <motion.div
                            key={quest._id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                          >
                            {/* Card Component */}
                            <div className={`
                              font-pixel rounded-xl transition-all duration-300
                              bg-gray-600 border-gray-700
                              shadow-lg p-1 opacity-70
                            `}>
                              <div className={`bg-gray-800 rounded-md border-2 border-gray-700`}>
                                <div className={`flex justify-between items-center p-2 rounded-t-md bg-gray-700`}>
                                  <h3 className={`text-base font-bold text-gray-400`}>{quest.title.substring(0, 25)}{quest.title.length > 25 && '...'}</h3>
                                  <div className="flex items-center gap-2">
                                    <span className={`text-xs font-bold text-gray-400`}>{quest.effortMinutes > 0 ? `${quest.effortMinutes} MIN` : 'QUICK'}</span>
                                  </div>
                                </div>
                                <div className={`h-20 flex items-center justify-center text-center my-2 mx-2 border-4 border-gray-600 bg-gray-700`}>
                                  <p className={`text-lg leading-tight font-bold px-2 text-gray-400 line-through`}>
                                    {quest.title}
                                  </p>
                                </div>
                                <div className={`p-2 mx-2 mb-2 border-2 bg-gray-700 border-gray-600`}>
                                  <p className={`text-xs text-gray-400`}>
                                    Category: <span className="font-bold uppercase">{quest.categorySlug}</span>
                                  </p>
                                  <p className={`text-xs mt-1 text-gray-400`}>
                                    A small step towards a greater victory. Complete this quest to build your streak.
                                  </p>
                                </div>
                                <div className="p-2">
                                  <Button
                                    disabled={true}
                                    className={`w-full font-pixel text-base transition-all uppercase bg-green-700 text-white border-2 border-green-800 cursor-not-allowed`}
                                  >
                                    <div className="flex items-center justify-center">
                                      <Check className="w-5 h-5 mr-2" /> Done
                                    </div>
                                  </Button>
                                </div>
                                <div className={`text-center text-xs p-1 border-t-2 text-gray-500 border-gray-600`}>
                                  <p>Quest Card - Level Up Your Life</p>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <p className="text-center text-blue-300">No quests completed yet. Let's get to it!</p>
                  )}
                </div>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}