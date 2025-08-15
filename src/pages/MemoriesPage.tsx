import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { Spinner } from "@/components/ui/spinner";
import { PhotoMemoryCard } from "@/components/memories/PhotoMemoryCard";
import { VoiceMemoCard } from "@/components/memories/VoiceMemoCard";
import { Camera, Mic } from "lucide-react";

export default function MemoriesPage() {
  const { isLoading: authLoading } = useAuth();
  const memories = useQuery(api.memories.getMemories);

  const photoMemories = memories?.filter((m) => m.photoUrl) ?? [];
  const voiceMemories = memories?.filter((m) => m.audioUrl && !m.photoUrl) ?? [];

  if (authLoading || memories === undefined) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner className="h-12 w-12" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 font-pixel text-white">
      <h1 className="text-4xl text-blue-300 tracking-widest mb-2 pixel-shadow">MEMORIES</h1>
      <p className="text-blue-400 mb-10">A look back at your journey of achievements.</p>

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
  );
}