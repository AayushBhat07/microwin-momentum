import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Coffee, BookOpen, Footprints } from 'lucide-react';

const tasks = [
  { text: '5-min walk', icon: <Footprints className="w-5 h-5 text-blue-500" /> },
  { text: 'Read for 10 mins', icon: <BookOpen className="w-5 h-5 text-green-500" /> },
  { text: 'Enjoy a coffee', icon: <Coffee className="w-5 h-5 text-yellow-700" /> },
];

const ConfettiPiece = ({ x, y, rotate, color }: any) => (
  <motion.div
    style={{
      position: 'absolute',
      left: '50%',
      top: '50%',
      width: 8,
      height: 16,
      backgroundColor: color,
      opacity: 1,
    }}
    initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
    animate={{
      x: x,
      y: y,
      rotate: rotate,
      opacity: 0,
    }}
    transition={{ duration: 1.5, ease: 'easeOut' }}
  />
);

const AnimatedHeroCard = () => {
  const [index, setIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [key, setKey] = useState(0); // Key to reset progress bar animation

  useEffect(() => {
    const interval = setInterval(() => {
      setIsComplete(true);

      setTimeout(() => {
        setIndex((prevIndex) => (prevIndex + 1) % tasks.length);
        setIsComplete(false);
        setKey(prevKey => prevKey + 1); // Reset animation
      }, 1500); // Wait for confetti to finish
    }, 4000); // Time per task

    return () => clearInterval(interval);
  }, []);

  const currentTask = tasks[index];
  const confettiColors = ['#FF9149', '#60B5FF', '#AFDDFF'];

  return (
    <motion.div
      className="relative w-[450px] h-[300px] bg-card rounded-xl shadow-2xl p-4 border-2 border-foreground/10 overflow-hidden"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.6 }}
    >
      {/* Window Header */}
      <div className="h-8 bg-muted rounded-lg flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-400 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
        </div>
        <div className="text-sm font-mono text-muted-foreground">MicroWin.app</div>
      </div>

      {/* Content */}
      <div className="mt-8 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center text-center"
          >
            <div className="flex items-center gap-3">
              {currentTask.icon}
              <h3 className="text-2xl font-bold text-foreground">{currentTask.text}</h3>
            </div>
            <p className="text-muted-foreground mt-2">Log your small win to build momentum!</p>
          </motion.div>
        </AnimatePresence>

        <div className="w-full max-w-xs mt-8">
          <div className="h-4 w-full bg-muted rounded-full overflow-hidden border border-border">
            <motion.div
              key={key} // Use key to force re-render and restart animation
              className="h-full bg-primary rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 2.5, delay: 0.5, ease: 'linear' }}
            />
          </div>
          <AnimatePresence>
            {isComplete && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="flex items-center justify-center mt-4 text-green-500"
              >
                <Check className="w-6 h-6 mr-2" />
                <span className="font-bold text-lg">Complete! +10pts</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Confetti */}
      <AnimatePresence>
        {isComplete &&
          Array.from({ length: 30 }).map((_, i) => (
            <ConfettiPiece
              key={i}
              x={(Math.random() - 0.5) * 500}
              y={(Math.random() - 0.5) * 600}
              rotate={Math.random() * 360}
              color={confettiColors[i % confettiColors.length]}
            />
          ))}
      </AnimatePresence>
    </motion.div>
  );
};

export default AnimatedHeroCard;
