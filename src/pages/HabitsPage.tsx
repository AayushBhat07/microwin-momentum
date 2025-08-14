import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Heart, Briefcase, BookOpen, Users, Palette, Sparkles, LucideProps } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Link } from "react-router";

const ACHIEVEMENT_CATEGORIES = [
  { slug: "health", name: "Health & Fitness", color: "bg-emerald-500", icon: Heart },
  { slug: "work", name: "Work & Career", color: "bg-blue-500", icon: Briefcase },
  { slug: "learning", name: "Learning & Growth", color: "bg-violet-500", icon: BookOpen },
  { slug: "social", name: "Social & Relationships", color: "bg-amber-500", icon: Users },
  { slug: "creative", name: "Creative & Hobbies", color: "bg-red-500", icon: Palette },
  { slug: "personal", name: "Personal Care", color: "bg-cyan-500", icon: Sparkles },
] as const;

const categoryMap = ACHIEVEMENT_CATEGORIES.reduce((acc, cat) => {
    acc[cat.slug] = cat;
    return acc;
}, {} as Record<string, typeof ACHIEVEMENT_CATEGORIES[number]>);

export default function HabitsPage() {
  const habits = useQuery(api.habits.getOnboardingHabits);
  const completeHabit = useMutation(api.habits.completeOnboardingHabit);
  const [completedHabitIds, setCompletedHabitIds] = useState<Set<Id<"userPresets">>>(new Set());

  const handleCompleteHabit = async (presetId: Id<"userPresets">) => {
    if (completedHabitIds.has(presetId)) return; // Already completed

    try {
      const result = await completeHabit({ presetId });
      toast.success(`Completed: ${result.title}`, {
        description: "Great job! You've earned points and updated your streak.",
      });
      setCompletedHabitIds(prev => new Set(prev).add(presetId));
    } catch (error) {
      toast.error("Failed to complete habit. Please try again.");
    }
  };

  const isLoading = habits === undefined;

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-2">Your Daily Habits</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Complete these personalized micro-goals to build healthy habits and feel great.
          </p>
        </div>

        {isLoading ? (
           <div className="flex items-center justify-center min-h-[400px]">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
           </div>
        ) : habits.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
            <Card className="text-center shadow-lg">
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold mb-2">No Habits Yet!</h3>
                <p className="text-muted-foreground mb-6">
                  Get personalized micro-goals by completing your wellness assessment.
                </p>
                <Button asChild>
                  <Link to="/wellness-setup">Start Wellness Setup</Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {habits.map((habit, index) => {
                const isCompleted = completedHabitIds.has(habit._id);
                const category = categoryMap[habit.categorySlug as keyof typeof categoryMap] || { color: 'bg-gray-500', icon: Sparkles };
                const Icon = category.icon;

                return (
                  <motion.div
                    key={habit._id}
                    layout
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                  >
                    <Card 
                      className={`overflow-hidden transition-all duration-300 ${isCompleted ? 'bg-card/50 border-green-500/50 shadow-none' : 'hover:shadow-xl'}`}
                    >
                      <div className={`h-2 ${category.color}`} />
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center mb-3">
                                <div className={`p-2 rounded-full mr-3 ${category.color}/20`}>
                                    <Icon className={`h-5 w-5 ${category.color.replace('bg-', 'text-')}`} />
                                </div>
                                <Badge variant="secondary" className="capitalize">
                                  {habit.categorySlug}
                                </Badge>
                            </div>
                            <h3 className="font-semibold text-lg mb-2">{habit.title}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              <span>{habit.effortMinutes} minutes</span>
                            </div>
                          </div>
                          <motion.div whileTap={{ scale: 0.9 }}>
                            <Button
                              onClick={() => handleCompleteHabit(habit._id)}
                              className={`transition-all ${isCompleted ? 'bg-green-500 hover:bg-green-600' : ''}`}
                              size="sm"
                              disabled={isCompleted}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              {isCompleted ? 'Done!' : 'Complete'}
                            </Button>
                          </motion.div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </div>
  );
}