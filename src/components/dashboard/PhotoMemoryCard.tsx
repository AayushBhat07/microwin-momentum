import { motion } from "framer-motion";
import { Camera, ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function PhotoMemoryCard() {
  const memories = useQuery(api.memories.getPhotoMemories);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!memories || memories.length === 0) {
    return (
      <motion.div
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-900">Photo Memories</h3>
          <Camera className="w-5 h-5 text-gray-400" />
        </div>
        <div className="aspect-[3/2] rounded-xl bg-gray-100 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <Camera className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No photo memories yet</p>
            <p className="text-xs">Take photos when logging wins!</p>
          </div>
        </div>
      </motion.div>
    );
  }

  const currentMemory = memories[currentIndex];

  const nextPhoto = () => {
    setCurrentIndex((prev) => (prev + 1) % memories.length);
  };

  const prevPhoto = () => {
    setCurrentIndex((prev) => (prev - 1 + memories.length) % memories.length);
  };

  return (
    <motion.div
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900">Photo Memories</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">
            {currentIndex + 1} of {memories.length}
          </span>
          <Camera className="w-5 h-5 text-gray-400" />
        </div>
      </div>

      <div className="relative">
        <motion.div
          className="relative aspect-[3/2] rounded-xl overflow-hidden cursor-pointer group"
          whileHover={{ scale: 1.02 }}
          key={currentMemory._id}
        >
          <img
            src={currentMemory.photoUrl || undefined}
            alt={currentMemory.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          
          {/* Navigation buttons */}
          {memories.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={prevPhoto}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={nextPhoto}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </>
          )}
        </motion.div>

        {/* Photo dots indicator */}
        {memories.length > 1 && (
          <div className="flex justify-center mt-3 gap-1">
            {memories.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-primary' : 'bg-gray-300'
                }`}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="mt-3">
        <p className="text-sm font-medium text-gray-900 truncate">
          {currentMemory.title}
        </p>
        <p className="text-xs text-gray-600">
          {new Date(currentMemory.loggedAt).toLocaleDateString()}
        </p>
      </div>
    </motion.div>
  );
}