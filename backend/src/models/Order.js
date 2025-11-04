const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
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
  strategyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Strategy',
    index: true
  },
  
  // Order Details
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
  type: {
    type: String,
    enum: ['MARKET', 'LIMIT', 'STOP', 'STOP_LIMIT'],
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    min: 0
  },
  stopPrice: {
    type: Number,
    min: 0
  },
  
  // Order Status
  status: {
    type: String,
    enum: ['PENDING', 'FILLED', 'PARTIALLY_FILLED', 'CANCELLED', 'REJECTED'],
    default: 'PENDING',
    index: true
  },
  filledQuantity: {
    type: Number,
    default: 0,
    min: 0
  },
  remainingQuantity: {
    type: Number,
    required: true,
    min: 0
  },
  avgFillPrice: {
    type: Number,
    min: 0
  },
  commission: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Order Lifecycle
  rejectionReason: String,
  filledAt: Date,
  cancelledAt: Date,
  
  // Metadata
  tags: [String],
  notes: String,
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
orderSchema.index({ userId: 1, status: 1 });
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ portfolioId: 1, status: 1 });
orderSchema.index({ symbol: 1, status: 1 });
orderSchema.index({ strategyId: 1, status: 1 });

// Virtual for order value
orderSchema.virtual('orderValue').get(function() {
  const price = this.avgFillPrice || this.price || 0;
  return this.filledQuantity * price;
});

// Virtual for remaining value
orderSchema.virtual('remainingValue').get(function() {
  const price = this.price || 0;
  return this.remainingQuantity * price;
});

// Pre-save middleware to update timestamps and calculate remaining quantity
orderSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Calculate remaining quantity
  if (this.isModified('filledQuantity')) {
    this.remainingQuantity = this.quantity - this.filledQuantity;
  }
  
  // Set filled timestamp when order is filled
  if (this.status === 'FILLED' && !this.filledAt) {
    this.filledAt = new Date();
  }
  
  // Set cancelled timestamp when order is cancelled
  if (this.status === 'CANCELLED' && !this.cancelledAt) {
    this.cancelledAt = new Date();
  }
  
  next();
});

// Method to validate order before placement
orderSchema.methods.validateOrder = function() {
  const errors = [];
  
  // Check quantity
  if (this.quantity <= 0) {
    errors.push('Quantity must be greater than 0');
  }
  
  // Check price for limit orders
  if ((this.type === 'LIMIT' || this.type === 'STOP_LIMIT') && (!this.price || this.price <= 0)) {
    errors.push('Price is required for limit orders and must be greater than 0');
  }
  
  // Check stop price for stop orders
  if ((this.type === 'STOP' || this.type === 'STOP_LIMIT') && (!this.stopPrice || this.stopPrice <= 0)) {
    errors.push('Stop price is required for stop orders and must be greater than 0');
  }
  
  // Check stop limit order logic
  if (this.type === 'STOP_LIMIT') {
    if (this.side === 'BUY' && this.stopPrice > this.price) {
      errors.push('For buy stop-limit orders, stop price should be less than limit price');
    }
    if (this.side === 'SELL' && this.stopPrice < this.price) {
      errors.push('For sell stop-limit orders, stop price should be greater than limit price');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Method to fill order (partial or complete)
orderSchema.methods.fillOrder = function(fillQuantity, fillPrice) {
  if (fillQuantity <= 0 || fillQuantity > this.remainingQuantity) {
    throw new Error('Invalid fill quantity');
  }
  
  // Update filled quantity
  this.filledQuantity += fillQuantity;
  this.remainingQuantity = this.quantity - this.filledQuantity;
  
  // Calculate average fill price
  if (this.avgFillPrice) {
    const totalFillValue = (this.filledQuantity - fillQuantity) * this.avgFillPrice + fillQuantity * fillPrice;
    this.avgFillPrice = totalFillValue / this.filledQuantity;
  } else {
    this.avgFillPrice = fillPrice;
  }
  
  // Update commission (0.01% of fill value)
  this.commission += fillQuantity * fillPrice * 0.0001;
  
  // Update status
  if (this.remainingQuantity === 0) {
    this.status = 'FILLED';
    this.filledAt = new Date();
  } else {
    this.status = 'PARTIALLY_FILLED';
  }
  
  this.updatedAt = new Date();
  return this.save();
};

// Method to cancel order
orderSchema.methods.cancelOrder = function() {
  if (this.status !== 'PENDING' && this.status !== 'PARTIALLY_FILLED') {
    throw new Error('Cannot cancel order with status: ' + this.status);
  }
  
  this.status = 'CANCELLED';
  this.cancelledAt = new Date();
  this.updatedAt = new Date();
  
  return this.save();
};

// Static method to get active orders
orderSchema.statics.getActiveOrders = function(userId, portfolioId) {
  return this.find({
    userId,
    portfolioId,
    status: { $in: ['PENDING', 'PARTIALLY_FILLED'] }
  }).sort({ createdAt: -1 });
};

// Static method to get order history
orderSchema.statics.getOrderHistory = function(userId, portfolioId, options = {}) {
  const { page = 1, limit = 50, status, symbol, startDate, endDate } = options;
  
  const query = { userId, portfolioId };
  
  if (status) query.status = status;
  if (symbol) query.symbol = symbol;
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);
};

module.exports = mongoose.model('Order', orderSchema);