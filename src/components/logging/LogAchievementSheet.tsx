import { useState } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Type, Mic, Camera } from "lucide-react";
import { toast } from "sonner";
import { postLogSuccess } from "@/lib/postLogSuccess";
import { v4 as uuidv4 } from "uuid";
import { TextLogForm } from "./forms/TextLogForm";
import { PhotoLogForm } from "./forms/PhotoLogForm";
import { VoiceLogForm } from "./forms/VoiceLogForm";
import { Doc, Id } from "@/convex/_generated/dataModel";

interface LogAchievementSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LogAchievementSheet({ open, onOpenChange }: LogAchievementSheetProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("text");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const logWin = useAction(api.logWin.logWin);
  const categories = useQuery(api.achievements.getCategories);

  const handleSubmit = async (data: {
    title: string;
    description?: string;
    categorySlug: string;
    source: "text" | "voice" | "photo";
    photoStorageId?: Id<"_storage">;
    audioStorageId?: Id<"_storage">; // For voice logs
    tags?: string[];
    isPublic?: boolean;
  }): Promise<boolean> => {
    if (!user) {
      toast.error("Please sign in to log achievements");
      return false;
    }

    // Client-side validation
    if (!data.title.trim()) {
      toast.error("Title is required");
      return false;
    }

    if (!data.categorySlug) {
      toast.error("Category is required");
      return false;
    }

    setIsSubmitting(true);

    try {
      const clientId = uuidv4();
      
      const result = await logWin({
        title: data.title.trim(),
        description: data.description?.trim(),
        categorySlug: data.categorySlug,
        mode: data.source,
        photoStorageId: data.photoStorageId,
        audioStorageId: data.audioStorageId,
        tags: data.tags,
        isPublic: data.isPublic ?? true,
        clientId,
      });

      if (result?.success) {
        postLogSuccess(result);
        onOpenChange(false);
        setActiveTab("text");
        return true;
      } else {
        toast.error("Failed to log achievement. Unexpected response from server.");
        return false;
      }
    } catch (error: any) {
      console.error("Error logging achievement:", error);
      toast.error(error.message || "Failed to log achievement");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!categories) {
    return null;
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md bg-black/95 border-blue-500/50 flex flex-col">
        <SheetHeader>
          <SheetTitle className="font-pixel text-white text-xl">Log Your Win! 🎉</SheetTitle>
        </SheetHeader>

        <div className="mt-6 flex-1 overflow-y-auto -mr-6 pr-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-gray-800/50 sticky top-0 z-10 backdrop-blur-sm">
              <TabsTrigger value="text" className="data-[state=active]:bg-blue-600">
                <Type className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="voice" className="data-[state=active]:bg-blue-600">
                <Mic className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="photo" className="data-[state=active]:bg-blue-600">
                <Camera className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>

            <TabsContent value="text" className="mt-4">
              <TextLogForm 
                categories={categories}
                onSubmit={handleSubmit as any}
                isSubmitting={isSubmitting}
              />
            </TabsContent>

            <TabsContent value="voice" className="mt-4">
              <VoiceLogForm
                categories={categories}
                onSubmit={handleSubmit as any}
                isSubmitting={isSubmitting}
              />
            </TabsContent>

            <TabsContent value="photo" className="mt-4">
              <PhotoLogForm
                categories={categories}
                onSubmit={handleSubmit as any}
                isSubmitting={isSubmitting}
              />
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}