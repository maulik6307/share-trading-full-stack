export interface User {
  id: string;
  name: string;
  email: string;
  timezone: string;
  preferences: UserPreferences;
  createdAt: Date;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  notifications: NotificationSettings;
  defaultCurrency: string;
  dateFormat: string;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  trading: boolean;
  system: boolean;
}