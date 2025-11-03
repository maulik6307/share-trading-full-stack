/**
 * Backtesting API service
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

// Types
export interface BacktestConfig {
  name: string;
  description?: string;
  strategyId: string;
  startDate: string;
  endDate: string;
  initialCapital: number;
  commission: number;
  slippage: number;
  tags?: string[];
}

export interface BacktestSummary {
  totalReturn: number;
  totalReturnPercent: number;
  annualizedReturn: number;
  sharpeRatio: number;
  sortinoRatio: number;
  maxDrawdown: number;
  maxDrawdownPercent: number;
  maxDrawdownDuration: number;
  volatility: number;
  winRate: number;
  profitFactor: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  avgWin: number;
  avgLoss: number;
  largestWin: number;
  largestLoss: number;
  avgTradeDuration: number;
  finalCapital: number;
  totalCommission: number;
  totalSlippage: number;
}

export interface EquityPoint {
  date: string;
  equity: number;
  drawdown: number;
  returns: number;
}

export interface DrawdownPoint {
  date: string;
  drawdown: number;
  drawdownPercent: number;
  isNewHigh: boolean;
}

export interface MonthlyReturn {
  year: number;
  month: number;
  return: number;
  returnPercent: number;
}

export interface RiskMetrics {
  var95: number;
  var99: number;
  cvar95: number;
  cvar99: number;
  beta: number;
  alpha: number;
  informationRatio: number;
  calmarRatio: number;
  sterlingRatio: number;
}

export interface BacktestResult {
  summary: BacktestSummary;
  equityCurve: EquityPoint[];
  drawdownCurve: DrawdownPoint[];
  trades: string[]; // Trade IDs
  monthlyReturns: MonthlyReturn[];
  riskMetrics: RiskMetrics;
}

export interface Backtest {
  _id: string;
  userId: string;
  strategyId: string;
  name: string;
  description?: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  progress: number;
  startDate: string;
  endDate: string;
  initialCapital: number;
  commission: number;
  slippage: number;
  startedAt?: string;
  completedAt?: string;
  errorMessage?: string;
  result?: BacktestResult;
  tags: string[];
  isPublic: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
  strategy?: {
    _id: string;
    name: string;
    type: string;
    status: string;
  };
}

export interface BacktestStatusCounts {
  total: number;
  PENDING: number;
  RUNNING: number;
  COMPLETED: number;
  FAILED: number;
  CANCELLED: number;
}

export interface GetBacktestsOptions {
  status?: string;
  strategyId?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

class BacktestingAPI {
  private baseURL: string;

  constructor() {
    this.baseURL = `${API_BASE_URL}/backtests`;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    };

    // Get token from localStorage if available
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        defaultOptions.headers = {
          ...defaultOptions.headers,
          Authorization: `Bearer ${token}`,
        };
      }
    }

    const config = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        // Handle rate limiting specifically
        if (response.status === 429) {
          throw {
            success: false,
            message: 'Too many requests. Please wait a moment before trying again.',
            status: 429
          };
        }
        throw data;
      }

      return data;
    } catch (error) {
      if (error instanceof TypeError) {
        throw {
          success: false,
          message: 'Network error. Please check your connection.',
        };
      }
      throw error;
    }
  }

  // Get user's backtests
  async getBacktests(options: GetBacktestsOptions = {}) {
    const params = new URLSearchParams();
    
    if (options.status) params.append('status', options.status);
    if (options.strategyId) params.append('strategyId', options.strategyId);
    if (options.search) params.append('search', options.search);
    if (options.sortBy) params.append('sortBy', options.sortBy);
    if (options.sortOrder) params.append('sortOrder', options.sortOrder);
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.offset) params.append('offset', options.offset.toString());

    const queryString = params.toString();
    const endpoint = queryString ? `/?${queryString}` : '/';

    const response = await this.makeRequest<{ 
      success: boolean; 
      data: Backtest[]; 
      pagination: any 
    }>(endpoint);
    
    return {
      backtests: response.data,
      pagination: response.pagination
    };
  }

  // Get backtest status counts
  async getStatusCounts(): Promise<BacktestStatusCounts> {
    const response = await this.makeRequest<{ 
      success: boolean; 
      data: BacktestStatusCounts 
    }>('/status-counts');
    return response.data;
  }

  // Create new backtest
  async createBacktest(config: BacktestConfig): Promise<Backtest> {
    const response = await this.makeRequest<{ 
      success: boolean; 
      data: Backtest 
    }>('/', {
      method: 'POST',
      body: JSON.stringify(config),
    });
    return response.data;
  }

  // Get backtest by ID
  async getBacktest(id: string): Promise<Backtest> {
    const response = await this.makeRequest<{ 
      success: boolean; 
      data: Backtest 
    }>(`/${id}`);
    return response.data;
  }

  // Delete backtest
  async deleteBacktest(id: string): Promise<void> {
    await this.makeRequest<{ 
      success: boolean; 
      message: string 
    }>(`/${id}`, {
      method: 'DELETE',
    });
  }

  // Cancel running backtest
  async cancelBacktest(id: string): Promise<Backtest> {
    const response = await this.makeRequest<{ 
      success: boolean; 
      data: Backtest 
    }>(`/${id}/cancel`, {
      method: 'POST',
    });
    return response.data;
  }

  // Retry failed backtest
  async retryBacktest(id: string): Promise<Backtest> {
    const response = await this.makeRequest<{ 
      success: boolean; 
      data: Backtest 
    }>(`/${id}/retry`, {
      method: 'POST',
    });
    return response.data;
  }

  // Get running backtests (for real-time updates)
  async getRunningBacktests(): Promise<Backtest[]> {
    const response = await this.makeRequest<{ 
      success: boolean; 
      data: Backtest[] 
    }>('/running');
    return response.data;
  }

  // Clone backtest with new configuration
  async cloneBacktest(id: string, config: Partial<BacktestConfig>): Promise<Backtest> {
    const response = await this.makeRequest<{ 
      success: boolean; 
      data: Backtest 
    }>(`/${id}/clone`, {
      method: 'POST',
      body: JSON.stringify(config),
    });
    return response.data;
  }

  // Update backtest metadata (name, description, tags)
  async updateBacktest(id: string, updates: { 
    name?: string; 
    description?: string; 
    tags?: string[] 
  }): Promise<Backtest> {
    const response = await this.makeRequest<{ 
      success: boolean; 
      data: Backtest 
    }>(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return response.data;
  }
}

export const backtestingApi = new BacktestingAPI();