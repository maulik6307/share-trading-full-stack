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

const strategyTemplateSchema = new mongoose.Schema({
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
  
  // Categorization
  category: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  
  // Template Configuration
  defaultParameters: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  parameterSchema: [parameterSchemaSchema],
  
  // Code Template
  code: {
    type: String,
    default: ''
  },
  
  // Template Metadata
  isBuiltIn: {
    type: Boolean,
    default: false
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Creator Information
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Usage Statistics
  usageCount: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  ratingCount: {
    type: Number,
    default: 0
  },
  
  // Version Information
  version: {
    type: String,
    default: '1.0.0'
  },
  
  // Documentation
  documentation: {
    type: String,
    default: ''
  },
  examples: [{
    name: String,
    description: String,
    parameters: mongoose.Schema.Types.Mixed
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
strategyTemplateSchema.index({ category: 1, isActive: 1 });
strategyTemplateSchema.index({ isBuiltIn: 1, isActive: 1 });
strategyTemplateSchema.index({ isPublic: 1, isActive: 1 });
strategyTemplateSchema.index({ name: 'text', description: 'text', category: 'text' });
strategyTemplateSchema.index({ usageCount: -1 });
strategyTemplateSchema.index({ rating: -1 });

// Virtual for average rating
strategyTemplateSchema.virtual('averageRating').get(function() {
  return this.ratingCount > 0 ? this.rating / this.ratingCount : 0;
});

// Instance methods
strategyTemplateSchema.methods.incrementUsage = function() {
  this.usageCount += 1;
  return this.save();
};

strategyTemplateSchema.methods.addRating = function(rating) {
  this.rating = ((this.rating * this.ratingCount) + rating) / (this.ratingCount + 1);
  this.ratingCount += 1;
  return this.save();
};

// Static methods
strategyTemplateSchema.statics.getPublicTemplates = function(options = {}) {
  const {
    category,
    search,
    sortBy = 'usageCount',
    sortOrder = 'desc',
    limit = 20,
    offset = 0
  } = options;

  const query = { isActive: true, isPublic: true };
  
  if (category && category !== 'all') {
    query.category = category;
  }
  
  if (search) {
    query.$text = { $search: search };
  }

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  return this.find(query)
    .populate('createdBy', 'name username')
    .sort(sortOptions)
    .limit(limit)
    .skip(offset)
    .lean();
};

strategyTemplateSchema.statics.getCategories = function() {
  return this.distinct('category', { isActive: true, isPublic: true });
};

strategyTemplateSchema.statics.getPopular = function(limit = 10) {
  return this.find({ isActive: true, isPublic: true })
    .sort({ usageCount: -1, rating: -1 })
    .limit(limit)
    .populate('createdBy', 'name username')
    .lean();
};

module.exports = mongoose.model('StrategyTemplate', strategyTemplateSchema);