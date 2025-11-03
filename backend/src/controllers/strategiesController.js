const strategiesService = require('../services/strategiesService');

/**
 * @desc    Get user's strategies with filtering and pagination
 * @route   GET /api/v1/strategies
 * @access  Private
 */
const getStrategies = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      status = 'all',
      search,
      tags,
      sortBy = 'updatedAt',
      sortOrder = 'desc',
      limit = 20,
      offset = 0,
      includeArchived = false
    } = req.query;

    const options = {
      status,
      search,
      tags: tags ? tags.split(',') : undefined,
      sortBy,
      sortOrder,
      limit: parseInt(limit),
      offset: parseInt(offset),
      includeArchived: includeArchived === 'true'
    };

    const result = await strategiesService.getUserStrategies(userId, options);

    res.status(200).json({
      success: true,
      data: result.strategies,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Get strategies error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch strategies'
    });
  }
};

/**
 * @desc    Get strategy status counts
 * @route   GET /api/v1/strategies/status-counts
 * @access  Private
 */
const getStatusCounts = async (req, res) => {
  try {
    const userId = req.user.id;
    const counts = await strategiesService.getStatusCounts(userId);

    res.status(200).json({
      success: true,
      data: counts
    });
  } catch (error) {
    console.error('Get status counts error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch status counts'
    });
  }
};

/**
 * @desc    Create a new strategy
 * @route   POST /api/v1/strategies
 * @access  Private
 */
const createStrategy = async (req, res) => {
  try {
    const userId = req.user.id;
    const strategyData = req.body;

    // Validate required fields
    if (!strategyData.name || !strategyData.description || !strategyData.type) {
      return res.status(400).json({
        success: false,
        message: 'Name, description, and type are required'
      });
    }

    const strategy = await strategiesService.createStrategy(userId, strategyData);

    res.status(201).json({
      success: true,
      data: strategy,
      message: 'Strategy created successfully'
    });
  } catch (error) {
    console.error('Create strategy error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create strategy'
    });
  }
};

/**
 * @desc    Get single strategy by ID
 * @route   GET /api/v1/strategies/:id
 * @access  Private
 */
const getStrategy = async (req, res) => {
  try {
    const userId = req.user.id;
    const strategyId = req.params.id;

    const strategy = await strategiesService.getStrategyById(userId, strategyId);

    res.status(200).json({
      success: true,
      data: strategy
    });
  } catch (error) {
    console.error('Get strategy error:', error);
    const statusCode = error.message === 'Strategy not found' ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to fetch strategy'
    });
  }
};

/**
 * @desc    Update strategy
 * @route   PUT /api/v1/strategies/:id
 * @access  Private
 */
const updateStrategy = async (req, res) => {
  try {
    const userId = req.user.id;
    const strategyId = req.params.id;
    const updateData = req.body;

    const strategy = await strategiesService.updateStrategy(userId, strategyId, updateData);

    res.status(200).json({
      success: true,
      data: strategy,
      message: 'Strategy updated successfully'
    });
  } catch (error) {
    console.error('Update strategy error:', error);
    const statusCode = error.message === 'Strategy not found' ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to update strategy'
    });
  }
};

/**
 * @desc    Delete strategy (soft delete)
 * @route   DELETE /api/v1/strategies/:id
 * @access  Private
 */
const deleteStrategy = async (req, res) => {
  try {
    const userId = req.user.id;
    const strategyId = req.params.id;

    await strategiesService.deleteStrategy(userId, strategyId);

    res.status(200).json({
      success: true,
      message: 'Strategy deleted successfully'
    });
  } catch (error) {
    console.error('Delete strategy error:', error);
    const statusCode = error.message === 'Strategy not found' ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to delete strategy'
    });
  }
};

/**
 * @desc    Clone a strategy
 * @route   POST /api/v1/strategies/:id/clone
 * @access  Private
 */
const cloneStrategy = async (req, res) => {
  try {
    const userId = req.user.id;
    const strategyId = req.params.id;
    const { name } = req.body;

    const clonedStrategy = await strategiesService.cloneStrategy(userId, strategyId, name);

    res.status(201).json({
      success: true,
      data: clonedStrategy,
      message: 'Strategy cloned successfully'
    });
  } catch (error) {
    console.error('Clone strategy error:', error);
    const statusCode = error.message === 'Strategy not found' ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to clone strategy'
    });
  }
};

/**
 * @desc    Deploy a strategy
 * @route   POST /api/v1/strategies/:id/deploy
 * @access  Private
 */
const deployStrategy = async (req, res) => {
  try {
    const userId = req.user.id;
    const strategyId = req.params.id;

    const strategy = await strategiesService.deployStrategy(userId, strategyId);

    res.status(200).json({
      success: true,
      data: strategy,
      message: 'Strategy deployed successfully'
    });
  } catch (error) {
    console.error('Deploy strategy error:', error);
    const statusCode = error.message.includes('not found') ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to deploy strategy'
    });
  }
};

/**
 * @desc    Pause a strategy
 * @route   POST /api/v1/strategies/:id/pause
 * @access  Private
 */
const pauseStrategy = async (req, res) => {
  try {
    const userId = req.user.id;
    const strategyId = req.params.id;

    const strategy = await strategiesService.pauseStrategy(userId, strategyId);

    res.status(200).json({
      success: true,
      data: strategy,
      message: 'Strategy paused successfully'
    });
  } catch (error) {
    console.error('Pause strategy error:', error);
    const statusCode = error.message.includes('not found') ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to pause strategy'
    });
  }
};

/**
 * @desc    Stop a strategy
 * @route   POST /api/v1/strategies/:id/stop
 * @access  Private
 */
const stopStrategy = async (req, res) => {
  try {
    const userId = req.user.id;
    const strategyId = req.params.id;

    const strategy = await strategiesService.stopStrategy(userId, strategyId);

    res.status(200).json({
      success: true,
      data: strategy,
      message: 'Strategy stopped successfully'
    });
  } catch (error) {
    console.error('Stop strategy error:', error);
    const statusCode = error.message.includes('not found') ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to stop strategy'
    });
  }
};

/**
 * @desc    Get strategy templates
 * @route   GET /api/v1/strategies/templates
 * @access  Private
 */
const getTemplates = async (req, res) => {
  try {
    const {
      category,
      search,
      sortBy = 'usageCount',
      sortOrder = 'desc',
      limit = 20,
      offset = 0
    } = req.query;

    const options = {
      category,
      search,
      sortBy,
      sortOrder,
      limit: parseInt(limit),
      offset: parseInt(offset)
    };

    const result = await strategiesService.getTemplates(options);

    res.status(200).json({
      success: true,
      data: result.templates,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch templates'
    });
  }
};

/**
 * @desc    Get template categories
 * @route   GET /api/v1/strategies/templates/categories
 * @access  Private
 */
const getTemplateCategories = async (req, res) => {
  try {
    const categories = await strategiesService.getTemplateCategories();

    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Get template categories error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch template categories'
    });
  }
};

/**
 * @desc    Get popular templates
 * @route   GET /api/v1/strategies/templates/popular
 * @access  Private
 */
const getPopularTemplates = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const templates = await strategiesService.getPopularTemplates(parseInt(limit));

    res.status(200).json({
      success: true,
      data: templates
    });
  } catch (error) {
    console.error('Get popular templates error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch popular templates'
    });
  }
};

/**
 * @desc    Create strategy from template
 * @route   POST /api/v1/strategies/templates/:templateId/create
 * @access  Private
 */
const createFromTemplate = async (req, res) => {
  try {
    const userId = req.user.id;
    const templateId = req.params.templateId;
    const strategyData = req.body;

    // Validate required fields
    if (!strategyData.name) {
      return res.status(400).json({
        success: false,
        message: 'Strategy name is required'
      });
    }

    const strategy = await strategiesService.createFromTemplate(userId, templateId, strategyData);

    res.status(201).json({
      success: true,
      data: strategy,
      message: 'Strategy created from template successfully'
    });
  } catch (error) {
    console.error('Create from template error:', error);
    const statusCode = error.message === 'Template not found' ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to create strategy from template'
    });
  }
};

/**
 * @desc    Get performance summary
 * @route   GET /api/v1/strategies/performance/summary
 * @access  Private
 */
const getPerformanceSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const summary = await strategiesService.getPerformanceSummary(userId);

    res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Get performance summary error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch performance summary'
    });
  }
};

module.exports = {
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
};