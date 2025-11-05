'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layout';
import { Button, Input, Select, Label, useToast } from '@/components/ui';
import { useAuthStore } from '@/stores/auth-store';
import { User, Mail, Clock, Globe, DollarSign, Calendar, Camera, Edit3 } from 'lucide-react';

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    timezone: user?.timezone || 'Asia/Kolkata',
    defaultCurrency: user?.preferences?.defaultCurrency || 'INR',
    dateFormat: user?.preferences?.dateFormat || 'DD/MM/YYYY',
    theme: (user?.preferences?.theme || 'light') as 'light' | 'dark',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'localization'>('profile');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (user) {
        setUser({
          ...user,
          name: formData.name,
          email: formData.email,
          timezone: formData.timezone,
          preferences: {
            ...user.preferences,
            defaultCurrency: formData.defaultCurrency,
            dateFormat: formData.dateFormat,
            theme: formData.theme as 'light' | 'dark',
          },
        });
      }
      
      addToast({
        type: 'success',
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated.',
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Update Failed',
        description: 'Failed to update profile. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = () => {
    // Simulate avatar upload
    addToast({
      type: 'info',
      title: 'Avatar Upload',
      description: 'Avatar upload functionality coming soon.',
    });
  };

  if (!user) {
    return null;
  }

  const timezones = [
    { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST)' },
    { value: 'America/New_York', label: 'America/New_York (EST)' },
    { value: 'America/Los_Angeles', label: 'America/Los_Angeles (PST)' },
    { value: 'Europe/London', label: 'Europe/London (GMT)' },
    { value: 'Asia/Tokyo', label: 'Asia/Tokyo (JST)' },
    { value: 'Asia/Shanghai', label: 'Asia/Shanghai (CST)' },
    { value: 'Australia/Sydney', label: 'Australia/Sydney (AEDT)' },
    { value: 'Europe/Paris', label: 'Europe/Paris (CET)' },
  ];

  const currencies = [
    { value: 'INR', label: 'Indian Rupee (₹)' },
    { value: 'USD', label: 'US Dollar ($)' },
    { value: 'EUR', label: 'Euro (€)' },
    { value: 'GBP', label: 'British Pound (£)' },
    { value: 'JPY', label: 'Japanese Yen (¥)' },
    { value: 'AUD', label: 'Australian Dollar (A$)' },
    { value: 'CAD', label: 'Canadian Dollar (C$)' },
  ];

  const dateFormats = [
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (31/12/2024)' },
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (12/31/2024)' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (2024-12-31)' },
    { value: 'DD-MM-YYYY', label: 'DD-MM-YYYY (31-12-2024)' },
  ];

  const themes = [
    { value: 'light', label: 'Light Theme' },
    { value: 'dark', label: 'Dark Theme' },
  ];

  return (
    <MainLayout user={user}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
            Profile Settings
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">
            Manage your account information and preferences.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-neutral-200 dark:border-neutral-700">
          <nav className="flex space-x-8">
            {[
              { id: 'profile', label: 'Profile Information', icon: User },
              { id: 'preferences', label: 'Display Preferences', icon: Edit3 },
              { id: 'localization', label: 'Localization', icon: Globe },
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Information Tab */}
          {activeTab === 'profile' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Avatar Section */}
              <div className="lg:col-span-1">
                <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                    Profile Picture
                  </h3>
                  <div className="flex flex-col items-center space-y-4">
                    <div className="relative">
                      <div className="w-24 h-24 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                        <User className="w-12 h-12 text-primary-600 dark:text-primary-400" />
                      </div>
                      <button
                        type="button"
                        onClick={handleAvatarUpload}
                        className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary-600 hover:bg-primary-700 text-white rounded-full flex items-center justify-center transition-colors"
                      >
                        <Camera className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-neutral-900 dark:text-white">
                        {user.name}
                      </p>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">
                        {user.email}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAvatarUpload}
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Change Photo
                    </Button>
                  </div>
                </div>
              </div>

              {/* Profile Form */}
              <div className="lg:col-span-2">
                <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-6">
                    Personal Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">
                        <User className="inline h-4 w-4 mr-2" />
                        Full Name
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter your full name"
                        disabled={isLoading}
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">
                        <Mail className="inline h-4 w-4 mr-2" />
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="Enter your email address"
                        disabled={isLoading}
                      />
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                        This email will be used for account notifications and login.
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="timezone">
                        <Globe className="inline h-4 w-4 mr-2" />
                        Timezone
                      </Label>
                      <Select
                        value={formData.timezone}
                        onChange={(e) => setFormData(prev => ({ ...prev, timezone: e.target.value }))}
                        options={timezones}
                        disabled={isLoading}
                      />
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                        Used for displaying dates and times in your local timezone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Display Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-6">
                Display Preferences
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="theme">
                    <Edit3 className="inline h-4 w-4 mr-2" />
                    Theme
                  </Label>
                  <Select
                    value={formData.theme}
                    onChange={(e) => setFormData(prev => ({ ...prev, theme: e.target.value as 'light' | 'dark' }))}
                    options={themes}
                    disabled={isLoading}
                  />
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                    Choose your preferred color scheme for the interface.
                  </p>
                </div>

                <div>
                  <Label htmlFor="currency">
                    <DollarSign className="inline h-4 w-4 mr-2" />
                    Default Currency
                  </Label>
                  <Select
                    value={formData.defaultCurrency}
                    onChange={(e) => setFormData(prev => ({ ...prev, defaultCurrency: e.target.value }))}
                    options={currencies}
                    disabled={isLoading}
                  />
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                    Currency used for displaying prices and calculations.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Localization Tab */}
          {activeTab === 'localization' && (
            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-6">
                Localization Settings
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="dateFormat">
                    <Calendar className="inline h-4 w-4 mr-2" />
                    Date Format
                  </Label>
                  <Select
                    value={formData.dateFormat}
                    onChange={(e) => setFormData(prev => ({ ...prev, dateFormat: e.target.value }))}
                    options={dateFormats}
                    disabled={isLoading}
                  />
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                    Format used for displaying dates throughout the application.
                  </p>
                </div>

                <div>
                  <Label htmlFor="timezone-localization">
                    <Globe className="inline h-4 w-4 mr-2" />
                    Timezone
                  </Label>
                  <Select
                    value={formData.timezone}
                    onChange={(e) => setFormData(prev => ({ ...prev, timezone: e.target.value }))}
                    options={timezones}
                    disabled={isLoading}
                  />
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                    All times will be displayed in this timezone.
                  </p>
                </div>
              </div>

              {/* Preview Section */}
              <div className="mt-6 p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                <h4 className="text-sm font-medium text-neutral-900 dark:text-white mb-3">
                  Preview
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-600 dark:text-neutral-400">Current Date:</span>
                    <span className="text-neutral-900 dark:text-white">
                      {new Date().toLocaleDateString('en-US', {
                        timeZone: formData.timezone,
                        day: formData.dateFormat.includes('DD') ? '2-digit' : 'numeric',
                        month: formData.dateFormat.includes('MM') ? '2-digit' : 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600 dark:text-neutral-400">Current Time:</span>
                    <span className="text-neutral-900 dark:text-white">
                      {new Date().toLocaleTimeString('en-US', {
                        timeZone: formData.timezone,
                        hour12: false,
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600 dark:text-neutral-400">Sample Price:</span>
                    <span className="text-neutral-900 dark:text-white">
                      {formData.defaultCurrency === 'INR' && '₹'}
                      {formData.defaultCurrency === 'USD' && '$'}
                      {formData.defaultCurrency === 'EUR' && '€'}
                      {formData.defaultCurrency === 'GBP' && '£'}
                      {formData.defaultCurrency === 'JPY' && '¥'}
                      {formData.defaultCurrency === 'AUD' && 'A$'}
                      {formData.defaultCurrency === 'CAD' && 'C$'}
                      1,234.56
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              disabled={isLoading}
              onClick={() => {
                setFormData({
                  name: user?.name || '',
                  email: user?.email || '',
                  timezone: user?.timezone || 'Asia/Kolkata',
                  defaultCurrency: user?.preferences?.defaultCurrency || 'INR',
                  dateFormat: user?.preferences?.dateFormat || 'DD/MM/YYYY',
                  theme: (user?.preferences?.theme || 'light') as 'light' | 'dark',
                });
              }}
            >
              Reset
            </Button>
            <Button
              type="submit"
              loading={isLoading}
              disabled={isLoading}
            >
              Save Changes
            </Button>
          </div>
        </form>

        {/* Account Information */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
            Account Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">
                  <Clock className="inline h-4 w-4 mr-2" />
                  Member since
                </span>
                <span className="text-neutral-900 dark:text-white">
                  {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">
                  Account Type
                </span>
                <span className="text-neutral-900 dark:text-white">
                  Free Trial
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">
                  User ID
                </span>
                <span className="text-neutral-900 dark:text-white font-mono text-xs">
                  {user.id}
                </span>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">
                  Last Login
                </span>
                <span className="text-neutral-900 dark:text-white">
                  {new Date().toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">
                  Email Verified
                </span>
                <span className="text-green-600 dark:text-green-400">
                  ✓ Verified
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">
                  Two-Factor Auth
                </span>
                <span className="text-yellow-600 dark:text-yellow-400">
                  Not Enabled
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}