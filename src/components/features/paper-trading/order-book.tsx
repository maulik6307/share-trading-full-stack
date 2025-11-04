'use client';

import { useState, useMemo, memo } from 'react';
import { TrendingUp, TrendingDown, Clock, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui';
import { Order, OrderStatus } from '@/types/trading';
import { cn } from '@/lib/utils';
import { formatSafeDate } from '@/lib/utils/date-transform';

interface OrderBookProps {
  orders: Order[];
  onCancelOrder: (orderId: string) => void;
  onModifyOrder: (orderId: string) => void;
  className?: string;
}

interface OrderBookEntry {
  price: number;
  quantity: number;
  side: 'BUY' | 'SELL';
  orders: Order[];
}

const OrderBookComponent = function OrderBook({ orders, onCancelOrder, onModifyOrder, className }: OrderBookProps) {
  const [selectedSymbol, setSelectedSymbol] = useState<string>('');
  const [showAllOrders, setShowAllOrders] = useState(false);

  // Get unique symbols from orders
  const symbols = useMemo(() => {
    const symbolSet = new Set(orders.map(order => order.symbol));
    return Array.from(symbolSet).sort();
  }, [orders]);

  // Filter orders by selected symbol and active status
  const filteredOrders = useMemo(() => {
    let filtered = orders.filter(order => 
      ['PENDING', 'PARTIALLY_FILLED'].includes(order.status)
    );

    if (selectedSymbol) {
      filtered = filtered.filter(order => order.symbol === selectedSymbol);
    }

    return filtered;
  }, [orders, selectedSymbol]);

  // Group orders by price level for order book view
  const orderBookData = useMemo(() => {
    if (!selectedSymbol) return { buyOrders: [], sellOrders: [] };

    const symbolOrders = filteredOrders.filter(order => order.symbol === selectedSymbol);
    
    const buyOrdersMap = new Map<number, OrderBookEntry>();
    const sellOrdersMap = new Map<number, OrderBookEntry>();

    symbolOrders.forEach(order => {
      const price = order.price || 0;
      const map = order.side === 'BUY' ? buyOrdersMap : sellOrdersMap;
      
      if (map.has(price)) {
        const entry = map.get(price)!;
        entry.quantity += order.remainingQuantity;
        entry.orders.push(order);
      } else {
        map.set(price, {
          price,
          quantity: order.remainingQuantity,
          side: order.side,
          orders: [order]
        });
      }
    });

    const buyOrders = Array.from(buyOrdersMap.values()).sort((a, b) => b.price - a.price);
    const sellOrders = Array.from(sellOrdersMap.values()).sort((a, b) => a.price - b.price);

    return { buyOrders, sellOrders };
  }, [filteredOrders, selectedSymbol]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatTime = (date: Date | string) => {
    return formatSafeDate(date, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900';
      case 'PARTIALLY_FILLED':
        return 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900';
      case 'FILLED':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900';
      case 'CANCELLED':
        return 'text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-900';
      case 'REJECTED':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900';
      default:
        return 'text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-900';
    }
  };

  const OrderBookTable = ({ entries, side }: { entries: OrderBookEntry[], side: 'BUY' | 'SELL' }) => (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs font-medium text-neutral-600 dark:text-neutral-400 px-2 py-1">
        <span>Price</span>
        <span>Quantity</span>
        <span>Orders</span>
      </div>
      {entries.slice(0, 10).map((entry, index) => (
        <div
          key={`${entry.price}-${index}`}
          className={cn(
            'flex items-center justify-between px-2 py-1 rounded text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer',
            side === 'BUY' ? 'border-l-2 border-green-500' : 'border-l-2 border-red-500'
          )}
        >
          <span className={cn(
            'font-medium',
            side === 'BUY' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          )}>
            ₹{entry.price.toFixed(2)}
          </span>
          <span className="text-neutral-900 dark:text-white">
            {entry.quantity.toLocaleString()}
          </span>
          <span className="text-neutral-600 dark:text-neutral-400">
            {entry.orders.length}
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <div className={cn(
      'bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700',
      className
    )}>
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
            Order Book
          </h3>
          <div className="flex items-center space-x-2">
            <Button
              variant={showAllOrders ? 'outline' : 'primary'}
              size="sm"
              onClick={() => setShowAllOrders(!showAllOrders)}
            >
              {showAllOrders ? 'Book View' : 'All Orders'}
            </Button>
          </div>
        </div>

        {/* Symbol Filter */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-neutral-600 dark:text-neutral-400">Symbol:</span>
          <select
            value={selectedSymbol}
            onChange={(e) => setSelectedSymbol(e.target.value)}
            className="px-3 py-1 text-sm border border-neutral-200 dark:border-neutral-700 rounded bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
          >
            <option value="">All Symbols</option>
            {symbols.map(symbol => (
              <option key={symbol} value={symbol}>{symbol}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="p-4">
        {!showAllOrders && selectedSymbol ? (
          // Order Book View (grouped by price levels)
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sell Orders */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                <h4 className="font-medium text-neutral-900 dark:text-white">Sell Orders</h4>
              </div>
              <OrderBookTable entries={orderBookData.sellOrders} side="SELL" />
            </div>

            {/* Buy Orders */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                <h4 className="font-medium text-neutral-900 dark:text-white">Buy Orders</h4>
              </div>
              <OrderBookTable entries={orderBookData.buyOrders} side="BUY" />
            </div>
          </div>
        ) : (
          // All Orders View (individual orders)
          <div className="space-y-3">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No active orders</p>
                <p className="text-sm">Place an order to see it here</p>
              </div>
            ) : (
              filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={cn(
                        'p-1 rounded',
                        order.side === 'BUY' ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'
                      )}>
                        {order.side === 'BUY' ? (
                          <TrendingUp className="h-3 w-3 text-green-600 dark:text-green-400" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-red-600 dark:text-red-400" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-neutral-900 dark:text-white">
                            {order.symbol}
                          </span>
                          <span className={cn(
                            'px-2 py-1 rounded-full text-xs font-medium',
                            getStatusColor(order.status)
                          )}>
                            {order.status.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="text-sm text-neutral-600 dark:text-neutral-400">
                          {order.type} • {formatTime(order.createdAt)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {(order.status === 'PENDING' || order.status === 'PARTIALLY_FILLED') && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onModifyOrder(order.id)}
                            className="text-xs"
                          >
                            Modify
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onCancelOrder(order.id)}
                            className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          >
                            Cancel
                          </Button>
                        </>
                      )}
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-neutral-600 dark:text-neutral-400">Quantity:</span>
                      <div className="font-medium text-neutral-900 dark:text-white">
                        {order.remainingQuantity.toLocaleString()} / {order.quantity.toLocaleString()}
                      </div>
                    </div>
                    
                    {order.price && (
                      <div>
                        <span className="text-neutral-600 dark:text-neutral-400">Price:</span>
                        <div className="font-medium text-neutral-900 dark:text-white">
                          {formatCurrency(order.price)}
                        </div>
                      </div>
                    )}
                    
                    {order.stopPrice && (
                      <div>
                        <span className="text-neutral-600 dark:text-neutral-400">Stop Price:</span>
                        <div className="font-medium text-neutral-900 dark:text-white">
                          {formatCurrency(order.stopPrice)}
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <span className="text-neutral-600 dark:text-neutral-400">Value:</span>
                      <div className="font-medium text-neutral-900 dark:text-white">
                        {formatCurrency((order.price || 0) * order.remainingQuantity)}
                      </div>
                    </div>
                  </div>

                  {order.status === 'PARTIALLY_FILLED' && (
                    <div className="mt-3 p-2 bg-orange-50 dark:bg-orange-900/20 rounded text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-orange-800 dark:text-orange-200">
                          Filled: {order.filledQuantity.toLocaleString()} @ {formatCurrency(order.avgFillPrice || 0)}
                        </span>
                        <span className="text-orange-600 dark:text-orange-400">
                          {((order.filledQuantity / order.quantity) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  )}

                  {order.rejectionReason && (
                    <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 rounded text-sm">
                      <span className="text-red-800 dark:text-red-200">
                        Rejected: {order.rejectionReason}
                      </span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export const OrderBook = memo(OrderBookComponent);