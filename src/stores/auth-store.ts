'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types/user';
import { mockUser } from '@/mocks/data/users';
import { telemetryService } from '@/mocks/services/telemetry-service';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthActions {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => void;
  setUser: (user: User) => void;
}

interface AuthStore extends AuthState, AuthActions {}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,

      // Actions
      signIn: async (email: string, password: string) => {
        set({ isLoading: true });
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock authentication - accept any email/password
        if (email && password) {
          const user = { ...mockUser, email };
          telemetryService.setUserId(user.id);
          telemetryService.trackUserAction({
            action: 'signed_in',
            category: 'user',
            metadata: { method: 'email' }
          });
          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false 
          });
        } else {
          set({ isLoading: false });
          throw new Error('Invalid credentials');
        }
      },

      signUp: async (name: string, email: string, password: string) => {
        set({ isLoading: true });
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock registration - accept any valid inputs
        if (name && email && password) {
          const user = { 
            ...mockUser, 
            name, 
            email,
            id: Math.random().toString(36).substr(2, 9)
          };
          telemetryService.setUserId(user.id);
          telemetryService.trackUserAction({
            action: 'signed_up',
            category: 'user',
            metadata: { method: 'email' }
          });
          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false 
          });
        } else {
          set({ isLoading: false });
          throw new Error('Invalid registration data');
        }
      },

      signOut: () => {
        telemetryService.trackUserAction({
          action: 'signed_out',
          category: 'user'
        });
        set({ 
          user: null, 
          isAuthenticated: false, 
          isLoading: false 
        });
      },

      setUser: (user: User) => {
        set({ user, isAuthenticated: true });
      },
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