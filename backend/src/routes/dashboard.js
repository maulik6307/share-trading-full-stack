const express = require('express');
const {
  getDashboard,
  getKPIData,
  getPerformanceData,
  getActivities,
  getAlerts,
  markAlertAsRead,
  dismissAlert,
  getStats
} = require('../controllers/dashboardController');

const { protect } = require('../middleware/auth');
const { query, param } = require('express-validator');

const router = express.Router();

// All dashboard routes require authentication
router.use(protect);

// Validation middleware
const validateDashboardQuery = [
  query('includePerformance').optional().isBoolean().withMessage('includePerformance must be boolean'),
  query('includeActivities').optional().isBoolean().withMessage('includeActivities must be boolean'),
  query('includeAlerts').optional().isBoolean().withMessage('includeAlerts must be boolean'),
  query('performanceDays').optional().isInt({ min: 1, max: 365 }).withMessage('performanceDays must be between 1 and 365'),
  query('activitiesLimit').optional().isInt({ min: 1, max: 100 }).withMessage('activitiesLimit must be between 1 and 100'),
  query('alertsLimit').optional().isInt({ min: 1, max: 100 }).withMessage('alertsLimit must be between 1 and 100')
];

const validatePerformanceQuery = [
  query('days').optional().isInt({ min: 1, max: 365 }).withMessage('days must be between 1 and 365')
];

const validateActivitiesQuery = [
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
  query('offset').optional().isInt({ min: 0 }).withMessage('offset must be non-negative'),
  query('type').optional().isIn(['trade', 'strategy', 'alert', 'system', 'deposit', 'withdrawal']).withMessage('Invalid activity type'),
  query('status').optional().isIn(['success', 'warning', 'error', 'info', 'pending']).withMessage('Invalid status')
];

const validateAlertsQuery = [
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
  query('offset').optional().isInt({ min: 0 }).withMessage('offset must be non-negative'),
  query('type').optional().isIn(['info', 'warning', 'error', 'success']).withMessage('Invalid alert type'),
  query('priority').optional().isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid priority'),
  query('unreadOnly').optional().isBoolean().withMessage('unreadOnly must be boolean')
];

const validateAlertId = [
  param('id').isMongoId().withMessage('Invalid alert ID')
];

// Main dashboard endpoint - gets all dashboard data
router.get('/', validateDashboardQuery, getDashboard);

// Individual component endpoints for better performance and caching
router.get('/kpi', getKPIData);
router.get('/performance', validatePerformanceQuery, getPerformanceData);
router.get('/activities', validateActivitiesQuery, getActivities);
router.get('/alerts', validateAlertsQuery, getAlerts);
router.get('/stats', getStats);

// Alert management endpoints
router.put('/alerts/:id/read', validateAlertId, markAlertAsRead);
router.delete('/alerts/:id', validateAlertId, dismissAlert);

module.exports = router;