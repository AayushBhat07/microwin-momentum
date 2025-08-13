import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { ACHIEVEMENT_CATEGORIES } from "@/convex/schema";

interface CreateAchievementProps {
  trigger?: React.ReactNode;
}

export function CreateAchievement({ trigger }: CreateAchievementProps = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("");
  const [points, setPoints] = useState(10);
  const [isPublic, setIsPublic] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const createAchievement = useMutation(api.achievements.log);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !category) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsCreating(true);
    try {
      await createAchievement({
        title: title.trim(),
        description: description.trim() || undefined,
        category: category as any,
        pointsEarned: points,
        isPublic,
        source: "quick",
      });

      toast.success(`Achievement "${title}" created! +${points} points`);
      
      // Reset form
      setTitle("");
      setDescription("");
      setCategory("");
      setPoints(10);
      setIsPublic(true);
      setIsOpen(false);
    } catch (error) {
      toast.error("Failed to create achievement.");
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Log New Achievement
          </Button>
        </motion.div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Achievement</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="What did you accomplish?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isCreating}
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Tell us more about your achievement..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isCreating}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="category">Category *</Label>
            <Select value={category} onValueChange={setCategory} disabled={isCreating}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ACHIEVEMENT_CATEGORIES).map(([key, value]) => (
                  <SelectItem key={key} value={value.slug}>
                    {key.charAt(0) + key.slice(1).toLowerCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="points">Points</Label>
            <Input
              id="points"
              type="number"
              min="1"
              max="100"
              value={points}
              onChange={(e) => setPoints(parseInt(e.target.value) || 10)}
              disabled={isCreating}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isPublic"
              checked={isPublic}
              onCheckedChange={setIsPublic}
              disabled={isCreating}
            />
            <Label htmlFor="isPublic">Share publicly</Label>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isCreating}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating} className="flex-1">
              {isCreating ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Log Achievement
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}