'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { NavigationState, BreadcrumbItem } from '@/types/navigation';

interface NavigationStore extends NavigationState {
  // Actions
  toggleLeftRail: () => void;
  setLeftRailCollapsed: (collapsed: boolean) => void;
  toggleMobileMenu: () => void;
  setMobileMenuOpen: (open: boolean) => void;
  setCurrentPath: (path: string) => void;
  setBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => void;
}

export const useNavigationStore = create<NavigationStore>()(
  persist(
    (set) => ({
      // Initial state
      isLeftRailCollapsed: false,
      isMobileMenuOpen: false,
      currentPath: '/',
      breadcrumbs: [],

      // Actions
      toggleLeftRail: () =>
        set((state) => ({ isLeftRailCollapsed: !state.isLeftRailCollapsed })),
      
      setLeftRailCollapsed: (collapsed: boolean) =>
        set({ isLeftRailCollapsed: collapsed }),
      
      toggleMobileMenu: () =>
        set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
      
      setMobileMenuOpen: (open: boolean) =>
        set({ isMobileMenuOpen: open }),
      
      setCurrentPath: (path: string) =>
        set({ currentPath: path }),
      
      setBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) =>
        set({ breadcrumbs }),
    }),
    {
      name: 'navigation-store',
      partialize: (state) => ({
        isLeftRailCollapsed: state.isLeftRailCollapsed,
      }),
    }
  )
);