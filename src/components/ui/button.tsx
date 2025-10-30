'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { buttonVariants } from '@/lib/variants';
import { cn } from '@/lib/utils';
import { buttonVariants as animationVariants } from '@/lib/animations';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  animated?: boolean;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading = false, animated = true, disabled, children, ...props }, ref) => {
    const ButtonComponent = animated ? motion.button : 'button';
    const animationProps = animated ? {
      variants: animationVariants,
      initial: 'rest',
      whileHover: disabled || loading ? 'rest' : 'hover',
      whileTap: disabled || loading ? 'rest' : 'tap',
    } : {};

    return (
      <ButtonComponent
        className={cn(
          buttonVariants({ variant, size }),
          loading && 'cursor-not-allowed opacity-50',
          className
        )}
        disabled={disabled || loading}
        ref={ref}
        {...animationProps}
        {...props}
      >
        {loading && (
          <motion.svg
            className="mr-2 h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </motion.svg>
        )}
        {children}
      </ButtonComponent>
    );
  }
);

Button.displayName = 'Button';