import { useState } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QuickPresetsTab } from "./tabs/QuickPresetsTab";
import { Zap, Type, Mic, Camera } from "lucide-react";
import { toast } from "sonner";
import { postLogSuccess } from "@/lib/postLogSuccess";
import { v4 as uuidv4 } from "uuid";

interface LogAchievementSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LogAchievementSheet({ open, onOpenChange }: LogAchievementSheetProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("quick");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const logWin = useAction(api.logWin.logWin);
  const categories = useQuery(api.achievements.getCategories);

  const handleSubmit = async (data: {
    title: string;
    description?: string;
    categorySlug: string;
    source: "quick" | "text" | "voice" | "photo";
    photoStorageId?: string;
    tags?: string[];
    isPublic?: boolean;
  }) => {
    if (!user) {
      toast.error("Please sign in to log achievements");
      return;
    }

    // Client-side validation
    if (!data.title.trim()) {
      toast.error("Title is required");
      return;
    }

    if (!data.categorySlug) {
      toast.error("Category is required");
      return;
    }

    setIsSubmitting(true);

    try {
      const clientId = uuidv4();
      
      const result = await logWin({
        title: data.title.trim(),
        description: data.description?.trim(),
        categorySlug: data.categorySlug,
        source: data.source,
        photoStorageId: data.photoStorageId as any,
        tags: data.tags,
        isPublic: data.isPublic ?? true,
        clientId,
      });

      if (result.success) {
        // Use centralized success handler
        postLogSuccess(result);
        
        // Close the sheet
        onOpenChange(false);
        
        // Reset to quick tab for next use
        setActiveTab("quick");
      } else {
        toast.error(result.error || "Failed to log achievement");
      }
    } catch (error: any) {
      console.error("Error logging achievement:", error);
      toast.error(error.message || "Failed to log achievement");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!categories) {
    return null;
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md bg-black/95 border-blue-500/50">
        <SheetHeader>
          <SheetTitle className="font-pixel text-white text-xl">Log Your Win! 🎉</SheetTitle>
        </SheetHeader>

        <div className="mt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-gray-800/50">
              <TabsTrigger value="quick" className="data-[state=active]:bg-blue-600">
                <Zap className="h-4 w-4" />
              </TabsTrigger>
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

            <TabsContent value="quick" className="mt-4">
              <QuickPresetsTab 
                onSelect={(text: string) => {
                  handleSubmit({
                    title: text,
                    categorySlug: "health", // Default category for quick presets
                    source: "quick",
                    isPublic: true
                  });
                }}
              />
            </TabsContent>

            <TabsContent value="text" className="mt-4">
              <div className="text-center text-blue-300 font-pixel">
                Text input coming soon...
              </div>
            </TabsContent>

            <TabsContent value="voice" className="mt-4">
              <div className="text-center text-blue-300 font-pixel">
                Voice input coming soon...
              </div>
            </TabsContent>

            <TabsContent value="photo" className="mt-4">
              <div className="text-center text-blue-300 font-pixel">
                Photo input coming soon...
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}