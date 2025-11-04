import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { tradingAPI, PlaceOrderRequest, ClosePositionRequest, SetStopLossRequest, SetTakeProfitRequest } from '@/lib/api/trading-api';
import { tradingWebSocket } from '@/lib/websocket/trading-websocket';
import { Order, Position, Portfolio, MarketData } from '@/types/trading';
import { useToast } from '@/components/ui';

export function useTrading() {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();
  
  // Use refs to avoid recreating callbacks on every render
  const addToastRef = useRef(addToast);
  addToastRef.current = addToast;

  // Load initial data - memoized to prevent unnecessary re-renders
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [portfolioData, positionsData, activeOrdersData] = await Promise.all([
        tradingAPI.getPortfolio(),
        tradingAPI.getPositions(),
        tradingAPI.getActiveOrders()
      ]);

      setPortfolio(portfolioData);
      setPositions(positionsData);
      setActiveOrders(activeOrdersData);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load trading data';
      setError(errorMessage);
      addToastRef.current({
        type: 'error',
        title: 'Error Loading Data',
        description: errorMessage
      });
    } finally {
      setLoading(false);
    }
  }, []); // Remove addToast dependency to prevent recreation

  // WebSocket event handlers - memoized to prevent recreation
  const handleOrderUpdate = useCallback((order: Order) => {
    setOrders(prev => {
      const index = prev.findIndex(o => o.id === order.id);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = order;
        return updated;
      } else {
        return [order, ...prev];
      }
    });

    // Update active orders
    setActiveOrders(prev => {
      if (order.status === 'PENDING' || order.status === 'PARTIALLY_FILLED') {
        const index = prev.findIndex(o => o.id === order.id);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = order;
          return updated;
        } else {
          return [order, ...prev];
        }
      } else {
        return prev.filter(o => o.id !== order.id);
      }
    });
  }, []);

  const handlePositionUpdate = useCallback((position: Position) => {
    setPositions(prev => {
      const index = prev.findIndex(p => p.id === position.id);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = position;
        return updated;
      } else {
        return [position, ...prev];
      }
    });
  }, []);

  const handlePortfolioUpdate = useCallback((portfolioData: Portfolio) => {
    setPortfolio(prev => {
      // Only update if there's a significant change to prevent micro-updates
      if (!prev) return portfolioData;
      
      const pnlChange = Math.abs((prev.totalPnL || 0) - (portfolioData.totalPnL || 0));
      const valueChange = Math.abs((prev.totalValue || 0) - (portfolioData.totalValue || 0));
      
      // Only update for changes > ₹1
      if (pnlChange > 1 || valueChange > 1) {
        return portfolioData;
      }
      
      return prev; // No significant change, don't trigger re-render
    });
  }, []);

  const handleRiskManagementTriggered = useCallback((data: any) => {
    addToastRef.current({
      type: 'warning',
      title: 'Risk Management Triggered',
      description: `${data.reason} for ${data.symbol} at ₹${data.price}`
    });
  }, []);

  // WebSocket event subscription
  useEffect(() => {
    // Subscribe to WebSocket events
    tradingWebSocket.on('orderUpdate', handleOrderUpdate);
    tradingWebSocket.on('positionUpdate', handlePositionUpdate);
    tradingWebSocket.on('portfolioUpdate', handlePortfolioUpdate);
    tradingWebSocket.on('riskManagementTriggered', handleRiskManagementTriggered);

    return () => {
      tradingWebSocket.off('orderUpdate', handleOrderUpdate);
      tradingWebSocket.off('positionUpdate', handlePositionUpdate);
      tradingWebSocket.off('portfolioUpdate', handlePortfolioUpdate);
      tradingWebSocket.off('riskManagementTriggered', handleRiskManagementTriggered);
    };
  }, [handleOrderUpdate, handlePositionUpdate, handlePortfolioUpdate, handleRiskManagementTriggered]);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Order management functions - optimized to prevent re-renders
  const placeOrder = useCallback(async (orderData: PlaceOrderRequest) => {
    try {
      const order = await tradingAPI.placeOrder(orderData);
      
      if (order.status === 'REJECTED') {
        addToastRef.current({
          type: 'error',
          title: 'Order Rejected',
          description: order.rejectionReason || 'Order was rejected by the system.'
        });
      } else {
        addToastRef.current({
          type: 'success',
          title: 'Order Placed',
          description: `${orderData.side} order for ${orderData.quantity} ${orderData.symbol} has been submitted.`
        });
      }

      return order;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to place order';
      addToastRef.current({
        type: 'error',
        title: 'Order Failed',
        description: errorMessage
      });
      throw error;
    }
  }, []);

  const cancelOrder = useCallback(async (orderId: string) => {
    try {
      await tradingAPI.cancelOrder(orderId);
      
      addToastRef.current({
        type: 'success',
        title: 'Order Cancelled',
        description: 'Order has been successfully cancelled.'
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to cancel order';
      addToastRef.current({
        type: 'error',
        title: 'Cancel Failed',
        description: errorMessage
      });
      throw error;
    }
  }, []);

  // Position management functions - optimized to prevent re-renders
  const closePosition = useCallback(async (positionId: string, quantity?: number) => {
    try {
      const result = await tradingAPI.closePosition(positionId, { quantity });
      
      addToastRef.current({
        type: 'success',
        title: 'Position Closed',
        description: quantity 
          ? `Partially closed ${quantity} shares`
          : 'Position has been fully closed.'
      });

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to close position';
      addToastRef.current({
        type: 'error',
        title: 'Close Failed',
        description: errorMessage
      });
      throw error;
    }
  }, []);

  const setStopLoss = useCallback(async (positionId: string, stopPrice: number) => {
    try {
      await tradingAPI.setStopLoss(positionId, { stopPrice });
      
      addToastRef.current({
        type: 'success',
        title: 'Stop Loss Set',
        description: `Stop loss has been set at ₹${stopPrice.toFixed(2)}.`
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to set stop loss';
      addToastRef.current({
        type: 'error',
        title: 'Failed to Set Stop Loss',
        description: errorMessage
      });
      throw error;
    }
  }, []);

  const setTakeProfit = useCallback(async (positionId: string, targetPrice: number) => {
    try {
      await tradingAPI.setTakeProfit(positionId, { targetPrice });
      
      addToastRef.current({
        type: 'success',
        title: 'Take Profit Set',
        description: `Take profit has been set at ₹${targetPrice.toFixed(2)}.`
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to set take profit';
      addToastRef.current({
        type: 'error',
        title: 'Failed to Set Take Profit',
        description: errorMessage
      });
      throw error;
    }
  }, []);

  // Export functions - optimized to prevent re-renders
  const exportOrders = useCallback(async () => {
    try {
      const blob = await tradingAPI.exportOrders();
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      addToastRef.current({
        type: 'success',
        title: 'Export Complete',
        description: 'Order history has been exported to CSV.'
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to export orders';
      addToastRef.current({
        type: 'error',
        title: 'Export Failed',
        description: errorMessage
      });
      throw error;
    }
  }, []);

  const exportPositions = useCallback(async () => {
    try {
      const blob = await tradingAPI.exportPositions();
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `positions-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      addToastRef.current({
        type: 'success',
        title: 'Export Complete',
        description: 'Position data has been exported to CSV.'
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to export positions';
      addToastRef.current({
        type: 'error',
        title: 'Export Failed',
        description: errorMessage
      });
      throw error;
    }
  }, []);

  // Memoize computed values to prevent unnecessary re-renders
  const computedValues = useMemo(() => ({
    totalPositions: positions.length,
    totalActiveOrders: activeOrders.length,
    totalPnL: portfolio?.totalPnL || 0,
    dayPnL: portfolio?.dayPnL || 0,
    portfolioValue: portfolio?.totalValue || 0
  }), [positions.length, activeOrders.length, portfolio?.totalPnL, portfolio?.dayPnL, portfolio?.totalValue]);

  return {
    // State
    portfolio,
    positions,
    orders,
    activeOrders,
    loading,
    error,

    // Actions
    loadData,
    placeOrder,
    cancelOrder,
    closePosition,
    setStopLoss,
    setTakeProfit,
    exportOrders,
    exportPositions,

    // Computed values (memoized)
    ...computedValues
  };
}