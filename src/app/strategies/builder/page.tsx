'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, FileText } from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { StrategyBuilder } from '@/components/features/strategies/strategy-builder';
import { useAuthStore } from '@/stores/auth-store';
import { mockStrategies } from '@/mocks/data/strategies';
import { Strategy } from '@/types/trading';
import { cn } from '@/lib/utils';

export default function StrategyBuilderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const strategyId = searchParams.get('id');
    
    if (strategyId) {
      // First check in mock strategies
      let foundStrategy = mockStrategies.find(s => s.id === strategyId);
      
      // If not found in mock data, check localStorage for newly created strategies
      if (!foundStrategy) {
        const savedStrategies = localStorage.getItem('user-strategies');
        if (savedStrategies) {
          try {
            const userStrategies = JSON.parse(savedStrategies);
            foundStrategy = userStrategies.find((s: Strategy) => s.id === strategyId);
            if (foundStrategy) {
              // Convert date strings back to Date objects
              foundStrategy.createdAt = new Date(foundStrategy.createdAt);
              foundStrategy.updatedAt = new Date(foundStrategy.updatedAt);
              if (foundStrategy.deployedAt) {
                foundStrategy.deployedAt = new Date(foundStrategy.deployedAt);
              }
            }
          } catch (error) {
            console.error('Error parsing saved strategies:', error);
          }
        }
      }
      
      if (foundStrategy) {
        setStrategy(foundStrategy);
      } else {
        // Strategy not found, show error state
        setStrategy(null);
      }
    } else {
      // No strategy ID provided, show strategy selection
      setStrategy(null);
    }
    
    setIsLoading(false);
  }, [searchParams, router]);

  const handleSave = (updatedStrategy: Strategy) => {
    // In a real implementation, this would save to backend
    console.log('Saving strategy:', updatedStrategy);
    
    // Update localStorage
    const savedStrategies = localStorage.getItem('user-strategies');
    const userStrategies = savedStrategies ? JSON.parse(savedStrategies) : [];
    const strategyIndex = userStrategies.findIndex((s: Strategy) => s.id === updatedStrategy.id);
    
    if (strategyIndex >= 0) {
      userStrategies[strategyIndex] = updatedStrategy;
    } else {
      // If not found in user strategies, add it (in case it was originally from mock data)
      userStrategies.unshift(updatedStrategy);
    }
    
    localStorage.setItem('user-strategies', JSON.stringify(userStrategies));
    setStrategy(updatedStrategy);
    
    // Show success message (in real app, use toast)
    alert('Strategy saved successfully!');
  };

  const handleRunBacktest = (strategy: Strategy) => {
    // Navigate to backtesting page with strategy pre-selected
    router.push(`/backtesting?strategyId=${strategy.id}`);
  };

  const handlePreview = (strategy: Strategy) => {
    // In a real implementation, this would show a preview modal
    console.log('Previewing strategy:', strategy);
    alert('Strategy preview functionality coming soon!');
  };

  const handleBack = () => {
    router.push('/strategies');
  };

  if (!user) {
    return null;
  }

  if (isLoading) {
    return (
      <MainLayout user={user}>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-neutral-600 dark:text-neutral-400">Loading strategy...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!strategy) {
    const strategyId = searchParams.get('id');
    
    return (
      <MainLayout user={user}>
        <div className="text-center py-12">
          {strategyId ? (
            // Strategy ID provided but not found
            <>
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
                Strategy Not Found
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                The strategy you&apos;re looking for doesn&apos;t exist or has been deleted.
              </p>
              <button
                onClick={handleBack}
                className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
              >
                ← Back to Strategies
              </button>
            </>
          ) : (
            // No strategy ID provided - show selection interface
            <>
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
                Strategy Builder
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400 mb-8">
                Select a strategy to edit or create a new one
              </p>
              
              <div className="max-w-2xl mx-auto space-y-6">
                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => router.push('/strategies')}
                    className="p-6 border-2 border-neutral-200 dark:border-neutral-700 rounded-lg hover:border-primary-300 dark:hover:border-primary-600 transition-colors text-left"
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                        <FileText className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                        Select Existing Strategy
                      </h3>
                    </div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Choose from your existing strategies to edit and customize.
                    </p>
                  </button>

                  <button
                    onClick={() => router.push('/strategies?create=true')}
                    className="p-6 border-2 border-neutral-200 dark:border-neutral-700 rounded-lg hover:border-primary-300 dark:hover:border-primary-600 transition-colors text-left"
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-secondary-100 dark:bg-secondary-900 rounded-lg flex items-center justify-center">
                        <Plus className="h-5 w-5 text-secondary-600 dark:text-secondary-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                        Create New Strategy
                      </h3>
                    </div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Start building a new strategy from scratch or template.
                    </p>
                  </button>
                </div>

                {/* Recent Strategies */}
                {mockStrategies.length > 0 && (
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                      Recent Strategies
                    </h3>
                    <div className="space-y-2">
                      {mockStrategies.slice(0, 3).map((strategy) => (
                        <button
                          key={strategy.id}
                          onClick={() => router.push(`/strategies/builder?id=${strategy.id}`)}
                          className="w-full p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:border-primary-300 dark:hover:border-primary-600 transition-colors text-left"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-neutral-900 dark:text-white">
                                {strategy.name}
                              </h4>
                              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                {strategy.description}
                              </p>
                            </div>
                            <span className={cn(
                              'px-2 py-1 text-xs font-medium rounded',
                              strategy.status === 'ACTIVE' && 'bg-success-100 text-success-800 dark:bg-success-900/20 dark:text-success-300',
                              strategy.status === 'PAUSED' && 'bg-warning-100 text-warning-800 dark:bg-warning-900/20 dark:text-warning-300',
                              strategy.status === 'STOPPED' && 'bg-danger-100 text-danger-800 dark:bg-danger-900/20 dark:text-danger-300',
                              strategy.status === 'DRAFT' && 'bg-neutral-100 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-300'
                            )}>
                              {strategy.status}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout user={user}>
      <StrategyBuilder
        strategy={strategy}
        onSave={handleSave}
        onRunBacktest={handleRunBacktest}
        onPreview={handlePreview}
        onBack={handleBack}
      />
    </MainLayout>
  );
}