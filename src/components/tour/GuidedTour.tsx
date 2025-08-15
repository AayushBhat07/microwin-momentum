import { useEffect, useState } from "react";
import { useGuidedTour } from "@/hooks/use-guided-tour";
import { TourStep } from "./TourStep";
import { motion } from "framer-motion";

export function GuidedTour() {
  const { steps, currentStepIndex, isTourActive, nextStep, endTour } = useGuidedTour();
  const [stepPosition, setStepPosition] = useState({ x: 0, y: 0 });

  const currentStep = steps[currentStepIndex];

  useEffect(() => {
    if (currentStep && isTourActive) {
      const targetElement = document.getElementById(currentStep.targetId);
      if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        const position = calculatePosition(rect, currentStep.position || 'bottom');
        setStepPosition(position);
        
        // Scroll element into view
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Add highlight to target element
        targetElement.classList.add('tour-highlight');
        
        return () => {
          targetElement.classList.remove('tour-highlight');
        };
      }
    }
  }, [currentStep, currentStepIndex, isTourActive]);

  const calculatePosition = (rect: DOMRect, position: string) => {
    const offset = 20;
    switch (position) {
      case 'top':
        return { x: rect.left, y: rect.top - 200 - offset };
      case 'bottom':
        return { x: rect.left, y: rect.bottom + offset };
      case 'left':
        return { x: rect.left - 320 - offset, y: rect.top };
      case 'right':
        return { x: rect.right + offset, y: rect.top };
      default:
        return { x: rect.left, y: rect.bottom + offset };
    }
  };

  if (!isTourActive || !currentStep) return null;

  return (
    <>
      {/* Backdrop overlay */}
      <motion.div
        className="fixed inset-0 bg-black/80 z-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={endTour}
      />
      
      {/* Tour step */}
      <TourStep
        title={currentStep.title}
        content={currentStep.content}
        position={stepPosition}
        onNext={nextStep}
        onSkip={endTour}
        isLastStep={currentStepIndex === steps.length - 1}
        stepNumber={currentStepIndex + 1}
        totalSteps={steps.length}
      />
    </>
  );
}
