import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ACHIEVEMENT_CATEGORIES } from "@/convex/schema";
import { useMutation } from "convex/react";
import { motion } from "framer-motion";
import { Plus, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface CreateAchievementProps {
  trigger?: React.ReactNode;
}

const categoryLabels = {
  HEALTH: "Health & Wellness",
  WORK: "Work & Career", 
  PERSONAL: "Personal Growth",
  SOCIAL: "Social & Relationships",
  LEARNING: "Learning & Education",
  CREATIVITY: "Creativity & Arts",
  OTHER: "Other",
};

const categoryEmojis = {
  HEALTH: "💪",
  WORK: "💼",
  PERSONAL: "🌱",
  SOCIAL: "👥",
  LEARNING: "📚",
  CREATIVITY: "🎨",
  OTHER: "⭐",
};

export function CreateAchievement({ trigger }: CreateAchievementProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<keyof typeof ACHIEVEMENT_CATEGORIES>("PERSONAL");
  const [points, setPoints] = useState(10);
  const [isPublic, setIsPublic] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createAchievement = useMutation(api.achievements.create);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await createAchievement({
        title: title.trim(),
        description: description.trim() || undefined,
        category: ACHIEVEMENT_CATEGORIES[category],
        points,
        isPublic,
      });

      toast.success("🎉 Achievement added! Way to go!", {
        description: `You earned ${points} points for "${title}"`,
      });

      // Reset form
      setTitle("");
      setDescription("");
      setCategory("PERSONAL");
      setPoints(10);
      setIsPublic(true);
      setOpen(false);
    } catch (error) {
      toast.error("Failed to add achievement. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="shadow-sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Achievement
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span>Celebrate Your Win!</span>
          </DialogTitle>
          <DialogDescription>
            What did you accomplish today? Every step forward deserves recognition.
          </DialogDescription>
        </DialogHeader>

        <motion.form
          onSubmit={handleSubmit}
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="space-y-2">
            <Label htmlFor="title">What did you achieve? *</Label>
            <Input
              id="title"
              placeholder="e.g., Completed my morning workout"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Tell us more (optional)</Label>
            <Textarea
              id="description"
              placeholder="Share details about your achievement..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={(value: keyof typeof ACHIEVEMENT_CATEGORIES) => setCategory(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      <span className="flex items-center space-x-2">
                        <span>{categoryEmojis[key as keyof typeof categoryEmojis]}</span>
                        <span>{label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="points">Points (1-50)</Label>
              <Input
                id="points"
                type="number"
                min="1"
                max="50"
                value={points}
                onChange={(e) => setPoints(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="public"
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
            <Label htmlFor="public" className="text-sm">
              Share with community for encouragement
            </Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !title.trim()}>
              {isSubmitting ? "Adding..." : "Celebrate Win! 🎉"}
            </Button>
          </div>
        </motion.form>
      </DialogContent>
    </Dialog>
  );
}