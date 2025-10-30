'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 dark:bg-neutral-950">
      <div className="mx-auto max-w-md text-center">
        <div className="flex justify-center">
          <AlertTriangle className="h-12 w-12 text-danger-500" />
        </div>
        
        <h1 className="mt-4 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          Something went wrong
        </h1>
        
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">
          We encountered an unexpected error. Please try again or contact support if the problem persists.
        </p>
        
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-sm text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300">
              Error details (development only)
            </summary>
            <pre className="mt-2 overflow-auto rounded bg-neutral-100 p-2 text-xs text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
              {error.message}
            </pre>
          </details>
        )}
        
        <div className="mt-6 flex justify-center gap-3">
          <Button onClick={reset} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Try again
          </Button>
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/'}
          >
            Go home
          </Button>
        </div>
      </div>
    </div>
  );
}