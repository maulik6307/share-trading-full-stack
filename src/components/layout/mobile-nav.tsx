'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigationStore } from '@/stores/navigation-store';
import { navigationItems } from '@/lib/navigation';
import { NavigationItem } from '@/types/navigation';
import { cn } from '@/lib/utils';

export function MobileNav() {
  const pathname = usePathname();
  const { isMobileMenuOpen, setMobileMenuOpen } = useNavigationStore();

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname, setMobileMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const renderNavigationItem = (item: NavigationItem) => {
    const Icon = item.icon;
    const isActive = pathname === item.href;

    return (
      <div key={item.id}>
        <Link
          href={item.href}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium transition-colors',
            'hover:bg-neutral-100 dark:hover:bg-neutral-800',
            isActive && 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400',
            !isActive && 'text-neutral-700 dark:text-neutral-300'
          )}
          onClick={() => setMobileMenuOpen(false)}
        >
          <Icon className="h-5 w-5 flex-shrink-0" />
          <span>{item.label}</span>
          {item.badge && (
            <span className="ml-auto rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700 dark:bg-primary-900 dark:text-primary-300">
              {item.badge}
            </span>
          )}
        </Link>

        {/* Render children for mobile */}
        {item.children && (
          <div className="ml-8 mt-2 space-y-1">
            {item.children.map(child => {
              const ChildIcon = child.icon;
              const isChildActive = pathname === child.href;

              return (
                <Link
                  key={child.id}
                  href={child.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    'hover:bg-neutral-100 dark:hover:bg-neutral-800',
                    isChildActive && 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400',
                    !isChildActive && 'text-neutral-600 dark:text-neutral-400'
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <ChildIcon className="h-4 w-4 flex-shrink-0" />
                  <span>{child.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  if (!isMobileMenuOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-neutral-900/50 lg:hidden"
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile navigation drawer */}
      <div className="fixed inset-y-0 left-0 z-50 w-80 bg-neutral-0 dark:bg-neutral-900 lg:hidden">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neutral-200 p-4 dark:border-neutral-800">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary-600 flex items-center justify-center">
                <span className="text-sm font-bold text-white">ST</span>
              </div>
              <span className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                ShareTrading
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation items */}
          <nav className="flex-1 space-y-2 p-4 overflow-y-auto">
            {navigationItems.map(item => renderNavigationItem(item))}
          </nav>

          {/* Footer */}
          <div className="border-t border-neutral-200 p-4 dark:border-neutral-800">
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              ShareTrading UI MVP v1.0
            </p>
          </div>
        </div>
      </div>
    </>
  );
}