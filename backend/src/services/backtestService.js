const Backtest = require('../models/Backtest');
const Strategy = require('../models/Strategy');
const mongoose = require('mongoose');

class BacktestService {
  // Get backtests for user with filtering and pagination
  async getBacktests(userId, options = {}) {
    const {
      status,
      strategyId,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      limit = 20,
      offset = 0
    } = options;

    const query = { userId: new mongoose.Types.ObjectId(userId) };
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (strategyId) {
      query.strategyId = new mongoose.Types.ObjectId(strategyId);
    }
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const backtests = await Backtest.find(query)
      .populate('strategy', 'name type status')
      .sort(sortOptions)
      .limit(limit)
      .skip(offset)
      .lean();

    const total = await Backtest.countDocuments(query);

    return {
      backtests,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    };
  }

  // Get status counts for user
  async getStatusCounts(userId) {
    const result = await Backtest.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const counts = {
      total: 0,
      PENDING: 0,
      RUNNING: 0,
      COMPLETED: 0,
      FAILED: 0,
      CANCELLED: 0
    };

    result.forEach(item => {
      counts[item._id] = item.count;
      counts.total += item.count;
    });

    return counts;
  }

  // Get running backtests for user
  async getRunningBacktests(userId) {
    return await Backtest.find({ 
      userId: new mongoose.Types.ObjectId(userId), 
      status: { $in: ['PENDING', 'RUNNING'] } 
    })
    .populate('strategy', 'name type status')
    .sort({ createdAt: -1 })
    .lean();
  }

  // Create new backtest
  async createBacktest(backtestData) {
    // Validate strategy exists and belongs to user
    const strategy = await Strategy.findOne({
      _id: backtestData.strategyId,
      userId: backtestData.userId
    });

    if (!strategy) {
      throw new Error('Strategy not found or access denied');
    }

    // Validate date range
    const startDate = new Date(backtestData.startDate);
    const endDate = new Date(backtestData.endDate);
    
    if (startDate >= endDate) {
      throw new Error('End date must be after start date');
    }
    
    if (endDate > new Date()) {
      throw new Error('End date cannot be in the future');
    }

    // Create backtest
    const backtest = new Backtest(backtestData);
    await backtest.save();

    // Populate strategy info
    await backtest.populate('strategy', 'name type status');

    // Start backtest execution asynchronously
    this.executeBacktest(backtest._id).catch(error => {
      console.error('Backtest execution error:', error);
    });

    return backtest;
  }

  // Get single backtest
  async getBacktest(backtestId, userId) {
    return await Backtest.findOne({
      _id: backtestId,
      userId: new mongoose.Types.ObjectId(userId)
    })
    .populate('strategy', 'name type status')
    .lean();
  }

  // Update backtest metadata
  async updateBacktest(backtestId, userId, updates) {
    const allowedUpdates = ['name', 'description', 'tags'];
    const filteredUpdates = {};
    
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    const backtest = await Backtest.findOneAndUpdate(
      { _id: backtestId, userId: new mongoose.Types.ObjectId(userId) },
      filteredUpdates,
      { new: true }
    ).populate('strategy', 'name type status');

    return backtest;
  }

  // Delete backtest
  async deleteBacktest(backtestId, userId) {
    const backtest = await Backtest.findOneAndDelete({
      _id: backtestId,
      userId: new mongoose.Types.ObjectId(userId)
    });

    return !!backtest;
  }

  // Cancel running backtest
  async cancelBacktest(backtestId, userId) {
    const backtest = await Backtest.findOne({
      _id: backtestId,
      userId: new mongoose.Types.ObjectId(userId),
      status: { $in: ['PENDING', 'RUNNING'] }
    });

    if (!backtest) {
      return null;
    }

    await backtest.cancel();
    await backtest.populate('strategy', 'name type status');

    return backtest;
  }

  // Retry failed backtest
  async retryBacktest(backtestId, userId) {
    const backtest = await Backtest.findOne({
      _id: backtestId,
      userId: new mongoose.Types.ObjectId(userId),
      status: { $in: ['FAILED', 'CANCELLED'] }
    });

    if (!backtest) {
      return null;
    }

    // Reset backtest state
    backtest.status = 'PENDING';
    backtest.progress = 0;
    backtest.errorMessage = undefined;
    backtest.startedAt = undefined;
    backtest.completedAt = undefined;
    backtest.result = undefined;

    await backtest.save();
    await backtest.populate('strategy', 'name type status');

    // Start execution asynchronously
    this.executeBacktest(backtest._id).catch(error => {
      console.error('Backtest retry execution error:', error);
    });

    return backtest;
  }

  // Clone backtest
  async cloneBacktest(backtestId, userId, cloneData) {
    const originalBacktest = await Backtest.findOne({
      _id: backtestId,
      userId: new mongoose.Types.ObjectId(userId)
    });

    if (!originalBacktest) {
      return null;
    }

    // Create new backtest with original data and overrides
    const newBacktestData = {
      userId: originalBacktest.userId,
      strategyId: originalBacktest.strategyId,
      name: cloneData.name || `${originalBacktest.name} (Copy)`,
      description: cloneData.description || originalBacktest.description,
      startDate: cloneData.startDate || originalBacktest.startDate,
      endDate: cloneData.endDate || originalBacktest.endDate,
      initialCapital: cloneData.initialCapital || originalBacktest.initialCapital,
      commission: cloneData.commission || originalBacktest.commission,
      slippage: cloneData.slippage || originalBacktest.slippage,
      tags: cloneData.tags || originalBacktest.tags
    };

    const clonedBacktest = new Backtest(newBacktestData);
    await clonedBacktest.save();
    await clonedBacktest.populate('strategy', 'name type status');

    // Start execution asynchronously
    this.executeBacktest(clonedBacktest._id).catch(error => {
      console.error('Cloned backtest execution error:', error);
    });

    return clonedBacktest;
  }

  // Execute backtest (simulation for now)
  async executeBacktest(backtestId) {
    try {
      const backtest = await Backtest.findById(backtestId);
      if (!backtest || backtest.status !== 'PENDING') {
        return;
      }

      // Start the backtest
      await backtest.start();

      // Simulate backtest execution with progress updates
      const totalSteps = 10;
      for (let step = 1; step <= totalSteps; step++) {
        // Check if backtest was cancelled
        const currentBacktest = await Backtest.findById(backtestId);
        if (currentBacktest.status === 'CANCELLED') {
          return;
        }

        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));

        // Update progress
        const progress = Math.round((step / totalSteps) * 100);
        await backtest.updateProgress(progress);
      }

      // Generate mock results
      const mockResult = this.generateMockResults(backtest);
      
      // Complete the backtest
      await backtest.complete(mockResult);

    } catch (error) {
      console.error('Backtest execution error:', error);
      const backtest = await Backtest.findById(backtestId);
      if (backtest) {
        await backtest.fail(error.message);
      }
    }
  }

  // Generate mock backtest results
  generateMockResults(backtest) {
    const daysBetween = Math.ceil((backtest.endDate - backtest.startDate) / (1000 * 60 * 60 * 24));
    const totalReturn = (Math.random() - 0.3) * 0.5; // -30% to +20% range
    const finalCapital = backtest.initialCapital * (1 + totalReturn);
    
    // Generate equity curve
    const equityCurve = [];
    let currentEquity = backtest.initialCapital;
    const dailyReturn = totalReturn / daysBetween;
    
    for (let i = 0; i <= daysBetween; i += Math.max(1, Math.floor(daysBetween / 100))) {
      const date = new Date(backtest.startDate);
      date.setDate(date.getDate() + i);
      
      const randomFactor = 1 + (Math.random() - 0.5) * 0.02; // ±1% daily variation
      currentEquity *= (1 + dailyReturn * randomFactor);
      
      equityCurve.push({
        date: date.toISOString(),
        equity: Math.round(currentEquity * 100) / 100,
        drawdown: 0, // Simplified
        returns: dailyReturn * randomFactor
      });
    }

    // Generate summary metrics
    const totalTrades = Math.floor(Math.random() * 100) + 20;
    const winRate = 0.4 + Math.random() * 0.3; // 40-70%
    const winningTrades = Math.floor(totalTrades * winRate);
    const losingTrades = totalTrades - winningTrades;

    return {
      summary: {
        totalReturn: Math.round((finalCapital - backtest.initialCapital) * 100) / 100,
        totalReturnPercent: Math.round(totalReturn * 10000) / 100,
        annualizedReturn: Math.round(totalReturn * (365 / daysBetween) * 10000) / 100,
        sharpeRatio: Math.round((0.5 + Math.random() * 2) * 100) / 100,
        sortinoRatio: Math.round((0.6 + Math.random() * 2.5) * 100) / 100,
        maxDrawdown: Math.round(Math.random() * backtest.initialCapital * 0.3 * 100) / 100,
        maxDrawdownPercent: Math.round(Math.random() * 30 * 100) / 100,
        maxDrawdownDuration: Math.floor(Math.random() * 30) + 1,
        volatility: Math.round((0.1 + Math.random() * 0.4) * 10000) / 100,
        winRate: Math.round(winRate * 10000) / 100,
        profitFactor: Math.round((1 + Math.random() * 2) * 100) / 100,
        totalTrades,
        winningTrades,
        losingTrades,
        avgWin: Math.round((100 + Math.random() * 500) * 100) / 100,
        avgLoss: Math.round((50 + Math.random() * 200) * 100) / 100,
        largestWin: Math.round((500 + Math.random() * 2000) * 100) / 100,
        largestLoss: Math.round((200 + Math.random() * 1000) * 100) / 100,
        avgTradeDuration: Math.round((1 + Math.random() * 10) * 100) / 100,
        finalCapital: Math.round(finalCapital * 100) / 100,
        totalCommission: Math.round(totalTrades * backtest.commission * 100) / 100,
        totalSlippage: Math.round(totalTrades * backtest.slippage * 100) / 100
      },
      equityCurve,
      drawdownCurve: [], // Simplified for now
      trades: [], // Would contain trade IDs
      monthlyReturns: [], // Simplified for now
      riskMetrics: {
        var95: Math.round(Math.random() * 1000 * 100) / 100,
        var99: Math.round(Math.random() * 1500 * 100) / 100,
        cvar95: Math.round(Math.random() * 1200 * 100) / 100,
        cvar99: Math.round(Math.random() * 1800 * 100) / 100,
        beta: Math.round((0.5 + Math.random()) * 100) / 100,
        alpha: Math.round((Math.random() - 0.5) * 0.1 * 10000) / 100,
        informationRatio: Math.round((Math.random() - 0.5) * 2 * 100) / 100,
        calmarRatio: Math.round((0.5 + Math.random() * 2) * 100) / 100,
        sterlingRatio: Math.round((0.4 + Math.random() * 1.8) * 100) / 100
      }
    };
  }
}

module.exports = new BacktestService();