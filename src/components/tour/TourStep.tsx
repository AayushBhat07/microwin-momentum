import { motion } from "framer-motion";
import { X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TourStepProps {
  title: string;
  content: string;
  position: { x: number; y: number };
  onNext: () => void;
  onSkip: () => void;
  isLastStep: boolean;
  stepNumber: number;
  totalSteps: number;
}

export function TourStep({
  title,
  content,
  position,
  onNext,
  onSkip,
  isLastStep,
  stepNumber,
  totalSteps,
}: TourStepProps) {
  return (
    <motion.div
      className="absolute z-50 max-w-sm bg-black border-4 border-double border-blue-500 font-pixel text-white shadow-2xl"
      style={{
        left: position.x,
        top: position.y,
        boxShadow: "0 0 20px rgba(59, 130, 246, 0.5), inset 0 0 20px rgba(0, 0, 0, 0.8)",
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Corner decorations */}
      <div className="absolute -top-1 -left-1 w-4 h-4 bg-blue-500 border-2 border-white"></div>
      <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 border-2 border-white"></div>
      <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-blue-500 border-2 border-white"></div>
      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 border-2 border-white"></div>

      <div className="p-6 bg-gradient-to-b from-blue-900/90 to-black/90">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl text-blue-300 mb-1">{title}</h3>
            <div className="text-xs text-blue-400">
              Step {stepNumber} of {totalSteps}
            </div>
          </div>
          <button
            onClick={onSkip}
            className="text-blue-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <p className="text-blue-200 mb-6 leading-relaxed">{content}</p>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="w-full bg-blue-900/50 h-2 border border-blue-700">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300"
              style={{ width: `${(stepNumber / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center">
          <button
            onClick={onSkip}
            className="text-sm text-blue-400 hover:text-white transition-colors underline"
          >
            Skip Tour
          </button>
          <Button
            onClick={onNext}
            className="bg-blue-600 hover:bg-blue-700 border-2 border-blue-500 font-pixel text-white shadow-[2px_2px_0px_#000] hover:shadow-[1px_1px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
          >
            {isLastStep ? "Finish" : "Next"}
            {!isLastStep && <ArrowRight className="w-4 h-4 ml-2" />}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
