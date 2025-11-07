const express = require('express');
const { body } = require('express-validator');
const {
  getProfile,
  updateProfile,
  getSecuritySettings,
  updateSecuritySettings,
  enable2FA,
  disable2FA,
  verify2FA,
  regenerateBackupCodes,
  getActiveSessions,
  getNotificationPreferences,
  updateNotificationPreferences,
  getBillingInfo,
  upgradePlan
} = require('../controllers/settingsController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

// Profile routes
router.route('/profile')
  .get(getProfile)
  .put([
    body('name').optional().trim().isLength({ min: 1, max: 50 }).withMessage('Name must be between 1 and 50 characters'),
    body('email').optional().isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('phone').optional().matches(/^\+?[\d\s-()]+$/).withMessage('Please provide a valid phone number'),
    body('country').optional().trim().isLength({ max: 50 }).withMessage('Country cannot be more than 50 characters'),
    body('bio').optional().trim().isLength({ max: 500 }).withMessage('Bio cannot be more than 500 characters'),
    body('timezone').optional().trim(),
    body('language').optional().isIn(['en', 'es', 'fr', 'de', 'zh', 'ja']).withMessage('Invalid language'),
    body('theme').optional().isIn(['light', 'dark']).withMessage('Theme must be light or dark'),
    body('currency').optional().isIn(['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD']).withMessage('Invalid currency'),
    body('dateFormat').optional().isIn(['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD', 'DD-MM-YYYY']).withMessage('Invalid date format')
  ], updateProfile);

// Security routes
router.route('/security')
  .get(getSecuritySettings)
  .put(updateSecuritySettings);

router.post('/security/2fa/enable', [
  body('method').optional().isIn(['app', 'sms', 'email']).withMessage('Invalid 2FA method')
], enable2FA);

router.post('/security/2fa/disable', [
  body('password').notEmpty().withMessage('Password is required to disable 2FA')
], disable2FA);

router.post('/security/2fa/verify', [
  body('code').notEmpty().withMessage('Verification code is required'),
  body('method').optional().isIn(['app', 'sms', 'backup']).withMessage('Invalid verification method')
], verify2FA);

router.post('/security/2fa/backup-codes', [
  body('password').notEmpty().withMessage('Password is required to regenerate backup codes')
], regenerateBackupCodes);

router.get('/security/sessions', getActiveSessions);

// Notification routes
router.route('/notifications')
  .get(getNotificationPreferences)
  .put(updateNotificationPreferences);

// Billing routes
router.get('/billing', getBillingInfo);
router.post('/billing/upgrade', [
  body('planName').notEmpty().withMessage('Plan name is required'),
  body('interval').optional().isIn(['monthly', 'yearly']).withMessage('Invalid billing interval')
], upgradePlan);

module.exports = router;