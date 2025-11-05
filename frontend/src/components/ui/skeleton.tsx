'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { skeletonVariants } from '@/lib/animations';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export function Skeleton({ 
  className, 
  variant = 'rectangular',
  width,
  height,
  lines = 1
}: SkeletonProps) {
  const baseClasses = 'bg-neutral-200 dark:bg-neutral-700';
  
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-md',
  };

  const style = {
    width: width || '100%',
    height: height || (variant === 'text' ? '1rem' : '2rem'),
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, index) => (
          <motion.div
            key={index}
            className={cn(
              baseClasses,
              variantClasses[variant],
              index === lines - 1 && 'w-3/4', // Last line is shorter
              className
            )}
            style={{
              ...style,
              width: index === lines - 1 ? '75%' : style.width,
            }}
            variants={skeletonVariants}
            animate="pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      className={cn(
        baseClasses,
        variantClasses[variant],
        className
      )}
      style={style}
      variants={skeletonVariants}
      animate="pulse"
    />
  );
}

// Skeleton components for common UI patterns
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('p-6 space-y-4', className)}>
      <Skeleton variant="text" height="1.5rem" width="60%" />
      <Skeleton variant="text" lines={3} />
      <div className="flex space-x-2">
        <Skeleton variant="rectangular" width="5rem" height="2rem" />
        <Skeleton variant="rectangular" width="5rem" height="2rem" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={`header-${index}`} variant="text" height="1rem" />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div 
          key={`row-${rowIndex}`} 
          className="grid gap-4" 
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={`cell-${rowIndex}-${colIndex}`} variant="text" height="1rem" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonChart({ className }: { className?: string }) {
  return (
    <div className={cn('p-6 space-y-4', className)}>
      <div className="flex justify-between items-center">
        <Skeleton variant="text" width="40%" height="1.5rem" />
        <Skeleton variant="rectangular" width="6rem" height="2rem" />
      </div>
      <Skeleton variant="rectangular" width="100%" height="20rem" />
    </div>
  );
}

export function SkeletonDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton variant="text" width="30%" height="2rem" />
        <Skeleton variant="text" width="50%" height="1rem" />
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg">
            <Skeleton variant="text" width="60%" height="1rem" className="mb-2" />
            <Skeleton variant="text" width="40%" height="2rem" />
          </div>
        ))}
      </div>
      
      {/* Chart */}
      <SkeletonChart />
      
      {/* Table */}
      <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-6">
        <Skeleton variant="text" width="25%" height="1.5rem" className="mb-4" />
        <SkeletonTable />
      </div>
    </div>
  );
}