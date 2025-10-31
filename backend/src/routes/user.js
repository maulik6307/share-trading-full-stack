const express = require('express');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all users (admin only)
// @route   GET /api/v1/users
// @access  Private/Admin
router.get('/', protect, authorize('admin'), async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Get all users endpoint - Coming soon',
    data: []
  });
});

// @desc    Get single user
// @route   GET /api/v1/users/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Get single user endpoint - Coming soon',
    data: {}
  });
});

// @desc    Update user
// @route   PUT /api/v1/users/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Update user endpoint - Coming soon',
    data: {}
  });
});

// @desc    Delete user
// @route   DELETE /api/v1/users/:id
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Delete user endpoint - Coming soon'
  });
});

module.exports = router;