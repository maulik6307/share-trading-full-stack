const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
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
  
  // Alert Details
  type: {
    type: String,
    enum: ['info', 'warning', 'error', 'success'],
    required: true,
    index: true
  },
  category: {
    type: String,
    enum: ['risk', 'performance', 'position', 'strategy', 'system', 'market'],
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  
  // Alert Status
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  isActionable: {
    type: Boolean,
    default: false
  },
  isDismissed: {
    type: Boolean,
    default: false,
    index: true
  },
  
  // Priority
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
    index: true
  },
  
  // Related Data
  symbol: String,
  strategyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Strategy'
  },
  positionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Position'
  },
  
  // Trigger Information
  triggerValue: Number, // The value that triggered the alert
  thresholdValue: Number, // The threshold that was crossed
  
  // Actions
  suggestedActions: [{
    action: String,
    description: String,
    url: String
  }],
  
  // Metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Auto-dismiss
  expiresAt: Date,
  
  // Timestamps
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Indexes for performance
alertSchema.index({ userId: 1, timestamp: -1 });
alertSchema.index({ userId: 1, isRead: 1, isDismissed: 1 });
alertSchema.index({ userId: 1, type: 1, timestamp: -1 });
alertSchema.index({ userId: 1, priority: 1, timestamp: -1 });

// TTL index for auto-expiring alerts
alertSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Static method to get active alerts
alertSchema.statics.getActiveAlerts = async function(userId, limit = 10) {
  return this.find({
    userId,
    isDismissed: false,
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: { $gt: new Date() } }
    ]
  })
  .sort({ priority: -1, timestamp: -1 })
  .limit(limit)
  .populate('portfolioId', 'name')
  .populate('strategyId', 'name')
  .lean();
};

// Static method to create risk alert
alertSchema.statics.createRiskAlert = async function(data) {
  const alert = new this({
    userId: data.userId,
    portfolioId: data.portfolioId,
    type: data.type || 'warning',
    category: 'risk',
    title: data.title,
    message: data.message,
    priority: data.priority || 'high',
    isActionable: true,
    symbol: data.symbol,
    positionId: data.positionId,
    triggerValue: data.triggerValue,
    thresholdValue: data.thresholdValue,
    suggestedActions: data.suggestedActions || [],
    metadata: data.metadata || {}
  });
  
  return alert.save();
};

// Method to mark as read
alertSchema.methods.markAsRead = function() {
  this.isRead = true;
  return this.save();
};

// Method to dismiss
alertSchema.methods.dismiss = function() {
  this.isDismissed = true;
  return this.save();
};

module.exports = mongoose.model('Alert', alertSchema);