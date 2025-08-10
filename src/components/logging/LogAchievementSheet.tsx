import { useState } from "react";
import { useAction, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QuickPresetsTab } from "./tabs/QuickPresetsTab";
import { TextInputTab } from "./tabs/TextInputTab";
import { VoiceInputTab } from "./tabs/VoiceInputTab";
import { PhotoInputTab } from "./tabs/PhotoInputTab";
import { Flame, Sparkles, Loader2 } from "lucide-react";

interface LogAchievementSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const categories = [
  { slug: "health", name: "Health & Fitness", basePoints: 20 },
  { slug: "work", name: "Work & Career", basePoints: 15 },
  { slug: "learning", name: "Learning & Growth", basePoints: 25 },
  { slug: "social", name: "Social & Relationships", basePoints: 15 },
  { slug: "creative", name: "Creative & Hobbies", basePoints: 20 },
  { slug: "personal", name: "Personal Care", basePoints: 10 },
];

export function LogAchievementSheet({ open, onOpenChange }: LogAchievementSheetProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("");
  const [activeTab, setActiveTab] = useState("quick");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const logWin = useAction(api.logWin.logWin);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const handlePhotoSelected = (file: File | null) => {
    setPhotoFile(file);
  };

  const handleAudioRecorded = (file: File | null) => {
    setAudioFile(file);
  };

  const handleSubmit = async () => {
    if (!title.trim() || !category) {
      toast.error("Please provide a title and select a category");
      return;
    }

    setIsSubmitting(true);
    
    try {
      let photoStorageId: Id<"_storage"> | undefined = undefined;
      let audioStorageId: Id<"_storage"> | undefined = undefined;

      const isUploadingPhoto = photoFile && activeTab === 'photo';
      const isUploadingAudio = audioFile && activeTab === 'voice';

      if (isUploadingPhoto || isUploadingAudio) {
        setIsUploading(true);
      }

      if (isUploadingPhoto && photoFile) {
        const postUrl = await generateUploadUrl();
        const result = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": photoFile.type },
          body: photoFile,
        });
        const { storageId } = await result.json();
        photoStorageId = storageId;
      }

      if (isUploadingAudio && audioFile) {
        const postUrl = await generateUploadUrl();
        const result = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": audioFile.type },
          body: audioFile,
        });
        const { storageId } = await result.json();
        audioStorageId = storageId;
      }
      
      if (isUploadingPhoto || isUploadingAudio) {
        setIsUploading(false);
      }

      const clientId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const result = await logWin({
        clientId,
        title: title.trim(),
        description: description.trim() || undefined,
        categorySlug: category,
        source: activeTab as "quick" | "text" | "voice" | "photo",
        isPublic: true,
        photoStorageId,
        audioStorageId,
      });

      toast.success(`Win logged! +${result.pointsEarned} points`, {
        description: result.newStreak > 1 ? `${result.newStreak} day streak!` : undefined,
      });

      // Reset form
      setTitle("");
      setDescription("");
      setCategory("");
      setPhotoFile(null);
      setAudioFile(null);
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to log win. Please try again.");
      console.error("Error logging win:", error);
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  const selectedCategory = categories.find(c => c.slug === category);
  const estimatedPoints = selectedCategory ? selectedCategory.basePoints : 0;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-w-2xl mx-auto mt-24 p-0">
        <div className="p-6">
          <DrawerHeader className="p-0 text-left mb-4">
            <DrawerTitle className="text-2xl font-bold tracking-tight">Log Your Next Win</DrawerTitle>
            <DrawerDescription>Keep the momentum going. What did you accomplish?</DrawerDescription>
          </DrawerHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-4">
              <TabsTrigger value="quick">Quick</TabsTrigger>
              <TabsTrigger value="text">Text</TabsTrigger>
              <TabsTrigger value="voice">Voice</TabsTrigger>
              <TabsTrigger value="photo">Photo</TabsTrigger>
            </TabsList>
            <TabsContent value="quick">
              <QuickPresetsTab onSelect={setTitle} />
            </TabsContent>
            <TabsContent value="text">
              <TextInputTab value={title} onChange={setTitle} />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add more details (optional)..."
                className="w-full mt-2 p-2 border rounded-md resize-none"
                rows={2}
                maxLength={500}
              />
            </TabsContent>
            <TabsContent value="voice">
              <VoiceInputTab onTranscription={setTitle} onAudioRecorded={handleAudioRecorded} />
            </TabsContent>
            <TabsContent value="photo">
              <PhotoInputTab onPhotoSelected={handlePhotoSelected} isUploading={isUploading} />
            </TabsContent>
          </Tabs>

          {/* Category Selection */}
          <div className="mt-4">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.slug} value={cat.slug}>
                    {cat.name} (+{cat.basePoints} pts)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Gamification Preview */}
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {selectedCategory && (
                <div className="bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1 rounded-full">
                  {selectedCategory.name}
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-sm font-semibold text-yellow-600 bg-yellow-100 px-3 py-1 rounded-full">
                <Flame className="w-4 h-4" />
                <span>Streak</span>
              </div>
              <div className="flex items-center gap-1 text-sm font-semibold text-teal-600 bg-teal-100 px-3 py-1 rounded-full">
                <Sparkles className="w-4 h-4" />
                <span>~{estimatedPoints}pts</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-gray-50 border-t mt-6">
          <Button 
            onClick={handleSubmit} 
            className="w-full" 
            size="lg"
            disabled={isSubmitting || isUploading || !title.trim() || !category}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading Media...
              </>
            ) : isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Logging Win...
              </>
            ) : (
              "Submit Win"
            )}
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}