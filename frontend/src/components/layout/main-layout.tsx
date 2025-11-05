'use client';

import { TopNav } from './top-nav';
import { LeftRail } from './left-rail';
import { MobileNav } from './mobile-nav';
import { Breadcrumb } from './breadcrumb';
import { useNavigationStore } from '@/stores/navigation-store';
import { useNavigation } from '@/lib/hooks/use-navigation';
import { User } from '@/types/user';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: React.ReactNode;
  user: User;
  showBreadcrumbs?: boolean;
  className?: string;
}

export function MainLayout({ 
  children, 
  user, 
  showBreadcrumbs = true,
  className 
}: MainLayoutProps) {
  const { isLeftRailCollapsed } = useNavigationStore();
  const { breadcrumbs } = useNavigation();

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Top Navigation */}
      <TopNav user={user} />

      {/* Left Rail Navigation */}
      <div className="hidden lg:block">
        <LeftRail />
      </div>

      {/* Mobile Navigation */}
      <MobileNav />

      {/* Main Content */}
      <main
        className={cn(
          'transition-all duration-300 lg:pl-64',
          isLeftRailCollapsed && 'lg:pl-16',
          className
        )}
      >
        <div>
          {/* Breadcrumbs */}
          {showBreadcrumbs && breadcrumbs.length > 1 && (
            <div className="border-b border-neutral-200 bg-neutral-0 px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900 lg:px-6">
              <Breadcrumb items={breadcrumbs} />
            </div>
          )}

          {/* Page Content */}
          <div className="p-4 lg:p-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}