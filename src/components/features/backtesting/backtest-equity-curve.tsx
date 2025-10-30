'use client';

import { useMemo } from 'react';
import { LineChart } from '@/components/ui/charts';
import { EquityPoint } from '@/types/trading';

interface BacktestEquityCurveProps {
  data: EquityPoint[];
  title?: string;
  height?: number;
  className?: string;
  showReturns?: boolean;
}

export function BacktestEquityCurve({
  data,
  title = 'Equity Curve',
  height = 400,
  className,
  showReturns = false,
}: BacktestEquityCurveProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const initialEquity = data[0]?.equity || 0;
    
    return data.map((point) => ({
      timestamp: point.date,
      value: point.equity,
      returns: point.returns,
      drawdown: point.drawdown,
      // Calculate cumulative return percentage
      cumulativeReturn: ((point.equity - initialEquity) / initialEquity) * 100,
    }));
  }, [data]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };



  const initialEquity = chartData[0]?.value || 0;
  const finalEquity = chartData[chartData.length - 1]?.value || 0;
  const isPositive = finalEquity >= initialEquity;

  if (!chartData || chartData.length === 0) {
    return (
      <LineChart
        data={[]}
        title={title}
        height={height}
        className={className}
        error="No equity curve data available"
      />
    );
  }

  const formatYAxisValue = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    } else {
      return `$${value.toFixed(0)}`;
    }
  };

  const formatTooltipValue = (value: number, name: string, props: any): [string, string] => {
    return [formatCurrency(value), 'Equity'];
  };

  const actions = (
    <div className="text-right">
      <p className="text-sm text-neutral-600 dark:text-neutral-400">
        Final Equity
      </p>
      <p className={`text-lg font-semibold ${
        isPositive 
          ? 'text-green-600 dark:text-green-400' 
          : 'text-red-600 dark:text-red-400'
      }`}>
        {formatCurrency(finalEquity)}
      </p>
    </div>
  );

  return (
    <div className={className}>
      <LineChart
        data={chartData}
        title={title}
        height={height}
        color={isPositive ? '#16a34a' : '#dc2626'}
        strokeWidth={2}
        showGrid={true}
        showReferenceLine={true}
        referenceValue={initialEquity}
        formatYAxis={formatYAxisValue}
        formatTooltip={formatTooltipValue}
        actions={actions}
      />
      
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-6 pb-6 rounded-b-lg">
        <div className="text-center">
          <p className="text-xs text-neutral-600 dark:text-neutral-400">Start</p>
          <p className="text-sm font-medium text-neutral-900 dark:text-white">
            {formatCurrency(initialEquity)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-neutral-600 dark:text-neutral-400">End</p>
          <p className={`text-sm font-medium ${
            isPositive 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-red-600 dark:text-red-400'
          }`}>
            {formatCurrency(finalEquity)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-neutral-600 dark:text-neutral-400">Change</p>
          <p className={`text-sm font-medium ${
            isPositive 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-red-600 dark:text-red-400'
          }`}>
            {formatPercentage(((finalEquity - initialEquity) / initialEquity) * 100)}
          </p>
        </div>
      </div>
    </div>
  );
}