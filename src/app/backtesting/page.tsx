'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, Play, BarChart3 } from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { Button } from '@/components/ui';
import { BacktestConfigModal, BacktestQueue } from '@/components/features/backtesting';
import { useAuthStore } from '@/stores/auth-store';
import { mockBacktests } from '@/mocks/data/backtests';
import { mockStrategies } from '@/mocks/data/strategies';
import { Backtest, Strategy } from '@/types/trading';

interface BacktestConfig {
  name: string;
  startDate: string;
  endDate: string;
  initialCapital: number;
  commission: number;
  slippage: number;
}

export default function BacktestingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const [backtests, setBacktests] = useState<Backtest[]>([]);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);

  // Load backtests and strategies
  useEffect(() => {
    // Load from localStorage and combine with mock data
    const savedBacktests = localStorage.getItem('user-backtests');
    const userBacktests = savedBacktests ? JSON.parse(savedBacktests) : [];
    
    // Convert date strings back to Date objects
    const parsedUserBacktests = userBacktests.map((backtest: any) => ({
      ...backtest,
      startDate: new Date(backtest.startDate),
      endDate: new Date(backtest.endDate),
      createdAt: new Date(backtest.createdAt),
      startedAt: backtest.startedAt ? new Date(backtest.startedAt) : undefined,
      completedAt: backtest.completedAt ? new Date(backtest.completedAt) : undefined,
    }));

    setBacktests([...parsedUserBacktests, ...mockBacktests]);

    // Load strategies (both user and mock)
    const savedStrategies = localStorage.getItem('user-strategies');
    const userStrategies = savedStrategies ? JSON.parse(savedStrategies) : [];
    const parsedUserStrategies = userStrategies.map((strategy: any) => ({
      ...strategy,
      createdAt: new Date(strategy.createdAt),
      updatedAt: new Date(strategy.updatedAt),
      deployedAt: strategy.deployedAt ? new Date(strategy.deployedAt) : undefined,
    }));

    setStrategies([...parsedUserStrategies, ...mockStrategies]);
  }, []);

  // Check for strategy ID in URL params to auto-open config modal
  useEffect(() => {
    const strategyId = searchParams.get('strategyId');
    if (strategyId) {
      const strategy = strategies.find(s => s.id === strategyId);
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

  const handleSubmitBacktest = (config: BacktestConfig) => {
    if (!selectedStrategy) return;

    const newBacktest: Backtest = {
      id: `backtest-${Date.now()}`,
      strategyId: selectedStrategy.id,
      name: config.name,
      status: 'PENDING',
      startDate: new Date(config.startDate),
      endDate: new Date(config.endDate),
      initialCapital: config.initialCapital,
      commission: config.commission,
      slippage: config.slippage,
      createdAt: new Date(),
      progress: 0,
    };

    // Save to localStorage
    const savedBacktests = localStorage.getItem('user-backtests');
    const userBacktests = savedBacktests ? JSON.parse(savedBacktests) : [];
    userBacktests.unshift(newBacktest);
    localStorage.setItem('user-backtests', JSON.stringify(userBacktests));

    // Update state
    setBacktests(prev => [newBacktest, ...prev]);

    // Simulate backtest execution
    simulateBacktestExecution(newBacktest.id);
  };

  const simulateBacktestExecution = (backtestId: string) => {
    // Start the backtest
    setTimeout(() => {
      updateBacktestStatus(backtestId, 'RUNNING', { startedAt: new Date() });
      
      // Simulate progress updates
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += Math.random() * 15 + 5; // Random progress between 5-20%
        
        if (progress >= 100) {
          progress = 100;
          clearInterval(progressInterval);
          
          // Complete the backtest
          setTimeout(() => {
            updateBacktestStatus(backtestId, 'COMPLETED', { 
              completedAt: new Date(),
              progress: 100 
            });
          }, 1000);
        } else {
          updateBacktestStatus(backtestId, 'RUNNING', { progress });
        }
      }, 2000); // Update every 2 seconds
    }, 1000); // Start after 1 second
  };

  const updateBacktestStatus = (backtestId: string, status: Backtest['status'], updates: Partial<Backtest>) => {
    setBacktests(prev => prev.map(backtest => 
      backtest.id === backtestId 
        ? { ...backtest, status, ...updates }
        : backtest
    ));

    // Update localStorage
    const savedBacktests = localStorage.getItem('user-backtests');
    if (savedBacktests) {
      const userBacktests = JSON.parse(savedBacktests);
      const updatedBacktests = userBacktests.map((backtest: Backtest) =>
        backtest.id === backtestId 
          ? { ...backtest, status, ...updates }
          : backtest
      );
      localStorage.setItem('user-backtests', JSON.stringify(updatedBacktests));
    }
  };

  const handleCancelBacktest = (backtestId: string) => {
    updateBacktestStatus(backtestId, 'CANCELLED', { progress: 0 });
  };

  const handleDeleteBacktest = (backtestId: string) => {
    setBacktests(prev => prev.filter(b => b.id !== backtestId));
    
    // Update localStorage
    const savedBacktests = localStorage.getItem('user-backtests');
    if (savedBacktests) {
      const userBacktests = JSON.parse(savedBacktests);
      const filteredBacktests = userBacktests.filter((b: Backtest) => b.id !== backtestId);
      localStorage.setItem('user-backtests', JSON.stringify(filteredBacktests));
    }
  };

  const handleViewResults = (backtestId: string) => {
    // Navigate to backtest results page (to be implemented in next task)
    router.push(`/backtesting/results/${backtestId}`);
  };

  const handleRetryBacktest = (backtestId: string) => {
    updateBacktestStatus(backtestId, 'PENDING', { 
      progress: 0,
      errorMessage: undefined,
      startedAt: undefined,
      completedAt: undefined 
    });
    
    // Restart simulation
    setTimeout(() => simulateBacktestExecution(backtestId), 1000);
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
        {strategies.length > 0 && (
          <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
              Quick Start
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {strategies.slice(0, 6).map((strategy) => (
                <button
                  key={strategy.id}
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