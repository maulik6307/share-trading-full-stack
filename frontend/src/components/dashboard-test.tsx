'use client';

import { useDashboard } from '@/lib/hooks/use-dashboard';

export function DashboardTest() {
  const { data, loading, error } = useDashboard({
    performanceDays: 7,
    activitiesLimit: 5,
    alertsLimit: 5
  });

  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return <div>No data</div>;

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Dashboard API Test</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold">Portfolio Value:</h3>
          <p>${data.kpi.portfolioValue.current.toLocaleString()}</p>
        </div>
        
        <div>
          <h3 className="font-semibold">30d ROI:</h3>
          <p>{data.kpi.roi30d.current.toFixed(1)}%</p>
        </div>
        
        <div>
          <h3 className="font-semibold">Performance Data Points:</h3>
          <p>{data.performance.length} days</p>
        </div>
        
        <div>
          <h3 className="font-semibold">Activities:</h3>
          <p>{data.activities.length} items</p>
        </div>
        
        <div>
          <h3 className="font-semibold">Alerts:</h3>
          <p>{data.alerts.length} items</p>
        </div>
      </div>
    </div>
  );
}