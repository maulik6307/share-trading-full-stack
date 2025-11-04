'use client';

import { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  TrendingUp, 
  TrendingDown, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowUpDown
} from 'lucide-react';
import { Input, Select, Button } from '@/components/ui';
import { Order, OrderStatus, OrderSide, OrderType } from '@/types/trading';
import { cn } from '@/lib/utils';
import { formatSafeDate } from '@/lib/utils/date-transform';

interface OrderHistoryProps {
  orders: Order[];
  onExportCSV?: () => void;
  className?: string;
}

type SortField = 'createdAt' | 'symbol' | 'side' | 'type' | 'quantity' | 'price' | 'status';
type SortDirection = 'asc' | 'desc';

export function OrderHistory({ orders, onExportCSV, className }: OrderHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'ALL'>('ALL');
  const [sideFilter, setSideFilter] = useState<OrderSide | 'ALL'>('ALL');
  const [typeFilter, setTypeFilter] = useState<OrderType | 'ALL'>('ALL');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [showFilters, setShowFilters] = useState(false);

  const filteredAndSortedOrders = useMemo(() => {
    const filtered = orders.filter(order => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
        order.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.tags && order.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));

      // Status filter
      const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;

      // Side filter
      const matchesSide = sideFilter === 'ALL' || order.side === sideFilter;

      // Type filter
      const matchesType = typeFilter === 'ALL' || order.type === typeFilter;

      return matchesSearch && matchesStatus && matchesSide && matchesType;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (sortField === 'createdAt') {
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
  }, [orders, searchTerm, statusFilter, sideFilter, typeFilter, sortField, sortDirection]);

  const orderStats = useMemo(() => {
    const total = orders.length;
    const filled = orders.filter(o => o.status === 'FILLED').length;
    const pending = orders.filter(o => o.status === 'PENDING').length;
    const cancelled = orders.filter(o => o.status === 'CANCELLED').length;
    const rejected = orders.filter(o => o.status === 'REJECTED').length;
    const partiallyFilled = orders.filter(o => o.status === 'PARTIALLY_FILLED').length;

    const fillRate = total > 0 ? ((filled + partiallyFilled) / total) * 100 : 0;

    return {
      total,
      filled,
      pending,
      cancelled,
      rejected,
      partiallyFilled,
      fillRate,
    };
  }, [orders]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatDateTime = (date: Date | string) => {
    return formatSafeDate(date, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'FILLED':
        return <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />;
      case 'CANCELLED':
        return <XCircle className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />;
      case 'REJECTED':
        return <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />;
      case 'PENDING':
        return <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
      case 'PARTIALLY_FILLED':
        return <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />;
      default:
        return <Clock className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />;
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'FILLED':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900';
      case 'CANCELLED':
        return 'text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-900';
      case 'REJECTED':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900';
      case 'PENDING':
        return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900';
      case 'PARTIALLY_FILLED':
        return 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900';
      default:
        return 'text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-900';
    }
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

  return (
    <div className={cn(
      'bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700',
      className
    )}>
      {/* Header */}
      <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Order History
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {filteredAndSortedOrders.length} of {orders.length} orders
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {onExportCSV && (
              <Button
                variant="outline"
                size="sm"
                onClick={onExportCSV}
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

        {/* Order Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6 p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
          <div className="text-center">
            <p className="text-xs text-neutral-600 dark:text-neutral-400">Total</p>
            <p className="text-lg font-semibold text-neutral-900 dark:text-white">
              {orderStats.total}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-neutral-600 dark:text-neutral-400">Filled</p>
            <p className="text-lg font-semibold text-green-600 dark:text-green-400">
              {orderStats.filled}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-neutral-600 dark:text-neutral-400">Pending</p>
            <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
              {orderStats.pending}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-neutral-600 dark:text-neutral-400">Partial</p>
            <p className="text-lg font-semibold text-orange-600 dark:text-orange-400">
              {orderStats.partiallyFilled}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-neutral-600 dark:text-neutral-400">Cancelled</p>
            <p className="text-lg font-semibold text-neutral-600 dark:text-neutral-400">
              {orderStats.cancelled}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-neutral-600 dark:text-neutral-400">Fill Rate</p>
            <p className="text-lg font-semibold text-neutral-900 dark:text-white">
              {orderStats.fillRate.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'ALL')}
              options={[
                { value: 'ALL', label: 'All Status' },
                { value: 'PENDING', label: 'Pending' },
                { value: 'FILLED', label: 'Filled' },
                { value: 'PARTIALLY_FILLED', label: 'Partially Filled' },
                { value: 'CANCELLED', label: 'Cancelled' },
                { value: 'REJECTED', label: 'Rejected' },
              ]}
            />
            
            <Select
              value={sideFilter}
              onChange={(e) => setSideFilter(e.target.value as OrderSide | 'ALL')}
              options={[
                { value: 'ALL', label: 'All Sides' },
                { value: 'BUY', label: 'Buy Only' },
                { value: 'SELL', label: 'Sell Only' },
              ]}
            />
            
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as OrderType | 'ALL')}
              options={[
                { value: 'ALL', label: 'All Types' },
                { value: 'MARKET', label: 'Market' },
                { value: 'LIMIT', label: 'Limit' },
                { value: 'STOP', label: 'Stop' },
                { value: 'STOP_LIMIT', label: 'Stop Limit' },
              ]}
            />
          </div>
        )}
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-200 dark:border-neutral-700">
              <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600 dark:text-neutral-400">
                <SortButton field="createdAt">Date</SortButton>
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600 dark:text-neutral-400">
                <SortButton field="symbol">Symbol</SortButton>
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600 dark:text-neutral-400">
                <SortButton field="side">Side</SortButton>
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600 dark:text-neutral-400">
                <SortButton field="type">Type</SortButton>
              </th>
              <th className="text-right py-3 px-4 text-sm font-medium text-neutral-600 dark:text-neutral-400">
                <SortButton field="quantity">Quantity</SortButton>
              </th>
              <th className="text-right py-3 px-4 text-sm font-medium text-neutral-600 dark:text-neutral-400">
                <SortButton field="price">Price</SortButton>
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600 dark:text-neutral-400">
                <SortButton field="status">Status</SortButton>
              </th>
              <th className="text-right py-3 px-4 text-sm font-medium text-neutral-600 dark:text-neutral-400">
                Value
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedOrders.map((order, index) => (
              <tr 
                key={order.id}
                className={cn(
                  'border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors',
                  index % 2 === 0 ? 'bg-white dark:bg-neutral-800' : 'bg-neutral-50 dark:bg-neutral-900'
                )}
              >
                <td className="py-3 px-4 text-sm text-neutral-900 dark:text-white">
                  {formatDateTime(order.createdAt)}
                </td>
                <td className="py-3 px-4 text-sm font-medium text-neutral-900 dark:text-white">
                  {order.symbol}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-2">
                    {order.side === 'BUY' ? (
                      <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                    )}
                    <span className={cn(
                      'text-sm font-medium',
                      order.side === 'BUY' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    )}>
                      {order.side}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-neutral-900 dark:text-white">
                  {order.type}
                </td>
                <td className="py-3 px-4 text-sm text-right text-neutral-900 dark:text-white">
                  <div>
                    {order.filledQuantity > 0 ? (
                      <div>
                        <div className="font-medium">{order.filledQuantity.toLocaleString()}</div>
                        <div className="text-xs text-neutral-600 dark:text-neutral-400">
                          of {order.quantity.toLocaleString()}
                        </div>
                      </div>
                    ) : (
                      order.quantity.toLocaleString()
                    )}
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-right text-neutral-900 dark:text-white">
                  <div>
                    {order.price ? formatCurrency(order.price) : 'Market'}
                    {order.avgFillPrice && order.avgFillPrice !== order.price && (
                      <div className="text-xs text-neutral-600 dark:text-neutral-400">
                        Avg: {formatCurrency(order.avgFillPrice)}
                      </div>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(order.status)}
                    <span className={cn(
                      'px-2 py-1 rounded-full text-xs font-medium',
                      getStatusColor(order.status)
                    )}>
                      {order.status.replace('_', ' ')}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-right text-neutral-900 dark:text-white">
                  {order.price ? formatCurrency(order.price * order.quantity) : 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredAndSortedOrders.length === 0 && (
        <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
          <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No orders match the current filters</p>
        </div>
      )}
    </div>
  );
}