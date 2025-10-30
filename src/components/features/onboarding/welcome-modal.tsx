'use client';

import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Shield, Zap } from 'lucide-react';
import { Modal, Button } from '@/components/ui';
import { useOnboardingStore } from '@/stores/onboarding-store';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
}

export function WelcomeModal({ isOpen, onClose, userName }: WelcomeModalProps) {
  const { startOnboarding, skipOnboarding } = useOnboardingStore();

  const handleStartTour = () => {
    onClose();
    startOnboarding();
  };

  const handleSkipTour = () => {
    onClose();
    skipOnboarding();
  };

  const features = [
    {
      icon: TrendingUp,
      title: 'Strategy Builder',
      description: 'Create AI-powered trading strategies',
    },
    {
      icon: Shield,
      title: 'Risk-Free Testing',
      description: 'Backtest and paper trade safely',
    },
    {
      icon: Zap,
      title: 'Real-Time Analytics',
      description: 'Monitor performance instantly',
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      className="text-center"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
            className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto"
          >
            <Sparkles className="h-8 w-8 text-white" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-3xl font-bold text-neutral-900 dark:text-white">
              Welcome{userName ? `, ${userName}` : ''}!
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-300 mt-2">
              You&apos;re now part of the ShareTrading community. Let&apos;s get you started with a quick tour.
            </p>
          </motion.div>
        </div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
              className="p-4 rounded-lg bg-neutral-50 dark:bg-neutral-700"
            >
              <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mx-auto mb-3">
                <feature.icon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="font-semibold text-neutral-900 dark:text-white mb-1">
                {feature.title}
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-300">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Button
            size="lg"
            onClick={handleStartTour}
            className="px-8"
          >
            Take the Tour
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={handleSkipTour}
            className="px-8"
          >
            Skip for Now
          </Button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="text-sm text-neutral-500 dark:text-neutral-400"
        >
          The tour takes about 2 minutes and will help you get the most out of ShareTrading.
        </motion.p>
      </div>
    </Modal>
  );
}