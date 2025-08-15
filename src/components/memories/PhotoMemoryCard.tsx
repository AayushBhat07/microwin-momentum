import { Memory } from "@/convex/memories";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Camera, Star } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

interface PhotoMemoryCardProps {
  memory: Memory;
}

export function PhotoMemoryCard({ memory }: PhotoMemoryCardProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <motion.div 
          className="aspect-square relative overflow-hidden cursor-pointer group border-4 border-double border-blue-600/70 hover:border-blue-400 transition-all duration-300 bg-blue-900/20 p-1"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          {/* Corner decorations */}
          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-blue-400"></div>
          <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-blue-400"></div>
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-blue-400"></div>
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-blue-400"></div>

          <div className="relative w-full h-full overflow-hidden">
            {memory.photoUrl && (
              <img
                src={memory.photoUrl}
                alt={memory.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-100 transition-opacity duration-300"></div>
            
            {/* Add a pixelated overlay pattern */}
            <div
              className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(0, 255, 255, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 255, 0.3) 1px, transparent 1px)",
                backgroundSize: "4px 4px",
              }}
            ></div>

            <div className="absolute inset-0 flex flex-col justify-end p-3 text-white">
              <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm p-1.5 border border-white/20 flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-400" />
                  <span className="text-xs font-bold">{memory.pointsEarned}</span>
              </div>
              <h3 className="font-bold text-sm leading-tight truncate font-pixel">{memory.title}</h3>
              <p className="text-xs text-blue-300/90 font-pixel">{format(new Date(memory.loggedAt), "MMM d, yyyy")}</p>
            </div>
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Camera className="w-10 h-10 text-white/80" />
            </div>
          </div>
        </motion.div>
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-black/70 backdrop-blur-lg border-2 border-blue-700 text-white font-pixel p-0">
        {memory.photoUrl && (
          <img
            src={memory.photoUrl}
            alt={memory.title}
            className="w-full max-h-[70vh] object-contain"
          />
        )}
        <div className="p-6">
            <DialogHeader>
              <DialogTitle className="text-2xl text-blue-300 pixel-shadow">{memory.title}</DialogTitle>
            </DialogHeader>
            <div className="flex justify-between items-center text-sm text-blue-400/80 mt-2">
                <span>{format(new Date(memory.loggedAt), "MMMM d, yyyy 'at' h:mm a")}</span>
                <div className="flex items-center gap-4">
                    <span className="bg-blue-900/50 text-blue-300 px-2 py-1 border border-blue-700/50">
                        {memory.categorySlug}
                    </span>
                    <div className="flex items-center gap-1 text-yellow-400">
                        <Star className="w-4 h-4" />
                        <span className="font-bold">{memory.pointsEarned} XP</span>
                    </div>
                </div>
            </div>
            {memory.description && <p className="mt-4 text-base text-blue-200/90">{memory.description}</p>}
        </div>
      </DialogContent>
    </Dialog>
  );
}