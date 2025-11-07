import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

// API Response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    // Always send token if it exists (including demo token)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common responses
apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    // Return the data directly for successful responses
    return {
      ...response,
      data: response.data.data || response.data
    };
  },
  (error: AxiosError<ApiResponse>) => {
    // Handle common error cases
    if (error.response?.status === 401) {
      // Check if this is a demo token
      const token = localStorage.getItem('token');
      if (token === 'demo-token-valid') {
        console.log('Demo mode: 401 error, but keeping demo session');
        return Promise.reject(new Error('Demo mode: Authentication issue'));
      }
      
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/auth/login';
      return Promise.reject(new Error('Authentication required'));
    }

    if (error.response?.status === 403) {
      return Promise.reject(new Error('Access forbidden'));
    }

    if (error.response?.status === 404) {
      return Promise.reject(new Error('Resource not found'));
    }

    if (error.response && error.response.status >= 500) {
      return Promise.reject(new Error('Server error. Please try again later.'));
    }

    // Return the error message from the API response
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        error.message || 
                        'An unexpected error occurred';
    
    return Promise.reject(new Error(errorMessage));
  }
);

export { apiClient };
export default apiClient;