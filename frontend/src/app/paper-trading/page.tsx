'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { MainLayout } from '@/components/layout';
import { useAuthStore } from '@/stores/auth-store';
import { useToast, Modal, Button, Input } from '@/components/ui';
import { OrderEntryForm, OrderBook, OrderHistory, PositionsDashboard, PositionPerformance, MarketWatchlist, PriceTicker, MarketDataChart, PriceAlerts, PaperTradingSessionsManager, PerformanceMonitor, type PaperTradingSession } from '@/components/features/paper-trading';
import { useTrading } from '@/hooks/use-trading';
import { useMarketData } from '@/hooks/use-market-data';
import { Order } from '@/types/trading';

export default function PaperTradingPage() {
  const { user } = useAuthStore();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<'entry' | 'book' | 'history' | 'positions' | 'performance' | 'watchlist' | 'alerts' | 'deployment' | 'monitor'>('entry');
  const [selectedSymbol, setSelectedSymbol] = useState<string>('RELIANCE');
  const [paperTradingSessions, setPaperTradingSessions] = useState<PaperTradingSession[]>([]);
  const [modifyOrderModal, setModifyOrderModal] = useState<{ isOpen: boolean; order: Order | null }>({ isOpen: false, order: null });

  // Use real trading APIs - memoized to prevent unnecessary re-renders
  const {
    portfolio,
    positions,
    orders,
    activeOrders,
    loading: tradingLoading,
    placeOrder,
    cancelOrder,
    modifyOrder,
    closePosition,
    setStopLoss,
    setTakeProfit,
    exportOrders,
    exportPositions
  } = useTrading();

  // Use real market data - memoized symbols array
  const watchlistSymbols = useMemo(() => ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK', 'HINDUNILVR', 'ITC', 'SBIN', 'BHARTIARTL', 'KOTAKBANK'], []);
  const { marketData, loading: marketDataLoading } = useMarketData(watchlistSymbols);

  // Memoize symbols for OrderEntryForm to prevent re-renders
  const symbolsForOrderForm = useMemo(() =>
    watchlistSymbols.map(symbol => ({
      symbol,
      name: symbol,
      exchange: 'NSE',
      sector: 'Technology',
      currency: 'INR',
      lotSize: 1,
      tickSize: 0.05,
      isActive: true
    })), [watchlistSymbols]
  );

  // Memoize event handlers to prevent unnecessary re-renders
  const handlePlaceOrder = useCallback(async (orderData: Omit<Order, 'id' | 'status' | 'filledQuantity' | 'remainingQuantity' | 'commission' | 'createdAt' | 'updatedAt'>) => {
    try {
      await placeOrder(orderData);
    } catch (error) {
      // Error handling is done in the hook
    }
  }, [placeOrder]);

  const handleCancelOrder = useCallback(async (orderId: string) => {
    try {
      await cancelOrder(orderId);
    } catch (error) {
      // Error handling is done in the hook
    }
  }, [cancelOrder]);

  const handleModifyOrder = useCallback((orderId: string) => {
    const order = activeOrders?.find(o => o.id === orderId);
    if (order) {
      setModifyOrderModal({ isOpen: true, order });
    }
  }, [activeOrders]);

  const handleModifyOrderSubmit = useCallback(async (mods: { price?: number; quantity?: number; stopPrice?: number }) => {
    if (!modifyOrderModal.order) return;

    try {
      await modifyOrder(modifyOrderModal.order.id, mods);
      setModifyOrderModal({ isOpen: false, order: null });
    } catch (error) {
      // Error handling is done in the hook
    }
  }, [modifyOrder, modifyOrderModal.order]);

  const handleClosePosition = useCallback(async (positionId: string, quantity?: number) => {
    try {
      await closePosition(positionId, quantity);
    } catch (error) {
      // Error handling is done in the hook
    }
  }, [closePosition]);

  const handleSetStopLoss = useCallback(async (positionId: string, stopPrice: number) => {
    try {
      await setStopLoss(positionId, stopPrice);
    } catch (error) {
      // Error handling is done in the hook
    }
  }, [setStopLoss]);

  const handleSetTakeProfit = useCallback(async (positionId: string, targetPrice: number) => {
    try {
      await setTakeProfit(positionId, targetPrice);
    } catch (error) {
      // Error handling is done in the hook
    }
  }, [setTakeProfit]);

  if (!user) {
    return null;
  }

  if (tradingLoading || marketDataLoading) {
    return (
      <MainLayout user={user}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-neutral-600 dark:text-neutral-400">Loading trading data...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
            Paper Trading Console
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Place orders and manage your paper trading portfolio
          </p>
        </div>

        {/* Price Ticker */}
        <PriceTicker
          symbols={watchlistSymbols}
          marketData={marketData}
          speed="medium"
        />

        {/* Navigation Tabs */}
        <div className="border-b border-neutral-200 dark:border-neutral-700">
          <nav className="flex space-x-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('entry')}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === 'entry'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300'
                }`}
            >
              Order Entry
            </button>
            <button
              onClick={() => setActiveTab('book')}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === 'book'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300'
                }`}
            >
              Order Book
              {activeOrders && activeOrders.length > 0 && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
                  {activeOrders.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === 'history'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300'
                }`}
            >
              Order History
            </button>
            <button
              onClick={() => setActiveTab('positions')}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === 'positions'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300'
                }`}
            >
              Positions
              {positions && positions.length > 0 && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
                  {positions.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('performance')}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === 'performance'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300'
                }`}
            >
              Performance
            </button>
            <button
              onClick={() => setActiveTab('watchlist')}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === 'watchlist'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300'
                }`}
            >
              Market Data
            </button>
            <button
              onClick={() => setActiveTab('alerts')}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === 'alerts'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300'
                }`}
            >
              Alerts
            </button>
            <button
              onClick={() => setActiveTab('deployment')}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === 'deployment'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300'
                }`}
            >
              Strategy Deployment
              {paperTradingSessions.filter(s => s.status === 'RUNNING').length > 0 && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  {paperTradingSessions.filter(s => s.status === 'RUNNING').length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('monitor')}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === 'monitor'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300'
                }`}
            >
              Performance Monitor
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="min-h-[600px]">
          {activeTab === 'entry' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <OrderEntryForm
                  symbols={symbolsForOrderForm}
                  marketData={marketData}
                  onPlaceOrder={handlePlaceOrder}
                />
              </div>
              <div className="lg:col-span-2">
                <OrderBook
                  orders={activeOrders || []}
                  onCancelOrder={handleCancelOrder}
                  onModifyOrder={handleModifyOrder}
                />
              </div>
            </div>
          )}

          {activeTab === 'book' && (
            <OrderBook
              orders={activeOrders || []}
              onCancelOrder={handleCancelOrder}
              onModifyOrder={handleModifyOrder}
            />
          )}

          {activeTab === 'history' && (
            <OrderHistory
              orders={orders || []}
              onExportCSV={exportOrders}
            />
          )}

          {activeTab === 'positions' && (
            <PositionsDashboard
              positions={positions || []}
              marketData={marketData}
              onClosePosition={handleClosePosition}
              onSetStopLoss={handleSetStopLoss}
              onSetTakeProfit={handleSetTakeProfit}
            />
          )}

          {activeTab === 'performance' && portfolio && (
            <PositionPerformance
              positions={positions || []}
              portfolio={portfolio}
              positionHistory={[]} // TODO: Implement position history API
              onExportData={exportPositions}
            />
          )}

          {activeTab === 'watchlist' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <MarketWatchlist
                  marketData={marketData}
                  onSymbolSelect={setSelectedSymbol}
                  selectedSymbol={selectedSymbol}
                />
              </div>
              <div className="lg:col-span-2">
                <MarketDataChart
                  symbol={selectedSymbol}
                  height={500}
                />
              </div>
            </div>
          )}

          {activeTab === 'alerts' && (
            <PriceAlerts
              watchedSymbols={watchlistSymbols}
              marketData={marketData}
            />
          )}

          {activeTab === 'deployment' && (
            <PaperTradingSessionsManager
              onSessionUpdate={setPaperTradingSessions}
            />
          )}

          {activeTab === 'monitor' && (
            <PerformanceMonitor
              sessions={paperTradingSessions}
              onExportReport={() => {
                // Generate and download performance report
                const reportData = {
                  timestamp: new Date().toISOString(),
                  sessions: paperTradingSessions.map(session => ({
                    strategyName: session.strategy.name,
                    status: session.status,
                    totalPnL: session.statistics.totalPnL,
                    totalPnLPercent: session.statistics.totalPnLPercent,
                    winRate: session.statistics.winRate,
                    totalTrades: session.statistics.totalTrades,
                    riskMetrics: session.riskMetrics,
                  })),
                };

                const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);

                const link = document.createElement('a');
                link.href = url;
                link.download = `paper-trading-report-${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);

                addToast({
                  type: 'success',
                  title: 'Report Exported',
                  description: 'Performance report has been downloaded.',
                });
              }}
            />
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
          <div className="text-center">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Portfolio Value</p>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white">
              {portfolio ? `₹${(portfolio.totalValue / 100000).toFixed(1)}L` : '₹0'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Total P&L</p>
            <p className={`text-2xl font-bold ${portfolio && portfolio.totalPnL >= 0
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
              }`}>
              {portfolio ? `₹${(portfolio.totalPnL / 1000).toFixed(1)}K` : '₹0'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Open Positions</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {positions?.length || 0}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Active Orders</p>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {activeOrders?.length || 0}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Day P&L</p>
            <p className={`text-2xl font-bold ${portfolio && portfolio.dayPnL >= 0
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
              }`}>
              {portfolio ? `₹${(portfolio.dayPnL / 1000).toFixed(1)}K` : '₹0'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Fill Rate</p>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white">
              {orders && orders.length > 0
                ? ((orders.filter(o => o.status === 'FILLED' || o.status === 'PARTIALLY_FILLED').length / orders.length) * 100).toFixed(1)
                : '0'
              }%
            </p>
          </div>
        </div>

        {/* Modify Order Modal */}
        <ModifyOrderModal
          isOpen={modifyOrderModal.isOpen}
          order={modifyOrderModal.order}
          onClose={() => setModifyOrderModal({ isOpen: false, order: null })}
          onSubmit={handleModifyOrderSubmit}
        />
      </div>
    </MainLayout>
  );
}

// Modify Order Modal Component
function ModifyOrderModal({
  isOpen,
  order,
  onClose,
  onSubmit
}: {
  isOpen: boolean;
  order: Order | null;
  onClose: () => void;
  onSubmit: (modifications: { price?: number; quantity?: number; stopPrice?: number }) => void;
}) {
  const [price, setPrice] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [stopPrice, setStopPrice] = useState<string>('');

  // Reset form when order changes
  useEffect(() => {
    if (order) {
      setPrice(order.price?.toString() || '');
      setQuantity(order.quantity?.toString() || '');
      setStopPrice(order.stopPrice?.toString() || '');
    }
  }, [order]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const modifications: { price?: number; quantity?: number; stopPrice?: number } = {};

    if (price && parseFloat(price) !== order?.price) {
      modifications.price = parseFloat(price);
    }
    if (quantity && parseInt(quantity) !== order?.quantity) {
      modifications.quantity = parseInt(quantity);
    }
    if (stopPrice && parseFloat(stopPrice) !== order?.stopPrice) {
      modifications.stopPrice = parseFloat(stopPrice);
    }

    onSubmit(modifications);
  };

  if (!order) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
          Modify Order - {order.symbol}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Quantity
            </label>
            <Input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="1"
              required
            />
          </div>

          {(order.type === 'LIMIT' || order.type === 'STOP_LIMIT') && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Price (₹)
              </label>
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                step="0.01"
                min="0.01"
                required
              />
            </div>
          )}

          {(order.type === 'STOP' || order.type === 'STOP_LIMIT') && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Stop Price (₹)
              </label>
              <Input
                type="number"
                value={stopPrice}
                onChange={(e) => setStopPrice(e.target.value)}
                step="0.01"
                min="0.01"
                required
              />
            </div>
          )}

          <div className="flex items-center space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
            >
              Modify Order
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}