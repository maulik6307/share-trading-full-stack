const mongoose = require('mongoose');
const StrategyTemplate = require('../models/StrategyTemplate');

const strategyTemplates = [
  {
    name: 'Moving Average Crossover',
    description: 'A classic trend-following strategy that generates buy/sell signals when fast MA crosses above/below slow MA',
    category: 'Trend Following',
    tags: ['moving-average', 'crossover', 'trend', 'beginner'],
    defaultParameters: {
      fastPeriod: 10,
      slowPeriod: 20,
      symbol: 'AAPL',
      timeframe: '1h'
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
        description: 'Period for the fast moving average'
      },
      {
        key: 'slowPeriod',
        label: 'Slow MA Period',
        type: 'number',
        defaultValue: 20,
        min: 10,
        max: 200,
        step: 1,
        required: true,
        description: 'Period for the slow moving average'
      },
      {
        key: 'symbol',
        label: 'Trading Symbol',
        type: 'string',
        defaultValue: 'AAPL',
        required: true,
        description: 'Stock symbol to trade'
      },
      {
        key: 'timeframe',
        label: 'Timeframe',
        type: 'select',
        defaultValue: '1h',
        options: [
          { label: '5 minutes', value: '5m' },
          { label: '15 minutes', value: '15m' },
          { label: '1 hour', value: '1h' },
          { label: '4 hours', value: '4h' },
          { label: '1 day', value: '1d' }
        ],
        required: true,
        description: 'Chart timeframe for analysis'
      }
    ],
    code: `
// Moving Average Crossover Strategy
function initialize() {
  // Set up indicators
  this.fastMA = SMA(this.params.fastPeriod);
  this.slowMA = SMA(this.params.slowPeriod);
}

function onTick(data) {
  const fast = this.fastMA.update(data.close);
  const slow = this.slowMA.update(data.close);
  
  // Check for crossover signals
  if (fast > slow && this.fastMA.previous() <= this.slowMA.previous()) {
    // Golden cross - buy signal
    this.buy(data.close, 'Golden Cross');
  } else if (fast < slow && this.fastMA.previous() >= this.slowMA.previous()) {
    // Death cross - sell signal
    this.sell(data.close, 'Death Cross');
  }
}
    `,
    isBuiltIn: true,
    isPublic: true,
    isActive: true,
    usageCount: 245,
    rating: 4.2,
    ratingCount: 58,
    version: '1.0.0',
    documentation: 'This strategy uses two moving averages to identify trend changes. When the fast MA crosses above the slow MA, it generates a buy signal. When it crosses below, it generates a sell signal.',
    examples: [
      {
        name: 'Conservative Setup',
        description: 'Slower signals with less noise',
        parameters: {
          fastPeriod: 20,
          slowPeriod: 50,
          symbol: 'SPY',
          timeframe: '1d'
        }
      },
      {
        name: 'Aggressive Setup',
        description: 'Faster signals for day trading',
        parameters: {
          fastPeriod: 5,
          slowPeriod: 15,
          symbol: 'QQQ',
          timeframe: '15m'
        }
      }
    ]
  },
  {
    name: 'RSI Mean Reversion',
    description: 'Buy oversold conditions and sell overbought conditions using RSI indicator',
    category: 'Mean Reversion',
    tags: ['rsi', 'mean-reversion', 'oscillator', 'intermediate'],
    defaultParameters: {
      rsiPeriod: 14,
      oversoldLevel: 30,
      overboughtLevel: 70,
      symbol: 'TSLA',
      timeframe: '1h'
    },
    parameterSchema: [
      {
        key: 'rsiPeriod',
        label: 'RSI Period',
        type: 'number',
        defaultValue: 14,
        min: 5,
        max: 50,
        step: 1,
        required: true,
        description: 'Period for RSI calculation'
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
        description: 'RSI level considered oversold'
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
        description: 'RSI level considered overbought'
      }
    ],
    code: `
// RSI Mean Reversion Strategy
function initialize() {
  this.rsi = RSI(this.params.rsiPeriod);
  this.position = 0;
}

function onTick(data) {
  const rsiValue = this.rsi.update(data.close);
  
  if (rsiValue < this.params.oversoldLevel && this.position <= 0) {
    // Oversold - buy signal
    this.buy(data.close, 'RSI Oversold');
    this.position = 1;
  } else if (rsiValue > this.params.overboughtLevel && this.position >= 0) {
    // Overbought - sell signal
    this.sell(data.close, 'RSI Overbought');
    this.position = -1;
  }
}
    `,
    isBuiltIn: true,
    isPublic: true,
    isActive: true,
    usageCount: 189,
    rating: 3.8,
    ratingCount: 42,
    version: '1.0.0',
    documentation: 'This strategy identifies overbought and oversold conditions using the RSI indicator. It buys when RSI is below the oversold threshold and sells when above the overbought threshold.'
  },
  {
    name: 'Bollinger Bands Breakout',
    description: 'Trade breakouts from Bollinger Bands with volume confirmation',
    category: 'Breakout',
    tags: ['bollinger-bands', 'breakout', 'volatility', 'advanced'],
    defaultParameters: {
      bbPeriod: 20,
      bbStdDev: 2,
      volumeThreshold: 1.5,
      symbol: 'NVDA',
      timeframe: '4h'
    },
    parameterSchema: [
      {
        key: 'bbPeriod',
        label: 'Bollinger Bands Period',
        type: 'number',
        defaultValue: 20,
        min: 10,
        max: 50,
        step: 1,
        required: true,
        description: 'Period for Bollinger Bands calculation'
      },
      {
        key: 'bbStdDev',
        label: 'Standard Deviations',
        type: 'number',
        defaultValue: 2,
        min: 1,
        max: 3,
        step: 0.1,
        required: true,
        description: 'Number of standard deviations for bands'
      },
      {
        key: 'volumeThreshold',
        label: 'Volume Threshold',
        type: 'number',
        defaultValue: 1.5,
        min: 1,
        max: 3,
        step: 0.1,
        required: true,
        description: 'Volume multiplier for confirmation'
      }
    ],
    code: `
// Bollinger Bands Breakout Strategy
function initialize() {
  this.bb = BollingerBands(this.params.bbPeriod, this.params.bbStdDev);
  this.volumeMA = SMA(20);
}

function onTick(data) {
  const bands = this.bb.update(data.close);
  const avgVolume = this.volumeMA.update(data.volume);
  
  const volumeConfirm = data.volume > (avgVolume * this.params.volumeThreshold);
  
  if (data.close > bands.upper && volumeConfirm) {
    // Upper band breakout with volume
    this.buy(data.close, 'BB Upper Breakout');
  } else if (data.close < bands.lower && volumeConfirm) {
    // Lower band breakdown with volume
    this.sell(data.close, 'BB Lower Breakdown');
  }
}
    `,
    isBuiltIn: true,
    isPublic: true,
    isActive: true,
    usageCount: 156,
    rating: 4.1,
    ratingCount: 34,
    version: '1.0.0',
    documentation: 'This strategy trades breakouts from Bollinger Bands with volume confirmation to filter false signals.'
  },
  {
    name: 'MACD Momentum',
    description: 'Use MACD histogram and signal line crossovers for momentum trading',
    category: 'Momentum',
    tags: ['macd', 'momentum', 'histogram', 'intermediate'],
    defaultParameters: {
      fastEMA: 12,
      slowEMA: 26,
      signalEMA: 9,
      symbol: 'AMZN',
      timeframe: '1h'
    },
    parameterSchema: [
      {
        key: 'fastEMA',
        label: 'Fast EMA Period',
        type: 'number',
        defaultValue: 12,
        min: 5,
        max: 20,
        step: 1,
        required: true,
        description: 'Fast EMA period for MACD'
      },
      {
        key: 'slowEMA',
        label: 'Slow EMA Period',
        type: 'number',
        defaultValue: 26,
        min: 20,
        max: 50,
        step: 1,
        required: true,
        description: 'Slow EMA period for MACD'
      },
      {
        key: 'signalEMA',
        label: 'Signal EMA Period',
        type: 'number',
        defaultValue: 9,
        min: 5,
        max: 15,
        step: 1,
        required: true,
        description: 'Signal line EMA period'
      }
    ],
    code: `
// MACD Momentum Strategy
function initialize() {
  this.macd = MACD(this.params.fastEMA, this.params.slowEMA, this.params.signalEMA);
}

function onTick(data) {
  const macdData = this.macd.update(data.close);
  
  // MACD line crosses above signal line
  if (macdData.macd > macdData.signal && 
      this.macd.previousMACD() <= this.macd.previousSignal()) {
    this.buy(data.close, 'MACD Bullish Crossover');
  }
  
  // MACD line crosses below signal line
  if (macdData.macd < macdData.signal && 
      this.macd.previousMACD() >= this.macd.previousSignal()) {
    this.sell(data.close, 'MACD Bearish Crossover');
  }
}
    `,
    isBuiltIn: true,
    isPublic: true,
    isActive: true,
    usageCount: 203,
    rating: 3.9,
    ratingCount: 47,
    version: '1.0.0',
    documentation: 'This strategy uses MACD crossovers to identify momentum changes and generate trading signals.'
  },
  {
    name: 'Support & Resistance',
    description: 'Identify key support and resistance levels and trade bounces or breakouts',
    category: 'Support/Resistance',
    tags: ['support', 'resistance', 'levels', 'advanced'],
    defaultParameters: {
      lookbackPeriod: 50,
      minTouches: 3,
      breakoutThreshold: 0.5,
      symbol: 'GOOGL',
      timeframe: '1d'
    },
    parameterSchema: [
      {
        key: 'lookbackPeriod',
        label: 'Lookback Period',
        type: 'number',
        defaultValue: 50,
        min: 20,
        max: 200,
        step: 5,
        required: true,
        description: 'Period to look back for S&R levels'
      },
      {
        key: 'minTouches',
        label: 'Minimum Touches',
        type: 'number',
        defaultValue: 3,
        min: 2,
        max: 5,
        step: 1,
        required: true,
        description: 'Minimum touches to confirm level'
      },
      {
        key: 'breakoutThreshold',
        label: 'Breakout Threshold %',
        type: 'number',
        defaultValue: 0.5,
        min: 0.1,
        max: 2.0,
        step: 0.1,
        required: true,
        description: 'Percentage threshold for breakout confirmation'
      }
    ],
    code: `
// Support & Resistance Strategy
function initialize() {
  this.levels = [];
  this.priceHistory = [];
}

function onTick(data) {
  this.priceHistory.push({high: data.high, low: data.low, close: data.close});
  
  if (this.priceHistory.length > this.params.lookbackPeriod) {
    this.priceHistory.shift();
    this.updateLevels();
    this.checkSignals(data);
  }
}

function updateLevels() {
  // Identify pivot highs and lows
  // Group similar levels
  // Count touches for each level
}

function checkSignals(data) {
  for (let level of this.levels) {
    const distance = Math.abs(data.close - level.price) / level.price * 100;
    
    if (distance < this.params.breakoutThreshold) {
      if (level.type === 'resistance' && data.close > level.price) {
        this.buy(data.close, 'Resistance Breakout');
      } else if (level.type === 'support' && data.close < level.price) {
        this.sell(data.close, 'Support Breakdown');
      }
    }
  }
}
    `,
    isBuiltIn: true,
    isPublic: true,
    isActive: true,
    usageCount: 98,
    rating: 4.3,
    ratingCount: 23,
    version: '1.0.0',
    documentation: 'This advanced strategy identifies key support and resistance levels and trades breakouts or bounces from these levels.'
  }
];

const seedStrategyTemplates = async () => {
  try {
    console.log('🌱 Seeding strategy templates...');
    
    // Clear existing templates
    await StrategyTemplate.deleteMany({ isBuiltIn: true });
    
    // Insert new templates
    const insertedTemplates = await StrategyTemplate.insertMany(strategyTemplates);
    
    console.log(`✅ Successfully seeded ${insertedTemplates.length} strategy templates`);
    
    // Log template summary
    const categories = [...new Set(strategyTemplates.map(t => t.category))];
    console.log(`📊 Categories: ${categories.join(', ')}`);
    
    return insertedTemplates;
  } catch (error) {
    console.error('❌ Error seeding strategy templates:', error);
    throw error;
  }
};

// Run seeding if called directly
if (require.main === module) {
  // Load environment variables
  require('dotenv').config();
  
  const connectDB = require('../config/database');
  
  const runSeed = async () => {
    try {
      await connectDB();
      await seedStrategyTemplates();
      process.exit(0);
    } catch (error) {
      console.error('Seeding failed:', error);
      process.exit(1);
    }
  };
  
  runSeed();
}

module.exports = { seedStrategyTemplates, strategyTemplates };