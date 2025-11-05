import { User } from '@/types/user';

export const mockUser: User = {
  id: '1',
  name: 'John Doe',
  email: 'john.doe@example.com',
  username: 'johndoe',
  role: 'user',
  timezone: 'Asia/Kolkata',
  preferences: {
    theme: 'light',
    currency: 'USD',
    notifications: {
      email: true,
      push: true,
      sms: false,
      trading: true,
      marketing: false,
      system: true,
    },
    defaultCurrency: 'INR',
    dateFormat: 'DD/MM/YYYY',
  },
  subscription: {
    plan: 'free',
    status: 'active',
  },
  createdAt: new Date('2024-01-01T00:00:00Z'),
  lastLoginAt: new Date('2024-01-01T00:00:00Z'),
};