import { Order, OrderStatus, Trade } from '@/types/trading';
import { mockOrders, mockTrades } from '@/mocks/data/orders';

export class MockOrderService {
  private orders: Order[] = [...mockOrders];
  private trades: Trade[] = [...mockTrades];
  private listeners: ((orders: Order[]) => void)[] = [];

  constructor() {
    // Simulate order processing in the background
    this.startOrderProcessing();
  }

  /**
   * Subscribe to order updates
   */
  subscribe(callback: (orders: Order[]) => void): () => void {
    this.listeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Get all orders
   */
  getOrders(): Order[] {
    return [...this.orders];
  }

  /**
   * Get orders by status
   */
  getOrdersByStatus(status: OrderStatus): Order[] {
    return this.orders.filter(order => order.status === status);
  }

  /**
   * Get active orders (pending or partially filled)
   */
  getActiveOrders(): Order[] {
    return this.orders.filter(order => 
      order.status === 'PENDING' || order.status === 'PARTIALLY_FILLED'
    );
  }

  /**
   * Place a new order
   */
  placeOrder(orderData: Omit<Order, 'id' | 'status' | 'filledQuantity' | 'remainingQuantity' | 'commission' | 'createdAt' | 'updatedAt'>): Order {
    const order: Order = {
      ...orderData,
      id: `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: 'PENDING',
      filledQuantity: 0,
      remainingQuantity: orderData.quantity,
      commission: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Validate order
    const validation = this.validateOrder(order);
    if (!validation.isValid) {
      order.status = 'REJECTED';
      order.rejectionReason = validation.reason;
    }

    this.orders.unshift(order);
    this.notifyListeners();

    // Simulate order processing delay
    if (order.status === 'PENDING') {
      this.scheduleOrderProcessing(order.id);
    }

    return order;
  }

  /**
   * Cancel an order
   */
  cancelOrder(orderId: string): boolean {
    const order = this.orders.find(o => o.id === orderId);
    
    if (!order) {
      return false;
    }

    if (order.status !== 'PENDING' && order.status !== 'PARTIALLY_FILLED') {
      return false;
    }

    order.status = 'CANCELLED';
    order.updatedAt = new Date();
    
    this.notifyListeners();
    return true;
  }

  /**
   * Modify an order (simplified - just price/quantity changes)
   */
  modifyOrder(orderId: string, updates: { price?: number; quantity?: number; stopPrice?: number }): boolean {
    const order = this.orders.find(o => o.id === orderId);
    
    if (!order) {
      return false;
    }

    if (order.status !== 'PENDING' && order.status !== 'PARTIALLY_FILLED') {
      return false;
    }

    // Update order properties
    if (updates.price !== undefined) {
      order.price = updates.price;
    }
    
    if (updates.stopPrice !== undefined) {
      order.stopPrice = updates.stopPrice;
    }
    
    if (updates.quantity !== undefined && updates.quantity > order.filledQuantity) {
      order.quantity = updates.quantity;
      order.remainingQuantity = updates.quantity - order.filledQuantity;
    }

    order.updatedAt = new Date();
    
    this.notifyListeners();
    return true;
  }

  /**
   * Get order by ID
   */
  getOrder(orderId: string): Order | undefined {
    return this.orders.find(o => o.id === orderId);
  }

  /**
   * Get trades for an order
   */
  getTradesForOrder(orderId: string): Trade[] {
    return this.trades.filter(trade => trade.orderId === orderId);
  }

  /**
   * Validate order before placement
   */
  private validateOrder(order: Order): { isValid: boolean; reason?: string } {
    // Simulate various rejection scenarios
    
    // Check for insufficient funds (simplified)
    const orderValue = (order.price || 1000) * order.quantity;
    if (orderValue > 1000000) { // Mock limit of 10 lakh
      return { isValid: false, reason: 'Insufficient funds' };
    }

    // Check for invalid price ranges
    if (order.price && order.price <= 0) {
      return { isValid: false, reason: 'Invalid price' };
    }

    // Check for invalid quantity
    if (order.quantity <= 0) {
      return { isValid: false, reason: 'Invalid quantity' };
    }

    // Random rejection for demo purposes (5% chance)
    if (Math.random() < 0.05) {
      const reasons = [
        'Market closed',
        'Symbol not tradeable',
        'Price limit exceeded',
        'Risk management rejection'
      ];
      return { 
        isValid: false, 
        reason: reasons[Math.floor(Math.random() * reasons.length)]
      };
    }

    return { isValid: true };
  }

  /**
   * Schedule order processing with realistic delays
   */
  private scheduleOrderProcessing(orderId: string) {
    const order = this.orders.find(o => o.id === orderId);
    if (!order || order.status !== 'PENDING') return;

    // Market orders fill faster than limit orders
    const baseDelay = order.type === 'MARKET' ? 1000 : 3000;
    const randomDelay = Math.random() * 2000; // Add some randomness
    
    setTimeout(() => {
      this.processOrder(orderId);
    }, baseDelay + randomDelay);
  }

  /**
   * Process an order (simulate fills)
   */
  private processOrder(orderId: string) {
    const order = this.orders.find(o => o.id === orderId);
    if (!order || order.status !== 'PENDING') return;

    // Simulate different fill scenarios
    const fillScenario = Math.random();
    
    if (fillScenario < 0.7) {
      // 70% chance of full fill
      this.fillOrder(order, order.remainingQuantity);
    } else if (fillScenario < 0.9) {
      // 20% chance of partial fill
      const partialQuantity = Math.floor(order.remainingQuantity * (0.3 + Math.random() * 0.4));
      this.fillOrder(order, partialQuantity);
      
      // Schedule another fill attempt
      setTimeout(() => {
        if (order.status === 'PARTIALLY_FILLED') {
          this.processOrder(orderId);
        }
      }, 5000 + Math.random() * 10000);
    }
    // 10% chance order remains pending (no fill)
  }

  /**
   * Fill an order (full or partial)
   */
  private fillOrder(order: Order, fillQuantity: number) {
    if (fillQuantity <= 0 || fillQuantity > order.remainingQuantity) return;

    // Calculate fill price (simulate slippage for market orders)
    let fillPrice = order.price || 1000; // Default price if not specified
    
    if (order.type === 'MARKET') {
      // Simulate slippage (0.1% to 0.5%)
      const slippage = (Math.random() * 0.004 + 0.001) * (order.side === 'BUY' ? 1 : -1);
      fillPrice = fillPrice * (1 + slippage);
    }

    // Update order
    order.filledQuantity += fillQuantity;
    order.remainingQuantity -= fillQuantity;
    order.commission += fillQuantity * fillPrice * 0.0001; // 0.01% commission
    
    // Calculate average fill price
    if (order.avgFillPrice) {
      const totalFillValue = (order.filledQuantity - fillQuantity) * order.avgFillPrice + fillQuantity * fillPrice;
      order.avgFillPrice = totalFillValue / order.filledQuantity;
    } else {
      order.avgFillPrice = fillPrice;
    }

    // Update status
    if (order.remainingQuantity === 0) {
      order.status = 'FILLED';
      order.filledAt = new Date();
    } else {
      order.status = 'PARTIALLY_FILLED';
    }
    
    order.updatedAt = new Date();

    // Create trade record
    const trade: Trade = {
      id: `trade-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      orderId: order.id,
      strategyId: order.strategyId,
      symbol: order.symbol,
      side: order.side,
      quantity: fillQuantity,
      price: fillPrice,
      commission: fillQuantity * fillPrice * 0.0001,
      pnl: 0, // P&L calculation would be done at position level
      executedAt: new Date(),
      tags: order.tags,
    };

    this.trades.unshift(trade);
    this.notifyListeners();
  }

  /**
   * Start background order processing
   */
  private startOrderProcessing() {
    // Periodically check for pending orders and process them
    setInterval(() => {
      const pendingOrders = this.orders.filter(o => o.status === 'PENDING');
      
      pendingOrders.forEach(order => {
        // Random chance to process pending orders
        if (Math.random() < 0.1) { // 10% chance per interval
          this.processOrder(order.id);
        }
      });
    }, 5000); // Check every 5 seconds
  }

  /**
   * Notify all listeners of order updates
   */
  private notifyListeners() {
    this.listeners.forEach(callback => {
      try {
        callback([...this.orders]);
      } catch (error) {
        console.error('Error notifying order listener:', error);
      }
    });
  }

  /**
   * Export orders to CSV format
   */
  exportOrdersToCSV(): string {
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

    const rows = this.orders.map(order => [
      order.id,
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
  }
}

// Singleton instance
export const mockOrderService = new MockOrderService();