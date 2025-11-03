const Strategy = require('../models/Strategy');
const StrategyTemplate = require('../models/StrategyTemplate');
const Activity = require('../models/Activity');

class StrategiesService {

  /**
   * Get user's strategies with filtering and pagination
   */
  async getUserStrategies(userId, options = {}) {
    try {
      const {
        status = 'all',
        search,
        tags,
        sortBy = 'updatedAt',
        sortOrder = 'desc',
        limit = 20,
        offset = 0,
        includeArchived = false
      } = options;

      // Get strategies
      const strategies = await Strategy.getByUser(userId, {
        status,
        search,
        tags,
        sortBy,
        sortOrder,
        limit,
        offset,
        includeArchived
      });

      // Get total count for pagination
      const query = { userId, isArchived: includeArchived ? undefined : false };
      if (status && status !== 'all') query.status = status;
      if (search) query.$text = { $search: search };
      if (tags && tags.length > 0) query.tags = { $in: tags };

      const total = await Strategy.countDocuments(query);

      return {
        strategies,
        pagination: {
          total,
          limit,
          offset,
          hasMore: total > offset + limit
        }
      };
    } catch (error) {
      console.error('Get user strategies error:', error);
      throw new Error('Failed to fetch strategies');
    }
  }

  /**
   * Get strategy status counts for dashboard
   */
  async getStatusCounts(userId) {
    try {
      const result = await Strategy.getStatusCounts(userId);
      
      if (result.length === 0) {
        return {
          total: 0,
          ACTIVE: 0,
          PAUSED: 0,
          STOPPED: 0,
          DRAFT: 0
        };
      }

      const counts = result[0];
      const statusCounts = {
        total: counts.total,
        ACTIVE: 0,
        PAUSED: 0,
        STOPPED: 0,
        DRAFT: 0
      };

      counts.counts.forEach(item => {
        statusCounts[item.status] = item.count;
      });

      return statusCounts;
    } catch (error) {
      console.error('Get status counts error:', error);
      throw new Error('Failed to fetch status counts');
    }
  }

  /**
   * Create a new strategy
   */
  async createStrategy(userId, strategyData) {
    try {
      const strategy = new Strategy({
        userId,
        name: strategyData.name,
        description: strategyData.description,
        type: strategyData.type,
        parameters: strategyData.parameters || {},
        code: strategyData.code || '',
        templateId: strategyData.templateId,
        tags: strategyData.tags || [],
        isTemplate: false
      });

      await strategy.save();

      // Create activity log
      await Activity.create({
        userId,
        type: 'strategy',
        action: 'create',
        title: 'Strategy Created',
        description: `Created new strategy: ${strategy.name}`,
        status: 'success',
        strategyId: strategy._id,
        metadata: {
          strategyType: strategy.type,
          templateId: strategy.templateId
        }
      });

      return strategy;
    } catch (error) {
      console.error('Create strategy error:', error);
      throw new Error('Failed to create strategy');
    }
  }

  /**
   * Update an existing strategy
   */
  async updateStrategy(userId, strategyId, updateData) {
    try {
      const strategy = await Strategy.findOne({ _id: strategyId, userId });
      
      if (!strategy) {
        throw new Error('Strategy not found');
      }

      // Update allowed fields
      const allowedFields = ['name', 'description', 'parameters', 'code', 'tags'];
      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          strategy[field] = updateData[field];
        }
      });

      await strategy.save();

      // Create activity log
      await Activity.create({
        userId,
        type: 'strategy',
        action: 'update',
        title: 'Strategy Updated',
        description: `Updated strategy: ${strategy.name}`,
        status: 'success',
        strategyId: strategy._id
      });

      return strategy;
    } catch (error) {
      console.error('Update strategy error:', error);
      throw new Error('Failed to update strategy');
    }
  }

  /**
   * Delete a strategy
   */
  async deleteStrategy(userId, strategyId) {
    try {
      const strategy = await Strategy.findOne({ _id: strategyId, userId });
      
      if (!strategy) {
        throw new Error('Strategy not found');
      }

      // Soft delete by archiving
      strategy.isArchived = true;
      strategy.status = 'STOPPED';
      await strategy.save();

      // Create activity log
      await Activity.create({
        userId,
        type: 'strategy',
        action: 'delete',
        title: 'Strategy Deleted',
        description: `Deleted strategy: ${strategy.name}`,
        status: 'info',
        strategyId: strategy._id
      });

      return { success: true };
    } catch (error) {
      console.error('Delete strategy error:', error);
      throw new Error('Failed to delete strategy');
    }
  }

  /**
   * Clone a strategy
   */
  async cloneStrategy(userId, strategyId, newName) {
    try {
      const originalStrategy = await Strategy.findById(strategyId);
      
      if (!originalStrategy) {
        throw new Error('Strategy not found');
      }

      const clonedStrategy = await originalStrategy.clone(newName, userId);

      // Create activity log
      await Activity.create({
        userId,
        type: 'strategy',
        action: 'clone',
        title: 'Strategy Cloned',
        description: `Cloned strategy: ${originalStrategy.name} → ${clonedStrategy.name}`,
        status: 'success',
        strategyId: clonedStrategy._id,
        metadata: {
          originalStrategyId: originalStrategy._id,
          originalStrategyName: originalStrategy.name
        }
      });

      return clonedStrategy;
    } catch (error) {
      console.error('Clone strategy error:', error);
      throw new Error('Failed to clone strategy');
    }
  }

  /**
   * Deploy a strategy
   */
  async deployStrategy(userId, strategyId) {
    try {
      const strategy = await Strategy.findOne({ _id: strategyId, userId });
      
      if (!strategy) {
        throw new Error('Strategy not found');
      }

      if (strategy.status === 'ACTIVE') {
        throw new Error('Strategy is already active');
      }

      await strategy.deploy();

      // Create activity log
      await Activity.create({
        userId,
        type: 'strategy',
        action: 'deploy',
        title: 'Strategy Deployed',
        description: `Deployed strategy: ${strategy.name}`,
        status: 'success',
        strategyId: strategy._id
      });

      return strategy;
    } catch (error) {
      console.error('Deploy strategy error:', error);
      throw new Error('Failed to deploy strategy');
    }
  }

  /**
   * Pause a strategy
   */
  async pauseStrategy(userId, strategyId) {
    try {
      const strategy = await Strategy.findOne({ _id: strategyId, userId });
      
      if (!strategy) {
        throw new Error('Strategy not found');
      }

      if (strategy.status !== 'ACTIVE') {
        throw new Error('Only active strategies can be paused');
      }

      await strategy.pause();

      // Create activity log
      await Activity.create({
        userId,
        type: 'strategy',
        action: 'pause',
        title: 'Strategy Paused',
        description: `Paused strategy: ${strategy.name}`,
        status: 'warning',
        strategyId: strategy._id
      });

      return strategy;
    } catch (error) {
      console.error('Pause strategy error:', error);
      throw new Error('Failed to pause strategy');
    }
  }

  /**
   * Stop a strategy
   */
  async stopStrategy(userId, strategyId) {
    try {
      const strategy = await Strategy.findOne({ _id: strategyId, userId });
      
      if (!strategy) {
        throw new Error('Strategy not found');
      }

      if (strategy.status === 'STOPPED') {
        throw new Error('Strategy is already stopped');
      }

      await strategy.stop();

      // Create activity log
      await Activity.create({
        userId,
        type: 'strategy',
        action: 'stop',
        title: 'Strategy Stopped',
        description: `Stopped strategy: ${strategy.name}`,
        status: 'error',
        strategyId: strategy._id
      });

      return strategy;
    } catch (error) {
      console.error('Stop strategy error:', error);
      throw new Error('Failed to stop strategy');
    }
  }

  /**
   * Get strategy templates
   */
  async getTemplates(options = {}) {
    try {
      const {
        category,
        search,
        sortBy = 'usageCount',
        sortOrder = 'desc',
        limit = 20,
        offset = 0
      } = options;

      const templates = await StrategyTemplate.getPublicTemplates({
        category,
        search,
        sortBy,
        sortOrder,
        limit,
        offset
      });

      const total = await StrategyTemplate.countDocuments({
        isActive: true,
        isPublic: true,
        ...(category && category !== 'all' ? { category } : {}),
        ...(search ? { $text: { $search: search } } : {})
      });

      return {
        templates,
        pagination: {
          total,
          limit,
          offset,
          hasMore: total > offset + limit
        }
      };
    } catch (error) {
      console.error('Get templates error:', error);
      throw new Error('Failed to fetch templates');
    }
  }

  /**
   * Get template categories
   */
  async getTemplateCategories() {
    try {
      const categories = await StrategyTemplate.getCategories();
      return categories.sort();
    } catch (error) {
      console.error('Get template categories error:', error);
      throw new Error('Failed to fetch template categories');
    }
  }

  /**
   * Get popular templates
   */
  async getPopularTemplates(limit = 10) {
    try {
      return await StrategyTemplate.getPopular(limit);
    } catch (error) {
      console.error('Get popular templates error:', error);
      throw new Error('Failed to fetch popular templates');
    }
  }

  /**
   * Get strategy by ID
   */
  async getStrategyById(userId, strategyId) {
    try {
      const strategy = await Strategy.findOne({ _id: strategyId, userId, isArchived: false })
        .populate('template', 'name category parameterSchema')
        .lean();

      if (!strategy) {
        throw new Error('Strategy not found');
      }

      return strategy;
    } catch (error) {
      console.error('Get strategy by ID error:', error);
      throw new Error('Failed to fetch strategy');
    }
  }

  /**
   * Create strategy from template
   */
  async createFromTemplate(userId, templateId, strategyData) {
    try {
      const template = await StrategyTemplate.findById(templateId);
      
      if (!template) {
        throw new Error('Template not found');
      }

      // Increment template usage
      await template.incrementUsage();

      const strategy = new Strategy({
        userId,
        name: strategyData.name,
        description: strategyData.description || `Strategy based on ${template.name}`,
        type: 'TEMPLATE',
        templateId: template._id,
        parameters: { ...template.defaultParameters, ...strategyData.parameters },
        code: template.code,
        tags: [template.category.toLowerCase().replace(/\s+/g, '-'), ...strategyData.tags || []],
        isTemplate: false
      });

      await strategy.save();

      // Create activity log
      await Activity.create({
        userId,
        type: 'strategy',
        action: 'create_from_template',
        title: 'Strategy Created from Template',
        description: `Created "${strategy.name}" from template "${template.name}"`,
        status: 'success',
        strategyId: strategy._id,
        metadata: {
          templateId: template._id,
          templateName: template.name
        }
      });

      return strategy;
    } catch (error) {
      console.error('Create from template error:', error);
      throw new Error('Failed to create strategy from template');
    }
  }

  /**
   * Get strategy performance summary
   */
  async getPerformanceSummary(userId) {
    try {
      const strategies = await Strategy.find({ 
        userId, 
        isArchived: false,
        performance: { $exists: true }
      }).select('name status performance');

      const summary = {
        totalStrategies: strategies.length,
        activeStrategies: strategies.filter(s => s.status === 'ACTIVE').length,
        profitableStrategies: strategies.filter(s => s.performance && s.performance.totalReturn > 0).length,
        totalReturn: strategies.reduce((sum, s) => sum + (s.performance?.totalReturn || 0), 0),
        avgWinRate: strategies.length > 0 
          ? strategies.reduce((sum, s) => sum + (s.performance?.winRate || 0), 0) / strategies.length
          : 0,
        bestPerformer: strategies.reduce((best, current) => {
          const currentReturn = current.performance?.totalReturnPercent || 0;
          const bestReturn = best?.performance?.totalReturnPercent || -Infinity;
          return currentReturn > bestReturn ? current : best;
        }, null),
        worstPerformer: strategies.reduce((worst, current) => {
          const currentReturn = current.performance?.totalReturnPercent || 0;
          const worstReturn = worst?.performance?.totalReturnPercent || Infinity;
          return currentReturn < worstReturn ? current : worst;
        }, null)
      };

      return summary;
    } catch (error) {
      console.error('Get performance summary error:', error);
      throw new Error('Failed to fetch performance summary');
    }
  }
}

module.exports = new StrategiesService();