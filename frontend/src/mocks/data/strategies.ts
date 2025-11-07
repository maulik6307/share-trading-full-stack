import { Strategy, StrategyTemplate } from '@/types/trading';

export const mockStrategyTemplates: StrategyTemplate[] = [
  {
    id: 'template-ma-crossover',
    name: 'Moving Average Crossover',
    description: 'A classic trend-following strategy that generates buy signals when a fast MA crosses above a slow MA, and sell signals when it crosses below.',
    category: 'Trend Following',
    defaultParameters: {
      fastPeriod: 10,
      slowPeriod: 20,
      symbol: 'RELIANCE',
      quantity: 100,
      stopLoss: 2.0,
      takeProfit: 4.0,
    },
    parameterSchema: [
      {
        key: 'fastPeriod',
        label: 'Fast MA Period',
        type: 'number',
        defaultValue: 10,
        min: 5,
        max: 50,
        step: 1,
        required: true,
        description: 'Period for the fast moving average',
      },
      {
        key: 'slowPeriod',
        label: 'Slow MA Period',
        type: 'number',
        defaultValue: 20,
        min: 10,
        max: 100,
        step: 1,
        required: true,
        description: 'Period for the slow moving average',
      },
      {
        key: 'symbol',
        label: 'Symbol',
        type: 'select',
        defaultValue: 'RELIANCE',
        options: [
          { label: 'Reliance', value: 'RELIANCE' },
          { label: 'TCS', value: 'TCS' },
          { label: 'HDFC Bank', value: 'HDFCBANK' },
          { label: 'Infosys', value: 'INFY' },
        ],
        required: true,
        description: 'Trading symbol',
      },
      {
        key: 'quantity',
        label: 'Quantity',
        type: 'number',
        defaultValue: 100,
        min: 1,
        max: 10000,
        step: 1,
        required: true,
        description: 'Number of shares to trade',
      },
      {
        key: 'stopLoss',
        label: 'Stop Loss %',
        type: 'number',
        defaultValue: 2.0,
        min: 0.5,
        max: 10.0,
        step: 0.1,
        required: false,
        description: 'Stop loss percentage',
      },
      {
        key: 'takeProfit',
        label: 'Take Profit %',
        type: 'number',
        defaultValue: 4.0,
        min: 1.0,
        max: 20.0,
        step: 0.1,
        required: false,
        description: 'Take profit percentage',
      },
    ],
    code: `// Moving Average Crossover Strategy
function onTick(data) {
  const fastMA = calculateMA(data.prices, params.fastPeriod);
  const slowMA = calculateMA(data.prices, params.slowPeriod);
  
  if (fastMA > slowMA && !position.isLong) {
    buy(params.quantity, { stopLoss: params.stopLoss, takeProfit: params.takeProfit });
  } else if (fastMA < slowMA && position.isLong) {
    sell(position.quantity);
  }
}`,
    isBuiltIn: true,
    createdAt: new Date('2024-01-01T00:00:00Z'),
  },
  {
    id: 'template-rsi-mean-reversion',
    name: 'RSI Mean Reversion',
    description: 'A mean reversion strategy that buys when RSI is oversold and sells when overbought.',
    category: 'Mean Reversion',
    defaultParameters: {
      rsiPeriod: 14,
      oversoldLevel: 30,
      overboughtLevel: 70,
      symbol: 'TCS',
      quantity: 50,
    },
    parameterSchema: [
      {
        key: 'rsiPeriod',
        label: 'RSI Period',
        type: 'number',
        defaultValue: 14,
        min: 5,
        max: 30,
        step: 1,
        required: true,
        description: 'Period for RSI calculation',
      },
      {
        key: 'oversoldLevel',
        label: 'Oversold Level',
        type: 'number',
        defaultValue: 30,
        min: 10,
        max: 40,
        step: 1,
        required: true,
        description: 'RSI level considered oversold',
      },
      {
        key: 'overboughtLevel',
        label: 'Overbought Level',
        type: 'number',
        defaultValue: 70,
        min: 60,
        max: 90,
        step: 1,
        required: true,
        description: 'RSI level considered overbought',
      },
    ],
    isBuiltIn: true,
    createdAt: new Date('2024-01-01T00:00:00Z'),
  },
  {
    id: 'template-bollinger-bands',
    name: 'Bollinger Bands Breakout',
    description: 'A volatility-based strategy that trades breakouts from Bollinger Bands.',
    category: 'Volatility',
    defaultParameters: {
      period: 20,
      standardDeviations: 2.0,
      symbol: 'HDFCBANK',
      quantity: 75,
    },
    parameterSchema: [
      {
        key: 'period',
        label: 'Period',
        type: 'number',
        defaultValue: 20,
        min: 10,
        max: 50,
        step: 1,
        required: true,
        description: 'Period for moving average and standard deviation',
      },
      {
        key: 'standardDeviations',
        label: 'Standard Deviations',
        type: 'number',
        defaultValue: 2.0,
        min: 1.0,
        max: 3.0,
        step: 0.1,
        required: true,
        description: 'Number of standard deviations for bands',
      },
      {
        key: 'symbol',
        label: 'Symbol',
        type: 'select',
        defaultValue: 'HDFCBANK',
        options: [
          { label: 'Reliance', value: 'RELIANCE' },
          { label: 'TCS', value: 'TCS' },
          { label: 'HDFC Bank', value: 'HDFCBANK' },
          { label: 'Infosys', value: 'INFY' },
        ],
        required: true,
        description: 'Trading symbol',
      },
      {
        key: 'quantity',
        label: 'Quantity',
        type: 'number',
        defaultValue: 75,
        min: 1,
        max: 10000,
        step: 1,
        required: true,
        description: 'Number of shares to trade',
      },
    ],
    code: `// Bollinger Bands Breakout Strategy
function onTick(data) {
  const sma = calculateSMA(data.prices, params.period);
  const stdDev = calculateStdDev(data.prices, params.period);
  const upperBand = sma + (stdDev * params.standardDeviations);
  const lowerBand = sma - (stdDev * params.standardDeviations);
  const currentPrice = data.prices[data.prices.length - 1];
  
  if (currentPrice > upperBand && !position.isLong) {
    buy(params.quantity);
  } else if (currentPrice < lowerBand && position.isLong) {
    sell(position.quantity);
  }
}`,
    isBuiltIn: true,
    createdAt: new Date('2024-01-01T00:00:00Z'),
  },
  {
    id: 'template-macd-divergence',
    name: 'MACD Divergence',
    description: 'A momentum strategy that identifies divergences between price and MACD indicator.',
    category: 'Momentum',
    defaultParameters: {
      fastPeriod: 12,
      slowPeriod: 26,
      signalPeriod: 9,
      symbol: 'INFY',
      quantity: 100,
      divergenceThreshold: 0.5,
    },
    parameterSchema: [
      {
        key: 'fastPeriod',
        label: 'Fast EMA Period',
        type: 'number',
        defaultValue: 12,
        min: 5,
        max: 20,
        step: 1,
        required: true,
        description: 'Period for fast exponential moving average',
      },
      {
        key: 'slowPeriod',
        label: 'Slow EMA Period',
        type: 'number',
        defaultValue: 26,
        min: 20,
        max: 50,
        step: 1,
        required: true,
        description: 'Period for slow exponential moving average',
      },
      {
        key: 'signalPeriod',
        label: 'Signal Line Period',
        type: 'number',
        defaultValue: 9,
        min: 5,
        max: 15,
        step: 1,
        required: true,
        description: 'Period for MACD signal line',
      },
      {
        key: 'divergenceThreshold',
        label: 'Divergence Threshold',
        type: 'range',
        defaultValue: 0.5,
        min: 0.1,
        max: 2.0,
        step: 0.1,
        required: true,
        description: 'Minimum divergence strength to trigger signal',
      },
    ],
    code: `// MACD Divergence Strategy
function onTick(data) {
  const macd = calculateMACD(data.prices, params.fastPeriod, params.slowPeriod, params.signalPeriod);
  const divergence = detectDivergence(data.prices, macd.histogram);
  
  if (divergence.bullish && divergence.strength > params.divergenceThreshold && !position.isLong) {
    buy(params.quantity);
  } else if (divergence.bearish && divergence.strength > params.divergenceThreshold && position.isLong) {
    sell(position.quantity);
  }
}`,
    isBuiltIn: true,
    createdAt: new Date('2024-01-01T00:00:00Z'),
  },
  {
    id: 'template-support-resistance',
    name: 'Support & Resistance Breakout',
    description: 'A breakout strategy that identifies key support and resistance levels.',
    category: 'Trend Following',
    defaultParameters: {
      lookbackPeriod: 50,
      breakoutThreshold: 0.02,
      symbol: 'TCS',
      quantity: 80,
      confirmationBars: 2,
    },
    parameterSchema: [
      {
        key: 'lookbackPeriod',
        label: 'Lookback Period',
        type: 'number',
        defaultValue: 50,
        min: 20,
        max: 100,
        step: 5,
        required: true,
        description: 'Number of bars to look back for support/resistance levels',
      },
      {
        key: 'breakoutThreshold',
        label: 'Breakout Threshold %',
        type: 'number',
        defaultValue: 0.02,
        min: 0.005,
        max: 0.05,
        step: 0.005,
        required: true,
        description: 'Minimum percentage move to confirm breakout',
      },
      {
        key: 'confirmationBars',
        label: 'Confirmation Bars',
        type: 'number',
        defaultValue: 2,
        min: 1,
        max: 5,
        step: 1,
        required: true,
        description: 'Number of bars to confirm breakout',
      },
    ],
    isBuiltIn: true,
    createdAt: new Date('2024-01-01T00:00:00Z'),
  },
];

export const mockStrategies: Strategy[] = [
  {
    id: 'strategy-1',
    name: 'My MA Crossover Strategy',
    description: 'Custom moving average crossover strategy for Reliance',
    type: 'TEMPLATE',
    status: 'ACTIVE',
    parameters: {
      fastPeriod: 12,
      slowPeriod: 26,
      symbol: 'RELIANCE',
      quantity: 200,
      stopLoss: 1.5,
      takeProfit: 3.0,
    },
    templateId: 'template-ma-crossover',
    isTemplate: false,
    tags: ['trend-following', 'reliance'],
    createdAt: new Date('2024-01-15T10:30:00Z'),
    updatedAt: new Date('2024-01-20T14:45:00Z'),
    lastBacktestId: 'backtest-1',
    deployedAt: new Date('2024-01-20T15:00:00Z'),
    performance: {
      totalReturn: 15420.50,
      totalReturnPercent: 15.42,
      sharpeRatio: 1.85,
      maxDrawdown: -8750.25,
      maxDrawdownPercent: -8.75,
      winRate: 0.68,
      profitFactor: 2.34,
      totalTrades: 47,
      winningTrades: 32,
      losingTrades: 15,
      avgWin: 1250.75,
      avgLoss: -580.30,
      largestWin: 4500.00,
      largestLoss: -1200.50,
    },
  },
  {
    id: 'strategy-2',
    name: 'TCS RSI Strategy',
    description: 'Mean reversion strategy for TCS using RSI',
    type: 'TEMPLATE',
    status: 'PAUSED',
    parameters: {
      rsiPeriod: 14,
      oversoldLevel: 25,
      overboughtLevel: 75,
      symbol: 'TCS',
      quantity: 100,
    },
    templateId: 'template-rsi-mean-reversion',
    isTemplate: false,
    tags: ['mean-reversion', 'tcs'],
    createdAt: new Date('2024-01-10T09:15:00Z'),
    updatedAt: new Date('2024-01-18T11:20:00Z'),
    lastBacktestId: 'backtest-2',
    performance: {
      totalReturn: 8750.25,
      totalReturnPercent: 8.75,
      sharpeRatio: 1.42,
      maxDrawdown: -5200.75,
      maxDrawdownPercent: -5.20,
      winRate: 0.72,
      profitFactor: 1.89,
      totalTrades: 38,
      winningTrades: 27,
      losingTrades: 11,
      avgWin: 890.45,
      avgLoss: -420.15,
      largestWin: 2100.00,
      largestLoss: -850.25,
    },
  },
  {
    id: 'strategy-3',
    name: 'Custom Momentum Strategy',
    description: 'Custom coded momentum strategy',
    type: 'CODE',
    status: 'DRAFT',
    parameters: {
      lookbackPeriod: 10,
      momentumThreshold: 0.02,
      symbol: 'INFY',
      quantity: 150,
    },
    code: `// Custom Momentum Strategy
function onTick(data) {
  const momentum = calculateMomentum(data.prices, params.lookbackPeriod);
  
  if (momentum > params.momentumThreshold && !position.isLong) {
    buy(params.quantity);
  } else if (momentum < -params.momentumThreshold && position.isLong) {
    sell(position.quantity);
  }
}

function calculateMomentum(prices, period) {
  if (prices.length < period) return 0;
  const current = prices[prices.length - 1];
  const previous = prices[prices.length - period];
  return (current - previous) / previous;
}`,
    isTemplate: false,
    tags: ['momentum', 'custom', 'infy'],
    createdAt: new Date('2024-01-22T16:45:00Z'),
    updatedAt: new Date('2024-01-22T16:45:00Z'),
  },
  {
    id: 'strategy-4',
    name: 'HDFC Bank Bollinger Strategy',
    description: 'Bollinger Bands breakout strategy for HDFC Bank',
    type: 'TEMPLATE',
    status: 'STOPPED',
    parameters: {
      period: 20,
      standardDeviations: 2.5,
      symbol: 'HDFCBANK',
      quantity: 100,
    },
    templateId: 'template-bollinger-bands',
    isTemplate: false,
    tags: ['volatility', 'hdfcbank'],
    createdAt: new Date('2024-01-05T13:20:00Z'),
    updatedAt: new Date('2024-01-19T10:15:00Z'),
    lastBacktestId: 'backtest-3',
    performance: {
      totalReturn: -2340.75,
      totalReturnPercent: -2.34,
      sharpeRatio: -0.45,
      maxDrawdown: -12500.50,
      maxDrawdownPercent: -12.50,
      winRate: 0.42,
      profitFactor: 0.78,
      totalTrades: 31,
      winningTrades: 13,
      losingTrades: 18,
      avgWin: 1150.25,
      avgLoss: -680.40,
      largestWin: 3200.00,
      largestLoss: -1850.75,
    },
  },
];