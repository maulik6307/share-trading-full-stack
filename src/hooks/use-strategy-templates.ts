import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { strategiesApi, StrategyTemplate, GetTemplatesOptions } from '@/lib/api/strategies';
import { useToast } from '@/components/ui/toast';

// Custom hook to prevent infinite loops with stable references
function useStableCallback<T extends (...args: any[]) => any>(callback: T): T {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;
  
  return useCallback((...args: any[]) => {
    return callbackRef.current(...args);
  }, []) as T;
}

export function useStrategyTemplates(options: GetTemplatesOptions = {}) {
  const [templates, setTemplates] = useState<StrategyTemplate[]>([]);
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
      category: options.category,
      search: options.search,
      sortBy: options.sortBy,
      sortOrder: options.sortOrder,
      limit: options.limit,
      offset: options.offset
    });
  }, [
    options.category,
    options.search,
    options.sortBy,
    options.sortOrder,
    options.limit,
    options.offset
  ]);

  const fetchTemplates = useStableCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const parsedOptions = JSON.parse(stableOptions);
      const result = await strategiesApi.getTemplates(parsedOptions);
      
      setTemplates(result.templates);
      setPagination(result.pagination);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch templates';
      setError(errorMessage);
      console.error('Failed to fetch templates:', errorMessage);
    } finally {
      setLoading(false);
    }
  });

  useEffect(() => {
    fetchTemplates();
  }, [stableOptions, fetchTemplates]);

  const refetch = useStableCallback(() => {
    fetchTemplates();
  });

  return {
    templates,
    loading,
    error,
    pagination,
    refetch
  };
}

export function useTemplateCategories() {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useStableCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await strategiesApi.getTemplateCategories();
      setCategories(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch categories';
      setError(errorMessage);
      console.error('Failed to fetch categories:', errorMessage);
    } finally {
      setLoading(false);
    }
  });

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories
  };
}

export function usePopularTemplates(limit = 10) {
  const [templates, setTemplates] = useState<StrategyTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPopularTemplates = useStableCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await strategiesApi.getPopularTemplates(limit);
      setTemplates(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch popular templates';
      setError(errorMessage);
      console.error('Failed to fetch popular templates:', errorMessage);
    } finally {
      setLoading(false);
    }
  });

  useEffect(() => {
    fetchPopularTemplates();
  }, [limit, fetchPopularTemplates]);

  return {
    templates,
    loading,
    error,
    refetch: fetchPopularTemplates
  };
}

export function useTemplateActions() {
  const { addToast } = useToast();

  const createFromTemplate = useStableCallback(async (templateId: string, data: any) => {
    try {
      const strategy = await strategiesApi.createFromTemplate(templateId, data);
      addToast({
        type: 'success',
        title: 'Success',
        description: 'Strategy created from template successfully'
      });
      return strategy;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create strategy from template';
      addToast({
        type: 'error',
        title: 'Error',
        description: errorMessage
      });
      throw err;
    }
  });

  return {
    createFromTemplate
  };
}