'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, ChevronDown, User, Settings, LogOut, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useNavigationStore } from '@/stores/navigation-store';
import { useAuthStore } from '@/stores/auth-store';
import { User as UserType } from '@/types/user';

interface TopNavProps {
  user: UserType;
  onThemeToggle?: () => void;
  currentTheme?: 'light' | 'dark';
}

export function TopNav({ user }: TopNavProps) {
  const router = useRouter();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const { toggleLeftRail, toggleMobileMenu } = useNavigationStore();
  const { signOut } = useAuthStore();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      // Force a hard redirect to ensure clean state
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, redirect to home
      window.location.href = '/';
    }
  };

  const handleProfileClick = () => {
    setIsUserMenuOpen(false);
    router.push('/settings/profile');
  };

  const handleSettingsClick = () => {
    setIsUserMenuOpen(false);
    router.push('/settings');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-neutral-0 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        {/* Left section */}
        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
          >
            <Menu className="h-5 w-5" />
          </Button>


          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary-600 flex items-center justify-center">
              <span className="text-sm font-bold text-white">ST</span>
            </div>
            <span className="hidden sm:block text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              ShareTrading
            </span>
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <Button
              variant="secondary"
              size="sm"
              className="relative"
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-danger-500 rounded-full text-xs flex items-center justify-center">
                <span className="sr-only">3 notifications</span>
              </span>
            </Button>

            {/* Notification dropdown */}
            {isNotificationOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-lg z-50">
                <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
                  <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                    Notifications
                  </h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  <div className="p-4 space-y-3">
                    <div className="flex items-start space-x-3 p-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-lg">
                      <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-neutral-900 dark:text-white">
                          Strategy Alert
                        </p>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                          Your momentum strategy has exceeded the 5% profit target
                        </p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-1">
                          2 minutes ago
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-lg">
                      <div className="w-2 h-2 bg-warning-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-neutral-900 dark:text-white">
                          Risk Warning
                        </p>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                          Portfolio drawdown has reached 3.2%
                        </p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-1">
                          15 minutes ago
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-lg">
                      <div className="w-2 h-2 bg-success-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-neutral-900 dark:text-white">
                          Trade Executed
                        </p>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                          Bought 100 shares of AAPL at $175.50
                        </p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-1">
                          1 hour ago
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-3 border-t border-neutral-200 dark:border-neutral-800">
                  <button className="w-full text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Theme toggle */}
          <ThemeToggle />

          {/* User menu */}
          <div className="relative" ref={userMenuRef}>
            <Button
              variant="secondary"
              size="sm"
              className="flex items-center gap-2 px-3"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              aria-expanded={isUserMenuOpen}
              aria-haspopup="true"
            >
              <div className="h-6 w-6 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                <User className="h-4 w-4 text-primary-600 dark:text-primary-400" />
              </div>
              <span className="hidden sm:block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {user.name}
              </span>
              <ChevronDown className="h-4 w-4 text-neutral-500" />
            </Button>

            {/* User dropdown menu */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-lg z-50">
                <div className="p-3 border-b border-neutral-200 dark:border-neutral-800">
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {user.name}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {user.email}
                  </p>
                </div>

                <div className="p-1">
                  <button
                    onClick={handleProfileClick}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md"
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </button>
                  <button
                    onClick={handleSettingsClick}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </button>
                  <hr className="my-1 border-neutral-200 dark:border-neutral-800" />
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-danger-600 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-900/20 rounded-md"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}