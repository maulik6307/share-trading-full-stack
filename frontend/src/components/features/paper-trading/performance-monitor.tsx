'use client';

import { useState, useEffect } from 'react';
import { PaperTradingSession } from './paper-trading-session';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Badge, Button, useToast } from '@/components/ui';
import { TrendingUp, TrendingDown, AlertTriangle, DollarSign, Target, Shield, Clock, Download } from 'lucide-react';

interface PerformanceMonitorProps {
  sessions: PaperTradingSession[];
  onExportReport?: () => void;
}

interface PerformanceData {
  timestamp: Date;
  totalPnL: number;
  dayPnL: number;
  drawdown: number;
  capitalUtilization: number;
  activePositions: number;
  riskScore: number;
}

interface RiskAlert {
  id: string;
  sessionId: string;
  strategyName: string;
  type: 'DAILY_LOSS' | 'DRAWDOWN' | 'POSITION_SIZE' | 'RISK_LIMIT';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  value: number;
  threshold: number;
  timestamp: Date;
  acknowledged: boolean;
}

export function PerformanceMonitor({ sessions, onExportReport }: PerformanceMonitorProps) {
  const { addToast } = useToast();
  const [performanceHistory, setPerformanceHistory] = useState<PerformanceData[]>([]);
  const [riskAlerts, setRiskAlerts] = useState<RiskAlert[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1H' | '4H' | '1D' | '1W'>('1H');
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'risk' | 'alerts'>('overview');

  // Generate performance history data
  useEffect(() => {
    const generateHistoryData = () => {
      const now = new Date();
      const data: PerformanceData[] = [];
      
      // Generate last 24 hours of data points (every 5 minutes)
      for (let i = 288; i >= 0; i--) {
        const timestamp = new Date(now.getTime() - i * 5 * 60 * 1000);
        
        const totalPnL = sessions.reduce((sum, s) => sum + s.statistics.totalPnL, 0);
        const dayPnL = sessions.reduce((sum, s) => sum + s.statistics.dayPnL, 0);
        const drawdown = Math.max(...sessions.map(s => s.riskMetrics.drawdownPercent));
        const capitalUtilization = sessions.reduce((sum, s) => sum + s.statistics.capitalUtilization, 0) / Math.max(sessions.length, 1);
        const activePositions = sessions.reduce((sum, s) => sum + s.statistics.activePositions, 0);
        
        // Calculate risk score (0-100)
        const riskScore = Math.min(100, 
          (drawdown * 2) + 
          (capitalUtilization * 0.5) + 
          (activePositions * 5)
        );
        
        data.push({
          timestamp,
          totalPnL: totalPnL + (Math.random() - 0.5) * 1000, // Add some variation
          dayPnL: dayPnL + (Math.random() - 0.5) * 500,
          drawdown,
          capitalUtilization,
          activePositions,
          riskScore,
        });
      }
      
      setPerformanceHistory(data);
    };

    generateHistoryData();
    
    // Update every 30 seconds
    const interval = setInterval(generateHistoryData, 30000);
    return () => clearInterval(interval);
  }, [sessions]);

  // Monitor for risk alerts
  useEffect(() => {
    const checkRiskAlerts = () => {
      const newAlerts: RiskAlert[] = [];
      
      sessions.forEach(session => {
        // Daily loss alert
        if (session.riskMetrics.dailyLossPercent > 80) {
          newAlerts.push({
            id: `alert-${session.id}-daily-${Date.now()}`,
            sessionId: session.id,
            strategyName: session.strategy.name,
            type: 'DAILY_LOSS',
            severity: session.riskMetrics.dailyLossPercent > 95 ? 'CRITICAL' : 'HIGH',
            message: `Daily loss limit approaching: ${session.riskMetrics.dailyLossPercent.toFixed(1)}%`,
            value: session.riskMetrics.dailyLossUsed,
            threshold: session.config.maxDailyLoss,
            timestamp: new Date(),
            acknowledged: false,
          });
        }
        
        // Drawdown alert
        if (session.riskMetrics.drawdownPercent > 70) {
          newAlerts.push({
            id: `alert-${session.id}-drawdown-${Date.now()}`,
            sessionId: session.id,
            strategyName: session.strategy.name,
            type: 'DRAWDOWN',
            severity: session.riskMetrics.drawdownPercent > 90 ? 'CRITICAL' : 'HIGH',
            message: `Maximum drawdown approaching: ${session.riskMetrics.drawdownPercent.toFixed(1)}%`,
            value: session.riskMetrics.drawdownUsed,
            threshold: session.config.maxDrawdown,
            timestamp: new Date(),
            acknowledged: false,
          });
        }
        
        // Position size alert
        if (session.riskMetrics.positionSizePercent > 85) {
          newAlerts.push({
            id: `alert-${session.id}-position-${Date.now()}`,
            sessionId: session.id,
            strategyName: session.strategy.name,
            type: 'POSITION_SIZE',
            severity: 'MEDIUM',
            message: `Position size limit approaching: ${session.riskMetrics.positionSizePercent.toFixed(1)}%`,
            value: session.riskMetrics.positionSizeUsed,
            threshold: session.config.maxPositionSize,
            timestamp: new Date(),
            acknowledged: false,
          });
        }
      });
      
      // Add new alerts that don't already exist
      setRiskAlerts(prev => {
        const existingAlertKeys = new Set(prev.map(a => `${a.sessionId}-${a.type}`));
        const uniqueNewAlerts = newAlerts.filter(a => 
          !existingAlertKeys.has(`${a.sessionId}-${a.type}`)
        );
        
        // Show toast for critical alerts
        uniqueNewAlerts.forEach(alert => {
          if (alert.severity === 'CRITICAL') {
            addToast({
              type: 'error',
              title: 'Critical Risk Alert',
              description: `${alert.strategyName}: ${alert.message}`,
            });
          }
        });
        
        return [...uniqueNewAlerts, ...prev].slice(0, 50); // Keep last 50 alerts
      });
    };

    checkRiskAlerts();
    
    // Check every 10 seconds
    const interval = setInterval(checkRiskAlerts, 10000);
    return () => clearInterval(interval);
  }, [sessions, addToast]);

  const acknowledgeAlert = (alertId: string) => {
    setRiskAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      )
    );
  };

  const clearAllAlerts = () => {
    setRiskAlerts(prev => prev.map(alert => ({ ...alert, acknowledged: true })));
  };

  // Calculate aggregate metrics
  const totalCapital = sessions.reduce((sum, s) => sum + s.config.capital, 0);
  const totalPnL = sessions.reduce((sum, s) => sum + s.statistics.totalPnL, 0);
  const totalPnLPercent = totalCapital > 0 ? (totalPnL / totalCapital) * 100 : 0;
  const totalDayPnL = sessions.reduce((sum, s) => sum + s.statistics.dayPnL, 0);
  const totalDayPnLPercent = totalCapital > 0 ? (totalDayPnL / totalCapital) * 100 : 0;
  const totalTrades = sessions.reduce((sum, s) => sum + s.statistics.totalTrades, 0);
  const totalWinningTrades = sessions.reduce((sum, s) => sum + s.statistics.winningTrades, 0);
  const overallWinRate = totalTrades > 0 ? (totalWinningTrades / totalTrades) * 100 : 0;
  const activePositions = sessions.reduce((sum, s) => sum + s.statistics.activePositions, 0);
  const unacknowledgedAlerts = riskAlerts.filter(a => !a.acknowledged);

  // Chart data
  const filteredHistory = performanceHistory.slice(-Math.min(performanceHistory.length, 
    selectedTimeframe === '1H' ? 12 : 
    selectedTimeframe === '4H' ? 48 : 
    selectedTimeframe === '1D' ? 288 : 2016
  ));

  const sessionDistribution = sessions.map(session => ({
    name: session.strategy.name,
    value: Math.abs(session.statistics.totalPnL),
    pnl: session.statistics.totalPnL,
  }));

  const riskDistribution = [
    { name: 'Low Risk', value: sessions.filter(s => s.riskMetrics.drawdownPercent < 30).length, color: '#10B981' },
    { name: 'Medium Risk', value: sessions.filter(s => s.riskMetrics.drawdownPercent >= 30 && s.riskMetrics.drawdownPercent < 70).length, color: '#F59E0B' },
    { name: 'High Risk', value: sessions.filter(s => s.riskMetrics.drawdownPercent >= 70).length, color: '#EF4444' },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'HIGH': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'LOW': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default: return 'bg-neutral-100 text-neutral-800 dark:bg-neutral-900 dark:text-neutral-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Performance Monitor
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400">
            Real-time monitoring of paper trading performance and risk metrics
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {unacknowledgedAlerts.length > 0 && (
            <Button
              variant="outline"
              onClick={clearAllAlerts}
              className="text-orange-600 hover:text-orange-700"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Clear Alerts ({unacknowledgedAlerts.length})
            </Button>
          )}
          
          <Button onClick={onExportReport}>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="text-center p-4 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400 mx-auto mb-2" />
          <p className="text-sm text-neutral-600 dark:text-neutral-400">Total P&L</p>
          <p className={`text-xl font-bold ${
            totalPnL >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          }`}>
            ₹{(totalPnL / 1000).toFixed(1)}K
          </p>
          <p className="text-xs text-neutral-500">{totalPnLPercent.toFixed(2)}%</p>
        </div>
        
        <div className="text-center p-4 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
          <p className="text-sm text-neutral-600 dark:text-neutral-400">Day P&L</p>
          <p className={`text-xl font-bold ${
            totalDayPnL >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          }`}>
            ₹{(totalDayPnL / 1000).toFixed(1)}K
          </p>
          <p className="text-xs text-neutral-500">{totalDayPnLPercent.toFixed(2)}%</p>
        </div>
        
        <div className="text-center p-4 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <Target className="w-6 h-6 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
          <p className="text-sm text-neutral-600 dark:text-neutral-400">Win Rate</p>
          <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
            {overallWinRate.toFixed(1)}%
          </p>
          <p className="text-xs text-neutral-500">{totalWinningTrades}/{totalTrades}</p>
        </div>
        
        <div className="text-center p-4 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <TrendingDown className="w-6 h-6 text-orange-600 dark:text-orange-400 mx-auto mb-2" />
          <p className="text-sm text-neutral-600 dark:text-neutral-400">Active Positions</p>
          <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
            {activePositions}
          </p>
          <p className="text-xs text-neutral-500">{sessions.length} strategies</p>
        </div>
        
        <div className="text-center p-4 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <Shield className="w-6 h-6 text-neutral-600 dark:text-neutral-400 mx-auto mb-2" />
          <p className="text-sm text-neutral-600 dark:text-neutral-400">Risk Alerts</p>
          <p className={`text-xl font-bold ${
            unacknowledgedAlerts.length > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
          }`}>
            {unacknowledgedAlerts.length}
          </p>
          <p className="text-xs text-neutral-500">
            {unacknowledgedAlerts.filter(a => a.severity === 'CRITICAL').length} critical
          </p>
        </div>
        
        <div className="text-center p-4 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <Clock className="w-6 h-6 text-neutral-600 dark:text-neutral-400 mx-auto mb-2" />
          <p className="text-sm text-neutral-600 dark:text-neutral-400">Active Sessions</p>
          <p className="text-xl font-bold text-neutral-900 dark:text-white">
            {sessions.filter(s => s.status === 'RUNNING').length}
          </p>
          <p className="text-xs text-neutral-500">of {sessions.length} total</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-neutral-200 dark:border-neutral-700">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'performance', label: 'Performance Charts' },
            { id: 'risk', label: 'Risk Analysis' },
            { id: 'alerts', label: `Alerts (${unacknowledgedAlerts.length})` },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === id
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[500px]">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* P&L Distribution */}
            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                P&L Distribution by Strategy
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sessionDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, pnl }) => `${name}: ₹${(pnl / 1000).toFixed(1)}K`}
                    >
                      {sessionDistribution.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.pnl >= 0 ? '#10B981' : '#EF4444'} 
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number, name) => [
                        `₹${(value / 1000).toFixed(1)}K`, 
                        'P&L'
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Risk Distribution */}
            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                Risk Distribution
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {riskDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="space-y-6">
            {/* Timeframe Selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-600 dark:text-neutral-400">Timeframe:</span>
              {['1H', '4H', '1D', '1W'].map((timeframe) => (
                <Button
                  key={timeframe}
                  size="sm"
                  variant={selectedTimeframe === timeframe ? 'primary' : 'outline'}
                  onClick={() => setSelectedTimeframe(timeframe as any)}
                >
                  {timeframe}
                </Button>
              ))}
            </div>

            {/* P&L Chart */}
            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                P&L Over Time
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={filteredHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                    />
                    <YAxis tickFormatter={(value) => `₹${(value / 1000).toFixed(1)}K`} />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleString()}
                      formatter={(value: number) => [`₹${(value / 1000).toFixed(1)}K`, 'P&L']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="totalPnL" 
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Drawdown Chart */}
            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                Drawdown Analysis
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={filteredHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                    />
                    <YAxis tickFormatter={(value) => `${value.toFixed(1)}%`} />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleString()}
                      formatter={(value: number) => [`${value.toFixed(2)}%`, 'Drawdown']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="drawdown" 
                      stroke="#EF4444" 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'risk' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Risk Score Chart */}
            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                Risk Score Over Time
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={filteredHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                    />
                    <YAxis domain={[0, 100]} />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleString()}
                      formatter={(value: number) => [value.toFixed(1), 'Risk Score']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="riskScore" 
                      stroke="#F59E0B" 
                      fill="#F59E0B" 
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Capital Utilization */}
            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                Capital Utilization
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={filteredHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                    />
                    <YAxis tickFormatter={(value) => `${value.toFixed(1)}%`} />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleString()}
                      formatter={(value: number) => [`${value.toFixed(1)}%`, 'Utilization']}
                    />
                    <Bar dataKey="capitalUtilization" fill="#8B5CF6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="space-y-4">
            {riskAlerts.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
                <Shield className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
                  No Risk Alerts
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  All paper trading sessions are operating within normal risk parameters.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {riskAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-lg border ${
                      alert.acknowledged 
                        ? 'bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 opacity-60'
                        : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className={`w-5 h-5 mt-0.5 ${
                          alert.severity === 'CRITICAL' ? 'text-red-500' :
                          alert.severity === 'HIGH' ? 'text-orange-500' :
                          alert.severity === 'MEDIUM' ? 'text-yellow-500' : 'text-blue-500'
                        }`} />
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-neutral-900 dark:text-white">
                              {alert.strategyName}
                            </h4>
                            <Badge className={getSeverityColor(alert.severity)}>
                              {alert.severity}
                            </Badge>
                            <Badge className="bg-neutral-100 text-neutral-800 dark:bg-neutral-900 dark:text-neutral-200">
                              {alert.type.replace('_', ' ')}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                            {alert.message}
                          </p>
                          
                          <div className="flex items-center gap-4 text-xs text-neutral-500">
                            <span>
                              Value: ₹{(alert.value / 1000).toFixed(1)}K
                            </span>
                            <span>
                              Threshold: ₹{(alert.threshold / 1000).toFixed(1)}K
                            </span>
                            <span>
                              {alert.timestamp.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {!alert.acknowledged && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => acknowledgeAlert(alert.id)}
                        >
                          Acknowledge
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}