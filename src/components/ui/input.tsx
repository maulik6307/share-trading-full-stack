'use client';

import React from 'react';
import { inputVariants } from '@/lib/variants';
import { cn } from '@/lib/utils';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: 'sm' | 'md' | 'lg';
  state?: 'default' | 'error' | 'success';
  label?: string;
  helperText?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, size = 'md', state = 'default', label, helperText, error, ...props }, ref) => {
    const inputState = error ? 'error' : state;
    const inputId = props.id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          className={cn(
            inputVariants({ size, state: inputState }),
            className
          )}
          ref={ref}
          {...props}
        />
        {(helperText || error) && (
          <p
            className={cn(
              'mt-1 text-xs',
              error
                ? 'text-danger-600 dark:text-danger-400'
                : 'text-neutral-500 dark:text-neutral-400'
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';