const mongoose = require('mongoose');

const equityPointSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  equity: {
    type: Number,
    required: true
  },
  drawdown: {
    type: Number,
    default: 0
  },
  returns: {
    type: Number,
    default: 0
  }
}, { _id: false });

const drawdownPointSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  drawdown: {
    type: Number,
    required: true
  },
  drawdownPercent: {
    type: Number,
    required: true
  },
  isNewHigh: {
    type: Boolean,
    default: false
  }
}, { _id: false });

const monthlyReturnSchema = new mongoose.Schema({
  year: {
    type: Number,
    required: true
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  return: {
    type: Number,
    required: true
  },
  returnPercent: {
    type: Number,
    required: true
  }
}, { _id: false });

const riskMetricsSchema = new mongoose.Schema({
  var95: {
    type: Number,
    default: 0
  },
  var99: {
    type: Number,
    default: 0
  },
  cvar95: {
    type: Number,
    default: 0
  },
  cvar99: {
    type: Number,
    default: 0
  },
  beta: {
    type: Number,
    default: 0
  },
  alpha: {
    type: Number,
    default: 0
  },
  informationRatio: {
    type: Number,
    default: 0
  },
  calmarRatio: {
    type: Number,
    default: 0
  },
  sterlingRatio: {
    type: Number,
    default: 0
  }
}, { _id: false });

const backtestSummarySchema = new mongoose.Schema({
  totalReturn: {
    type: Number,
    default: 0
  },
  totalReturnPercent: {
    type: Number,
    default: 0
  },
  annualizedReturn: {
    type: Number,
    default: 0
  },
  sharpeRatio: {
    type: Number,
    default: 0
  },
  sortinoRatio: {
    type: Number,
    default: 0
  },
  maxDrawdown: {
    type: Number,
    default: 0
  },
  maxDrawdownPercent: {
    type: Number,
    default: 0
  },
  maxDrawdownDuration: {
    type: Number,
    default: 0
  },
  volatility: {
    type: Number,
    default: 0
  },
  winRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 1
  },
  profitFactor: {
    type: Number,
    default: 0
  },
  totalTrades: {
    type: Number,
    default: 0
  },
  winningTrades: {
    type: Number,
    default: 0
  },
  losingTrades: {
    type: Number,
    default: 0
  },
  avgWin: {
    type: Number,
    default: 0
  },
  avgLoss: {
    type: Number,
    default: 0
  },
  largestWin: {
    type: Number,
    default: 0
  },
  largestLoss: {
    type: Number,
    default: 0
  },
  avgTradeDuration: {
    type: Number,
    default: 0
  },
  finalCapital: {
    type: Number,
    default: 0
  },
  totalCommission: {
    type: Number,
    default: 0
  },
  totalSlippage: {
    type: Number,
    default: 0
  }
}, { _id: false });

const backtestResultSchema = new mongoose.Schema({
  summary: backtestSummarySchema,
  equityCurve: [equityPointSchema],
  drawdownCurve: [drawdownPointSchema],
  trades: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trade'
  }],
  monthlyReturns: [monthlyReturnSchema],
  riskMetrics: riskMetricsSchema
}, { _id: false });

const backtestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  strategyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Strategy',
    required: true,
    index: true
  },
  
  // Basic Information
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  
  // Status and Progress
  status: {
    type: String,
    enum: ['PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED'],
    default: 'PENDING',
    index: true
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  
  // Configuration
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  initialCapital: {
    type: Number,
    required: true,
    min: 1000
  },
  commission: {
    type: Number,
    default: 0.1,
    min: 0,
    max: 5
  },
  slippage: {
    type: Number,
    default: 0.05,
    min: 0,
    max: 1
  },
  
  // Execution Information
  startedAt: Date,
  completedAt: Date,
  errorMessage: String,
  
  // Results
  result: backtestResultSchema,
  
  // Metadata
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
  
  // Statistics
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
backtestSchema.index({ userId: 1, status: 1 });
backtestSchema.index({ userId: 1, createdAt: -1 });
backtestSchema.index({ strategyId: 1, createdAt: -1 });
backtestSchema.index({ status: 1, createdAt: -1 });

// Virtual for strategy information
backtestSchema.virtual('strategy', {
  ref: 'Strategy',
  localField: 'strategyId',
  foreignField: '_id',
  justOne: true
});

// Pre-save middleware
backtestSchema.pre('save', function(next) {
  // Validate date range
  if (this.startDate >= this.endDate) {
    next(new Error('End date must be after start date'));
    return;
  }
  
  // Validate that end date is not in the future
  if (this.endDate > new Date()) {
    next(new Error('End date cannot be in the future'));
    return;
  }
  
  next();
});

// Instance methods
backtestSchema.methods.start = function() {
  this.status = 'RUNNING';
  this.startedAt = new Date();
  this.progress = 0;
  return this.save();
};

backtestSchema.methods.complete = function(result) {
  this.status = 'COMPLETED';
  this.completedAt = new Date();
  this.progress = 100;
  this.result = result;
  return this.save();
};

backtestSchema.methods.fail = function(errorMessage) {
  this.status = 'FAILED';
  this.errorMessage = errorMessage;
  this.progress = 0;
  return this.save();
};

backtestSchema.methods.cancel = function() {
  this.status = 'CANCELLED';
  this.progress = 0;
  return this.save();
};

backtestSchema.methods.updateProgress = function(progress) {
  this.progress = Math.min(100, Math.max(0, progress));
  return this.save();
};

// Static methods
backtestSchema.statics.getByUser = function(userId, options = {}) {
  const {
    status,
    strategyId,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    limit = 20,
    offset = 0
  } = options;

  const query = { userId };
  
  if (status && status !== 'all') {
    query.status = status;
  }
  
  if (strategyId) {
    query.strategyId = strategyId;
  }
  
  if (search) {
    query.name = { $regex: search, $options: 'i' };
  }

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  return this.find(query)
    .populate('strategy', 'name type status')
    .sort(sortOptions)
    .limit(limit)
    .skip(offset)
    .lean();
};

backtestSchema.statics.getStatusCounts = function(userId) {
  return this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
    { $group: { 
        _id: null, 
        counts: { $push: { status: '$_id', count: '$count' } },
        total: { $sum: '$count' }
      }
    }
  ]);
};

backtestSchema.statics.getRunningBacktests = function(userId) {
  return this.find({ 
    userId, 
    status: { $in: ['PENDING', 'RUNNING'] } 
  }).populate('strategy', 'name');
};

module.exports = mongoose.model('Backtest', backtestSchema);