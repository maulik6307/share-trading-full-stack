'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  Play, 
  Pause, 
  Square, 
  Trash2, 
  Filter,
  Search,
  BarChart3,
  AlertCircle
} from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { BacktestProgress } from './backtest-progress';
import { Backtest, BacktestStatus } from '@/types/trading';
import { cn } from '@/lib/utils';

interface BacktestQueueProps {
  backtests: Backtest[];
  onCancel?: (backtestId: string) => void;
  onDelete?: (backtestId: string) => void;
  onViewResults?: (backtestId: string) => void;
  onRetry?: (backtestId: string) => void;
  className?: string;
}

type StatusFilter = 'all' | BacktestStatus;

export function BacktestQueue({
  backtests,
  onCancel,
  onDelete,
  onViewResults,
  onRetry,
  className,
}: BacktestQueueProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Filter and sort backtests
  const filteredBacktests = useMemo(() => {
    const filtered = backtests.filter(backtest => {
      const matchesSearch = backtest.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || backtest.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    // Sort by creation date (newest first), but prioritize running backtests
    filtered.sort((a, b) => {
      if (a.status === 'RUNNING' && b.status !== 'RUNNING') return -1;
      if (b.status === 'RUNNING' && a.status !== 'RUNNING') return 1;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

    return filtered;
  }, [backtests, searchQuery, statusFilter]);

  // Get status counts
  const statusCounts = useMemo(() => {
    const counts = {
      all: backtests.length,
      PENDING: 0,
      RUNNING: 0,
      COMPLETED: 0,
      FAILED: 0,
      CANCELLED: 0,
    };

    backtests.forEach(backtest => {
      counts[backtest.status]++;
    });

    return counts;
  }, [backtests]);

  const getStatusIcon = (status: BacktestStatus) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4" />;
      case 'RUNNING':
        return <Play className="h-4 w-4" />;
      case 'COMPLETED':
        return <BarChart3 className="h-4 w-4" />;
      case 'FAILED':
        return <AlertCircle className="h-4 w-4" />;
      case 'CANCELLED':
        return <Square className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: BacktestStatus) => {
    switch (status) {
      case 'PENDING':
        return 'text-neutral-600';
      case 'RUNNING':
        return 'text-primary-600';
      case 'COMPLETED':
        return 'text-success-600';
      case 'FAILED':
        return 'text-danger-600';
      case 'CANCELLED':
        return 'text-neutral-600';
      default:
        return 'text-neutral-600';
    }
  };

  const handleBulkAction = (action: 'cancel' | 'delete', status?: BacktestStatus) => {
    const targetBacktests = status 
      ? backtests.filter(b => b.status === status)
      : filteredBacktests;

    if (action === 'cancel' && onCancel) {
      targetBacktests
        .filter(b => b.status === 'RUNNING' || b.status === 'PENDING')
        .forEach(b => onCancel(b.id));
    } else if (action === 'delete' && onDelete) {
      targetBacktests
        .filter(b => b.status === 'COMPLETED' || b.status === 'FAILED' || b.status === 'CANCELLED')
        .forEach(b => onDelete(b.id));
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
            Backtest Queue
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Monitor and manage your backtest executions
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2"
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </Button>
        </div>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries(statusCounts).map(([status, count]) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status as StatusFilter)}
            className={cn(
              'p-3 border rounded-lg text-left transition-colors',
              statusFilter === status
                ? 'border-primary-300 bg-primary-50 dark:border-primary-600 dark:bg-primary-900/20'
                : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
            )}
          >
            <div className="flex items-center space-x-2 mb-1">
              {status !== 'all' && (
                <span className={getStatusColor(status as BacktestStatus)}>
                  {getStatusIcon(status as BacktestStatus)}
                </span>
              )}
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {status === 'all' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
              </span>
            </div>
            <div className="text-2xl font-bold text-neutral-900 dark:text-white">
              {count}
            </div>
          </button>
        ))}
      </div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-4"
          >
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <Input
                    placeholder="Search backtests..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {statusCounts.RUNNING > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('cancel', 'RUNNING')}
                    className="flex items-center space-x-1"
                  >
                    <Square className="h-3 w-3" />
                    <span>Cancel Running</span>
                  </Button>
                )}
                
                {(statusCounts.COMPLETED + statusCounts.FAILED + statusCounts.CANCELLED) > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('delete')}
                    className="flex items-center space-x-1 text-danger-600 hover:text-danger-700"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>Clear Finished</span>
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backtest List */}
      {filteredBacktests.length > 0 ? (
        <div className="space-y-4">
          <AnimatePresence>
            {filteredBacktests.map((backtest) => (
              <motion.div
                key={backtest.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <BacktestProgress
                  backtest={backtest}
                  onCancel={onCancel}
                  onViewResults={onViewResults}
                />
                
                {/* Additional Actions */}
                <div className="flex items-center justify-end space-x-2 mt-2">
                  {backtest.status === 'FAILED' && onRetry && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRetry(backtest.id)}
                      className="flex items-center space-x-1"
                    >
                      <Play className="h-3 w-3" />
                      <span>Retry</span>
                    </Button>
                  )}
                  
                  {(backtest.status === 'COMPLETED' || backtest.status === 'FAILED' || backtest.status === 'CANCELLED') && onDelete && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(backtest.id)}
                      className="flex items-center space-x-1 text-danger-600 hover:text-danger-700"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>Delete</span>
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="h-8 w-8 text-neutral-400" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
            {searchQuery || statusFilter !== 'all' ? 'No backtests found' : 'No backtests yet'}
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400">
            {searchQuery || statusFilter !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Start your first backtest to see results here'
            }
          </p>
        </div>
      )}
    </div>
  );
}