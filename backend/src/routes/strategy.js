const express = require('express');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all strategies
// @route   GET /api/v1/strategies
// @access  Private
router.get('/', protect, async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Get strategies endpoint - Coming soon',
    data: []
  });
});

// @desc    Create strategy
// @route   POST /api/v1/strategies
// @access  Private
router.post('/', protect, async (req, res) => {
  res.status(201).json({
    success: true,
    message: 'Create strategy endpoint - Coming soon',
    data: {}
  });
});

// @desc    Get single strategy
// @route   GET /api/v1/strategies/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Get single strategy endpoint - Coming soon',
    data: {}
  });
});

// @desc    Update strategy
// @route   PUT /api/v1/strategies/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Update strategy endpoint - Coming soon',
    data: {}
  });
});

// @desc    Delete strategy
// @route   DELETE /api/v1/strategies/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Delete strategy endpoint - Coming soon'
  });
});

module.exports = router;