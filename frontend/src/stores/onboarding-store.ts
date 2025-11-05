'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { telemetryService } from '@/mocks/services/telemetry-service';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  target?: string; // CSS selector for highlighting
  position?: 'top' | 'bottom' | 'left' | 'right';
}

interface OnboardingState {
  isActive: boolean;
  currentStep: number;
  steps: OnboardingStep[];
  hasCompletedOnboarding: boolean;
  showWelcome: boolean;
}

interface OnboardingActions {
  startOnboarding: () => void;
  nextStep: () => void;
  previousStep: () => void;
  skipOnboarding: () => void;
  completeOnboarding: () => void;
  setCurrentStep: (step: number) => void;
  resetOnboarding: () => void;
  setShowWelcome: (show: boolean) => void;
}

interface OnboardingStore extends OnboardingState, OnboardingActions {}

const defaultSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to ShareTrading',
    description: 'Let\'s take a quick tour to get you started with AI-driven paper trading and backtesting.',
  },
  {
    id: 'dashboard',
    title: 'Your Dashboard',
    description: 'This is your main dashboard where you can see your P&L, active strategies, and recent activity.',
    target: '[data-tour="dashboard"]',
    position: 'bottom',
  },
  {
    id: 'navigation',
    title: 'Navigation Menu',
    description: 'Use the left sidebar to navigate between different sections like strategies, backtesting, and paper trading.',
    target: '[data-tour="left-rail"]',
    position: 'right',
  },
  {
    id: 'strategies',
    title: 'Strategy Management',
    description: 'Create and manage your trading strategies using our visual builder or code editor.',
    target: '[data-tour="strategies-nav"]',
    position: 'right',
  },
  {
    id: 'backtesting',
    title: 'Backtesting',
    description: 'Test your strategies against historical data to validate their performance.',
    target: '[data-tour="backtesting-nav"]',
    position: 'right',
  },
  {
    id: 'paper-trading',
    title: 'Paper Trading',
    description: 'Deploy your strategies to paper trading to see how they perform in real-time without financial risk.',
    target: '[data-tour="paper-trading-nav"]',
    position: 'right',
  },
  {
    id: 'complete',
    title: 'You\'re All Set!',
    description: 'You\'re ready to start creating strategies and testing them. Click "Get Started" to begin your trading journey.',
  },
];

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set, get) => ({
      // Initial state
      isActive: false,
      currentStep: 0,
      steps: defaultSteps,
      hasCompletedOnboarding: false,
      showWelcome: true,

      // Actions
      startOnboarding: () => {
        telemetryService.trackOnboardingStep('tour_started', true);
        set({ 
          isActive: true, 
          currentStep: 0,
          showWelcome: false 
        });
      },

      nextStep: () => {
        const { currentStep, steps } = get();
        const currentStepData = steps[currentStep];
        telemetryService.trackOnboardingStep(currentStepData.id, true);
        
        if (currentStep < steps.length - 1) {
          set({ currentStep: currentStep + 1 });
        } else {
          get().completeOnboarding();
        }
      },

      previousStep: () => {
        const { currentStep } = get();
        if (currentStep > 0) {
          set({ currentStep: currentStep - 1 });
        }
      },

      skipOnboarding: () => {
        telemetryService.trackOnboardingStep('tour_skipped', true);
        set({ 
          isActive: false, 
          hasCompletedOnboarding: true,
          showWelcome: false 
        });
      },

      completeOnboarding: () => {
        telemetryService.trackOnboardingStep('tour_completed', true);
        set({ 
          isActive: false, 
          hasCompletedOnboarding: true,
          currentStep: 0,
          showWelcome: false 
        });
      },

      setCurrentStep: (step: number) => {
        const { steps } = get();
        if (step >= 0 && step < steps.length) {
          set({ currentStep: step });
        }
      },

      resetOnboarding: () => {
        set({ 
          isActive: false,
          currentStep: 0,
          hasCompletedOnboarding: false,
          showWelcome: true 
        });
      },

      setShowWelcome: (show: boolean) => {
        set({ showWelcome: show });
      },
    }),
    {
      name: 'onboarding-store',
      partialize: (state) => ({
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        showWelcome: state.showWelcome,
      }),
    }
  )
);