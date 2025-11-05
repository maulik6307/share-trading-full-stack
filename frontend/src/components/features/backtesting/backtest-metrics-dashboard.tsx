'use client';

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Target, Shield, Clock, DollarSign } from 'lucide-react';
import { BacktestSummary, RiskMetrics, MonthlyReturn } from '@/types/trading';
import { cn } from '@/lib/utils';

interface BacktestMetricsDashboardProps {
  summary: BacktestSummary;
  riskMetrics: RiskMetrics;
  monthlyReturns: MonthlyReturn[];
  title?: string;
  className?: string;
}

export function BacktestMetricsDashboard({
  summary,
  riskMetrics,
  monthlyReturns,
  title = 'Performance Metrics',
  className,
}: BacktestMetricsDashboardProps) {
  const monthlyReturnsData = useMemo(() => {
    return monthlyReturns.map(mr => ({
      month: new Date(mr.year, mr.month - 1).toLocaleDateString('en-US', {
        month: 'short',
        year: mr.year !== new Date().getFullYear() ? 'numeric' : undefined,
      }),
      return: mr.returnPercent,
      isPositive: mr.returnPercent >= 0,
    }));
  }, [monthlyReturns]);

  const performanceMetrics = useMemo(() => {
    return [
      {
        label: 'Total Return',
        value: `${summary.totalReturnPercent.toFixed(2)}%`,
        subValue: `$${summary.totalReturn.toLocaleString()}`,
        icon: summary.totalReturnPercent >= 0 ? TrendingUp : TrendingDown,
        color: summary.totalReturnPercent >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400',
        bgColor: summary.totalReturnPercent >= 0 ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900',
      },
      {
        label: 'Annualized Return',
        value: `${summary.annualizedReturn.toFixed(2)}%`,
        subValue: 'Per year',
        icon: Target,
        color: summary.annualizedReturn >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400',
        bgColor: 'bg-blue-100 dark:bg-blue-900',
      },
      {
        label: 'Sharpe Ratio',
        value: summary.sharpeRatio.toFixed(2),
        subValue: 'Risk-adjusted',
        icon: Shield,
        color: summary.sharpeRatio >= 1 ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400',
        bgColor: 'bg-purple-100 dark:bg-purple-900',
      },
      {
        label: 'Max Drawdown',
        value: `${summary.maxDrawdownPercent.toFixed(2)}%`,
        subValue: `${summary.maxDrawdownDuration} days`,
        icon: TrendingDown,
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-100 dark:bg-red-900',
      },
      {
        label: 'Win Rate',
        value: `${(summary.winRate * 100).toFixed(1)}%`,
        subValue: `${summary.winningTrades}/${summary.totalTrades}`,
        icon: Target,
        color: summary.winRate >= 0.5 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400',
        bgColor: 'bg-indigo-100 dark:bg-indigo-900',
      },
      {
        label: 'Profit Factor',
        value: summary.profitFactor.toFixed(2),
        subValue: 'Gross profit/loss',
        icon: DollarSign,
        color: summary.profitFactor >= 1 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400',
        bgColor: 'bg-emerald-100 dark:bg-emerald-900',
      },
      {
        label: 'Avg Trade Duration',
        value: `${summary.avgTradeDuration.toFixed(1)}d`,
        subValue: 'Days held',
        icon: Clock,
        color: 'text-neutral-600 dark:text-neutral-400',
        bgColor: 'bg-neutral-100 dark:bg-neutral-900',
      },
      {
        label: 'Volatility',
        value: `${summary.volatility.toFixed(2)}%`,
        subValue: 'Annual',
        icon: TrendingUp,
        color: 'text-orange-600 dark:text-orange-400',
        bgColor: 'bg-orange-100 dark:bg-orange-900',
      },
    ];
  }, [summary]);

  const riskMetricsData = useMemo(() => {
    return [
      {
        label: 'Sortino Ratio',
        value: summary.sortinoRatio.toFixed(2),
        description: 'Downside risk-adjusted return',
      },
      {
        label: 'Calmar Ratio',
        value: riskMetrics.calmarRatio.toFixed(2),
        description: 'Annual return / Max drawdown',
      },
      {
        label: 'Information Ratio',
        value: riskMetrics.informationRatio.toFixed(2),
        description: 'Active return / Tracking error',
      },
      {
        label: 'VaR (95%)',
        value: `$${Math.abs(riskMetrics.var95).toLocaleString()}`,
        description: '1-day Value at Risk',
      },
      {
        label: 'Beta',
        value: riskMetrics.beta.toFixed(2),
        description: 'Market correlation',
      },
      {
        label: 'Alpha',
        value: `${(riskMetrics.alpha * 100).toFixed(2)}%`,
        description: 'Excess return vs market',
      },
    ];
  }, [summary, riskMetrics]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-neutral-800 p-3 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700">
          <p className="text-sm font-medium text-neutral-900 dark:text-white mb-1">
            {label}
          </p>
          <p className={`text-sm font-medium ${
            data.isPositive 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-red-600 dark:text-red-400'
          }`}>
            {data.return.toFixed(2)}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={cn(
      'bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700',
      className
    )}>
      <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-6">
        {title}
      </h3>

      {/* Performance Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {performanceMetrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div
              key={index}
              className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <div className={cn('p-2 rounded-lg', metric.bgColor)}>
                  <Icon className={cn('h-4 w-4', metric.color)} />
                </div>
              </div>
              <div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">
                  {metric.label}
                </p>
                <p className={cn('text-lg font-semibold', metric.color)}>
                  {metric.value}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {metric.subValue}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Monthly Returns Chart */}
      {monthlyReturnsData.length > 0 && (
        <div className="mb-8">
          <h4 className="text-md font-semibold text-neutral-900 dark:text-white mb-4">
            Monthly Returns
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyReturnsData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="currentColor"
                  className="text-neutral-200 dark:text-neutral-700" 
                />
                <XAxis
                  dataKey="month"
                  stroke="currentColor"
                  className="text-neutral-600 dark:text-neutral-400"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="currentColor"
                  className="text-neutral-600 dark:text-neutral-400"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value.toFixed(0)}%`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="return" radius={[2, 2, 0, 0]}>
                  {monthlyReturnsData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.isPositive ? '#16a34a' : '#dc2626'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Risk Metrics */}
      <div>
        <h4 className="text-md font-semibold text-neutral-900 dark:text-white mb-4">
          Risk Metrics
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {riskMetricsData.map((metric, index) => (
            <div
              key={index}
              className="p-4 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-neutral-900 dark:text-white">
                  {metric.label}
                </p>
                <p className="text-lg font-semibold text-neutral-900 dark:text-white">
                  {metric.value}
                </p>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                {metric.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Trade Statistics */}
      <div className="mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-700">
        <h4 className="text-md font-semibold text-neutral-900 dark:text-white mb-4">
          Trade Statistics
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(summary.avgWin)}
            </p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Avg Win</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {formatCurrency(summary.avgLoss)}
            </p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Avg Loss</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(summary.largestWin)}
            </p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Largest Win</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {formatCurrency(summary.largestLoss)}
            </p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Largest Loss</p>
          </div>
        </div>
      </div>

      {/* Cost Analysis */}
      <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-700">
        <h4 className="text-md font-semibold text-neutral-900 dark:text-white mb-4">
          Cost Analysis
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 rounded-lg bg-neutral-50 dark:bg-neutral-900">
            <p className="text-lg font-semibold text-neutral-900 dark:text-white">
              {formatCurrency(summary.totalCommission)}
            </p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Total Commission</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-neutral-50 dark:bg-neutral-900">
            <p className="text-lg font-semibold text-neutral-900 dark:text-white">
              {formatCurrency(summary.totalSlippage)}
            </p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Total Slippage</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-neutral-50 dark:bg-neutral-900">
            <p className="text-lg font-semibold text-neutral-900 dark:text-white">
              {formatCurrency(summary.totalCommission + summary.totalSlippage)}
            </p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Total Costs</p>
          </div>
        </div>
      </div>
    </div>
  );
}