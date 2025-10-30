import { 
  Backtest, 
  BacktestResult, 
  BacktestSummary, 
  EquityPoint, 
  DrawdownPoint, 
  MonthlyReturn, 
  RiskMetrics 
} from '@/types/trading';
import { mockTrades } from './orders';

// Generate equity curve data
const generateEquityCurve = (
  startDate: Date, 
  endDate: Date, 
  initialCapital: number,
  finalCapital: number,
  volatility: number = 0.02
): EquityPoint[] => {
  const points: EquityPoint[] = [];
  const days = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const dailyReturn = Math.pow(finalCapital / initialCapital, 1 / days) - 1;
  
  let currentEquity = initialCapital;
  let maxEquity = initialCapital;
  
  for (let i = 0; i <= days; i++) {
    const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
    
    // Add some realistic volatility
    const randomReturn = (Math.random() - 0.5) * volatility;
    const dayReturn = dailyReturn + randomReturn;
    
    if (i > 0) {
      currentEquity *= (1 + dayReturn);
    }
    
    maxEquity = Math.max(maxEquity, currentEquity);
    const drawdown = (currentEquity - maxEquity) / maxEquity;
    const returns = i === 0 ? 0 : dayReturn;
    
    points.push({
      date,
      equity: currentEquity,
      drawdown: drawdown * 100,
      returns: returns * 100,
    });
  }
  
  return points;
};

// Generate drawdown curve
const generateDrawdownCurve = (equityCurve: EquityPoint[]): DrawdownPoint[] => {
  let maxEquity = 0;
  
  return equityCurve.map(point => {
    const isNewHigh = point.equity > maxEquity;
    if (isNewHigh) {
      maxEquity = point.equity;
    }
    
    const drawdown = maxEquity - point.equity;
    const drawdownPercent = maxEquity > 0 ? (drawdown / maxEquity) * 100 : 0;
    
    return {
      date: point.date,
      drawdown,
      drawdownPercent,
      isNewHigh,
    };
  });
};

// Generate monthly returns
const generateMonthlyReturns = (equityCurve: EquityPoint[]): MonthlyReturn[] => {
  const monthlyReturns: MonthlyReturn[] = [];
  const monthlyData = new Map<string, { start: number; end: number }>();
  
  equityCurve.forEach(point => {
    const key = `${point.date.getFullYear()}-${point.date.getMonth()}`;
    if (!monthlyData.has(key)) {
      monthlyData.set(key, { start: point.equity, end: point.equity });
    } else {
      monthlyData.get(key)!.end = point.equity;
    }
  });
  
  monthlyData.forEach((data, key) => {
    const [year, month] = key.split('-').map(Number);
    const returnAmount = data.end - data.start;
    const returnPercent = data.start > 0 ? (returnAmount / data.start) * 100 : 0;
    
    monthlyReturns.push({
      year,
      month: month + 1, // Convert from 0-based to 1-based
      return: returnAmount,
      returnPercent,
    });
  });
  
  return monthlyReturns.sort((a, b) => a.year - b.year || a.month - b.month);
};

export const mockBacktests: Backtest[] = [
  {
    id: 'backtest-1',
    strategyId: 'strategy-1',
    name: 'MA Crossover Backtest - 6 Months',
    status: 'COMPLETED',
    startDate: new Date('2023-07-01T00:00:00Z'),
    endDate: new Date('2023-12-31T23:59:59Z'),
    initialCapital: 100000,
    commission: 0.1,
    slippage: 0.05,
    createdAt: new Date('2024-01-15T10:30:00Z'),
    startedAt: new Date('2024-01-15T10:30:05Z'),
    completedAt: new Date('2024-01-15T10:32:15Z'),
    progress: 100,
  },
  {
    id: 'backtest-2',
    strategyId: 'strategy-2',
    name: 'RSI Mean Reversion - 3 Months',
    status: 'COMPLETED',
    startDate: new Date('2023-10-01T00:00:00Z'),
    endDate: new Date('2023-12-31T23:59:59Z'),
    initialCapital: 50000,
    commission: 0.1,
    slippage: 0.05,
    createdAt: new Date('2024-01-10T09:15:00Z'),
    startedAt: new Date('2024-01-10T09:15:10Z'),
    completedAt: new Date('2024-01-10T09:16:45Z'),
    progress: 100,
  },
  {
    id: 'backtest-3',
    strategyId: 'strategy-4',
    name: 'Bollinger Bands - 1 Year',
    status: 'COMPLETED',
    startDate: new Date('2023-01-01T00:00:00Z'),
    endDate: new Date('2023-12-31T23:59:59Z'),
    initialCapital: 75000,
    commission: 0.1,
    slippage: 0.05,
    createdAt: new Date('2024-01-05T13:20:00Z'),
    startedAt: new Date('2024-01-05T13:20:08Z'),
    completedAt: new Date('2024-01-05T13:23:42Z'),
    progress: 100,
  },
  // Running backtest (edge case)
  {
    id: 'backtest-4',
    strategyId: 'strategy-3',
    name: 'Momentum Strategy - 6 Months',
    status: 'RUNNING',
    startDate: new Date('2023-07-01T00:00:00Z'),
    endDate: new Date('2023-12-31T23:59:59Z'),
    initialCapital: 80000,
    commission: 0.1,
    slippage: 0.05,
    createdAt: new Date('2024-01-23T14:45:00Z'),
    startedAt: new Date('2024-01-23T14:45:15Z'),
    progress: 67,
  },
  // Failed backtest (edge case)
  {
    id: 'backtest-5',
    strategyId: 'strategy-3',
    name: 'Failed Momentum Test',
    status: 'FAILED',
    startDate: new Date('2023-01-01T00:00:00Z'),
    endDate: new Date('2023-12-31T23:59:59Z'),
    initialCapital: 100000,
    commission: 0.1,
    slippage: 0.05,
    createdAt: new Date('2024-01-22T16:00:00Z'),
    startedAt: new Date('2024-01-22T16:00:10Z'),
    progress: 0,
    errorMessage: 'Invalid parameter configuration: lookbackPeriod must be greater than 0',
  },
];

// Successful backtest result
const equityCurve1 = generateEquityCurve(
  new Date('2023-07-01T00:00:00Z'),
  new Date('2023-12-31T23:59:59Z'),
  100000,
  115420.50
);

export const mockBacktestResults: BacktestResult[] = [
  {
    id: 'result-1',
    backtestId: 'backtest-1',
    summary: {
      totalReturn: 15420.50,
      totalReturnPercent: 15.42,
      annualizedReturn: 32.85,
      sharpeRatio: 1.85,
      sortinoRatio: 2.34,
      maxDrawdown: -8750.25,
      maxDrawdownPercent: -8.75,
      maxDrawdownDuration: 23,
      volatility: 18.45,
      winRate: 0.68,
      profitFactor: 2.34,
      totalTrades: 47,
      winningTrades: 32,
      losingTrades: 15,
      avgWin: 1250.75,
      avgLoss: -580.30,
      largestWin: 4500.00,
      largestLoss: -1200.50,
      avgTradeDuration: 3.2,
      finalCapital: 115420.50,
      totalCommission: 235.50,
      totalSlippage: 117.75,
    },
    equityCurve: equityCurve1,
    drawdownCurve: generateDrawdownCurve(equityCurve1),
    trades: mockTrades.slice(0, 5), // Use some mock trades
    monthlyReturns: generateMonthlyReturns(equityCurve1),
    riskMetrics: {
      var95: -2450.75,
      var99: -4120.30,
      cvar95: -3250.80,
      cvar99: -5180.45,
      beta: 0.85,
      alpha: 0.12,
      informationRatio: 1.23,
      calmarRatio: 3.76,
      sterlingRatio: 2.89,
    },
  },
  // Losing strategy result (edge case)
  {
    id: 'result-3',
    backtestId: 'backtest-3',
    summary: {
      totalReturn: -12340.75,
      totalReturnPercent: -16.45,
      annualizedReturn: -16.45,
      sharpeRatio: -0.85,
      sortinoRatio: -1.12,
      maxDrawdown: -18750.50,
      maxDrawdownPercent: -25.00,
      maxDrawdownDuration: 89,
      volatility: 22.15,
      winRate: 0.35,
      profitFactor: 0.68,
      totalTrades: 31,
      winningTrades: 11,
      losingTrades: 20,
      avgWin: 890.25,
      avgLoss: -1120.40,
      largestWin: 2100.00,
      largestLoss: -2850.75,
      avgTradeDuration: 5.8,
      finalCapital: 62659.25,
      totalCommission: 155.00,
      totalSlippage: 77.50,
    },
    equityCurve: generateEquityCurve(
      new Date('2023-01-01T00:00:00Z'),
      new Date('2023-12-31T23:59:59Z'),
      75000,
      62659.25,
      0.025
    ),
    drawdownCurve: [],
    trades: mockTrades.slice(5, 8),
    monthlyReturns: [],
    riskMetrics: {
      var95: -3250.75,
      var99: -5420.30,
      cvar95: -4150.80,
      cvar99: -6580.45,
      beta: 1.15,
      alpha: -0.08,
      informationRatio: -0.73,
      calmarRatio: -0.66,
      sterlingRatio: -0.52,
    },
  },
];

// Add the equity curve to the second result
mockBacktestResults[1].drawdownCurve = generateDrawdownCurve(mockBacktestResults[1].equityCurve);
mockBacktestResults[1].monthlyReturns = generateMonthlyReturns(mockBacktestResults[1].equityCurve);