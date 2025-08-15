import { Memory } from "@/convex/memories";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { PlayCircle } from "lucide-react";

interface VoiceMemoCardProps {
  memory: Memory;
}

export function VoiceMemoCard({ memory }: VoiceMemoCardProps) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {memory.audioUrl && (
            <audio src={memory.audioUrl} id={`audio-${memory._id}`} preload="none" />
          )}
          <button
            onClick={() => (document.getElementById(`audio-${memory._id}`) as HTMLAudioElement)?.play()}
            className="text-primary hover:text-primary/80"
            aria-label="Play voice memo"
          >
            <PlayCircle className="h-10 w-10" />
          </button>
          <div>
            <p className="font-semibold">{memory.title}</p>
            <p className="text-sm text-muted-foreground">
              {format(new Date(memory.loggedAt), "MMM d, yyyy")}
            </p>
          </div>
        </div>
        <Badge variant="outline">{memory.categorySlug}</Badge>
      </CardContent>
    </Card>
  );
}
