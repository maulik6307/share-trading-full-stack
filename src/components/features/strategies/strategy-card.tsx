'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  Pause, 
  Square, 
  Edit, 
  Copy, 
  Trash2, 
  MoreVertical,
  TrendingUp,
  TrendingDown,
  Activity,
  Calendar,
  Tag
} from 'lucide-react';
import { Strategy } from '@/types/trading';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';

interface StrategyCardProps {
  strategy: Strategy;
  onEdit?: (strategy: Strategy) => void;
  onClone?: (strategy: Strategy) => void;
  onDelete?: (strategy: Strategy) => void;
  onDeploy?: (strategy: Strategy) => void;
  onPause?: (strategy: Strategy) => void;
  onStop?: (strategy: Strategy) => void;
  className?: string;
}

export function StrategyCard({
  strategy,
  onEdit,
  onClone,
  onDelete,
  onDeploy,
  onPause,
  onStop,
  className,
}: StrategyCardProps) {
  const [showActions, setShowActions] = useState(false);

  const getStatusColor = (status: Strategy['status']) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-success-100 text-success-800 dark:bg-success-900/20 dark:text-success-400';
      case 'PAUSED':
        return 'bg-warning-100 text-warning-800 dark:bg-warning-900/20 dark:text-warning-400';
      case 'STOPPED':
        return 'bg-danger-100 text-danger-800 dark:bg-danger-900/20 dark:text-danger-400';
      case 'DRAFT':
        return 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-400';
      default:
        return 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-400';
    }
  };

  const getTypeIcon = (type: Strategy['type']) => {
    switch (type) {
      case 'TEMPLATE':
        return '📋';
      case 'CODE':
        return '💻';
      case 'VISUAL':
        return '🎨';
      default:
        return '📊';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const handleAction = (action: string) => {
    setShowActions(false);
    switch (action) {
      case 'edit':
        onEdit?.(strategy);
        break;
      case 'clone':
        onClone?.(strategy);
        break;
      case 'delete':
        onDelete?.(strategy);
        break;
      case 'deploy':
        onDeploy?.(strategy);
        break;
      case 'pause':
        onPause?.(strategy);
        break;
      case 'stop':
        onStop?.(strategy);
        break;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 hover:shadow-md transition-shadow',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-lg">{getTypeIcon(strategy.type)}</span>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white truncate">
              {strategy.name}
            </h3>
            <span className={cn(
              'px-2 py-1 text-xs font-medium rounded-full',
              getStatusColor(strategy.status)
            )}>
              {strategy.status}
            </span>
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">
            {strategy.description}
          </p>
        </div>

        {/* Actions Menu */}
        <div className="relative ml-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowActions(!showActions)}
            className="p-2"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>

          {showActions && (
            <div className="absolute right-0 top-8 w-48 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg z-10">
              <div className="p-1">
                <button
                  onClick={() => handleAction('edit')}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-md"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleAction('clone')}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-md"
                >
                  <Copy className="h-4 w-4" />
                  <span>Clone</span>
                </button>
                <hr className="my-1 border-neutral-200 dark:border-neutral-700" />
                {strategy.status === 'DRAFT' && (
                  <button
                    onClick={() => handleAction('deploy')}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-success-600 dark:text-success-400 hover:bg-success-50 dark:hover:bg-success-900/20 rounded-md"
                  >
                    <Play className="h-4 w-4" />
                    <span>Deploy</span>
                  </button>
                )}
                {strategy.status === 'ACTIVE' && (
                  <button
                    onClick={() => handleAction('pause')}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-warning-600 dark:text-warning-400 hover:bg-warning-50 dark:hover:bg-warning-900/20 rounded-md"
                  >
                    <Pause className="h-4 w-4" />
                    <span>Pause</span>
                  </button>
                )}
                {(strategy.status === 'ACTIVE' || strategy.status === 'PAUSED') && (
                  <button
                    onClick={() => handleAction('stop')}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-danger-600 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-900/20 rounded-md"
                  >
                    <Square className="h-4 w-4" />
                    <span>Stop</span>
                  </button>
                )}
                <hr className="my-1 border-neutral-200 dark:border-neutral-700" />
                <button
                  onClick={() => handleAction('delete')}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-danger-600 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-900/20 rounded-md"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Performance Metrics */}
      {strategy.performance && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-1">
              {strategy.performance.totalReturn >= 0 ? (
                <TrendingUp className="h-4 w-4 text-success-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-danger-600" />
              )}
              <span className="text-xs text-neutral-500 dark:text-neutral-400">Total Return</span>
            </div>
            <div className={cn(
              'text-sm font-semibold',
              strategy.performance.totalReturn >= 0 ? 'text-success-600' : 'text-danger-600'
            )}>
              {formatCurrency(strategy.performance.totalReturn)}
            </div>
            <div className={cn(
              'text-xs',
              strategy.performance.totalReturnPercent >= 0 ? 'text-success-600' : 'text-danger-600'
            )}>
              {formatPercentage(strategy.performance.totalReturnPercent)}
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center space-x-1">
              <Activity className="h-4 w-4 text-neutral-500" />
              <span className="text-xs text-neutral-500 dark:text-neutral-400">Win Rate</span>
            </div>
            <div className="text-sm font-semibold text-neutral-900 dark:text-white">
              {formatPercentage(strategy.performance.winRate * 100)}
            </div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400">
              {strategy.performance.totalTrades} trades
            </div>
          </div>
        </div>
      )}

      {/* Tags */}
      {strategy.tags && strategy.tags.length > 0 && (
        <div className="flex items-center space-x-1 mb-4">
          <Tag className="h-3 w-3 text-neutral-400" />
          <div className="flex flex-wrap gap-1">
            {strategy.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 text-xs bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 rounded"
              >
                {tag}
              </span>
            ))}
            {strategy.tags.length > 3 && (
              <span className="px-2 py-1 text-xs bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 rounded">
                +{strategy.tags.length - 3}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
        <div className="flex items-center space-x-1">
          <Calendar className="h-3 w-3" />
          <span>Updated {strategy.updatedAt.toLocaleDateString()}</span>
        </div>
        {strategy.deployedAt && (
          <div className="flex items-center space-x-1">
            <Play className="h-3 w-3" />
            <span>Deployed {strategy.deployedAt.toLocaleDateString()}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}