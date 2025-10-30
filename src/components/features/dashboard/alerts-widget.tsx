'use client';

import { useState } from 'react';
import { AlertTriangle, CheckCircle, Info, X, Bell, BellOff } from 'lucide-react';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';

export interface Alert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  isRead?: boolean;
  actionable?: boolean;
  metadata?: {
    strategyId?: string;
    symbol?: string;
    [key: string]: any;
  };
}

interface AlertsWidgetProps {
  alerts: Alert[];
  onDismiss?: (alertId: string) => void;
  onMarkAsRead?: (alertId: string) => void;
  className?: string;
}

export function AlertsWidget({
  alerts,
  onDismiss,
  onMarkAsRead,
  className,
}: AlertsWidgetProps) {
  const [showAll, setShowAll] = useState(false);

  const unreadAlerts = alerts.filter(alert => !alert.isRead);
  const displayedAlerts = showAll ? alerts : alerts.slice(0, 3);

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'error':
        return AlertTriangle;
      case 'warning':
        return AlertTriangle;
      case 'success':
        return CheckCircle;
      case 'info':
      default:
        return Info;
    }
  };

  const getAlertColor = (type: Alert['type']) => {
    switch (type) {
      case 'error':
        return 'text-danger-600 bg-danger-100 dark:bg-danger-900/20';
      case 'warning':
        return 'text-warning-600 bg-warning-100 dark:bg-warning-900/20';
      case 'success':
        return 'text-success-600 bg-success-100 dark:bg-success-900/20';
      case 'info':
      default:
        return 'text-primary-600 bg-primary-100 dark:bg-primary-900/20';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    return timestamp.toLocaleDateString();
  };

  if (alerts.length === 0) {
    return (
      <div
        className={cn(
          'bg-white dark:bg-neutral-800 p-4 sm:p-6 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700',
          className
        )}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
            Alerts
          </h3>
          <BellOff className="h-5 w-5 text-neutral-400" />
        </div>
        <div className="text-center py-8">
          <Bell className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
          <p className="text-neutral-500 dark:text-neutral-400">
            No alerts at the moment
          </p>
          <p className="text-sm text-neutral-400 dark:text-neutral-500 mt-2">
            You&apos;ll see important notifications here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'bg-white dark:bg-neutral-800 p-4 sm:p-6 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700',
        className
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
          Alerts
        </h3>
        <div className="flex items-center space-x-2">
          {unreadAlerts.length > 0 && (
            <span className="bg-danger-100 text-danger-800 dark:bg-danger-900 dark:text-danger-200 text-xs font-medium px-2 py-1 rounded-full">
              {unreadAlerts.length} new
            </span>
          )}
          <Bell className="h-5 w-5 text-neutral-400" />
        </div>
      </div>

      <div className="space-y-3">
        {displayedAlerts.map((alert) => {
          const Icon = getAlertIcon(alert.type);
          const colorClasses = getAlertColor(alert.type);

          return (
            <div
              key={alert.id}
              className={cn(
                'p-4 rounded-lg border transition-colors',
                alert.isRead
                  ? 'bg-neutral-50 dark:bg-neutral-700/50 border-neutral-200 dark:border-neutral-600'
                  : 'bg-white dark:bg-neutral-700 border-neutral-300 dark:border-neutral-500'
              )}
            >
              <div className="flex items-start space-x-3">
                <div className={cn('w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0', colorClasses)}>
                  <Icon className="h-3 w-3" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className={cn(
                      'text-sm font-medium truncate',
                      alert.isRead 
                        ? 'text-neutral-600 dark:text-neutral-400' 
                        : 'text-neutral-900 dark:text-white'
                    )}>
                      {alert.title}
                    </h4>
                    <div className="flex items-center space-x-1 ml-2">
                      <span className="text-xs text-neutral-500 dark:text-neutral-400 flex-shrink-0">
                        {formatTimestamp(alert.timestamp)}
                      </span>
                      {onDismiss && (
                        <button
                          onClick={() => onDismiss(alert.id)}
                          className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className={cn(
                    'text-sm mt-1',
                    alert.isRead 
                      ? 'text-neutral-500 dark:text-neutral-400' 
                      : 'text-neutral-600 dark:text-neutral-300'
                  )}>
                    {alert.message}
                  </p>

                  {alert.metadata && (
                    <div className="flex items-center space-x-4 mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                      {alert.metadata.symbol && (
                        <span className="font-medium">{alert.metadata.symbol}</span>
                      )}
                      {alert.metadata.strategyId && (
                        <span>Strategy: {alert.metadata.strategyId}</span>
                      )}
                    </div>
                  )}

                  {!alert.isRead && onMarkAsRead && (
                    <button
                      onClick={() => onMarkAsRead(alert.id)}
                      className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 mt-2"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {alerts.length > 3 && (
        <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAll(!showAll)}
            className="w-full"
          >
            {showAll ? 'Show less' : `View all alerts (${alerts.length - 3} more)`}
          </Button>
        </div>
      )}
    </div>
  );
}