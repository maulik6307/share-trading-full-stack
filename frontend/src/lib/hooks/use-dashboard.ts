'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { dashboardAPI, type DashboardData, type DashboardOptions } from '@/lib/api/dashboard';

interface UseDashboardOptions extends DashboardOptions {
    refreshInterval?: number; // Auto-refresh interval in milliseconds
    enabled?: boolean; // Whether to fetch data
}

interface UseDashboardReturn {
    data: DashboardData | null;
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
    lastUpdated: Date | null;
}

export function useDashboard(options: UseDashboardOptions = {}): UseDashboardReturn {
    const {
        refreshInterval,
        enabled = true,
        ...apiOptions
    } = options;

    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    // Memoize API options to prevent unnecessary re-renders
    const memoizedApiOptions = useMemo(() => apiOptions, [
        apiOptions.includePerformance,
        apiOptions.includeActivities,
        apiOptions.includeAlerts,
        apiOptions.performanceDays,
        apiOptions.activitiesLimit,
        apiOptions.alertsLimit
    ]);

    const fetchDashboard = useCallback(async () => {
        if (!enabled) return;

        try {
            setError(null);
            const response = await dashboardAPI.getDashboard(memoizedApiOptions);

            if (response.success) {
                setData(response.data);
                setLastUpdated(new Date());
            } else {
                throw new Error('Failed to fetch dashboard data');
            }
        } catch (err: any) {
            console.error('Dashboard fetch error:', err);
            setError(err.message || 'Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    }, [enabled, memoizedApiOptions]);

    const refresh = useCallback(async () => {
        setLoading(true);
        await fetchDashboard();
    }, [fetchDashboard]);

    // Initial fetch
    useEffect(() => {
        fetchDashboard();
    }, [fetchDashboard]);

    // Auto-refresh interval
    useEffect(() => {
        if (!refreshInterval || !enabled) return;

        const interval = setInterval(fetchDashboard, refreshInterval);
        return () => clearInterval(interval);
    }, [refreshInterval, enabled, fetchDashboard]);

    return {
        data,
        loading,
        error,
        refresh,
        lastUpdated
    };
}

// Hook for KPI data only (for faster updates)
export function useKPIData() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchKPI = useCallback(async () => {
        try {
            setError(null);
            const response = await dashboardAPI.getKPIData();

            if (response.success) {
                setData(response.data);
            } else {
                throw new Error('Failed to fetch KPI data');
            }
        } catch (err: any) {
            console.error('KPI fetch error:', err);
            setError(err.message || 'Failed to load KPI data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchKPI();
    }, [fetchKPI]);

    return {
        data,
        loading,
        error,
        refresh: fetchKPI
    };
}

// Hook for activities with pagination
export function useActivities(options: { limit?: number; type?: string; status?: string } = {}) {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState({
        total: 0,
        limit: 10,
        offset: 0,
        hasMore: false
    });

    // Memoize options to prevent unnecessary re-renders
    const memoizedOptions = useMemo(() => options, [
        options.limit,
        options.type,
        options.status
    ]);

    const fetchActivities = useCallback(async (offset = 0) => {
        try {
            setError(null);
            const response = await dashboardAPI.getActivities({
                limit: memoizedOptions.limit,
                type: memoizedOptions.type as any,
                status: memoizedOptions.status as any,
                offset
            });

            if (response.success) {
                if (offset === 0) {
                    setData(response.data);
                } else {
                    setData(prev => [...prev, ...response.data]);
                }
                setPagination(response.pagination);
            } else {
                throw new Error('Failed to fetch activities');
            }
        } catch (err: any) {
            console.error('Activities fetch error:', err);
            setError(err.message || 'Failed to load activities');
        } finally {
            setLoading(false);
        }
    }, [memoizedOptions]);

    const loadMore = useCallback(() => {
        if (pagination.hasMore && !loading) {
            fetchActivities(pagination.offset + pagination.limit);
        }
    }, [pagination, loading, fetchActivities]);

    useEffect(() => {
        fetchActivities(0);
    }, [fetchActivities]);

    return {
        data,
        loading,
        error,
        pagination,
        loadMore,
        refresh: () => fetchActivities(0)
    };
}

// Hook for alerts with management functions
export function useAlerts(options: { limit?: number; unreadOnly?: boolean } = {}) {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [unreadCount, setUnreadCount] = useState(0);

    // Memoize options to prevent unnecessary re-renders
    const memoizedOptions = useMemo(() => options, [
        options.limit,
        options.unreadOnly
    ]);

    const fetchAlerts = useCallback(async () => {
        try {
            setError(null);
            const response = await dashboardAPI.getAlerts(memoizedOptions);

            if (response.success) {
                setData(response.data);
                setUnreadCount(response.meta.unreadCount);
            } else {
                throw new Error('Failed to fetch alerts');
            }
        } catch (err: any) {
            console.error('Alerts fetch error:', err);
            setError(err.message || 'Failed to load alerts');
        } finally {
            setLoading(false);
        }
    }, [memoizedOptions]);

    const markAsRead = useCallback(async (alertId: string) => {
        try {
            await dashboardAPI.markAlertAsRead(alertId);

            // Update local state
            setData(prev => prev.map((alert: any) =>
                alert._id === alertId ? { ...alert, isRead: true } : alert
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err: any) {
            console.error('Mark alert as read error:', err);
        }
    }, []);

    const dismiss = useCallback(async (alertId: string) => {
        try {
            await dashboardAPI.dismissAlert(alertId);

            // Update local state
            setData(prev => prev.filter((alert: any) => alert._id !== alertId));

            // Update unread count if the dismissed alert was unread
            const dismissedAlert = data.find((alert: any) => alert._id === alertId);
            if (dismissedAlert && !dismissedAlert.isRead) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (err: any) {
            console.error('Dismiss alert error:', err);
        }
    }, [data]);

    useEffect(() => {
        fetchAlerts();
    }, [fetchAlerts]);

    return {
        data,
        loading,
        error,
        unreadCount,
        markAsRead,
        dismiss,
        refresh: fetchAlerts
    };
}