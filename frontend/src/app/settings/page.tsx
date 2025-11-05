'use client';

import Link from 'next/link';
import { MainLayout } from '@/components/layout';
import { useAuthStore } from '@/stores/auth-store';
import { User, Bell, Shield, CreditCard, HelpCircle, Settings as SettingsIcon, Code } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuthStore();

  const settingsCategories = [
    {
      title: 'Account',
      description: 'Manage your account information and preferences',
      icon: User,
      href: '/settings/profile',
    },
    {
      title: 'Notifications',
      description: 'Configure your notification preferences',
      icon: Bell,
      href: '/settings/notifications',
    },
    {
      title: 'Security',
      description: 'Password, two-factor authentication, and security settings',
      icon: Shield,
      href: '/settings/security',
    },
    {
      title: 'Billing',
      description: 'Manage your subscription and billing information',
      icon: CreditCard,
      href: '/settings/billing',
    },
    {
      title: 'Help & Support',
      description: 'Get help and contact support',
      icon: HelpCircle,
      href: '/settings/support',
    },
    {
      title: 'API Documentation',
      description: 'Complete API reference with interactive examples',
      icon: Code,
      href: '/settings/api-docs',
    },
  ];

  if (!user) {
    return null;
  }

  return (
    <MainLayout user={user}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
            Settings
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">
            Manage your account settings and preferences.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {settingsCategories.map((category) => (
            <Link
              key={category.title}
              href={category.href}
              className="block p-6 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center flex-shrink-0">
                  <category.icon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-1">
                    {category.title}
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {category.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <SettingsIcon className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Quick Settings
            </h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-900 dark:text-white">
                  Email Notifications
                </p>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                  Receive email updates about your trading activity
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-900 dark:text-white">
                  Push Notifications
                </p>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                  Get notified about important trading alerts
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}