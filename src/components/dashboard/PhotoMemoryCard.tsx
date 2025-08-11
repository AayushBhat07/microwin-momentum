import { motion, AnimatePresence } from "framer-motion";
import { Camera, ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export function PhotoMemoryCard() {
  const memories = useQuery(api.memories.getPhotoMemories);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(false);

  // Auto-slideshow functionality
  useEffect(() => {
    if (!isAutoPlay || !memories || memories.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % memories.length);
    }, 3000); // Change photo every 3 seconds

    return () => clearInterval(interval);
  }, [isAutoPlay, memories]);

  const cardContent = () => {
    if (!memories || memories.length === 0) {
      return (
        <div className="aspect-[4/3] bg-muted/50 flex items-center justify-center border-2 border-dashed border-foreground/30">
          <div className="text-center text-muted-foreground">
            <Camera className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-pixel">No photo memories yet</p>
            <p className="text-xs font-pixel opacity-70">Start logging achievements with photos!</p>
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

    const toggleAutoPlay = (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsAutoPlay(!isAutoPlay);
    };

    return (
      <div className="relative group">
        <motion.div
          className="relative aspect-[4/3] overflow-hidden cursor-pointer border-2 border-foreground bg-muted/20"
          key={currentMemory._id}
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={currentMemory._id}
              src={currentMemory.photoUrl || undefined}
              alt={currentMemory.title}
              className="w-full h-full object-cover"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            />
          </AnimatePresence>
          
          {/* Overlay with controls */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {memories.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background text-foreground border-2 border-foreground h-8 w-8 font-pixel"
                  onClick={prevPhoto}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background text-foreground border-2 border-foreground h-8 w-8 font-pixel"
                  onClick={nextPhoto}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
                
                {/* Auto-play toggle */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 bg-background/80 hover:bg-background text-foreground border-2 border-foreground h-8 w-8 font-pixel"
                  onClick={toggleAutoPlay}
                >
                  {isAutoPlay ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
              </>
            )}
          </div>

          {/* Photo counter */}
          {memories.length > 1 && (
            <div className="absolute bottom-2 left-2 bg-background/80 text-foreground px-2 py-1 text-xs font-pixel border border-foreground">
              {currentIndex + 1} / {memories.length}
            </div>
          )}
        </motion.div>
        
        <motion.div 
          className="mt-3 space-y-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-sm text-foreground truncate font-pixel">
            {currentMemory.title}
          </p>
          <div className="flex items-center justify-between text-xs text-muted-foreground font-pixel">
            <span>{new Date(currentMemory.loggedAt).toLocaleDateString()}</span>
            <span className="bg-primary/20 text-primary px-2 py-1 border border-primary/50">
              +{currentMemory.pointsEarned} XP
            </span>
          </div>
          {currentMemory.description && (
            <p className="text-xs text-muted-foreground font-pixel opacity-80 line-clamp-2">
              {currentMemory.description}
            </p>
          )}
        </motion.div>

        {/* Thumbnail navigation for multiple photos */}
        {memories.length > 1 && (
          <div className="flex space-x-1 mt-2 overflow-x-auto">
            {memories.slice(0, 5).map((memory, index) => (
              <button
                key={memory._id}
                onClick={() => setCurrentIndex(index)}
                className={`flex-shrink-0 w-8 h-8 border-2 overflow-hidden ${
                  index === currentIndex 
                    ? 'border-primary shadow-[2px_2px_0px_var(--primary)]' 
                    : 'border-foreground/30 hover:border-foreground/60'
                }`}
              >
                <img
                  src={memory.photoUrl || undefined}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
            {memories.length > 5 && (
              <div className="flex-shrink-0 w-8 h-8 border-2 border-foreground/30 bg-muted/50 flex items-center justify-center">
                <span className="text-xs font-pixel">+{memories.length - 5}</span>
              </div>
            )}
          </div>
        )}
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
        <h3 className="text-lg text-foreground font-pixel">Photo Memories</h3>
        <div className="flex items-center space-x-2">
          <Camera className="w-6 h-6 text-foreground" />
          {memories && memories.length > 0 && (
            <span className="bg-secondary text-secondary-foreground px-2 py-1 text-xs border border-foreground">
              {memories.length}
            </span>
          )}
        </div>
      </div>
      {cardContent()}
    </motion.div>
  );
}