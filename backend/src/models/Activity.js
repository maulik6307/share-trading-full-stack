const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  portfolioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Portfolio',
    index: true
  },
  
  // Activity Details
  type: {
    type: String,
    enum: ['trade', 'strategy', 'alert', 'system', 'deposit', 'withdrawal'],
    required: true,
    index: true
  },
  action: {
    type: String,
    required: true // e.g., 'buy', 'sell', 'deploy', 'pause', 'alert_triggered'
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  
  // Status
  status: {
    type: String,
    enum: ['success', 'warning', 'error', 'info', 'pending'],
    default: 'info',
    index: true
  },
  
  // Related Data
  symbol: String, // For trade activities
  strategyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Strategy'
  },
  positionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Position'
  },
  
  // Financial Data
  amount: Number, // Monetary amount involved
  quantity: Number, // Shares/units
  price: Number, // Price per unit
  
  // Metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Timestamps
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for performance
activitySchema.index({ userId: 1, timestamp: -1 });
activitySchema.index({ userId: 1, type: 1, timestamp: -1 });
activitySchema.index({ portfolioId: 1, timestamp: -1 });

// Static method to get recent activities
activitySchema.statics.getRecentActivities = async function(userId, limit = 10) {
  return this.find({ userId })
    .sort({ timestamp: -1 })
    .limit(limit)
    .populate('portfolioId', 'name')
    .populate('strategyId', 'name')
    .lean();
};

// Static method to create trade activity
activitySchema.statics.createTradeActivity = async function(data) {
  const activity = new this({
    userId: data.userId,
    portfolioId: data.portfolioId,
    type: 'trade',
    action: data.action, // 'buy', 'sell', 'close'
    title: data.title,
    description: data.description,
    status: data.status || 'success',
    symbol: data.symbol,
    positionId: data.positionId,
    amount: data.amount,
    quantity: data.quantity,
    price: data.price,
    metadata: data.metadata || {}
  });
  
  return activity.save();
};

module.exports = mongoose.model('Activity', activitySchema);