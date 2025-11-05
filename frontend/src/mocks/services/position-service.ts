import { Position, Portfolio, MarketData, Order } from '@/types/trading';
import { mockPositions, mockPortfolio } from '@/mocks/data/positions';
import { mockMarketData } from '@/mocks/data/symbols';

export interface PositionHistory {
  id: string;
  positionId: string;
  action: 'OPEN' | 'CLOSE' | 'PARTIAL_CLOSE' | 'STOP_LOSS' | 'TAKE_PROFIT';
  quantity: number;
  price: number;
  pnl: number;
  timestamp: Date;
  reason?: string;
}

export interface RiskControl {
  positionId: string;
  stopLoss?: number;
  takeProfit?: number;
  maxLoss?: number;
  maxLossPercent?: number;
  createdAt: Date;
  updatedAt: Date;
}

export class MockPositionService {
  private positions: Position[] = [...mockPositions];
  private portfolio: Portfolio = { ...mockPortfolio };
  private positionHistory: PositionHistory[] = [];
  private riskControls: Map<string, RiskControl> = new Map();
  private listeners: ((positions: Position[], portfolio: Portfolio) => void)[] = [];
  private marketData: MarketData[] = [...mockMarketData];

  constructor() {
    // Initialize with some position history
    this.initializePositionHistory();
    
    // Start real-time market data simulation
    this.startMarketDataSimulation();
    
    // Start risk monitoring
    this.startRiskMonitoring();
  }

  /**
   * Subscribe to position updates
   */
  subscribe(callback: (positions: Position[], portfolio: Portfolio) => void): () => void {
    this.listeners.push(callback);
    
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Get all positions
   */
  getPositions(): Position[] {
    return [...this.positions];
  }

  /**
   * Get portfolio summary
   */
  getPortfolio(): Portfolio {
    return { ...this.portfolio };
  }

  /**
   * Get current market data
   */
  getMarketData(): MarketData[] {
    return [...this.marketData];
  }

  /**
   * Get position history
   */
  getPositionHistory(positionId?: string): PositionHistory[] {
    if (positionId) {
      return this.positionHistory.filter(h => h.positionId === positionId);
    }
    return [...this.positionHistory];
  }

  /**
   * Get risk controls for a position
   */
  getRiskControls(positionId: string): RiskControl | undefined {
    return this.riskControls.get(positionId);
  }

  /**
   * Close position (full or partial)
   */
  closePosition(positionId: string, quantity?: number): boolean {
    const position = this.positions.find(p => p.id === positionId);
    if (!position) return false;

    const closeQuantity = quantity || Math.abs(position.quantity);
    const maxCloseQuantity = Math.abs(position.quantity);
    
    if (closeQuantity > maxCloseQuantity) return false;

    const currentPrice = this.getCurrentPrice(position.symbol);
    const isFullClose = closeQuantity >= maxCloseQuantity;
    
    // Calculate P&L for the closed portion
    const priceDiff = position.side === 'LONG' 
      ? currentPrice - position.avgPrice 
      : position.avgPrice - currentPrice;
    const closePnL = closeQuantity * priceDiff;
    const commission = closeQuantity * currentPrice * 0.0001; // 0.01% commission

    // Update position
    if (isFullClose) {
      // Remove position completely
      const index = this.positions.findIndex(p => p.id === positionId);
      if (index > -1) {
        this.positions.splice(index, 1);
      }
      
      // Remove risk controls
      this.riskControls.delete(positionId);
    } else {
      // Reduce position size
      const newQuantity = position.side === 'LONG' 
        ? position.quantity - closeQuantity 
        : position.quantity + closeQuantity;
      
      position.quantity = newQuantity;
      position.realizedPnL += closePnL - commission;
      position.commission += commission;
      position.updatedAt = new Date();
      
      // Recalculate market value and cost basis
      position.marketValue = Math.abs(newQuantity) * currentPrice;
      position.costBasis = Math.abs(newQuantity) * position.avgPrice;
    }

    // Add to position history
    this.positionHistory.unshift({
      id: `history-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      positionId,
      action: isFullClose ? 'CLOSE' : 'PARTIAL_CLOSE',
      quantity: closeQuantity,
      price: currentPrice,
      pnl: closePnL - commission,
      timestamp: new Date(),
    });

    this.updatePortfolioMetrics();
    this.notifyListeners();
    
    return true;
  }

  /**
   * Set stop loss for a position
   */
  setStopLoss(positionId: string, stopPrice: number): boolean {
    const position = this.positions.find(p => p.id === positionId);
    if (!position) return false;

    const existing = this.riskControls.get(positionId);
    const riskControl: RiskControl = {
      positionId,
      stopLoss: stopPrice,
      takeProfit: existing?.takeProfit,
      maxLoss: existing?.maxLoss,
      maxLossPercent: existing?.maxLossPercent,
      createdAt: existing?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    this.riskControls.set(positionId, riskControl);
    return true;
  }

  /**
   * Set take profit for a position
   */
  setTakeProfit(positionId: string, targetPrice: number): boolean {
    const position = this.positions.find(p => p.id === positionId);
    if (!position) return false;

    const existing = this.riskControls.get(positionId);
    const riskControl: RiskControl = {
      positionId,
      stopLoss: existing?.stopLoss,
      takeProfit: targetPrice,
      maxLoss: existing?.maxLoss,
      maxLossPercent: existing?.maxLossPercent,
      createdAt: existing?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    this.riskControls.set(positionId, riskControl);
    return true;
  }

  /**
   * Set maximum loss limits
   */
  setMaxLoss(positionId: string, maxLoss?: number, maxLossPercent?: number): boolean {
    const position = this.positions.find(p => p.id === positionId);
    if (!position) return false;

    const existing = this.riskControls.get(positionId);
    const riskControl: RiskControl = {
      positionId,
      stopLoss: existing?.stopLoss,
      takeProfit: existing?.takeProfit,
      maxLoss,
      maxLossPercent,
      createdAt: existing?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    this.riskControls.set(positionId, riskControl);
    return true;
  }

  /**
   * Get current market price for a symbol
   */
  private getCurrentPrice(symbol: string): number {
    const data = this.marketData.find(d => d.symbol === symbol);
    return data?.price || 0;
  }

  /**
   * Update position metrics with current market data
   */
  private updatePositionMetrics() {
    this.positions.forEach(position => {
      const currentPrice = this.getCurrentPrice(position.symbol);
      const previousPrice = position.currentPrice;
      
      position.currentPrice = currentPrice;
      position.marketValue = Math.abs(position.quantity) * currentPrice;
      
      // Calculate unrealized P&L
      const priceDiff = position.side === 'LONG' 
        ? currentPrice - position.avgPrice 
        : position.avgPrice - currentPrice;
      position.unrealizedPnL = position.quantity * priceDiff;
      
      // Calculate day P&L (change from previous price)
      const dayPriceDiff = currentPrice - previousPrice;
      position.dayPnL = position.quantity * dayPriceDiff;
      
      // Calculate total P&L
      position.totalPnL = position.unrealizedPnL + position.realizedPnL;
      
      position.updatedAt = new Date();
    });
  }

  /**
   * Update portfolio-level metrics
   */
  private updatePortfolioMetrics() {
    const totalValue = this.positions.reduce((sum, pos) => sum + Math.abs(pos.marketValue), 0);
    const totalPnL = this.positions.reduce((sum, pos) => sum + pos.totalPnL, 0);
    const dayPnL = this.positions.reduce((sum, pos) => sum + pos.dayPnL, 0);
    
    this.portfolio.totalValue = totalValue + this.portfolio.cash;
    this.portfolio.totalPnL = totalPnL;
    this.portfolio.totalPnLPercent = totalValue > 0 ? (totalPnL / totalValue) * 100 : 0;
    this.portfolio.dayPnL = dayPnL;
    this.portfolio.dayPnLPercent = totalValue > 0 ? (dayPnL / totalValue) * 100 : 0;
    this.portfolio.positions = [...this.positions];
    this.portfolio.updatedAt = new Date();
  }

  /**
   * Start market data simulation
   */
  private startMarketDataSimulation() {
    setInterval(() => {
      // Update market prices with realistic movements
      this.marketData.forEach(data => {
        const volatility = 0.002; // 0.2% volatility
        const change = (Math.random() - 0.5) * 2 * volatility * data.price;
        const newPrice = Math.max(data.price + change, 0.05); // Minimum price of 0.05
        
        data.price = Math.round(newPrice * 20) / 20; // Round to nearest 0.05 (tick size)
        data.change = data.price - data.previousClose;
        data.changePercent = (data.change / data.previousClose) * 100;
        data.timestamp = new Date();
        
        // Update high/low
        data.high = Math.max(data.high, data.price);
        data.low = Math.min(data.low, data.price);
      });

      // Update position metrics
      this.updatePositionMetrics();
      this.updatePortfolioMetrics();
      this.notifyListeners();
    }, 2000); // Update every 2 seconds
  }

  /**
   * Start risk monitoring
   */
  private startRiskMonitoring() {
    setInterval(() => {
      this.positions.forEach(position => {
        const riskControl = this.riskControls.get(position.id);
        if (!riskControl) return;

        const currentPrice = this.getCurrentPrice(position.symbol);
        let shouldTrigger = false;
        let triggerReason = '';

        // Check stop loss
        if (riskControl.stopLoss) {
          const stopTriggered = position.side === 'LONG' 
            ? currentPrice <= riskControl.stopLoss
            : currentPrice >= riskControl.stopLoss;
          
          if (stopTriggered) {
            shouldTrigger = true;
            triggerReason = 'Stop loss triggered';
          }
        }

        // Check take profit
        if (riskControl.takeProfit && !shouldTrigger) {
          const takeProfitTriggered = position.side === 'LONG' 
            ? currentPrice >= riskControl.takeProfit
            : currentPrice <= riskControl.takeProfit;
          
          if (takeProfitTriggered) {
            shouldTrigger = true;
            triggerReason = 'Take profit triggered';
          }
        }

        // Check max loss limits
        if (riskControl.maxLoss && !shouldTrigger) {
          if (position.unrealizedPnL <= -Math.abs(riskControl.maxLoss)) {
            shouldTrigger = true;
            triggerReason = 'Maximum loss limit reached';
          }
        }

        if (riskControl.maxLossPercent && !shouldTrigger) {
          const lossPercent = (position.unrealizedPnL / position.costBasis) * 100;
          if (lossPercent <= -Math.abs(riskControl.maxLossPercent)) {
            shouldTrigger = true;
            triggerReason = 'Maximum loss percentage reached';
          }
        }

        // Execute risk control action
        if (shouldTrigger) {
          this.executeRiskControlAction(position.id, triggerReason);
        }
      });
    }, 1000); // Check every second
  }

  /**
   * Execute risk control action (close position)
   */
  private executeRiskControlAction(positionId: string, reason: string) {
    const position = this.positions.find(p => p.id === positionId);
    if (!position) return;

    const currentPrice = this.getCurrentPrice(position.symbol);
    const closeQuantity = Math.abs(position.quantity);
    
    // Close the position
    this.closePosition(positionId);
    
    // Update history with risk control reason
    const historyEntry = this.positionHistory.find(h => 
      h.positionId === positionId && 
      h.timestamp.getTime() > Date.now() - 5000 // Within last 5 seconds
    );
    
    if (historyEntry) {
      historyEntry.action = reason.includes('Stop loss') ? 'STOP_LOSS' : 'TAKE_PROFIT';
      historyEntry.reason = reason;
    }
  }

  /**
   * Initialize position history with sample data
   */
  private initializePositionHistory() {
    const sampleHistory: PositionHistory[] = [
      {
        id: 'history-1',
        positionId: 'position-1',
        action: 'OPEN',
        quantity: 200,
        price: 2455.75,
        pnl: 0,
        timestamp: new Date('2024-01-22T14:31:00Z'),
      },
      {
        id: 'history-2',
        positionId: 'position-2',
        action: 'PARTIAL_CLOSE',
        quantity: 25,
        price: 3535.60,
        pnl: 383.75,
        timestamp: new Date('2024-01-21T16:45:00Z'),
      },
      {
        id: 'history-3',
        positionId: 'position-3',
        action: 'OPEN',
        quantity: 100,
        price: 1675.50,
        pnl: 0,
        timestamp: new Date('2024-01-18T11:20:00Z'),
      },
    ];

    this.positionHistory = sampleHistory;
  }

  /**
   * Notify all listeners
   */
  private notifyListeners() {
    this.listeners.forEach(callback => {
      try {
        callback([...this.positions], { ...this.portfolio });
      } catch (error) {
        console.error('Error notifying position listener:', error);
      }
    });
  }

  /**
   * Export position data to CSV
   */
  exportPositionsToCSV(): string {
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
      'Day P&L',
      'Commission',
      'Created At',
      'Updated At'
    ];

    const rows = this.positions.map(position => [
      position.id,
      position.symbol,
      position.side,
      position.quantity.toString(),
      position.avgPrice.toString(),
      position.currentPrice.toString(),
      position.marketValue.toString(),
      position.unrealizedPnL.toString(),
      position.realizedPnL.toString(),
      position.totalPnL.toString(),
      position.dayPnL.toString(),
      position.commission.toString(),
      position.createdAt.toISOString(),
      position.updatedAt.toISOString()
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell.toString().replace(/"/g, '""')}"`).join(','))
      .join('\n');

    return csvContent;
  }
}

// Singleton instance
export const mockPositionService = new MockPositionService();