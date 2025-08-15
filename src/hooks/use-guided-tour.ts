import { create } from 'zustand';

interface TourStepData {
  targetId: string;
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

interface GuidedTourState {
  steps: TourStepData[];
  currentStepIndex: number;
  isTourActive: boolean;
  startTour: (steps: TourStepData[], onEnd?: () => void) => void;
  nextStep: () => void;
  endTour: () => void;
  onTourEnd?: () => void;
}

export const useGuidedTour = create<GuidedTourState>((set, get) => ({
  steps: [],
  currentStepIndex: 0,
  isTourActive: false,
  onTourEnd: undefined,

  startTour: (steps, onEnd) => {
    if (steps.length > 0) {
      set({
        steps,
        currentStepIndex: 0,
        isTourActive: true,
        onTourEnd: onEnd,
      });
    }
  },

  nextStep: () => {
    const { currentStepIndex, steps, endTour } = get();
    if (currentStepIndex < steps.length - 1) {
      set({ currentStepIndex: currentStepIndex + 1 });
    } else {
      endTour();
    }
  },

  endTour: () => {
    const { onTourEnd } = get();
    // First, set the tour to inactive
    set({ isTourActive: false, currentStepIndex: 0, steps: [] });
    // Then, execute the onEnd callback (which handles navigation)
    if (onTourEnd) {
      onTourEnd();
    }
  },
}));

export { GuidedTour } from '@/components/tour/GuidedTour';