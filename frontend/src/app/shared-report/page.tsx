'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Share2, ExternalLink, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';

interface SharedReportData {
  id: string;
  strategyName: string;
  generatedAt: string;
  summary: {
    totalReturn: number;
    totalReturnPercent: number;
    sharpeRatio: number;
    maxDrawdownPercent: number;
    winRate: number;
    totalTrades: number;
    profitFactor: number;
  };
  keyMetrics: Array<{
    label: string;
    value: string;
    subValue: string;
  }>;
  equityCurve: Array<{
    date: string;
    equity: number;
    returns: number;
  }>;
  tradeCount: number;
  dateRange: {
    start: string;
    end: string;
  };
}

export default function SharedReportPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [reportData, setReportData] = useState<SharedReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const encodedData = searchParams.get('data');
    
    if (!encodedData) {
      setError('No report data found in URL');
      setLoading(false);
      return;
    }

    try {
      const decodedData = atob(encodedData);
      const parsedData = JSON.parse(decodedData) as SharedReportData;
      
      // Validate the data structure
      if (!parsedData.id || !parsedData.summary || !parsedData.keyMetrics) {
        throw new Error('Invalid report data structure');
      }
      
      setReportData(parsedData);
    } catch (err) {
      console.error('Error parsing report data:', err);
      setError('Invalid or corrupted report data');
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Backtest Results - ${reportData?.strategyName}`,
          text: `Check out my backtest results: ${reportData?.summary.totalReturnPercent.toFixed(2)}% return`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleViewFullPlatform = () => {
    router.push('/');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-neutral-800 p-3 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700">
          <p className="text-sm font-medium text-neutral-900 dark:text-white mb-1">
            {formatDate(label)}
          </p>
          <p className="text-sm text-primary-600 dark:text-primary-400">
            Equity: {formatCurrency(data.equity)}
          </p>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Return: {data.returns.toFixed(2)}%
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-neutral-600 dark:text-neutral-400">Loading report...</p>
        </div>
      </div>
    );
  }

  if (error || !reportData) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
            Report Not Found
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            {error || 'The shared report could not be loaded. The link may be invalid or expired.'}
          </p>
          <Button onClick={handleViewFullPlatform}>
            View Platform
          </Button>
        </div>
      </div>
    );
  }

  const isPositiveReturn = reportData.summary.totalReturnPercent > 0;

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      {/* Header */}
      <div className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">ST</span>
                </div>
                <span className="font-semibold text-neutral-900 dark:text-white">
                  ShareTrading
                </span>
              </div>
              <div className="hidden sm:block w-px h-6 bg-neutral-300 dark:bg-neutral-600" />
              <div className="hidden sm:block">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                  Shared Backtest Report
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="flex items-center space-x-2"
              >
                <Share2 className="h-4 w-4" />
                <span className="hidden sm:inline">Share</span>
              </Button>
              
              <Button
                size="sm"
                onClick={handleViewFullPlatform}
                className="flex items-center space-x-2"
              >
                <ExternalLink className="h-4 w-4" />
                <span className="hidden sm:inline">View Platform</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Report Header */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                {reportData.strategyName}
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400 mt-1">
                Backtest Report • {reportData.tradeCount} trades
              </p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                Generated on {formatDate(reportData.generatedAt)}
              </p>
            </div>
            
            <div className="text-right">
              <div className={cn(
                'text-3xl font-bold',
                isPositiveReturn 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              )}>
                {reportData.summary.totalReturnPercent.toFixed(2)}%
              </div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Total Return
              </p>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {reportData.keyMetrics.map((metric, index) => (
            <div
              key={index}
              className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700"
            >
              <div>
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                  {metric.label}
                </p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-white mt-1">
                  {metric.value}
                </p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                  {metric.subValue}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Equity Curve Chart */}
        {reportData.equityCurve && reportData.equityCurve.length > 0 && (
          <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 mb-6">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
              Equity Curve
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={reportData.equityCurve} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    stroke="currentColor"
                    className="text-neutral-200 dark:text-neutral-700" 
                  />
                  <XAxis
                    dataKey="date"
                    stroke="currentColor"
                    className="text-neutral-600 dark:text-neutral-400"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => formatDate(value)}
                  />
                  <YAxis
                    stroke="currentColor"
                    className="text-neutral-600 dark:text-neutral-400"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => formatCurrency(value)}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="equity"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, stroke: '#2563eb', strokeWidth: 2, fill: '#ffffff' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Performance Summary */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 mb-6">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
            Performance Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Sharpe Ratio</p>
              <p className="text-xl font-semibold text-neutral-900 dark:text-white">
                {reportData.summary.sharpeRatio.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Max Drawdown</p>
              <p className="text-xl font-semibold text-red-600 dark:text-red-400">
                {reportData.summary.maxDrawdownPercent.toFixed(2)}%
              </p>
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Win Rate</p>
              <p className="text-xl font-semibold text-neutral-900 dark:text-white">
                {(reportData.summary.winRate * 100).toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Profit Factor</p>
              <p className="text-xl font-semibold text-neutral-900 dark:text-white">
                {reportData.summary.profitFactor.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Total Trades</p>
              <p className="text-xl font-semibold text-neutral-900 dark:text-white">
                {reportData.summary.totalTrades}
              </p>
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Date Range</p>
              <p className="text-sm text-neutral-900 dark:text-white">
                {formatDate(reportData.dateRange.start)} - {formatDate(reportData.dateRange.end)}
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 rounded-lg border border-primary-200 dark:border-primary-800 p-6 text-center">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
            Want to create your own strategies?
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">
            Join ShareTrading to build, backtest, and deploy your own trading strategies with our powerful platform.
          </p>
          <Button onClick={handleViewFullPlatform} size="lg">
            Get Started Free
          </Button>
        </div>
      </div>
    </div>
  );
}