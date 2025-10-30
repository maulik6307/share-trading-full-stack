/**
 * Component Variant System
 * Provides consistent styling patterns for UI components
 */

import { cn } from './utils';

export type VariantConfig<T extends Record<string, any>> = {
  base?: string;
  variants: T;
  defaultVariants?: Partial<{
    [K in keyof T]: keyof T[K];
  }>;
};

/**
 * Creates a variant function for styling components
 */
export function createVariants<T extends Record<string, Record<string, string>>>(
  config: VariantConfig<T>
) {
  return (props?: Partial<{ [K in keyof T]: keyof T[K] }> & { className?: string }) => {
    const { className, ...variantProps } = props || {};
    
    // Start with base classes
    let classes = config.base || '';
    
    // Apply variant classes
    Object.entries(config.variants).forEach(([variantKey, variantValues]) => {
      const selectedVariant = 
        variantProps[variantKey as keyof typeof variantProps] ||
        config.defaultVariants?.[variantKey as keyof T];
      
      if (selectedVariant && variantValues[selectedVariant as string]) {
        classes += ' ' + variantValues[selectedVariant as string];
      }
    });
    
    return cn(classes, className);
  };
}

/**
 * Common button variants
 */
export const buttonVariants = createVariants({
  base: 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background',
  variants: {
    variant: {
      primary: 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800',
      secondary: 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700',
      outline: 'border border-neutral-300 bg-transparent hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800',
      ghost: 'hover:bg-neutral-100 dark:hover:bg-neutral-800',
      danger: 'bg-danger-600 text-white hover:bg-danger-700 active:bg-danger-800',
      success: 'bg-success-600 text-white hover:bg-success-700 active:bg-success-800',
    },
    size: {
      xs: 'h-7 px-2 text-xs',
      sm: 'h-8 px-3 text-sm',
      md: 'h-9 px-4 text-sm',
      lg: 'h-10 px-6 text-base',
      xl: 'h-11 px-8 text-base',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
});

/**
 * Common input variants
 */
export const inputVariants = createVariants({
  base: 'flex w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-950 dark:placeholder:text-neutral-400',
  variants: {
    size: {
      sm: 'h-8 px-2 text-xs',
      md: 'h-9 px-3 text-sm',
      lg: 'h-10 px-4 text-base',
    },
    state: {
      default: '',
      error: 'border-danger-500 focus-visible:ring-danger-500',
      success: 'border-success-500 focus-visible:ring-success-500',
    },
  },
  defaultVariants: {
    size: 'md',
    state: 'default',
  },
});

/**
 * Common card variants
 */
export const cardVariants = createVariants({
  base: 'rounded-lg border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950',
  variants: {
    padding: {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    },
    shadow: {
      none: 'shadow-none',
      sm: 'shadow-sm',
      md: 'shadow-md',
      lg: 'shadow-lg',
    },
  },
  defaultVariants: {
    padding: 'md',
    shadow: 'sm',
  },
});

/**
 * Common badge variants
 */
export const badgeVariants = createVariants({
  base: 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
  variants: {
    variant: {
      default: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200',
      primary: 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200',
      success: 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200',
      danger: 'bg-danger-100 text-danger-800 dark:bg-danger-900 dark:text-danger-200',
      warning: 'bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-200',
      outline: 'border border-neutral-300 text-neutral-700 dark:border-neutral-700 dark:text-neutral-300',
    },
    size: {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-0.5 text-xs',
      lg: 'px-3 py-1 text-sm',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'md',
  },
});

/**
 * Common alert variants
 */
export const alertVariants = createVariants({
  base: 'relative w-full rounded-lg border p-4',
  variants: {
    variant: {
      default: 'bg-neutral-50 border-neutral-200 text-neutral-900 dark:bg-neutral-950 dark:border-neutral-800 dark:text-neutral-50',
      success: 'bg-success-50 border-success-200 text-success-900 dark:bg-success-950 dark:border-success-800 dark:text-success-50',
      danger: 'bg-danger-50 border-danger-200 text-danger-900 dark:bg-danger-950 dark:border-danger-800 dark:text-danger-50',
      warning: 'bg-warning-50 border-warning-200 text-warning-900 dark:bg-warning-950 dark:border-warning-800 dark:text-warning-50',
      info: 'bg-primary-50 border-primary-200 text-primary-900 dark:bg-primary-950 dark:border-primary-800 dark:text-primary-50',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});