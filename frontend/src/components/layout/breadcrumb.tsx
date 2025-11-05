'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { BreadcrumbItem } from '@/types/navigation';
import { cn } from '@/lib/utils';

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  if (!items || items.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex items-center space-x-1 text-sm', className)}
    >
      <ol className="flex items-center space-x-1">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isFirst = index === 0;

          return (
            <li key={`${item.href}-${index}`} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="mx-2 h-4 w-4 text-neutral-400 dark:text-neutral-600" />
              )}
              
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-1 font-medium transition-colors hover:text-primary-600 dark:hover:text-primary-400',
                    isFirst 
                      ? 'text-neutral-500 dark:text-neutral-400' 
                      : 'text-neutral-600 dark:text-neutral-300'
                  )}
                >
                  {isFirst && <Home className="h-4 w-4" />}
                  <span>{item.label}</span>
                </Link>
              ) : (
                <span
                  className={cn(
                    'flex items-center gap-1 font-medium',
                    isLast 
                      ? 'text-neutral-900 dark:text-neutral-100' 
                      : 'text-neutral-600 dark:text-neutral-300'
                  )}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {isFirst && <Home className="h-4 w-4" />}
                  <span>{item.label}</span>
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}