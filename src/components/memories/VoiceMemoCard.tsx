import { Memory } from "@/convex/memories";
import { format } from "date-fns";
import { Play, Pause, Mic, Star } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

interface VoiceMemoCardProps {
  memory: Memory;
}

export function VoiceMemoCard({ memory }: VoiceMemoCardProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const togglePlay = (e?: React.MouseEvent) => {
    e?.stopPropagation(); // Prevent card click when clicking button
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    const updateProgress = () => {
      if (audio) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };
    const handleEnded = () => {
        setIsPlaying(false);
        setProgress(0);
    }

    audio?.addEventListener("timeupdate", updateProgress);
    audio?.addEventListener("ended", handleEnded);
    return () => {
      audio?.removeEventListener("timeupdate", updateProgress);
      audio?.removeEventListener("ended", handleEnded);
    };
  }, []);

  return (
    <motion.div 
      className={`aspect-square relative overflow-hidden cursor-pointer group border-4 p-1 transition-all duration-300 bg-blue-900/40 ${
        isPlaying ? "border-green-500 animate-pulse-border" : "border-double border-blue-600/70"
      }`}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => togglePlay()}
    >
      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-blue-400 opacity-70"></div>
      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-blue-400 opacity-70"></div>
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-blue-400 opacity-70"></div>
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-blue-400 opacity-70"></div>

      <div className="relative w-full h-full flex flex-col justify-between p-3 bg-blue-900/20">
        {memory.audioUrl && (
          <audio ref={audioRef} src={memory.audioUrl} id={`audio-${memory._id}`} preload="metadata" />
        )}
        
        {/* Background Icon */}
        <Mic className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2 text-blue-800/30 transition-transform group-hover:scale-110" />

        {/* Play/Pause Button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={(e) => togglePlay(e)}
            className="w-20 h-20 bg-black/40 border-2 border-blue-600 flex items-center justify-center text-white rounded-full backdrop-blur-sm hover:bg-blue-900/70 transition-all duration-200 scale-90 group-hover:scale-100 opacity-80 group-hover:opacity-100"
            aria-label="Play voice memo"
          >
            {isPlaying ? <Pause className="h-10 w-10" /> : <Play className="h-10 w-10 ml-1" />}
          </button>
        </div>

        {/* Bottom Content */}
        <div className="relative z-10 flex flex-col justify-end flex-grow">
          <div>
              <h3 className="font-bold text-base leading-tight truncate font-pixel text-white">{memory.title}</h3>
              <div className="flex items-center justify-between text-xs text-blue-300/90 font-pixel mt-1">
                  <span>{format(new Date(memory.loggedAt), "MMM d, yyyy")}</span>
                  <span className="text-yellow-400 flex items-center gap-1">
                      <Star className="w-3 h-3" /> {memory.pointsEarned} XP
                  </span>
              </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative z-10 h-3 w-full bg-black/50 border border-blue-800/50 mt-2 overflow-hidden">
            <div 
                className="h-full transition-all duration-150"
                style={{
                  width: `${progress}%`,
                  backgroundImage: 'repeating-linear-gradient(45deg, #4ade80, #4ade80 4px, #22c55e 4px, #22c55e 8px)',
                }}
            ></div>
        </div>
      </div>
    </motion.div>
  );
}