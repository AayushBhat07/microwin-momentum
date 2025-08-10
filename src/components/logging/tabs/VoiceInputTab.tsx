import { Button } from "@/components/ui/button";
import { Mic, MicOff, Volume2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

interface VoiceInputTabProps {
  onTranscription: (text: string) => void;
}

export function VoiceInputTab({ onTranscription }: VoiceInputTabProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    // Initialize speech recognition
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        setTranscript(prev => {
          const newTranscript = prev + finalTranscript;
          onTranscription(newTranscript);
          return newTranscript;
        });
      }
      setInterimTranscript(interimTranscript);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      toast.error(`Speech recognition error: ${event.error}`);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
      setInterimTranscript("");
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onTranscription]);

  const handleToggleRecording = () => {
    if (!isSupported) {
      toast.error("Speech recognition is not supported in your browser");
      return;
    }

    if (isRecording) {
      // Stop recording
      recognitionRef.current?.stop();
      setIsRecording(false);
      toast.success("Recording stopped");
    } else {
      // Start recording
      setTranscript("");
      setInterimTranscript("");
      recognitionRef.current?.start();
      setIsRecording(true);
      toast.success("Recording started - speak now!");
    }
  };

  const clearTranscript = () => {
    setTranscript("");
    setInterimTranscript("");
    onTranscription("");
  };

  if (!isSupported) {
    return (
      <div className="text-center p-6">
        <Volume2 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-sm text-red-600 mb-2">Voice input is not supported by your browser.</p>
        <p className="text-xs text-gray-500">Try using Chrome, Edge, or Safari for voice recording.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Recording Button */}
      <div className="flex flex-col items-center justify-center gap-4">
        <Button
          variant={isRecording ? "destructive" : "outline"}
          size="icon"
          className="w-16 h-16 rounded-full"
          onClick={handleToggleRecording}
        >
          {isRecording ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </Button>
        <p className="text-sm text-gray-600 text-center">
          {isRecording ? "Recording... Click to stop." : "Click to start recording."}
        </p>
      </div>

      {/* Live Transcript Display */}
      {(transcript || interimTranscript || isRecording) && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border min-h-[100px]">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-700">Live Transcript:</h4>
            {transcript && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearTranscript}
                className="text-xs"
              >
                Clear
              </Button>
            )}
          </div>
          <div className="text-sm text-gray-900 whitespace-pre-wrap">
            {transcript}
            <span className="text-gray-500 italic">{interimTranscript}</span>
            {isRecording && !transcript && !interimTranscript && (
              <span className="text-gray-400 italic">Listening...</span>
            )}
          </div>
        </div>
      )}

      {/* Recording Status Indicator */}
      {isRecording && (
        <div className="flex items-center justify-center gap-2 text-red-600">
          <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
          <span className="text-xs font-medium">RECORDING</span>
        </div>
      )}
    </div>
  );
}