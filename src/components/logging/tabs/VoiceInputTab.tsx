import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";
import { useState } from "react";

interface VoiceInputTabProps {
  onTranscription: (text: string) => void;
}

export function VoiceInputTab({ onTranscription }: VoiceInputTabProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  const handleToggleRecording = () => {
    // TODO: Implement Web Speech API
    if (!('webkitSpeechRecognition' in window)) {
      setIsSupported(false);
      return;
    }
    setIsRecording(!isRecording);
    if (isRecording) {
        onTranscription("This is a sample voice transcription.");
    }
  };

  if (!isSupported) {
    return <p className="text-center text-sm text-red-600">Voice input is not supported by your browser.</p>
  }

  return (
    <div className="flex flex-col items-center justify-center h-24 gap-4">
      <Button
        variant={isRecording ? "destructive" : "outline"}
        size="icon"
        className="w-16 h-16 rounded-full"
        onClick={handleToggleRecording}
      >
        {isRecording ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
      </Button>
      <p className="text-sm text-gray-600">
        {isRecording ? "Recording... Click to stop." : "Click to start recording."}
      </p>
    </div>
  );
}
