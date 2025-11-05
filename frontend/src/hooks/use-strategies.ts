import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { strategiesApi, Strategy, StrategyStatusCounts, GetStrategiesOptions, PerformanceSummary } from '@/lib/api/strategies';
import { useToast } from '@/components/ui/toast';

// Custom hook to prevent infinite loops with stable references
function useStableCallback<T extends (...args: any[]) => any>(callback: T): T {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;
  
  return useCallback((...args: any[]) => {
    return callbackRef.current(...args);
  }, []) as T;
}

export function useStrategies(options: GetStrategiesOptions = {}) {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 20,
    offset: 0,
    hasMore: false
  });

  // Stable options reference to prevent infinite loops
  const stableOptions = useMemo(() => {
    return JSON.stringify({
      status: options.status,
      search: options.search,
      tags: options.tags,
      sortBy: options.sortBy,
      sortOrder: options.sortOrder,
      limit: options.limit,
      offset: options.offset,
      includeArchived: options.includeArchived
    });
  }, [
    options.status,
    options.search,
    options.tags?.join(','),
    options.sortBy,
    options.sortOrder,
    options.limit,
    options.offset,
    options.includeArchived
  ]);

  const fetchStrategies = useStableCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const parsedOptions = JSON.parse(stableOptions);
      const result = await strategiesApi.getStrategies(parsedOptions);
      
      setStrategies(result.strategies);
      setPagination(result.pagination);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch strategies';
      setError(errorMessage);
      console.error('Failed to fetch strategies:', errorMessage);
    } finally {
      setLoading(false);
    }
  });

  useEffect(() => {
    fetchStrategies();
  }, [stableOptions, fetchStrategies]);

  const refetch = useStableCallback(() => {
    fetchStrategies();
  });

  return {
    strategies,
    loading,
    error,
    pagination,
    refetch
  };
}

export function useStrategyStatusCounts() {
  const [counts, setCounts] = useState<StrategyStatusCounts>({
    total: 0,
    ACTIVE: 0,
    PAUSED: 0,
    STOPPED: 0,
    DRAFT: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCounts = useStableCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await strategiesApi.getStatusCounts();
      setCounts(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch status counts';
      setError(errorMessage);
      console.error('Failed to fetch status counts:', errorMessage);
    } finally {
      setLoading(false);
    }
  });

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  return {
    counts,
    loading,
    error,
    refetch: fetchCounts
  };
}

export function useStrategy(id: string) {
  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStrategy = useStableCallback(async () => {
    if (!id) {
      setLoading(false);
      setStrategy(null);
      setError(null);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const result = await strategiesApi.getStrategy(id);
      setStrategy(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch strategy';
      setError(errorMessage);
      setStrategy(null);
      console.error('Failed to fetch strategy:', errorMessage);
    } finally {
      setLoading(false);
    }
  });

  useEffect(() => {
    fetchStrategy();
  }, [id, fetchStrategy]);

  return {
    strategy,
    loading,
    error,
    refetch: fetchStrategy
  };
}

export function usePerformanceSummary() {
  const [summary, setSummary] = useState<PerformanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useStableCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await strategiesApi.getPerformanceSummary();
      setSummary(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch performance summary';
      setError(errorMessage);
      console.error('Failed to fetch performance summary:', errorMessage);
    } finally {
      setLoading(false);
    }
  });

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return {
    summary,
    loading,
    error,
    refetch: fetchSummary
  };
}

export function useStrategyActions() {
  const { addToast } = useToast();

  const createStrategy = useStableCallback(async (data: any) => {
    try {
      const strategy = await strategiesApi.createStrategy(data);
      addToast({
        type: 'success',
        title: 'Success',
        description: 'Strategy created successfully'
      });
      return strategy;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create strategy';
      addToast({
        type: 'error',
        title: 'Error',
        description: errorMessage
      });
      throw err;
    }
  });

  const updateStrategy = useStableCallback(async (id: string, data: any) => {
    try {
      const strategy = await strategiesApi.updateStrategy(id, data);
      addToast({
        type: 'success',
        title: 'Success',
        description: 'Strategy updated successfully'
      });
      return strategy;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update strategy';
      addToast({
        type: 'error',
        title: 'Error',
        description: errorMessage
      });
      throw err;
    }
  });

  const deleteStrategy = useStableCallback(async (id: string) => {
    try {
      await strategiesApi.deleteStrategy(id);
      addToast({
        type: 'success',
        title: 'Success',
        description: 'Strategy deleted successfully'
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete strategy';
      addToast({
        type: 'error',
        title: 'Error',
        description: errorMessage
      });
      throw err;
    }
  });

  const cloneStrategy = useStableCallback(async (id: string, name?: string) => {
    try {
      const strategy = await strategiesApi.cloneStrategy(id, name);
      addToast({
        type: 'success',
        title: 'Success',
        description: 'Strategy cloned successfully'
      });
      return strategy;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to clone strategy';
      addToast({
        type: 'error',
        title: 'Error',
        description: errorMessage
      });
      throw err;
    }
  });

  const deployStrategy = useStableCallback(async (id: string) => {
    try {
      const strategy = await strategiesApi.deployStrategy(id);
      addToast({
        type: 'success',
        title: 'Success',
        description: 'Strategy deployed successfully'
      });
      return strategy;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to deploy strategy';
      addToast({
        type: 'error',
        title: 'Error',
        description: errorMessage
      });
      throw err;
    }
  });

  const pauseStrategy = useStableCallback(async (id: string) => {
    try {
      const strategy = await strategiesApi.pauseStrategy(id);
      addToast({
        type: 'success',
        title: 'Success',
        description: 'Strategy paused successfully'
      });
      return strategy;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to pause strategy';
      addToast({
        type: 'error',
        title: 'Error',
        description: errorMessage
      });
      throw err;
    }
  });

  const stopStrategy = useStableCallback(async (id: string) => {
    try {
      const strategy = await strategiesApi.stopStrategy(id);
      addToast({
        type: 'success',
        title: 'Success',
        description: 'Strategy stopped successfully'
      });
      return strategy;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to stop strategy';
      addToast({
        type: 'error',
        title: 'Error',
        description: errorMessage
      });
      throw err;
    }
  });

  return {
    createStrategy,
    updateStrategy,
    deleteStrategy,
    cloneStrategy,
    deployStrategy,
    pauseStrategy,
    stopStrategy
  };
}