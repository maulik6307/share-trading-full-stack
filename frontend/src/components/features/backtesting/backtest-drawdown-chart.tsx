'use client';

import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { DrawdownPoint } from '@/types/trading';
import { cn } from '@/lib/utils';

interface BacktestDrawdownChartProps {
  data: DrawdownPoint[];
  title?: string;
  height?: number;
  className?: string;
}

export function BacktestDrawdownChart({
  data,
  title = 'Drawdown Analysis',
  height = 400,
  className,
}: BacktestDrawdownChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    return data.map((point) => ({
      date: point.date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: data.length > 90 ? 'numeric' : undefined,
      }),
      drawdown: -Math.abs(point.drawdown), // Make sure drawdown is negative for visualization
      drawdownPercent: -Math.abs(point.drawdownPercent),
      isNewHigh: point.isNewHigh,
      timestamp: point.date.getTime(),
    }));
  }, [data]);

  const drawdownStats = useMemo(() => {
    if (!data || data.length === 0) return null;

    const maxDrawdown = Math.min(...data.map(p => -Math.abs(p.drawdownPercent)));
    const maxDrawdownPoint = data.find(p => -Math.abs(p.drawdownPercent) === maxDrawdown);
    
    // Calculate drawdown duration
    let currentDrawdownStart: Date | null = null;
    let maxDrawdownDuration = 0;
    let currentDrawdownDuration = 0;
    
    data.forEach((point) => {
      if (point.drawdownPercent < -0.01) { // In drawdown (more than 0.01%)
        if (!currentDrawdownStart) {
          currentDrawdownStart = point.date;
          currentDrawdownDuration = 1;
        } else {
          currentDrawdownDuration++;
        }
      } else { // New high or minimal drawdown
        if (currentDrawdownStart) {
          maxDrawdownDuration = Math.max(maxDrawdownDuration, currentDrawdownDuration);
          currentDrawdownStart = null;
          currentDrawdownDuration = 0;
        }
      }
    });

    // Handle case where drawdown continues to the end
    if (currentDrawdownStart) {
      maxDrawdownDuration = Math.max(maxDrawdownDuration, currentDrawdownDuration);
    }

    return {
      maxDrawdown,
      maxDrawdownDate: maxDrawdownPoint?.date,
      maxDrawdownDuration,
      recoveryPeriods: data.filter(p => p.isNewHigh).length,
    };
  }, [data]);

  const formatPercentage = (value: number) => {
    return `${Math.abs(value).toFixed(2)}%`;
  };



  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-neutral-800 p-3 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700">
          <p className="text-sm font-medium text-neutral-900 dark:text-white mb-2">
            {label}
          </p>
          <div className="space-y-1">
            <div className="flex items-center justify-between space-x-4">
              <span className="text-sm text-neutral-600 dark:text-neutral-400">Drawdown:</span>
              <span className="text-sm font-medium text-red-600 dark:text-red-400">
                -{formatPercentage(data.drawdownPercent)}
              </span>
            </div>
            {data.isNewHigh && (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-green-600 dark:text-green-400">New High</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  if (!chartData || chartData.length === 0) {
    return (
      <div className={cn(
        'bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700',
        className
      )}>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
          {title}
        </h3>
        <div className="flex items-center justify-center h-64 text-neutral-500 dark:text-neutral-400">
          No drawdown data available
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      'bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700',
      className
    )}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
          {title}
        </h3>
        {drawdownStats && (
          <div className="text-right">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Max Drawdown
            </p>
            <p className="text-lg font-semibold text-red-600 dark:text-red-400">
              {formatPercentage(drawdownStats.maxDrawdown)}
            </p>
          </div>
        )}
      </div>

      <div style={{ height }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart 
            data={chartData} 
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <defs>
              <linearGradient id="drawdownGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#dc2626" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#dc2626" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            
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
              interval="preserveStartEnd"
            />
            <YAxis
              stroke="currentColor"
              className="text-neutral-600 dark:text-neutral-400"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${Math.abs(value).toFixed(0)}%`}
              domain={['dataMin', 0]}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Reference line at 0% */}
            <ReferenceLine 
              y={0} 
              stroke="hsl(var(--muted-foreground))" 
              strokeDasharray="2 2"
              strokeOpacity={0.5}
            />
            
            <Area
              type="monotone"
              dataKey="drawdownPercent"
              stroke="#dc2626"
              strokeWidth={2}
              fill="url(#drawdownGradient)"
              fillOpacity={1}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Drawdown Statistics */}
      {drawdownStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
          <div className="text-center">
            <p className="text-xs text-neutral-600 dark:text-neutral-400">Max Drawdown</p>
            <p className="text-sm font-medium text-red-600 dark:text-red-400">
              {formatPercentage(drawdownStats.maxDrawdown)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-neutral-600 dark:text-neutral-400">Max Duration</p>
            <p className="text-sm font-medium text-neutral-900 dark:text-white">
              {drawdownStats.maxDrawdownDuration} days
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-neutral-600 dark:text-neutral-400">Recovery Periods</p>
            <p className="text-sm font-medium text-green-600 dark:text-green-400">
              {drawdownStats.recoveryPeriods}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-neutral-600 dark:text-neutral-400">Worst Date</p>
            <p className="text-sm font-medium text-neutral-900 dark:text-white">
              {drawdownStats.maxDrawdownDate?.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
              }) || 'N/A'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}