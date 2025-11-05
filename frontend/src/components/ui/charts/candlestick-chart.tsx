'use client';

import { useMemo } from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Cell, Brush } from 'recharts';
import { BaseChart, BaseChartProps } from './base-chart';

export interface CandlestickDataPoint {
  timestamp: Date | string | number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
  label?: string;
  [key: string]: any;
}

export interface CandlestickChartProps extends Omit<BaseChartProps, 'children'> {
  data: CandlestickDataPoint[];
  xAxisKey?: string;
  showVolume?: boolean;
  showGrid?: boolean;
  showBrush?: boolean;
  formatXAxis?: (value: any) => string;
  formatYAxis?: (value: number) => string;
  bullishColor?: string;
  bearishColor?: string;
}

export function CandlestickChart({
  data,
  xAxisKey = 'timestamp',
  showVolume = false,
  showGrid = true,
  showBrush = false,
  formatXAxis,
  formatYAxis,
  bullishColor = '#16a34a',
  bearishColor = '#dc2626',
  ...baseProps
}: CandlestickChartProps) {
  const chartData = useMemo(() => {
    return data.map(point => {
      const isBullish = point.close >= point.open;
      const bodyHeight = Math.abs(point.close - point.open);
      const bodyTop = Math.max(point.open, point.close);
      const bodyBottom = Math.min(point.open, point.close);
      
      return {
        ...point,
        [xAxisKey]: typeof point[xAxisKey] === 'string' || typeof point[xAxisKey] === 'number' 
          ? point[xAxisKey]
          : point[xAxisKey] instanceof Date 
          ? point[xAxisKey].getTime()
          : point[xAxisKey],
        isBullish,
        bodyHeight,
        bodyTop,
        bodyBottom,
        wickTop: point.high - bodyTop,
        wickBottom: bodyBottom - point.low,
        // For the wick lines
        highLowRange: [point.low, point.high],
      };
    });
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
    return `$${value.toFixed(2)}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-neutral-800 p-3 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700">
          <p className="text-sm font-medium text-neutral-900 dark:text-white mb-2">
            {formatXAxis ? formatXAxis(label) : defaultFormatXAxis(label)}
          </p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between space-x-4">
              <span className="text-neutral-600 dark:text-neutral-400">Open:</span>
              <span className="font-medium text-neutral-900 dark:text-white">
                ${data.open.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between space-x-4">
              <span className="text-neutral-600 dark:text-neutral-400">High:</span>
              <span className="font-medium text-neutral-900 dark:text-white">
                ${data.high.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between space-x-4">
              <span className="text-neutral-600 dark:text-neutral-400">Low:</span>
              <span className="font-medium text-neutral-900 dark:text-white">
                ${data.low.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between space-x-4">
              <span className="text-neutral-600 dark:text-neutral-400">Close:</span>
              <span className={`font-medium ${
                data.isBullish 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                ${data.close.toFixed(2)}
              </span>
            </div>
            {data.volume && (
              <div className="flex justify-between space-x-4">
                <span className="text-neutral-600 dark:text-neutral-400">Volume:</span>
                <span className="font-medium text-neutral-900 dark:text-white">
                  {data.volume.toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom candlestick shape component
  const CandlestickShape = (props: any) => {
    const { payload, x, y, width, height } = props;
    if (!payload) return null;

    const candleWidth = Math.max(width * 0.6, 2);
    const candleX = x + (width - candleWidth) / 2;
    const wickX = x + width / 2;
    
    const color = payload.isBullish ? bullishColor : bearishColor;
    
    return (
      <g>
        {/* High-Low wick */}
        <line
          x1={wickX}
          y1={y}
          x2={wickX}
          y2={y + height}
          stroke={color}
          strokeWidth={1}
        />
        
        {/* Open-Close body */}
        <rect
          x={candleX}
          y={payload.isBullish ? y + height - (payload.bodyHeight / (payload.high - payload.low)) * height : y}
          width={candleWidth}
          height={Math.max((payload.bodyHeight / (payload.high - payload.low)) * height, 1)}
          fill={payload.isBullish ? color : color}
          stroke={color}
          strokeWidth={1}
          fillOpacity={payload.isBullish ? 0.8 : 1}
        />
      </g>
    );
  };

  if (!data || data.length === 0) {
    return (
      <BaseChart {...baseProps} error="No data available" />
    );
  }

  return (
    <BaseChart {...baseProps}>
      <ComposedChart 
        data={chartData} 
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
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
          domain={['dataMin - 1', 'dataMax + 1']}
          stroke="currentColor"
          className="text-neutral-600 dark:text-neutral-400"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={formatYAxis || defaultFormatYAxis}
        />
        
        <Tooltip content={<CustomTooltip />} />
        
        {/* Render candlesticks using Bar with custom shape */}
        <Bar 
          dataKey="high"
          shape={<CandlestickShape />}
        >
          {chartData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={entry.isBullish ? bullishColor : bearishColor}
            />
          ))}
        </Bar>
        
        {showBrush && (
          <Brush 
            dataKey={xAxisKey}
            height={30}
            stroke="#8884d8"
            fill="hsl(var(--muted))"
          />
        )}
      </ComposedChart>
    </BaseChart>
  );
}