const mongoose = require('mongoose');

const positionSchema = new mongoose.Schema({
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
  
  // Position Details
  symbol: {
    type: String,
    required: true,
    uppercase: true,
    index: true
  },
  side: {
    type: String,
    enum: ['long', 'short'],
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Price Information
  averagePrice: {
    type: Number,
    required: true,
    min: 0
  },
  currentPrice: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // P&L Information
  unrealizedPnL: {
    type: Number,
    default: 0
  },
  unrealizedPnLPercent: {
    type: Number,
    default: 0
  },
  realizedPnL: {
    type: Number,
    default: 0
  },
  
  // Position Status
  status: {
    type: String,
    enum: ['open', 'closed', 'partial'],
    default: 'open',
    index: true
  },
  
  // Risk Management
  stopLoss: Number,
  takeProfit: Number,
  
  // Metadata
  openedAt: {
    type: Date,
    default: Date.now
  },
  closedAt: Date,
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
positionSchema.index({ userId: 1, status: 1 });
positionSchema.index({ portfolioId: 1, status: 1 });
positionSchema.index({ symbol: 1, status: 1 });
positionSchema.index({ userId: 1, createdAt: -1 });

// Virtual for market value
positionSchema.virtual('marketValue').get(function() {
  return this.quantity * this.currentPrice;
});

// Virtual for cost basis
positionSchema.virtual('costBasis').get(function() {
  return this.quantity * this.averagePrice;
});

// Method to update P&L
positionSchema.methods.updatePnL = function(currentPrice) {
  this.currentPrice = currentPrice;
  
  if (this.side === 'long') {
    this.unrealizedPnL = (currentPrice - this.averagePrice) * this.quantity;
  } else {
    this.unrealizedPnL = (this.averagePrice - currentPrice) * this.quantity;
  }
  
  this.unrealizedPnLPercent = (this.unrealizedPnL / this.costBasis) * 100;
  this.lastUpdated = new Date();
  
  return this.save();
};

module.exports = mongoose.model('Position', positionSchema);