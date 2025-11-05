'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft, ArrowRight, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui';
import { useOnboardingStore } from '@/stores/onboarding-store';
import { cn } from '@/lib/utils';

interface TooltipPosition {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function GuidedTour() {
  const {
    isActive,
    currentStep,
    steps,
    nextStep,
    previousStep,
    skipOnboarding,
    completeOnboarding,
  } = useOnboardingStore();

  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition | null>(null);
  const [highlightPosition, setHighlightPosition] = useState<TooltipPosition | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const currentStepData = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  useEffect(() => {
    if (!isActive || !currentStepData?.target) {
      setTooltipPosition(null);
      setHighlightPosition(null);
      return;
    }

    const updatePosition = () => {
      const targetElement = document.querySelector(currentStepData.target!);
      if (!targetElement) return;

      const rect = targetElement.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

      const position = {
        top: rect.top + scrollTop,
        left: rect.left + scrollLeft,
        width: rect.width,
        height: rect.height,
      };

      setHighlightPosition(position);

      // Calculate tooltip position based on preferred position
      let tooltipTop = position.top;
      let tooltipLeft = position.left;

      switch (currentStepData.position) {
        case 'top':
          tooltipTop = position.top - 20;
          tooltipLeft = position.left + position.width / 2;
          break;
        case 'bottom':
          tooltipTop = position.top + position.height + 20;
          tooltipLeft = position.left + position.width / 2;
          break;
        case 'left':
          tooltipTop = position.top + position.height / 2;
          tooltipLeft = position.left - 20;
          break;
        case 'right':
          tooltipTop = position.top + position.height / 2;
          tooltipLeft = position.left + position.width + 20;
          break;
        default:
          tooltipTop = position.top + position.height + 20;
          tooltipLeft = position.left + position.width / 2;
      }

      setTooltipPosition({
        top: tooltipTop,
        left: tooltipLeft,
        width: 320,
        height: 0,
      });

      // Scroll target into view
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center',
      });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [isActive, currentStep, currentStepData]);

  if (!isActive) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      skipOnboarding();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        ref={overlayRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50"
        onClick={handleOverlayClick}
      >
        {/* Highlight overlay */}
        {highlightPosition && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="absolute border-2 border-primary-400 rounded-lg shadow-lg"
            style={{
              top: highlightPosition.top - 4,
              left: highlightPosition.left - 4,
              width: highlightPosition.width + 8,
              height: highlightPosition.height + 8,
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
            }}
          />
        )}

        {/* Tooltip */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.3 }}
          className={cn(
            "absolute bg-white dark:bg-neutral-800 rounded-xl shadow-2xl p-6 max-w-sm",
            !tooltipPosition && "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          )}
          style={tooltipPosition ? {
            top: tooltipPosition.top,
            left: tooltipPosition.left,
            transform: currentStepData.position === 'left' 
              ? 'translate(-100%, -50%)'
              : currentStepData.position === 'right'
              ? 'translate(0, -50%)'
              : currentStepData.position === 'top'
              ? 'translate(-50%, -100%)'
              : 'translate(-50%, 0)',
          } : undefined}
        >
          {/* Close button */}
          <button
            onClick={skipOnboarding}
            className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Content */}
          <div className="pr-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                {currentStepData.title}
              </h3>
              <span className="text-sm text-neutral-500 dark:text-neutral-400">
                {currentStep + 1} of {steps.length}
              </span>
            </div>

            <p className="text-neutral-600 dark:text-neutral-300 mb-6">
              {currentStepData.description}
            </p>

            {/* Progress bar */}
            <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2 mb-6">
              <motion.div
                className="bg-primary-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {!isFirstStep && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={previousStep}
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={skipOnboarding}
                >
                  <SkipForward className="h-4 w-4 mr-1" />
                  Skip Tour
                </Button>
              </div>

              <Button
                size="sm"
                onClick={isLastStep ? completeOnboarding : nextStep}
              >
                {isLastStep ? 'Get Started' : 'Next'}
                {!isLastStep && <ArrowRight className="h-4 w-4 ml-1" />}
              </Button>
            </div>
          </div>

          {/* Arrow pointer */}
          {tooltipPosition && currentStepData.position && (
            <div
              className={cn(
                "absolute w-3 h-3 bg-white dark:bg-neutral-800 rotate-45",
                {
                  'top-full left-1/2 transform -translate-x-1/2 -translate-y-1/2': currentStepData.position === 'top',
                  'bottom-full left-1/2 transform -translate-x-1/2 translate-y-1/2': currentStepData.position === 'bottom',
                  'top-1/2 left-full transform -translate-x-1/2 -translate-y-1/2': currentStepData.position === 'left',
                  'top-1/2 right-full transform translate-x-1/2 -translate-y-1/2': currentStepData.position === 'right',
                }
              )}
            />
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}