import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { PhotoMemoryCard } from "@/components/memories/PhotoMemoryCard";
import { VoiceMemoCard } from "@/components/memories/VoiceMemoCard";
import { Camera, Loader2, Mic } from "lucide-react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { useLazyImage } from "@/hooks/use-lazy-image";
import { motion } from "framer-motion";
import { useGuidedTour, GuidedTour } from "@/hooks/use-guided-tour";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";

export default function MemoriesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const memories = useQuery(api.memories.getMemories);
  const backgroundUrl = useLazyImage("/assets/onboarding1.png");
  const { startTour, isTourActive } = useGuidedTour();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (user && !isTourActive && memories !== undefined && searchParams.get('tour') === 'true') {
      const hasSeenTour = localStorage.getItem(`tour-completed-${user._id}-memories`);
      if (!hasSeenTour) {
        const tourSteps = [
          {
            targetId: 'memories-header',
            title: 'Your Memory Bank',
            content: 'This is where all your logged wins with photos and voice notes are stored for you to look back on.',
            position: 'bottom' as const,
          },
          {
            targetId: 'photo-reel-section',
            title: 'Photo Reel',
            content: 'A visual gallery of your achievements. Click on any photo to see the details.',
            position: 'bottom' as const,
          },
          {
            targetId: 'audio-logs-section',
            title: 'Audio Logs',
            content: 'Listen to your spoken reflections and celebrate your progress.',
            position: 'top' as const,
          },
        ];
        
        const stepsToShow: typeof tourSteps = [];
        if (document.getElementById('memories-header')) stepsToShow.push(tourSteps[0]);
        if (photoMemories.length > 0 && document.getElementById('photo-reel-section')) stepsToShow.push(tourSteps[1]);
        if (voiceMemories.length > 0 && document.getElementById('audio-logs-section')) stepsToShow.push(tourSteps[2]);

        if (stepsToShow.length > 0) {
            setTimeout(() => startTour(stepsToShow, () => {
              localStorage.setItem(`tour-completed-${user._id}-memories`, 'true');
              navigate('/milestones?tour=true');
            }), 1000);
        } else {
          // If no memories, skip to next step
          navigate('/milestones?tour=true');
        }
      }
    }
  }, [user, startTour, isTourActive, memories, navigate, searchParams]);

  const photoMemories = memories?.filter((m) => m.photoUrl) ?? [];
  const voiceMemories = memories?.filter((m) => m.audioUrl && !m.photoUrl) ?? [];

  if (authLoading || memories === undefined || !backgroundUrl) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="z-10 text-center">
          <div className="font-pixel text-white text-3xl mb-4 animate-pulse">Loading Memories...</div>
          <Loader2 className="h-12 w-12 text-blue-400 animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-fixed transition-opacity duration-1000" 
      style={{ 
        backgroundImage: `url(${backgroundUrl})`,
        opacity: backgroundUrl ? 1 : 0,
      }}
    >
      <div className="min-h-screen bg-black/60 flex">
        <Sidebar activeTab="memories" onTabChange={() => {}} />

        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <motion.div
              id="memories-header"
              className="mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl font-pixel text-white text-shadow-pixel mb-2">
                Memories
              </h1>
              <p className="text-blue-300 font-pixel text-lg">
                A look back at your journey of achievements.
              </p>
            </motion.div>

            {memories.length === 0 && (
              <div className="text-center py-16 border-2 border-dashed border-blue-800/50 bg-blue-900/20">
                <p className="text-lg text-blue-300">
                  Your memory bank is empty.
                </p>
                <p className="text-blue-400/80 mt-2">
                  Complete goals with photos or voice notes to fill it up!
                </p>
              </div>
            )}

            {photoMemories.length > 0 && (
              <section id="photo-reel-section">
                <motion.div
                  className="mb-6"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <h2 className="flex items-center gap-3 text-3xl font-pixel text-white text-shadow-pixel">
                    <Camera className="w-8 h-8 text-green-400" />
                    <span>Photo Reel</span>
                  </h2>
                  <p className="text-blue-300 font-pixel text-sm mt-1 ml-11">A gallery of your visual achievements.</p>
                </motion.div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {photoMemories.map((memory) => (
                    <PhotoMemoryCard key={memory._id} memory={memory} />
                  ))}
                </div>
              </section>
            )}

            {voiceMemories.length > 0 && (
              <section id="audio-logs-section" className="mt-12">
                <motion.div
                  className="mb-6"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <h2 className="flex items-center gap-3 text-3xl font-pixel text-white text-shadow-pixel">
                    <Mic className="w-8 h-8 text-yellow-400" />
                    <span>Audio Logs</span>
                  </h2>
                  <p className="text-blue-300 font-pixel text-sm mt-1 ml-11">Your collection of spoken reflections.</p>
                </motion.div>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                  {voiceMemories.map((memory) => (
                    <VoiceMemoCard key={memory._id} memory={memory} />
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
      <GuidedTour />
    </div>
  );
}