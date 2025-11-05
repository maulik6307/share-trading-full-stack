'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, Play, BarChart3 } from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { Button } from '@/components/ui';
import { BacktestConfigModal, BacktestQueue } from '@/components/features/backtesting';
import { useAuthStore } from '@/stores/auth-store';
import { useBacktesting } from '@/hooks/use-backtesting';
import { useStrategies } from '@/hooks/use-strategies';
import { BacktestConfig } from '@/lib/api/backtesting';
import { Strategy } from '@/lib/api/strategies';

export default function BacktestingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);

  // Use custom hooks for data management
  const {
    backtests,
    // statusCounts, // Unused for now
    loading: backtestsLoading,
    error: backtestsError,
    createBacktest,
    deleteBacktest,
    cancelBacktest,
    retryBacktest,
  } = useBacktesting();

  const {
    strategies,
    loading: strategiesLoading,
    error: strategiesError,
  } = useStrategies();

  // Check for strategy ID in URL params to auto-open config modal
  useEffect(() => {
    const strategyId = searchParams.get('strategyId');
    if (strategyId && strategies.length > 0) {
      const strategy = strategies.find(s => s._id === strategyId);
      if (strategy) {
        setSelectedStrategy(strategy);
        setShowConfigModal(true);
      }
      // Clean up URL
      router.replace('/backtesting');
    }
  }, [searchParams, strategies, router]);

  const handleCreateBacktest = (strategy?: Strategy) => {
    if (strategy) {
      setSelectedStrategy(strategy);
    } else {
      // Show strategy selection if no strategy provided
      setSelectedStrategy(null);
    }
    setShowConfigModal(true);
  };

  const handleSubmitBacktest = async (config: Omit<BacktestConfig, 'strategyId'>) => {
    if (!selectedStrategy) return;

    const backtestConfig: BacktestConfig = {
      ...config,
      strategyId: selectedStrategy._id,
    };

    const result = await createBacktest(backtestConfig);
    if (result) {
      setShowConfigModal(false);
      setSelectedStrategy(null);
    }
  };

  const handleCancelBacktest = async (backtestId: string) => {
    await cancelBacktest(backtestId);
  };

  const handleDeleteBacktest = async (backtestId: string) => {
    await deleteBacktest(backtestId);
  };

  const handleViewResults = (backtestId: string) => {
    // Navigate to backtest results page
    router.push(`/backtesting/results/${backtestId}`);
  };

  const handleRetryBacktest = async (backtestId: string) => {
    await retryBacktest(backtestId);
  };

  if (!user) {
    return null;
  }

  return (
    <MainLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
              Backtesting
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Test your strategies against historical data
            </p>
          </div>
          
          <Button 
            onClick={() => handleCreateBacktest()}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>New Backtest</span>
          </Button>
        </div>

        {/* Quick Actions */}
        {!strategiesLoading && strategies.length > 0 && (
          <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
              Quick Start
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {strategies.slice(0, 6).map((strategy) => (
                <button
                  key={strategy._id}
                  onClick={() => handleCreateBacktest(strategy)}
                  className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:border-primary-300 dark:hover:border-primary-600 transition-colors text-left"
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                      <BarChart3 className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-neutral-900 dark:text-white truncate">
                        {strategy.name}
                      </h3>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 truncate">
                        {strategy.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                      {strategy.type}
                    </span>
                    <div className="flex items-center space-x-1 text-primary-600 dark:text-primary-400">
                      <Play className="h-3 w-3" />
                      <span className="text-xs">Run Backtest</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* No Strategies Available */}
        {!strategiesLoading && strategies.length === 0 && !strategiesError && (
          <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-6">
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-neutral-400" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                No Strategies Available
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                Create your first strategy to start backtesting
              </p>
              <Button 
                onClick={() => router.push('/strategies')}
                className="flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Create Strategy</span>
              </Button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {(backtestsLoading || strategiesLoading) && (
          <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/4"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-20 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Error States */}
        {(backtestsError || strategiesError) && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-600 dark:text-red-400">
              {backtestsError || strategiesError}
            </p>
          </div>
        )}

        {/* Backtest Queue */}
        <BacktestQueue
          backtests={backtests}
          onCancel={handleCancelBacktest}
          onDelete={handleDeleteBacktest}
          onViewResults={handleViewResults}
          onRetry={handleRetryBacktest}
        />

        {/* Configuration Modal */}
        <BacktestConfigModal
          isOpen={showConfigModal}
          onClose={() => {
            setShowConfigModal(false);
            setSelectedStrategy(null);
          }}
          onSubmit={handleSubmitBacktest}
          strategy={selectedStrategy}
        />
      </div>
    </MainLayout>
  );
}