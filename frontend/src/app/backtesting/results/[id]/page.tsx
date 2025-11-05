'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Download, Share2, TrendingUp, TrendingDown } from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { Button } from '@/components/ui';
import { 
  BacktestEquityCurve,
  BacktestDrawdownChart,
  BacktestTradeLedger,
  BacktestMetricsDashboard,
  ExportModal
} from '@/components/features/backtesting';
import { useAuthStore } from '@/stores/auth-store';
import { mockBacktestResults } from '@/mocks/data/backtests';
import { mockStrategies } from '@/mocks/data/strategies';
import { BacktestResult, Strategy } from '@/types/trading';

export default function BacktestResultsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  
  // Chart refs for export functionality
  const equityCurveRef = useRef<HTMLDivElement>(null);
  const drawdownChartRef = useRef<HTMLDivElement>(null);
  const metricsChartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const backtestId = params.id as string;
    
    // Find the backtest result
    const backtestResult = mockBacktestResults.find(r => r.backtestId === backtestId);
    
    if (!backtestResult) {
      setError('Backtest result not found');
      setLoading(false);
      return;
    }

    setResult(backtestResult);

    // Find the associated strategy
    const associatedStrategy = mockStrategies.find(s => s.id === backtestResult.backtestId.replace('backtest-', 'strategy-'));
    setStrategy(associatedStrategy || null);
    
    setLoading(false);
  }, [params.id]);

  const handleOpenExportModal = () => {
    setShowExportModal(true);
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <MainLayout user={user}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </MainLayout>
    );
  }

  if (error || !result) {
    return (
      <MainLayout user={user}>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
            {error || 'Backtest result not found'}
          </h2>
          <Button onClick={() => router.push('/backtesting')}>
            Back to Backtesting
          </Button>
        </div>
      </MainLayout>
    );
  }

  const isPositiveReturn = result.summary.totalReturnPercent > 0;

  return (
    <MainLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/backtesting')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
            
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
                Backtest Results
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400">
                {strategy?.name || 'Strategy'} • {result.summary.totalTrades} trades
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenExportModal}
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Export & Share</span>
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                  Total Return
                </p>
                <p className={`text-2xl font-bold ${
                  isPositiveReturn 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {result.summary.totalReturnPercent.toFixed(2)}%
                </p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  ${result.summary.totalReturn.toLocaleString()}
                </p>
              </div>
              {isPositiveReturn ? (
                <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
              ) : (
                <TrendingDown className="h-8 w-8 text-red-600 dark:text-red-400" />
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700">
            <div>
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                Sharpe Ratio
              </p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                {result.summary.sharpeRatio.toFixed(2)}
              </p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Risk-adjusted return
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700">
            <div>
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                Max Drawdown
              </p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {result.summary.maxDrawdownPercent.toFixed(2)}%
              </p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                ${Math.abs(result.summary.maxDrawdown).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700">
            <div>
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                Win Rate
              </p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                {(result.summary.winRate * 100).toFixed(1)}%
              </p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {result.summary.winningTrades} of {result.summary.totalTrades} trades
              </p>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div ref={equityCurveRef}>
            <BacktestEquityCurve data={result.equityCurve} />
          </div>
          <div ref={drawdownChartRef}>
            <BacktestDrawdownChart data={result.drawdownCurve} />
          </div>
        </div>

        {/* Performance Metrics Dashboard */}
        <div ref={metricsChartRef}>
          <BacktestMetricsDashboard 
            summary={result.summary}
            riskMetrics={result.riskMetrics}
            monthlyReturns={result.monthlyReturns}
          />
        </div>

        {/* Trade Ledger */}
        <BacktestTradeLedger trades={result.trades} />

        {/* Export Modal */}
        <ExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          result={result}
          strategy={strategy || undefined}
          chartRefs={{
            equityCurve: equityCurveRef,
            drawdownChart: drawdownChartRef,
            metricsChart: metricsChartRef,
          }}
        />
      </div>
    </MainLayout>
  );
}