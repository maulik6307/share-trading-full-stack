/**
 * Authentication API service
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export interface LoginCredentials {
  identifier: string; // email or username
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  username: string;
  password: string;
  phone?: string;
  country?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  role: string;
  isVerified: boolean;
  avatar?: string;
  subscription: {
    plan: string;
    status: string;
  };
  tradingPreferences: {
    defaultCurrency: string;
    riskTolerance: string;
    tradingExperience: string;
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
      trading: boolean;
      marketing: boolean;
    };
  };
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    refreshToken: string;
    user: User;
  };
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

class AuthAPI {
  private baseURL: string;

  constructor() {
    this.baseURL = `${API_BASE_URL}/auth`;
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
      credentials: 'include', // Include cookies for authentication
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
      // Handle network errors
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
   * Register a new user
   */
  async register(userData: RegisterData): Promise<AuthResponse> {
    const response = await this.makeRequest<AuthResponse>('/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    // Store token in localStorage
    if (response.success && response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response;
  }

  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.makeRequest<AuthResponse>('/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    // Store token in localStorage
    if (response.success && response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response;
  }

  /**
   * Logout user
   */
  async logout(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.makeRequest<{ success: boolean; message: string }>('/logout', {
        method: 'POST',
      });

      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');

      return response;
    } catch (error) {
      // Even if the API call fails, clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      throw error;
    }
  }

  /**
   * Get current user
   */
  async getMe(): Promise<{ success: boolean; data: { user: User } }> {
    return this.makeRequest<{ success: boolean; data: { user: User } }>('/me');
  }

  /**
   * Update user details
   */
  async updateDetails(userData: Partial<User>): Promise<{ success: boolean; message: string; data: { user: User } }> {
    const response = await this.makeRequest<{ success: boolean; message: string; data: { user: User } }>('/updatedetails', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });

    // Update user in localStorage
    if (response.success) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response;
  }

  /**
   * Update password
   */
  async updatePassword(passwordData: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<AuthResponse> {
    return this.makeRequest<AuthResponse>('/updatepassword', {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    });
  }

  /**
   * Forgot password
   */
  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    return this.makeRequest<{ success: boolean; message: string }>('/forgotpassword', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  /**
   * Reset password
   */
  async resetPassword(resetToken: string, password: string, confirmPassword: string): Promise<AuthResponse> {
    return this.makeRequest<AuthResponse>(`/resetpassword/${resetToken}`, {
      method: 'PUT',
      body: JSON.stringify({ password, confirmPassword }),
    });
  }

  /**
   * Refresh token
   */
  async refreshToken(): Promise<AuthResponse> {
    const response = await this.makeRequest<AuthResponse>('/refresh', {
      method: 'POST',
    });

    // Update token in localStorage
    if (response.success && response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;

    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    return !!(token && user);
  }

  /**
   * Get stored user data
   */
  getStoredUser(): User | null {
    if (typeof window === 'undefined') return null;

    const userStr = localStorage.getItem('user');
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  /**
   * Get stored token
   */
  getStoredToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }
}

export const authAPI = new AuthAPI();