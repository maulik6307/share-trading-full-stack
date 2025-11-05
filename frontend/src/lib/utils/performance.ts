/**
 * Performance monitoring utilities for React components
 */

import { useRef, useEffect } from 'react';

/**
 * Hook to track component re-renders in development
 */
export function useRenderTracker(componentName: string, props?: Record<string, any>) {
  const renderCount = useRef(0);
  const prevProps = useRef(props);

  useEffect(() => {
    renderCount.current += 1;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔄 ${componentName} rendered ${renderCount.current} times`);
      
      if (props && prevProps.current) {
        const changedProps = Object.keys(props).filter(
          key => props[key] !== prevProps.current?.[key]
        );
        
        if (changedProps.length > 0) {
          console.log(`📝 ${componentName} props changed:`, changedProps);
        }
      }
      
      prevProps.current = props;
    }
  });

  return renderCount.current;
}

/**
 * Hook to measure component render performance
 */
export function usePerformanceTracker(componentName: string) {
  const startTime = useRef<number>();
  
  useEffect(() => {
    startTime.current = performance.now();
    
    return () => {
      if (startTime.current && process.env.NODE_ENV === 'development') {
        const renderTime = performance.now() - startTime.current;
        if (renderTime > 16) { // Flag renders taking longer than 16ms (60fps)
          console.warn(`⚠️ ${componentName} render took ${renderTime.toFixed(2)}ms`);
        }
      }
    };
  });
}

/**
 * Utility to debounce API calls to prevent excessive requests
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Utility to throttle API calls to limit frequency
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Hook to prevent API calls from being made too frequently
 */
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const throttledCallback = useRef(throttle(callback, delay));
  
  useEffect(() => {
    throttledCallback.current = throttle(callback, delay);
  }, [callback, delay]);
  
  return throttledCallback.current as T;
}

/**
 * Hook to debounce API calls
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const debouncedCallback = useRef(debounce(callback, delay));
  
  useEffect(() => {
    debouncedCallback.current = debounce(callback, delay);
  }, [callback, delay]);
  
  return debouncedCallback.current as T;
}