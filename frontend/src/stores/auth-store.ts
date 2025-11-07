'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types/user';
import { authAPI, type LoginCredentials, type RegisterData } from '@/lib/api/auth';
import { telemetryService } from '@/mocks/services/telemetry-service';
import { safeConvertApiUser } from '@/utils/user-helpers';

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

// Use the safe conversion function from utils
const convertApiUserToUser = safeConvertApiUser;

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

          // Force clear all auth-related storage
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth-store');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('auth-token');
            localStorage.removeItem('demo-user-settings'); // Clear demo settings too
          }
        }
      },

      setUser: (user: User) => {
        set({ user, isAuthenticated: true });
      },

      updateUser: async (userData: Partial<User>) => {
        set({ isLoading: true, error: null });

        try {
          // Import settings API dynamically to avoid circular dependency
          const { profileAPI } = await import('@/lib/api/settings');
          
          // Convert our User type to API format
          const apiUserData = {
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            country: userData.country,
            bio: userData.bio,
            timezone: userData.timezone,
            language: userData.language,
            theme: userData.preferences?.theme,
            currency: userData.preferences?.currency,
            dateFormat: userData.preferences?.dateFormat
          };

          const response = await profileAPI.updateProfile(apiUserData);

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
          try {
            // Convert stored API user to our User type with error handling
            const user = convertApiUserToUser(storedUser);

            set({
              user,
              isAuthenticated: true
            });
          } catch (error) {
            console.error('Error converting stored user:', error);
            // If conversion fails, clear auth state
            set({
              user: null,
              isAuthenticated: false,
              error: null
            });
          }
        } else {
          // No authenticated user - stay logged out
          set({
            user: null,
            isAuthenticated: false,
            error: null
          });
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
              system: true,
            },
          },
          subscription: {
            plan: 'free',
            status: 'active',
          },
          createdAt: new Date(),
          lastLoginAt: new Date(),
        };

        set({
          user: demoUser,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });

        // For demo user, we need to either generate a valid token or handle API calls differently
        // Let's store a demo token that the backend can recognize
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', 'demo-token-valid'); // Use a recognizable demo token
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