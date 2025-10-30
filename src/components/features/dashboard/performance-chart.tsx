'use client';

import { useMemo } from 'react';
import { LineChart } from '@/components/ui/charts';

interface PerformanceDataPoint {
  date: string;
  value: number;
  benchmark?: number;
}

interface PerformanceChartProps {
  data: PerformanceDataPoint[];
  title?: string;
  height?: number;
  showBenchmark?: boolean;
  className?: string;
}

export function PerformanceChart({
  data,
  title = 'Portfolio Performance',
  height = 300,
  showBenchmark = false,
  className,
}: PerformanceChartProps) {
  const chartData = useMemo(() => {
    return data.map(point => ({
      timestamp: new Date(point.date),
      value: point.value,
      benchmark: point.benchmark,
    }));
  }, [data]);

  const formatYAxis = (value: number) => {
    return `${(value / 1000).toFixed(0)}k`;
  };

  const formatTooltip = (value: number, name: string, props: any): [string, string] => {
    return [`$${value.toLocaleString()}`, 'Portfolio Value'];
  };

  return (
    <LineChart
      data={chartData}
      title={title}
      height={height}
      className={className}
      color="#0ea5e9"
      strokeWidth={2}
      showGrid={true}
      formatYAxis={formatYAxis}
      formatTooltip={formatTooltip}
    />
  );
}