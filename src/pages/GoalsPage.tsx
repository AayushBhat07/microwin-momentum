import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Check, Loader2, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import { Link } from "react-router";
import { useLazyImage } from "@/hooks/use-lazy-image";
import { GoalsRadarChart } from "@/components/goals/GoalsRadarChart";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { QuestCompletionButtons } from "@/components/goals/QuestCompletionButtons";
import { useGuidedTour, GuidedTour } from "@/hooks/use-guided-tour";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate, useSearchParams } from "react-router";

export default function GoalsPage() {
  const questDataQuery = useQuery(api.habits.getQuestsWithCompletion);
  const quests = questDataQuery?.quests;
  const latestPlan = useQuery(api.aiPlanningMutations.getLatestPlan);
  const todayStats = useQuery(api.userStats.getTodayStats);
  const completeQuest = useMutation(api.habits.completeDailyQuest);
  const markAIGoalCompleted = useMutation(api.aiPlanningMutations.markGoalCompleted);
  const deleteAllPresets = useMutation(api.habits.deleteAllMyPresets);
  const completedQuestIds = useMemo(() => new Set(questDataQuery?.completedTodayIds ?? []), [questDataQuery?.completedTodayIds]);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const backgroundImage = useLazyImage("/assets/onboarding1.png");
  const { startTour, isTourActive } = useGuidedTour();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const isDataLoading = questDataQuery === undefined || !backgroundImage || todayStats === undefined || latestPlan === undefined;

    if (!isDataLoading && user && searchParams.get('tour') === 'true') {
      const tourSteps = [
        {
          targetId: 'quest-log-header',
          title: 'Your Quest Log',
          content: 'This is where you can view all your daily quests, both user-defined and AI-suggested.',
          position: 'bottom' as const,
        },
        {
          targetId: 'stats-row',
          title: 'Daily Stats',
          content: 'Quickly see how much XP you\'ve earned and how many quests you\'ve completed today.',
          position: 'bottom' as const,
        },
        {
          targetId: 'in-progress-quests',
          title: 'In-Progress Quests',
          content: 'These are your active quests. Complete them to level up!',
          position: 'top' as const,
        },
        {
          targetId: 'completed-quests',
          title: 'Completed Quests',
          content: 'Look back at all the quests you have conquered. Great job!',
          position: 'top' as const,
        },
      ];
      
      // Start the tour for the goals page if the tour parameter is present
      setTimeout(() => startTour(tourSteps, () => {
        localStorage.setItem(`tour-completed-${user._id}-goals`, 'true');
        navigate('/memories?tour=true');
      }), 1000);
    }
  }, [questDataQuery, backgroundImage, todayStats, latestPlan, user, startTour, searchParams, navigate]);

  const allGoals = useMemo(() => {
    const userQuests = quests?.map(q => ({
        ...q,
        type: 'user' as const,
        isCompleted: completedQuestIds.has(q._id)
    })) ?? [];

    const today = new Date().toISOString().split('T')[0];
    const todaysAIPlan = latestPlan?.plan.find(p => p.date === today);
    
    const aiGoals = todaysAIPlan?.goals.map((g, index) => ({
        ...g,
        _id: `ai-${index}-${today}`, // stable key
        type: 'ai' as const,
        isCompleted: g.completed,
        goalIndex: index,
        effortMinutes: 5, // default value for display
    })) ?? [];

    return [...userQuests, ...aiGoals];
  }, [quests, latestPlan, completedQuestIds]);

  const handleCompleteQuest = async (presetId: Id<"userPresets">) => {
    if (completedQuestIds.has(presetId) || completingId) return;

    setCompletingId(presetId);
    try {
      const result = await completeQuest({ presetId });
      toast.success(`+10 XP! Completed: ${result.title}`, {
        description: "Your heroic deed has been recorded!",
      });
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setCompletingId(null);
    }
  };

  const handleCompleteAIGoal = async (goalIndex: number) => {
    if (!latestPlan || completingId) return;
    setCompletingId(`ai-${goalIndex}`);
    try {
        await markAIGoalCompleted({
            planId: latestPlan._id,
            date: new Date().toISOString().split('T')[0],
            goalIndex: goalIndex
        });
        toast.success("AI Goal Completed! Well done!");
    } catch (e) {
        toast.error("Failed to complete AI goal.");
    } finally {
        setCompletingId(null);
    }
  }

  const questData = quests || latestPlan || todayStats;
  const isLoading = questData === undefined || !backgroundImage || todayStats === undefined || latestPlan === undefined;

  const inProgressQuests = allGoals.filter(q => !q.isCompleted);
  const completedQuests = allGoals.filter(q => q.isCompleted);

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
    <>
      <div 
        className="h-screen overflow-hidden bg-cover bg-center bg-fixed transition-opacity duration-1000" 
        style={{ 
          backgroundImage: `url(${backgroundImage})`,
          opacity: backgroundImage ? 1 : 0,
        }}
      >
        <div className="h-full bg-black/60 flex">
          {/* Sidebar */}
          <Sidebar activeTab="goals" onTabChange={() => {}} />

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="py-6 pr-6">
              {/* Header */}
              <motion.div
                id="quest-log-header"
                className="mb-8"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-4xl font-pixel text-white text-shadow-pixel mb-2">
                  Quest Log
                </h1>
                <p className="text-blue-300 font-pixel text-lg">
                  Track your daily adventures and level up!
                </p>
              </motion.div>

              {/* Stats Row */}
              <div id="stats-row" className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Today's XP */}
                <motion.div
                  className="bg-yellow-600/80 backdrop-blur-md border-2 border-yellow-500/50 p-4 text-center"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <div className="text-2xl font-pixel text-white mb-1">
                    {todayStats?.todayPoints || 0} XP
                  </div>
                  <div className="text-sm font-pixel text-yellow-100">Today's XP</div>
                </motion.div>

                {/* Quests Done Today */}
                <motion.div
                  className="bg-green-600/80 backdrop-blur-md border-2 border-green-500/50 p-4 text-center"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <div className="text-2xl font-pixel text-white mb-1">
                    {todayStats?.todayAchievements || 0}
                  </div>
                  <div className="text-sm font-pixel text-green-100">Quests Done</div>
                </motion.div>
              </div>

              {/* Goals Sections */}
              <div className="space-y-8">
                {quests && quests.length > 0 && (
                  <GoalsRadarChart quests={quests} completedQuestIds={completedQuestIds} />
                )}

                {allGoals.length === 0 ? (
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
                    <div id="in-progress-quests" className="mb-12">
                      <h2 className="text-2xl md:text-3xl text-white text-shadow-pixel mb-4 text-center">In-Progress Quests ({inProgressQuests.length})</h2>
                      {inProgressQuests.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                          <AnimatePresence>
                            {inProgressQuests.map((quest, index) => {
                              const isAI = quest.type === 'ai';
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
                                    font-pixel rounded-lg transition-all duration-300
                                    ${isAI ? 'bg-purple-900/80 border-2 border-purple-500' : 'bg-gray-900 border-2 border-blue-500'}
                                    shadow-md p-1
                                  `}>
                                    <div className={`rounded-md border border ${isAI ? 'bg-purple-800/50 border-purple-600' : 'bg-gray-800 border-gray-600'}`}>
                                      <div className={`flex justify-between items-center p-1.5 rounded-t-md bg-black/20`}>
                                        <h3 className={`text-xs font-bold text-white truncate`}>{quest.title}</h3>
                                        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                                          {isAI && <Sparkles className="w-3 h-3 text-purple-300" />}
                                          <span className={`text-xs font-bold ${isAI ? 'text-purple-300' : 'text-yellow-400'}`}>{quest.effortMinutes > 0 ? `${quest.effortMinutes}m` : 'QUICK'}</span>
                                        </div>
                                      </div>
                                      <div className={`min-h-[3.5rem] flex items-center justify-center text-center my-1.5 mx-1.5 p-1.5 border-2 ${isAI ? 'border-purple-800' : 'border-blue-800'} bg-black/30`}>
                                        <p className={`text-xs leading-tight font-bold text-white break-words`}>
                                          {quest.title}
                                        </p>
                                      </div>
                                      <div className={`p-1.5 mx-1.5 mb-1.5 border bg-black/20 text-xs ${isAI ? 'border-purple-700' : 'border-gray-700'}`}>
                                        <p className={`text-gray-300`}>
                                          Category: <span className="font-bold uppercase">{quest.categorySlug}</span>
                                        </p>
                                      </div>
                                      <div className="p-1.5">
                                        {quest.type === 'user' ? (
                                          <QuestCompletionButtons
                                            questId={quest._id as Id<"userPresets">}
                                            isCompleting={isCompleting}
                                            setIsCompleting={setCompletingId}
                                            onComplete={() => {/* Quest completion is handled by the backend query refresh */}}
                                          />
                                        ) : (
                                          <Button
                                            onClick={() => handleCompleteAIGoal(quest.goalIndex)}
                                            disabled={isCompleting}
                                            size="sm"
                                            className="w-full font-pixel text-sm transition-all uppercase bg-purple-600 hover:bg-purple-700 border-purple-700 text-white border shadow-[2px_2px_0px_#000] active:translate-y-0.5 active:translate-x-0.5 active:shadow-none"
                                          >
                                            {isCompleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Complete AI Goal'}
                                          </Button>
                                        )}
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
                    <div id="completed-quests">
                      <h2 className="text-2xl md:text-3xl text-white text-shadow-pixel mb-4 text-center">Completed Quests ({completedQuests.length})</h2>
                      {completedQuests.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                          <AnimatePresence>
                            {completedQuests.map((quest, index) => {
                              const isAI = quest.type === 'ai';
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
                                <div className="font-pixel rounded-lg bg-gray-600 border-gray-700 shadow-md p-1 opacity-60">
                                  <div className="bg-gray-800 rounded-md border border-gray-700">
                                    <div className="flex justify-between items-center p-1.5 rounded-t-md bg-gray-700">
                                      <h3 className="text-xs font-bold text-gray-400 truncate">{quest.title}</h3>
                                      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                                        {isAI && <Sparkles className="w-3 h-3 text-purple-400" />}
                                        <span className="text-xs font-bold text-gray-400">{quest.effortMinutes > 0 ? `${quest.effortMinutes}m` : 'QUICK'}</span>
                                      </div>
                                    </div>
                                    <div className="min-h-[3.5rem] flex items-center justify-center text-center my-1.5 mx-1.5 p-1.5 border-2 border-gray-600 bg-gray-700">
                                      <p className="text-xs leading-tight font-bold px-2 text-gray-400 line-through">
                                        {quest.title}
                                      </p>
                                    </div>
                                    <div className="p-1.5 mx-1.5 mb-1.5 border bg-gray-700 border-gray-600 text-xs">
                                      <p className="text-gray-400">
                                        Category: <span className="font-bold uppercase">{quest.categorySlug}</span>
                                      </p>
                                    </div>
                                    <div className="p-1.5">
                                      <Button
                                        disabled={true}
                                        size="sm"
                                        className="w-full font-pixel text-sm uppercase bg-green-700 text-white border border-green-800 cursor-not-allowed"
                                      >
                                        <Check className="w-4 h-4 mr-2" /> Done
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            )})}
                          </AnimatePresence>
                        </div>
                      ) : (
                        <p className="text-center text-blue-300">No quests completed yet. Let's get to it!</p>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <GuidedTour />
    </>
  );
}