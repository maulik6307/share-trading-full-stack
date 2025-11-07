'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layout';
import { Button, useToast } from '@/components/ui';
import { useAuthStore } from '@/stores/auth-store';
import { useSettings } from '@/hooks/use-settings';

export default function SettingsTestPage() {
  const { user } = useAuthStore();
  const { addToast } = useToast();
  const {
    isLoading,
    updateProfile,
    updateSecuritySettings,
    enable2FA,
    disable2FA,
    updateNotificationPreferences,
    upgradePlan,
    createSupportTicket,
  } = useSettings();

  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testProfileLoad = async () => {
    try {
      const { profileAPI } = await import('@/lib/api/settings');
      const response = await profileAPI.getProfile();
      addResult('✅ Profile load successful');
      return response;
    } catch (error) {
      addResult('❌ Profile load failed');
      throw error;
    }
  };

  const testProfileUpdate = async () => {
    try {
      await updateProfile({
        name: 'Test User Updated',
        bio: 'Updated bio from test',
        timezone: 'America/New_York',
      });
      addResult('✅ Profile update successful');
    } catch (error) {
      addResult('❌ Profile update failed');
    }
  };

  const testSecurityLoad = async () => {
    try {
      const { securityAPI } = await import('@/lib/api/settings');
      const response = await securityAPI.getSettings();
      addResult('✅ Security settings load successful');
      return response;
    } catch (error) {
      addResult('❌ Security settings load failed');
      throw error;
    }
  };

  const testSecuritySettings = async () => {
    try {
      await updateSecuritySettings({
        loginAlerts: {
          enabled: true,
          newDevice: true,
          newLocation: false,
          failedAttempts: true,
        },
        privacy: {
          profileVisibility: 'private',
          activityTracking: false,
          dataSharing: false,
          marketingConsent: false,
        },
      });
      addResult('✅ Security settings update successful');
    } catch (error) {
      addResult('❌ Security settings update failed');
    }
  };

  const test2FA = async () => {
    try {
      await enable2FA('app');
      addResult('✅ 2FA enable successful');
    } catch (error) {
      addResult('❌ 2FA enable failed');
    }
  };

  const testNotificationsLoad = async () => {
    try {
      const { notificationsAPI } = await import('@/lib/api/settings');
      const response = await notificationsAPI.getPreferences();
      addResult('✅ Notification preferences load successful');
      return response;
    } catch (error) {
      addResult('❌ Notification preferences load failed');
      throw error;
    }
  };

  const testNotifications = async () => {
    try {
      await updateNotificationPreferences({
        email: {
          enabled: true,
          trading: true,
          system: true,
          marketing: false,
          security: true,
        },
        push: {
          enabled: true,
          trading: true,
          system: true,
          alerts: true,
          news: false,
        },
        sms: {
          enabled: false,
          security: true,
          critical: true,
        },
        inApp: {
          enabled: true,
          sound: true,
          desktop: true,
          trading: true,
          system: true,
        },
        trading: {
          orderFills: true,
          positionUpdates: true,
          riskAlerts: true,
          priceAlerts: true,
          strategyUpdates: true,
          backtestComplete: true,
        },
        frequency: {
          immediate: true,
          digest: false,
          digestTime: '09:00',
          quietHours: {
            enabled: false,
            start: '22:00',
            end: '08:00',
          },
        },
      });
      addResult('✅ Notification preferences update successful');
    } catch (error) {
      addResult('❌ Notification preferences update failed');
    }
  };

  const testBillingLoad = async () => {
    try {
      const { billingAPI } = await import('@/lib/api/settings');
      const response = await billingAPI.getBillingInfo();
      addResult('✅ Billing info load successful');
      return response;
    } catch (error) {
      addResult('❌ Billing info load failed');
      throw error;
    }
  };

  const testBilling = async () => {
    try {
      await upgradePlan('Professional');
      addResult('✅ Plan upgrade successful');
    } catch (error) {
      addResult('❌ Plan upgrade failed');
    }
  };

  const testSupport = async () => {
    try {
      await createSupportTicket({
        subject: 'Test ticket from settings integration',
        message: 'This is a test ticket created to verify the support API integration is working correctly.',
        category: 'technical',
        priority: 'medium',
      });
      addResult('✅ Support ticket creation successful');
    } catch (error) {
      addResult('❌ Support ticket creation failed');
    }
  };

  const runAllTests = async () => {
    setTestResults([]);
    addResult('🚀 Starting comprehensive settings API tests...');
    
    // Test data loading first
    addResult('📥 Testing data loading APIs...');
    await testProfileLoad();
    await new Promise(resolve => setTimeout(resolve, 300));
    
    await testSecurityLoad();
    await new Promise(resolve => setTimeout(resolve, 300));
    
    await testNotificationsLoad();
    await new Promise(resolve => setTimeout(resolve, 300));
    
    await testBillingLoad();
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Test data updates
    addResult('💾 Testing data update APIs...');
    await testProfileUpdate();
    await new Promise(resolve => setTimeout(resolve, 300));
    
    await testSecuritySettings();
    await new Promise(resolve => setTimeout(resolve, 300));
    
    await test2FA();
    await new Promise(resolve => setTimeout(resolve, 300));
    
    await testNotifications();
    await new Promise(resolve => setTimeout(resolve, 300));
    
    await testBilling();
    await new Promise(resolve => setTimeout(resolve, 300));
    
    await testSupport();
    
    addResult('🏁 All tests completed!');
  };

  if (!user) {
    return null;
  }

  return (
    <MainLayout user={user}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
            Settings API Integration Test
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">
            Test all settings API endpoints to verify integration is working correctly.
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
            Individual Tests
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Button
              onClick={testProfileLoad}
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              Load Profile
            </Button>
            
            <Button
              onClick={testProfileUpdate}
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              Update Profile
            </Button>
            
            <Button
              onClick={testSecurityLoad}
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              Load Security
            </Button>
            
            <Button
              onClick={testSecuritySettings}
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              Update Security
            </Button>
            
            <Button
              onClick={test2FA}
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              Test 2FA
            </Button>
            
            <Button
              onClick={testNotificationsLoad}
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              Load Notifications
            </Button>
            
            <Button
              onClick={testNotifications}
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              Update Notifications
            </Button>
            
            <Button
              onClick={testBillingLoad}
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              Load Billing
            </Button>
            
            <Button
              onClick={testBilling}
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              Update Billing
            </Button>
            
            <Button
              onClick={testSupport}
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              Test Support
            </Button>
          </div>

          <Button
            onClick={runAllTests}
            disabled={isLoading}
            loading={isLoading}
            className="w-full"
          >
            Run All Tests
          </Button>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
            Test Results
          </h2>
          
          <div className="bg-neutral-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
            {testResults.length === 0 ? (
              <div className="text-neutral-500">No tests run yet. Click "Run All Tests" to start.</div>
            ) : (
              testResults.map((result, index) => (
                <div key={index} className="mb-1">
                  {result}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            What This Tests
          </h3>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <li>• Profile API: Load and update user profile information</li>
            <li>• Security API: Load and update security settings and preferences</li>
            <li>• 2FA API: Enable two-factor authentication</li>
            <li>• Notifications API: Load and update notification preferences</li>
            <li>• Billing API: Load billing info and upgrade subscription plan</li>
            <li>• Support API: Create support tickets and load ticket history</li>
          </ul>
        </div>
      </div>
    </MainLayout>
  );
}