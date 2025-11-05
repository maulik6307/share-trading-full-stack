'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  // Pause, // Unused
  Square, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui';
import { Backtest } from '@/lib/api/backtesting';
import { cn } from '@/lib/utils';

interface BacktestProgressProps {
  backtest: Backtest;
  onCancel?: (backtestId: string) => void;
  onViewResults?: (backtestId: string) => void;
  className?: string;
}

export function BacktestProgress({
  backtest,
  onCancel,
  onViewResults,
  className,
}: BacktestProgressProps) {
  const [elapsedTime, setElapsedTime] = useState(0);

  // Update elapsed time for running backtests
  useEffect(() => {
    if (backtest.status === 'RUNNING' && backtest.startedAt) {
      const interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - new Date(backtest.startedAt!).getTime()) / 1000);
        setElapsedTime(elapsed);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [backtest.status, backtest.startedAt]);

  const getStatusIcon = () => {
    switch (backtest.status) {
      case 'PENDING':
        return <Clock className="h-5 w-5 text-neutral-500" />;
      case 'RUNNING':
        return <Play className="h-5 w-5 text-primary-500" />;
      case 'COMPLETED':
        return <CheckCircle className="h-5 w-5 text-success-500" />;
      case 'FAILED':
        return <XCircle className="h-5 w-5 text-danger-500" />;
      case 'CANCELLED':
        return <Square className="h-5 w-5 text-neutral-500" />;
      default:
        return <Clock className="h-5 w-5 text-neutral-500" />;
    }
  };

  const getStatusColor = () => {
    switch (backtest.status) {
      case 'PENDING':
        return 'text-neutral-600 dark:text-neutral-400';
      case 'RUNNING':
        return 'text-primary-600 dark:text-primary-400';
      case 'COMPLETED':
        return 'text-success-600 dark:text-success-400';
      case 'FAILED':
        return 'text-danger-600 dark:text-danger-400';
      case 'CANCELLED':
        return 'text-neutral-600 dark:text-neutral-400';
      default:
        return 'text-neutral-600 dark:text-neutral-400';
    }
  };

  const getProgressBarColor = () => {
    switch (backtest.status) {
      case 'RUNNING':
        return 'bg-primary-500';
      case 'COMPLETED':
        return 'bg-success-500';
      case 'FAILED':
        return 'bg-danger-500';
      case 'CANCELLED':
        return 'bg-neutral-500';
      default:
        return 'bg-neutral-300';
    }
  };

  const formatElapsedTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDuration = () => {
    if (backtest.startedAt && backtest.completedAt) {
      const duration = Math.floor((new Date(backtest.completedAt).getTime() - new Date(backtest.startedAt).getTime()) / 1000);
      return formatElapsedTime(duration);
    }
    if (backtest.status === 'RUNNING' && backtest.startedAt) {
      return formatElapsedTime(elapsedTime);
    }
    return null;
  };

  const getEstimatedTimeRemaining = () => {
    if (backtest.status !== 'RUNNING' || backtest.progress <= 0) return null;
    
    const elapsed = elapsedTime;
    const estimated = (elapsed / backtest.progress) * 100;
    const remaining = Math.max(0, estimated - elapsed);
    
    return formatElapsedTime(Math.floor(remaining));
  };

  return (
    <div className={cn(
      'bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-4',
      className
    )}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            {getStatusIcon()}
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white truncate">
                {backtest.name}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                <span className={cn('text-sm font-medium', getStatusColor())}>
                  {backtest.status.charAt(0) + backtest.status.slice(1).toLowerCase()}
                </span>
                {formatDuration() && (
                  <>
                    <span className="text-neutral-400">•</span>
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">
                      {formatDuration()}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {backtest.status === 'RUNNING' && onCancel && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCancel(backtest._id)}
                className="flex items-center space-x-1"
              >
                <Square className="h-3 w-3" />
                <span>Cancel</span>
              </Button>
            )}
            
            {backtest.status === 'COMPLETED' && onViewResults && (
              <Button
                size="sm"
                onClick={() => onViewResults(backtest._id)}
                className="flex items-center space-x-1"
              >
                <BarChart3 className="h-3 w-3" />
                <span>View Results</span>
              </Button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-600 dark:text-neutral-400">
              Progress: {backtest.progress}%
            </span>
            {getEstimatedTimeRemaining() && (
              <span className="text-neutral-600 dark:text-neutral-400">
                ~{getEstimatedTimeRemaining()} remaining
              </span>
            )}
          </div>
          
          <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
            <motion.div
              className={cn('h-2 rounded-full transition-all duration-300', getProgressBarColor())}
              initial={{ width: 0 }}
              animate={{ width: `${backtest.progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-neutral-500 dark:text-neutral-400">Period</span>
            <div className="font-medium text-neutral-900 dark:text-white">
              {new Date(backtest.startDate).toLocaleDateString()} - {new Date(backtest.endDate).toLocaleDateString()}
            </div>
          </div>
          
          <div>
            <span className="text-neutral-500 dark:text-neutral-400">Capital</span>
            <div className="font-medium text-neutral-900 dark:text-white">
              ${backtest.initialCapital.toLocaleString()}
            </div>
          </div>
          
          <div>
            <span className="text-neutral-500 dark:text-neutral-400">Commission</span>
            <div className="font-medium text-neutral-900 dark:text-white">
              ${backtest.commission}
            </div>
          </div>
          
          <div>
            <span className="text-neutral-500 dark:text-neutral-400">Slippage</span>
            <div className="font-medium text-neutral-900 dark:text-white">
              {backtest.slippage}%
            </div>
          </div>
        </div>

        {/* Error Message */}
        {backtest.status === 'FAILED' && backtest.errorMessage && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-lg p-3"
          >
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-4 w-4 text-danger-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-danger-800 dark:text-danger-200">
                  Backtest Failed
                </h4>
                <p className="text-sm text-danger-700 dark:text-danger-300 mt-1">
                  {backtest.errorMessage}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Timestamps */}
        <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 pt-2 border-t border-neutral-200 dark:border-neutral-700">
          <span>
            Created: {new Date(backtest.createdAt).toLocaleString()}
          </span>
          {backtest.completedAt && (
            <span>
              Completed: {new Date(backtest.completedAt).toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}