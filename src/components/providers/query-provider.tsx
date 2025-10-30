'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, useEffect } from 'react';
import { telemetryService, trackError } from '@/mocks/services/telemetry-service';
import { ApiError } from '@/mocks/services/error-service';

interface QueryProviderProps {
  children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(() => 
    new QueryClient({
      defaultOptions: {
        queries: {
          // Global query defaults
          staleTime: 30 * 1000, // 30 seconds
          gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
          retry: (failureCount, error) => {
            // Don't retry on validation errors
            if (error instanceof ApiError && !error.recoverable) {
              return false;
            }
            // Retry up to 3 times for other errors
            return failureCount < 3;
          },
          retryDelay: (attemptIndex) => {
            // Exponential backoff with jitter
            const baseDelay = 1000;
            const delay = baseDelay * Math.pow(2, attemptIndex);
            const jitter = Math.random() * 0.1 * delay;
            return Math.min(delay + jitter, 10000); // Max 10 seconds
          },
        },
        mutations: {
          // Global mutation defaults
          retry: (failureCount, error) => {
            // Don't retry mutations on validation errors
            if (error instanceof ApiError && !error.recoverable) {
              return false;
            }
            // Retry once for network errors
            return failureCount < 1;
          },
          onError: (error, variables, context) => {
            // Track mutation errors
            trackError(error as Error, 'mutation');
          },
        },
      },
    })
  );

  useEffect(() => {
    // Set up global error handling for queries
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event.type === 'observerResultsUpdated') {
        const { query } = event;
        if (query.state.error) {
          trackError(query.state.error as Error, `query:${query.queryHash}`);
        }
      }
    });

    // Track query client metrics
    const trackMetrics = () => {
      const cache = queryClient.getQueryCache();
      const queries = cache.getAll();
      
      telemetryService.trackPerformance({
        name: 'query_cache_size',
        value: queries.length,
        unit: 'count',
        timestamp: new Date(),
      });

      const staleQueries = queries.filter(q => q.isStale()).length;
      telemetryService.trackPerformance({
        name: 'stale_queries_count',
        value: staleQueries,
        unit: 'count',
        timestamp: new Date(),
      });
    };

    // Track metrics every 30 seconds
    const metricsInterval = setInterval(trackMetrics, 30000);

    return () => {
      unsubscribe();
      clearInterval(metricsInterval);
    };
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools 
          initialIsOpen={false}
          buttonPosition="bottom-left"
        />
      )} */}
    </QueryClientProvider>
  );
}