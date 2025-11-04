'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types/user';
import { authAPI, type LoginCredentials, type RegisterData } from '@/lib/api/auth';
import { telemetryService } from '@/mocks/services/telemetry-service';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, username: string, password: string, phone?: string, country?: string) => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: User) => void;
  updateUser: (userData: Partial<User>) => Promise<void>;
  updatePassword: (passwordData: { currentPassword: string; newPassword: string; confirmPassword: string }) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (resetToken: string, password: string, confirmPassword: string) => Promise<void>;
  refreshToken: () => Promise<void>;
  clearError: () => void;
  initializeAuth: () => void;
  setupDemoUser: () => void;
}

interface AuthStore extends AuthState, AuthActions { }

// Helper function to convert API user to frontend User type
const convertApiUserToUser = (apiUser: any): User => ({
  id: apiUser.id,
  name: apiUser.name,
  email: apiUser.email,
  username: apiUser.username,
  avatar: apiUser.avatar,
  role: apiUser.role as 'user' | 'premium' | 'admin',
  phone: apiUser.phone,
  country: apiUser.country,
  bio: apiUser.bio,
  timezone: apiUser.timezone,
  language: apiUser.language,
  preferences: {
    theme: 'light',
    currency: apiUser.tradingPreferences.defaultCurrency as 'USD' | 'EUR' | 'GBP',
    defaultCurrency: apiUser.tradingPreferences.defaultCurrency,
    dateFormat: 'DD/MM/YYYY',
    notifications: {
      email: apiUser.tradingPreferences.notifications.email,
      push: apiUser.tradingPreferences.notifications.push,
      sms: apiUser.tradingPreferences.notifications.sms,
      trading: apiUser.tradingPreferences.notifications.trading,
      marketing: apiUser.tradingPreferences.notifications.marketing,
      system: true // Default value since backend doesn't have this yet
    }
  },
  subscription: {
    plan: apiUser.subscription.plan as 'free' | 'basic' | 'premium' | 'enterprise',
    status: apiUser.subscription.status as 'active' | 'inactive' | 'cancelled',
    expiresAt: apiUser.subscription.endDate ? new Date(apiUser.subscription.endDate) : undefined
  },
  createdAt: new Date(),
  lastLoginAt: new Date()
});

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      signIn: async (email: string, password: string) => {
        set({ isLoading: true, error: null });

        try {
          const credentials: LoginCredentials = {
            identifier: email,
            password,
            rememberMe: true
          };

          const response = await authAPI.login(credentials);

          // Convert API user to our User type
          const user = convertApiUserToUser(response.data.user);

          telemetryService.setUserId(user.id);
          telemetryService.trackUserAction({
            action: 'signed_in',
            category: 'user',
            metadata: { method: 'email' }
          });

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Login failed'
          });
          throw error;
        }
      },

      signUp: async (name: string, email: string, username: string, password: string, phone?: string, country?: string) => {
        set({ isLoading: true, error: null });

        try {
          const userData: RegisterData = {
            name,
            email,
            username,
            password,
            phone,
            country
          };

          const response = await authAPI.register(userData);

          // Convert API user to our User type
          const user = convertApiUserToUser(response.data.user);

          telemetryService.setUserId(user.id);
          telemetryService.trackUserAction({
            action: 'signed_up',
            category: 'user',
            metadata: { method: 'email' }
          });

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Registration failed'
          });
          throw error;
        }
      },

      signOut: async () => {
        set({ isLoading: true });

        try {
          await authAPI.logout();

          telemetryService.trackUserAction({
            action: 'signed_out',
            category: 'user'
          });
        } catch (error) {
          console.error('Logout API error:', error);
        } finally {
          // Clear the state
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          });

          // Force clear the persisted storage
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth-store');
          }
        }
      },

      setUser: (user: User) => {
        set({ user, isAuthenticated: true });
      },

      updateUser: async (userData: Partial<User>) => {
        set({ isLoading: true, error: null });

        try {
          // Convert our User type to API format
          const apiUserData = {
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            country: userData.country,
            bio: userData.bio,
            timezone: userData.timezone,
            language: userData.language
          };

          const response = await authAPI.updateDetails(apiUserData);

          // Update the user in store
          const { user } = get();
          if (user) {
            const updatedUser = { ...user, ...userData };
            set({
              user: updatedUser,
              isLoading: false,
              error: null
            });
          }
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Update failed'
          });
          throw error;
        }
      },

      updatePassword: async (passwordData: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
        set({ isLoading: true, error: null });

        try {
          await authAPI.updatePassword(passwordData);
          set({ isLoading: false, error: null });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Password update failed'
          });
          throw error;
        }
      },

      forgotPassword: async (email: string) => {
        set({ isLoading: true, error: null });

        try {
          await authAPI.forgotPassword(email);
          set({ isLoading: false, error: null });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Failed to send reset email'
          });
          throw error;
        }
      },

      resetPassword: async (resetToken: string, password: string, confirmPassword: string) => {
        set({ isLoading: true, error: null });

        try {
          const response = await authAPI.resetPassword(resetToken, password, confirmPassword);

          // Convert API user to our User type and set as authenticated
          const user = convertApiUserToUser(response.data.user);

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Password reset failed'
          });
          throw error;
        }
      },

      refreshToken: async () => {
        try {
          const response = await authAPI.refreshToken();

          // Update user data
          const user = convertApiUserToUser(response.data.user);

          set({
            user,
            isAuthenticated: true,
            error: null
          });
        } catch (error: any) {
          // If refresh fails, logout user
          set({
            user: null,
            isAuthenticated: false,
            error: 'Session expired'
          });
          throw error;
        }
      },

      clearError: () => {
        set({ error: null });
      },

      initializeAuth: () => {
        // Check if user is authenticated on app start
        const isAuthenticated = authAPI.isAuthenticated();
        const storedUser = authAPI.getStoredUser();

        if (isAuthenticated && storedUser) {
          // Convert stored API user to our User type
          const user = convertApiUserToUser(storedUser);

          set({
            user,
            isAuthenticated: true
          });
        } else {
          // For demo purposes, set up a demo user if no authentication
          get().setupDemoUser();
        }
      },

      setupDemoUser: () => {
        const demoUser: User = {
          id: 'demo-user-1',
          name: 'Demo User',
          email: 'demo@example.com',
          username: 'demo_user',
          avatar: undefined,
          role: 'user',
          phone: undefined,
          country: 'IN',
          bio: 'Demo user for paper trading',
          timezone: 'Asia/Kolkata',
          language: 'en',
          preferences: {
            theme: 'light',
            currency: 'INR',
            defaultCurrency: 'INR',
            dateFormat: 'DD/MM/YYYY',
            notifications: {
              email: true,
              push: true,
              sms: false,
              trading: true,
              marketing: false,
            },
          },
        };

        set({
          user: demoUser,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });

        // Store demo token for WebSocket connection
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', 'demo-token');
          localStorage.setItem('user', JSON.stringify(demoUser));
        }
      }
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);