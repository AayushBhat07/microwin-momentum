import { Memory } from "@/convex/memories";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface PhotoMemoryCardProps {
  memory: Memory;
}

export function PhotoMemoryCard({ memory }: PhotoMemoryCardProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="p-0">
            {memory.photoUrl && (
              <img
                src={memory.photoUrl}
                alt={memory.title}
                className="w-full h-48 object-cover"
              />
            )}
          </CardContent>
          <CardHeader>
            <CardTitle className="text-base truncate">{memory.title}</CardTitle>
          </CardHeader>
          <CardFooter className="flex justify-between text-sm text-muted-foreground">
            <span>{format(new Date(memory.loggedAt), "MMM d, yyyy")}</span>
            <Badge variant="secondary">{memory.categorySlug}</Badge>
          </CardFooter>
        </Card>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{memory.title}</DialogTitle>
        </DialogHeader>
        {memory.photoUrl && (
          <img
            src={memory.photoUrl}
            alt={memory.title}
            className="w-full rounded-md max-h-[70vh] object-contain"
          />
        )}
        <div className="text-sm text-muted-foreground mt-2">
            {format(new Date(memory.loggedAt), "MMMM d, yyyy 'at' h:mm a")}
        </div>
        {memory.description && <p className="mt-4">{memory.description}</p>}
      </DialogContent>
    </Dialog>
  );
}
