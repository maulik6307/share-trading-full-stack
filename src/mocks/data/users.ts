import { User } from '@/types/user';

export const mockUser: User = {
  id: '1',
  name: 'John Doe',
  email: 'john.doe@example.com',
  timezone: 'Asia/Kolkata',
  preferences: {
    theme: 'light',
    notifications: {
      email: true,
      push: true,
      sms: false,
      trading: true,
      system: true,
    },
    defaultCurrency: 'INR',
    dateFormat: 'DD/MM/YYYY',
  },
  createdAt: new Date('2024-01-01T00:00:00Z'),
};