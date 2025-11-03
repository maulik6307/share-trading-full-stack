/**
 * Strategies API service
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

// Types
export interface Strategy {
  _id: string;
  userId: string;
  name: string;
  description: string;
  type: 'VISUAL' | 'CODE' | 'TEMPLATE';
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'STOPPED';
  parameters: Record<string, any>;
  code?: string;
  templateId?: string;
  template?: {
    _id: string;
    name: string;
    category: string;
  };
  tags: string[];
  performance?: {
    totalReturn: number;
    totalReturnPercent: number;
    sharpeRatio: number;
    maxDrawdown: number;
    maxDrawdownPercent: number;
    winRate: number;
    profitFactor: number;
    totalTrades: number;
    winningTrades: number;
    losingTrades: number;
    avgWin: number;
    avgLoss: number;
    largestWin: number;
    largestLoss: number;
  };
  version: string;
  isPublic: boolean;
  isArchived: boolean;
  views: number;
  clones: number;
  deployedAt?: string;
  lastRunAt?: string;
  lastModifiedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface StrategyTemplate {
  _id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  defaultParameters: Record<string, any>;
  parameterSchema: ParameterSchema[];
  code: string;
  isBuiltIn: boolean;
  isPublic: boolean;
  isActive: boolean;
  createdBy?: {
    _id: string;
    name: string;
    username: string;
  };
  usageCount: number;
  rating: number;
  ratingCount: number;
  version: string;
  documentation: string;
  examples?: {
    name: string;
    description: string;
    parameters: Record<string, any>;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface ParameterSchema {
  key: string;
  label: string;
  type: 'number' | 'string' | 'boolean' | 'select' | 'range';
  defaultValue: any;
  min?: number;
  max?: number;
  step?: number;
  options?: { label: string; value: any }[];
  required: boolean;
  description?: string;
}

export interface StrategyStatusCounts {
  total: number;
  ACTIVE: number;
  PAUSED: number;
  STOPPED: number;
  DRAFT: number;
}

export interface PerformanceSummary {
  totalStrategies: number;
  activeStrategies: number;
  profitableStrategies: number;
  totalReturn: number;
  avgWinRate: number;
  bestPerformer: Strategy | null;
  worstPerformer: Strategy | null;
}

export interface GetStrategiesOptions {
  status?: string;
  search?: string;
  tags?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
  includeArchived?: boolean;
}

export interface GetTemplatesOptions {
  category?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface CreateStrategyData {
  name: string;
  description: string;
  type: 'VISUAL' | 'CODE' | 'TEMPLATE';
  parameters?: Record<string, any>;
  code?: string;
  templateId?: string;
  tags?: string[];
}

export interface UpdateStrategyData {
  name?: string;
  description?: string;
  parameters?: Record<string, any>;
  code?: string;
  tags?: string[];
}

export interface CreateFromTemplateData {
  name: string;
  description?: string;
  parameters?: Record<string, any>;
  tags?: string[];
}

class StrategiesAPI {
  private baseURL: string;

  constructor() {
    this.baseURL = `${API_BASE_URL}/strategies`;
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

  // Get user's strategies
  async getStrategies(options: GetStrategiesOptions = {}) {
    const params = new URLSearchParams();
    
    if (options.status) params.append('status', options.status);
    if (options.search) params.append('search', options.search);
    if (options.tags?.length) params.append('tags', options.tags.join(','));
    if (options.sortBy) params.append('sortBy', options.sortBy);
    if (options.sortOrder) params.append('sortOrder', options.sortOrder);
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.offset) params.append('offset', options.offset.toString());
    if (options.includeArchived) params.append('includeArchived', 'true');

    const queryString = params.toString();
    const endpoint = queryString ? `/?${queryString}` : '/';

    const response = await this.makeRequest<{ success: boolean; data: Strategy[]; pagination: any }>(endpoint);
    return {
      strategies: response.data,
      pagination: response.pagination
    };
  }

  // Get strategy status counts
  async getStatusCounts(): Promise<StrategyStatusCounts> {
    const response = await this.makeRequest<{ success: boolean; data: StrategyStatusCounts }>('/status-counts');
    return response.data;
  }

  // Create new strategy
  async createStrategy(data: CreateStrategyData): Promise<Strategy> {
    const response = await this.makeRequest<{ success: boolean; data: Strategy }>('/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  // Get strategy by ID
  async getStrategy(id: string): Promise<Strategy> {
    const response = await this.makeRequest<{ success: boolean; data: Strategy }>(`/${id}`);
    return response.data;
  }

  // Update strategy
  async updateStrategy(id: string, data: UpdateStrategyData): Promise<Strategy> {
    const response = await this.makeRequest<{ success: boolean; data: Strategy }>(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  // Delete strategy
  async deleteStrategy(id: string): Promise<void> {
    await this.makeRequest<{ success: boolean; message: string }>(`/${id}`, {
      method: 'DELETE',
    });
  }

  // Clone strategy
  async cloneStrategy(id: string, name?: string): Promise<Strategy> {
    const response = await this.makeRequest<{ success: boolean; data: Strategy }>(`/${id}/clone`, {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
    return response.data;
  }

  // Deploy strategy
  async deployStrategy(id: string): Promise<Strategy> {
    const response = await this.makeRequest<{ success: boolean; data: Strategy }>(`/${id}/deploy`, {
      method: 'POST',
    });
    return response.data;
  }

  // Pause strategy
  async pauseStrategy(id: string): Promise<Strategy> {
    const response = await this.makeRequest<{ success: boolean; data: Strategy }>(`/${id}/pause`, {
      method: 'POST',
    });
    return response.data;
  }

  // Stop strategy
  async stopStrategy(id: string): Promise<Strategy> {
    const response = await this.makeRequest<{ success: boolean; data: Strategy }>(`/${id}/stop`, {
      method: 'POST',
    });
    return response.data;
  }

  // Get templates
  async getTemplates(options: GetTemplatesOptions = {}) {
    const params = new URLSearchParams();
    
    if (options.category) params.append('category', options.category);
    if (options.search) params.append('search', options.search);
    if (options.sortBy) params.append('sortBy', options.sortBy);
    if (options.sortOrder) params.append('sortOrder', options.sortOrder);
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.offset) params.append('offset', options.offset.toString());

    const queryString = params.toString();
    const endpoint = queryString ? `/templates?${queryString}` : '/templates';

    const response = await this.makeRequest<{ success: boolean; data: StrategyTemplate[]; pagination: any }>(endpoint);
    return {
      templates: response.data,
      pagination: response.pagination
    };
  }

  // Get template categories
  async getTemplateCategories(): Promise<string[]> {
    const response = await this.makeRequest<{ success: boolean; data: string[] }>('/templates/categories');
    return response.data;
  }

  // Get popular templates
  async getPopularTemplates(limit = 10): Promise<StrategyTemplate[]> {
    const response = await this.makeRequest<{ success: boolean; data: StrategyTemplate[] }>(`/templates/popular?limit=${limit}`);
    return response.data;
  }

  // Create strategy from template
  async createFromTemplate(templateId: string, data: CreateFromTemplateData): Promise<Strategy> {
    const response = await this.makeRequest<{ success: boolean; data: Strategy }>(`/templates/${templateId}/create`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  // Get performance summary
  async getPerformanceSummary(): Promise<PerformanceSummary> {
    const response = await this.makeRequest<{ success: boolean; data: PerformanceSummary }>('/performance/summary');
    return response.data;
  }
}

export const strategiesApi = new StrategiesAPI();