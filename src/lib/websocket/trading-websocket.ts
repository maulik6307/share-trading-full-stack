import { Order, Position, Portfolio, MarketData } from '@/types/trading';

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
}

export interface MarketDataUpdate {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  bid?: number;
  ask?: number;
  timestamp: string;
}

export type WebSocketEventHandler = (data: any) => void;

class TradingWebSocket {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;
  private eventHandlers: Map<string, Set<WebSocketEventHandler>> = new Map();
  private subscribedSymbols: Set<string> = new Set();

  constructor() {
    this.connect();
  }

  /**
   * Connect to WebSocket server
   */
  connect(): void {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.isConnecting = true;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No authentication token found, using demo mode');
        // For demo mode, we'll still try to connect but without authentication
        // The backend should handle this gracefully
      }

      const wsUrl = token 
        ? `${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:5000'}/ws?token=${token}`
        : `${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:5000'}/ws?demo=true`;
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        
        // Resubscribe to symbols if any
        if (this.subscribedSymbols.size > 0) {
          this.subscribeToMarketData(Array.from(this.subscribedSymbols));
        }

        this.emit('connected', { timestamp: new Date().toISOString() });
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        this.isConnecting = false;
        this.ws = null;
        
        this.emit('disconnected', { 
          code: event.code, 
          reason: event.reason,
          timestamp: new Date().toISOString()
        });

        // Attempt to reconnect if not a normal closure
        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.isConnecting = false;
        this.emit('error', { error, timestamp: new Date().toISOString() });
      };

    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff

    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      this.connect();
    }, delay);
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(message: WebSocketMessage): void {
    switch (message.type) {
      case 'CONNECTION_ESTABLISHED':
        console.log('WebSocket connection established for user:', message.data.userId);
        break;

      case 'MARKET_DATA_UPDATE':
        this.emit('marketDataUpdate', message.data);
        break;

      case 'ORDER_UPDATE':
        this.emit('orderUpdate', message.data);
        break;

      case 'TRADE_UPDATE':
        this.emit('tradeUpdate', message.data);
        break;

      case 'POSITION_UPDATE':
        this.emit('positionUpdate', message.data);
        break;

      case 'PORTFOLIO_UPDATE':
        this.emit('portfolioUpdate', message.data);
        break;

      case 'RISK_MANAGEMENT_TRIGGERED':
        this.emit('riskManagementTriggered', message.data);
        break;

      case 'PONG':
        // Handle ping/pong for connection health
        break;

      default:
        console.log('Unknown WebSocket message type:', message.type);
    }
  }

  /**
   * Subscribe to market data updates
   */
  subscribeToMarketData(symbols: string[]): void {
    symbols.forEach(symbol => this.subscribedSymbols.add(symbol.toUpperCase()));
    
    if (this.isConnected()) {
      this.send({
        type: 'SUBSCRIBE_MARKET_DATA',
        symbols: symbols.map(s => s.toUpperCase())
      });
    }
  }

  /**
   * Unsubscribe from market data updates
   */
  unsubscribeFromMarketData(symbols: string[]): void {
    symbols.forEach(symbol => this.subscribedSymbols.delete(symbol.toUpperCase()));
    
    if (this.isConnected()) {
      this.send({
        type: 'UNSUBSCRIBE_MARKET_DATA',
        symbols: symbols.map(s => s.toUpperCase())
      });
    }
  }

  /**
   * Send message to server
   */
  private send(data: any): void {
    if (this.isConnected()) {
      this.ws!.send(JSON.stringify(data));
    }
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  /**
   * Add event listener
   */
  on(event: string, handler: WebSocketEventHandler): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);
  }

  /**
   * Remove event listener
   */
  off(event: string, handler: WebSocketEventHandler): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.eventHandlers.delete(event);
      }
    }
  }

  /**
   * Emit event to all listeners
   */
  private emit(event: string, data: any): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in WebSocket event handler for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Send ping to server
   */
  ping(): void {
    if (this.isConnected()) {
      this.send({ type: 'PING' });
    }
  }

  /**
   * Disconnect WebSocket
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    this.subscribedSymbols.clear();
    this.eventHandlers.clear();
  }

  /**
   * Get connection status
   */
  getStatus(): {
    connected: boolean;
    reconnectAttempts: number;
    subscribedSymbols: string[];
  } {
    return {
      connected: this.isConnected(),
      reconnectAttempts: this.reconnectAttempts,
      subscribedSymbols: Array.from(this.subscribedSymbols)
    };
  }
}

// Create singleton instance
export const tradingWebSocket = new TradingWebSocket();

// Export types and instance
export default tradingWebSocket;