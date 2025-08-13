import WellnessSupport from "@/pages/onboarding/WellnessSupport";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function WellnessSetupPage() {
  const navigate = useNavigate();

  const handleComplete = () => {
    toast.success("Your personalized wins are ready!");
    navigate("/dashboard");
  };

  const handleSkip = () => {
    // Here you might want to set a flag to not bother the user again
    // For now, we just navigate away
    toast.info("You can set up your wellness goals later from your profile.");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-card shadow-lg rounded-lg p-2 sm:p-4">
           <div className="text-right mb-2">
             <button onClick={handleSkip} className="text-sm text-muted-foreground hover:text-foreground">
                Skip for now
             </button>
           </div>
          <WellnessSupport onComplete={handleComplete} source="re-entry" />
        </div>
      </motion.div>
    </div>
  );
}