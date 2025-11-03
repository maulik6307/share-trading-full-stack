const mongoose = require('mongoose');
const Strategy = require('../models/Strategy');

const testUserId = new mongoose.Types.ObjectId('507f1f77bcf86cd799439011');

const sampleStrategies = [
  {
    userId: testUserId,
    name: 'Moving Average Crossover',
    description: 'A classic strategy using 50-day and 200-day moving averages',
    type: 'TEMPLATE',
    status: 'ACTIVE',
    parameters: {
      shortPeriod: 50,
      longPeriod: 200,
      symbol: 'SPY'
    },
    code: `
// Moving Average Crossover Strategy
function onTick(data) {
  const shortMA = calculateMA(data.prices, params.shortPeriod);
  const longMA = calculateMA(data.prices, params.longPeriod);
  
  if (shortMA > longMA && !position.isLong) {
    buy(data.symbol, 100);
  } else if (shortMA < longMA && position.isLong) {
    sell(data.symbol, position.quantity);
  }
}
    `,
    tags: ['moving-average', 'trend-following', 'beginner'],
    performance: {
      totalReturn: 15420.50,
      totalReturnPercent: 15.42,
      sharpeRatio: 1.25,
      maxDrawdown: -8500.00,
      maxDrawdownPercent: -8.5,
      winRate: 0.65,
      profitFactor: 1.8,
      totalTrades: 45,
      winningTrades: 29,
      losingTrades: 16,
      avgWin: 850.30,
      avgLoss: -420.15,
      largestWin: 2100.00,
      largestLoss: -950.00
    },
    version: '1.0.0',
    isPublic: false,
    isArchived: false,
    views: 0,
    clones: 0
  },
  {
    userId: testUserId,
    name: 'RSI Mean Reversion',
    description: 'Buy oversold and sell overbought conditions using RSI',
    type: 'CODE',
    status: 'ACTIVE',
    parameters: {
      rsiPeriod: 14,
      oversoldLevel: 30,
      overboughtLevel: 70,
      symbol: 'QQQ'
    },
    code: `
// RSI Mean Reversion Strategy
function onTick(data) {
  const rsi = calculateRSI(data.prices, params.rsiPeriod);
  
  if (rsi < params.oversoldLevel && !position.isLong) {
    buy(data.symbol, 50);
  } else if (rsi > params.overboughtLevel && position.isLong) {
    sell(data.symbol, position.quantity);
  }
}
    `,
    tags: ['rsi', 'mean-reversion', 'oscillator'],
    performance: {
      totalReturn: 8750.25,
      totalReturnPercent: 8.75,
      sharpeRatio: 0.95,
      maxDrawdown: -5200.00,
      maxDrawdownPercent: -5.2,
      winRate: 0.58,
      profitFactor: 1.4,
      totalTrades: 78,
      winningTrades: 45,
      losingTrades: 33,
      avgWin: 420.80,
      avgLoss: -280.50,
      largestWin: 1200.00,
      largestLoss: -650.00
    },
    version: '1.2.0',
    isPublic: false,
    isArchived: false,
    views: 0,
    clones: 0
  },
  {
    userId: testUserId,
    name: 'Bollinger Bands Breakout',
    description: 'Trade breakouts from Bollinger Bands with volume confirmation',
    type: 'VISUAL',
    status: 'DRAFT',
    parameters: {
      period: 20,
      standardDeviations: 2,
      volumeThreshold: 1.5,
      symbol: 'AAPL'
    },
    tags: ['bollinger-bands', 'breakout', 'volume'],
    performance: {
      totalReturn: 12300.75,
      totalReturnPercent: 12.30,
      sharpeRatio: 1.15,
      maxDrawdown: -6800.00,
      maxDrawdownPercent: -6.8,
      winRate: 0.62,
      profitFactor: 1.6,
      totalTrades: 32,
      winningTrades: 20,
      losingTrades: 12,
      avgWin: 980.50,
      avgLoss: -520.25,
      largestWin: 2500.00,
      largestLoss: -1100.00
    },
    version: '1.0.0',
    isPublic: false,
    isArchived: false,
    views: 0,
    clones: 0
  },
  {
    userId: testUserId,
    name: 'MACD Momentum',
    description: 'Momentum strategy using MACD crossovers and divergences',
    type: 'TEMPLATE',
    status: 'ACTIVE',
    parameters: {
      fastPeriod: 12,
      slowPeriod: 26,
      signalPeriod: 9,
      symbol: 'TSLA'
    },
    code: `
// MACD Momentum Strategy
function onTick(data) {
  const macd = calculateMACD(data.prices, params.fastPeriod, params.slowPeriod, params.signalPeriod);
  
  if (macd.line > macd.signal && macd.histogram > 0 && !position.isLong) {
    buy(data.symbol, 25);
  } else if (macd.line < macd.signal && position.isLong) {
    sell(data.symbol, position.quantity);
  }
}
    `,
    tags: ['macd', 'momentum', 'crossover'],
    performance: {
      totalReturn: 18950.40,
      totalReturnPercent: 18.95,
      sharpeRatio: 1.45,
      maxDrawdown: -9200.00,
      maxDrawdownPercent: -9.2,
      winRate: 0.68,
      profitFactor: 2.1,
      totalTrades: 28,
      winningTrades: 19,
      losingTrades: 9,
      avgWin: 1250.80,
      avgLoss: -680.30,
      largestWin: 3200.00,
      largestLoss: -1400.00
    },
    version: '1.1.0',
    isPublic: false,
    isArchived: false,
    views: 0,
    clones: 0
  },
  {
    userId: testUserId,
    name: 'Support & Resistance',
    description: 'Trade bounces off key support and resistance levels',
    type: 'CODE',
    status: 'PAUSED',
    parameters: {
      lookbackPeriod: 50,
      minTouches: 3,
      breakoutThreshold: 0.02,
      symbol: 'MSFT'
    },
    code: `
// Support & Resistance Strategy
function onTick(data) {
  const levels = findSupportResistance(data.prices, params.lookbackPeriod, params.minTouches);
  const currentPrice = data.prices[data.prices.length - 1];
  
  const nearSupport = levels.support.find(level => 
    Math.abs(currentPrice - level) / level < 0.01
  );
  
  if (nearSupport && !position.isLong) {
    buy(data.symbol, 40);
  }
}
    `,
    tags: ['support-resistance', 'price-action', 'levels'],
    performance: {
      totalReturn: 6420.15,
      totalReturnPercent: 6.42,
      sharpeRatio: 0.85,
      maxDrawdown: -4100.00,
      maxDrawdownPercent: -4.1,
      winRate: 0.55,
      profitFactor: 1.3,
      totalTrades: 52,
      winningTrades: 29,
      losingTrades: 23,
      avgWin: 380.90,
      avgLoss: -250.60,
      largestWin: 950.00,
      largestLoss: -580.00
    },
    version: '1.0.0',
    isPublic: false,
    isArchived: false,
    views: 0,
    clones: 0
  },
  {
    userId: testUserId,
    name: 'Grid Trading Bot',
    description: 'Automated grid trading with dynamic grid adjustment',
    type: 'VISUAL',
    status: 'ACTIVE',
    parameters: {
      gridSize: 0.01,
      numberOfGrids: 10,
      baseOrderSize: 100,
      symbol: 'BTC-USD'
    },
    tags: ['grid-trading', 'automated', 'crypto'],
    performance: {
      totalReturn: 22100.80,
      totalReturnPercent: 22.10,
      sharpeRatio: 1.65,
      maxDrawdown: -7500.00,
      maxDrawdownPercent: -7.5,
      winRate: 0.72,
      profitFactor: 2.4,
      totalTrades: 156,
      winningTrades: 112,
      losingTrades: 44,
      avgWin: 285.50,
      avgLoss: -180.25,
      largestWin: 850.00,
      largestLoss: -420.00
    },
    version: '2.0.0',
    isPublic: false,
    isArchived: false,
    views: 0,
    clones: 0
  }
];

async function seedStrategies() {
  try {
    console.log('🌱 Seeding strategies...');
    
    // Clear existing strategies for the test user
    await Strategy.deleteMany({ userId: testUserId });
    console.log('🗑️  Cleared existing test strategies');
    
    // Insert sample strategies
    const strategies = await Strategy.insertMany(sampleStrategies);
    console.log(`✅ Created ${strategies.length} sample strategies`);
    
    // Log strategy names
    strategies.forEach(strategy => {
      console.log(`   - ${strategy.name} (${strategy.type}, ${strategy.status})`);
    });
    
    return strategies;
  } catch (error) {
    console.error('❌ Error seeding strategies:', error);
    throw error;
  }
}

// Export for use in other files
module.exports = { seedStrategies, sampleStrategies };

// Run directly if called from command line
if (require.main === module) {
  const connectDB = async () => {
    try {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sharetrading', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('📊 Connected to MongoDB');
    } catch (error) {
      console.error('❌ Database connection error:', error);
      process.exit(1);
    }
  };

  connectDB()
    .then(() => seedStrategies())
    .then(() => {
      console.log('🎉 Strategy seeding completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}