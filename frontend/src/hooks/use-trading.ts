import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { tradingAPI, PlaceOrderRequest } from '@/lib/api/trading-api';
import { tradingWebSocket } from '@/lib/websocket/trading-websocket';
import { Order, Position, Portfolio } from '@/types/trading';
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

      const [portfolioData, positionsData, activeOrdersData, ordersData] = await Promise.all([
        tradingAPI.getPortfolio(),
        tradingAPI.getPositions(),
        tradingAPI.getActiveOrders(),
        tradingAPI.getOrders({ limit: 100 }) // Load recent orders
      ]);

      setPortfolio(portfolioData);
      setPositions(positionsData);
      // Safety filter: only show PENDING and PARTIALLY_FILLED orders
      setActiveOrders(activeOrdersData.filter(order => 
        order.status === 'PENDING' || order.status === 'PARTIALLY_FILLED'
      ));
      setOrders(ordersData.orders);

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

  // Refresh only order data without triggering loading state
  const refreshOrderData = useCallback(async () => {
    try {
      const [activeOrdersData, ordersData] = await Promise.all([
        tradingAPI.getActiveOrders(),
        tradingAPI.getOrders({ limit: 100 })
      ]);

      // Safety filter: only show PENDING and PARTIALLY_FILLED orders
      setActiveOrders(activeOrdersData.filter(order => 
        order.status === 'PENDING' || order.status === 'PARTIALLY_FILLED'
      ));
      setOrders(ordersData.orders);
    } catch (err) {
      console.error('Failed to refresh order data:', err);
    }
  }, []);

  // WebSocket event handlers - memoized to prevent recreation
  const handleOrderUpdate = useCallback((order: Order) => {
    setOrders(prev => {
      const prevArray = prev || [];
      const index = prevArray.findIndex(o => o.id === order.id);
      if (index >= 0) {
        const updated = [...prevArray];
        updated[index] = order;
        return updated;
      } else {
        return [order, ...prevArray];
      }
    });

    // Update active orders
    setActiveOrders(prev => {
      const prevArray = prev || [];
      if (order.status === 'PENDING' || order.status === 'PARTIALLY_FILLED') {
        const index = prevArray.findIndex(o => o.id === order.id);
        if (index >= 0) {
          const updated = [...prevArray];
          updated[index] = order;
          return updated;
        } else {
          return [order, ...prevArray];
        }
      } else {
        return prevArray.filter(o => o.id !== order.id);
      }
    });
  }, []);

  const handlePositionUpdate = useCallback((position: Position) => {
    setPositions(prev => {
      const prevArray = prev || [];
      const index = prevArray.findIndex(p => p.id === position.id);
      if (index >= 0) {
        const updated = [...prevArray];
        updated[index] = position;
        return updated;
      } else {
        return [position, ...prevArray];
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

      // Refresh only order data after successful order placement
      await refreshOrderData();

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
  }, [refreshOrderData]);

  const cancelOrder = useCallback(async (orderId: string) => {
    try {
      const cancelledOrder = await tradingAPI.cancelOrder(orderId);

      // Refresh only order data after successful order cancellation
      await refreshOrderData();

      addToastRef.current({
        type: 'success',
        title: 'Order Cancelled',
        description: 'Order has been successfully cancelled.'
      });

      return cancelledOrder;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to cancel order';
      addToastRef.current({
        type: 'error',
        title: 'Cancel Failed',
        description: errorMessage
      });
      throw error;
    }
  }, [refreshOrderData]);

  const modifyOrder = useCallback(async (orderId: string, modifications: { price?: number; quantity?: number; stopPrice?: number }) => {
    try {
      const modifiedOrder = await tradingAPI.modifyOrder(orderId, modifications);

      // Refresh only order data after successful order modification
      await refreshOrderData();

      addToastRef.current({
        type: 'success',
        title: 'Order Modified',
        description: 'Order has been successfully modified.'
      });

      return modifiedOrder;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to modify order';
      addToastRef.current({
        type: 'error',
        title: 'Modify Failed',
        description: errorMessage
      });
      throw error;
    }
  }, [refreshOrderData]);

  // Refresh positions and portfolio data
  const refreshPositionData = useCallback(async () => {
    try {
      const [portfolioData, positionsData] = await Promise.all([
        tradingAPI.getPortfolio(),
        tradingAPI.getPositions()
      ]);

      setPortfolio(portfolioData);
      setPositions(positionsData);
    } catch (err) {
      console.error('Failed to refresh position data:', err);
    }
  }, []);

  // Position management functions - optimized to prevent re-renders
  const closePosition = useCallback(async (positionId: string, quantity?: number) => {
    try {
      const result = await tradingAPI.closePosition(positionId, { quantity });

      // Refresh positions and portfolio data after closing position
      await refreshPositionData();

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
  }, [refreshPositionData]);

  const setStopLoss = useCallback(async (positionId: string, stopPrice: number) => {
    try {
      await tradingAPI.setStopLoss(positionId, { stopPrice });

      // Refresh position data after setting stop loss
      await refreshPositionData();

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
  }, [refreshPositionData]);

  const setTakeProfit = useCallback(async (positionId: string, targetPrice: number) => {
    try {
      await tradingAPI.setTakeProfit(positionId, { targetPrice });

      // Refresh position data after setting take profit
      await refreshPositionData();

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
  }, [refreshPositionData]);

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
    refreshOrderData,
    refreshPositionData,
    placeOrder,
    cancelOrder,
    modifyOrder,
    closePosition,
    setStopLoss,
    setTakeProfit,
    exportOrders,
    exportPositions,

    // Computed values (memoized)
    ...computedValues
  };
}