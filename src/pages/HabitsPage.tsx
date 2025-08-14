import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { motion } from "framer-motion";
import { Loader2, ClipboardList } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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
  const [activeTab, setActiveTab] = useState("habits");
  const backfillHabits = useMutation(api.migrations.backfillOnboardingHabits);
  const [isBackfilling, setIsBackfilling] = useState(false);

  const handleBackfill = async () => {
    setIsBackfilling(true);
    toast.loading("Searching for your onboarding habits...");
    try {
      const result = await backfillHabits();
      toast.dismiss();
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message || "Could not restore habits.");
      }
    } catch (error) {
      toast.dismiss();
      toast.error("An error occurred while restoring habits.");
      console.error(error);
    } finally {
      setIsBackfilling(false);
    }
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-fixed" 
      style={{ backgroundImage: "url('/assets/onboarding1.png')" }}
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

            {habits === undefined && (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
              </div>
            )}

            {habits && habits.length === 0 && (
              <div className="text-center py-12 bg-black/30 border-2 border-dashed border-blue-800">
                <ClipboardList className="mx-auto h-12 w-12 text-blue-400" />
                <h3 className="mt-4 text-xl font-pixel text-white">No Habits Found</h3>
                <p className="mt-2 text-sm text-blue-300">You did not set any specific habits during onboarding.</p>
                <div className="mt-6">
                  <p className="text-sm text-blue-300 mb-2">Did you complete onboarding but your habits are missing?</p>
                  <Button onClick={handleBackfill} disabled={isBackfilling} className="font-pixel text-lg bg-blue-600 text-white border-2 border-blue-700 shadow-[4px_4px_0px_#000] hover:bg-blue-700 active:translate-y-1 active:translate-x-1 active:shadow-none transition-all px-6 py-3">
                    {isBackfilling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Restore My Habits
                  </Button>
                </div>
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