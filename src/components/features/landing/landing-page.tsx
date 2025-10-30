'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  BarChart3, 
  Shield, 
  Zap, 
  Target, 
  Brain,
  ArrowRight,
  CheckCircle,
  Play
} from 'lucide-react';
import { Button } from '@/components/ui';
import { AuthModal } from './index';

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const [showAuthModal, setShowAuthModal] = useState(false);

  const features = [
    {
      icon: Brain,
      title: 'AI-Driven Strategies',
      description: 'Create sophisticated trading strategies with our AI-powered visual builder and code editor.',
    },
    {
      icon: BarChart3,
      title: 'Advanced Backtesting',
      description: 'Test your strategies against historical data with comprehensive performance analytics.',
    },
    {
      icon: Shield,
      title: 'Risk-Free Paper Trading',
      description: 'Deploy strategies in real-time simulation without financial risk.',
    },
    {
      icon: Zap,
      title: 'Real-Time Analytics',
      description: 'Monitor performance with live P&L tracking and risk management tools.',
    },
    {
      icon: Target,
      title: 'Precision Execution',
      description: 'Simulate realistic order execution with slippage and market impact modeling.',
    },
    {
      icon: TrendingUp,
      title: 'Performance Insights',
      description: 'Detailed reports with equity curves, drawdown analysis, and trade statistics.',
    },
  ];

  const benefits = [
    'No coding experience required',
    'Institutional-grade analytics',
    'Real-time market simulation',
    'Comprehensive risk management',
    'Export and share results',
    'Mobile-responsive design',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900">
      {/* Hero Section */}
      <section className="relative px-6 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl lg:text-7xl font-bold text-neutral-900 dark:text-white mb-6">
                AI-Powered
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">
                  {' '}Trading{' '}
                </span>
                Platform
              </h1>
              <p className="text-xl lg:text-2xl text-neutral-600 dark:text-neutral-300 mb-8 max-w-3xl mx-auto">
                Create, backtest, and deploy trading strategies with our intuitive platform. 
                No financial risk, maximum learning potential.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Button
                size="lg"
                onClick={() => setShowAuthModal(true)}
                className="text-lg px-8 py-4"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={onGetStarted}
                className="text-lg px-8 py-4"
              >
                <Play className="mr-2 h-5 w-5" />
                View Demo
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -right-32 w-80 h-80 bg-primary-200 dark:bg-primary-800 rounded-full opacity-20 blur-3xl" />
          <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-secondary-200 dark:bg-secondary-800 rounded-full opacity-20 blur-3xl" />
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20 bg-white dark:bg-neutral-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-neutral-900 dark:text-white mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto">
              Our platform provides all the tools and insights you need to develop, test, and deploy successful trading strategies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="p-6 rounded-xl bg-neutral-50 dark:bg-neutral-700 hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-neutral-600 dark:text-neutral-300">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="px-6 py-20 bg-neutral-50 dark:bg-neutral-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-neutral-900 dark:text-white mb-6">
                Why Choose ShareTrading?
              </h2>
              <p className="text-xl text-neutral-600 dark:text-neutral-300 mb-8">
                Built for traders of all levels, from beginners learning the basics to professionals 
                developing complex algorithmic strategies.
              </p>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center"
                  >
                    <CheckCircle className="h-5 w-5 text-success-600 mr-3 flex-shrink-0" />
                    <span className="text-neutral-700 dark:text-neutral-300">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl p-8">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Portfolio Value</span>
                    <span className="text-2xl font-bold text-success-600">$125,847</span>
                  </div>
                  <div className="h-32 bg-gradient-to-r from-success-100 to-primary-100 dark:from-success-900 dark:to-primary-900 rounded-lg flex items-end justify-center">
                    <div className="text-sm text-neutral-600 dark:text-neutral-400">📈 Performance Chart</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-neutral-900 dark:text-white">+12.4%</div>
                      <div className="text-sm text-neutral-500 dark:text-neutral-400">30d Return</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-neutral-900 dark:text-white">5</div>
                      <div className="text-sm text-neutral-500 dark:text-neutral-400">Active Strategies</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Start Trading Smarter?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of traders who are already using AI to enhance their trading strategies.
          </p>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => setShowAuthModal(true)}
            className="text-lg px-8 py-4"
          >
            Start Your Free Trial
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          setShowAuthModal(false);
          onGetStarted();
        }}
      />
    </div>
  );
}