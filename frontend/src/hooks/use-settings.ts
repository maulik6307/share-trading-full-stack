import { useState, useCallback } from 'react';
import { profileAPI, securityAPI, notificationsAPI, billingAPI } from '@/lib/api/settings';
import { supportAPI } from '@/lib/api/support';
import { useToast } from '@/components/ui';
import type { ProfileData, SecuritySettings, NotificationPreferences } from '@/lib/api/settings';

export const useSettings = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();

  // Profile settings
  const updateProfile = useCallback(async (data: Partial<ProfileData>) => {
    setIsLoading(true);
    try {
      const response = await profileAPI.updateProfile(data);
      addToast({
        type: 'success',
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated.',
      });
      return response;
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Update Failed',
        description: error.response?.data?.message || 'Failed to update profile.',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  // Security settings
  const updateSecuritySettings = useCallback(async (settings: Partial<SecuritySettings>) => {
    setIsLoading(true);
    try {
      const response = await securityAPI.updateSettings(settings);
      addToast({
        type: 'success',
        title: 'Security Settings Updated',
        description: 'Your security settings have been updated.',
      });
      return response;
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Update Failed',
        description: error.response?.data?.message || 'Failed to update security settings.',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  const enable2FA = useCallback(async (method: 'app' | 'sms' | 'email' = 'app') => {
    setIsLoading(true);
    try {
      const response = await securityAPI.enable2FA(method);
      addToast({
        type: 'success',
        title: '2FA Enabled',
        description: 'Two-factor authentication has been successfully enabled.',
      });
      return response;
    } catch (error: any) {
      addToast({
        type: 'error',
        title: '2FA Setup Failed',
        description: error.response?.data?.message || 'Failed to enable two-factor authentication.',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  const disable2FA = useCallback(async (password: string) => {
    setIsLoading(true);
    try {
      const response = await securityAPI.disable2FA(password);
      addToast({
        type: 'success',
        title: '2FA Disabled',
        description: 'Two-factor authentication has been disabled.',
      });
      return response;
    } catch (error: any) {
      addToast({
        type: 'error',
        title: '2FA Disable Failed',
        description: error.response?.data?.message || 'Failed to disable two-factor authentication.',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  // Notification settings
  const updateNotificationPreferences = useCallback(async (preferences: NotificationPreferences) => {
    setIsLoading(true);
    try {
      const response = await notificationsAPI.updatePreferences(preferences);
      addToast({
        type: 'success',
        title: 'Preferences Updated',
        description: 'Your notification preferences have been updated.',
      });
      return response;
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Update Failed',
        description: error.response?.data?.message || 'Failed to update notification preferences.',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  // Billing
  const upgradePlan = useCallback(async (planName: string, interval: 'monthly' | 'yearly' = 'monthly') => {
    setIsLoading(true);
    try {
      const response = await billingAPI.upgradePlan(planName, interval);
      addToast({
        type: 'success',
        title: 'Upgrade Initiated',
        description: `Upgrade to ${planName} plan has been initiated.`,
      });
      return response;
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Upgrade Failed',
        description: error.response?.data?.message || 'Failed to initiate upgrade.',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  // Support
  const createSupportTicket = useCallback(async (data: {
    subject: string;
    message: string;
    category: 'general' | 'technical' | 'billing' | 'bug' | 'feature';
    priority: 'low' | 'medium' | 'high' | 'urgent';
  }) => {
    setIsLoading(true);
    try {
      const response = await supportAPI.createTicket(data);
      addToast({
        type: 'success',
        title: 'Ticket Created',
        description: 'Your support ticket has been created. We will respond within 24 hours.',
      });
      return response;
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Submission Failed',
        description: error.response?.data?.message || 'Failed to submit your request.',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  return {
    isLoading,
    updateProfile,
    updateSecuritySettings,
    enable2FA,
    disable2FA,
    updateNotificationPreferences,
    upgradePlan,
    createSupportTicket,
  };
};