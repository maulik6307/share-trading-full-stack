const mongoose = require('mongoose');

const parameterSchemaSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true
    },
    label: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['number', 'string', 'boolean', 'select', 'range'],
        required: true
    },
    defaultValue: mongoose.Schema.Types.Mixed,
    min: Number,
    max: Number,
    step: Number,
    options: [{
        label: String,
        value: mongoose.Schema.Types.Mixed
    }],
    required: {
        type: Boolean,
        default: false
    },
    description: String
}, { _id: false });

const strategyPerformanceSchema = new mongoose.Schema({
    totalReturn: {
        type: Number,
        default: 0
    },
    totalReturnPercent: {
        type: Number,
        default: 0
    },
    sharpeRatio: {
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
    }
}, { _id: false });

const strategySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    // Basic Information
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
    },

    // Strategy Type and Status
    type: {
        type: String,
        enum: ['VISUAL', 'CODE', 'TEMPLATE'],
        required: true
    },
    status: {
        type: String,
        enum: ['DRAFT', 'ACTIVE', 'PAUSED', 'STOPPED'],
        default: 'DRAFT',
        index: true
    },

    // Strategy Configuration
    parameters: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    code: {
        type: String,
        default: ''
    },

    // Template Information
    templateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'StrategyTemplate',
        index: true
    },
    isTemplate: {
        type: Boolean,
        default: false
    },

    // Categorization
    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }],

    // Deployment Information
    deployedAt: Date,
    lastBacktestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Backtest'
    },

    // Performance Metrics
    performance: strategyPerformanceSchema,

    // Version Control
    version: {
        type: String,
        default: '1.0.0'
    },
    parentStrategyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Strategy'
    },

    // Metadata
    isPublic: {
        type: Boolean,
        default: false
    },
    isArchived: {
        type: Boolean,
        default: false,
        index: true
    },

    // Statistics
    views: {
        type: Number,
        default: 0
    },
    clones: {
        type: Number,
        default: 0
    },

    // Timestamps
    lastRunAt: Date,
    lastModifiedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for performance
strategySchema.index({ userId: 1, status: 1 });
strategySchema.index({ userId: 1, createdAt: -1 });
strategySchema.index({ userId: 1, isArchived: 1 });
strategySchema.index({ templateId: 1 });
strategySchema.index({ tags: 1 });
strategySchema.index({ name: 'text', description: 'text', tags: 'text' });

// Virtual for template information
strategySchema.virtual('template', {
    ref: 'StrategyTemplate',
    localField: 'templateId',
    foreignField: '_id',
    justOne: true
});

// Pre-save middleware
strategySchema.pre('save', function (next) {
    this.lastModifiedAt = new Date();
    next();
});

// Instance methods
strategySchema.methods.updatePerformance = function (performanceData) {
    this.performance = { ...this.performance, ...performanceData };
    this.lastModifiedAt = new Date();
    return this.save();
};

strategySchema.methods.deploy = function () {
    this.status = 'ACTIVE';
    this.deployedAt = new Date();
    this.lastModifiedAt = new Date();
    return this.save();
};

strategySchema.methods.pause = function () {
    this.status = 'PAUSED';
    this.lastModifiedAt = new Date();
    return this.save();
};

strategySchema.methods.stop = function () {
    this.status = 'STOPPED';
    this.lastModifiedAt = new Date();
    return this.save();
};

strategySchema.methods.clone = function (newName, userId) {
    const clonedStrategy = new this.constructor({
        ...this.toObject(),
        _id: undefined,
        name: newName || `${this.name} (Copy)`,
        userId: userId || this.userId,
        status: 'DRAFT',
        deployedAt: undefined,
        performance: undefined,
        lastBacktestId: undefined,
        parentStrategyId: this._id,
        views: 0,
        clones: 0,
        createdAt: undefined,
        updatedAt: undefined
    });

    // Increment clone count on original
    this.clones += 1;
    this.save();

    return clonedStrategy.save();
};

// Static methods
strategySchema.statics.getByUser = function (userId, options = {}) {
    const {
        status,
        search,
        tags,
        sortBy = 'updatedAt',
        sortOrder = 'desc',
        limit = 20,
        offset = 0,
        includeArchived = false
    } = options;

    // Convert userId to ObjectId if it's a string
    const userObjectId = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;
    const query = { userId: userObjectId };

    if (!includeArchived) {
        query.isArchived = false;
    }

    if (status && status !== 'all') {
        query.status = status;
    }

    if (search) {
        query.$text = { $search: search };
    }

    if (tags && tags.length > 0) {
        query.tags = { $in: tags };
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    return this.find(query)
        .populate('template', 'name category')
        .sort(sortOptions)
        .limit(limit)
        .skip(offset)
        .lean();
};

strategySchema.statics.getStatusCounts = function (userId) {
    return this.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId), isArchived: false } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
        {
            $group: {
                _id: null,
                counts: { $push: { status: '$_id', count: '$count' } },
                total: { $sum: '$count' }
            }
        }
    ]);
};

module.exports = mongoose.model('Strategy', strategySchema);