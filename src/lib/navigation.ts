import {
  LayoutDashboard,
  TrendingUp,
  BarChart3,
  PlayCircle,
  Settings,
  BookOpen,
  Users,
  Bell,
  Shield,
  CreditCard,
  HelpCircle,
  Code,
} from 'lucide-react';
import { NavigationItem } from '@/types/navigation';

export const navigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    id: 'strategies',
    label: 'Strategies',
    href: '/strategies',
    icon: TrendingUp,
    children: [
      {
        id: 'strategy-library',
        label: 'Library',
        href: '/strategies',
        icon: BookOpen,
      },
      {
        id: 'strategy-builder',
        label: 'Builder',
        href: '/strategies/builder',
        icon: Settings,
      },
    ],
  },
  {
    id: 'backtesting',
    label: 'Backtesting',
    href: '/backtesting',
    icon: BarChart3,
  },
  {
    id: 'paper-trading',
    label: 'Paper Trading',
    href: '/paper-trading',
    icon: PlayCircle,
  },
  {
    id: 'settings',
    label: 'Settings',
    href: '/settings',
    icon: Settings,
    children: [
      {
        id: 'settings-overview',
        label: 'Overview',
        href: '/settings',
        icon: Settings,
      },
      {
        id: 'profile',
        label: 'Profile',
        href: '/settings/profile',
        icon: Users,
      },
      {
        id: 'notifications',
        label: 'Notifications',
        href: '/settings/notifications',
        icon: Bell,
      },
      {
        id: 'security',
        label: 'Security',
        href: '/settings/security',
        icon: Shield,
      },
      {
        id: 'billing',
        label: 'Billing',
        href: '/settings/billing',
        icon: CreditCard,
      },
      {
        id: 'api-docs',
        label: 'API Docs',
        href: '/settings/api-docs',
        icon: Code,
      },
      {
        id: 'support',
        label: 'Support',
        href: '/settings/support',
        icon: HelpCircle,
      },
    ],
  },
];

export const getBreadcrumbs = (pathname: string) => {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs = [{ label: 'Dashboard', href: '/' }];

  let currentPath = '';
  for (const segment of segments) {
    currentPath += `/${segment}`;
    
    // Find the navigation item for this segment
    const findItem = (items: NavigationItem[]): NavigationItem | undefined => {
      for (const item of items) {
        if (item.href === currentPath) {
          return item;
        }
        if (item.children) {
          const found = findItem(item.children);
          if (found) return found;
        }
      }
      return undefined;
    };

    const item = findItem(navigationItems);
    if (item) {
      breadcrumbs.push({ label: item.label, href: item.href });
    } else {
      // Fallback for dynamic routes
      breadcrumbs.push({ 
        label: segment.charAt(0).toUpperCase() + segment.slice(1), 
        href: currentPath 
      });
    }
  }

  return breadcrumbs;
};