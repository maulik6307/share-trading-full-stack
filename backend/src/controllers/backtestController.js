const asyncHandler = require('express-async-handler');
const backtestService = require('../services/backtestService');

// @desc    Get all backtests for user
// @route   GET /api/v1/backtests
// @access  Private
const getBacktests = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const options = {
    status: req.query.status,
    strategyId: req.query.strategyId,
    search: req.query.search,
    sortBy: req.query.sortBy || 'createdAt',
    sortOrder: req.query.sortOrder || 'desc',
    limit: parseInt(req.query.limit) || 20,
    offset: parseInt(req.query.offset) || 0
  };

  const result = await backtestService.getBacktests(userId, options);

  res.status(200).json({
    success: true,
    data: result.backtests,
    pagination: result.pagination
  });
});

// @desc    Get backtest status counts
// @route   GET /api/v1/backtests/status-counts
// @access  Private
const getStatusCounts = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const counts = await backtestService.getStatusCounts(userId);

  res.status(200).json({
    success: true,
    data: counts
  });
});

// @desc    Get running backtests
// @route   GET /api/v1/backtests/running
// @access  Private
const getRunningBacktests = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const runningBacktests = await backtestService.getRunningBacktests(userId);

  res.status(200).json({
    success: true,
    data: runningBacktests
  });
});

// @desc    Create new backtest
// @route   POST /api/v1/backtests
// @access  Private
const createBacktest = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const backtestData = {
    ...req.body,
    userId
  };

  const backtest = await backtestService.createBacktest(backtestData);

  res.status(201).json({
    success: true,
    data: backtest
  });
});

// @desc    Get single backtest
// @route   GET /api/v1/backtests/:id
// @access  Private
const getBacktest = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const backtestId = req.params.id;

  const backtest = await backtestService.getBacktest(backtestId, userId);

  if (!backtest) {
    res.status(404);
    throw new Error('Backtest not found');
  }

  res.status(200).json({
    success: true,
    data: backtest
  });
});

// @desc    Update backtest
// @route   PUT /api/v1/backtests/:id
// @access  Private
const updateBacktest = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const backtestId = req.params.id;
  const updates = req.body;

  const backtest = await backtestService.updateBacktest(backtestId, userId, updates);

  if (!backtest) {
    res.status(404);
    throw new Error('Backtest not found');
  }

  res.status(200).json({
    success: true,
    data: backtest
  });
});

// @desc    Delete backtest
// @route   DELETE /api/v1/backtests/:id
// @access  Private
const deleteBacktest = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const backtestId = req.params.id;

  const deleted = await backtestService.deleteBacktest(backtestId, userId);

  if (!deleted) {
    res.status(404);
    throw new Error('Backtest not found');
  }

  res.status(200).json({
    success: true,
    message: 'Backtest deleted successfully'
  });
});

// @desc    Cancel running backtest
// @route   POST /api/v1/backtests/:id/cancel
// @access  Private
const cancelBacktest = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const backtestId = req.params.id;

  const backtest = await backtestService.cancelBacktest(backtestId, userId);

  if (!backtest) {
    res.status(404);
    throw new Error('Backtest not found');
  }

  res.status(200).json({
    success: true,
    data: backtest
  });
});

// @desc    Retry failed backtest
// @route   POST /api/v1/backtests/:id/retry
// @access  Private
const retryBacktest = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const backtestId = req.params.id;

  const backtest = await backtestService.retryBacktest(backtestId, userId);

  if (!backtest) {
    res.status(404);
    throw new Error('Backtest not found');
  }

  res.status(200).json({
    success: true,
    data: backtest
  });
});

// @desc    Clone backtest
// @route   POST /api/v1/backtests/:id/clone
// @access  Private
const cloneBacktest = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const backtestId = req.params.id;
  const cloneData = req.body;

  const backtest = await backtestService.cloneBacktest(backtestId, userId, cloneData);

  if (!backtest) {
    res.status(404);
    throw new Error('Backtest not found');
  }

  res.status(201).json({
    success: true,
    data: backtest
  });
});

module.exports = {
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
};