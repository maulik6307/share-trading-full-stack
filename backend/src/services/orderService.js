const Order = require('../models/Order');
const Trade = require('../models/Trade');
const Position = require('../models/Position');
const Portfolio = require('../models/Portfolio');
const MarketData = require('../models/MarketData');
const { broadcastToUser } = require('./websocketService');

class OrderService {
  constructor() {
    // Start order processing engine
    this.startOrderProcessing();
  }

  /**
   * Place a new order
   */
  async placeOrder(userId, portfolioId, orderData) {
    try {
      // Create order
      const order = new Order({
        userId,
        portfolioId,
        ...orderData,
        remainingQuantity: orderData.quantity,
        status: 'PENDING'
      });

      // Validate order
      const validation = order.validateOrder();
      if (!validation.isValid) {
        order.status = 'REJECTED';
        order.rejectionReason = validation.errors.join(', ');
        await order.save();
        
        // Broadcast order update
        this.broadcastOrderUpdate(userId, order);
        
        return { success: false, order, errors: validation.errors };
      }

      // Check portfolio balance for buy orders
      if (order.side === 'BUY') {
        const portfolio = await Portfolio.findById(portfolioId);
        const orderValue = (order.price || await this.getMarketPrice(order.symbol)) * order.quantity;
        const commission = orderValue * 0.0001; // 0.01% commission
        
        if (portfolio.cashBalance < orderValue + commission) {
          order.status = 'REJECTED';
          order.rejectionReason = 'Insufficient funds';
          await order.save();
          
          this.broadcastOrderUpdate(userId, order);
          return { success: false, order, errors: ['Insufficient funds'] };
        }
      }

      // Save order
      await order.save();

      // Broadcast order update
      this.broadcastOrderUpdate(userId, order);

      // Schedule order processing
      this.scheduleOrderProcessing(order._id);

      return { success: true, order };
    } catch (error) {
      console.error('Error placing order:', error);
      throw error;
    }
  }

  /**
   * Cancel an order
   */
  async cancelOrder(userId, orderId) {
    try {
      const order = await Order.findOne({ _id: orderId, userId });
      
      if (!order) {
        return { success: false, error: 'Order not found' };
      }

      if (order.status !== 'PENDING' && order.status !== 'PARTIALLY_FILLED') {
        return { success: false, error: 'Cannot cancel order with status: ' + order.status };
      }

      await order.cancelOrder();
      
      // Broadcast order update
      this.broadcastOrderUpdate(userId, order);

      return { success: true, order };
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw error;
    }
  }

  /**
   * Modify an order
   */
  async modifyOrder(userId, orderId, updates) {
    try {
      const order = await Order.findOne({ _id: orderId, userId });
      
      if (!order) {
        return { success: false, error: 'Order not found' };
      }

      if (order.status !== 'PENDING' && order.status !== 'PARTIALLY_FILLED') {
        return { success: false, error: 'Cannot modify order with status: ' + order.status };
      }

      // Update allowed fields
      if (updates.price !== undefined) order.price = updates.price;
      if (updates.stopPrice !== undefined) order.stopPrice = updates.stopPrice;
      if (updates.quantity !== undefined && updates.quantity > order.filledQuantity) {
        order.quantity = updates.quantity;
        order.remainingQuantity = updates.quantity - order.filledQuantity;
      }

      // Validate modified order
      const validation = order.validateOrder();
      if (!validation.isValid) {
        return { success: false, errors: validation.errors };
      }

      await order.save();
      
      // Broadcast order update
      this.broadcastOrderUpdate(userId, order);

      return { success: true, order };
    } catch (error) {
      console.error('Error modifying order:', error);
      throw error;
    }
  }

  /**
   * Get orders for a user
   */
  async getOrders(userId, portfolioId, options = {}) {
    try {
      const { status, page = 1, limit = 50 } = options;
      
      const query = { userId, portfolioId };
      if (status) query.status = status;

      const orders = await Order.find(query)
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Order.countDocuments(query);

      return {
        orders,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error getting orders:', error);
      throw error;
    }
  }

  /**
   * Get active orders
   */
  async getActiveOrders(userId, portfolioId) {
    try {
      return await Order.getActiveOrders(userId, portfolioId);
    } catch (error) {
      console.error('Error getting active orders:', error);
      throw error;
    }
  }

  /**
   * Get order history
   */
  async getOrderHistory(userId, portfolioId, options = {}) {
    try {
      return await Order.getOrderHistory(userId, portfolioId, options);
    } catch (error) {
      console.error('Error getting order history:', error);
      throw error;
    }
  }

  /**
   * Get current market price
   */
  async getMarketPrice(symbol) {
    try {
      const marketData = await MarketData.findOne({ symbol: symbol.toUpperCase() })
        .sort({ timestamp: -1 });
      
      return marketData ? marketData.price : 1000; // Default price if not found
    } catch (error) {
      console.error('Error getting market price:', error);
      return 1000; // Default price
    }
  }

  /**
   * Schedule order processing
   */
  scheduleOrderProcessing(orderId) {
    // Process market orders immediately, limit orders with delay
    setTimeout(async () => {
      await this.processOrder(orderId);
    }, Math.random() * 5000 + 1000); // 1-6 seconds delay
  }

  /**
   * Process an order (simulate fills)
   */
  async processOrder(orderId) {
    try {
      const order = await Order.findById(orderId);
      if (!order || order.status !== 'PENDING') return;

      // Get current market price
      const marketPrice = await this.getMarketPrice(order.symbol);
      
      // Determine if order should fill
      let shouldFill = false;
      let fillPrice = marketPrice;

      switch (order.type) {
        case 'MARKET':
          shouldFill = true;
          // Add slippage for market orders
          const slippage = (Math.random() * 0.004 + 0.001) * (order.side === 'BUY' ? 1 : -1);
          fillPrice = marketPrice * (1 + slippage);
          break;
          
        case 'LIMIT':
          if (order.side === 'BUY' && marketPrice <= order.price) {
            shouldFill = true;
            fillPrice = order.price;
          } else if (order.side === 'SELL' && marketPrice >= order.price) {
            shouldFill = true;
            fillPrice = order.price;
          }
          break;
          
        case 'STOP':
          if (order.side === 'BUY' && marketPrice >= order.stopPrice) {
            shouldFill = true;
            fillPrice = marketPrice;
          } else if (order.side === 'SELL' && marketPrice <= order.stopPrice) {
            shouldFill = true;
            fillPrice = marketPrice;
          }
          break;
          
        case 'STOP_LIMIT':
          // Convert to limit order when stop price is hit
          if (order.side === 'BUY' && marketPrice >= order.stopPrice && marketPrice <= order.price) {
            shouldFill = true;
            fillPrice = order.price;
          } else if (order.side === 'SELL' && marketPrice <= order.stopPrice && marketPrice >= order.price) {
            shouldFill = true;
            fillPrice = order.price;
          }
          break;
      }

      if (shouldFill) {
        // Determine fill quantity (full or partial)
        const fillScenario = Math.random();
        let fillQuantity;
        
        if (fillScenario < 0.8) {
          // 80% chance of full fill
          fillQuantity = order.remainingQuantity;
        } else {
          // 20% chance of partial fill
          fillQuantity = Math.floor(order.remainingQuantity * (0.3 + Math.random() * 0.4));
        }

        if (fillQuantity > 0) {
          await this.fillOrder(order, fillQuantity, fillPrice);
        }
      }

      // Schedule next processing attempt if order is still pending
      if (order.status === 'PENDING' || order.status === 'PARTIALLY_FILLED') {
        setTimeout(() => {
          this.processOrder(orderId);
        }, Math.random() * 10000 + 5000); // 5-15 seconds
      }
    } catch (error) {
      console.error('Error processing order:', error);
    }
  }

  /**
   * Fill an order
   */
  async fillOrder(order, fillQuantity, fillPrice) {
    try {
      // Fill the order
      await order.fillOrder(fillQuantity, fillPrice);

      // Create trade record
      const trade = new Trade({
        userId: order.userId,
        portfolioId: order.portfolioId,
        orderId: order._id,
        strategyId: order.strategyId,
        symbol: order.symbol,
        side: order.side,
        quantity: fillQuantity,
        price: fillPrice,
        executedAt: new Date()
      });
      await trade.save();

      // Update or create position
      await this.updatePosition(order, fillQuantity, fillPrice);

      // Update portfolio
      await this.updatePortfolio(order.portfolioId);

      // Broadcast updates
      this.broadcastOrderUpdate(order.userId, order);
      this.broadcastTradeUpdate(order.userId, trade);

    } catch (error) {
      console.error('Error filling order:', error);
      throw error;
    }
  }

  /**
   * Update position after order fill
   */
  async updatePosition(order, fillQuantity, fillPrice) {
    try {
      let position = await Position.findOne({
        userId: order.userId,
        portfolioId: order.portfolioId,
        symbol: order.symbol,
        status: 'open'
      });

      if (!position) {
        // Create new position
        position = new Position({
          userId: order.userId,
          portfolioId: order.portfolioId,
          symbol: order.symbol,
          side: order.side === 'BUY' ? 'long' : 'short',
          quantity: order.side === 'BUY' ? fillQuantity : -fillQuantity,
          averagePrice: fillPrice,
          currentPrice: fillPrice
        });
      } else {
        // Update existing position
        const currentQuantity = position.quantity;
        const currentValue = currentQuantity * position.averagePrice;
        const fillValue = (order.side === 'BUY' ? fillQuantity : -fillQuantity) * fillPrice;
        
        const newQuantity = currentQuantity + (order.side === 'BUY' ? fillQuantity : -fillQuantity);
        
        if (newQuantity === 0) {
          // Position closed
          position.status = 'closed';
          position.closedAt = new Date();
        } else {
          // Update average price
          position.averagePrice = (currentValue + fillValue) / newQuantity;
          position.quantity = newQuantity;
          position.side = newQuantity > 0 ? 'long' : 'short';
        }
      }

      await position.save();
      
      // Broadcast position update
      this.broadcastPositionUpdate(order.userId, position);

    } catch (error) {
      console.error('Error updating position:', error);
      throw error;
    }
  }

  /**
   * Update portfolio after trade
   */
  async updatePortfolio(portfolioId) {
    try {
      const portfolio = await Portfolio.findById(portfolioId);
      if (!portfolio) return;

      // Recalculate portfolio metrics
      await portfolio.calculateMetrics();
      
      // Broadcast portfolio update
      this.broadcastPortfolioUpdate(portfolio.userId, portfolio);

    } catch (error) {
      console.error('Error updating portfolio:', error);
      throw error;
    }
  }

  /**
   * Start background order processing
   */
  startOrderProcessing() {
    setInterval(async () => {
      try {
        // Get all pending orders
        const pendingOrders = await Order.find({
          status: { $in: ['PENDING', 'PARTIALLY_FILLED'] }
        });

        // Process each order
        for (const order of pendingOrders) {
          // Random chance to process (to simulate realistic order processing)
          if (Math.random() < 0.1) { // 10% chance per interval
            await this.processOrder(order._id);
          }
        }
      } catch (error) {
        console.error('Error in background order processing:', error);
      }
    }, 5000); // Check every 5 seconds
  }

  /**
   * Broadcast order update to user
   */
  broadcastOrderUpdate(userId, order) {
    broadcastToUser(userId, 'orderUpdate', {
      type: 'ORDER_UPDATE',
      data: order
    });
  }

  /**
   * Broadcast trade update to user
   */
  broadcastTradeUpdate(userId, trade) {
    broadcastToUser(userId, 'tradeUpdate', {
      type: 'TRADE_UPDATE',
      data: trade
    });
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

  /**
   * Export orders to CSV
   */
  async exportOrdersToCSV(userId, portfolioId) {
    try {
      const orders = await Order.find({ userId, portfolioId }).sort({ createdAt: -1 });
      
      const headers = [
        'Order ID',
        'Symbol',
        'Side',
        'Type',
        'Quantity',
        'Filled Quantity',
        'Price',
        'Avg Fill Price',
        'Status',
        'Commission',
        'Created At',
        'Updated At',
        'Rejection Reason'
      ];

      const rows = orders.map(order => [
        order._id.toString(),
        order.symbol,
        order.side,
        order.type,
        order.quantity.toString(),
        order.filledQuantity.toString(),
        order.price?.toString() || '',
        order.avgFillPrice?.toString() || '',
        order.status,
        order.commission.toString(),
        order.createdAt.toISOString(),
        order.updatedAt.toISOString(),
        order.rejectionReason || ''
      ]);

      const csvContent = [headers, ...rows]
        .map(row => row.map(cell => `"${cell.toString().replace(/"/g, '""')}"`).join(','))
        .join('\n');

      return csvContent;
    } catch (error) {
      console.error('Error exporting orders to CSV:', error);
      throw error;
    }
  }
}

module.exports = new OrderService();