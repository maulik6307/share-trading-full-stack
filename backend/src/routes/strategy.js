const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getStrategies,
  getStatusCounts,
  createStrategy,
  getStrategy,
  updateStrategy,
  deleteStrategy,
  cloneStrategy,
  deployStrategy,
  pauseStrategy,
  stopStrategy,
  getTemplates,
  getTemplateCategories,
  getPopularTemplates,
  createFromTemplate,
  getPerformanceSummary
} = require('../controllers/strategiesController');

const router = express.Router();

// Template routes (must come before parameterized routes)
router.get('/templates/categories', protect, getTemplateCategories);
router.get('/templates/popular', protect, getPopularTemplates);
router.get('/templates', protect, getTemplates);
router.post('/templates/:templateId/create', protect, createFromTemplate);

// Performance routes
router.get('/performance/summary', protect, getPerformanceSummary);

// Status routes
router.get('/status-counts', protect, getStatusCounts);

// Strategy CRUD routes
router.route('/')
  .get(protect, getStrategies)
  .post(protect, createStrategy);

router.route('/:id')
  .get(protect, getStrategy)
  .put(protect, updateStrategy)
  .delete(protect, deleteStrategy);

// Strategy action routes
router.post('/:id/clone', protect, cloneStrategy);
router.post('/:id/deploy', protect, deployStrategy);
router.post('/:id/pause', protect, pauseStrategy);
router.post('/:id/stop', protect, stopStrategy);

module.exports = router;