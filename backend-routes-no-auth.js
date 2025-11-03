
const express = require('express');
// const { protect } = require('../middleware/auth'); // DISABLED FOR TESTING
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

// Mock user middleware for testing
const mockUser = (req, res, next) => {
  req.user = { id: 'mock-user-id', name: 'Test User', email: 'test@example.com' };
  next();
};

// Status and running backtests routes (before :id routes)
router.get('/status-counts', mockUser, getStatusCounts);
router.get('/running', mockUser, getRunningBacktests);

// Main CRUD routes
router.route('/')
  .get(mockUser, getBacktests)
  .post(mockUser, createBacktest);

router.route('/:id')
  .get(mockUser, getBacktest)
  .put(mockUser, updateBacktest)
  .delete(mockUser, deleteBacktest);

// Action routes
router.post('/:id/cancel', mockUser, cancelBacktest);
router.post('/:id/retry', mockUser, retryBacktest);
router.post('/:id/clone', mockUser, cloneBacktest);

module.exports = router;
