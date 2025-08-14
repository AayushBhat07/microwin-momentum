import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function HabitsPage() {
  const habits = useQuery(api.habits.getOnboardingHabits);
  const completeHabit = useMutation(api.habits.completeOnboardingHabit);

  const handleCompleteHabit = async (presetId: Id<"userPresets">) => {
    try {
      const result = await completeHabit({ presetId });
      toast.success(`Completed: ${result.title}`, {
        description: "Great job! You've earned points and updated your streak.",
      });
    } catch (error) {
      toast.error("Failed to complete habit. Please try again.");
    }
  };

  if (!habits) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Your Habits</h1>
          <p className="text-muted-foreground">
            Complete your personalized micro-goals to build healthy habits and earn points.
          </p>
        </div>

        {habits.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground mb-4">
                No habits found. Complete the wellness assessment to get personalized micro-goals.
              </p>
              <Button variant="outline">
                Go to Wellness Setup
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {habits.map((habit, index) => (
              <motion.div
                key={habit._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">{habit.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{habit.effortMinutes} minutes</span>
                          <Badge variant="secondary" className="ml-2">
                            {habit.categorySlug}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleCompleteHabit(habit._id)}
                        className="ml-4"
                        size="sm"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Complete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}