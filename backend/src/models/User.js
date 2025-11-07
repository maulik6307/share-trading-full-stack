const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [20, 'Username cannot be more than 20 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  phone: {
    type: String,
    trim: true,
    match: [/^\+?[\d\s-()]+$/, 'Please provide a valid phone number']
  },
  country: {
    type: String,
    trim: true,
    maxlength: [50, 'Country cannot be more than 50 characters']
  },

  // Profile Information
  avatar: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot be more than 500 characters']
  },
  timezone: {
    type: String,
    default: 'UTC'
  },
  language: {
    type: String,
    default: 'en',
    enum: ['en', 'es', 'fr', 'de', 'zh', 'ja']
  },

  // Account Status
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    enum: ['user', 'premium', 'admin'],
    default: 'user'
  },

  // Trading Preferences
  tradingPreferences: {
    defaultCurrency: {
      type: String,
      default: 'USD',
      enum: ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD']
    },
    riskTolerance: {
      type: String,
      enum: ['conservative', 'moderate', 'aggressive'],
      default: 'moderate'
    },
    tradingExperience: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'beginner'
    },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      trading: { type: Boolean, default: true },
      marketing: { type: Boolean, default: false }
    }
  },

  // User Preferences
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light'
    },
    dateFormat: {
      type: String,
      default: 'DD/MM/YYYY',
      enum: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD', 'DD-MM-YYYY']
    }
  },

  // Security
  twoFactorAuth: {
    enabled: { type: Boolean, default: false },
    method: {
      type: String,
      enum: ['app', 'sms', 'email'],
      default: 'app'
    },
    secret: { type: String, select: false },
    backupCodes: [{ type: String, select: false }]
  },
  
  // Security Settings
  securitySettings: {
    loginAlerts: {
      enabled: { type: Boolean, default: true },
      newDevice: { type: Boolean, default: true },
      newLocation: { type: Boolean, default: true },
      failedAttempts: { type: Boolean, default: true }
    },
    sessionManagement: {
      autoLogout: { type: Boolean, default: true },
      timeoutMinutes: { type: Number, default: 30 },
      maxSessions: { type: Number, default: 3 }
    },
    privacy: {
      profileVisibility: {
        type: String,
        enum: ['public', 'private'],
        default: 'private'
      },
      activityTracking: { type: Boolean, default: false },
      dataSharing: { type: Boolean, default: false },
      marketingConsent: { type: Boolean, default: false }
    }
  },

  // Notification Preferences
  notificationPreferences: {
    email: {
      enabled: { type: Boolean, default: true },
      trading: { type: Boolean, default: true },
      system: { type: Boolean, default: true },
      marketing: { type: Boolean, default: false },
      security: { type: Boolean, default: true }
    },
    push: {
      enabled: { type: Boolean, default: true },
      trading: { type: Boolean, default: true },
      system: { type: Boolean, default: true },
      alerts: { type: Boolean, default: true },
      news: { type: Boolean, default: false }
    },
    sms: {
      enabled: { type: Boolean, default: false },
      security: { type: Boolean, default: true },
      critical: { type: Boolean, default: true }
    },
    inApp: {
      enabled: { type: Boolean, default: true },
      sound: { type: Boolean, default: true },
      desktop: { type: Boolean, default: true },
      trading: { type: Boolean, default: true },
      system: { type: Boolean, default: true }
    },
    trading: {
      orderFills: { type: Boolean, default: true },
      positionUpdates: { type: Boolean, default: true },
      riskAlerts: { type: Boolean, default: true },
      priceAlerts: { type: Boolean, default: true },
      strategyUpdates: { type: Boolean, default: true },
      backtestComplete: { type: Boolean, default: true }
    },
    frequency: {
      immediate: { type: Boolean, default: true },
      digest: { type: Boolean, default: false },
      digestTime: { type: String, default: '09:00' },
      quietHours: {
        enabled: { type: Boolean, default: false },
        start: { type: String, default: '22:00' },
        end: { type: String, default: '08:00' }
      }
    }
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  emailVerificationToken: String,
  emailVerificationExpires: Date,

  // Tracking
  lastLogin: Date,
  lastActivity: Date,
  loginHistory: [{
    ip: String,
    userAgent: String,
    timestamp: { type: Date, default: Date.now },
    location: String
  }],

  // Subscription & Billing
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'basic', 'premium', 'enterprise'],
      default: 'free'
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'cancelled', 'expired', 'trial'],
      default: 'trial'
    },
    startDate: Date,
    endDate: Date,
    autoRenew: { type: Boolean, default: true }
  },

  // Billing Information
  billingInfo: {
    paymentMethod: {
      type: {
        type: String,
        enum: ['card', 'bank']
      },
      last4: String,
      brand: String,
      expiryMonth: Number,
      expiryYear: Number
    },
    history: [{
      id: String,
      date: { type: Date, default: Date.now },
      amount: Number,
      status: {
        type: String,
        enum: ['paid', 'pending', 'failed'],
        default: 'pending'
      },
      description: String,
      invoiceUrl: String
    }],
    usage: {
      backtests: {
        used: { type: Number, default: 0 },
        limit: { type: Number, default: 5 }
      },
      strategies: {
        used: { type: Number, default: 0 },
        limit: { type: Number, default: 3 }
      },
      paperTrades: {
        used: { type: Number, default: 0 },
        limit: { type: Number, default: 1 }
      },
      dataFeeds: {
        used: { type: Number, default: 0 },
        limit: { type: Number, default: 1 }
      }
    }
  },

  // API Access
  apiKeys: [{
    name: String,
    key: String,
    permissions: [String],
    lastUsed: Date,
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ 'subscription.plan': 1 });
userSchema.index({ isActive: 1, isVerified: 1 });

// Virtual for account lock status
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    // Validate password exists and is a string
    if (!this.password || typeof this.password !== 'string') {
      return next(new Error('Password must be a valid string'));
    }

    // Hash password with cost of 12
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const salt = await bcrypt.genSalt(saltRounds);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    console.error('Password hashing error:', error);
    next(error);
  }
});

// Pre-save middleware to update lastActivity
userSchema.pre('save', function(next) {
  if (this.isNew || this.isModified()) {
    this.lastActivity = new Date();
  }
  next();
});

// Instance method to check password
userSchema.methods.matchPassword = async function(enteredPassword) {
  try {
    if (!enteredPassword || typeof enteredPassword !== 'string') {
      console.error('Invalid entered password:', enteredPassword);
      return false;
    }
    
    if (!this.password || typeof this.password !== 'string') {
      console.error('Invalid stored password for user:', this.email);
      return false;
    }
    
    return await bcrypt.compare(enteredPassword, this.password);
  } catch (error) {
    console.error('Password comparison error:', error);
    return false;
  }
};

// Instance method to generate JWT token
userSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { 
      id: this._id,
      username: this.username,
      email: this.email,
      role: this.role
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// Instance method to generate refresh token
userSchema.methods.getRefreshToken = function() {
  return jwt.sign(
    { id: this._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE }
  );
};

// Instance method to handle failed login attempts
userSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 failed attempts for 2 hours
  if ((this.loginAttempts || 0) + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }
  
  return this.updateOne(updates);
};

// Instance method to reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

// Static method to find user by credentials
userSchema.statics.findByCredentials = async function(identifier, password) {
  try {
    if (!identifier || !password || typeof identifier !== 'string' || typeof password !== 'string') {
      throw new Error('Invalid credentials');
    }

    // Find user by email or username
    const user = await this.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { username: identifier }
      ],
      isActive: true
    }).select('+password');

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password field exists
    if (!user.password) {
      console.error('User found but password field is missing:', user.email);
      throw new Error('Invalid credentials');
    }

    // Check if account is locked
    if (user.isLocked) {
      throw new Error('Account is temporarily locked due to too many failed login attempts');
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      await user.incLoginAttempts();
      throw new Error('Invalid credentials');
    }

    // Reset login attempts on successful login
    if (user.loginAttempts > 0) {
      await user.resetLoginAttempts();
    }

    return user;
  } catch (error) {
    console.error('findByCredentials error:', error.message);
    throw error;
  }
};

module.exports = mongoose.model('User', userSchema);