const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Portfolio Basics
  name: {
    type: String,
    required: true,
    default: 'Main Portfolio'
  },
  description: String,
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD']
  },
  
  // Portfolio Values
  totalValue: {
    type: Number,
    default: 100000, // Starting value
    min: 0
  },
  cashBalance: {
    type: Number,
    default: 100000,
    min: 0
  },
  investedAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Performance Metrics
  totalReturn: {
    type: Number,
    default: 0
  },
  totalReturnPercent: {
    type: Number,
    default: 0
  },
  dayChange: {
    type: Number,
    default: 0
  },
  dayChangePercent: {
    type: Number,
    default: 0
  },
  
  // Risk Metrics
  maxDrawdown: {
    type: Number,
    default: 0
  },
  volatility: {
    type: Number,
    default: 0
  },
  sharpeRatio: {
    type: Number,
    default: 0
  },
  
  // Portfolio Settings
  isActive: {
    type: Boolean,
    default: true
  },
  isPaperTrading: {
    type: Boolean,
    default: true
  },
  
  // Metadata
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
portfolioSchema.index({ userId: 1, isActive: 1 });
portfolioSchema.index({ userId: 1, createdAt: -1 });

// Virtual for positions count
portfolioSchema.virtual('positionsCount', {
  ref: 'Position',
  localField: '_id',
  foreignField: 'portfolioId',
  count: true
});

// Virtual for active positions count
portfolioSchema.virtual('activePositionsCount', {
  ref: 'Position',
  localField: '_id',
  foreignField: 'portfolioId',
  match: { status: 'open' },
  count: true
});

// Method to calculate portfolio metrics
portfolioSchema.methods.calculateMetrics = async function() {
  const Position = mongoose.model('Position');
  const PortfolioHistory = mongoose.model('PortfolioHistory');
  
  // Get all positions for this portfolio
  const positions = await Position.find({ portfolioId: this._id });
  
  // Calculate total invested amount
  this.investedAmount = positions
    .filter(pos => pos.status === 'open')
    .reduce((sum, pos) => sum + (pos.quantity * pos.averagePrice), 0);
  
  // Get recent portfolio history for performance calculation
  const history = await PortfolioHistory.find({ 
    portfolioId: this._id 
  }).sort({ date: -1 }).limit(30);
  
  if (history.length > 1) {
    const latest = history[0];
    const previous = history[1];
    const monthAgo = history[history.length - 1];
    
    // Calculate day change
    this.dayChange = latest.totalValue - previous.totalValue;
    this.dayChangePercent = (this.dayChange / previous.totalValue) * 100;
    
    // Calculate total return
    this.totalReturn = latest.totalValue - 100000; // Assuming 100k starting value
    this.totalReturnPercent = (this.totalReturn / 100000) * 100;
  }
  
  this.lastUpdated = new Date();
  return this.save();
};

module.exports = mongoose.model('Portfolio', portfolioSchema);