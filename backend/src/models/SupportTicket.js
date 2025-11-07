const mongoose = require('mongoose');

const supportTicketSchema = new mongoose.Schema({
  // Ticket Information
  ticketId: {
    type: String,
    unique: true,
    required: true
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
    maxlength: [200, 'Subject cannot be more than 200 characters']
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxlength: [5000, 'Message cannot be more than 5000 characters']
  },
  
  // Classification
  category: {
    type: String,
    required: true,
    enum: ['general', 'technical', 'billing', 'bug', 'feature'],
    default: 'general'
  },
  priority: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'resolved', 'closed'],
    default: 'open'
  },

  // User Information
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    required: true
  },

  // Assignment
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedAt: Date,

  // Responses/Updates
  responses: [{
    message: {
      type: String,
      required: true,
      maxlength: [5000, 'Response cannot be more than 5000 characters']
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    authorType: {
      type: String,
      enum: ['user', 'support', 'admin'],
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    attachments: [{
      filename: String,
      url: String,
      size: Number
    }]
  }],

  // Metadata
  tags: [String],
  resolution: {
    type: String,
    maxlength: [1000, 'Resolution cannot be more than 1000 characters']
  },
  resolvedAt: Date,
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Tracking
  firstResponseAt: Date,
  lastResponseAt: Date,
  responseTime: Number, // in minutes
  resolutionTime: Number, // in minutes
  
  // Customer Satisfaction
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  feedback: {
    type: String,
    maxlength: [1000, 'Feedback cannot be more than 1000 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
supportTicketSchema.index({ ticketId: 1 });
supportTicketSchema.index({ userId: 1 });
supportTicketSchema.index({ status: 1 });
supportTicketSchema.index({ priority: 1 });
supportTicketSchema.index({ category: 1 });
supportTicketSchema.index({ createdAt: -1 });

// Virtual for response count
supportTicketSchema.virtual('responseCount').get(function() {
  return this.responses ? this.responses.length : 0;
});

// Virtual for is overdue (based on priority)
supportTicketSchema.virtual('isOverdue').get(function() {
  if (this.status === 'resolved' || this.status === 'closed') {
    return false;
  }
  
  const now = new Date();
  const created = this.createdAt;
  const hoursSinceCreated = (now - created) / (1000 * 60 * 60);
  
  // SLA times based on priority
  const slaHours = {
    urgent: 2,
    high: 4,
    medium: 24,
    low: 48
  };
  
  return hoursSinceCreated > (slaHours[this.priority] || 24);
});

// Pre-save middleware to generate ticket ID
supportTicketSchema.pre('save', async function(next) {
  if (this.isNew && !this.ticketId) {
    // Generate unique ticket ID
    const count = await this.constructor.countDocuments();
    this.ticketId = `TKT-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Pre-save middleware to update response times
supportTicketSchema.pre('save', function(next) {
  if (this.isModified('responses') && this.responses.length > 0) {
    const lastResponse = this.responses[this.responses.length - 1];
    this.lastResponseAt = lastResponse.timestamp;
    
    if (!this.firstResponseAt) {
      this.firstResponseAt = lastResponse.timestamp;
      this.responseTime = Math.round((this.firstResponseAt - this.createdAt) / (1000 * 60));
    }
  }
  
  if (this.isModified('status') && (this.status === 'resolved' || this.status === 'closed')) {
    if (!this.resolvedAt) {
      this.resolvedAt = new Date();
      this.resolutionTime = Math.round((this.resolvedAt - this.createdAt) / (1000 * 60));
    }
  }
  
  next();
});

// Static method to get user tickets
supportTicketSchema.statics.getUserTickets = function(userId, options = {}) {
  const { status, category, limit = 20, skip = 0 } = options;
  
  const query = { userId };
  if (status) query.status = status;
  if (category) query.category = category;
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .populate('responses.author', 'name email role');
};

// Static method to get ticket statistics
supportTicketSchema.statics.getTicketStats = function(userId) {
  return this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
};

module.exports = mongoose.model('SupportTicket', supportTicketSchema);