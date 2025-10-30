'use client';

import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout';
import { useAuthStore } from '@/stores/auth-store';
import { useToast } from '@/components/ui';
import { OrderEntryForm, OrderBook, OrderHistory, PositionsDashboard, PositionPerformance, MarketWatchlist, PriceTicker, MarketDataChart, PriceAlerts, PaperTradingSessionsManager, PerformanceMonitor, type PaperTradingSession } from '@/components/features/paper-trading';
import { mockOrderService } from '@/mocks/services/order-service';
import { mockPositionService } from '@/mocks/services/position-service';
import { mockSymbols, mockMarketData } from '@/mocks/data/symbols';
import { Order, Position, Portfolio } from '@/types/trading';
import { useSocketConnection } from '@/lib/hooks/use-mock-socket';

export default function PaperTradingPage() {
  const { user } = useAuthStore();
  const { addToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [activeTab, setActiveTab] = useState<'entry' | 'book' | 'history' | 'positions' | 'performance' | 'watchlist' | 'alerts' | 'deployment' | 'monitor'>('entry');
  const [selectedSymbol, setSelectedSymbol] = useState<string>('RELIANCE');
  const [paperTradingSessions, setPaperTradingSessions] = useState<PaperTradingSession[]>([]);
  
  // Connect to MockSocket for real-time data
  const { connect, isConnected } = useSocketConnection();

  useEffect(() => {
    // Connect to MockSocket for real-time market data
    if (!isConnected) {
      connect();
    }

    // Load initial orders
    setOrders(mockOrderService.getOrders());

    // Load initial positions and portfolio
    setPositions(mockPositionService.getPositions());
    setPortfolio(mockPositionService.getPortfolio());

    // Subscribe to order updates
    const unsubscribeOrders = mockOrderService.subscribe((updatedOrders) => {
      setOrders(updatedOrders);
    });

    // Subscribe to position updates
    const unsubscribePositions = mockPositionService.subscribe((updatedPositions, updatedPortfolio) => {
      setPositions(updatedPositions);
      setPortfolio(updatedPortfolio);
    });

    return () => {
      unsubscribeOrders();
      unsubscribePositions();
    };
  }, [connect, isConnected]);

  const handlePlaceOrder = (orderData: Omit<Order, 'id' | 'status' | 'filledQuantity' | 'remainingQuantity' | 'commission' | 'createdAt' | 'updatedAt'>) => {
    try {
      const order = mockOrderService.placeOrder(orderData);
      
      if (order.status === 'REJECTED') {
        addToast({
          type: 'error',
          title: 'Order Rejected',
          description: order.rejectionReason || 'Order was rejected by the system.'
        });
      } else {
        addToast({
          type: 'success',
          title: 'Order Placed',
          description: `${orderData.side} order for ${orderData.quantity} ${orderData.symbol} has been submitted.`
        });
      }
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Order Failed',
        description: 'Failed to place order. Please try again.'
      });
    }
  };

  const handleCancelOrder = (orderId: string) => {
    const success = mockOrderService.cancelOrder(orderId);
    
    if (success) {
      addToast({
        type: 'success',
        title: 'Order Cancelled',
        description: 'Order has been successfully cancelled.'
      });
    } else {
      addToast({
        type: 'error',
        title: 'Cancel Failed',
        description: 'Unable to cancel order. It may already be filled or cancelled.'
      });
    }
  };

  const handleModifyOrder = (orderId: string) => {
    // For now, just show a toast. In a real implementation, this would open a modify modal
    addToast({
      type: 'info',
      title: 'Modify Order',
      description: 'Order modification feature coming soon.'
    });
  };

  const handleExportCSV = () => {
    try {
      const csvContent = mockOrderService.exportOrdersToCSV();
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      addToast({
        type: 'success',
        title: 'Export Complete',
        description: 'Order history has been exported to CSV.'
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Export Failed',
        description: 'Failed to export order history.'
      });
    }
  };

  const handleClosePosition = (positionId: string, quantity?: number) => {
    const success = mockPositionService.closePosition(positionId, quantity);
    
    if (success) {
      addToast({
        type: 'success',
        title: 'Position Closed',
        description: quantity 
          ? `Partially closed ${quantity} shares`
          : 'Position has been fully closed.'
      });
    } else {
      addToast({
        type: 'error',
        title: 'Close Failed',
        description: 'Unable to close position. Please try again.'
      });
    }
  };

  const handleSetStopLoss = (positionId: string, stopPrice: number) => {
    const success = mockPositionService.setStopLoss(positionId, stopPrice);
    
    if (success) {
      addToast({
        type: 'success',
        title: 'Stop Loss Set',
        description: `Stop loss has been set at ₹${stopPrice.toFixed(2)}.`
      });
    } else {
      addToast({
        type: 'error',
        title: 'Failed to Set Stop Loss',
        description: 'Unable to set stop loss. Please try again.'
      });
    }
  };

  const handleSetTakeProfit = (positionId: string, targetPrice: number) => {
    const success = mockPositionService.setTakeProfit(positionId, targetPrice);
    
    if (success) {
      addToast({
        type: 'success',
        title: 'Take Profit Set',
        description: `Take profit has been set at ₹${targetPrice.toFixed(2)}.`
      });
    } else {
      addToast({
        type: 'error',
        title: 'Failed to Set Take Profit',
        description: 'Unable to set take profit. Please try again.'
      });
    }
  };

  const handleExportPositions = () => {
    try {
      const csvContent = mockPositionService.exportPositionsToCSV();
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `positions-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      addToast({
        type: 'success',
        title: 'Export Complete',
        description: 'Position data has been exported to CSV.'
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Export Failed',
        description: 'Failed to export position data.'
      });
    }
  };

  if (!user) {
    return null;
  }

  const activeOrders = orders.filter(order => 
    order.status === 'PENDING' || order.status === 'PARTIALLY_FILLED'
  );

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
          symbols={['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK', 'HINDUNILVR', 'ITC', 'SBIN', 'BHARTIARTL', 'KOTAKBANK']}
          speed="medium"
        />

        {/* Navigation Tabs */}
        <div className="border-b border-neutral-200 dark:border-neutral-700">
          <nav className="flex space-x-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('entry')}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'entry'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300'
              }`}
            >
              Order Entry
            </button>
            <button
              onClick={() => setActiveTab('book')}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'book'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300'
              }`}
            >
              Order Book
              {activeOrders.length > 0 && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
                  {activeOrders.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'history'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300'
              }`}
            >
              Order History
            </button>
            <button
              onClick={() => setActiveTab('positions')}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'positions'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300'
              }`}
            >
              Positions
              {positions.length > 0 && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
                  {positions.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('performance')}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'performance'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300'
              }`}
            >
              Performance
            </button>
            <button
              onClick={() => setActiveTab('watchlist')}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'watchlist'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300'
              }`}
            >
              Market Data
            </button>
            <button
              onClick={() => setActiveTab('alerts')}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'alerts'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300'
              }`}
            >
              Alerts
            </button>
            <button
              onClick={() => setActiveTab('deployment')}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'deployment'
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
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'monitor'
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
                  symbols={mockSymbols}
                  marketData={mockMarketData}
                  onPlaceOrder={handlePlaceOrder}
                />
              </div>
              <div className="lg:col-span-2">
                <OrderBook
                  orders={activeOrders}
                  onCancelOrder={handleCancelOrder}
                  onModifyOrder={handleModifyOrder}
                />
              </div>
            </div>
          )}

          {activeTab === 'book' && (
            <OrderBook
              orders={activeOrders}
              onCancelOrder={handleCancelOrder}
              onModifyOrder={handleModifyOrder}
            />
          )}

          {activeTab === 'history' && (
            <OrderHistory
              orders={orders}
              onExportCSV={handleExportCSV}
            />
          )}

          {activeTab === 'positions' && (
            <PositionsDashboard
              positions={positions}
              marketData={mockPositionService.getMarketData()}
              onClosePosition={handleClosePosition}
              onSetStopLoss={handleSetStopLoss}
              onSetTakeProfit={handleSetTakeProfit}
            />
          )}

          {activeTab === 'performance' && portfolio && (
            <PositionPerformance
              positions={positions}
              portfolio={portfolio}
              positionHistory={mockPositionService.getPositionHistory()}
              onExportData={handleExportPositions}
            />
          )}

          {activeTab === 'watchlist' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <MarketWatchlist
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
              watchedSymbols={['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK']}
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
            <p className={`text-2xl font-bold ${
              portfolio && portfolio.totalPnL >= 0 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              {portfolio ? `₹${(portfolio.totalPnL / 1000).toFixed(1)}K` : '₹0'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Open Positions</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {positions.length}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Active Orders</p>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {activeOrders.length}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Day P&L</p>
            <p className={`text-2xl font-bold ${
              portfolio && portfolio.dayPnL >= 0 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              {portfolio ? `₹${(portfolio.dayPnL / 1000).toFixed(1)}K` : '₹0'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Fill Rate</p>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white">
              {orders.length > 0 
                ? ((orders.filter(o => o.status === 'FILLED' || o.status === 'PARTIALLY_FILLED').length / orders.length) * 100).toFixed(1)
                : '0'
              }%
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}