import { useState, useEffect, useCallback } from 'react';
import { backtestingApi, Backtest, BacktestConfig, BacktestStatusCounts, GetBacktestsOptions } from '@/lib/api/backtesting';
import { toast } from 'sonner';

interface UseBacktestingReturn {
  backtests: Backtest[];
  statusCounts: BacktestStatusCounts | null;
  runningBacktests: Backtest[];
  loading: boolean;
  error: string | null;
  
  // Actions
  createBacktest: (config: BacktestConfig) => Promise<Backtest | null>;
  deleteBacktest: (id: string) => Promise<boolean>;
  cancelBacktest: (id: string) => Promise<boolean>;
  retryBacktest: (id: string) => Promise<boolean>;
  cloneBacktest: (id: string, config: Partial<BacktestConfig>) => Promise<Backtest | null>;
  updateBacktest: (id: string, updates: { name?: string; description?: string; tags?: string[] }) => Promise<boolean>;
  
  // Data fetching
  fetchBacktests: (options?: GetBacktestsOptions) => Promise<void>;
  fetchStatusCounts: () => Promise<void>;
  fetchRunningBacktests: () => Promise<void>;
  refreshData: () => Promise<void>;
}

export function useBacktesting(options: GetBacktestsOptions = {}): UseBacktestingReturn {
  const [backtests, setBacktests] = useState<Backtest[]>([]);
  const [statusCounts, setStatusCounts] = useState<BacktestStatusCounts | null>(null);
  const [runningBacktests, setRunningBacktests] = useState<Backtest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch backtests
  const fetchBacktests = useCallback(async (fetchOptions: GetBacktestsOptions = {}) => {
    try {
      setError(null);
      const mergedOptions = { ...options, ...fetchOptions };
      const result = await backtestingApi.getBacktests(mergedOptions);
      setBacktests(result.backtests);
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to fetch backtests';
      setError(errorMessage);
      console.error('Error fetching backtests:', err);
    }
  }, [options]);

  // Fetch status counts
  const fetchStatusCounts = useCallback(async () => {
    try {
      const counts = await backtestingApi.getStatusCounts();
      setStatusCounts(counts);
    } catch (err: any) {
      console.error('Error fetching status counts:', err);
    }
  }, []);

  // Fetch running backtests
  const fetchRunningBacktests = useCallback(async () => {
    try {
      const running = await backtestingApi.getRunningBacktests();
      setRunningBacktests(running);
    } catch (err: any) {
      console.error('Error fetching running backtests:', err);
    }
  }, []);

  // Refresh all data
  const refreshData = useCallback(async () => {
    console.log('🔄 Refreshing all backtest data');
    setLoading(true);
    try {
      await Promise.all([
        fetchBacktests(),
        fetchStatusCounts(),
        fetchRunningBacktests()
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchBacktests, fetchStatusCounts, fetchRunningBacktests]);

  // Create backtest
  const createBacktest = useCallback(async (config: BacktestConfig): Promise<Backtest | null> => {
    try {
      setError(null);
      const newBacktest = await backtestingApi.createBacktest(config);
      
      // Add to local state
      setBacktests(prev => [newBacktest, ...prev]);
      
      // Update counts
      await fetchStatusCounts();
      await fetchRunningBacktests();
      
      toast.success('Backtest created successfully');
      return newBacktest;
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to create backtest';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    }
  }, [fetchStatusCounts, fetchRunningBacktests]);

  // Delete backtest
  const deleteBacktest = useCallback(async (id: string): Promise<boolean> => {
    try {
      setError(null);
      await backtestingApi.deleteBacktest(id);
      
      // Remove from local state
      setBacktests(prev => prev.filter(b => b._id !== id));
      setRunningBacktests(prev => prev.filter(b => b._id !== id));
      
      // Update counts
      await fetchStatusCounts();
      
      toast.success('Backtest deleted successfully');
      return true;
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to delete backtest';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    }
  }, [fetchStatusCounts]);

  // Cancel backtest
  const cancelBacktest = useCallback(async (id: string): Promise<boolean> => {
    try {
      setError(null);
      const updatedBacktest = await backtestingApi.cancelBacktest(id);
      
      // Update local state
      setBacktests(prev => prev.map(b => b._id === id ? updatedBacktest : b));
      setRunningBacktests(prev => prev.filter(b => b._id !== id));
      
      // Update counts
      await fetchStatusCounts();
      
      toast.success('Backtest cancelled successfully');
      return true;
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to cancel backtest';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    }
  }, [fetchStatusCounts]);

  // Retry backtest
  const retryBacktest = useCallback(async (id: string): Promise<boolean> => {
    try {
      setError(null);
      const updatedBacktest = await backtestingApi.retryBacktest(id);
      
      // Update local state
      setBacktests(prev => prev.map(b => b._id === id ? updatedBacktest : b));
      setRunningBacktests(prev => {
        const existing = prev.find(b => b._id === id);
        return existing ? prev.map(b => b._id === id ? updatedBacktest : b) : [...prev, updatedBacktest];
      });
      
      // Update counts
      await fetchStatusCounts();
      
      toast.success('Backtest restarted successfully');
      return true;
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to retry backtest';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    }
  }, [fetchStatusCounts]);

  // Clone backtest
  const cloneBacktest = useCallback(async (id: string, config: Partial<BacktestConfig>): Promise<Backtest | null> => {
    try {
      setError(null);
      const clonedBacktest = await backtestingApi.cloneBacktest(id, config);
      
      // Add to local state
      setBacktests(prev => [clonedBacktest, ...prev]);
      
      // Update counts
      await fetchStatusCounts();
      
      toast.success('Backtest cloned successfully');
      return clonedBacktest;
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to clone backtest';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    }
  }, [fetchStatusCounts]);

  // Update backtest
  const updateBacktest = useCallback(async (id: string, updates: { 
    name?: string; 
    description?: string; 
    tags?: string[] 
  }): Promise<boolean> => {
    try {
      setError(null);
      const updatedBacktest = await backtestingApi.updateBacktest(id, updates);
      
      // Update local state
      setBacktests(prev => prev.map(b => b._id === id ? updatedBacktest : b));
      
      toast.success('Backtest updated successfully');
      return true;
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to update backtest';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    refreshData();
  }, []); // Remove refreshData dependency to prevent infinite loops

  // Poll for running backtests updates (only when there are running backtests)
  useEffect(() => {
    // Don't poll if there are no running backtests
    if (runningBacktests.length === 0) {
      console.log('⏸️ No running backtests, polling disabled');
      return;
    }

    console.log(`🔄 Starting polling for ${runningBacktests.length} running backtests`);

    const interval = setInterval(async () => {
      try {
        // Only poll for running backtests, not all data
        const updated = await backtestingApi.getRunningBacktests();
        
        if (updated.length !== runningBacktests.length) {
          console.log(`📊 Running backtests changed: ${runningBacktests.length} → ${updated.length}`);
        }
        
        setRunningBacktests(updated);
        
        // Update main backtests list with progress
        setBacktests(prev => prev.map(backtest => {
          const runningBacktest = updated.find(r => r._id === backtest._id);
          return runningBacktest ? runningBacktest : backtest;
        }));
        
        // If no more running backtests, just update counts once
        if (updated.length === 0 && runningBacktests.length > 0) {
          console.log('✅ All backtests completed, updating counts');
          fetchStatusCounts(); // Don't await to avoid blocking
        }
      } catch (err: any) {
        // Don't show toast for rate limiting errors during polling
        if (err?.status !== 429) {
          console.error('Error polling running backtests:', err);
        }
      }
    }, 20000); // Increased to 20 seconds to further reduce API calls

    return () => {
      console.log('🛑 Stopping backtest polling');
      clearInterval(interval);
    };
  }, [runningBacktests.length]); // Only depend on the count, not the array contents

  return {
    backtests,
    statusCounts,
    runningBacktests,
    loading,
    error,
    
    // Actions
    createBacktest,
    deleteBacktest,
    cancelBacktest,
    retryBacktest,
    cloneBacktest,
    updateBacktest,
    
    // Data fetching
    fetchBacktests,
    fetchStatusCounts,
    fetchRunningBacktests,
    refreshData,
  };
}