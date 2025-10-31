'use client';

import { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  Target,
  BarChart3,
  Award,
  Percent
} from 'lucide-react';
import { MainLayout } from '@/components/layout';
import {
  KPIWidget,
  PerformanceChart,
  ActivityFeed,
  AlertsWidget,
  Alert
} from '@/components/features/dashboard';
import { GuidedTour } from '@/components/features/onboarding';
import { useAuthStore } from '@/stores/auth-store';
import { useOnboardingStore } from '@/stores/onboarding-store';
import {
  mockPerformanceData,
  mockKPIData,
  mockRecentActivity,
  mockAlerts,
  emptyStateData
} from '@/mocks/data/dashboard';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { hasCompletedOnboarding } = useOnboardingStore();

  // For demo purposes, we'll show empty state for new users
  const [isNewUser] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);

  const data = isNewUser ? emptyStateData : {
    performanceData: mockPerformanceData,
    kpiData: mockKPIData,
    recentActivity: mockRecentActivity,
    alerts: mockAlerts,
  };

  const handleDismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const handleMarkAsRead = (alertId: string) => {
    setAlerts(prev => prev.map(alert =>
      alert.id === alertId ? { ...alert, isRead: true } : alert
    ));
  };

  if (!user) {
    return null;
  }

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
            </p>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 lg:gap-6">
          <KPIWidget
            title="Portfolio Value"
            value={`$${data.kpiData.portfolioValue.current.toLocaleString()}`}
            change={data.kpiData.portfolioValue.change}
            icon={DollarSign}
            className="sm:col-span-2 lg:col-span-1"
          />

          <KPIWidget
            title="30d ROI"
            value={`${data.kpiData.roi30d.current}%`}
            change={data.kpiData.roi30d.change}
            icon={TrendingUp}
          />

          <KPIWidget
            title="Active Strategies"
            value={data.kpiData.activeStrategies.current}
            description={data.kpiData.activeStrategies.description}
            icon={Target}
          />

          <KPIWidget
            title="Open Positions"
            value={data.kpiData.openPositions.current}
            description={data.kpiData.openPositions.description}
            icon={BarChart3}
          />

          <KPIWidget
            title="Total Return"
            value={`$${data.kpiData.totalReturn.current.toLocaleString()}`}
            change={data.kpiData.totalReturn.change}
            icon={Award}
          />
        </div>

        {/* Charts and Activity */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
          {/* Performance Chart */}
          <div className="xl:col-span-2">
            <PerformanceChart
              data={data.performanceData}
              title="Portfolio Performance (30 days)"
              showBenchmark={true}
              height={350}
            />
          </div>

          {/* Win Rate Widget */}
          <KPIWidget
            title="Win Rate"
            value={`${data.kpiData.winRate.current}%`}
            change={data.kpiData.winRate.change}
            icon={Percent}
            className="h-fit"
          >
            <div className="mt-4">
              <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                <div
                  className="bg-success-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${data.kpiData.winRate.current}%` }}
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
            activities={data.recentActivity}
            maxItems={8}
          />

          <AlertsWidget
            alerts={alerts}
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