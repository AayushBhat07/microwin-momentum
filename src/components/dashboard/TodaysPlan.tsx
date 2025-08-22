import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { CheckCircle, Circle, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ACHIEVEMENT_CATEGORIES } from "@/convex/schema";
import { useState } from "react";
import Confetti from "react-confetti";

export function TodaysPlan() {
  const latestPlan = useQuery(api.aiPlanningMutations.getLatestPlan);
  const markGoalCompleted = useMutation(api.aiPlanningMutations.markGoalCompleted);
  const [showConfetti, setShowConfetti] = useState(false);

  if (!latestPlan) {
    return (
      <div className="bg-black/40 backdrop-blur-md border-2 border-purple-500/50 p-6 text-white font-pixel">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg text-purple-300">AI-Generated Plan</h3>
        </div>
        <p className="text-purple-200 text-sm">
          Your personalized 3-day plan will appear here after your first mood check-in.
        </p>
      </div>
    );
  }

  const today = new Date().toISOString().split('T')[0];
  const todaysPlan = latestPlan.plan.find((day: any) => day.date === today);

  const handleCompleteGoal = async (goalIndex: number) => {
    if (!todaysPlan) return;
    
    try {
      await markGoalCompleted({
        planId: latestPlan._id,
        date: today,
        goalIndex,
      });
      toast.success("Goal completed! Great job!");
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000); // Confetti for 5 seconds
    } catch (error) {
      toast.error("Failed to mark goal as completed");
    }
  };

  return (
    <div className="bg-black/40 backdrop-blur-md border-2 border-purple-500/50 p-6 text-white font-pixel relative overflow-hidden">
      {showConfetti && <Confetti recycle={false} onConfettiComplete={() => setShowConfetti(false)} />}
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg text-purple-300">Today's AI Plan</h3>
      </div>

      {todaysPlan ? (
        <div className="space-y-3">
          {todaysPlan.goals.map((goal: any, index: number) => {
            const category = ACHIEVEMENT_CATEGORIES.find(c => c.slug === goal.categorySlug);
            return (
              <motion.div
                key={index}
                className={`
                  flex items-center justify-between p-3 border-2 transition-all
                  ${goal.completed 
                    ? 'bg-green-600/30 border-green-400/50 text-green-100' 
                    : 'bg-gray-800/50 border-gray-600 hover:border-purple-400/50'
                  }
                `}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => handleCompleteGoal(index)}
                    disabled={goal.completed}
                    className="flex-shrink-0 text-purple-400 hover:text-purple-300 disabled:text-green-400"
                  >
                    {goal.completed ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${goal.completed ? 'line-through' : ''} break-words`}>
                      {goal.title}
                    </p>
                    <p className="text-xs text-purple-300 truncate">
                      {category?.name || goal.categorySlug}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <p className="text-purple-200 text-sm">
          No plan generated for today yet.
        </p>
      )}
    </div>
  );
}