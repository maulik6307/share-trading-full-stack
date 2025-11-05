'use client';

import { useState, useMemo, memo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  MoreHorizontal,
  X,
  AlertTriangle,
  Target
} from 'lucide-react';
import { Button } from '@/components/ui';
import { useToast } from '@/components/ui';
import { Position, MarketData } from '@/types/trading';
import { formatSafeNumber, formatSafeCurrency } from '@/lib/utils/date-transform';
import { cn } from '@/lib/utils';

interface PositionsDashboardProps {
  positions: Position[];
  marketData: MarketData[];
  onClosePosition: (positionId: string, quantity?: number) => void;
  onSetStopLoss: (positionId: string, stopPrice: number) => void;
  onSetTakeProfit: (positionId: string, targetPrice: number) => void;
  className?: string;
}

const PositionsDashboardComponent = function PositionsDashboard({ 
  positions, 
  marketData, 
  onClosePosition, 
  onSetStopLoss, 
  onSetTakeProfit,
  className 
}: PositionsDashboardProps) {
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null);
  const [showRiskControls, setShowRiskControls] = useState<string | null>(null);
  const { addToast } = useToast();

  // Calculate portfolio totals
  const portfolioStats = useMemo(() => {
    const totalValue = positions.reduce((sum, pos) => sum + Math.abs(pos.marketValue), 0);
    const totalPnL = positions.reduce((sum, pos) => sum + pos.totalPnL, 0);
    const totalUnrealizedPnL = positions.reduce((sum, pos) => sum + pos.unrealizedPnL, 0);
    const totalRealizedPnL = positions.reduce((sum, pos) => sum + pos.realizedPnL, 0);
    const dayPnL = positions.reduce((sum, pos) => sum + pos.dayPnL, 0);
    
    const totalPnLPercent = totalValue > 0 ? (totalPnL / totalValue) * 100 : 0;
    const dayPnLPercent = totalValue > 0 ? (dayPnL / totalValue) * 100 : 0;

    return {
      totalValue,
      totalPnL,
      totalUnrealizedPnL,
      totalRealizedPnL,
      dayPnL,
      totalPnLPercent,
      dayPnLPercent,
      positionCount: positions.length,
      longPositions: positions.filter(p => p.side === 'LONG').length,
      shortPositions: positions.filter(p => p.side === 'SHORT').length,
    };
  }, [positions]);

  // Get current market price for a position
  const getCurrentPrice = (symbol: string): number => {
    const data = marketData.find(d => d.symbol === symbol);
    return data?.price || 0;
  };

  // Calculate position metrics with current market data
  const getPositionMetrics = (position: Position) => {
    const currentPrice = getCurrentPrice(position.symbol);
    const priceDiff = currentPrice - position.avgPrice;
    const unrealizedPnL = position.quantity * priceDiff;
    const unrealizedPnLPercent = position.avgPrice > 0 ? (priceDiff / position.avgPrice) * 100 : 0;
    
    return {
      currentPrice,
      unrealizedPnL,
      unrealizedPnLPercent,
      marketValue: Math.abs(position.quantity * currentPrice),
    };
  };

  const handleClosePosition = (positionId: string, percentage: number = 100) => {
    const position = positions.find(p => p.id === positionId);
    if (!position) return;

    const quantityToClose = Math.floor(Math.abs(position.quantity) * (percentage / 100));
    onClosePosition(positionId, quantityToClose);
    
    addToast({
      type: 'success',
      title: 'Position Closed',
      description: `${percentage}% of ${position.symbol} position has been closed.`
    });
  };

  const handleSetStopLoss = (positionId: string) => {
    const position = positions.find(p => p.id === positionId);
    if (!position) return;

    // Set stop loss at 5% below current price for long positions, 5% above for short
    const currentPrice = getCurrentPrice(position.symbol);
    const stopPrice = position.side === 'LONG' 
      ? currentPrice * 0.95 
      : currentPrice * 1.05;
    
    onSetStopLoss(positionId, stopPrice);
    
    addToast({
      type: 'info',
      title: 'Stop Loss Set',
      description: `Stop loss set at ${formatSafeCurrency(stopPrice)} for ${position.symbol}.`
    });
  };

  const handleSetTakeProfit = (positionId: string) => {
    const position = positions.find(p => p.id === positionId);
    if (!position) return;

    // Set take profit at 10% above current price for long positions, 10% below for short
    const currentPrice = getCurrentPrice(position.symbol);
    const targetPrice = position.side === 'LONG' 
      ? currentPrice * 1.10 
      : currentPrice * 0.90;
    
    onSetTakeProfit(positionId, targetPrice);
    
    addToast({
      type: 'info',
      title: 'Take Profit Set',
      description: `Take profit set at ${formatSafeCurrency(targetPrice)} for ${position.symbol}.`
    });
  };

  const formatCurrency = (value: number | undefined | null) => {
    return formatSafeCurrency(value);
  };

  const formatPercent = (value: number | undefined | null) => {
    const safeValue = formatSafeNumber(value, 2);
    const numValue = value || 0;
    return `${numValue >= 0 ? '+' : ''}${safeValue}%`;
  };

  if (positions.length === 0) {
    return (
      <div className={cn(
        'bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-8 text-center',
        className
      )}>
        <DollarSign className="h-12 w-12 mx-auto mb-4 text-neutral-400" />
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
          No Open Positions
        </h3>
        <p className="text-neutral-600 dark:text-neutral-400">
          Place some orders to start building your portfolio
        </p>
      </div>
    );
  }

  return (
    <div className={cn(
      'bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700',
      className
    )}>
      {/* Portfolio Summary */}
      <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
            Positions Portfolio
          </h3>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            {portfolioStats.positionCount} positions
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="text-center">
            <p className="text-xs text-neutral-600 dark:text-neutral-400">Total Value</p>
            <p className="text-lg font-semibold text-neutral-900 dark:text-white">
              {formatCurrency(portfolioStats.totalValue)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-neutral-600 dark:text-neutral-400">Total P&L</p>
            <p className={cn(
              'text-lg font-semibold',
              portfolioStats.totalPnL >= 0 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            )}>
              {formatCurrency(portfolioStats.totalPnL)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-neutral-600 dark:text-neutral-400">Day P&L</p>
            <p className={cn(
              'text-lg font-semibold',
              portfolioStats.dayPnL >= 0 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            )}>
              {formatCurrency(portfolioStats.dayPnL)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-neutral-600 dark:text-neutral-400">Unrealized</p>
            <p className={cn(
              'text-lg font-semibold',
              portfolioStats.totalUnrealizedPnL >= 0 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            )}>
              {formatCurrency(portfolioStats.totalUnrealizedPnL)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-neutral-600 dark:text-neutral-400">Long/Short</p>
            <p className="text-lg font-semibold text-neutral-900 dark:text-white">
              {portfolioStats.longPositions}/{portfolioStats.shortPositions}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-neutral-600 dark:text-neutral-400">Return %</p>
            <p className={cn(
              'text-lg font-semibold',
              portfolioStats.totalPnLPercent >= 0 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            )}>
              {formatPercent(portfolioStats.totalPnLPercent)}
            </p>
          </div>
        </div>
      </div>

      {/* Positions List */}
      <div className="p-6">
        <div className="space-y-4">
          {positions.map((position) => {
            const metrics = getPositionMetrics(position);
            const isSelected = selectedPosition === position.id;
            const showControls = showRiskControls === position.id;

            return (
              <div
                key={position.id}
                className={cn(
                  'p-4 rounded-lg border transition-all',
                  isSelected 
                    ? 'border-primary-300 bg-primary-50 dark:border-primary-600 dark:bg-primary-900/20'
                    : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                )}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={cn(
                      'p-2 rounded-lg',
                      position.side === 'LONG' 
                        ? 'bg-green-100 dark:bg-green-900' 
                        : 'bg-red-100 dark:bg-red-900'
                    )}>
                      {position.side === 'LONG' ? (
                        <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold text-neutral-900 dark:text-white">
                          {position.symbol}
                        </h4>
                        <span className={cn(
                          'px-2 py-1 rounded-full text-xs font-medium',
                          position.side === 'LONG' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        )}>
                          {position.side}
                        </span>
                      </div>
                      <div className="text-sm text-neutral-600 dark:text-neutral-400">
                        {Math.abs(position.quantity || 0)} shares @ {formatSafeCurrency(position.avgPrice)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowRiskControls(showControls ? null : position.id)}
                    >
                      <Target className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedPosition(isSelected ? null : position.id)}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Position Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                  <div>
                    <span className="text-xs text-neutral-600 dark:text-neutral-400">Current Price</span>
                    <div className="font-medium text-neutral-900 dark:text-white">
                      {formatSafeCurrency(metrics.currentPrice)}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-neutral-600 dark:text-neutral-400">Market Value</span>
                    <div className="font-medium text-neutral-900 dark:text-white">
                      {formatCurrency(metrics.marketValue)}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-neutral-600 dark:text-neutral-400">Unrealized P&L</span>
                    <div className={cn(
                      'font-medium',
                      metrics.unrealizedPnL >= 0 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    )}>
                      {formatCurrency(metrics.unrealizedPnL)}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-neutral-600 dark:text-neutral-400">Return %</span>
                    <div className={cn(
                      'font-medium',
                      metrics.unrealizedPnLPercent >= 0 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    )}>
                      {formatPercent(metrics.unrealizedPnLPercent)}
                    </div>
                  </div>
                </div>

                {/* Risk Controls */}
                {showControls && (
                  <div className="mt-4 p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                    <h5 className="text-sm font-medium text-neutral-900 dark:text-white mb-3">
                      Risk Management
                    </h5>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetStopLoss(position.id)}
                        className="flex items-center space-x-1"
                      >
                        <AlertTriangle className="h-3 w-3" />
                        <span>Set Stop Loss</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetTakeProfit(position.id)}
                        className="flex items-center space-x-1"
                      >
                        <Target className="h-3 w-3" />
                        <span>Set Take Profit</span>
                      </Button>
                    </div>
                  </div>
                )}

                {/* Position Actions */}
                {isSelected && (
                  <div className="mt-4 p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                    <h5 className="text-sm font-medium text-neutral-900 dark:text-white mb-3">
                      Position Actions
                    </h5>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleClosePosition(position.id, 25)}
                      >
                        Close 25%
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleClosePosition(position.id, 50)}
                      >
                        Close 50%
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleClosePosition(position.id, 75)}
                      >
                        Close 75%
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleClosePosition(position.id, 100)}
                        className="flex items-center space-x-1"
                      >
                        <X className="h-3 w-3" />
                        <span>Close All</span>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export const PositionsDashboard = memo(PositionsDashboardComponent);