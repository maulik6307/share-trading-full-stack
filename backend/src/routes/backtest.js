const express = require('express');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all backtests
// @route   GET /api/v1/backtests
// @access  Private
router.get('/', protect, async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Get backtests endpoint - Coming soon',
    data: []
  });
});

// @desc    Create backtest
// @route   POST /api/v1/backtests
// @access  Private
router.post('/', protect, async (req, res) => {
  res.status(201).json({
    success: true,
    message: 'Create backtest endpoint - Coming soon',
    data: {}
  });
});

// @desc    Get single backtest
// @route   GET /api/v1/backtests/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Get single backtest endpoint - Coming soon',
    data: {}
  });
});

// @desc    Delete backtest
// @route   DELETE /api/v1/backtests/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Delete backtest endpoint - Coming soon'
  });
});

module.exports = router;