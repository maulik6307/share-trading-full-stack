'use client';

import {
  DollarSign,
  TrendingUp,
  Target,
  BarChart3,
  Award,
  Percent,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { MainLayout } from '@/components/layout';
import {
  KPIWidget,
  PerformanceChart,
  ActivityFeed,
  AlertsWidget
} from '@/components/features/dashboard';
import { GuidedTour } from '@/components/features/onboarding';
import { useAuthStore } from '@/stores/auth-store';
import { useOnboardingStore } from '@/stores/onboarding-store';
import { useDashboard } from '@/lib/hooks/use-dashboard';
import { dashboardAPI } from '@/lib/api/dashboard';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { hasCompletedOnboarding } = useOnboardingStore();

  // Fetch dashboard data with auto-refresh every 5 minutes
  const {
    data: dashboardData,
    loading: dashboardLoading,
    error: dashboardError,
    refresh: refreshDashboard,
    lastUpdated
  } = useDashboard({
    refreshInterval: 5 * 60 * 1000, // 5 minutes
    performanceDays: 30,
    activitiesLimit: 8,
    alertsLimit: 10
  });

  // Alert management functions using the dashboard data
  const handleMarkAsRead = async (alertId: string) => {
    try {
      await dashboardAPI.markAlertAsRead(alertId);
      // Refresh dashboard to get updated alerts
      refreshDashboard();
    } catch (error) {
      console.error('Mark alert as read error:', error);
    }
  };

  const handleDismissAlert = async (alertId: string) => {
    try {
      await dashboardAPI.dismissAlert(alertId);
      // Refresh dashboard to get updated alerts
      refreshDashboard();
    } catch (error) {
      console.error('Dismiss alert error:', error);
    }
  };

  // Check if user is new (no portfolio data)
  const isNewUser = !dashboardLoading && (!dashboardData || dashboardData.kpi.portfolioValue.current === 100000);

  if (!user) {
    return null;
  }

  // Loading state
  if (dashboardLoading) {
    return (
      <MainLayout user={user}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Error state
  if (dashboardError) {
    return (
      <MainLayout user={user}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-4" />
            <p className="text-gray-900 dark:text-white font-semibold mb-2">Failed to load dashboard</p>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{dashboardError}</p>
            <Button onClick={refreshDashboard} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Use dashboard data or fallback to empty state
  const data = dashboardData || {
    kpi: {
      portfolioValue: { current: 100000, change: { value: 0, period: 'today', isPositive: true } },
      roi30d: { current: 0, change: { value: 0, period: 'vs last month', isPositive: true } },
      activeStrategies: { current: 0, profitable: 0, description: 'No strategies yet' },
      openPositions: { current: 0, profitable: 0, description: 'No positions' },
      totalReturn: { current: 0, change: { value: 0, period: 'all time', isPositive: true } },
      winRate: { current: 0, change: { value: 0, period: '30d avg', isPositive: true } }
    },
    performance: [{ date: new Date().toISOString().split('T')[0], value: 100000, benchmark: 100000 }],
    activities: [],
    alerts: []
  };

  return (
    <MainLayout user={user}>
      <div className="space-y-6" data-tour="dashboard">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
              Welcome back, {user.name}!
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Here&apos;s your trading overview for today.
              {lastUpdated && (
                <span className="ml-2 text-sm">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </p>
          </div>
          <Button
            onClick={refreshDashboard}
            variant="outline"
            size="sm"
            disabled={dashboardLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${dashboardLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 lg:gap-6">
          <KPIWidget
            title="Portfolio Value"
            value={`$${data.kpi.portfolioValue.current.toLocaleString()}`}
            change={data.kpi.portfolioValue.change}
            icon={DollarSign}
            className="sm:col-span-2 lg:col-span-1"
          />

          <KPIWidget
            title="30d ROI"
            value={`${data.kpi.roi30d.current.toFixed(1)}%`}
            change={data.kpi.roi30d.change}
            icon={TrendingUp}
          />

          <KPIWidget
            title="Active Strategies"
            value={data.kpi.activeStrategies.current.toString()}
            description={data.kpi.activeStrategies.description}
            icon={Target}
          />

          <KPIWidget
            title="Open Positions"
            value={data.kpi.openPositions.current.toString()}
            description={data.kpi.openPositions.description}
            icon={BarChart3}
          />

          <KPIWidget
            title="Total Return"
            value={`$${data.kpi.totalReturn.current.toLocaleString()}`}
            change={data.kpi.totalReturn.change}
            icon={Award}
          />
        </div>

        {/* Charts and Activity */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
          {/* Performance Chart */}
          <div className="xl:col-span-2">
            <PerformanceChart
              data={data.performance}
              title="Portfolio Performance (30 days)"
              showBenchmark={true}
              height={350}
            />
          </div>

          {/* Win Rate Widget */}
          <KPIWidget
            title="Win Rate"
            value={`${data.kpi.winRate.current.toFixed(1)}%`}
            change={data.kpi.winRate.change}
            icon={Percent}
            className="h-fit"
          >
            <div className="mt-4">
              <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                <div
                  className="bg-success-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.max(0, Math.min(100, data.kpi.winRate.current))}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                <span>0%</span>
                <span>100%</span>
              </div>
            </div>
          </KPIWidget>
        </div>

        {/* Activity and Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          <ActivityFeed
            activities={data.activities}
            maxItems={8}
          />

          <AlertsWidget
            alerts={data.alerts}
            onDismiss={handleDismissAlert}
            onMarkAsRead={handleMarkAsRead}
          />
        </div>

        {/* Empty State for New Users */}
        {isNewUser && (
          <div className="text-center py-12 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
            <TrendingUp className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
              Ready to Start Trading?
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6 max-w-md mx-auto">
              Create your first strategy or start paper trading to see your performance data here.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                Create Strategy
              </button>
              <button className="px-6 py-2 border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors">
                Start Paper Trading
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Guided tour for onboarding */}
      {!hasCompletedOnboarding && <GuidedTour />}
    </MainLayout>
  );
}