const mongoose = require('mongoose');

const marketDataSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true,
    uppercase: true,
    index: true
  },
  
  // Price Information
  price: {
    type: Number,
    required: true,
    min: 0
  },
  open: {
    type: Number,
    required: true,
    min: 0
  },
  high: {
    type: Number,
    required: true,
    min: 0
  },
  low: {
    type: Number,
    required: true,
    min: 0
  },
  previousClose: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Change Information
  change: {
    type: Number,
    default: 0
  },
  changePercent: {
    type: Number,
    default: 0
  },
  
  // Volume Information
  volume: {
    type: Number,
    default: 0,
    min: 0
  },
  avgVolume: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Bid/Ask Information
  bid: {
    type: Number,
    min: 0
  },
  ask: {
    type: Number,
    min: 0
  },
  bidSize: {
    type: Number,
    min: 0
  },
  askSize: {
    type: Number,
    min: 0
  },
  
  // Market Status
  isMarketOpen: {
    type: Boolean,
    default: true
  },
  lastTradeTime: {
    type: Date,
    default: Date.now
  },
  
  // Additional Metrics
  marketCap: Number,
  pe: Number,
  eps: Number,
  dividend: Number,
  dividendYield: Number,
  
  // Volatility
  volatility: {
    type: Number,
    min: 0
  },
  
  // 52 Week Range
  week52High: Number,
  week52Low: Number,
  
  // Timestamp
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
marketDataSchema.index({ symbol: 1, timestamp: -1 });
marketDataSchema.index({ timestamp: -1 });

// Virtual for spread
marketDataSchema.virtual('spread').get(function() {
  if (this.ask && this.bid) {
    return this.ask - this.bid;
  }
  return 0;
});

// Virtual for spread percentage
marketDataSchema.virtual('spreadPercent').get(function() {
  if (this.ask && this.bid && this.price) {
    return ((this.ask - this.bid) / this.price) * 100;
  }
  return 0;
});

// Pre-save middleware to calculate derived fields
marketDataSchema.pre('save', function(next) {
  // Calculate change and change percent
  if (this.price && this.previousClose) {
    this.change = this.price - this.previousClose;
    this.changePercent = (this.change / this.previousClose) * 100;
  }
  
  // Update timestamp
  this.timestamp = new Date();
  
  next();
});

// Static method to get latest market data for symbols
marketDataSchema.statics.getLatestData = function(symbols) {
  if (!Array.isArray(symbols)) {
    symbols = [symbols];
  }
  
  return this.aggregate([
    {
      $match: {
        symbol: { $in: symbols.map(s => s.toUpperCase()) }
      }
    },
    {
      $sort: { symbol: 1, timestamp: -1 }
    },
    {
      $group: {
        _id: '$symbol',
        latestData: { $first: '$$ROOT' }
      }
    },
    {
      $replaceRoot: { newRoot: '$latestData' }
    }
  ]);
};

// Static method to get historical data
marketDataSchema.statics.getHistoricalData = function(symbol, startDate, endDate, interval = '1d') {
  const query = {
    symbol: symbol.toUpperCase(),
    timestamp: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  };
  
  // For intraday intervals, we might need to aggregate data
  if (interval === '1d') {
    return this.find(query).sort({ timestamp: 1 });
  }
  
  // For other intervals, implement aggregation logic
  return this.find(query).sort({ timestamp: 1 });
};

// Static method to update market data
marketDataSchema.statics.updateMarketData = function(symbol, data) {
  return this.findOneAndUpdate(
    { symbol: symbol.toUpperCase() },
    {
      ...data,
      symbol: symbol.toUpperCase(),
      timestamp: new Date()
    },
    {
      upsert: true,
      new: true,
      runValidators: true
    }
  );
};

// Method to simulate price movement (for paper trading)
marketDataSchema.methods.simulatePriceMovement = function() {
  const volatility = this.volatility || 0.02; // 2% default volatility
  const randomChange = (Math.random() - 0.5) * 2 * volatility;
  
  const newPrice = this.price * (1 + randomChange);
  
  // Ensure price doesn't go below 0
  this.price = Math.max(newPrice, 0.01);
  
  // Update high/low
  this.high = Math.max(this.high, this.price);
  this.low = Math.min(this.low, this.price);
  
  // Calculate change
  this.change = this.price - this.previousClose;
  this.changePercent = (this.change / this.previousClose) * 100;
  
  // Update bid/ask with spread
  const spread = this.price * 0.001; // 0.1% spread
  this.bid = this.price - spread / 2;
  this.ask = this.price + spread / 2;
  
  this.timestamp = new Date();
  this.lastTradeTime = new Date();
  
  return this.save();
};

module.exports = mongoose.model('MarketData', marketDataSchema);