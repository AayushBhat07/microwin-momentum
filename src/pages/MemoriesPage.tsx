import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { Spinner } from "@/components/ui/spinner";
import { PhotoMemoryCard } from "@/components/memories/PhotoMemoryCard";
import { VoiceMemoCard } from "@/components/memories/VoiceMemoCard";

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
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Your Memories</h1>

      {memories.length === 0 && (
        <div className="text-center py-16">
          <p className="text-lg text-muted-foreground">
            You don't have any photo or voice memories yet.
          </p>
          <p className="text-muted-foreground">
            Complete goals with photos or voice notes to see them here!
          </p>
        </div>
      )}

      {photoMemories.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold mb-4">Photo Memories</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photoMemories.map((memory) => (
              <PhotoMemoryCard key={memory._id} memory={memory} />
            ))}
          </div>
        </section>
      )}

      {voiceMemories.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl font-semibold mb-4">Voice Memos</h2>
          <div className="space-y-4">
            {voiceMemories.map((memory) => (
              <VoiceMemoCard key={memory._id} memory={memory} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}