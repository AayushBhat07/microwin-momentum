import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { motion } from "framer-motion";
import { Loader2, ClipboardList, Wand2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useLazyImage } from "@/hooks/use-lazy-image";

const HabitCard = ({ habit }: { habit: any }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="bg-black/50 border-2 border-blue-900/80 p-4 flex items-center justify-between"
    >
      <div>
        <h3 className="font-pixel text-lg text-white">{habit.title}</h3>
        <p className="text-sm text-blue-300 capitalize">{habit.categorySlug}</p>
      </div>
    </motion.div>
  );
};

export default function HabitsPage() {
  const habits = useQuery(api.habits.getOnboardingHabits);
  const backfillHabits = useMutation(api.habits.backfillHabits);
  const [isRestoring, setIsRestoring] = useState(false);
  const [activeTab, setActiveTab] = useState("habits");
  const backgroundUrl = useLazyImage("/assets/onboarding1.png");

  const handleRestore = async () => {
    setIsRestoring(true);
    toast.loading("Searching for your onboarding goals...");
    try {
      const result = await backfillHabits({});
      if (result.success) {
        toast.success(result.message || "Habits restored successfully!");
      } else {
        toast.error(result.message || "Could not restore habits.");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "An error occurred while restoring habits.");
    } finally {
      setIsRestoring(false);
    }
  };

  if (habits === undefined || !backgroundUrl) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <Loader2 className="h-12 w-12 text-blue-400 animate-spin mx-auto" />
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
      <div className="min-h-screen bg-black/60 flex">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl font-pixel text-white text-shadow-pixel mb-2">
                Your Habits
              </h1>
              <p className="text-blue-300 font-pixel text-lg mb-8">
                These are the core habits you committed to during onboarding.
              </p>
            </motion.div>

            {habits && habits.length === 0 && (
              <div className="text-center py-12 bg-black/30 border-2 border-dashed border-blue-800">
                <ClipboardList className="mx-auto h-12 w-12 text-blue-400" />
                <h3 className="mt-4 text-xl font-pixel text-white">No Habits Found</h3>
                <p className="mt-2 text-sm text-blue-300">It looks like your onboarding goals weren't saved as habits.</p>
                <Button onClick={handleRestore} disabled={isRestoring} className="mt-6 font-pixel">
                  {isRestoring ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Wand2 className="mr-2 h-4 w-4" />
                  )}
                  Restore My Habits
                </Button>
              </div>
            )}

            {habits && habits.length > 0 && (
              <div className="space-y-4">
                {habits.map((habit) => (
                  <HabitCard key={habit._id} habit={habit} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}