import type { User } from '@/types/user';

/**
 * Validates that a user object has all required fields
 */
export const validateUserObject = (user: any): user is User => {
  if (!user || typeof user !== 'object') {
    console.error('User validation failed: user is not an object', user);
    return false;
  }

  const requiredFields = ['id', 'name', 'email', 'username'];
  for (const field of requiredFields) {
    if (!user[field]) {
      console.error(`User validation failed: missing required field '${field}'`, user);
      return false;
    }
  }

  // Check preferences structure
  if (!user.preferences || typeof user.preferences !== 'object') {
    console.error('User validation failed: preferences is missing or invalid', user);
    return false;
  }

  // Check subscription structure
  if (!user.subscription || typeof user.subscription !== 'object') {
    console.error('User validation failed: subscription is missing or invalid', user);
    return false;
  }

  return true;
};

/**
 * Creates a safe default user object for fallback scenarios
 */
export const createDefaultUser = (partialUser: Partial<User> = {}): User => {
  return {
    id: partialUser.id || 'default-user',
    name: partialUser.name || 'Default User',
    email: partialUser.email || 'user@example.com',
    username: partialUser.username || 'defaultuser',
    avatar: partialUser.avatar,
    role: partialUser.role || 'user',
    phone: partialUser.phone,
    country: partialUser.country || 'US',
    bio: partialUser.bio,
    timezone: partialUser.timezone || 'UTC',
    language: partialUser.language || 'en',
    preferences: {
      theme: 'light',
      currency: 'USD',
      defaultCurrency: 'USD',
      dateFormat: 'DD/MM/YYYY',
      notifications: {
        email: true,
        push: true,
        sms: false,
        trading: true,
        marketing: false,
        system: true,
      },
      ...partialUser.preferences,
    },
    subscription: {
      plan: 'free',
      status: 'active',
      ...partialUser.subscription,
    },
    createdAt: partialUser.createdAt || new Date(),
    lastLoginAt: partialUser.lastLoginAt || new Date(),
  };
};

/**
 * Safely converts API user data to frontend User type with validation
 */
export const safeConvertApiUser = (apiUser: any): User => {
  try {
    // Basic validation
    if (!apiUser) {
      throw new Error('API user data is null or undefined');
    }

    // Create user with safe defaults
    const user = createDefaultUser({
      id: apiUser.id,
      name: apiUser.name,
      email: apiUser.email,
      username: apiUser.username,
      avatar: apiUser.avatar,
      role: apiUser.role,
      phone: apiUser.phone,
      country: apiUser.country,
      bio: apiUser.bio,
      timezone: apiUser.timezone,
      language: apiUser.language,
      createdAt: apiUser.createdAt ? new Date(apiUser.createdAt) : undefined,
      lastLoginAt: apiUser.lastLoginAt ? new Date(apiUser.lastLoginAt) : undefined,
    });

    // Safely merge preferences
    if (apiUser.preferences) {
      user.preferences = {
        ...user.preferences,
        theme: apiUser.preferences.theme || user.preferences.theme,
        dateFormat: apiUser.preferences.dateFormat || user.preferences.dateFormat,
      };
    }

    // Safely merge trading preferences
    if (apiUser.tradingPreferences) {
      user.preferences.currency = (apiUser.tradingPreferences.defaultCurrency || user.preferences.currency) as any;
      user.preferences.defaultCurrency = apiUser.tradingPreferences.defaultCurrency || user.preferences.defaultCurrency;
      
      if (apiUser.tradingPreferences.notifications) {
        user.preferences.notifications = {
          ...user.preferences.notifications,
          ...apiUser.tradingPreferences.notifications,
        };
      }
    }

    // Safely merge subscription
    if (apiUser.subscription) {
      user.subscription = {
        ...user.subscription,
        plan: apiUser.subscription.plan || user.subscription.plan,
        status: apiUser.subscription.status || user.subscription.status,
        expiresAt: apiUser.subscription.endDate ? new Date(apiUser.subscription.endDate) : undefined,
      };
    }

    // Final validation
    if (!validateUserObject(user)) {
      throw new Error('Converted user object failed validation');
    }

    return user;
  } catch (error) {
    console.error('Error converting API user:', error, apiUser);
    // Return a safe default user as fallback
    return createDefaultUser({
      id: apiUser?.id || 'fallback-user',
      name: apiUser?.name || 'User',
      email: apiUser?.email || 'user@example.com',
      username: apiUser?.username || 'user',
    });
  }
};