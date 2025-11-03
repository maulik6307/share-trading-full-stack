const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getBacktests,
  getStatusCounts,
  getRunningBacktests,
  createBacktest,
  getBacktest,
  updateBacktest,
  deleteBacktest,
  cancelBacktest,
  retryBacktest,
  cloneBacktest
} = require('../controllers/backtestController');

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
  console.log('⚠️  Using mock authentication for backtesting routes in development');
}

// Status and running backtests routes (before :id routes)
router.get('/status-counts', authMiddleware, getStatusCounts);
router.get('/running', authMiddleware, getRunningBacktests);

// Main CRUD routes
router.route('/')
  .get(authMiddleware, getBacktests)
  .post(authMiddleware, createBacktest);

router.route('/:id')
  .get(authMiddleware, getBacktest)
  .put(authMiddleware, updateBacktest)
  .delete(authMiddleware, deleteBacktest);

// Action routes
router.post('/:id/cancel', authMiddleware, cancelBacktest);
router.post('/:id/retry', authMiddleware, retryBacktest);
router.post('/:id/clone', authMiddleware, cloneBacktest);

module.exports = router;