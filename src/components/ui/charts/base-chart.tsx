'use client';

import { ReactNode } from 'react';
import { ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';

export interface BaseChartProps {
  children?: ReactNode;
  title?: string;
  subtitle?: string;
  height?: number;
  className?: string;
  loading?: boolean;
  error?: string;
  actions?: ReactNode;
}

export function BaseChart({
  children,
  title,
  subtitle,
  height = 400,
  className,
  loading = false,
  error,
  actions,
}: BaseChartProps) {
  if (loading) {
    return (
      <div className={cn(
        'bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700',
        className
      )}>
        {title && (
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                {title}
              </h3>
              {subtitle && (
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {subtitle}
                </p>
              )}
            </div>
            {actions}
          </div>
        )}
        <div 
          className="flex items-center justify-center bg-neutral-50 dark:bg-neutral-900 rounded-lg"
          style={{ height }}
        >
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn(
        'bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700',
        className
      )}>
        {title && (
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                {title}
              </h3>
              {subtitle && (
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {subtitle}
                </p>
              )}
            </div>
            {actions}
          </div>
        )}
        <div 
          className="flex items-center justify-center bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400"
          style={{ height }}
        >
          <div className="text-center">
            <p className="font-medium">Error loading chart</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      'bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700',
      className
    )}>
      {title && (
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
              {title}
            </h3>
            {subtitle && (
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {subtitle}
              </p>
            )}
          </div>
          {actions}
        </div>
      )}
      
      <div style={{ height }} className="w-full">
        {children ? (
          <ResponsiveContainer width="100%" height="100%">
            {children as React.ReactElement}
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-neutral-500 dark:text-neutral-400">
            No chart content
          </div>
        )}
      </div>
    </div>
  );
}