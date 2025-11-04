const Position = require('../models/Position');
const Portfolio = require('../models/Portfolio');
const Trade = require('../models/Trade');
const MarketData = require('../models/MarketData');
const { broadcastToUser } = require('./websocketService');

class PositionService {
  constructor() {
    // Start real-time position updates
    this.startPositionUpdates();
  }

  /**
   * Get all positions for a user
   */
  async getPositions(userId, portfolioId) {
    try {
      const positions = await Position.find({
        userId,
        portfolioId,
        status: 'open'
      }).sort({ createdAt: -1 });

      // Update current prices and P&L
      for (const position of positions) {
        await this.updatePositionPnL(position);
      }

      return positions;
    } catch (error) {
      console.error('Error getting positions:', error);
      throw error;
    }
  }

  /**
   * Get position by ID
   */
  async getPosition(userId, positionId) {
    try {
      const position = await Position.findOne({
        _id: positionId,
        userId,
        status: 'open'
      });

      if (position) {
        await this.updatePositionPnL(position);
      }

      return position;
    } catch (error) {
      console.error('Error getting position:', error);
      throw error;
    }
  }

  /**
   * Close position (full or partial)
   */
  async closePosition(userId, positionId, quantity) {
    try {
      const position = await Position.findOne({
        _id: positionId,
        userId,
        status: 'open'
      });

      if (!position) {
        return { success: false, error: 'Position not found' };
      }

      const closeQuantity = quantity || Math.abs(position.quantity);
      const maxCloseQuantity = Math.abs(position.quantity);

      if (closeQuantity > maxCloseQuantity) {
        return { success: false, error: 'Close quantity exceeds position size' };
      }

      // Get current market price
      const marketData = await MarketData.findOne({ symbol: position.symbol })
        .sort({ timestamp: -1 });
      
      if (!marketData) {
        return { success: false, error: 'Market data not available' };
      }

      const currentPrice = marketData.price;
      const isFullClose = closeQuantity >= maxCloseQuantity;

      // Calculate P&L for the closed portion
      const priceDiff = position.side === 'long' 
        ? currentPrice - position.averagePrice 
        : position.averagePrice - currentPrice;
      const closePnL = closeQuantity * priceDiff;
      const commission = closeQuantity * currentPrice * 0.0001; // 0.01% commission

      // Create closing trade
      const closingTrade = new Trade({
        userId,
        portfolioId: position.portfolioId,
        orderId: null, // Manual close, no order
        symbol: position.symbol,
        side: position.side === 'long' ? 'SELL' : 'BUY',
        quantity: closeQuantity,
        price: currentPrice,
        commission,
        pnl: closePnL - commission,
        executedAt: new Date()
      });

      await closingTrade.save();

      // Update position
      if (isFullClose) {
        position.status = 'closed';
        position.closedAt = new Date();
        position.realizedPnL += closePnL - commission;
      } else {
        // Reduce position size
        const newQuantity = position.side === 'long' 
          ? position.quantity - closeQuantity 
          : position.quantity + closeQuantity;
        
        position.quantity = newQuantity;
        position.realizedPnL += closePnL - commission;
      }

      await position.save();

      // Update portfolio
      await this.updatePortfolioMetrics(position.portfolioId);

      // Broadcast updates
      this.broadcastPositionUpdate(userId, position);

      return { 
        success: true, 
        position, 
        trade: closingTrade,
        pnl: closePnL - commission
      };
    } catch (error) {
      console.error('Error closing position:', error);
      throw error;
    }
  }

  /**
   * Set stop loss for a position
   */
  async setStopLoss(userId, positionId, stopPrice) {
    try {
      const position = await Position.findOne({
        _id: positionId,
        userId,
        status: 'open'
      });

      if (!position) {
        return { success: false, error: 'Position not found' };
      }

      // Validate stop price
      if (position.side === 'long' && stopPrice >= position.currentPrice) {
        return { success: false, error: 'Stop loss must be below current price for long positions' };
      }
      
      if (position.side === 'short' && stopPrice <= position.currentPrice) {
        return { success: false, error: 'Stop loss must be above current price for short positions' };
      }

      position.stopLoss = stopPrice;
      await position.save();

      // Broadcast update
      this.broadcastPositionUpdate(userId, position);

      return { success: true, position };
    } catch (error) {
      console.error('Error setting stop loss:', error);
      throw error;
    }
  }

  /**
   * Set take profit for a position
   */
  async setTakeProfit(userId, positionId, targetPrice) {
    try {
      const position = await Position.findOne({
        _id: positionId,
        userId,
        status: 'open'
      });

      if (!position) {
        return { success: false, error: 'Position not found' };
      }

      // Validate target price
      if (position.side === 'long' && targetPrice <= position.currentPrice) {
        return { success: false, error: 'Take profit must be above current price for long positions' };
      }
      
      if (position.side === 'short' && targetPrice >= position.currentPrice) {
        return { success: false, error: 'Take profit must be below current price for short positions' };
      }

      position.takeProfit = targetPrice;
      await position.save();

      // Broadcast update
      this.broadcastPositionUpdate(userId, position);

      return { success: true, position };
    } catch (error) {
      console.error('Error setting take profit:', error);
      throw error;
    }
  }

  /**
   * Update position P&L with current market price
   */
  async updatePositionPnL(position) {
    try {
      const marketData = await MarketData.findOne({ symbol: position.symbol })
        .sort({ timestamp: -1 });

      if (marketData) {
        await position.updatePnL(marketData.price);
      }

      return position;
    } catch (error) {
      console.error('Error updating position P&L:', error);
      throw error;
    }
  }

  /**
   * Get position history for a user
   */
  async getPositionHistory(userId, portfolioId, options = {}) {
    try {
      const { page = 1, limit = 50, symbol, startDate, endDate } = options;
      
      const query = { userId, portfolioId };
      
      if (symbol) query.symbol = symbol;
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
      }

      const positions = await Position.find(query)
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Position.countDocuments(query);

      return {
        positions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error getting position history:', error);
      throw error;
    }
  }

  /**
   * Get portfolio summary
   */
  async getPortfolioSummary(userId, portfolioId) {
    try {
      const portfolio = await Portfolio.findOne({ _id: portfolioId, userId });
      
      if (!portfolio) {
        return null;
      }

      // Get current positions
      const positions = await this.getPositions(userId, portfolioId);
      
      // Calculate portfolio metrics
      let totalValue = portfolio.cashBalance;
      let totalPnL = 0;
      let dayPnL = 0;
      let totalInvested = 0;

      for (const position of positions) {
        totalValue += Math.abs(position.marketValue);
        totalPnL += position.unrealizedPnL + position.realizedPnL;
        totalInvested += position.costBasis;
        
        // Calculate day P&L (simplified - would need previous day's prices)
        dayPnL += position.unrealizedPnL * 0.1; // Approximate day change
      }

      // Update portfolio
      portfolio.totalValue = totalValue;
      portfolio.totalReturn = totalPnL;
      portfolio.totalReturnPercent = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;
      portfolio.dayChange = dayPnL;
      portfolio.dayChangePercent = totalValue > 0 ? (dayPnL / totalValue) * 100 : 0;
      portfolio.investedAmount = totalInvested;
      portfolio.lastUpdated = new Date();

      await portfolio.save();

      return {
        ...portfolio.toObject(),
        positions,
        metrics: {
          totalPositions: positions.length,
          longPositions: positions.filter(p => p.side === 'long').length,
          shortPositions: positions.filter(p => p.side === 'short').length,
          profitablePositions: positions.filter(p => p.unrealizedPnL > 0).length,
          losingPositions: positions.filter(p => p.unrealizedPnL < 0).length
        }
      };
    } catch (error) {
      console.error('Error getting portfolio summary:', error);
      throw error;
    }
  }

  /**
   * Update portfolio metrics
   */
  async updatePortfolioMetrics(portfolioId) {
    try {
      const portfolio = await Portfolio.findById(portfolioId);
      if (!portfolio) return;

      await portfolio.calculateMetrics();
      
      // Broadcast portfolio update
      this.broadcastPortfolioUpdate(portfolio.userId, portfolio);

      return portfolio;
    } catch (error) {
      console.error('Error updating portfolio metrics:', error);
      throw error;
    }
  }

  /**
   * Start real-time position updates
   */
  startPositionUpdates() {
    setInterval(async () => {
      try {
        // Get all open positions
        const positions = await Position.find({ status: 'open' });

        for (const position of positions) {
          // Update P&L with current market price
          await this.updatePositionPnL(position);

          // Check stop loss and take profit
          await this.checkRiskManagement(position);

          // Broadcast position update
          this.broadcastPositionUpdate(position.userId, position);
        }
      } catch (error) {
        console.error('Error in position updates:', error);
      }
    }, 5000); // Update every 5 seconds
  }

  /**
   * Check risk management (stop loss, take profit)
   */
  async checkRiskManagement(position) {
    try {
      let shouldClose = false;
      let reason = '';

      // Check stop loss
      if (position.stopLoss) {
        const stopTriggered = position.side === 'long' 
          ? position.currentPrice <= position.stopLoss
          : position.currentPrice >= position.stopLoss;
        
        if (stopTriggered) {
          shouldClose = true;
          reason = 'Stop loss triggered';
        }
      }

      // Check take profit
      if (position.takeProfit && !shouldClose) {
        const takeProfitTriggered = position.side === 'long' 
          ? position.currentPrice >= position.takeProfit
          : position.currentPrice <= position.takeProfit;
        
        if (takeProfitTriggered) {
          shouldClose = true;
          reason = 'Take profit triggered';
        }
      }

      // Execute risk management action
      if (shouldClose) {
        await this.closePosition(position.userId, position._id);
        
        // Send notification
        broadcastToUser(position.userId, 'riskManagementTriggered', {
          type: 'RISK_MANAGEMENT_TRIGGERED',
          data: {
            positionId: position._id,
            symbol: position.symbol,
            reason,
            price: position.currentPrice
          }
        });
      }
    } catch (error) {
      console.error('Error checking risk management:', error);
    }
  }

  /**
   * Export positions to CSV
   */
  async exportPositionsToCSV(userId, portfolioId) {
    try {
      const positions = await Position.find({ userId, portfolioId })
        .sort({ createdAt: -1 });
      
      const headers = [
        'Position ID',
        'Symbol',
        'Side',
        'Quantity',
        'Avg Price',
        'Current Price',
        'Market Value',
        'Unrealized P&L',
        'Realized P&L',
        'Total P&L',
        'Commission',
        'Stop Loss',
        'Take Profit',
        'Status',
        'Opened At',
        'Closed At'
      ];

      const rows = positions.map(position => [
        position._id.toString(),
        position.symbol,
        position.side,
        position.quantity.toString(),
        position.averagePrice.toString(),
        position.currentPrice.toString(),
        position.marketValue.toString(),
        position.unrealizedPnL.toString(),
        position.realizedPnL.toString(),
        (position.unrealizedPnL + position.realizedPnL).toString(),
        '0', // Commission would be calculated from trades
        position.stopLoss?.toString() || '',
        position.takeProfit?.toString() || '',
        position.status,
        position.openedAt.toISOString(),
        position.closedAt?.toISOString() || ''
      ]);

      const csvContent = [headers, ...rows]
        .map(row => row.map(cell => `"${cell.toString().replace(/"/g, '""')}"`).join(','))
        .join('\n');

      return csvContent;
    } catch (error) {
      console.error('Error exporting positions to CSV:', error);
      throw error;
    }
  }

  /**
   * Broadcast position update to user
   */
  broadcastPositionUpdate(userId, position) {
    broadcastToUser(userId, 'positionUpdate', {
      type: 'POSITION_UPDATE',
      data: position
    });
  }

  /**
   * Broadcast portfolio update to user
   */
  broadcastPortfolioUpdate(userId, portfolio) {
    broadcastToUser(userId, 'portfolioUpdate', {
      type: 'PORTFOLIO_UPDATE',
      data: portfolio
    });
  }
}

module.exports = new PositionService();