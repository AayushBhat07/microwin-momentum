import { useState, useEffect, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Check, Loader2, Camera, Mic, Upload, X, MicOff } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { CameraView } from "../logging/CameraView";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

const SUPPORTED_LANGUAGES = [
  { code: 'en-US', name: 'English (US)' },
  { code: 'es-ES', name: 'Spanish (Spain)' },
  { code: 'fr-FR', name: 'French (France)' },
  { code: 'de-DE', name: 'German (Germany)' },
  { code: 'ja-JP', name: 'Japanese (Japan)' },
  { code: 'zh-CN', name: 'Chinese (Mandarin)' },
];

interface QuestCompletionButtonsProps {
  questId: Id<"userPresets">;
  onComplete: () => void;
  isCompleting: boolean;
  setIsCompleting: (isCompleting: string | null) => void;
  disabled?: boolean;
}

export function QuestCompletionButtons({
  questId,
  onComplete,
  isCompleting,
  setIsCompleting,
  disabled = false,
}: QuestCompletionButtonsProps) {
  const [showVoiceDialog, setShowVoiceDialog] = useState(false);
  const [showPhotoDialog, setShowPhotoDialog] = useState(false);
  const [note, setNote] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);

  // Voice Transcription State
  const [isVoiceSupported, setIsVoiceSupported] = useState(true);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [selectedLang, setSelectedLang] = useState('en-US');
  const [timeLeft, setTimeLeft] = useState(30);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const stopTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const completeQuestWithMedia = useMutation(api.habits.completeDailyQuestWithMedia);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const completeQuest = useMutation(api.habits.completeDailyQuest);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsVoiceSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = selectedLang;

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPart = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcriptPart;
        } else {
          interim += transcriptPart;
        }
      }
      if (finalTranscript) {
        setTranscript(prev => prev + finalTranscript);
      }
      setInterimTranscript(interim);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      toast.error(`Speech recognition error: ${event.error}`);
      stopVoiceRecording();
    };

    recognitionRef.current = recognition;

    return () => {
      recognitionRef.current?.stop();
      mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
      if (stopTimeoutRef.current) clearTimeout(stopTimeoutRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [selectedLang]);

  const handleQuickComplete = async () => {
    if (isCompleting) return;
    
    setIsCompleting(questId);
    try {
      const result = await completeQuest({ presetId: questId });
      toast.success(`+10 XP! Completed: ${result.title}`, {
        description: "Your heroic deed has been recorded!",
      });
      onComplete();
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsCompleting(null);
    }
  };

  const handleVoiceComplete = () => {
    setShowVoiceDialog(true);
  };

  const stopVoiceRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    if (stopTimeoutRef.current) clearTimeout(stopTimeoutRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    setIsRecording(false);
    setInterimTranscript("");
  };

  const handleVoiceRecordToggle = () => {
    if (!isVoiceSupported) {
      toast.error("Speech recognition is not supported in your browser");
      return;
    }

    if (isRecording) {
      stopVoiceRecording();
    } else {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          setTranscript("");
          setInterimTranscript("");
          setAudioBlob(null);
          audioChunksRef.current = [];

          recognitionRef.current.lang = selectedLang;
          recognitionRef.current?.start();

          const mediaRecorder = new MediaRecorder(stream);
          mediaRecorderRef.current = mediaRecorder;
          mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) audioChunksRef.current.push(event.data);
          };
          mediaRecorder.onstop = () => {
            const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            setAudioBlob(blob);
            stream.getTracks().forEach(track => track.stop());
          };
          mediaRecorder.start();

          setIsRecording(true);
          setTimeLeft(30);
          toast.success("Recording started - speak now!");

          countdownIntervalRef.current = setInterval(() => {
            setTimeLeft(prev => {
              if (prev <= 1) {
                if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
                return 0;
              }
              return prev - 1;
            });
          }, 1000);

          stopTimeoutRef.current = setTimeout(() => {
            toast.info("30 second recording limit reached.");
            stopVoiceRecording();
          }, 30000);
        })
        .catch(err => {
          console.error("Error accessing microphone:", err);
          toast.error("Could not access microphone. Please grant permission.");
        });
    }
  };

  const handleVoiceSubmit = async () => {
    if (!audioBlob) {
      toast.error("No audio recorded. Please record your voice note first.");
      return;
    }
    await uploadAndComplete(audioBlob, 'audio', transcript);
  };

  const handlePhotoComplete = () => {
    setShowPhotoDialog(true);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      displayAndSetFile(file);
    }
  };

  const handlePhotoTaken = (file: File) => {
    displayAndSetFile(file);
    setShowCamera(false);
    setShowPhotoDialog(true);
  };

  const displayAndSetFile = (file: File) => {
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPhotoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const clearPhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    const fileInput = document.getElementById(`photo-upload-${questId}`) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const uploadAndComplete = async (file: Blob, type: 'audio' | 'photo', noteOverride?: string) => {
    if (isCompleting) return;
    setIsCompleting(questId);
    try {
      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();

      await completeQuestWithMedia({
        presetId: questId,
        photoStorageId: type === 'photo' ? storageId : undefined,
        audioStorageId: type === 'audio' ? storageId : undefined,
        note: noteOverride ?? note,
      });

      toast.success(`Quest completed with ${type}!`);
      onComplete();
      setShowVoiceDialog(false);
      setShowPhotoDialog(false);
      setNote("");
      setPhotoFile(null);
      setPhotoPreview(null);
      setTranscript("");
      setInterimTranscript("");
      setAudioBlob(null);
    } catch (error) {
      toast.error(`Failed to upload ${type}. Please try again.`);
    } finally {
      setIsCompleting(null);
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

  if (showCamera) {
    return <CameraView onPhotoTaken={handlePhotoTaken} onClose={() => setShowCamera(false)} />;
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

      {/* Voice Dialog */}
      <Dialog open={showVoiceDialog} onOpenChange={(isOpen) => {
        setShowVoiceDialog(isOpen);
        if (!isOpen) {
          stopVoiceRecording();
          setTranscript("");
          setInterimTranscript("");
          setAudioBlob(null);
        }
      }}>
        <DialogContent className="bg-gray-900 border-gray-700 font-mono">
          <DialogHeader>
            <DialogTitle className="font-pixel text-white">Complete with Voice Note</DialogTitle>
          </DialogHeader>
          {!isVoiceSupported ? (
            <div className="text-center p-4 text-red-400">
              Voice recognition not supported in this browser. Try Chrome or Edge.
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="language-select" className="text-sm font-bold text-gray-300">[LANGUAGE]</Label>
                <Select value={selectedLang} onValueChange={setSelectedLang} disabled={isRecording}>
                  <SelectTrigger id="language-select" className="w-full bg-gray-800 border-gray-600 text-white">
                    <SelectValue placeholder="Select a language" />
                  </SelectTrigger>
                  <SelectContent className="font-mono bg-gray-800 border-gray-600 text-white">
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code} className="focus:bg-gray-700">
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col items-center justify-center gap-4 pt-4">
                <Button
                  variant={isRecording ? "destructive" : "outline"}
                  size="icon"
                  className="w-24 h-24 rounded-full border-4"
                  onClick={handleVoiceRecordToggle}
                >
                  {isRecording ? <MicOff className="w-10 h-10" /> : <Mic className="w-10 h-10" />}
                </Button>
                <p className="text-sm text-gray-400 text-center h-5">
                  {isRecording ? `[TIME_LEFT: ${timeLeft}s]` : "> PRESS TO RECORD (30s MAX)"}
                </p>
                {isRecording && (
                  <div className="w-full px-4 pt-2">
                    <Progress value={((30 - timeLeft) / 30) * 100} className="h-4 w-full bg-gray-700 [&>div]:bg-blue-500" />
                  </div>
                )}
              </div>

              {(transcript || interimTranscript || isRecording) && (
                <div className="mt-4 p-4 bg-gray-800 border border-gray-700 min-h-[100px] space-y-2">
                  <h4 className="text-sm font-bold text-gray-300">[LIVE_TRANSCRIPT]</h4>
                  <div className="text-sm text-white whitespace-pre-wrap">
                    {transcript}
                    <span className="text-gray-400">{interimTranscript}</span>
                    {isRecording && !transcript && !interimTranscript && (
                      <span className="text-gray-500 animate-pulse">&gt; LISTENING...</span>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => setShowVoiceDialog(false)}
                  variant="outline"
                  className="flex-1"
                  disabled={isCompleting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleVoiceSubmit}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={!audioBlob || isCompleting}
                >
                  {isCompleting ? <Loader2 className="animate-spin" /> : "Complete Quest"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Photo Dialog */}
      <Dialog open={showPhotoDialog} onOpenChange={(isOpen) => {
        setShowPhotoDialog(isOpen);
        if (!isOpen) {
          clearPhoto();
          setNote("");
        }
      }}>
        <DialogContent className="bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="font-pixel text-white">Complete Quest with Photo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {!photoPreview ? (
              <div className="flex gap-4">
                <Button 
                  variant="outline" 
                  className="flex-1 h-24 flex flex-col gap-2" 
                  onClick={() => {
                    setShowCamera(true);
                    setShowPhotoDialog(false);
                  }}
                  disabled={isCompleting}
                >
                  <Camera className="w-6 h-6" />
                  <span className="text-xs">Take Photo</span>
                </Button>
                
                <label className="flex-1 cursor-pointer">
                  <div className="w-full h-24 flex flex-col gap-2 items-center justify-center rounded-md border border-input bg-transparent hover:bg-accent hover:text-accent-foreground">
                    <Upload className="w-6 h-6" />
                    <span className="text-xs">Upload Photo</span>
                  </div>
                  <input
                    id={`photo-upload-${questId}`}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={isCompleting}
                  />
                </label>
              </div>
            ) : (
              <div className="mt-4 relative">
                <img
                  src={photoPreview}
                  alt="Selected"
                  className="w-full h-40 object-cover rounded-md border"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6"
                  onClick={clearPhoto}
                  disabled={isCompleting}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
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
                disabled={isCompleting}
              >
                Cancel
              </Button>
              <Button
                onClick={handlePhotoSubmit}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
                disabled={!photoFile || isCompleting}
              >
                {isCompleting ? <Loader2 className="animate-spin" /> : "Complete Quest"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}