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

// Mock user middleware for testing (TEMPORARY)
const mockUser = (req, res, next) => {
  req.user = { 
    id: '507f1f77bcf86cd799439011', // Valid MongoDB ObjectId
    name: 'Test User', 
    email: 'test@example.com',
    role: 'user'
  };
  next();
};

// Use mock auth in development, real auth in production
const authMiddleware = process.env.NODE_ENV === 'development' ? mockUser : protect;

if (process.env.NODE_ENV === 'development') {
  console.log('⚠️  Using mock authentication for strategy routes in development');
}

// Template routes (must come before parameterized routes)
router.get('/templates/categories', authMiddleware, getTemplateCategories);
router.get('/templates/popular', authMiddleware, getPopularTemplates);
router.get('/templates', authMiddleware, getTemplates);
router.post('/templates/:templateId/create', authMiddleware, createFromTemplate);

// Performance routes
router.get('/performance/summary', authMiddleware, getPerformanceSummary);

// Status routes
router.get('/status-counts', authMiddleware, getStatusCounts);

// Strategy CRUD routes
router.route('/')
  .get(authMiddleware, getStrategies)
  .post(authMiddleware, createStrategy);

router.route('/:id')
  .get(authMiddleware, getStrategy)
  .put(authMiddleware, updateStrategy)
  .delete(authMiddleware, deleteStrategy);

// Strategy action routes
router.post('/:id/clone', authMiddleware, cloneStrategy);
router.post('/:id/deploy', authMiddleware, deployStrategy);
router.post('/:id/pause', authMiddleware, pauseStrategy);
router.post('/:id/stop', authMiddleware, stopStrategy);

module.exports = router;