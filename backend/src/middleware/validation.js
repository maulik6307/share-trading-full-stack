const { body, param, query } = require('express-validator');

// User registration validation
exports.validateRegister = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),

  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),

  body('username')
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Username must be between 3 and 20 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),

  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),

  body('phone')
    .optional()
    .matches(/^\+?[\d\s-()]+$/)
    .isLength({ min: 8, max: 20 })
    .withMessage('Please provide a valid international phone number'),

  body('country')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Country name cannot exceed 50 characters')
];

// User login validation
exports.validateLogin = [
  body('identifier')
    .trim()
    .notEmpty()
    .withMessage('Email or username is required'),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),

  body('rememberMe')
    .optional()
    .isBoolean()
    .withMessage('Remember me must be a boolean value')
];

// Update user details validation
exports.validateUpdateDetails = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),

  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),

  body('phone')
    .optional()
    .matches(/^\+?[\d\s-()]+$/)
    .withMessage('Please provide a valid phone number'),

  body('country')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Country name cannot exceed 50 characters'),

  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),

  body('timezone')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Timezone cannot exceed 50 characters'),

  body('language')
    .optional()
    .isIn(['en', 'es', 'fr', 'de', 'zh', 'ja'])
    .withMessage('Language must be one of: en, es, fr, de, zh, ja')
];

// Update password validation
exports.validateUpdatePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),

  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number'),

  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match new password');
      }
      return true;
    })
];

// Forgot password validation
exports.validateForgotPassword = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address')
];

// Reset password validation
exports.validateResetPassword = [
  param('resettoken')
    .isLength({ min: 1 })
    .withMessage('Reset token is required'),

  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),

  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    })
];

// Trading preferences validation
exports.validateTradingPreferences = [
  body('defaultCurrency')
    .optional()
    .isIn(['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'])
    .withMessage('Default currency must be one of: USD, EUR, GBP, JPY, CAD, AUD'),

  body('riskTolerance')
    .optional()
    .isIn(['conservative', 'moderate', 'aggressive'])
    .withMessage('Risk tolerance must be one of: conservative, moderate, aggressive'),

  body('tradingExperience')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced', 'expert'])
    .withMessage('Trading experience must be one of: beginner, intermediate, advanced, expert'),

  body('notifications.email')
    .optional()
    .isBoolean()
    .withMessage('Email notifications setting must be a boolean'),

  body('notifications.push')
    .optional()
    .isBoolean()
    .withMessage('Push notifications setting must be a boolean'),

  body('notifications.sms')
    .optional()
    .isBoolean()
    .withMessage('SMS notifications setting must be a boolean'),

  body('notifications.trading')
    .optional()
    .isBoolean()
    .withMessage('Trading notifications setting must be a boolean'),

  body('notifications.marketing')
    .optional()
    .isBoolean()
    .withMessage('Marketing notifications setting must be a boolean')
];

// Pagination validation
exports.validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('sort')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Sort field must be between 1 and 50 characters')
];

// MongoDB ObjectId validation
exports.validateObjectId = (field = 'id') => [
  param(field)
    .isMongoId()
    .withMessage(`${field} must be a valid MongoDB ObjectId`)
];

// File upload validation
exports.validateFileUpload = [
  body('fileType')
    .optional()
    .isIn(['image', 'document', 'csv'])
    .withMessage('File type must be one of: image, document, csv')
];

// Search validation
exports.validateSearch = [
  query('q')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),

  query('category')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Category must be between 1 and 50 characters')
];

module.exports = exports;