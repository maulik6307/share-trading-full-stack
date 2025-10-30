'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigationStore } from '@/stores/navigation-store';
import { navigationItems } from '@/lib/navigation';
import { NavigationItem } from '@/types/navigation';
import { cn } from '@/lib/utils';

interface LeftRailProps {
  className?: string;
}

export function LeftRail({ className }: LeftRailProps) {
  const pathname = usePathname();
  const { isLeftRailCollapsed, toggleLeftRail } = useNavigationStore();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Auto-expand parent items when child is active
  useEffect(() => {
    const findAndExpandActiveParents = (items: NavigationItem[], expanded: Set<string> = new Set()): Set<string> => {
      for (const item of items) {
        if (item.children) {
          const hasActiveChild = item.children.some(child =>
            child.href === pathname || (child.children && findAndExpandActiveParents(child.children).size > 0)
          );
          if (hasActiveChild) {
            expanded.add(item.id);
          }
          if (item.children) {
            findAndExpandActiveParents(item.children, expanded);
          }
        }
      }
      return expanded;
    };

    const newExpanded = findAndExpandActiveParents(navigationItems);
    setExpandedItems(newExpanded);
  }, [pathname]);

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const isItemActive = (item: NavigationItem): boolean => {
    // Exact match
    if (item.href === pathname) return true;

    // For parent items, check if any child is active
    if (item.children) {
      return item.children.some(child => isItemActive(child));
    }

    // For nested paths, check if current path starts with item path
    // But be more specific to avoid false positives
    if (item.href !== '/' && pathname.startsWith(item.href)) {
      // Make sure it's a proper path segment match, not just a prefix
      const remainingPath = pathname.slice(item.href.length);
      return remainingPath === '' || remainingPath.startsWith('/');
    }

    return false;
  };

  const isExactMatch = (href: string): boolean => {
    return href === pathname;
  };

  const renderNavigationItem = (item: NavigationItem, level = 0) => {
    const isActive = isItemActive(item);
    const isExpanded = expandedItems.has(item.id);
    const hasChildren = item.children && item.children.length > 0;
    const Icon = item.icon;

    return (
      <div key={item.id}>
        <div
          className={cn(
            'group relative flex items-center',
            level > 0 && 'ml-6'
          )}
        >
          {hasChildren ? (
            <button
              onClick={() => toggleExpanded(item.id)}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                'hover:bg-neutral-100 dark:hover:bg-neutral-800',
                isActive && 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400',
                !isActive && 'text-neutral-700 dark:text-neutral-300'
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!isLeftRailCollapsed && (
                <>
                  <span className="flex-1 text-left">{item.label}</span>
                  <ChevronRight
                    className={cn(
                      'h-4 w-4 transition-transform',
                      isExpanded && 'rotate-90'
                    )}
                  />
                </>
              )}
            </button>
          ) : (
            <Link
              href={item.href}
              data-tour={`${item.id}-nav`}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                'hover:bg-neutral-100 dark:hover:bg-neutral-800',
                isActive && 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400',
                !isActive && 'text-neutral-700 dark:text-neutral-300'
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!isLeftRailCollapsed && (
                <>
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700 dark:bg-primary-900 dark:text-primary-300">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          )}
        </div>

        {/* Render children */}
        {hasChildren && (isExpanded || isLeftRailCollapsed) && !isLeftRailCollapsed && (
          <div className="mt-1 space-y-1">
            {item.children!.map(child => renderNavigationItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside
      data-tour="left-rail"
      className={cn(
        'fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] border-r border-neutral-200 bg-neutral-0 transition-all duration-300 dark:border-neutral-800 dark:bg-neutral-900',
        isLeftRailCollapsed ? 'w-16' : 'w-64',
        className
      )}
    >
      <div className="flex h-full flex-col">
        {/* Navigation items */}
        <nav className="flex-1 space-y-1 p-4">
          {navigationItems.map(item => renderNavigationItem(item))}
        </nav>

        {/* Collapse toggle */}
        <div className="border-t border-neutral-200 p-4 dark:border-neutral-800">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLeftRail}
            className="w-full justify-center"
            aria-label={isLeftRailCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isLeftRailCollapsed ? (
              <span>
                <ChevronRight className="h-4 w-4" />
              </span>
            ) : (
              <>
                <ChevronLeft className="h-4 w-4" />
                <span className="ml-2">Collapse</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </aside>
  );
}