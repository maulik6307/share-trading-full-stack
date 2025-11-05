'use client';

import { useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Play, 
  Pause, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  DollarSign
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ActivityItem {
  _id?: string; // API format
  id?: string; // Legacy format
  type: 'trade' | 'strategy' | 'alert' | 'system' | 'deposit' | 'withdrawal';
  title: string;
  description: string;
  timestamp: Date | string;
  status?: 'success' | 'warning' | 'error' | 'info' | 'pending';
  symbol?: string;
  amount?: number;
  metadata?: {
    amount?: number;
    symbol?: string;
    strategyName?: string;
    [key: string]: any;
  };
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  maxItems?: number;
  className?: string;
}

export function ActivityFeed({ 
  activities, 
  maxItems = 10, 
  className 
}: ActivityFeedProps) {
  const displayedActivities = useMemo(() => {
    return activities
      .sort((a, b) => {
        const aTime = typeof a.timestamp === 'string' ? new Date(a.timestamp).getTime() : a.timestamp.getTime();
        const bTime = typeof b.timestamp === 'string' ? new Date(b.timestamp).getTime() : b.timestamp.getTime();
        return bTime - aTime;
      })
      .slice(0, maxItems);
  }, [activities, maxItems]);

  const getActivityIcon = (item: ActivityItem) => {
    switch (item.type) {
      case 'trade':
        const amount = item.amount || item.metadata?.amount;
        return amount && amount > 0 ? TrendingUp : TrendingDown;
      case 'strategy':
        return item.status === 'success' ? Play : Pause;
      case 'alert':
        return AlertTriangle;
      case 'system':
        return CheckCircle;
      case 'deposit':
        return TrendingUp;
      case 'withdrawal':
        return TrendingDown;
      default:
        return Clock;
    }
  };

  const getActivityColor = (item: ActivityItem) => {
    switch (item.status) {
      case 'success':
        return 'text-success-600 bg-success-100 dark:bg-success-900/20';
      case 'warning':
        return 'text-warning-600 bg-warning-100 dark:bg-warning-900/20';
      case 'error':
        return 'text-danger-600 bg-danger-100 dark:bg-danger-900/20';
      default:
        return 'text-primary-600 bg-primary-100 dark:bg-primary-900/20';
    }
  };

  const formatTimestamp = (timestamp: Date | string) => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };

  if (displayedActivities.length === 0) {
    return (
      <div
        className={cn(
          'bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700',
          className
        )}
      >
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
          Recent Activity
        </h3>
        <div className="text-center py-8">
          <Clock className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
          <p className="text-neutral-500 dark:text-neutral-400">
            No recent activity to display
          </p>
          <p className="text-sm text-neutral-400 dark:text-neutral-500 mt-2">
            Start trading or create strategies to see activity here
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
      <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
        Recent Activity
      </h3>

      <div className="space-y-4">
        {displayedActivities.map((activity) => {
          const Icon = getActivityIcon(activity);
          const colorClasses = getActivityColor(activity);

          return (
            <div key={activity._id || activity.id} className="flex items-start space-x-3">
              <div className={cn('w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0', colorClasses)}>
                <Icon className="h-4 w-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                    {activity.title}
                  </p>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400 flex-shrink-0 ml-2">
                    {formatTimestamp(activity.timestamp)}
                  </span>
                </div>

                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                  {activity.description}
                </p>

                {(activity.symbol || activity.amount || activity.metadata) && (
                  <div className="flex items-center space-x-4 mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                    {(activity.symbol || activity.metadata?.symbol) && (
                      <span className="font-medium">{activity.symbol || activity.metadata?.symbol}</span>
                    )}
                    {(activity.amount || activity.metadata?.amount) && (
                      <span className="flex items-center">
                        <DollarSign className="h-3 w-3 mr-1" />
                        {Math.abs(activity.amount || activity.metadata?.amount || 0).toLocaleString()}
                      </span>
                    )}
                    {activity.metadata?.strategyName && (
                      <span>{activity.metadata.strategyName}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {activities.length > maxItems && (
        <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
          <button className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium">
            View all activity ({activities.length - maxItems} more)
          </button>
        </div>
      )}
    </div>
  );
}