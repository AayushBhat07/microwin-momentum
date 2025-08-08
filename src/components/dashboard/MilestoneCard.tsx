import { motion } from "framer-motion";

interface MilestoneCardProps {
  milestone: number;
  title?: string;
}

export function MilestoneCard({ milestone, title = "You've hit 50 Wins!" }: MilestoneCardProps) {
  return (
    <motion.div
      className="bg-gradient-to-br from-pink-100 to-purple-100 rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      {/* Confetti background */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              backgroundColor: ['#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#8b5cf6'][i % 5],
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -10, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.1,
            }}
          />
        ))}
      </div>

      {/* Character illustration */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="w-24 h-24 mb-4 relative">
          {/* Simple character illustration */}
          <div className="w-full h-full bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
            <motion.div
              className="text-4xl"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🎉
            </motion.div>
          </div>
          
          {/* Star backdrop */}
          <motion.div
            className="absolute -top-2 -right-2 text-yellow-400 text-2xl"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            ⭐
          </motion.div>
        </div>

        <h3 className="text-xl font-bold text-gray-900 text-center leading-tight">
          {title}
        </h3>
      </div>
    </motion.div>
  );
}
