const Portfolio = require('../models/Portfolio');
const PortfolioHistory = require('../models/PortfolioHistory');
const Position = require('../models/Position');
const Activity = require('../models/Activity');
const Alert = require('../models/Alert');
const User = require('../models/User');

/**
 * Seed dashboard data for a user
 */
async function seedDashboardData(userId) {
  try {
    console.log('Seeding dashboard data for user:', userId);

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Create portfolio if it doesn't exist
    let portfolio = await Portfolio.findOne({ userId, isActive: true });
    if (!portfolio) {
      portfolio = new Portfolio({
        userId,
        name: 'Main Portfolio',
        totalValue: 112450,
        cashBalance: 45230,
        investedAmount: 67220,
        totalReturn: 12450,
        totalReturnPercent: 12.45,
        dayChange: 1250,
        dayChangePercent: 1.12,
        currency: 'USD',
        isPaperTrading: true
      });
      await portfolio.save();
      console.log('✅ Portfolio created');
    }

    // Create portfolio history (30 days)
    const existingHistory = await PortfolioHistory.countDocuments({ portfolioId: portfolio._id });
    if (existingHistory === 0) {
      const historyData = [];
      const baseValue = 100000;
      
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        
        // Generate realistic growth with volatility
        const growth = ((29 - i) / 29) * 0.124; // 12.4% growth over 30 days
        const volatility = (Math.random() - 0.5) * 0.02; // ±1% daily volatility
        const totalValue = Math.round(baseValue * (1 + growth + volatility));
        const benchmarkValue = Math.round(baseValue * (1 + ((29 - i) / 29) * 0.08)); // 8% benchmark
        
        historyData.push({
          userId,
          portfolioId: portfolio._id,
          date,
          totalValue,
          cashBalance: Math.round(totalValue * 0.4),
          investedAmount: Math.round(totalValue * 0.6),
          benchmarkValue,
          dayChange: i === 29 ? 0 : Math.round((Math.random() - 0.5) * 2000),
          dayChangePercent: i === 29 ? 0 : (Math.random() - 0.5) * 2,
          totalReturn: totalValue - baseValue,
          totalReturnPercent: ((totalValue - baseValue) / baseValue) * 100,
          snapshotType: 'daily'
        });
      }
      
      await PortfolioHistory.insertMany(historyData);
      console.log('✅ Portfolio history created (30 days)');
    }

    // Create sample positions
    const existingPositions = await Position.countDocuments({ portfolioId: portfolio._id });
    if (existingPositions === 0) {
      const positions = [
        {
          userId,
          portfolioId: portfolio._id,
          symbol: 'AAPL',
          side: 'long',
          quantity: 50,
          averagePrice: 175.50,
          currentPrice: 182.30,
          status: 'open'
        },
        {
          userId,
          portfolioId: portfolio._id,
          symbol: 'MSFT',
          side: 'long',
          quantity: 30,
          averagePrice: 420.00,
          currentPrice: 425.80,
          status: 'open'
        },
        {
          userId,
          portfolioId: portfolio._id,
          symbol: 'GOOGL',
          side: 'long',
          quantity: 15,
          averagePrice: 2850.00,
          currentPrice: 2920.50,
          status: 'open'
        },
        {
          userId,
          portfolioId: portfolio._id,
          symbol: 'TSLA',
          side: 'long',
          quantity: 25,
          averagePrice: 245.00,
          currentPrice: 238.90,
          status: 'open'
        },
        {
          userId,
          portfolioId: portfolio._id,
          symbol: 'NVDA',
          side: 'long',
          quantity: 20,
          averagePrice: 890.00,
          currentPrice: 925.40,
          status: 'open'
        }
      ];

      // Calculate P&L for each position
      positions.forEach(pos => {
        if (pos.side === 'long') {
          pos.unrealizedPnL = (pos.currentPrice - pos.averagePrice) * pos.quantity;
        } else {
          pos.unrealizedPnL = (pos.averagePrice - pos.currentPrice) * pos.quantity;
        }
        pos.unrealizedPnLPercent = (pos.unrealizedPnL / (pos.averagePrice * pos.quantity)) * 100;
      });

      await Position.insertMany(positions);
      console.log('✅ Sample positions created');
    }

    // Create sample activities
    const existingActivities = await Activity.countDocuments({ userId });
    if (existingActivities === 0) {
      const activities = [
        {
          userId,
          portfolioId: portfolio._id,
          type: 'trade',
          action: 'sell',
          title: 'Position Closed',
          description: 'Sold AAPL position with +5.2% profit',
          status: 'success',
          symbol: 'AAPL',
          amount: 2840,
          quantity: 20,
          price: 182.30,
          timestamp: new Date(Date.now() - 15 * 60 * 1000),
          metadata: { profit: 284 }
        },
        {
          userId,
          portfolioId: portfolio._id,
          type: 'strategy',
          action: 'deploy',
          title: 'Strategy Deployed',
          description: 'MA Crossover strategy started paper trading',
          status: 'success',
          timestamp: new Date(Date.now() - 45 * 60 * 1000),
          metadata: { strategyName: 'MA Crossover v2.1' }
        },
        {
          userId,
          portfolioId: portfolio._id,
          type: 'trade',
          action: 'buy',
          title: 'Order Filled',
          description: 'Bought 100 shares of MSFT at $420.50',
          status: 'info',
          symbol: 'MSFT',
          amount: 42050,
          quantity: 100,
          price: 420.50,
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
        },
        {
          userId,
          portfolioId: portfolio._id,
          type: 'alert',
          action: 'risk_alert',
          title: 'Risk Alert',
          description: 'Portfolio drawdown exceeded 5% threshold',
          status: 'warning',
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000)
        },
        {
          userId,
          portfolioId: portfolio._id,
          type: 'trade',
          action: 'stop_loss',
          title: 'Stop Loss Triggered',
          description: 'TSLA position closed at -2.1% loss',
          status: 'warning',
          symbol: 'TSLA',
          amount: -1250,
          quantity: 15,
          price: 238.90,
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
          metadata: { loss: -125 }
        }
      ];

      await Activity.insertMany(activities);
      console.log('✅ Sample activities created');
    }

    // Create sample alerts
    const existingAlerts = await Alert.countDocuments({ userId });
    if (existingAlerts === 0) {
      const alerts = [
        {
          userId,
          portfolioId: portfolio._id,
          type: 'warning',
          category: 'risk',
          title: 'High Volatility Detected',
          message: 'NVDA showing unusual price movements. Consider reviewing position size.',
          priority: 'high',
          isActionable: true,
          symbol: 'NVDA',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          metadata: { volatility: 15.2 }
        },
        {
          userId,
          portfolioId: portfolio._id,
          type: 'info',
          category: 'performance',
          title: 'Strategy Performance Update',
          message: 'Momentum Strategy has outperformed benchmark by 3.2% this week.',
          priority: 'medium',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          metadata: { strategyId: 'momentum-v1', outperformance: 3.2 }
        },
        {
          userId,
          portfolioId: portfolio._id,
          type: 'success',
          category: 'performance',
          title: 'Monthly Goal Achieved',
          message: 'Congratulations! You\'ve reached your 10% monthly return target.',
          priority: 'medium',
          isRead: true,
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000)
        },
        {
          userId,
          portfolioId: portfolio._id,
          type: 'warning',
          category: 'position',
          title: 'Position Size Alert',
          message: 'AAPL position now represents 15% of portfolio. Consider rebalancing.',
          priority: 'medium',
          isActionable: true,
          symbol: 'AAPL',
          isRead: true,
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
          metadata: { positionSize: 15.2 }
        },
        {
          userId,
          portfolioId: portfolio._id,
          type: 'error',
          category: 'strategy',
          title: 'Strategy Error',
          message: 'Arbitrage Strategy encountered an error and has been paused.',
          priority: 'critical',
          isActionable: true,
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
          metadata: { strategyId: 'arbitrage-v2', errorCode: 'CONN_TIMEOUT' }
        }
      ];

      await Alert.insertMany(alerts);
      console.log('✅ Sample alerts created');
    }

    console.log('🎉 Dashboard data seeding completed successfully!');
    return {
      success: true,
      message: 'Dashboard data seeded successfully',
      portfolioId: portfolio._id
    };

  } catch (error) {
    console.error('❌ Dashboard data seeding failed:', error);
    throw error;
  }
}

/**
 * Seed data for all users (for testing)
 */
async function seedAllUsersDashboardData() {
  try {
    const users = await User.find({ isActive: true }).limit(10);
    
    for (const user of users) {
      await seedDashboardData(user._id);
    }
    
    console.log(`🎉 Seeded dashboard data for ${users.length} users`);
  } catch (error) {
    console.error('❌ Failed to seed dashboard data for all users:', error);
    throw error;
  }
}

module.exports = {
  seedDashboardData,
  seedAllUsersDashboardData
};