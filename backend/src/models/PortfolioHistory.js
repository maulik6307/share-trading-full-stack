const mongoose = require('mongoose');

const portfolioHistorySchema = new mongoose.Schema({
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
  
  // Date (for daily snapshots)
  date: {
    type: Date,
    required: true,
    index: true
  },
  
  // Portfolio Values
  totalValue: {
    type: Number,
    required: true,
    min: 0
  },
  cashBalance: {
    type: Number,
    required: true,
    min: 0
  },
  investedAmount: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Performance Metrics
  dayChange: {
    type: Number,
    default: 0
  },
  dayChangePercent: {
    type: Number,
    default: 0
  },
  totalReturn: {
    type: Number,
    default: 0
  },
  totalReturnPercent: {
    type: Number,
    default: 0
  },
  
  // Benchmark Comparison
  benchmarkValue: {
    type: Number,
    default: 0
  },
  benchmarkReturn: {
    type: Number,
    default: 0
  },
  
  // Position Counts
  totalPositions: {
    type: Number,
    default: 0
  },
  profitablePositions: {
    type: Number,
    default: 0
  },
  
  // Metadata
  snapshotType: {
    type: String,
    enum: ['daily', 'hourly', 'manual'],
    default: 'daily'
  }
}, {
  timestamps: true
});

// Compound indexes for performance
portfolioHistorySchema.index({ userId: 1, date: -1 });
portfolioHistorySchema.index({ portfolioId: 1, date: -1 });
portfolioHistorySchema.index({ userId: 1, portfolioId: 1, date: -1 });

// Static method to get performance data
portfolioHistorySchema.statics.getPerformanceData = async function(userId, portfolioId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.find({
    userId,
    portfolioId,
    date: { $gte: startDate },
    snapshotType: 'daily'
  }).sort({ date: 1 }).select('date totalValue benchmarkValue');
};

module.exports = mongoose.model('PortfolioHistory', portfolioHistorySchema);