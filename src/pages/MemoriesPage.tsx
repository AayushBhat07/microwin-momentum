import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { PhotoMemoryCard } from "@/components/memories/PhotoMemoryCard";
import { VoiceMemoCard } from "@/components/memories/VoiceMemoCard";
import { Camera, Loader2, Mic } from "lucide-react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { useLazyImage } from "@/hooks/use-lazy-image";
import { motion } from "framer-motion";

export default function MemoriesPage() {
  const { isLoading: authLoading } = useAuth();
  const memories = useQuery(api.memories.getMemories);
  const backgroundUrl = useLazyImage("/assets/onboarding1.png");

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
              <section>
                <h2 className="flex items-center gap-3 text-2xl text-green-400 mb-6 pixel-shadow">
                  <Camera className="w-7 h-7" />
                  Photo Reel
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {photoMemories.map((memory) => (
                    <PhotoMemoryCard key={memory._id} memory={memory} />
                  ))}
                </div>
              </section>
            )}

            {voiceMemories.length > 0 && (
              <section className="mt-16">
                <h2 className="flex items-center gap-3 text-2xl text-yellow-400 mb-6 pixel-shadow">
                  <Mic className="w-7 h-7" />
                  Audio Logs
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {voiceMemories.map((memory) => (
                    <VoiceMemoCard key={memory._id} memory={memory} />
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}