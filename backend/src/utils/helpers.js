const crypto = require('crypto');

/**
 * Generate a random string
 * @param {number} length - Length of the string
 * @returns {string} Random string
 */
exports.generateRandomString = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Generate a secure random token
 * @param {number} bytes - Number of bytes
 * @returns {string} Random token
 */
exports.generateToken = (bytes = 20) => {
  return crypto.randomBytes(bytes).toString('hex');
};

/**
 * Hash a string using SHA256
 * @param {string} str - String to hash
 * @returns {string} Hashed string
 */
exports.hashString = (str) => {
  return crypto.createHash('sha256').update(str).digest('hex');
};

/**
 * Sanitize user input
 * @param {string} input - Input to sanitize
 * @returns {string} Sanitized input
 */
exports.sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
};

/**
 * Format currency
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code
 * @returns {string} Formatted currency
 */
exports.formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

/**
 * Format percentage
 * @param {number} value - Value to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage
 */
exports.formatPercentage = (value, decimals = 2) => {
  return `${(value * 100).toFixed(decimals)}%`;
};

/**
 * Calculate percentage change
 * @param {number} oldValue - Old value
 * @param {number} newValue - New value
 * @returns {number} Percentage change
 */
exports.calculatePercentageChange = (oldValue, newValue) => {
  if (oldValue === 0) return 0;
  return (newValue - oldValue) / oldValue;
};

/**
 * Paginate results
 * @param {Object} query - Mongoose query
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Object} Pagination info
 */
exports.paginate = async (query, page = 1, limit = 10) => {
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await query.model.countDocuments(query.getQuery());

  const results = await query.skip(startIndex).limit(limit);

  const pagination = {
    current: page,
    total: Math.ceil(total / limit),
    count: results.length,
    totalItems: total
  };

  if (endIndex < total) {
    pagination.next = page + 1;
  }

  if (startIndex > 0) {
    pagination.prev = page - 1;
  }

  return {
    data: results,
    pagination
  };
};

/**
 * Generate API response
 * @param {boolean} success - Success status
 * @param {string} message - Response message
 * @param {*} data - Response data
 * @param {Object} meta - Additional metadata
 * @returns {Object} API response
 */
exports.apiResponse = (success, message, data = null, meta = {}) => {
  const response = {
    success,
    message,
    timestamp: new Date().toISOString()
  };

  if (data !== null) {
    response.data = data;
  }

  if (Object.keys(meta).length > 0) {
    response.meta = meta;
  }

  return response;
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid email
 */
exports.isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} Is valid phone
 */
exports.isValidPhone = (phone) => {
  const phoneRegex = /^\+?[\d\s-()]+$/;
  return phoneRegex.test(phone);
};

/**
 * Generate username from email
 * @param {string} email - Email address
 * @returns {string} Generated username
 */
exports.generateUsernameFromEmail = (email) => {
  const username = email.split('@')[0];
  return username.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
};

/**
 * Sleep for specified milliseconds
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} Promise that resolves after sleep
 */
exports.sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Deep clone an object
 * @param {*} obj - Object to clone
 * @returns {*} Cloned object
 */
exports.deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Remove undefined/null values from object
 * @param {Object} obj - Object to clean
 * @returns {Object} Cleaned object
 */
exports.removeEmptyValues = (obj) => {
  const cleaned = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== null && value !== '') {
      cleaned[key] = value;
    }
  }
  
  return cleaned;
};

/**
 * Generate a slug from text
 * @param {string} text - Text to slugify
 * @returns {string} Slug
 */
exports.slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

module.exports = exports;