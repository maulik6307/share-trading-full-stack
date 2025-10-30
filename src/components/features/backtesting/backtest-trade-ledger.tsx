'use client';

import { useState, useMemo } from 'react';
import { Search, Filter, ArrowUpDown, TrendingUp, TrendingDown, Download } from 'lucide-react';
import { Input, Select, Button } from '@/components/ui';
import { Trade } from '@/types/trading';
import { cn } from '@/lib/utils';
import { exportTradesToCSV } from '@/lib/utils/export-utils';

interface BacktestTradeLedgerProps {
  trades: Trade[];
  title?: string;
  className?: string;
  showExportButton?: boolean;
}

type SortField = 'executedAt' | 'symbol' | 'side' | 'quantity' | 'price' | 'pnl' | 'commission';
type SortDirection = 'asc' | 'desc';
type FilterSide = 'all' | 'BUY' | 'SELL';
type FilterPnL = 'all' | 'winners' | 'losers';

export function BacktestTradeLedger({
  trades,
  title = 'Trade Ledger',
  className,
  showExportButton = true,
}: BacktestTradeLedgerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('executedAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filterSide, setFilterSide] = useState<FilterSide>('all');
  const [filterPnL, setFilterPnL] = useState<FilterPnL>('all');
  const [showFilters, setShowFilters] = useState(false);

  const filteredAndSortedTrades = useMemo(() => {
    const filtered = trades.filter(trade => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
        trade.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trade.id.toLowerCase().includes(searchTerm.toLowerCase());

      // Side filter
      const matchesSide = filterSide === 'all' || trade.side === filterSide;

      // P&L filter
      const matchesPnL = filterPnL === 'all' || 
        (filterPnL === 'winners' && trade.pnl > 0) ||
        (filterPnL === 'losers' && trade.pnl < 0);

      return matchesSearch && matchesSide && matchesPnL;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (sortField === 'executedAt') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [trades, searchTerm, sortField, sortDirection, filterSide, filterPnL]);

  const tradeStats = useMemo(() => {
    const winners = trades.filter(t => t.pnl > 0);
    const losers = trades.filter(t => t.pnl < 0);
    const totalPnL = trades.reduce((sum, t) => sum + t.pnl, 0);
    const totalCommission = trades.reduce((sum, t) => sum + t.commission, 0);

    return {
      total: trades.length,
      winners: winners.length,
      losers: losers.length,
      winRate: trades.length > 0 ? (winners.length / trades.length) * 100 : 0,
      totalPnL,
      totalCommission,
      avgWin: winners.length > 0 ? winners.reduce((sum, t) => sum + t.pnl, 0) / winners.length : 0,
      avgLoss: losers.length > 0 ? losers.reduce((sum, t) => sum + t.pnl, 0) / losers.length : 0,
      largestWin: winners.length > 0 ? Math.max(...winners.map(t => t.pnl)) : 0,
      largestLoss: losers.length > 0 ? Math.min(...losers.map(t => t.pnl)) : 0,
    };
  }, [trades]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleExportCSV = () => {
    const tradesToExport = filteredAndSortedTrades.length > 0 ? filteredAndSortedTrades : trades;
    exportTradesToCSV(tradesToExport, {
      filename: `trade-ledger-${new Date().toISOString().split('T')[0]}.csv`
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center space-x-1 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
    >
      <span>{children}</span>
      <ArrowUpDown className="h-3 w-3" />
    </button>
  );

  if (!trades || trades.length === 0) {
    return (
      <div className={cn(
        'bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700',
        className
      )}>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
          {title}
        </h3>
        <div className="flex items-center justify-center h-32 text-neutral-500 dark:text-neutral-400">
          No trades to display
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      'bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700',
      className
    )}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
            {title}
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            {filteredAndSortedTrades.length} of {trades.length} trades
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {showExportButton && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Export CSV</span>
            </Button>
          )}
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

      {/* Trade Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6 p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
        <div className="text-center">
          <p className="text-xs text-neutral-600 dark:text-neutral-400">Total Trades</p>
          <p className="text-lg font-semibold text-neutral-900 dark:text-white">
            {tradeStats.total}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-neutral-600 dark:text-neutral-400">Win Rate</p>
          <p className="text-lg font-semibold text-green-600 dark:text-green-400">
            {tradeStats.winRate.toFixed(1)}%
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-neutral-600 dark:text-neutral-400">Total P&L</p>
          <p className={`text-lg font-semibold ${
            tradeStats.totalPnL >= 0 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-red-600 dark:text-red-400'
          }`}>
            {formatCurrency(tradeStats.totalPnL)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-neutral-600 dark:text-neutral-400">Avg Win</p>
          <p className="text-lg font-semibold text-green-600 dark:text-green-400">
            {formatCurrency(tradeStats.avgWin)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-neutral-600 dark:text-neutral-400">Avg Loss</p>
          <p className="text-lg font-semibold text-red-600 dark:text-red-400">
            {formatCurrency(tradeStats.avgLoss)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-neutral-600 dark:text-neutral-400">Commission</p>
          <p className="text-lg font-semibold text-neutral-900 dark:text-white">
            {formatCurrency(tradeStats.totalCommission)}
          </p>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <Input
              placeholder="Search by symbol or trade ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select
            value={filterSide}
            onChange={(e) => setFilterSide(e.target.value as FilterSide)}
            options={[
              { value: 'all', label: 'All Sides' },
              { value: 'BUY', label: 'Buy Only' },
              { value: 'SELL', label: 'Sell Only' },
            ]}
          />
          
          <Select
            value={filterPnL}
            onChange={(e) => setFilterPnL(e.target.value as FilterPnL)}
            options={[
              { value: 'all', label: 'All Trades' },
              { value: 'winners', label: 'Winners Only' },
              { value: 'losers', label: 'Losers Only' },
            ]}
          />
        </div>
      )}

      {/* Trade Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-200 dark:border-neutral-700">
              <th className="text-left py-3 px-2 text-sm font-medium text-neutral-600 dark:text-neutral-400">
                <SortButton field="executedAt">Date</SortButton>
              </th>
              <th className="text-left py-3 px-2 text-sm font-medium text-neutral-600 dark:text-neutral-400">
                <SortButton field="symbol">Symbol</SortButton>
              </th>
              <th className="text-left py-3 px-2 text-sm font-medium text-neutral-600 dark:text-neutral-400">
                <SortButton field="side">Side</SortButton>
              </th>
              <th className="text-right py-3 px-2 text-sm font-medium text-neutral-600 dark:text-neutral-400">
                <SortButton field="quantity">Quantity</SortButton>
              </th>
              <th className="text-right py-3 px-2 text-sm font-medium text-neutral-600 dark:text-neutral-400">
                <SortButton field="price">Price</SortButton>
              </th>
              <th className="text-right py-3 px-2 text-sm font-medium text-neutral-600 dark:text-neutral-400">
                <SortButton field="pnl">P&L</SortButton>
              </th>
              <th className="text-right py-3 px-2 text-sm font-medium text-neutral-600 dark:text-neutral-400">
                <SortButton field="commission">Commission</SortButton>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedTrades.map((trade, index) => (
              <tr 
                key={trade.id}
                className={cn(
                  'border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors',
                  index % 2 === 0 ? 'bg-white dark:bg-neutral-800' : 'bg-neutral-50 dark:bg-neutral-900'
                )}
              >
                <td className="py-3 px-2 text-sm text-neutral-900 dark:text-white">
                  {formatDateTime(trade.executedAt)}
                </td>
                <td className="py-3 px-2 text-sm font-medium text-neutral-900 dark:text-white">
                  {trade.symbol}
                </td>
                <td className="py-3 px-2">
                  <span className={cn(
                    'inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium',
                    trade.side === 'BUY' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  )}>
                    {trade.side === 'BUY' ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    <span>{trade.side}</span>
                  </span>
                </td>
                <td className="py-3 px-2 text-sm text-right text-neutral-900 dark:text-white">
                  {trade.quantity.toLocaleString()}
                </td>
                <td className="py-3 px-2 text-sm text-right text-neutral-900 dark:text-white">
                  {formatCurrency(trade.price)}
                </td>
                <td className="py-3 px-2 text-sm text-right">
                  <span className={cn(
                    'font-medium',
                    trade.pnl >= 0 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  )}>
                    {formatCurrency(trade.pnl)}
                  </span>
                </td>
                <td className="py-3 px-2 text-sm text-right text-neutral-600 dark:text-neutral-400">
                  {formatCurrency(trade.commission)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredAndSortedTrades.length === 0 && (
        <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
          No trades match the current filters
        </div>
      )}
    </div>
  );
}