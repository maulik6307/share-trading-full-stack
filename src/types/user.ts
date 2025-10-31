export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  avatar?: string;
  role: 'user' | 'premium' | 'admin';
  phone?: string;
  country?: string;
  bio?: string;
  timezone?: string;
  language?: string;
  preferences: UserPreferences;
  subscription: UserSubscription;
  createdAt: Date;
  lastLoginAt: Date;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  currency: 'USD' | 'EUR' | 'GBP';
  defaultCurrency?: string;
  dateFormat?: string;
  notifications: NotificationSettings;
}

export interface UserSubscription {
  plan: 'free' | 'basic' | 'premium' | 'enterprise';
  status: 'active' | 'inactive' | 'cancelled';
  expiresAt?: Date;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  trading: boolean;
  marketing: boolean;
  system?: boolean;
}