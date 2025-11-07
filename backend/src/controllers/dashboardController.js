const dashboardService = require('../services/dashboardService');
const Activity = require('../models/Activity');
const Alert = require('../models/Alert');
const { validationResult } = require('express-validator');

// @desc    Get complete dashboard data
// @route   GET /api/v1/dashboard
// @access  Private
exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Handle demo user
    if (userId === 'demo-user-1') {
      const demoDashboardData = getDemoDashboardData();
      return res.status(200).json({
        success: true,
        data: demoDashboardData,
        timestamp: new Date().toISOString()
      });
    }
    
    const {
      includePerformance = 'true',
      includeActivities = 'true',
      includeAlerts = 'true',
      performanceDays = '30',
      activitiesLimit = '10',
      alertsLimit = '10'
    } = req.query;

    const options = {
      includePerformance: includePerformance === 'true',
      includeActivities: includeActivities === 'true',
      includeAlerts: includeAlerts === 'true',
      performanceDays: parseInt(performanceDays) || 30,
      activitiesLimit: parseInt(activitiesLimit) || 10,
      alertsLimit: parseInt(alertsLimit) || 10
    };

    const dashboardData = await dashboardService.getDashboardData(userId, options);

    res.status(200).json({
      success: true,
      data: dashboardData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Dashboard fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get KPI data only
// @route   GET /api/v1/dashboard/kpi
// @access  Private
exports.getKPIData = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Handle demo user
    if (userId === 'demo-user-1') {
      const demoData = getDemoDashboardData();
      return res.status(200).json({
        success: true,
        data: demoData.kpi,
        timestamp: new Date().toISOString()
      });
    }
    
    const portfolio = await dashboardService.getUserMainPortfolio(userId);
    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found'
      });
    }

    const kpiData = await dashboardService.getKPIData(userId, portfolio._id);

    res.status(200).json({
      success: true,
      data: kpiData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('KPI data fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch KPI data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get performance chart data
// @route   GET /api/v1/dashboard/performance
// @access  Private
exports.getPerformanceData = async (req, res) => {
  try {
    const userId = req.user.id;
    const { days = '30' } = req.query;
    
    // Handle demo user
    if (userId === 'demo-user-1') {
      const demoData = getDemoDashboardData();
      return res.status(200).json({
        success: true,
        data: demoData.performance,
        timestamp: new Date().toISOString()
      });
    }
    
    const portfolio = await dashboardService.getUserMainPortfolio(userId);
    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found'
      });
    }

    const performanceData = await dashboardService.getPerformanceData(
      userId, 
      portfolio._id, 
      parseInt(days) || 30
    );

    res.status(200).json({
      success: true,
      data: performanceData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Performance data fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch performance data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get recent activities
// @route   GET /api/v1/dashboard/activities
// @access  Private
exports.getActivities = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      limit = '10', 
      offset = '0',
      type,
      status 
    } = req.query;

    // Handle demo user
    if (userId === 'demo-user-1') {
      const demoData = getDemoDashboardData();
      return res.status(200).json({
        success: true,
        data: demoData.activities,
        pagination: {
          total: demoData.activities.length,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: false
        },
        timestamp: new Date().toISOString()
      });
    }

    const query = { userId };
    if (type) query.type = type;
    if (status) query.status = status;

    const activities = await Activity.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .populate('portfolioId', 'name')
      .populate('strategyId', 'name')
      .lean();

    const total = await Activity.countDocuments(query);

    res.status(200).json({
      success: true,
      data: activities,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: total > parseInt(offset) + parseInt(limit)
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Activities fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activities',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get alerts
// @route   GET /api/v1/dashboard/alerts
// @access  Private
exports.getAlerts = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      limit = '10', 
      offset = '0',
      type,
      priority,
      unreadOnly = 'false'
    } = req.query;

    // Handle demo user
    if (userId === 'demo-user-1') {
      const demoData = getDemoDashboardData();
      const unreadCount = demoData.alerts.filter(a => !a.isRead).length;
      
      return res.status(200).json({
        success: true,
        data: demoData.alerts,
        meta: {
          unreadCount
        },
        pagination: {
          total: demoData.alerts.length,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: false
        },
        timestamp: new Date().toISOString()
      });
    }

    const query = { 
      userId,
      isDismissed: false,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } }
      ]
    };
    
    if (type) query.type = type;
    if (priority) query.priority = priority;
    if (unreadOnly === 'true') query.isRead = false;

    const alerts = await Alert.find(query)
      .sort({ priority: -1, timestamp: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .populate('portfolioId', 'name')
      .populate('strategyId', 'name')
      .lean();

    const total = await Alert.countDocuments(query);
    const unreadCount = await Alert.countDocuments({ ...query, isRead: false });

    res.status(200).json({
      success: true,
      data: alerts,
      meta: {
        unreadCount
      },
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: total > parseInt(offset) + parseInt(limit)
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Alerts fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch alerts',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Mark alert as read
// @route   PUT /api/v1/dashboard/alerts/:id/read
// @access  Private
exports.markAlertAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const alertId = req.params.id;

    const alert = await Alert.findOne({ _id: alertId, userId });
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    await alert.markAsRead();

    res.status(200).json({
      success: true,
      message: 'Alert marked as read',
      data: alert
    });
  } catch (error) {
    console.error('Mark alert as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark alert as read',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Dismiss alert
// @route   DELETE /api/v1/dashboard/alerts/:id
// @access  Private
exports.dismissAlert = async (req, res) => {
  try {
    const userId = req.user.id;
    const alertId = req.params.id;

    const alert = await Alert.findOne({ _id: alertId, userId });
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    await alert.dismiss();

    res.status(200).json({
      success: true,
      message: 'Alert dismissed'
    });
  } catch (error) {
    console.error('Dismiss alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to dismiss alert',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get dashboard stats summary
// @route   GET /api/v1/dashboard/stats
// @access  Private
exports.getStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const [
      totalActivities,
      unreadAlerts,
      portfolio
    ] = await Promise.all([
      Activity.countDocuments({ userId }),
      Alert.countDocuments({ userId, isRead: false, isDismissed: false }),
      dashboardService.getUserMainPortfolio(userId)
    ]);

    const stats = {
      totalActivities,
      unreadAlerts,
      portfolioValue: portfolio ? portfolio.totalValue : 100000,
      lastUpdated: portfolio ? portfolio.lastUpdated : new Date()
    };

    res.status(200).json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stats',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Helper function to generate demo dashboard data
function getDemoDashboardData() {
  const today = new Date();
  const performanceData = [];
  
  // Generate 30 days of performance data
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const baseValue = 100000;
    const randomVariation = Math.sin(i / 5) * 5000 + Math.random() * 2000;
    
    performanceData.push({
      date: date.toISOString().split('T')[0],
      value: Math.round(baseValue + randomVariation + (i * 100)),
      benchmark: Math.round(baseValue + randomVariation * 0.8 + (i * 80))
    });
  }
  
  return {
    portfolio: {
      id: 'demo-portfolio-1',
      name: 'Demo Portfolio',
      totalValue: 103500,
      currency: 'INR',
      lastUpdated: new Date()
    },
    kpi: {
      portfolioValue: {
        current: 103500,
        change: { value: 2.5, period: 'today', isPositive: true }
      },
      roi30d: {
        current: 3.5,
        change: { value: 0.8, period: 'vs last month', isPositive: true }
      },
      activeStrategies: {
        current: 3,
        profitable: 2,
        description: '2 profitable'
      },
      openPositions: {
        current: 5,
        profitable: 3,
        description: '3 in profit'
      },
      totalReturn: {
        current: 3500,
        change: { value: 3.5, period: 'all time', isPositive: true }
      },
      winRate: {
        current: 65.5,
        change: { value: 2.1, period: '30d avg', isPositive: true }
      }
    },
    performance: performanceData,
    activities: [
      {
        _id: 'activity-1',
        type: 'trade',
        action: 'BUY',
        symbol: 'RELIANCE',
        quantity: 10,
        price: 2450.50,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        status: 'completed',
        description: 'Bought 10 shares of RELIANCE at ₹2,450.50'
      },
      {
        _id: 'activity-2',
        type: 'trade',
        action: 'SELL',
        symbol: 'TCS',
        quantity: 5,
        price: 3650.00,
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
        status: 'completed',
        description: 'Sold 5 shares of TCS at ₹3,650.00'
      },
      {
        _id: 'activity-3',
        type: 'strategy',
        action: 'STARTED',
        strategyName: 'Moving Average Crossover',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        status: 'active',
        description: 'Started strategy: Moving Average Crossover'
      },
      {
        _id: 'activity-4',
        type: 'backtest',
        action: 'COMPLETED',
        strategyName: 'RSI Momentum',
        timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000),
        status: 'completed',
        description: 'Backtest completed for RSI Momentum strategy'
      }
    ],
    alerts: [
      {
        _id: 'alert-1',
        type: 'price',
        priority: 'high',
        title: 'Price Alert: INFY',
        message: 'INFY has reached your target price of ₹1,500',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        isRead: false,
        isDismissed: false
      },
      {
        _id: 'alert-2',
        type: 'risk',
        priority: 'medium',
        title: 'Risk Alert',
        message: 'Portfolio exposure to IT sector exceeds 40%',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        isRead: false,
        isDismissed: false
      },
      {
        _id: 'alert-3',
        type: 'strategy',
        priority: 'low',
        title: 'Strategy Update',
        message: 'Moving Average Crossover generated a new signal',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        isRead: true,
        isDismissed: false
      }
    ]
  };
}

module.exports = exports;