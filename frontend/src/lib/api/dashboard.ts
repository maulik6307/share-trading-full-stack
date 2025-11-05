/**
 * Dashboard API service
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export interface KPIMetric {
  current: number;
  change: {
    value: number;
    period: string;
    isPositive: boolean;
  };
}

export interface StrategyMetric {
  current: number;
  profitable: number;
  description: string;
}

export interface PositionMetric {
  current: number;
  profitable: number;
  description: string;
}

export interface KPIData {
  portfolioValue: KPIMetric;
  roi30d: KPIMetric;
  activeStrategies: StrategyMetric;
  openPositions: PositionMetric;
  totalReturn: KPIMetric;
  winRate: KPIMetric;
}

export interface PerformanceData {
  date: string;
  value: number;
  benchmark: number;
}

export interface Activity {
  _id: string;
  type: 'trade' | 'strategy' | 'alert' | 'system' | 'deposit' | 'withdrawal';
  action: string;
  title: string;
  description: string;
  status: 'success' | 'warning' | 'error' | 'info' | 'pending';
  symbol?: string;
  amount?: number;
  quantity?: number;
  price?: number;
  timestamp: string;
  metadata: Record<string, any>;
}

export interface Alert {
  _id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  category: 'risk' | 'performance' | 'position' | 'strategy' | 'system' | 'market';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  isRead: boolean;
  isActionable: boolean;
  symbol?: string;
  timestamp: string;
  metadata: Record<string, any>;
}

export interface Portfolio {
  id: string;
  name: string;
  totalValue: number;
  currency: string;
  lastUpdated: string;
}

export interface DashboardData {
  portfolio: Portfolio;
  kpi: KPIData;
  performance: PerformanceData[];
  activities: Activity[];
  alerts: Alert[];
}

export interface DashboardOptions {
  includePerformance?: boolean;
  includeActivities?: boolean;
  includeAlerts?: boolean;
  performanceDays?: number;
  activitiesLimit?: number;
  alertsLimit?: number;
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface ActivityFilters extends PaginationParams {
  type?: Activity['type'];
  status?: Activity['status'];
}

export interface AlertFilters extends PaginationParams {
  type?: Alert['type'];
  priority?: Alert['priority'];
  unreadOnly?: boolean;
}

class DashboardAPI {
  private baseURL: string;

  constructor() {
    this.baseURL = `${API_BASE_URL}/dashboard`;
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

  /**
   * Get complete dashboard data
   */
  async getDashboard(options: DashboardOptions = {}): Promise<{ success: boolean; data: DashboardData }> {
    const params = new URLSearchParams();
    
    if (options.includePerformance !== undefined) {
      params.append('includePerformance', options.includePerformance.toString());
    }
    if (options.includeActivities !== undefined) {
      params.append('includeActivities', options.includeActivities.toString());
    }
    if (options.includeAlerts !== undefined) {
      params.append('includeAlerts', options.includeAlerts.toString());
    }
    if (options.performanceDays) {
      params.append('performanceDays', options.performanceDays.toString());
    }
    if (options.activitiesLimit) {
      params.append('activitiesLimit', options.activitiesLimit.toString());
    }
    if (options.alertsLimit) {
      params.append('alertsLimit', options.alertsLimit.toString());
    }

    const queryString = params.toString();
    const endpoint = queryString ? `/?${queryString}` : '/';

    return this.makeRequest<{ success: boolean; data: DashboardData }>(endpoint);
  }

  /**
   * Get KPI data only
   */
  async getKPIData(): Promise<{ success: boolean; data: KPIData }> {
    return this.makeRequest<{ success: boolean; data: KPIData }>('/kpi');
  }

  /**
   * Get performance chart data
   */
  async getPerformanceData(days: number = 30): Promise<{ success: boolean; data: PerformanceData[] }> {
    return this.makeRequest<{ success: boolean; data: PerformanceData[] }>(`/performance?days=${days}`);
  }

  /**
   * Get recent activities
   */
  async getActivities(filters: ActivityFilters = {}): Promise<{
    success: boolean;
    data: Activity[];
    pagination: {
      total: number;
      limit: number;
      offset: number;
      hasMore: boolean;
    };
  }> {
    const params = new URLSearchParams();
    
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.offset) params.append('offset', filters.offset.toString());
    if (filters.type) params.append('type', filters.type);
    if (filters.status) params.append('status', filters.status);

    const queryString = params.toString();
    const endpoint = queryString ? `/activities?${queryString}` : '/activities';

    return this.makeRequest(endpoint);
  }

  /**
   * Get alerts
   */
  async getAlerts(filters: AlertFilters = {}): Promise<{
    success: boolean;
    data: Alert[];
    meta: {
      unreadCount: number;
    };
    pagination: {
      total: number;
      limit: number;
      offset: number;
      hasMore: boolean;
    };
  }> {
    const params = new URLSearchParams();
    
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.offset) params.append('offset', filters.offset.toString());
    if (filters.type) params.append('type', filters.type);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.unreadOnly !== undefined) {
      params.append('unreadOnly', filters.unreadOnly.toString());
    }

    const queryString = params.toString();
    const endpoint = queryString ? `/alerts?${queryString}` : '/alerts';

    return this.makeRequest(endpoint);
  }

  /**
   * Get dashboard stats summary
   */
  async getStats(): Promise<{
    success: boolean;
    data: {
      totalActivities: number;
      unreadAlerts: number;
      portfolioValue: number;
      lastUpdated: string;
    };
  }> {
    return this.makeRequest<{
      success: boolean;
      data: {
        totalActivities: number;
        unreadAlerts: number;
        portfolioValue: number;
        lastUpdated: string;
      };
    }>('/stats');
  }

  /**
   * Mark alert as read
   */
  async markAlertAsRead(alertId: string): Promise<{ success: boolean; message: string }> {
    return this.makeRequest<{ success: boolean; message: string }>(`/alerts/${alertId}/read`, {
      method: 'PUT',
    });
  }

  /**
   * Dismiss alert
   */
  async dismissAlert(alertId: string): Promise<{ success: boolean; message: string }> {
    return this.makeRequest<{ success: boolean; message: string }>(`/alerts/${alertId}`, {
      method: 'DELETE',
    });
  }
}

export const dashboardAPI = new DashboardAPI();