'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  size?: 'sm' | 'md' | 'lg';
  state?: 'default' | 'error' | 'success';
  label?: string;
  helperText?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ 
    className, 
    size = 'md', 
    state = 'default', 
    label, 
    helperText, 
    error, 
    options, 
    placeholder,
    ...props 
  }, ref) => {
    const selectState = error ? 'error' : state;
    const selectId = props.id || `select-${Math.random().toString(36).substr(2, 9)}`;

    const sizeClasses = {
      sm: 'h-8 px-2 text-xs',
      md: 'h-9 px-3 text-sm',
      lg: 'h-10 px-4 text-base',
    };

    const stateClasses = {
      default: 'border-neutral-300 focus:border-primary-500 focus:ring-primary-500 dark:border-neutral-700',
      error: 'border-danger-500 focus:border-danger-500 focus:ring-danger-500',
      success: 'border-success-500 focus:border-success-500 focus:ring-success-500',
    };

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            className={cn(
              'w-full appearance-none rounded-md border bg-white pr-8 ring-offset-background',
              'focus:outline-none focus:ring-2 focus:ring-offset-2',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'dark:bg-neutral-950 dark:text-neutral-50',
              sizeClasses[size],
              stateClasses[selectState],
              className
            )}
            ref={ref}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={16}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none"
          />
        </div>
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

Select.displayName = 'Select';