'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layout';
import { Button, Label, useToast } from '@/components/ui';
import { useAuthStore } from '@/stores/auth-store';
import { Bell, Mail, Smartphone, MessageSquare, TrendingUp, AlertTriangle, Settings, Volume2, VolumeX } from 'lucide-react';

interface NotificationPreferences {
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

export default function NotificationsPage() {
  const { user, setUser } = useAuthStore();
  const { addToast } = useToast();
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email: {
      enabled: user?.preferences?.notifications?.email ?? true,
      trading: true,
      system: true,
      marketing: false,
      security: true,
    },
    push: {
      enabled: user?.preferences?.notifications?.push ?? true,
      trading: true,
      system: true,
      alerts: true,
      news: false,
    },
    sms: {
      enabled: user?.preferences?.notifications?.sms ?? false,
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
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'channels' | 'trading' | 'frequency'>('channels');

  const handleSave = async () => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (user) {
        setUser({
          ...user,
          preferences: {
            ...user.preferences,
            notifications: {
              email: preferences.email.enabled,
              push: preferences.push.enabled,
              sms: preferences.sms.enabled,
              trading: preferences.trading.orderFills,
              system: preferences.inApp.system,
            },
          },
        });
      }
      
      addToast({
        type: 'success',
        title: 'Preferences Saved',
        description: 'Your notification preferences have been updated.',
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Save Failed',
        description: 'Failed to save notification preferences. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestNotification = (type: string) => {
    addToast({
      type: 'info',
      title: 'Test Notification',
      description: `This is a test ${type} notification.`,
    });
  };

  const updatePreference = (category: keyof NotificationPreferences, key: string, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
  };

  const updateNestedPreference = (category: keyof NotificationPreferences, parent: string, key: string, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [parent]: {
          ...(prev[category] as any)[parent],
          [key]: value,
        },
      },
    }));
  };

  if (!user) {
    return null;
  }

  const ToggleSwitch = ({ checked, onChange, disabled = false }: { checked: boolean; onChange: (checked: boolean) => void; disabled?: boolean }) => (
    <label className={`relative inline-flex items-center cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      <input
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
      />
      <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-primary-600"></div>
    </label>
  );

  return (
    <MainLayout user={user}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
            Notification Settings
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">
            Configure how and when you receive notifications about your trading activity.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-neutral-200 dark:border-neutral-700">
          <nav className="flex space-x-8">
            {[
              { id: 'channels', label: 'Notification Channels', icon: Bell },
              { id: 'trading', label: 'Trading Notifications', icon: TrendingUp },
              { id: 'frequency', label: 'Frequency & Timing', icon: Settings },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === id
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Notification Channels Tab */}
        {activeTab === 'channels' && (
          <div className="space-y-6">
            {/* Email Notifications */}
            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                      Email Notifications
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Receive notifications via email at {user.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTestNotification('email')}
                  >
                    Test
                  </Button>
                  <ToggleSwitch
                    checked={preferences.email.enabled}
                    onChange={(checked) => updatePreference('email', 'enabled', checked)}
                  />
                </div>
              </div>
              
              <div className="space-y-3 ml-8">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Trading Activity</Label>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">
                      Order fills, position updates, and trading alerts
                    </p>
                  </div>
                  <ToggleSwitch
                    checked={preferences.email.trading}
                    onChange={(checked) => updatePreference('email', 'trading', checked)}
                    disabled={!preferences.email.enabled}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>System Updates</Label>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">
                      Account changes, security alerts, and system maintenance
                    </p>
                  </div>
                  <ToggleSwitch
                    checked={preferences.email.system}
                    onChange={(checked) => updatePreference('email', 'system', checked)}
                    disabled={!preferences.email.enabled}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Security Alerts</Label>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">
                      Login attempts, password changes, and security events
                    </p>
                  </div>
                  <ToggleSwitch
                    checked={preferences.email.security}
                    onChange={(checked) => updatePreference('email', 'security', checked)}
                    disabled={!preferences.email.enabled}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Marketing & Updates</Label>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">
                      Product updates, tips, and promotional content
                    </p>
                  </div>
                  <ToggleSwitch
                    checked={preferences.email.marketing}
                    onChange={(checked) => updatePreference('email', 'marketing', checked)}
                    disabled={!preferences.email.enabled}
                  />
                </div>
              </div>
            </div>

            {/* Push Notifications */}
            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                      Push Notifications
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Real-time notifications to your browser or mobile device
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTestNotification('push')}
                  >
                    Test
                  </Button>
                  <ToggleSwitch
                    checked={preferences.push.enabled}
                    onChange={(checked) => updatePreference('push', 'enabled', checked)}
                  />
                </div>
              </div>
              
              <div className="space-y-3 ml-8">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Trading Alerts</Label>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">
                      Immediate notifications for trading events
                    </p>
                  </div>
                  <ToggleSwitch
                    checked={preferences.push.trading}
                    onChange={(checked) => updatePreference('push', 'trading', checked)}
                    disabled={!preferences.push.enabled}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>System Notifications</Label>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">
                      System status and important updates
                    </p>
                  </div>
                  <ToggleSwitch
                    checked={preferences.push.system}
                    onChange={(checked) => updatePreference('push', 'system', checked)}
                    disabled={!preferences.push.enabled}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Price Alerts</Label>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">
                      Price movement and watchlist alerts
                    </p>
                  </div>
                  <ToggleSwitch
                    checked={preferences.push.alerts}
                    onChange={(checked) => updatePreference('push', 'alerts', checked)}
                    disabled={!preferences.push.enabled}
                  />
                </div>
              </div>
            </div>

            {/* SMS Notifications */}
            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                      SMS Notifications
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Critical alerts sent to your mobile phone
                    </p>
                  </div>
                </div>
                <ToggleSwitch
                  checked={preferences.sms.enabled}
                  onChange={(checked) => updatePreference('sms', 'enabled', checked)}
                />
              </div>
              
              <div className="space-y-3 ml-8">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Security Events</Label>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">
                      Login attempts and security-related events
                    </p>
                  </div>
                  <ToggleSwitch
                    checked={preferences.sms.security}
                    onChange={(checked) => updatePreference('sms', 'security', checked)}
                    disabled={!preferences.sms.enabled}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Critical Alerts</Label>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">
                      High-priority trading and system alerts
                    </p>
                  </div>
                  <ToggleSwitch
                    checked={preferences.sms.critical}
                    onChange={(checked) => updatePreference('sms', 'critical', checked)}
                    disabled={!preferences.sms.enabled}
                  />
                </div>
              </div>
            </div>

            {/* In-App Notifications */}
            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                      In-App Notifications
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Notifications displayed within the application
                    </p>
                  </div>
                </div>
                <ToggleSwitch
                  checked={preferences.inApp.enabled}
                  onChange={(checked) => updatePreference('inApp', 'enabled', checked)}
                />
              </div>
              
              <div className="space-y-3 ml-8">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Sound Notifications</Label>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">
                      Play sound for important notifications
                    </p>
                  </div>
                  <ToggleSwitch
                    checked={preferences.inApp.sound}
                    onChange={(checked) => updatePreference('inApp', 'sound', checked)}
                    disabled={!preferences.inApp.enabled}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Desktop Notifications</Label>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">
                      Show notifications even when app is in background
                    </p>
                  </div>
                  <ToggleSwitch
                    checked={preferences.inApp.desktop}
                    onChange={(checked) => updatePreference('inApp', 'desktop', checked)}
                    disabled={!preferences.inApp.enabled}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Trading Notifications Tab */}
        {activeTab === 'trading' && (
          <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  Trading Event Notifications
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Configure which trading events trigger notifications
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Order Fills</Label>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                    Notify when orders are executed (full or partial fills)
                  </p>
                </div>
                <ToggleSwitch
                  checked={preferences.trading.orderFills}
                  onChange={(checked) => updatePreference('trading', 'orderFills', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Position Updates</Label>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                    Notify when positions are opened, closed, or modified
                  </p>
                </div>
                <ToggleSwitch
                  checked={preferences.trading.positionUpdates}
                  onChange={(checked) => updatePreference('trading', 'positionUpdates', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Risk Alerts</Label>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                    Notify when risk limits are approached or breached
                  </p>
                </div>
                <ToggleSwitch
                  checked={preferences.trading.riskAlerts}
                  onChange={(checked) => updatePreference('trading', 'riskAlerts', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Price Alerts</Label>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                    Notify when watchlist symbols reach target prices
                  </p>
                </div>
                <ToggleSwitch
                  checked={preferences.trading.priceAlerts}
                  onChange={(checked) => updatePreference('trading', 'priceAlerts', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Strategy Updates</Label>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                    Notify about strategy deployment, pausing, and performance
                  </p>
                </div>
                <ToggleSwitch
                  checked={preferences.trading.strategyUpdates}
                  onChange={(checked) => updatePreference('trading', 'strategyUpdates', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Backtest Completion</Label>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                    Notify when backtests finish running
                  </p>
                </div>
                <ToggleSwitch
                  checked={preferences.trading.backtestComplete}
                  onChange={(checked) => updatePreference('trading', 'backtestComplete', checked)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Frequency & Timing Tab */}
        {activeTab === 'frequency' && (
          <div className="space-y-6">
            {/* Notification Frequency */}
            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <div className="flex items-center gap-3 mb-6">
                <Settings className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                    Notification Frequency
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Control how often you receive notifications
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Immediate Notifications</Label>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">
                      Receive notifications as events occur
                    </p>
                  </div>
                  <ToggleSwitch
                    checked={preferences.frequency.immediate}
                    onChange={(checked) => updatePreference('frequency', 'immediate', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Daily Digest</Label>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">
                      Receive a summary of daily activity
                    </p>
                  </div>
                  <ToggleSwitch
                    checked={preferences.frequency.digest}
                    onChange={(checked) => updatePreference('frequency', 'digest', checked)}
                  />
                </div>
                
                {preferences.frequency.digest && (
                  <div className="ml-6">
                    <Label htmlFor="digestTime">Digest Time</Label>
                    <input
                      id="digestTime"
                      type="time"
                      value={preferences.frequency.digestTime}
                      onChange={(e) => updatePreference('frequency', 'digestTime', e.target.value)}
                      className="mt-1 block w-32 px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Quiet Hours */}
            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {preferences.frequency.quietHours.enabled ? (
                    <VolumeX className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  ) : (
                    <Volume2 className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  )}
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                      Quiet Hours
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Suppress non-critical notifications during specified hours
                    </p>
                  </div>
                </div>
                <ToggleSwitch
                  checked={preferences.frequency.quietHours.enabled}
                  onChange={(checked) => updateNestedPreference('frequency', 'quietHours', 'enabled', checked)}
                />
              </div>
              
              {preferences.frequency.quietHours.enabled && (
                <div className="ml-8 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="quietStart">Start Time</Label>
                      <input
                        id="quietStart"
                        type="time"
                        value={preferences.frequency.quietHours.start}
                        onChange={(e) => updateNestedPreference('frequency', 'quietHours', 'start', e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="quietEnd">End Time</Label>
                      <input
                        id="quietEnd"
                        type="time"
                        value={preferences.frequency.quietHours.end}
                        onChange={(e) => updateNestedPreference('frequency', 'quietHours', 'end', e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                    Critical security and trading alerts will still be delivered during quiet hours.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <Button
            variant="outline"
            disabled={isLoading}
            onClick={() => {
              // Reset to default values
              setPreferences({
                email: { enabled: true, trading: true, system: true, marketing: false, security: true },
                push: { enabled: true, trading: true, system: true, alerts: true, news: false },
                sms: { enabled: false, security: true, critical: true },
                inApp: { enabled: true, sound: true, desktop: true, trading: true, system: true },
                trading: { orderFills: true, positionUpdates: true, riskAlerts: true, priceAlerts: true, strategyUpdates: true, backtestComplete: true },
                frequency: { immediate: true, digest: false, digestTime: '09:00', quietHours: { enabled: false, start: '22:00', end: '08:00' } },
              });
            }}
          >
            Reset to Defaults
          </Button>
          <Button
            onClick={handleSave}
            loading={isLoading}
            disabled={isLoading}
          >
            Save Preferences
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}