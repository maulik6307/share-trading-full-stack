'use client';

import { useMemo } from 'react';
import { AreaChart as RechartsAreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, Brush } from 'recharts';
import { BaseChart, BaseChartProps } from './base-chart';

export interface AreaChartDataPoint {
  timestamp: Date | string | number;
  value: number;
  label?: string;
  [key: string]: any;
}

export interface AreaChartProps extends Omit<BaseChartProps, 'children'> {
  data: AreaChartDataPoint[];
  dataKey?: string;
  xAxisKey?: string;
  color?: string;
  strokeWidth?: number;
  fillOpacity?: number;
  showGrid?: boolean;
  showBrush?: boolean;
  showReferenceLine?: boolean;
  referenceValue?: number;
  formatXAxis?: (value: any) => string;
  formatYAxis?: (value: number) => string;
  formatTooltip?: (value: number, name: string, props: any) => [string, string];
  gradientId?: string;
}

export function AreaChart({
  data,
  dataKey = 'value',
  xAxisKey = 'timestamp',
  color = '#0ea5e9',
  strokeWidth = 2,
  fillOpacity = 0.3,
  showGrid = true,
  showBrush = false,
  showReferenceLine = false,
  referenceValue,
  formatXAxis,
  formatYAxis,
  formatTooltip,
  gradientId = 'areaGradient',
  ...baseProps
}: AreaChartProps) {
  const chartData = useMemo(() => {
    return data.map(point => ({
      ...point,
      [xAxisKey]: typeof point[xAxisKey] === 'string' || typeof point[xAxisKey] === 'number' 
        ? point[xAxisKey]
        : point[xAxisKey] instanceof Date 
        ? point[xAxisKey].getTime()
        : point[xAxisKey],
    }));
  }, [data, xAxisKey]);

  const defaultFormatXAxis = (value: any) => {
    if (typeof value === 'number' && value > 1000000000) {
      return new Date(value).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
    return String(value);
  };

  const defaultFormatYAxis = (value: number) => {
    if (Math.abs(value) >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (Math.abs(value) >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toFixed(0);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white dark:bg-neutral-800 p-3 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700">
          <p className="text-sm font-medium text-neutral-900 dark:text-white mb-2">
            {formatXAxis ? formatXAxis(label) : defaultFormatXAxis(label)}
          </p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center justify-between space-x-4">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">
                    {entry.name}:
                  </span>
                </div>
                <span className="text-sm font-medium text-neutral-900 dark:text-white">
                  {formatTooltip 
                    ? formatTooltip(entry.value, entry.name, entry.payload)[0]
                    : entry.value.toLocaleString()
                  }
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  if (!data || data.length === 0) {
    return (
      <BaseChart {...baseProps} error="No data available" />
    );
  }

  return (
    <BaseChart {...baseProps}>
      <RechartsAreaChart 
        data={chartData} 
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={fillOpacity * 2}/>
            <stop offset="95%" stopColor={color} stopOpacity={fillOpacity * 0.5}/>
          </linearGradient>
        </defs>
        
        {showGrid && (
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="currentColor"
            className="text-neutral-200 dark:text-neutral-700" 
          />
        )}
        
        <XAxis
          dataKey={xAxisKey}
          stroke="currentColor"
          className="text-neutral-600 dark:text-neutral-400"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={formatXAxis || defaultFormatXAxis}
          interval="preserveStartEnd"
        />
        
        <YAxis
          stroke="currentColor"
          className="text-neutral-600 dark:text-neutral-400"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={formatYAxis || defaultFormatYAxis}
        />
        
        <Tooltip content={<CustomTooltip />} />
        
        {showReferenceLine && referenceValue !== undefined && (
          <ReferenceLine 
            y={referenceValue} 
            stroke="hsl(var(--muted-foreground))" 
            strokeDasharray="2 2"
            strokeOpacity={0.5}
          />
        )}
        
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={strokeWidth}
          fill={`url(#${gradientId})`}
          fillOpacity={1}
        />
        
        {showBrush && (
          <Brush 
            dataKey={xAxisKey}
            height={30}
            stroke={color}
            fill="hsl(var(--muted))"
          />
        )}
      </RechartsAreaChart>
    </BaseChart>
  );
}