'use client';

import { ReactNode } from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPIWidgetProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    period: string;
    isPositive?: boolean;
  };
  icon?: LucideIcon;
  description?: string;
  className?: string;
  children?: ReactNode;
}

export function KPIWidget({
  title,
  value,
  change,
  icon: Icon,
  description,
  className,
  children,
}: KPIWidgetProps) {
  return (
    <div
      className={cn(
        'bg-white dark:bg-neutral-800 p-4 sm:p-6 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700',
        className
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
          {title}
        </h3>
        {Icon && (
          <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
            <Icon className="h-4 w-4 text-primary-600 dark:text-primary-400" />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>

        {change && (
          <div className="flex items-center space-x-1">
            {change.isPositive !== false ? (
              <TrendingUp className="h-4 w-4 text-success-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-danger-600" />
            )}
            <span
              className={cn(
                'text-sm font-medium',
                change.isPositive !== false ? 'text-success-600' : 'text-danger-600'
              )}
            >
              {change.value > 0 ? '+' : ''}{change.value}%
            </span>
            <span className="text-sm text-neutral-500 dark:text-neutral-400">
              {change.period}
            </span>
          </div>
        )}

        {description && (
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            {description}
          </p>
        )}

        {children}
      </div>
    </div>
  );
}