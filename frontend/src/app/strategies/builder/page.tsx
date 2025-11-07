'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, FileText, Loader2, ArrowLeft } from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { StrategyBuilder } from '@/components/features/strategies/strategy-builder';
import { useAuthStore } from '@/stores/auth-store';
import { useStrategy, useStrategies, useStrategyActions } from '@/hooks/use-strategies';
import { Strategy } from '@/types/trading';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';

export default function StrategyBuilderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const strategyId = searchParams.get('id');
  const [retryCount, setRetryCount] = useState(0);

  // Use the API hook to fetch strategy details
  const { strategy: apiStrategy, loading: strategyLoading, error: strategyError, refetch } = useStrategy(strategyId || '');

  // Memoize recent strategies options
  const recentOptions = useMemo(() => ({
    limit: 5,
    sortBy: 'updatedAt' as const,
    sortOrder: 'desc' as const
  }), []);

  const { strategies: recentStrategies, loading: recentLoading } = useStrategies(recentOptions);

  // Retry mechanism for newly created strategies
  useEffect(() => {
    if (strategyId && strategyError && retryCount < 3) {
      const timer = setTimeout(() => {
        console.log(`Retrying strategy fetch (attempt ${retryCount + 1})`);
        refetch();
        setRetryCount(prev => prev + 1);
      }, 1000 * (retryCount + 1)); // Exponential backoff: 1s, 2s, 3s

      return () => clearTimeout(timer);
    }
  }, [strategyId, strategyError, retryCount, refetch]);

  // Convert API strategy to UI format
  const strategy: Strategy | null = apiStrategy ? {
    id: apiStrategy._id,
    name: apiStrategy.name,
    description: apiStrategy.description,
    type: apiStrategy.type,
    status: apiStrategy.status,
    parameters: apiStrategy.parameters,
    code: apiStrategy.code,
    templateId: apiStrategy.templateId,
    isTemplate: false,
    tags: apiStrategy.tags,
    createdAt: new Date(apiStrategy.createdAt),
    updatedAt: new Date(apiStrategy.updatedAt),
    deployedAt: apiStrategy.deployedAt ? new Date(apiStrategy.deployedAt) : undefined,
    performance: apiStrategy.performance,
  } : null;

  // Strategy actions hook
  const strategyActions = useStrategyActions();

  const handleSave = async (updatedStrategy: Strategy) => {
    try {
      if (!strategy) return;

      await strategyActions.updateStrategy(strategy.id, {
        name: updatedStrategy.name,
        description: updatedStrategy.description,
        parameters: updatedStrategy.parameters,
        code: updatedStrategy.code,
        tags: updatedStrategy.tags
      });

      // Refresh the strategy data
      refetch();
    } catch (error) {
      console.error('Failed to save strategy:', error);
    }
  };

  const handleRunBacktest = (strategy: Strategy) => {
    // Navigate to backtesting page with strategy pre-selected
    router.push(`/backtesting?strategyId=${strategy.id}`);
  };

  const handlePreview = (strategy: Strategy) => {
    // Show preview modal (this is handled by the StrategyBuilder component)
    console.log('Previewing strategy:', strategy);
  };

  const handleBack = () => {
    router.push('/strategies');
  };

  if (!user) {
    return null;
  }

  if (strategyId && strategyLoading) {
    return (
      <MainLayout user={user}>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-4" />
            <p className="text-neutral-600 dark:text-neutral-400">Loading strategy...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (strategyId && strategyError && !strategyLoading) {
    return (
      <MainLayout user={user}>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
            Strategy Not Found
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            The strategy you&apos;re looking for doesn&apos;t exist or has been deleted.
          </p>
          <div className="space-y-4">
            <Button
              variant="outline"
              onClick={handleBack}
              className="inline-flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Strategies</span>
            </Button>
            <div className="text-sm text-neutral-500 dark:text-neutral-400">
              <p>If you just created this strategy, it might take a moment to appear.</p>
              <button
                onClick={() => window.location.reload()}
                className="text-primary-600 hover:text-primary-700 underline"
              >
                Try refreshing the page
              </button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!strategyId) {
    return (
      <MainLayout user={user}>
        <div className="text-center py-12">
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
            {recentLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
                <span className="ml-2 text-neutral-600 dark:text-neutral-400">Loading recent strategies...</span>
              </div>
            ) : recentStrategies.length > 0 ? (
              <div className="text-left">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                  Recent Strategies
                </h3>
                <div className="space-y-2">
                  {recentStrategies.slice(0, 3).map((apiStrategy) => {
                    const uiStrategy: Strategy = {
                      id: apiStrategy._id,
                      name: apiStrategy.name,
                      description: apiStrategy.description,
                      type: apiStrategy.type,
                      status: apiStrategy.status,
                      parameters: apiStrategy.parameters,
                      code: apiStrategy.code,
                      templateId: apiStrategy.templateId,
                      isTemplate: false,
                      tags: apiStrategy.tags,
                      createdAt: new Date(apiStrategy.createdAt),
                      updatedAt: new Date(apiStrategy.updatedAt),
                      deployedAt: apiStrategy.deployedAt ? new Date(apiStrategy.deployedAt) : undefined,
                      performance: apiStrategy.performance,
                    };

                    return (
                      <button
                        key={uiStrategy.id}
                        onClick={() => router.push(`/strategies/builder?id=${uiStrategy.id}`)}
                        className="w-full p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:border-primary-300 dark:hover:border-primary-600 transition-colors text-left"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-neutral-900 dark:text-white">
                              {uiStrategy.name}
                            </h4>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">
                              {uiStrategy.description}
                            </p>
                          </div>
                          <span className={cn(
                            'px-2 py-1 text-xs font-medium rounded',
                            uiStrategy.status === 'ACTIVE' && 'bg-success-100 text-success-800 dark:bg-success-900/20 dark:text-success-300',
                            uiStrategy.status === 'PAUSED' && 'bg-warning-100 text-warning-800 dark:bg-warning-900/20 dark:text-warning-300',
                            uiStrategy.status === 'STOPPED' && 'bg-danger-100 text-danger-800 dark:bg-danger-900/20 dark:text-danger-300',
                            uiStrategy.status === 'DRAFT' && 'bg-neutral-100 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-300'
                          )}>
                            {uiStrategy.status}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </MainLayout>
    );
  }

  // Only render StrategyBuilder if we have a valid strategy
  if (!strategy) {
    return (
      <MainLayout user={user}>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
            Strategy Not Found
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            Unable to load strategy details.
          </p>
          <Button
            variant="outline"
            onClick={handleBack}
            className="inline-flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Strategies</span>
          </Button>
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