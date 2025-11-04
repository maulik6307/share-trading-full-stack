const express = require('express');
const { protect } = require('../middleware/auth');
const {
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
} = require('../controllers/tradingController');

const router = express.Router();

// Portfolio routes
router.get('/portfolio', protect, getPortfolio);

// Position routes
router.get('/positions', protect, getPositions);
router.post('/positions/:id/close', protect, closePosition);
router.post('/positions/:id/stop-loss', protect, setStopLoss);
router.post('/positions/:id/take-profit', protect, setTakeProfit);
router.get('/positions/export', protect, exportPositions);

// Order routes
router.post('/orders', protect, placeOrder);
router.get('/orders', protect, getOrders);
router.get('/orders/active', protect, getActiveOrders);
router.delete('/orders/:id', protect, cancelOrder);
router.put('/orders/:id', protect, modifyOrder);
router.get('/orders/export', protect, exportOrders);

// Market data routes
router.get('/market-data', protect, getMarketData);
router.get('/market-data/:symbol', protect, getSymbolData);
router.get('/market-data/:symbol/history', protect, getHistoricalData);
router.get('/market-data/:symbol/ohlc', protect, getOHLCData);

module.exports = router;