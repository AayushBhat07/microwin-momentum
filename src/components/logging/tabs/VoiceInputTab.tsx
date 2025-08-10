import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Mic, MicOff, Volume2, AudioLines } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

interface VoiceInputTabProps {
  onTranscription: (text: string) => void;
  onAudioRecorded: (file: File | null) => void;
}

const SUPPORTED_LANGUAGES = [
  { code: 'en-US', name: 'English (US)' },
  { code: 'hi-IN', name: 'Hindi (India)' },
  { code: 'es-ES', name: 'Spanish (Spain)' },
  { code: 'fr-FR', name: 'French (France)' },
  { code: 'de-DE', name: 'German (Germany)' },
  { code: 'ja-JP', name: 'Japanese (Japan)' },
  { code: 'pt-BR', name: 'Portuguese (Brazil)' },
  { code: 'ru-RU', name: 'Russian (Russia)' },
  { code: 'zh-CN', name: 'Chinese (Mandarin, Simplified)' },
  { code: 'bn-IN', name: 'Bengali (India)' },
  { code: 'te-IN', name: 'Telugu (India)' },
  { code: 'mr-IN', name: 'Marathi (India)' },
  { code: 'ta-IN', name: 'Tamil (India)' },
  { code: 'ur-IN', name: 'Urdu (India)' },
  { code: 'gu-IN', name: 'Gujarati (India)' },
  { code: 'kn-IN', name: 'Kannada (India)' },
  { code: 'ml-IN', name: 'Malayalam (India)' },
  { code: 'pa-IN', name: 'Punjabi (India)' },
];

export function VoiceInputTab({ onTranscription, onAudioRecorded }: VoiceInputTabProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [selectedLang, setSelectedLang] = useState('en-US');
  const [timeLeft, setTimeLeft] = useState(30);
  
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const stopTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = selectedLang;

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
      stopRecording();
    };

    recognition.onend = () => {
      stopRecording();
    };

    recognitionRef.current = recognition;

    return () => {
      recognitionRef.current?.stop();
      mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
      if (stopTimeoutRef.current) clearTimeout(stopTimeoutRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [onTranscription, selectedLang]);

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    if (stopTimeoutRef.current) clearTimeout(stopTimeoutRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    setIsRecording(false);
    setInterimTranscript("");
  };

  const handleToggleRecording = () => {
    if (!isSupported) {
      toast.error("Speech recognition is not supported in your browser");
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          clearTranscript();

          recognitionRef.current.lang = selectedLang;
          recognitionRef.current?.start();

          const mediaRecorder = new MediaRecorder(stream);
          mediaRecorderRef.current = mediaRecorder;
          mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) audioChunksRef.current.push(event.data);
          };
          mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            const audioFile = new File([audioBlob], `voice-memo-${Date.now()}.webm`, { type: 'audio/webm' });
            const url = URL.createObjectURL(audioBlob);
            setAudioUrl(url);
            onAudioRecorded(audioFile);
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
            recognitionRef.current?.stop();
          }, 30000);
        })
        .catch(err => {
          console.error("Error accessing microphone:", err);
          toast.error("Could not access microphone. Please grant permission.");
        });
    }
  };

  const clearTranscript = () => {
    setTranscript("");
    setInterimTranscript("");
    onTranscription("");
    setAudioUrl(null);
    onAudioRecorded(null);
    audioChunksRef.current = [];
  };

  if (!isSupported) {
    return (
      <div className="text-center p-6 font-mono border-4 border-foreground shadow-[8px_8px_0px_#000]">
        <Volume2 className="w-12 h-12 mx-auto mb-4 text-foreground" />
        <p className="text-sm text-destructive mb-2">[VOICE INPUT NOT SUPPORTED]</p>
        <p className="text-xs text-muted-foreground">&gt; TRY CHROME/EDGE/SAFARI</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-mono p-4 border-4 border-foreground bg-background">
      <div className="space-y-2">
        <Label htmlFor="language-select" className="text-sm font-bold text-foreground">[TRANSCRIPTION LANGUAGE]</Label>
        <Select value={selectedLang} onValueChange={setSelectedLang} disabled={isRecording}>
          <SelectTrigger id="language-select" className="w-full border-2 border-foreground shadow-[4px_4px_0px_#000] rounded-none">
            <SelectValue placeholder="Select a language" />
          </SelectTrigger>
          <SelectContent className="font-mono border-2 border-foreground rounded-none bg-background">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <SelectItem key={lang.code} value={lang.code} className="focus:bg-accent">
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
          className="w-24 h-24 rounded-full border-4 border-foreground shadow-[8px_8px_0px_#000] hover:shadow-[4px_4px_0px_#000] transition-all duration-200"
          onClick={handleToggleRecording}
        >
          {isRecording ? <MicOff className="w-10 h-10" /> : <Mic className="w-10 h-10" />}
        </Button>
        <p className="text-sm text-muted-foreground text-center h-5">
          {isRecording ? `[TIME_LEFT: ${timeLeft}s]` : "> PRESS TO RECORD (30s MAX)"}
        </p>
      </div>

      {(transcript || interimTranscript || isRecording) && (
        <div className="mt-4 p-4 bg-muted/50 border-2 border-foreground min-h-[100px] space-y-2">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-bold text-foreground">[LIVE_TRANSCRIPT]</h4>
            {(transcript || audioUrl) && (
              <Button variant="ghost" size="sm" onClick={clearTranscript} className="text-xs underline">
                [CLEAR]
              </Button>
            )}
          </div>
          <div className="text-sm text-foreground whitespace-pre-wrap">
            {transcript}
            <span className="text-muted-foreground">{interimTranscript}</span>
            {isRecording && !transcript && !interimTranscript && (
              <span className="text-muted-foreground animate-pulse">&gt; LISTENING...</span>
            )}
          </div>
        </div>
      )}

      {audioUrl && (
        <div className="mt-4 p-4 bg-muted/50 border-2 border-foreground">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-bold text-foreground">[PLAYBACK]</h4>
            <AudioLines className="w-4 h-4 text-foreground" />
          </div>
          <audio src={audioUrl} controls className="w-full h-10" />
        </div>
      )}

      {isRecording && (
        <div className="flex items-center justify-center gap-2 text-destructive">
          <div className="w-3 h-3 bg-destructive rounded-full animate-pulse border-2 border-destructive-foreground"></div>
          <span className="text-sm font-bold">[REC]</span>
        </div>
      )}
    </div>
  );
}