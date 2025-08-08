import { motion } from "framer-motion";
import { Camera } from "lucide-react";

export function PhotoMemoryCard() {
  // Placeholder photo - replace with real data from API
  const placeholderPhoto = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=267&fit=crop";

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

      <motion.div
        className="relative aspect-[3/2] rounded-xl overflow-hidden cursor-pointer group"
        whileHover={{ scale: 1.02 }}
        onClick={() => {
          // TODO: Open lightbox gallery
          console.log("Open photo gallery");
        }}
      >
        <img
          src={placeholderPhoto}
          alt="Achievement memory"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-white bg-opacity-90 rounded-full p-2">
              <Camera className="w-5 h-5 text-gray-700" />
            </div>
          </div>
        </div>
      </motion.div>

      <p className="text-sm text-gray-600 mt-3">
        Your latest achievement photo
      </p>
    </motion.div>
  );
}
