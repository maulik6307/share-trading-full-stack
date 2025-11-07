'use client';

import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout';
import { Button, Input, Label, useToast } from '@/components/ui';
import { useAuthStore } from '@/stores/auth-store';
import { Shield, Key, Smartphone, Eye, EyeOff, AlertTriangle, CheckCircle, Clock, MapPin, Settings } from 'lucide-react';

interface SecuritySettings {
  twoFactorAuth: {
    enabled: boolean;
    method: 'app' | 'sms' | 'email';
    backupCodes: string[];
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

export default function SecurityPage() {
  const { user } = useAuthStore();
  const { addToast } = useToast();
  const [settings, setSettings] = useState<SecuritySettings>({
    twoFactorAuth: {
      enabled: false,
      method: 'app',
      backupCodes: [],
    },
    loginAlerts: {
      enabled: true,
      newDevice: true,
      newLocation: true,
      failedAttempts: true,
    },
    sessionManagement: {
      autoLogout: true,
      timeoutMinutes: 30,
      maxSessions: 3,
    },
    privacy: {
      profileVisibility: 'private',
      activityTracking: false,
      dataSharing: false,
      marketingConsent: false,
    },
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState<'password' | 'twoFactor' | 'sessions' | 'privacy'>('password');

  // Load security settings on component mount
  useEffect(() => {
    const loadSecuritySettings = async () => {
      try {
        const { securityAPI } = await import('@/lib/api/settings');
        const response = await securityAPI.getSettings();

        if (response.data) {
          setSettings(response.data);
        }
      } catch (error) {
        console.error('Failed to load security settings:', error);
        addToast({
          type: 'error',
          title: 'Load Failed',
          description: 'Failed to load security settings. Using defaults.',
        });
      } finally {
        setIsLoadingData(false);
      }
    };

    loadSecuritySettings();
  }, []); // Empty dependency array - only run once on mount

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      addToast({
        type: 'error',
        title: 'Password Mismatch',
        description: 'New password and confirmation do not match.',
      });
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      addToast({
        type: 'error',
        title: 'Password Too Short',
        description: 'Password must be at least 8 characters long.',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      addToast({
        type: 'success',
        title: 'Password Updated',
        description: 'Your password has been successfully changed.',
      });

      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Password Change Failed',
        description: 'Failed to update password. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnable2FA = async () => {
    setIsLoading(true);

    try {
      const { securityAPI } = await import('@/lib/api/settings');

      const response = await securityAPI.enable2FA(settings.twoFactorAuth.method);

      // Backend returns: { success: true, data: { backupCodes: [...], qrCodeUrl?: string } }
      const backupCodes = response.data?.backupCodes || [];
      const qrCodeUrl = response.data?.qrCodeUrl;

      setSettings(prev => ({
        ...prev,
        twoFactorAuth: {
          ...prev.twoFactorAuth,
          enabled: true,
          backupCodes: backupCodes,
          qrCodeUrl: qrCodeUrl,
        },
      }));

      addToast({
        type: 'success',
        title: '2FA Enabled',
        description: 'Two-factor authentication has been successfully enabled.',
      });
    } catch (error: any) {
      addToast({
        type: 'error',
        title: '2FA Setup Failed',
        description: error.response?.data?.message || 'Failed to enable two-factor authentication. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    // First, prompt for password
    const password = prompt('Please enter your current password to disable 2FA:');
    if (!password) return;

    setIsLoading(true);

    try {
      const { securityAPI } = await import('@/lib/api/settings');

      await securityAPI.disable2FA(password);

      setSettings(prev => ({
        ...prev,
        twoFactorAuth: {
          ...prev.twoFactorAuth,
          enabled: false,
          backupCodes: [],
        },
      }));

      addToast({
        type: 'success',
        title: '2FA Disabled',
        description: 'Two-factor authentication has been disabled.',
      });
    } catch (error: any) {
      addToast({
        type: 'error',
        title: '2FA Disable Failed',
        description: error.response?.data?.message || 'Failed to disable two-factor authentication. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);

    try {
      const { securityAPI } = await import('@/lib/api/settings');

      await securityAPI.updateSettings({
        loginAlerts: settings.loginAlerts,
        sessionManagement: settings.sessionManagement,
        privacy: settings.privacy,
      });

      addToast({
        type: 'success',
        title: 'Settings Saved',
        description: 'Your security settings have been updated.',
      });
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Save Failed',
        description: error.response?.data?.message || 'Failed to save security settings. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetting = (category: keyof SecuritySettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
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

  const mockSessions = [
    {
      id: '1',
      device: 'Chrome on Windows',
      location: 'Mumbai, India',
      lastActive: new Date(),
      current: true,
    },
    {
      id: '2',
      device: 'Safari on iPhone',
      location: 'Mumbai, India',
      lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
      current: false,
    },
    {
      id: '3',
      device: 'Firefox on macOS',
      location: 'Delhi, India',
      lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000),
      current: false,
    },
  ];

  if (isLoadingData) {
    return (
      <MainLayout user={user}>
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <span className="ml-3 text-neutral-600 dark:text-neutral-400">Loading security settings...</span>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout user={user}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
            Security Settings
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">
            Manage your account security and privacy preferences.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-neutral-200 dark:border-neutral-700">
          <nav className="flex space-x-8">
            {[
              { id: 'password', label: 'Password', icon: Key },
              { id: 'twoFactor', label: 'Two-Factor Auth', icon: Shield },
              { id: 'sessions', label: 'Active Sessions', icon: Smartphone },
              { id: 'privacy', label: 'Privacy', icon: Eye },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === id
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

        {/* Password Tab */}
        {activeTab === 'password' && (
          <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <Key className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  Change Password
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Update your password to keep your account secure
                </p>
              </div>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
              <div>
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showPasswords.current ? 'text' : 'password'}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                    placeholder="Enter current password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300"
                  >
                    {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="Enter new password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300"
                  >
                    {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirm new password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300"
                  >
                    {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  loading={isLoading}
                  disabled={isLoading || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                >
                  Update Password
                </Button>
              </div>
            </form>

            {/* Password Requirements */}
            <div className="mt-6 p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
              <h4 className="text-sm font-medium text-neutral-900 dark:text-white mb-2">
                Password Requirements
              </h4>
              <ul className="text-xs text-neutral-600 dark:text-neutral-400 space-y-1">
                <li>• At least 8 characters long</li>
                <li>• Contains uppercase and lowercase letters</li>
                <li>• Contains at least one number</li>
                <li>• Contains at least one special character</li>
              </ul>
            </div>
          </div>
        )}

        {/* Two-Factor Authentication Tab */}
        {activeTab === 'twoFactor' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                      Two-Factor Authentication
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {settings.twoFactorAuth.enabled ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  )}
                  <span className={`text-sm font-medium ${settings.twoFactorAuth.enabled
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-yellow-600 dark:text-yellow-400'
                    }`}>
                    {settings.twoFactorAuth.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>

              {!settings.twoFactorAuth.enabled ? (
                <div className="space-y-4">
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Two-factor authentication adds an extra layer of security by requiring a second form of verification when signing in.
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                      <Smartphone className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-neutral-900 dark:text-white">
                          Authenticator App (Recommended)
                        </p>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400">
                          Use Google Authenticator, Authy, or similar apps
                        </p>
                      </div>
                      <input
                        type="radio"
                        name="2faMethod"
                        value="app"
                        checked={settings.twoFactorAuth.method === 'app'}
                        onChange={(e) => updateSetting('twoFactorAuth', 'method', e.target.value)}
                        className="text-primary-600"
                      />
                    </div>

                    <div className="flex items-center gap-3 p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                      <Key className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-neutral-900 dark:text-white">
                          SMS Text Message
                        </p>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400">
                          Receive codes via text message
                        </p>
                      </div>
                      <input
                        type="radio"
                        name="2faMethod"
                        value="sms"
                        checked={settings.twoFactorAuth.method === 'sms'}
                        onChange={(e) => updateSetting('twoFactorAuth', 'method', e.target.value)}
                        className="text-primary-600"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleEnable2FA}
                    loading={isLoading}
                    disabled={isLoading}
                  >
                    Enable Two-Factor Authentication
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="text-sm font-medium text-green-900 dark:text-green-100">
                          Two-Factor Authentication is Active
                        </p>
                        <p className="text-xs text-green-700 dark:text-green-300">
                          Method: {settings.twoFactorAuth.method === 'app' ? 'Authenticator App' : 'SMS'}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDisable2FA}
                      loading={isLoading}
                      disabled={isLoading}
                    >
                      Disable
                    </Button>
                  </div>

                  {settings.twoFactorAuth.backupCodes.length > 0 && (
                    <div className="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                      <h4 className="text-sm font-medium text-neutral-900 dark:text-white mb-2">
                        Backup Codes
                      </h4>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-3">
                        Save these codes in a secure location. Each code can only be used once.
                      </p>
                      <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                        {settings.twoFactorAuth.backupCodes.map((code, index) => (
                          <div key={index} className="p-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded text-center">
                            {code}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Login Alerts */}
            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                    Login Alerts
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Get notified about suspicious login activity
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Login Alerts</Label>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">
                      Receive notifications for all login-related events
                    </p>
                  </div>
                  <ToggleSwitch
                    checked={settings.loginAlerts.enabled}
                    onChange={(checked) => updateSetting('loginAlerts', 'enabled', checked)}
                  />
                </div>

                <div className="ml-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>New Device Login</Label>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">
                        Alert when logging in from a new device
                      </p>
                    </div>
                    <ToggleSwitch
                      checked={settings.loginAlerts.newDevice}
                      onChange={(checked) => updateSetting('loginAlerts', 'newDevice', checked)}
                      disabled={!settings.loginAlerts.enabled}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>New Location Login</Label>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">
                        Alert when logging in from a new location
                      </p>
                    </div>
                    <ToggleSwitch
                      checked={settings.loginAlerts.newLocation}
                      onChange={(checked) => updateSetting('loginAlerts', 'newLocation', checked)}
                      disabled={!settings.loginAlerts.enabled}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Failed Login Attempts</Label>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">
                        Alert when there are multiple failed login attempts
                      </p>
                    </div>
                    <ToggleSwitch
                      checked={settings.loginAlerts.failedAttempts}
                      onChange={(checked) => updateSetting('loginAlerts', 'failedAttempts', checked)}
                      disabled={!settings.loginAlerts.enabled}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Active Sessions Tab */}
        {activeTab === 'sessions' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                      Active Sessions
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Manage your active login sessions across devices
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    addToast({
                      type: 'success',
                      title: 'Sessions Terminated',
                      description: 'All other sessions have been terminated.',
                    });
                  }}
                >
                  Terminate All Others
                </Button>
              </div>

              <div className="space-y-3">
                {mockSessions.map((session) => (
                  <div
                    key={session.id}
                    className={`p-4 border rounded-lg ${session.current
                      ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
                      : 'border-neutral-200 dark:border-neutral-700'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Smartphone className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                        <div>
                          <p className="text-sm font-medium text-neutral-900 dark:text-white">
                            {session.device}
                            {session.current && (
                              <span className="ml-2 text-xs text-green-600 dark:text-green-400 font-medium">
                                (Current Session)
                              </span>
                            )}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-neutral-600 dark:text-neutral-400">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {session.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Last active: {session.lastActive.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {!session.current && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            addToast({
                              type: 'success',
                              title: 'Session Terminated',
                              description: 'The session has been terminated.',
                            });
                          }}
                        >
                          Terminate
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Session Management Settings */}
            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Settings className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                    Session Management
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Configure automatic session management
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto Logout</Label>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">
                      Automatically log out after period of inactivity
                    </p>
                  </div>
                  <ToggleSwitch
                    checked={settings.sessionManagement.autoLogout}
                    onChange={(checked) => updateSetting('sessionManagement', 'autoLogout', checked)}
                  />
                </div>

                {settings.sessionManagement.autoLogout && (
                  <div className="ml-6">
                    <Label htmlFor="timeoutMinutes">Timeout (minutes)</Label>
                    <select
                      id="timeoutMinutes"
                      value={settings.sessionManagement.timeoutMinutes}
                      onChange={(e) => updateSetting('sessionManagement', 'timeoutMinutes', Number(e.target.value))}
                      className="mt-1 block w-32 px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white"
                    >
                      <option value={15}>15 minutes</option>
                      <option value={30}>30 minutes</option>
                      <option value={60}>1 hour</option>
                      <option value={120}>2 hours</option>
                      <option value={240}>4 hours</option>
                    </select>
                  </div>
                )}

                <div>
                  <Label htmlFor="maxSessions">Maximum Concurrent Sessions</Label>
                  <select
                    id="maxSessions"
                    value={settings.sessionManagement.maxSessions}
                    onChange={(e) => updateSetting('sessionManagement', 'maxSessions', Number(e.target.value))}
                    className="mt-1 block w-32 px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white"
                  >
                    <option value={1}>1 session</option>
                    <option value={3}>3 sessions</option>
                    <option value={5}>5 sessions</option>
                    <option value={10}>10 sessions</option>
                  </select>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                    Oldest sessions will be terminated when limit is exceeded
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Privacy Tab */}
        {activeTab === 'privacy' && (
          <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <Eye className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  Privacy Controls
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Control how your data is used and shared
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Profile Visibility</Label>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">
                      Control who can see your profile information
                    </p>
                  </div>
                  <select
                    value={settings.privacy.profileVisibility}
                    onChange={(e) => updateSetting('privacy', 'profileVisibility', e.target.value)}
                    className="px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white"
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Activity Tracking</Label>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">
                      Allow tracking of your activity for analytics and improvements
                    </p>
                  </div>
                  <ToggleSwitch
                    checked={settings.privacy.activityTracking}
                    onChange={(checked) => updateSetting('privacy', 'activityTracking', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Data Sharing</Label>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">
                      Share anonymized data to help improve our services
                    </p>
                  </div>
                  <ToggleSwitch
                    checked={settings.privacy.dataSharing}
                    onChange={(checked) => updateSetting('privacy', 'dataSharing', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Marketing Communications</Label>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">
                      Receive personalized marketing communications
                    </p>
                  </div>
                  <ToggleSwitch
                    checked={settings.privacy.marketingConsent}
                    onChange={(checked) => updateSetting('privacy', 'marketingConsent', checked)}
                  />
                </div>
              </div>

              {/* Data Export/Delete */}
              <div className="pt-6 border-t border-neutral-200 dark:border-neutral-700">
                <h4 className="text-sm font-medium text-neutral-900 dark:text-white mb-4">
                  Data Management
                </h4>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      addToast({
                        type: 'info',
                        title: 'Data Export',
                        description: 'Your data export will be ready shortly and sent to your email.',
                      });
                    }}
                  >
                    Export My Data
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      addToast({
                        type: 'info',
                        title: 'Account Deletion',
                        description: 'Account deletion process initiated. You will receive further instructions via email.',
                      });
                    }}
                    className="text-red-600 hover:text-red-700 dark:text-red-400"
                  >
                    Delete Account
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {activeTab !== 'password' && (
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              disabled={isLoading}
              onClick={() => {
                // Reset to defaults
                setSettings({
                  twoFactorAuth: { enabled: false, method: 'app', backupCodes: [] },
                  loginAlerts: { enabled: true, newDevice: true, newLocation: true, failedAttempts: true },
                  sessionManagement: { autoLogout: true, timeoutMinutes: 30, maxSessions: 3 },
                  privacy: { profileVisibility: 'private', activityTracking: false, dataSharing: false, marketingConsent: false },
                });
              }}
            >
              Reset to Defaults
            </Button>
            <Button
              onClick={handleSaveSettings}
              loading={isLoading}
              disabled={isLoading}
            >
              Save Settings
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}