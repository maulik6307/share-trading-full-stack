// MockSocket service for WebSocket-like real-time simulation

import { Order } from '@/types/trading';

export type MockSocketEvent = 
  | 'market_data'
  | 'order_update' 
  | 'position_update'
  | 'trade_execution'
  | 'strategy_signal'
  | 'system_alert'
  | 'backtest_progress';

export interface MockSocketMessage<T = any> {
  event: MockSocketEvent;
  data: T;
  timestamp: Date;
  id: string;
}

export interface MarketDataUpdate {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: Date;
}

export interface OrderUpdate {
  orderId: string;
  status: Order['status'];
  filledQuantity: number;
  avgFillPrice?: number;
  remainingQuantity: number;
  timestamp: Date;
}

export interface PositionUpdate {
  symbol: string;
  currentPrice: number;
  unrealizedPnL: number;
  dayPnL: number;
  timestamp: Date;
}

export interface TradeExecution {
  tradeId: string;
  orderId: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  timestamp: Date;
}

export interface StrategySignal {
  strategyId: string;
  signal: 'BUY' | 'SELL' | 'HOLD';
  symbol: string;
  confidence: number;
  timestamp: Date;
}

export interface SystemAlert {
  type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
  message: string;
  timestamp: Date;
}

type EventCallback<T = any> = (message: MockSocketMessage<T>) => void;
type UnsubscribeFunction = () => void;

export class MockSocket {
  private static instance: MockSocket;
  private subscribers = new Map<MockSocketEvent, Set<EventCallback>>();
  private isConnected = false;
  private simulationIntervals = new Map<string, NodeJS.Timeout>();
  private messageId = 0;

  private constructor() {
    this.initializeSimulation();
  }

  public static getInstance(): MockSocket {
    if (!MockSocket.instance) {
      MockSocket.instance = new MockSocket();
    }
    return MockSocket.instance;
  }

  public connect(): void {
    if (this.isConnected) return;
    
    this.isConnected = true;
    this.startMarketDataSimulation();
    this.startOrderExecutionSimulation();
    this.startPositionUpdateSimulation();
    
    console.log('[MockSocket] Connected to mock trading server');
  }

  public disconnect(): void {
    if (!this.isConnected) return;
    
    this.isConnected = false;
    this.stopAllSimulations();
    
    console.log('[MockSocket] Disconnected from mock trading server');
  }

  public subscribe<T>(event: MockSocketEvent, callback: EventCallback<T>): UnsubscribeFunction {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, new Set());
    }
    
    this.subscribers.get(event)!.add(callback);
    
    return () => {
      const eventSubscribers = this.subscribers.get(event);
      if (eventSubscribers) {
        eventSubscribers.delete(callback);
        if (eventSubscribers.size === 0) {
          this.subscribers.delete(event);
        }
      }
    };
  }

  public emit<T>(event: MockSocketEvent, data: T): void {
    if (!this.isConnected) return;
    
    const message: MockSocketMessage<T> = {
      event,
      data,
      timestamp: new Date(),
      id: `msg_${++this.messageId}`,
    };

    const eventSubscribers = this.subscribers.get(event);
    if (eventSubscribers) {
      eventSubscribers.forEach(callback => {
        try {
          callback(message);
        } catch (error) {
          console.error(`[MockSocket] Error in event callback for ${event}:`, error);
        }
      });
    }
  }

  private initializeSimulation(): void {
    // Initialize with some base symbols for simulation
    this.symbols = ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK'];
    this.basePrices = {
      'RELIANCE': 2456.75,
      'TCS': 3542.80,
      'HDFCBANK': 1678.90,
      'INFY': 1456.35,
      'ICICIBANK': 987.45,
    };
  }

  private symbols: string[] = [];
  private basePrices: Record<string, number> = {};

  private startMarketDataSimulation(): void {
    const interval = setInterval(() => {
      this.symbols.forEach(symbol => {
        const basePrice = this.basePrices[symbol];
        if (!basePrice) return;

        // Generate realistic price movement (±0.5% with some trend)
        const volatility = 0.005; // 0.5%
        const trend = (Math.random() - 0.5) * 0.001; // Small trend component
        const randomChange = (Math.random() - 0.5) * volatility;
        const priceChange = trend + randomChange;
        
        const newPrice = basePrice * (1 + priceChange);
        const change = newPrice - basePrice;
        const changePercent = (change / basePrice) * 100;
        
        // Update base price for next iteration (with some mean reversion)
        this.basePrices[symbol] = basePrice * 0.999 + newPrice * 0.001;

        const marketData: MarketDataUpdate = {
          symbol,
          price: Math.round(newPrice * 100) / 100,
          change: Math.round(change * 100) / 100,
          changePercent: Math.round(changePercent * 10000) / 10000,
          volume: Math.floor(Math.random() * 100000) + 10000,
          timestamp: new Date(),
        };

        this.emit('market_data', marketData);
      });
    }, 1000 + Math.random() * 2000); // 1-3 seconds interval

    this.simulationIntervals.set('market_data', interval);
  }

  private startOrderExecutionSimulation(): void {
    const interval = setInterval(() => {
      // Simulate random order executions
      if (Math.random() < 0.3) { // 30% chance every interval
        this.simulateOrderExecution();
      }
    }, 3000 + Math.random() * 7000); // 3-10 seconds interval

    this.simulationIntervals.set('order_execution', interval);
  }

  private startPositionUpdateSimulation(): void {
    const interval = setInterval(() => {
      // Simulate position updates based on market movements
      this.symbols.forEach(symbol => {
        if (Math.random() < 0.4) { // 40% chance per symbol
          this.simulatePositionUpdate(symbol);
        }
      });
    }, 5000 + Math.random() * 10000); // 5-15 seconds interval

    this.simulationIntervals.set('position_updates', interval);
  }

  private simulateOrderExecution(): void {
    const orderId = `order_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const symbol = this.symbols[Math.floor(Math.random() * this.symbols.length)];
    const side = Math.random() > 0.5 ? 'BUY' : 'SELL';
    const quantity = Math.floor(Math.random() * 200) + 10;
    const basePrice = this.basePrices[symbol];
    
    // Simulate partial fills
    const isPartialFill = Math.random() < 0.2; // 20% chance of partial fill
    const filledQuantity = isPartialFill ? 
      Math.floor(quantity * (0.3 + Math.random() * 0.4)) : // 30-70% fill
      quantity;
    
    const price = basePrice * (1 + (Math.random() - 0.5) * 0.001); // Small slippage
    
    // Order update
    const orderUpdate: OrderUpdate = {
      orderId,
      status: filledQuantity === quantity ? 'FILLED' : 'PARTIALLY_FILLED',
      filledQuantity,
      avgFillPrice: Math.round(price * 100) / 100,
      remainingQuantity: quantity - filledQuantity,
      timestamp: new Date(),
    };

    this.emit('order_update', orderUpdate);

    // Trade execution
    const tradeExecution: TradeExecution = {
      tradeId: `trade_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      orderId,
      symbol,
      side,
      quantity: filledQuantity,
      price: Math.round(price * 100) / 100,
      timestamp: new Date(),
    };

    this.emit('trade_execution', tradeExecution);

    // Simulate strategy signals occasionally
    if (Math.random() < 0.1) { // 10% chance
      this.simulateStrategySignal(symbol);
    }
  }

  private simulatePositionUpdate(symbol: string): void {
    const currentPrice = this.basePrices[symbol];
    const priceChange = (Math.random() - 0.5) * 0.02; // ±1% change
    const newPrice = currentPrice * (1 + priceChange);
    
    // Simulate P&L changes
    const unrealizedPnL = (Math.random() - 0.5) * 5000; // ±₹5000
    const dayPnL = (Math.random() - 0.5) * 1000; // ±₹1000

    const positionUpdate: PositionUpdate = {
      symbol,
      currentPrice: Math.round(newPrice * 100) / 100,
      unrealizedPnL: Math.round(unrealizedPnL * 100) / 100,
      dayPnL: Math.round(dayPnL * 100) / 100,
      timestamp: new Date(),
    };

    this.emit('position_update', positionUpdate);
  }

  private simulateStrategySignal(symbol: string): void {
    const signals: StrategySignal['signal'][] = ['BUY', 'SELL', 'HOLD'];
    const signal = signals[Math.floor(Math.random() * signals.length)];
    const confidence = Math.random() * 0.4 + 0.6; // 60-100% confidence

    const strategySignal: StrategySignal = {
      strategyId: `strategy_${Math.floor(Math.random() * 4) + 1}`,
      signal,
      symbol,
      confidence: Math.round(confidence * 100) / 100,
      timestamp: new Date(),
    };

    this.emit('strategy_signal', strategySignal);
  }

  public simulateSystemAlert(type: SystemAlert['type'], message: string): void {
    const alert: SystemAlert = {
      type,
      message,
      timestamp: new Date(),
    };

    this.emit('system_alert', alert);
  }

  public simulateOrderRejection(orderId: string, reason: string): void {
    const orderUpdate: OrderUpdate = {
      orderId,
      status: 'REJECTED',
      filledQuantity: 0,
      remainingQuantity: 0,
      timestamp: new Date(),
    };

    this.emit('order_update', orderUpdate);
    this.simulateSystemAlert('ERROR', `Order ${orderId} rejected: ${reason}`);
  }

  public simulateBacktestProgress(backtestId: string, progress: number): void {
    this.emit('backtest_progress', {
      backtestId,
      progress: Math.min(100, Math.max(0, progress)),
      timestamp: new Date(),
    });

    if (progress >= 100) {
      setTimeout(() => {
        this.simulateSystemAlert('SUCCESS', `Backtest ${backtestId} completed successfully`);
      }, 1000);
    }
  }

  private stopAllSimulations(): void {
    this.simulationIntervals.forEach((interval) => {
      clearInterval(interval);
    });
    this.simulationIntervals.clear();
  }

  public getConnectionStatus(): boolean {
    return this.isConnected;
  }

  public getSubscriberCount(event?: MockSocketEvent): number {
    if (event) {
      return this.subscribers.get(event)?.size || 0;
    }
    
    let total = 0;
    this.subscribers.forEach(subscribers => {
      total += subscribers.size;
    });
    return total;
  }
}

// Export singleton instance
export const mockSocket = MockSocket.getInstance();