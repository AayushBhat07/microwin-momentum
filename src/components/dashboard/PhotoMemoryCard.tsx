import { motion } from "framer-motion";
import { Camera, ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function PhotoMemoryCard() {
  const memories = useQuery(api.memories.getPhotoMemories);
  const [currentIndex, setCurrentIndex] = useState(0);

  const cardContent = () => {
    if (!memories || memories.length === 0) {
      return (
        <div className="aspect-[4/3] bg-muted/50 flex items-center justify-center border-2 border-dashed border-muted-foreground">
          <div className="text-center text-muted-foreground">
            <Camera className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No photo memories</p>
          </div>
        </div>
      );
    }

    const currentMemory = memories[currentIndex];

    const nextPhoto = (e: React.MouseEvent) => {
      e.stopPropagation();
      setCurrentIndex((prev) => (prev + 1) % memories.length);
    };

    const prevPhoto = (e: React.MouseEvent) => {
      e.stopPropagation();
      setCurrentIndex((prev) => (prev - 1 + memories.length) % memories.length);
    };

    return (
      <div className="relative group">
        <motion.div
          className="relative aspect-[4/3] overflow-hidden cursor-pointer border-2 border-foreground"
          key={currentMemory._id}
        >
          <img
            src={currentMemory.photoUrl || undefined}
            alt={currentMemory.title}
            className="w-full h-full object-cover"
          />
          
          {memories.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-1 top-1/2 -translate-y-1/2 bg-background/70 hover:bg-background text-foreground border-2 border-foreground h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={prevPhoto}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 bg-background/70 hover:bg-background text-foreground border-2 border-foreground h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={nextPhoto}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </>
          )}
        </motion.div>
        <div className="mt-2">
          <p className="text-sm text-foreground truncate">
            {currentMemory.title}
          </p>
          <p className="text-xs text-muted-foreground">
            {new Date(currentMemory.loggedAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      className="bg-background/80 backdrop-blur-sm border-primary/50 shadow-[4px_4px_0px_var(--primary)] font-pixel p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg text-foreground">Photo Memories</h3>
        <Camera className="w-6 h-6 text-foreground" />
      </div>
      {cardContent()}
    </motion.div>
  );
}