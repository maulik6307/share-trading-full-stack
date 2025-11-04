const orderService = require('../services/orderService');
const positionService = require('../services/positionService');
const marketDataService = require('../services/marketDataService');
const Portfolio = require('../models/Portfolio');

// @desc    Get user portfolio
// @route   GET /api/v1/trading/portfolio
// @access  Private
const getPortfolio = async (req, res) => {
  try {
    // Get or create user's portfolio
    let portfolio = await Portfolio.findOne({ 
      userId: req.user.id, 
      isActive: true 
    });

    if (!portfolio) {
      // Create default portfolio
      portfolio = new Portfolio({
        userId: req.user.id,
        name: 'Main Portfolio',
        cashBalance: 1000000, // 10 lakh starting balance
        totalValue: 1000000,
        isPaperTrading: true
      });
      await portfolio.save();
    }

    // Get portfolio summary with positions
    const portfolioSummary = await positionService.getPortfolioSummary(
      req.user.id, 
      portfolio._id
    );

    res.status(200).json({
      success: true,
      data: portfolioSummary || portfolio
    });
  } catch (error) {
    console.error('Error getting portfolio:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving portfolio',
      error: error.message
    });
  }
};

// @desc    Get user positions
// @route   GET /api/v1/trading/positions
// @access  Private
const getPositions = async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ 
      userId: req.user.id, 
      isActive: true 
    });

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found'
      });
    }

    const positions = await positionService.getPositions(req.user.id, portfolio._id);

    res.status(200).json({
      success: true,
      data: positions
    });
  } catch (error) {
    console.error('Error getting positions:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving positions',
      error: error.message
    });
  }
};

// @desc    Close position
// @route   POST /api/v1/trading/positions/:id/close
// @access  Private
const closePosition = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    const result = await positionService.closePosition(req.user.id, id, quantity);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.status(200).json({
      success: true,
      message: 'Position closed successfully',
      data: {
        position: result.position,
        trade: result.trade,
        pnl: result.pnl
      }
    });
  } catch (error) {
    console.error('Error closing position:', error);
    res.status(500).json({
      success: false,
      message: 'Error closing position',
      error: error.message
    });
  }
};

// @desc    Set stop loss
// @route   POST /api/v1/trading/positions/:id/stop-loss
// @access  Private
const setStopLoss = async (req, res) => {
  try {
    const { id } = req.params;
    const { stopPrice } = req.body;

    if (!stopPrice || stopPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid stop price is required'
      });
    }

    const result = await positionService.setStopLoss(req.user.id, id, stopPrice);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.status(200).json({
      success: true,
      message: 'Stop loss set successfully',
      data: result.position
    });
  } catch (error) {
    console.error('Error setting stop loss:', error);
    res.status(500).json({
      success: false,
      message: 'Error setting stop loss',
      error: error.message
    });
  }
};

// @desc    Set take profit
// @route   POST /api/v1/trading/positions/:id/take-profit
// @access  Private
const setTakeProfit = async (req, res) => {
  try {
    const { id } = req.params;
    const { targetPrice } = req.body;

    if (!targetPrice || targetPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid target price is required'
      });
    }

    const result = await positionService.setTakeProfit(req.user.id, id, targetPrice);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.status(200).json({
      success: true,
      message: 'Take profit set successfully',
      data: result.position
    });
  } catch (error) {
    console.error('Error setting take profit:', error);
    res.status(500).json({
      success: false,
      message: 'Error setting take profit',
      error: error.message
    });
  }
};

// @desc    Place order
// @route   POST /api/v1/trading/orders
// @access  Private
const placeOrder = async (req, res) => {
  try {
    const { symbol, side, type, quantity, price, stopPrice, strategyId } = req.body;

    // Validate required fields
    if (!symbol || !side || !type || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'Symbol, side, type, and quantity are required'
      });
    }

    const portfolio = await Portfolio.findOne({ 
      userId: req.user.id, 
      isActive: true 
    });

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found'
      });
    }

    const orderData = {
      symbol: symbol.toUpperCase(),
      side,
      type,
      quantity,
      price,
      stopPrice,
      strategyId
    };

    const result = await orderService.placeOrder(req.user.id, portfolio._id, orderData);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: 'Order rejected',
        errors: result.errors,
        data: result.order
      });
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: result.order
    });
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({
      success: false,
      message: 'Error placing order',
      error: error.message
    });
  }
};

// @desc    Get orders
// @route   GET /api/v1/trading/orders
// @access  Private
const getOrders = async (req, res) => {
  try {
    const { status, page, limit } = req.query;

    const portfolio = await Portfolio.findOne({ 
      userId: req.user.id, 
      isActive: true 
    });

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found'
      });
    }

    const result = await orderService.getOrders(req.user.id, portfolio._id, {
      status,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 50
    });

    res.status(200).json({
      success: true,
      data: result.orders,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Error getting orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving orders',
      error: error.message
    });
  }
};

// @desc    Get active orders
// @route   GET /api/v1/trading/orders/active
// @access  Private
const getActiveOrders = async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ 
      userId: req.user.id, 
      isActive: true 
    });

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found'
      });
    }

    const orders = await orderService.getActiveOrders(req.user.id, portfolio._id);

    res.status(200).json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Error getting active orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving active orders',
      error: error.message
    });
  }
};

// @desc    Cancel order
// @route   DELETE /api/v1/trading/orders/:id
// @access  Private
const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await orderService.cancelOrder(req.user.id, id);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: result.order
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling order',
      error: error.message
    });
  }
};

// @desc    Modify order
// @route   PUT /api/v1/trading/orders/:id
// @access  Private
const modifyOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { price, quantity, stopPrice } = req.body;

    const result = await orderService.modifyOrder(req.user.id, id, {
      price,
      quantity,
      stopPrice
    });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error || 'Failed to modify order',
        errors: result.errors
      });
    }

    res.status(200).json({
      success: true,
      message: 'Order modified successfully',
      data: result.order
    });
  } catch (error) {
    console.error('Error modifying order:', error);
    res.status(500).json({
      success: false,
      message: 'Error modifying order',
      error: error.message
    });
  }
};

// @desc    Get market data
// @route   GET /api/v1/trading/market-data
// @access  Private
const getMarketData = async (req, res) => {
  try {
    const { symbols } = req.query;
    
    let symbolList = [];
    if (symbols) {
      symbolList = symbols.split(',').map(s => s.trim().toUpperCase());
    }

    const marketData = await marketDataService.getLatestData(symbolList);

    res.status(200).json({
      success: true,
      data: marketData
    });
  } catch (error) {
    console.error('Error getting market data:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving market data',
      error: error.message
    });
  }
};

// @desc    Get symbol data
// @route   GET /api/v1/trading/market-data/:symbol
// @access  Private
const getSymbolData = async (req, res) => {
  try {
    const { symbol } = req.params;
    
    const marketData = await marketDataService.getSymbolData(symbol);

    if (!marketData) {
      return res.status(404).json({
        success: false,
        message: 'Symbol not found'
      });
    }

    res.status(200).json({
      success: true,
      data: marketData
    });
  } catch (error) {
    console.error('Error getting symbol data:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving symbol data',
      error: error.message
    });
  }
};

// @desc    Get historical data
// @route   GET /api/v1/trading/market-data/:symbol/history
// @access  Private
const getHistoricalData = async (req, res) => {
  try {
    const { symbol } = req.params;
    const { startDate, endDate, interval } = req.query;

    const historicalData = await marketDataService.getHistoricalData(
      symbol, 
      startDate, 
      endDate, 
      interval
    );

    res.status(200).json({
      success: true,
      data: historicalData
    });
  } catch (error) {
    console.error('Error getting historical data:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving historical data',
      error: error.message
    });
  }
};

// @desc    Get OHLC data for charting
// @route   GET /api/v1/trading/market-data/:symbol/ohlc
// @access  Private
const getOHLCData = async (req, res) => {
  try {
    const { symbol } = req.params;
    const { period, count } = req.query;

    const ohlcData = await marketDataService.generateOHLCData(
      symbol, 
      period || '1d', 
      parseInt(count) || 100
    );

    res.status(200).json({
      success: true,
      data: ohlcData
    });
  } catch (error) {
    console.error('Error getting OHLC data:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving OHLC data',
      error: error.message
    });
  }
};

// @desc    Export orders to CSV
// @route   GET /api/v1/trading/orders/export
// @access  Private
const exportOrders = async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ 
      userId: req.user.id, 
      isActive: true 
    });

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found'
      });
    }

    const csvContent = await orderService.exportOrdersToCSV(req.user.id, portfolio._id);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=orders-${new Date().toISOString().split('T')[0]}.csv`);
    res.status(200).send(csvContent);
  } catch (error) {
    console.error('Error exporting orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting orders',
      error: error.message
    });
  }
};

// @desc    Export positions to CSV
// @route   GET /api/v1/trading/positions/export
// @access  Private
const exportPositions = async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ 
      userId: req.user.id, 
      isActive: true 
    });

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found'
      });
    }

    const csvContent = await positionService.exportPositionsToCSV(req.user.id, portfolio._id);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=positions-${new Date().toISOString().split('T')[0]}.csv`);
    res.status(200).send(csvContent);
  } catch (error) {
    console.error('Error exporting positions:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting positions',
      error: error.message
    });
  }
};

module.exports = {
  getPortfolio,
  getPositions,
  closePosition,
  setStopLoss,
  setTakeProfit,
  placeOrder,
  getOrders,
  getActiveOrders,
  cancelOrder,
  modifyOrder,
  getMarketData,
  getSymbolData,
  getHistoricalData,
  getOHLCData,
  exportOrders,
  exportPositions
};