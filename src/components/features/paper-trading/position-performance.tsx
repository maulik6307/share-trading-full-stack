'use client';

import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Calendar, Download } from 'lucide-react';
import { Button } from '@/components/ui';
import { Position, Portfolio } from '@/types/trading';
import { PositionHistory } from '@/mocks/services/position-service';
import { cn } from '@/lib/utils';

interface PositionPerformanceProps {
  positions: Position[];
  portfolio: Portfolio;
  positionHistory: PositionHistory[];
  onExportData: () => void;
  className?: string;
}

interface PerformanceMetrics {
  totalReturn: number;
  totalReturnPercent: number;
  dayReturn: number;
  dayReturnPercent: number;
  winRate: number;
  avgWin: number;
  avgLoss: number;
  largestWin: number;
  largestLoss: number;
  totalTrades: number;
}

export function PositionPerformance({ 
  positions, 
  portfolio, 
  positionHistory, 
  onExportData,
  className 
}: PositionPerformanceProps) {
  // Calculate performance metrics
  const performanceMetrics = useMemo((): PerformanceMetrics => {
    const closedTrades = positionHistory.filter(h => 
      h.action === 'CLOSE' || h.action === 'PARTIAL_CLOSE' || h.action === 'STOP_LOSS' || h.action === 'TAKE_PROFIT'
    );
    
    const winningTrades = closedTrades.filter(t => t.pnl > 0);
    const losingTrades = closedTrades.filter(t => t.pnl < 0);
    
    const totalReturn = portfolio.totalPnL;
    const totalReturnPercent = portfolio.totalPnLPercent;
    const dayReturn = portfolio.dayPnL;
    const dayReturnPercent = portfolio.dayPnLPercent;
    
    const winRate = closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0;
    const avgWin = winningTrades.length > 0 ? winningTrades.reduce((sum, t) => sum + t.pnl, 0) / winningTrades.length : 0;
    const avgLoss = losingTrades.length > 0 ? losingTrades.reduce((sum, t) => sum + t.pnl, 0) / losingTrades.length : 0;
    const largestWin = winningTrades.length > 0 ? Math.max(...winningTrades.map(t => t.pnl)) : 0;
    const largestLoss = losingTrades.length > 0 ? Math.min(...losingTrades.map(t => t.pnl)) : 0;
    
    return {
      totalReturn,
      totalReturnPercent,
      dayReturn,
      dayReturnPercent,
      winRate,
      avgWin,
      avgLoss,
      largestWin,
      largestLoss,
      totalTrades: closedTrades.length,
    };
  }, [positions, portfolio, positionHistory]);

  // Prepare P&L chart data
  const pnlChartData = useMemo(() => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return date;
    });

    return last30Days.map(date => {
      // Simulate historical P&L data
      const dayOffset = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
      const baseReturn = portfolio.totalPnL * (1 - dayOffset * 0.02);
      const randomVariation = (Math.random() - 0.5) * baseReturn * 0.1;
      
      return {
        date: date.toISOString().split('T')[0],
        pnl: baseReturn + randomVariation,
        cumulative: baseReturn + randomVariation,
      };
    });
  }, [portfolio.totalPnL]);

  // Prepare sector allocation data
  const sectorAllocation = useMemo(() => {
    const sectorMap = new Map<string, number>();
    
    positions.forEach(position => {
      // Mock sector mapping
      const sectorMapping: Record<string, string> = {
        'RELIANCE': 'Oil & Gas',
        'TCS': 'IT',
        'HDFCBANK': 'Banking',
        'ICICIBANK': 'Banking',
        'KOTAKBANK': 'Banking',
        'INFY': 'IT',
        'HINDUNILVR': 'FMCG',
        'ITC': 'FMCG',
        'SBIN': 'Banking',
        'BHARTIARTL': 'Telecom',
      };
      
      const sector = sectorMapping[position.symbol] || 'Others';
      const value = Math.abs(position.marketValue);
      sectorMap.set(sector, (sectorMap.get(sector) || 0) + value);
    });

    return Array.from(sectorMap.entries()).map(([sector, value]) => ({
      sector,
      value,
      percentage: (value / portfolio.totalValue) * 100,
    }));
  }, [positions, portfolio.totalValue]);

  // Prepare position size distribution
  const positionSizes = useMemo(() => {
    return positions.map(position => ({
      symbol: position.symbol,
      value: Math.abs(position.marketValue),
      percentage: (Math.abs(position.marketValue) / portfolio.totalValue) * 100,
      pnl: position.totalPnL,
    })).sort((a, b) => b.value - a.value);
  }, [positions, portfolio.totalValue]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatPercent = (value: number | undefined | null) => {
    if (value === null || value === undefined || isNaN(value)) {
      return '0.00%';
    }
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];

  return (
    <div className={cn('space-y-6', className)}>
      {/* Performance Summary */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
            Performance Overview
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={onExportData}
            className="flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Export Data</span>
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <DollarSign className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">Total Return</p>
            <p className={cn(
              'text-lg font-semibold',
              performanceMetrics.totalReturn >= 0 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            )}>
              {formatCurrency(performanceMetrics.totalReturn)}
            </p>
            <p className={cn(
              'text-sm',
              performanceMetrics.totalReturnPercent >= 0 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            )}>
              {formatPercent(performanceMetrics.totalReturnPercent)}
            </p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Calendar className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">Day Return</p>
            <p className={cn(
              'text-lg font-semibold',
              performanceMetrics.dayReturn >= 0 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            )}>
              {formatCurrency(performanceMetrics.dayReturn)}
            </p>
            <p className={cn(
              'text-sm',
              performanceMetrics.dayReturnPercent >= 0 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            )}>
              {formatPercent(performanceMetrics.dayReturnPercent)}
            </p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">Win Rate</p>
            <p className="text-lg font-semibold text-neutral-900 dark:text-white">
              {performanceMetrics.winRate ? performanceMetrics.winRate.toFixed(1) : '0.0'}%
            </p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {performanceMetrics.totalTrades} trades
            </p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">Avg Win</p>
            <p className="text-lg font-semibold text-green-600 dark:text-green-400">
              {formatCurrency(performanceMetrics.avgWin)}
            </p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Best: {formatCurrency(performanceMetrics.largestWin)}
            </p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">Avg Loss</p>
            <p className="text-lg font-semibold text-red-600 dark:text-red-400">
              {formatCurrency(performanceMetrics.avgLoss)}
            </p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Worst: {formatCurrency(performanceMetrics.largestLoss)}
            </p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <DollarSign className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">Portfolio Value</p>
            <p className="text-lg font-semibold text-neutral-900 dark:text-white">
              {formatCurrency(portfolio.totalValue)}
            </p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Cash: {formatCurrency(portfolio.cash)}
            </p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* P&L Chart */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
          <h4 className="text-md font-semibold text-neutral-900 dark:text-white mb-4">
            P&L Trend (30 Days)
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={pnlChartData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
                />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), 'P&L']}
                  labelFormatter={(label) => new Date(label).toLocaleDateString('en-IN')}
                />
                <Line 
                  type="monotone" 
                  dataKey="pnl" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sector Allocation */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
          <h4 className="text-md font-semibold text-neutral-900 dark:text-white mb-4">
            Sector Allocation
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sectorAllocation}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ sector, percentage }) => `${sector} (${percentage ? percentage.toFixed(1) : '0.0'}%)`}
                >
                  {sectorAllocation.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Position Sizes */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
        <h4 className="text-md font-semibold text-neutral-900 dark:text-white mb-4">
          Position Sizes
        </h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={positionSizes}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="symbol" tick={{ fontSize: 12 }} />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
              />
              <Tooltip 
                formatter={(value: number, name: string) => {
                  if (name === 'value') return [formatCurrency(value), 'Market Value'];
                  if (name === 'pnl') return [formatCurrency(value), 'P&L'];
                  return [value, name];
                }}
              />
              <Bar dataKey="value" fill="#3B82F6" />
              <Bar dataKey="pnl" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
        <h4 className="text-md font-semibold text-neutral-900 dark:text-white mb-4">
          Recent Position Activity
        </h4>
        <div className="space-y-3">
          {positionHistory.slice(0, 10).map((activity) => (
            <div key={activity.id} className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={cn(
                  'p-2 rounded-lg',
                  activity.action === 'OPEN' ? 'bg-blue-100 dark:bg-blue-900' :
                  activity.action === 'CLOSE' ? 'bg-red-100 dark:bg-red-900' :
                  activity.action === 'PARTIAL_CLOSE' ? 'bg-yellow-100 dark:bg-yellow-900' :
                  activity.action === 'STOP_LOSS' ? 'bg-red-100 dark:bg-red-900' :
                  'bg-green-100 dark:bg-green-900'
                )}>
                  {activity.pnl >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                  )}
                </div>
                <div>
                  <div className="font-medium text-neutral-900 dark:text-white">
                    {activity.action.replace('_', ' ')} - {activity.quantity} shares
                  </div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400">
                    {activity.timestamp.toLocaleDateString('en-IN')} at ₹{activity.price ? activity.price.toFixed(2) : '0.00'}
                    {activity.reason && ` - ${activity.reason}`}
                  </div>
                </div>
              </div>
              <div className={cn(
                'font-medium',
                activity.pnl >= 0 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              )}>
                {formatCurrency(activity.pnl)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}