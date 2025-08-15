import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface MoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  period: "am" | "pm";
}

const moodOptions = [
  { emoji: "😞", label: "Sad", value: "sad" },
  { emoji: "😐", label: "Neutral", value: "neutral" },
  { emoji: "🙂", label: "Good", value: "good" },
  { emoji: "😄", label: "Happy", value: "happy" },
];

export function MoodModal({ isOpen, onClose, period }: MoodModalProps) {
  const [selectedMood, setSelectedMood] = useState<string>("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const saveMoodEntry = useMutation(api.moodTracking.saveMoodEntry);

  const handleSubmit = async () => {
    if (!selectedMood) {
      toast.error("Please select a mood");
      return;
    }

    setIsSubmitting(true);
    try {
      await saveMoodEntry({
        mood: selectedMood,
        note: note.trim() || undefined,
        period,
      });
      
      toast.success("Mood saved! Thanks for checking in.");
      onClose();
      setSelectedMood("");
      setNote("");
    } catch (error) {
      toast.error("Failed to save mood. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const periodText = period === "am" ? "morning" : "evening";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md font-pixel bg-black/90 backdrop-blur-md border-2 border-blue-500/50 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl text-center text-blue-300">
            {period === "am" ? "Good morning!" : "How was your day?"}
          </DialogTitle>
          <DialogDescription className="text-center text-blue-200">
            Quick {periodText} check-in
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Mood Selection */}
          <div className="space-y-3">
            <p className="text-sm text-blue-200">How are you feeling?</p>
            <div className="grid grid-cols-4 gap-2">
              {moodOptions.map((mood) => (
                <motion.button
                  key={mood.value}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedMood(mood.value)}
                  className={`
                    p-3 rounded-lg border-2 transition-all text-center
                    ${selectedMood === mood.value
                      ? 'border-blue-400 bg-blue-500/30 shadow-lg'
                      : 'border-gray-600 bg-gray-800/50 hover:border-blue-500/50'
                    }
                  `}
                >
                  <div className="text-2xl mb-1">{mood.emoji}</div>
                  <div className="text-xs text-blue-200">{mood.label}</div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Optional Note */}
          <div className="space-y-2">
            <p className="text-sm text-blue-200">Anything on your mind? (optional)</p>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Private note..."
              className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500"
              rows={3}
            />
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={!selectedMood || isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-pixel"
          >
            {isSubmitting ? "Saving..." : "Save Check-in"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
