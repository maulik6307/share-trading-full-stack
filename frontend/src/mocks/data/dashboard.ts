import { ActivityItem } from '@/components/features/dashboard/activity-feed';
import { Alert } from '@/components/features/dashboard/alerts-widget';

// Mock performance data for the last 30 days
export const mockPerformanceData = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - i));
  
  // Generate realistic portfolio growth with some volatility
  const baseValue = 100000;
  const growth = (i / 29) * 0.124; // 12.4% growth over 30 days
  const volatility = (Math.random() - 0.5) * 0.02; // ±1% daily volatility
  const value = baseValue * (1 + growth + volatility);
  
  // Benchmark (market) performance - slightly lower
  const benchmarkGrowth = (i / 29) * 0.08; // 8% benchmark growth
  const benchmarkVolatility = (Math.random() - 0.5) * 0.015;
  const benchmark = baseValue * (1 + benchmarkGrowth + benchmarkVolatility);
  
  return {
    date: date.toISOString().split('T')[0],
    value: Math.round(value),
    benchmark: Math.round(benchmark),
  };
});

// Current portfolio value (latest from performance data)
export const currentPortfolioValue = mockPerformanceData[mockPerformanceData.length - 1].value;

// Mock KPI data
export const mockKPIData = {
  portfolioValue: {
    current: currentPortfolioValue,
    change: {
      value: 2.4,
      period: 'today',
      isPositive: true,
    },
  },
  roi30d: {
    current: 12.4,
    change: {
      value: 1.2,
      period: 'vs last month',
      isPositive: true,
    },
  },
  activeStrategies: {
    current: 5,
    profitable: 3,
    description: '3 profitable',
  },
  openPositions: {
    current: 12,
    profitable: 8,
    description: '8 in profit',
  },
  totalReturn: {
    current: 25847,
    change: {
      value: 8.3,
      period: 'all time',
      isPositive: true,
    },
  },
  winRate: {
    current: 68.5,
    change: {
      value: 2.1,
      period: '30d avg',
      isPositive: true,
    },
  },
};

// Mock recent activity
export const mockRecentActivity: ActivityItem[] = [
  {
    id: '1',
    type: 'trade',
    title: 'Position Closed',
    description: 'Sold AAPL position with +5.2% profit',
    timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    status: 'success',
    metadata: {
      amount: 2840,
      symbol: 'AAPL',
    },
  },
  {
    id: '2',
    type: 'strategy',
    title: 'Strategy Deployed',
    description: 'MA Crossover strategy started paper trading',
    timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
    status: 'success',
    metadata: {
      strategyName: 'MA Crossover v2.1',
    },
  },
  {
    id: '3',
    type: 'trade',
    title: 'Order Filled',
    description: 'Bought 100 shares of MSFT at $420.50',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    status: 'info',
    metadata: {
      amount: 42050,
      symbol: 'MSFT',
    },
  },
  {
    id: '4',
    type: 'alert',
    title: 'Risk Alert',
    description: 'Portfolio drawdown exceeded 5% threshold',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    status: 'warning',
  },
  {
    id: '5',
    type: 'strategy',
    title: 'Backtest Completed',
    description: 'RSI Mean Reversion backtest finished with 15.2% return',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    status: 'success',
    metadata: {
      strategyName: 'RSI Mean Reversion',
    },
  },
  {
    id: '6',
    type: 'trade',
    title: 'Stop Loss Triggered',
    description: 'TSLA position closed at -2.1% loss',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    status: 'warning',
    metadata: {
      amount: -1250,
      symbol: 'TSLA',
    },
  },
  {
    id: '7',
    type: 'system',
    title: 'Market Data Updated',
    description: 'Real-time market data connection restored',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    status: 'success',
  },
  {
    id: '8',
    type: 'trade',
    title: 'Dividend Received',
    description: 'Received $45.20 dividend from VTI',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    status: 'success',
    metadata: {
      amount: 45.20,
      symbol: 'VTI',
    },
  },
];

// Mock alerts
export const mockAlerts: Alert[] = [
  {
    id: '1',
    type: 'warning',
    title: 'High Volatility Detected',
    message: 'NVDA showing unusual price movements. Consider reviewing position size.',
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    isRead: false,
    actionable: true,
    metadata: {
      symbol: 'NVDA',
    },
  },
  {
    id: '2',
    type: 'info',
    title: 'Strategy Performance Update',
    message: 'Momentum Strategy has outperformed benchmark by 3.2% this week.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    isRead: false,
    metadata: {
      strategyId: 'momentum-v1',
    },
  },
  {
    id: '3',
    type: 'success',
    title: 'Monthly Goal Achieved',
    message: 'Congratulations! You\'ve reached your 10% monthly return target.',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    isRead: true,
  },
  {
    id: '4',
    type: 'warning',
    title: 'Position Size Alert',
    message: 'AAPL position now represents 15% of portfolio. Consider rebalancing.',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    isRead: true,
    actionable: true,
    metadata: {
      symbol: 'AAPL',
    },
  },
  {
    id: '5',
    type: 'error',
    title: 'Strategy Error',
    message: 'Arbitrage Strategy encountered an error and has been paused.',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    isRead: false,
    actionable: true,
    metadata: {
      strategyId: 'arbitrage-v2',
    },
  },
];

// Empty state data for new users
export const emptyStateData = {
  performanceData: [
    {
      date: new Date().toISOString().split('T')[0],
      value: 100000,
      benchmark: 100000,
    },
  ],
  kpiData: {
    portfolioValue: {
      current: 100000,
      change: {
        value: 0,
        period: 'today',
        isPositive: true,
      },
    },
    roi30d: {
      current: 0,
      change: {
        value: 0,
        period: 'vs last month',
        isPositive: true,
      },
    },
    activeStrategies: {
      current: 0,
      profitable: 0,
      description: 'No strategies yet',
    },
    openPositions: {
      current: 0,
      profitable: 0,
      description: 'No positions',
    },
    totalReturn: {
      current: 0,
      change: {
        value: 0,
        period: 'all time',
        isPositive: true,
      },
    },
    winRate: {
      current: 0,
      change: {
        value: 0,
        period: '30d avg',
        isPositive: true,
      },
    },
  },
  recentActivity: [],
  alerts: [],
};