// Mock API service layer for data fetching simulation

import { 
  Symbol,
  MarketData,
  Order,
  Position,
  Trade,
  Strategy,
  StrategyTemplate,
  Backtest,
  BacktestResult,
  Portfolio,
  Alert,
  Watchlist,
} from '@/types/trading';

import { User } from '@/types/user';
import {
  mockUser,
  mockSymbols,
  mockMarketData,
  mockOrders,
  mockTrades,
  mockPositions,
  mockPortfolio,
  mockStrategies,
  mockStrategyTemplates,
  mockBacktests,
  mockBacktestResults,
  mockAlerts,
  mockWatchlists,
} from '@/mocks/data';

// Simulate network delays
const simulateDelay = (min = 100, max = 800): Promise<void> => {
  const delay = Math.random() * (max - min) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
};

// Simulate random errors for testing
const simulateError = (errorRate = 0.05): void => {
  if (Math.random() < errorRate) {
    const errors = [
      'Network timeout',
      'Server temporarily unavailable',
      'Rate limit exceeded',
      'Invalid request format',
    ];
    const error = errors[Math.floor(Math.random() * errors.length)];
    throw new Error(error);
  }
};

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: Date;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  success: boolean;
  timestamp: Date;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
  timestamp: Date;
}

class MockApiService {
  private static instance: MockApiService;
  
  // In-memory storage for stateful operations
  private orders: Order[] = [...mockOrders];
  private positions: Position[] = [...mockPositions];
  private strategies: Strategy[] = [...mockStrategies];
  private backtests: Backtest[] = [...mockBacktests];
  private alerts: Alert[] = [...mockAlerts];
  private watchlists: Watchlist[] = [...mockWatchlists];

  private constructor() {}

  public static getInstance(): MockApiService {
    if (!MockApiService.instance) {
      MockApiService.instance = new MockApiService();
    }
    return MockApiService.instance;
  }

  // User API
  async getUser(): Promise<ApiResponse<User>> {
    await simulateDelay();
    simulateError(0.02); // 2% error rate

    return {
      data: mockUser,
      success: true,
      timestamp: new Date(),
    };
  }

  async updateUser(updates: Partial<User>): Promise<ApiResponse<User>> {
    await simulateDelay(200, 1000);
    simulateError(0.03);

    const updatedUser = { ...mockUser, ...updates, updatedAt: new Date() };
    
    return {
      data: updatedUser,
      success: true,
      message: 'User profile updated successfully',
      timestamp: new Date(),
    };
  }

  // Symbols and Market Data API
  async getSymbols(): Promise<ApiResponse<Symbol[]>> {
    await simulateDelay(50, 300);
    simulateError(0.01);

    return {
      data: mockSymbols,
      success: true,
      timestamp: new Date(),
    };
  }

  async getMarketData(symbols?: string[]): Promise<ApiResponse<MarketData[]>> {
    await simulateDelay(100, 500);
    simulateError(0.02);

    let data = mockMarketData;
    if (symbols && symbols.length > 0) {
      data = mockMarketData.filter(md => symbols.includes(md.symbol));
    }

    return {
      data,
      success: true,
      timestamp: new Date(),
    };
  }

  async getSymbolData(symbol: string): Promise<ApiResponse<MarketData>> {
    await simulateDelay();
    simulateError(0.02);

    const data = mockMarketData.find(md => md.symbol === symbol);
    if (!data) {
      throw new Error(`Symbol ${symbol} not found`);
    }

    return {
      data,
      success: true,
      timestamp: new Date(),
    };
  }

  // Orders API
  async getOrders(params?: {
    status?: Order['status'];
    symbol?: string;
    strategyId?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Order>> {
    await simulateDelay(150, 600);
    simulateError(0.02);

    let filteredOrders = [...this.orders];

    if (params?.status) {
      filteredOrders = filteredOrders.filter(order => order.status === params.status);
    }
    if (params?.symbol) {
      filteredOrders = filteredOrders.filter(order => order.symbol === params.symbol);
    }
    if (params?.strategyId) {
      filteredOrders = filteredOrders.filter(order => order.strategyId === params.strategyId);
    }

    // Sort by creation date (newest first)
    filteredOrders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = filteredOrders.slice(startIndex, endIndex);

    return {
      data: paginatedData,
      pagination: {
        page,
        limit,
        total: filteredOrders.length,
        totalPages: Math.ceil(filteredOrders.length / limit),
      },
      success: true,
      timestamp: new Date(),
    };
  }

  async createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'filledQuantity' | 'remainingQuantity'>): Promise<ApiResponse<Order>> {
    await simulateDelay(200, 800);
    simulateError(0.05); // Higher error rate for order creation

    const newOrder: Order = {
      ...orderData,
      id: `order_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      status: 'PENDING',
      filledQuantity: 0,
      remainingQuantity: orderData.quantity,
      commission: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.orders.unshift(newOrder);

    return {
      data: newOrder,
      success: true,
      message: 'Order placed successfully',
      timestamp: new Date(),
    };
  }

  async cancelOrder(orderId: string): Promise<ApiResponse<Order>> {
    await simulateDelay(300, 1000);
    simulateError(0.03);

    const orderIndex = this.orders.findIndex(order => order.id === orderId);
    if (orderIndex === -1) {
      throw new Error(`Order ${orderId} not found`);
    }

    const order = this.orders[orderIndex];
    if (order.status === 'FILLED' || order.status === 'CANCELLED') {
      throw new Error(`Cannot cancel order with status ${order.status}`);
    }

    const updatedOrder = {
      ...order,
      status: 'CANCELLED' as const,
      remainingQuantity: 0,
      updatedAt: new Date(),
    };

    this.orders[orderIndex] = updatedOrder;

    return {
      data: updatedOrder,
      success: true,
      message: 'Order cancelled successfully',
      timestamp: new Date(),
    };
  }

  // Positions API
  async getPositions(): Promise<ApiResponse<Position[]>> {
    await simulateDelay(100, 400);
    simulateError(0.02);

    return {
      data: this.positions,
      success: true,
      timestamp: new Date(),
    };
  }

  async getPortfolio(): Promise<ApiResponse<Portfolio>> {
    await simulateDelay(150, 500);
    simulateError(0.02);

    const portfolio = {
      ...mockPortfolio,
      positions: this.positions,
      orders: this.orders.filter(order => order.status === 'PENDING' || order.status === 'PARTIALLY_FILLED'),
      updatedAt: new Date(),
    };

    return {
      data: portfolio,
      success: true,
      timestamp: new Date(),
    };
  }

  // Strategies API
  async getStrategies(): Promise<ApiResponse<Strategy[]>> {
    await simulateDelay(100, 400);
    simulateError(0.02);

    return {
      data: this.strategies,
      success: true,
      timestamp: new Date(),
    };
  }

  async getStrategy(id: string): Promise<ApiResponse<Strategy>> {
    await simulateDelay();
    simulateError(0.02);

    const strategy = this.strategies.find(s => s.id === id);
    if (!strategy) {
      throw new Error(`Strategy ${id} not found`);
    }

    return {
      data: strategy,
      success: true,
      timestamp: new Date(),
    };
  }

  async createStrategy(strategyData: Omit<Strategy, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Strategy>> {
    await simulateDelay(300, 1200);
    simulateError(0.04);

    const newStrategy: Strategy = {
      ...strategyData,
      id: `strategy_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.strategies.unshift(newStrategy);

    return {
      data: newStrategy,
      success: true,
      message: 'Strategy created successfully',
      timestamp: new Date(),
    };
  }

  async updateStrategy(id: string, updates: Partial<Strategy>): Promise<ApiResponse<Strategy>> {
    await simulateDelay(200, 800);
    simulateError(0.03);

    const strategyIndex = this.strategies.findIndex(s => s.id === id);
    if (strategyIndex === -1) {
      throw new Error(`Strategy ${id} not found`);
    }

    const updatedStrategy = {
      ...this.strategies[strategyIndex],
      ...updates,
      updatedAt: new Date(),
    };

    this.strategies[strategyIndex] = updatedStrategy;

    return {
      data: updatedStrategy,
      success: true,
      message: 'Strategy updated successfully',
      timestamp: new Date(),
    };
  }

  async deleteStrategy(id: string): Promise<ApiResponse<void>> {
    await simulateDelay(200, 600);
    simulateError(0.03);

    const strategyIndex = this.strategies.findIndex(s => s.id === id);
    if (strategyIndex === -1) {
      throw new Error(`Strategy ${id} not found`);
    }

    this.strategies.splice(strategyIndex, 1);

    return {
      data: undefined as any,
      success: true,
      message: 'Strategy deleted successfully',
      timestamp: new Date(),
    };
  }

  async getStrategyTemplates(): Promise<ApiResponse<StrategyTemplate[]>> {
    await simulateDelay(50, 200);
    simulateError(0.01);

    return {
      data: mockStrategyTemplates,
      success: true,
      timestamp: new Date(),
    };
  }

  // Backtests API
  async getBacktests(strategyId?: string): Promise<ApiResponse<Backtest[]>> {
    await simulateDelay(100, 400);
    simulateError(0.02);

    let data = this.backtests;
    if (strategyId) {
      data = this.backtests.filter(bt => bt.strategyId === strategyId);
    }

    return {
      data: data.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
      success: true,
      timestamp: new Date(),
    };
  }

  async createBacktest(backtestData: Omit<Backtest, 'id' | 'createdAt' | 'progress' | 'status'>): Promise<ApiResponse<Backtest>> {
    await simulateDelay(200, 600);
    simulateError(0.04);

    const newBacktest: Backtest = {
      ...backtestData,
      id: `backtest_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      status: 'PENDING',
      progress: 0,
      createdAt: new Date(),
    };

    this.backtests.unshift(newBacktest);

    return {
      data: newBacktest,
      success: true,
      message: 'Backtest created successfully',
      timestamp: new Date(),
    };
  }

  async getBacktestResult(backtestId: string): Promise<ApiResponse<BacktestResult>> {
    await simulateDelay(200, 800);
    simulateError(0.03);

    const result = mockBacktestResults.find(r => r.backtestId === backtestId);
    if (!result) {
      throw new Error(`Backtest result for ${backtestId} not found`);
    }

    return {
      data: result,
      success: true,
      timestamp: new Date(),
    };
  }

  // Alerts API
  async getAlerts(params?: { isRead?: boolean; type?: Alert['type'] }): Promise<ApiResponse<Alert[]>> {
    await simulateDelay(50, 300);
    simulateError(0.01);

    let data = [...this.alerts];

    if (params?.isRead !== undefined) {
      data = data.filter(alert => alert.isRead === params.isRead);
    }
    if (params?.type) {
      data = data.filter(alert => alert.type === params.type);
    }

    return {
      data: data.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
      success: true,
      timestamp: new Date(),
    };
  }

  async markAlertAsRead(alertId: string): Promise<ApiResponse<Alert>> {
    await simulateDelay(100, 300);
    simulateError(0.02);

    const alertIndex = this.alerts.findIndex(alert => alert.id === alertId);
    if (alertIndex === -1) {
      throw new Error(`Alert ${alertId} not found`);
    }

    const updatedAlert = { ...this.alerts[alertIndex], isRead: true };
    this.alerts[alertIndex] = updatedAlert;

    return {
      data: updatedAlert,
      success: true,
      timestamp: new Date(),
    };
  }

  // Watchlists API
  async getWatchlists(): Promise<ApiResponse<Watchlist[]>> {
    await simulateDelay(50, 200);
    simulateError(0.01);

    return {
      data: this.watchlists,
      success: true,
      timestamp: new Date(),
    };
  }

  async updateWatchlist(id: string, updates: Partial<Watchlist>): Promise<ApiResponse<Watchlist>> {
    await simulateDelay(150, 500);
    simulateError(0.03);

    const watchlistIndex = this.watchlists.findIndex(w => w.id === id);
    if (watchlistIndex === -1) {
      throw new Error(`Watchlist ${id} not found`);
    }

    const updatedWatchlist = {
      ...this.watchlists[watchlistIndex],
      ...updates,
      updatedAt: new Date(),
    };

    this.watchlists[watchlistIndex] = updatedWatchlist;

    return {
      data: updatedWatchlist,
      success: true,
      message: 'Watchlist updated successfully',
      timestamp: new Date(),
    };
  }
}

export const mockApiService = MockApiService.getInstance();