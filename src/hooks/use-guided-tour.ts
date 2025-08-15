import { create } from 'zustand';

interface TourStep {
  targetId: string;
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

interface GuidedTourState {
  steps: TourStep[];
  currentStepIndex: number;
  isTourActive: boolean;
  startTour: (steps: TourStep[]) => void;
  nextStep: () => void;
  endTour: () => void;
}

export const useGuidedTour = create<GuidedTourState>((set) => ({
  steps: [],
  currentStepIndex: 0,
  isTourActive: false,
  startTour: (steps) => set({ steps, currentStepIndex: 0, isTourActive: true }),
  nextStep: () => set((state) => {
    if (state.currentStepIndex < state.steps.length - 1) {
      return { currentStepIndex: state.currentStepIndex + 1 };
    }
    // End of tour
    return { isTourActive: false };
  }),
  endTour: () => set({ isTourActive: false }),
}));
