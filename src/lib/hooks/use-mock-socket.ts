// React hooks for MockSocket integration

import { useEffect, useRef, useCallback, useState } from 'react';
import { 
  mockSocket, 
  MockSocketEvent, 
  MockSocketMessage,
  MarketDataUpdate,
  OrderUpdate,
  PositionUpdate,
  TradeExecution,
  StrategySignal,
  SystemAlert,
} from '@/mocks/socket/mock-socket';

// Generic hook for subscribing to MockSocket events
export function useMockSocket<T = any>(
  event: MockSocketEvent,
  callback: (message: MockSocketMessage<T>) => void,
  deps: React.DependencyList = []
) {
  const callbackRef = useRef(callback);
  
  // Update callback ref when dependencies change
  useEffect(() => {
    callbackRef.current = callback;
  }, deps);

  useEffect(() => {
    const unsubscribe = mockSocket.subscribe(event, (message: MockSocketMessage<T>) => {
      callbackRef.current(message);
    });

    return unsubscribe;
  }, [event]);
}

// Hook for market data updates
export function useMarketData(symbols?: string[]) {
  const [marketData, setMarketData] = useState<Map<string, MarketDataUpdate>>(new Map());
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useMockSocket<MarketDataUpdate>('market_data', useCallback((message: MockSocketMessage<MarketDataUpdate>) => {
    const data = message.data;
    
    // Filter by symbols if provided
    if (symbols && !symbols.includes(data.symbol)) {
      return;
    }

    setMarketData(prev => {
      const newMap = new Map(prev);
      newMap.set(data.symbol, data);
      return newMap;
    });
    
    setLastUpdate(message.timestamp);
  }, [symbols]));

  const getPrice = useCallback((symbol: string) => {
    return marketData.get(symbol)?.price;
  }, [marketData]);

  const getChange = useCallback((symbol: string) => {
    const data = marketData.get(symbol);
    return data ? { change: data.change, changePercent: data.changePercent } : null;
  }, [marketData]);

  return {
    marketData: Array.from(marketData.values()),
    marketDataMap: marketData,
    lastUpdate,
    getPrice,
    getChange,
  };
}

// Hook for order updates
export function useOrderUpdates(orderIds?: string[]) {
  const [orderUpdates, setOrderUpdates] = useState<OrderUpdate[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useMockSocket<OrderUpdate>('order_update', useCallback((message: MockSocketMessage<OrderUpdate>) => {
    const data = message.data;
    
    // Filter by order IDs if provided
    if (orderIds && !orderIds.includes(data.orderId)) {
      return;
    }

    setOrderUpdates(prev => {
      // Keep only the latest update for each order
      const filtered = prev.filter(update => update.orderId !== data.orderId);
      return [...filtered, data].slice(-50); // Keep last 50 updates
    });
    
    setLastUpdate(message.timestamp);
  }, [orderIds]));

  const getOrderStatus = useCallback((orderId: string) => {
    return orderUpdates.find(update => update.orderId === orderId);
  }, [orderUpdates]);

  return {
    orderUpdates,
    lastUpdate,
    getOrderStatus,
  };
}

// Hook for position updates
export function usePositionUpdates(symbols?: string[]) {
  const [positionUpdates, setPositionUpdates] = useState<Map<string, PositionUpdate>>(new Map());
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useMockSocket<PositionUpdate>('position_update', useCallback((message: MockSocketMessage<PositionUpdate>) => {
    const data = message.data;
    
    // Filter by symbols if provided
    if (symbols && !symbols.includes(data.symbol)) {
      return;
    }

    setPositionUpdates(prev => {
      const newMap = new Map(prev);
      newMap.set(data.symbol, data);
      return newMap;
    });
    
    setLastUpdate(message.timestamp);
  }, [symbols]));

  const getPositionPnL = useCallback((symbol: string) => {
    const data = positionUpdates.get(symbol);
    return data ? { unrealizedPnL: data.unrealizedPnL, dayPnL: data.dayPnL } : null;
  }, [positionUpdates]);

  return {
    positionUpdates: Array.from(positionUpdates.values()),
    positionUpdatesMap: positionUpdates,
    lastUpdate,
    getPositionPnL,
  };
}

// Hook for trade executions
export function useTradeExecutions() {
  const [trades, setTrades] = useState<TradeExecution[]>([]);
  const [lastTrade, setLastTrade] = useState<TradeExecution | null>(null);

  useMockSocket<TradeExecution>('trade_execution', useCallback((message: MockSocketMessage<TradeExecution>) => {
    const data = message.data;
    
    setTrades(prev => [...prev, data].slice(-100)); // Keep last 100 trades
    setLastTrade(data);
  }, []));

  return {
    trades,
    lastTrade,
    tradeCount: trades.length,
  };
}

// Hook for strategy signals
export function useStrategySignals(strategyIds?: string[]) {
  const [signals, setSignals] = useState<StrategySignal[]>([]);
  const [lastSignal, setLastSignal] = useState<StrategySignal | null>(null);

  useMockSocket<StrategySignal>('strategy_signal', useCallback((message: MockSocketMessage<StrategySignal>) => {
    const data = message.data;
    
    // Filter by strategy IDs if provided
    if (strategyIds && !strategyIds.includes(data.strategyId)) {
      return;
    }

    setSignals(prev => [...prev, data].slice(-50)); // Keep last 50 signals
    setLastSignal(data);
  }, [strategyIds]));

  const getLatestSignal = useCallback((strategyId: string, symbol?: string) => {
    return signals
      .filter(signal => 
        signal.strategyId === strategyId && 
        (!symbol || signal.symbol === symbol)
      )
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
  }, [signals]);

  return {
    signals,
    lastSignal,
    getLatestSignal,
  };
}

// Hook for system alerts
export function useSystemAlerts() {
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useMockSocket<SystemAlert>('system_alert', useCallback((message: MockSocketMessage<SystemAlert>) => {
    const data = message.data;
    
    setAlerts(prev => [...prev, data].slice(-20)); // Keep last 20 alerts
    setUnreadCount(prev => prev + 1);
  }, []));

  const markAllAsRead = useCallback(() => {
    setUnreadCount(0);
  }, []);

  const clearAlerts = useCallback(() => {
    setAlerts([]);
    setUnreadCount(0);
  }, []);

  return {
    alerts,
    unreadCount,
    markAllAsRead,
    clearAlerts,
  };
}

// Hook for connection status
export function useSocketConnection() {
  const [isConnected, setIsConnected] = useState(mockSocket.getConnectionStatus());
  const [subscriberCount, setSubscriberCount] = useState(0);

  useEffect(() => {
    const checkConnection = () => {
      setIsConnected(mockSocket.getConnectionStatus());
      setSubscriberCount(mockSocket.getSubscriberCount());
    };

    const interval = setInterval(checkConnection, 1000);
    checkConnection(); // Initial check

    return () => clearInterval(interval);
  }, []);

  const connect = useCallback(() => {
    mockSocket.connect();
    setIsConnected(true);
  }, []);

  const disconnect = useCallback(() => {
    mockSocket.disconnect();
    setIsConnected(false);
  }, []);

  return {
    isConnected,
    subscriberCount,
    connect,
    disconnect,
  };
}

// Hook for triggering mock events (useful for testing/demo)
export function useMockSocketControls() {
  const simulateAlert = useCallback((type: SystemAlert['type'], message: string) => {
    mockSocket.simulateSystemAlert(type, message);
  }, []);

  const simulateOrderRejection = useCallback((orderId: string, reason: string) => {
    mockSocket.simulateOrderRejection(orderId, reason);
  }, []);

  const simulateBacktestProgress = useCallback((backtestId: string, progress: number) => {
    mockSocket.simulateBacktestProgress(backtestId, progress);
  }, []);

  return {
    simulateAlert,
    simulateOrderRejection,
    simulateBacktestProgress,
  };
}