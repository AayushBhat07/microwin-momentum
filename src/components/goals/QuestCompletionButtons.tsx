import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Check, Loader2, Camera, Mic } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface QuestCompletionButtonsProps {
  questId: Id<"userPresets">;
  questTitle: string;
  isCompleting: boolean;
  onComplete: () => void;
  disabled?: boolean;
}

export function QuestCompletionButtons({ 
  questId, 
  questTitle, 
  isCompleting, 
  onComplete,
  disabled = false 
}: QuestCompletionButtonsProps) {
  const [showVoiceDialog, setShowVoiceDialog] = useState(false);
  const [showPhotoDialog, setShowPhotoDialog] = useState(false);
  const [note, setNote] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  
  const completeQuestWithMedia = useMutation(api.habits.completeDailyQuestWithMedia);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const handleQuickComplete = async () => {
    try {
      await completeQuestWithMedia({ presetId: questId });
      toast.success(`+10 XP! Completed: ${questTitle}`, {
        description: "Your heroic deed has been recorded!",
      });
      onComplete();
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    }
  };

  const handleVoiceComplete = async () => {
    if (!mediaRecorder && !isRecording) {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        const chunks: Blob[] = [];

        recorder.ondataavailable = (e) => chunks.push(e.data);
        recorder.onstop = async () => {
          const audioBlob = new Blob(chunks, { type: 'audio/webm' });
          await uploadAndComplete(audioBlob, 'audio');
          stream.getTracks().forEach(track => track.stop());
        };

        recorder.start();
        setMediaRecorder(recorder);
        setIsRecording(true);
        toast.info("Recording started... Click again to stop and complete quest.");
      } catch (error) {
        toast.error("Could not access microphone");
      }
    } else if (mediaRecorder && isRecording) {
      // Stop recording
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
    }
  };

  const handlePhotoComplete = () => {
    setShowPhotoDialog(true);
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPhotoFile(file);
    }
  };

  const uploadAndComplete = async (file: Blob, type: 'audio' | 'photo') => {
    try {
      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      
      if (!result.ok) throw new Error("Upload failed");
      
      const { storageId } = await result.json();
      
      const args = {
        presetId: questId,
        note: note.trim() || undefined,
        ...(type === 'audio' ? { audioStorageId: storageId } : { photoStorageId: storageId })
      };

      await completeQuestWithMedia(args);
      
      toast.success(`+10 XP! Completed with ${type}: ${questTitle}`, {
        description: "Your heroic deed has been recorded!",
      });
      
      onComplete();
      setShowVoiceDialog(false);
      setShowPhotoDialog(false);
      setNote("");
      setPhotoFile(null);
    } catch (error) {
      toast.error(`Failed to upload ${type}. Please try again.`);
    }
  };

  const handlePhotoSubmit = async () => {
    if (!photoFile) {
      toast.error("Please select a photo first");
      return;
    }
    await uploadAndComplete(photoFile, 'photo');
  };

  if (disabled || isCompleting) {
    return (
      <Button
        disabled={true}
        className="w-full font-pixel text-base transition-all uppercase bg-green-700 text-white border-2 border-green-800 cursor-not-allowed"
      >
        <div className="flex items-center justify-center">
          {isCompleting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Check className="w-5 h-5 mr-2" />}
          {isCompleting ? "Completing..." : "Done"}
        </div>
      </Button>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {/* Quick Complete */}
        <Button
          onClick={handleQuickComplete}
          className="w-full font-pixel text-sm transition-all uppercase bg-green-600 hover:bg-green-700 border-green-700 text-white border-2 shadow-[2px_2px_0px_#000] active:translate-y-0.5 active:translate-x-0.5 active:shadow-none"
        >
          <Check className="w-4 h-4 mr-2" />
          Complete Quest
        </Button>

        {/* Voice Complete */}
        <Button
          onClick={handleVoiceComplete}
          className={`w-full font-pixel text-sm transition-all uppercase border-2 shadow-[2px_2px_0px_#000] active:translate-y-0.5 active:translate-x-0.5 active:shadow-none ${
            isRecording 
              ? 'bg-red-600 hover:bg-red-700 border-red-700 text-white animate-pulse' 
              : 'bg-blue-600 hover:bg-blue-700 border-blue-700 text-white'
          }`}
        >
          <Mic className="w-4 h-4 mr-2" />
          {isRecording ? "Stop & Complete" : "Voice Note"}
        </Button>

        {/* Photo Complete */}
        <Button
          onClick={handlePhotoComplete}
          className="w-full font-pixel text-sm transition-all uppercase bg-purple-600 hover:bg-purple-700 border-purple-700 text-white border-2 shadow-[2px_2px_0px_#000] active:translate-y-0.5 active:translate-x-0.5 active:shadow-none"
        >
          <Camera className="w-4 h-4 mr-2" />
          Add Photo
        </Button>
      </div>

      {/* Photo Dialog */}
      <Dialog open={showPhotoDialog} onOpenChange={setShowPhotoDialog}>
        <DialogContent className="bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="font-pixel text-white">Complete Quest with Photo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-pixel text-gray-300 mb-2">
                Add a photo to your quest completion:
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="w-full text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-pixel text-gray-300 mb-2">
                Optional note:
              </label>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note about your achievement..."
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowPhotoDialog(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handlePhotoSubmit}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                Complete Quest
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
