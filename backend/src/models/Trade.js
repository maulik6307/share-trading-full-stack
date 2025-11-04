const mongoose = require('mongoose');

const tradeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  portfolioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Portfolio',
    required: true,
    index: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    index: true
  },
  strategyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Strategy',
    index: true
  },
  
  // Trade Details
  symbol: {
    type: String,
    required: true,
    uppercase: true,
    index: true
  },
  side: {
    type: String,
    enum: ['BUY', 'SELL'],
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  commission: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // P&L Information
  pnl: {
    type: Number,
    default: 0
  },
  pnlPercent: {
    type: Number,
    default: 0
  },
  
  // Execution Details
  executedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  // Metadata
  tags: [String],
  notes: String,
  
  // Market Data at Execution
  marketData: {
    bid: Number,
    ask: Number,
    volume: Number,
    volatility: Number
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
tradeSchema.index({ userId: 1, executedAt: -1 });
tradeSchema.index({ portfolioId: 1, executedAt: -1 });
tradeSchema.index({ orderId: 1 });
tradeSchema.index({ symbol: 1, executedAt: -1 });
tradeSchema.index({ strategyId: 1, executedAt: -1 });

// Virtual for trade value
tradeSchema.virtual('tradeValue').get(function() {
  return this.quantity * this.price;
});

// Virtual for net value (including commission)
tradeSchema.virtual('netValue').get(function() {
  const tradeValue = this.quantity * this.price;
  return this.side === 'BUY' ? tradeValue + this.commission : tradeValue - this.commission;
});

// Pre-save middleware to calculate commission
tradeSchema.pre('save', function(next) {
  if (this.isNew && this.commission === 0) {
    // Calculate commission as 0.01% of trade value
    this.commission = this.quantity * this.price * 0.0001;
  }
  next();
});

// Static method to get trades for a position
tradeSchema.statics.getTradesForPosition = function(userId, portfolioId, symbol) {
  return this.find({
    userId,
    portfolioId,
    symbol
  }).sort({ executedAt: 1 });
};

// Static method to get trades for an order
tradeSchema.statics.getTradesForOrder = function(orderId) {
  return this.find({ orderId }).sort({ executedAt: 1 });
};

// Static method to get trade history
tradeSchema.statics.getTradeHistory = function(userId, portfolioId, options = {}) {
  const { page = 1, limit = 50, symbol, startDate, endDate, strategyId } = options;
  
  const query = { userId, portfolioId };
  
  if (symbol) query.symbol = symbol;
  if (strategyId) query.strategyId = strategyId;
  if (startDate || endDate) {
    query.executedAt = {};
    if (startDate) query.executedAt.$gte = new Date(startDate);
    if (endDate) query.executedAt.$lte = new Date(endDate);
  }
  
  return this.find(query)
    .sort({ executedAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .populate('orderId', 'type status')
    .populate('strategyId', 'name');
};

// Static method to calculate P&L for trades
tradeSchema.statics.calculatePnL = function(trades) {
  let totalPnL = 0;
  let totalCommission = 0;
  let position = 0;
  let avgPrice = 0;
  
  trades.forEach(trade => {
    totalCommission += trade.commission;
    
    if (trade.side === 'BUY') {
      if (position >= 0) {
        // Adding to long position or opening long
        avgPrice = position === 0 ? trade.price : 
          ((position * avgPrice) + (trade.quantity * trade.price)) / (position + trade.quantity);
        position += trade.quantity;
      } else {
        // Covering short position
        const coverQuantity = Math.min(trade.quantity, Math.abs(position));
        const pnl = coverQuantity * (avgPrice - trade.price);
        totalPnL += pnl;
        
        position += trade.quantity;
        if (position > 0) {
          avgPrice = trade.price;
        }
      }
    } else {
      // SELL
      if (position <= 0) {
        // Adding to short position or opening short
        avgPrice = position === 0 ? trade.price : 
          ((Math.abs(position) * avgPrice) + (trade.quantity * trade.price)) / (Math.abs(position) + trade.quantity);
        position -= trade.quantity;
      } else {
        // Selling long position
        const sellQuantity = Math.min(trade.quantity, position);
        const pnl = sellQuantity * (trade.price - avgPrice);
        totalPnL += pnl;
        
        position -= trade.quantity;
        if (position < 0) {
          avgPrice = trade.price;
        }
      }
    }
  });
  
  return {
    totalPnL: totalPnL - totalCommission,
    totalCommission,
    currentPosition: position,
    avgPrice: position !== 0 ? avgPrice : 0
  };
};

module.exports = mongoose.model('Trade', tradeSchema);