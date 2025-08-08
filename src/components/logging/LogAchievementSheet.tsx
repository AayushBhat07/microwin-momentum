import { useState } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { QuickPresetsTab } from "./tabs/QuickPresetsTab";
import { TextInputTab } from "./tabs/TextInputTab";
import { VoiceInputTab } from "./tabs/VoiceInputTab";
import { PhotoInputTab } from "./tabs/PhotoInputTab";
import { Flame, Sparkles } from "lucide-react";

interface LogAchievementSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LogAchievementSheet({ open, onOpenChange }: LogAchievementSheetProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string | null>(null);

  const handleSubmit = () => {
    // TODO: Implement submission logic with gamification
    console.log("Submitting:", { title, category });
    onOpenChange(false); // Close sheet on submit
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-w-2xl mx-auto mt-24 p-0">
        <div className="p-6">
          <DrawerHeader className="p-0 text-left mb-4">
            <DrawerTitle className="text-2xl font-bold tracking-tight">Log Your Next Win</DrawerTitle>
            <DrawerDescription>Keep the momentum going. What did you accomplish?</DrawerDescription>
          </DrawerHeader>

          <Tabs defaultValue="quick" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-4">
              <TabsTrigger value="quick">Quick</TabsTrigger>
              <TabsTrigger value="text">Text</TabsTrigger>
              <TabsTrigger value="voice">Voice</TabsTrigger>
              <TabsTrigger value="photo">Photo</TabsTrigger>
            </TabsList>
            <TabsContent value="quick"><QuickPresetsTab onSelect={setTitle} /></TabsContent>
            <TabsContent value="text"><TextInputTab value={title} onChange={setTitle} /></TabsContent>
            <TabsContent value="voice"><VoiceInputTab onTranscription={setTitle} /></TabsContent>
            <TabsContent value="photo"><PhotoInputTab /></TabsContent>
          </Tabs>

          {/* Category, Tags, and Gamification Preview */}
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
                {/* TODO: Add category selector */}
                <div className="bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1 rounded-full">
                    Category
                </div>
                {/* TODO: Add tag input */}
            </div>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-sm font-semibold text-yellow-600 bg-yellow-100 px-3 py-1 rounded-full">
                    <Flame className="w-4 h-4" />
                    <span>Day 4</span>
                </div>
                <div className="flex items-center gap-1 text-sm font-semibold text-teal-600 bg-teal-100 px-3 py-1 rounded-full">
                    <Sparkles className="w-4 h-4" />
                    <span>+30pts (x1.2)</span>
                </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-gray-50 border-t mt-6">
            <Button onClick={handleSubmit} className="w-full" size="lg">
                Submit Win
            </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
