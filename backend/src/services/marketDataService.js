const MarketData = require('../models/MarketData');
const { broadcastMarketData } = require('./websocketService');

class MarketDataService {
  constructor() {
    this.symbols = [
      'RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK', 
      'HINDUNILVR', 'ITC', 'SBIN', 'BHARTIARTL', 'KOTAKBANK',
      'LT', 'ASIANPAINT', 'MARUTI', 'AXISBANK', 'NESTLEIND'
    ];
    
    // Initialize market data
    this.initializeMarketData();
    
    // Start real-time price simulation
    this.startPriceSimulation();
  }

  /**
   * Initialize market data for symbols
   */
  async initializeMarketData() {
    try {
      for (const symbol of this.symbols) {
        const existing = await MarketData.findOne({ symbol });
        
        if (!existing) {
          // Create initial market data
          const basePrice = Math.random() * 3000 + 500; // Random price between 500-3500
          
          const marketData = new MarketData({
            symbol,
            price: basePrice,
            open: basePrice * (0.98 + Math.random() * 0.04), // ±2% from current
            high: basePrice * (1 + Math.random() * 0.03), // Up to 3% higher
            low: basePrice * (1 - Math.random() * 0.03), // Up to 3% lower
            previousClose: basePrice * (0.99 + Math.random() * 0.02), // ±1% from current
            volume: Math.floor(Math.random() * 1000000) + 100000, // 100K-1M volume
            avgVolume: Math.floor(Math.random() * 800000) + 200000,
            bid: basePrice * 0.999,
            ask: basePrice * 1.001,
            bidSize: Math.floor(Math.random() * 1000) + 100,
            askSize: Math.floor(Math.random() * 1000) + 100,
            volatility: Math.random() * 0.03 + 0.01, // 1-4% volatility
            marketCap: Math.floor(Math.random() * 500000) + 50000, // 50K-550K crores
            pe: Math.random() * 30 + 10, // P/E ratio 10-40
            eps: Math.random() * 100 + 10, // EPS 10-110
            week52High: basePrice * (1.1 + Math.random() * 0.4), // 10-50% higher
            week52Low: basePrice * (0.6 + Math.random() * 0.3), // 30-40% lower
            isMarketOpen: true
          });
          
          await marketData.save();
          console.log(`Initialized market data for ${symbol}`);
        }
      }
    } catch (error) {
      console.error('Error initializing market data:', error);
    }
  }

  /**
   * Get latest market data for symbols
   */
  async getLatestData(symbols) {
    try {
      if (!symbols || symbols.length === 0) {
        symbols = this.symbols;
      }
      
      return await MarketData.getLatestData(symbols);
    } catch (error) {
      console.error('Error getting latest market data:', error);
      throw error;
    }
  }

  /**
   * Get market data for a specific symbol
   */
  async getSymbolData(symbol) {
    try {
      return await MarketData.findOne({ symbol: symbol.toUpperCase() })
        .sort({ timestamp: -1 });
    } catch (error) {
      console.error('Error getting symbol data:', error);
      throw error;
    }
  }

  /**
   * Get historical data for a symbol
   */
  async getHistoricalData(symbol, startDate, endDate, interval = '1d') {
    try {
      return await MarketData.getHistoricalData(symbol, startDate, endDate, interval);
    } catch (error) {
      console.error('Error getting historical data:', error);
      throw error;
    }
  }

  /**
   * Update market data for a symbol
   */
  async updateMarketData(symbol, data) {
    try {
      const updatedData = await MarketData.updateMarketData(symbol, data);
      
      // Broadcast update to WebSocket clients
      broadcastMarketData(symbol, updatedData);
      
      return updatedData;
    } catch (error) {
      console.error('Error updating market data:', error);
      throw error;
    }
  }

  /**
   * Start real-time price simulation
   */
  startPriceSimulation() {
    setInterval(async () => {
      try {
        // Update prices for all symbols
        for (const symbol of this.symbols) {
          const marketData = await MarketData.findOne({ symbol })
            .sort({ timestamp: -1 });
          
          if (marketData && marketData.isMarketOpen) {
            await marketData.simulatePriceMovement();
            
            // Broadcast update
            broadcastMarketData(symbol, {
              symbol: marketData.symbol,
              price: marketData.price,
              change: marketData.change,
              changePercent: marketData.changePercent,
              volume: marketData.volume,
              high: marketData.high,
              low: marketData.low,
              bid: marketData.bid,
              ask: marketData.ask,
              timestamp: marketData.timestamp
            });
          }
        }
      } catch (error) {
        console.error('Error in price simulation:', error);
      }
    }, 2000); // Update every 2 seconds
  }

  /**
   * Get market status
   */
  async getMarketStatus() {
    try {
      const now = new Date();
      const hour = now.getHours();
      const day = now.getDay();
      
      // Simple market hours: Monday-Friday, 9 AM - 3:30 PM IST
      const isMarketOpen = day >= 1 && day <= 5 && hour >= 9 && hour < 15.5;
      
      return {
        isOpen: isMarketOpen,
        nextOpen: this.getNextMarketOpen(),
        nextClose: this.getNextMarketClose(),
        timezone: 'IST'
      };
    } catch (error) {
      console.error('Error getting market status:', error);
      throw error;
    }
  }

  /**
   * Get next market open time
   */
  getNextMarketOpen() {
    const now = new Date();
    const nextOpen = new Date(now);
    
    // Set to 9 AM
    nextOpen.setHours(9, 0, 0, 0);
    
    // If it's past 9 AM today, move to next weekday
    if (now.getHours() >= 9 || now.getDay() === 0 || now.getDay() === 6) {
      nextOpen.setDate(nextOpen.getDate() + 1);
      
      // Skip weekends
      while (nextOpen.getDay() === 0 || nextOpen.getDay() === 6) {
        nextOpen.setDate(nextOpen.getDate() + 1);
      }
    }
    
    return nextOpen;
  }

  /**
   * Get next market close time
   */
  getNextMarketClose() {
    const now = new Date();
    const nextClose = new Date(now);
    
    // Set to 3:30 PM
    nextClose.setHours(15, 30, 0, 0);
    
    // If it's past 3:30 PM today or weekend, move to next weekday
    if (now.getHours() >= 15.5 || now.getDay() === 0 || now.getDay() === 6) {
      nextClose.setDate(nextClose.getDate() + 1);
      
      // Skip weekends
      while (nextClose.getDay() === 0 || nextClose.getDay() === 6) {
        nextClose.setDate(nextClose.getDate() + 1);
      }
    }
    
    return nextClose;
  }

  /**
   * Search symbols
   */
  async searchSymbols(query) {
    try {
      const regex = new RegExp(query, 'i');
      
      return await MarketData.find({
        $or: [
          { symbol: regex }
        ]
      })
      .sort({ symbol: 1 })
      .limit(20)
      .select('symbol price change changePercent volume');
    } catch (error) {
      console.error('Error searching symbols:', error);
      throw error;
    }
  }

  /**
   * Get top gainers
   */
  async getTopGainers(limit = 10) {
    try {
      return await MarketData.find({ changePercent: { $gt: 0 } })
        .sort({ changePercent: -1 })
        .limit(limit)
        .select('symbol price change changePercent volume');
    } catch (error) {
      console.error('Error getting top gainers:', error);
      throw error;
    }
  }

  /**
   * Get top losers
   */
  async getTopLosers(limit = 10) {
    try {
      return await MarketData.find({ changePercent: { $lt: 0 } })
        .sort({ changePercent: 1 })
        .limit(limit)
        .select('symbol price change changePercent volume');
    } catch (error) {
      console.error('Error getting top losers:', error);
      throw error;
    }
  }

  /**
   * Get most active stocks by volume
   */
  async getMostActive(limit = 10) {
    try {
      return await MarketData.find({})
        .sort({ volume: -1 })
        .limit(limit)
        .select('symbol price change changePercent volume');
    } catch (error) {
      console.error('Error getting most active stocks:', error);
      throw error;
    }
  }

  /**
   * Generate OHLC data for charting
   */
  async generateOHLCData(symbol, period = '1d', count = 100) {
    try {
      const marketData = await this.getSymbolData(symbol);
      if (!marketData) return [];

      const ohlcData = [];
      const basePrice = marketData.price;
      const volatility = marketData.volatility || 0.02;

      for (let i = count - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);

        // Generate realistic OHLC data
        const open = basePrice * (0.95 + Math.random() * 0.1);
        const close = open * (0.98 + Math.random() * 0.04);
        const high = Math.max(open, close) * (1 + Math.random() * volatility);
        const low = Math.min(open, close) * (1 - Math.random() * volatility);
        const volume = Math.floor(Math.random() * 1000000) + 100000;

        ohlcData.push({
          date: date.toISOString(),
          open: Math.round(open * 100) / 100,
          high: Math.round(high * 100) / 100,
          low: Math.round(low * 100) / 100,
          close: Math.round(close * 100) / 100,
          volume
        });
      }

      return ohlcData;
    } catch (error) {
      console.error('Error generating OHLC data:', error);
      throw error;
    }
  }
}

module.exports = new MarketDataService();