import { lazy } from 'react';

// Route-based code splitting utilities
export const createLazyComponent = <T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
) => {
  return lazy(importFn);
};

// Route configuration for dynamic imports
export const routes = {
  dashboard: () => import('@/app/page'),
  strategies: () => import('@/app/strategies/page'),
  strategyBuilder: () => import('@/app/strategies/builder/page'),
  backtesting: () => import('@/app/backtesting/page'),
  paperTrading: () => import('@/app/paper-trading/page'),
  settings: () => import('@/app/settings/page'),
  profile: () => import('@/app/settings/profile/page'),
  notifications: () => import('@/app/settings/notifications/page'),
} as const;

// Route metadata for SEO and navigation
export interface RouteMetadata {
  title: string;
  description: string;
  keywords?: string[];
}

export const routeMetadata: Record<string, RouteMetadata> = {
  '/': {
    title: 'Dashboard - ShareTrading',
    description: 'AI-driven paper trading and backtesting platform dashboard',
    keywords: ['trading', 'dashboard', 'AI', 'backtesting'],
  },
  '/strategies': {
    title: 'Strategy Library - ShareTrading',
    description: 'Manage and create your trading strategies',
    keywords: ['strategies', 'trading', 'algorithms'],
  },
  '/strategies/builder': {
    title: 'Strategy Builder - ShareTrading',
    description: 'Create and customize your trading strategies',
    keywords: ['strategy builder', 'trading', 'algorithms', 'code'],
  },
  '/backtesting': {
    title: 'Backtesting - ShareTrading',
    description: 'Test your strategies against historical data',
    keywords: ['backtesting', 'historical data', 'strategy testing'],
  },
  '/paper-trading': {
    title: 'Paper Trading - ShareTrading',
    description: 'Deploy and monitor your strategies in simulated trading',
    keywords: ['paper trading', 'simulation', 'live trading'],
  },
  '/settings': {
    title: 'Settings - ShareTrading',
    description: 'Manage your account and application preferences',
    keywords: ['settings', 'preferences', 'account'],
  },
  '/settings/profile': {
    title: 'Profile - ShareTrading',
    description: 'Manage your personal information and account details',
    keywords: ['profile', 'account', 'personal information'],
  },
  '/settings/notifications': {
    title: 'Notifications - ShareTrading',
    description: 'Configure your notification preferences',
    keywords: ['notifications', 'alerts', 'preferences'],
  },
};

// Get route metadata for a given path
export const getRouteMetadata = (path: string): RouteMetadata => {
  return routeMetadata[path] || {
    title: 'ShareTrading',
    description: 'AI-driven paper trading and backtesting platform',
  };
};