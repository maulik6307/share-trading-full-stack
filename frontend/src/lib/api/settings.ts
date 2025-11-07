import { apiClient } from './client';

// Remove demo mode checks - let all API calls go through to backend

// Types
export interface ProfileData {
  name: string;
  email: string;
  phone?: string;
  country?: string;
  bio?: string;
  timezone?: string;
  language?: string;
  theme?: 'light' | 'dark';
  currency?: string;
  dateFormat?: string;
}

export interface SecuritySettings {
  twoFactorAuth: {
    enabled: boolean;
    method: 'app' | 'sms' | 'email';
  };
  loginAlerts: {
    enabled: boolean;
    newDevice: boolean;
    newLocation: boolean;
    failedAttempts: boolean;
  };
  sessionManagement: {
    autoLogout: boolean;
    timeoutMinutes: number;
    maxSessions: number;
  };
  privacy: {
    profileVisibility: 'public' | 'private';
    activityTracking: boolean;
    dataSharing: boolean;
    marketingConsent: boolean;
  };
}

export interface NotificationPreferences {
  email: {
    enabled: boolean;
    trading: boolean;
    system: boolean;
    marketing: boolean;
    security: boolean;
  };
  push: {
    enabled: boolean;
    trading: boolean;
    system: boolean;
    alerts: boolean;
    news: boolean;
  };
  sms: {
    enabled: boolean;
    security: boolean;
    critical: boolean;
  };
  inApp: {
    enabled: boolean;
    sound: boolean;
    desktop: boolean;
    trading: boolean;
    system: boolean;
  };
  trading: {
    orderFills: boolean;
    positionUpdates: boolean;
    riskAlerts: boolean;
    priceAlerts: boolean;
    strategyUpdates: boolean;
    backtestComplete: boolean;
  };
  frequency: {
    immediate: boolean;
    digest: boolean;
    digestTime: string;
    quietHours: {
      enabled: boolean;
      start: string;
      end: string;
    };
  };
}

export interface BillingInfo {
  plan: {
    name: string;
    price: number;
    interval: 'monthly' | 'yearly';
    features: string[];
    status: 'active' | 'trial' | 'cancelled';
    trialEndsAt?: Date;
    nextBillingDate?: Date;
  };
  paymentMethod?: {
    type: 'card' | 'bank';
    last4: string;
    brand: string;
    expiryMonth: number;
    expiryYear: number;
  };
  billingHistory: Array<{
    id: string;
    date: Date;
    amount: number;
    status: 'paid' | 'pending' | 'failed';
    description: string;
    invoiceUrl?: string;
  }>;
  usage: {
    backtests: { used: number; limit: number };
    strategies: { used: number; limit: number };
    paperTrades: { used: number; limit: number };
    dataFeeds: { used: number; limit: number };
  };
}

export interface Session {
  id: string;
  device: string;
  location: string;
  lastActive: Date;
  current: boolean;
}

// Profile API
export const profileAPI = {
  // Get profile data
  getProfile: async () => {
    const response = await apiClient.get('/settings/profile');
    return response.data;
  },

  // Update profile
  updateProfile: async (data: Partial<ProfileData>) => {
    const response = await apiClient.put('/settings/profile', data);
    return response.data;
  },
};

// Security API
export const securityAPI = {
  // Get security settings
  getSettings: async () => {
    const response = await apiClient.get('/settings/security');
    return response.data;
  },

  // Update security settings
  updateSettings: async (settings: Partial<SecuritySettings>) => {
    const response = await apiClient.put('/settings/security', settings);
    return response.data;
  },

  // Enable 2FA
  enable2FA: async (method: 'app' | 'sms' | 'email' = 'app') => {
    const response = await apiClient.post('/settings/security/2fa/enable', { method });
    return response.data;
  },

  // Disable 2FA
  disable2FA: async (password: string) => {
    const response = await apiClient.post('/settings/security/2fa/disable', { password });
    return response.data;
  },

  // Get active sessions
  getSessions: async () => {
    const response = await apiClient.get('/settings/security/sessions');
    return response.data;
  },
};

// Notifications API
export const notificationsAPI = {
  // Get notification preferences
  getPreferences: async () => {
    const response = await apiClient.get('/settings/notifications');
    return response.data;
  },

  // Update notification preferences
  updatePreferences: async (preferences: NotificationPreferences) => {
    const response = await apiClient.put('/settings/notifications', { preferences });
    return response.data;
  },
};

// Billing API
export const billingAPI = {
  // Get billing information
  getBillingInfo: async () => {
    const response = await apiClient.get('/settings/billing');
    return response.data;
  },

  // Upgrade plan
  upgradePlan: async (planName: string, interval: 'monthly' | 'yearly' = 'monthly') => {
    const response = await apiClient.post('/settings/billing/upgrade', { planName, interval });
    return response.data;
  },
};