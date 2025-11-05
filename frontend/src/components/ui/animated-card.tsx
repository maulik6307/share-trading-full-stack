'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { cardHoverVariants } from '@/lib/animations';

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
  delay?: number;
}

export function AnimatedCard({ 
  children, 
  className, 
  onClick, 
  hoverable = true,
  delay = 0 
}: AnimatedCardProps) {
  return (
    <motion.div
      className={cn(
        'rounded-lg border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-800',
        onClick && 'cursor-pointer',
        className
      )}
      variants={hoverable ? cardHoverVariants : undefined}
      initial="rest"
      whileHover={hoverable ? "hover" : undefined}
      animate="rest"
      onClick={onClick}
      layout
      layoutId={className}
      transition={{
        layout: { duration: 0.3 },
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}