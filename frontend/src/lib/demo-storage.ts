/**
 * Demo Storage Utility
 * Manages demo user data persistence in localStorage
 */

const DEMO_STORAGE_KEY = 'demo-user-settings';

interface DemoUserSettings {
  profile?: any;
  security?: any;
  notifications?: any;
  billing?: any;
}

export const demoStorage = {
  /**
   * Check if current user is demo user
   */
  isDemoUser: (): boolean => {
    const token = localStorage.getItem('auth-token');
    return token === 'demo-user-token';
  },

  /**
   * Get all demo user settings
   */
  getSettings: (): DemoUserSettings => {
    if (!demoStorage.isDemoUser()) return {};
    
    try {
      const stored = localStorage.getItem(DEMO_STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error reading demo settings:', error);
      return {};
    }
  },

  /**
   * Update specific demo user settings
   */
  updateSettings: (category: keyof DemoUserSettings, data: any): void => {
    if (!demoStorage.isDemoUser()) return;
    
    try {
      const current = demoStorage.getSettings();
      const updated = {
        ...current,
        [category]: data,
      };
      localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving demo settings:', error);
    }
  },

  /**
   * Get specific category settings
   */
  getCategorySettings: (category: keyof DemoUserSettings): any => {
    const settings = demoStorage.getSettings();
    return settings[category];
  },

  /**
   * Clear all demo user settings
   */
  clearSettings: (): void => {
    localStorage.removeItem(DEMO_STORAGE_KEY);
  },

  /**
   * Merge server response with stored demo settings
   */
  mergeWithStored: (category: keyof DemoUserSettings, serverData: any): any => {
    if (!demoStorage.isDemoUser()) return serverData;
    
    const stored = demoStorage.getCategorySettings(category);
    return stored || serverData;
  },
};
