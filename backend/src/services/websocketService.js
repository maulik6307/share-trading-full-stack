const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

class WebSocketService {
  constructor() {
    this.wss = null;
    this.clients = new Map(); // userId -> Set of WebSocket connections
  }

  /**
   * Initialize WebSocket server
   */
  initialize(server) {
    this.wss = new WebSocket.Server({ 
      server,
      path: '/ws'
    });

    this.wss.on('connection', (ws, req) => {
      this.handleConnection(ws, req);
    });

    console.log('WebSocket server initialized');
  }

  /**
   * Handle new WebSocket connection
   */
  async handleConnection(ws, req) {
    try {
      // Extract token from query parameters or headers
      const url = new URL(req.url, `http://${req.headers.host}`);
      const token = url.searchParams.get('token') || req.headers.authorization?.replace('Bearer ', '');
      const isDemo = url.searchParams.get('demo') === 'true';

      let user;

      if (isDemo || token === 'demo-token') {
        // Handle demo connection
        user = {
          _id: 'demo-user-1',
          name: 'Demo User',
          email: 'demo@example.com',
          username: 'demo_user'
        };
        console.log('Demo WebSocket connection established');
      } else {
        if (!token) {
          ws.close(1008, 'Authentication required');
          return;
        }

        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        user = await User.findById(decoded.id);

        if (!user) {
          ws.close(1008, 'Invalid user');
          return;
        }
      }

      // Store connection
      ws.userId = user._id.toString();
      ws.isAlive = true;

      if (!this.clients.has(ws.userId)) {
        this.clients.set(ws.userId, new Set());
      }
      this.clients.get(ws.userId).add(ws);

      console.log(`WebSocket connected for user: ${user.email}`);

      // Set up ping/pong for connection health
      ws.on('pong', () => {
        ws.isAlive = true;
      });

      // Handle messages from client
      ws.on('message', (message) => {
        this.handleMessage(ws, message);
      });

      // Handle connection close
      ws.on('close', () => {
        this.handleDisconnection(ws);
      });

      // Send welcome message
      ws.send(JSON.stringify({
        type: 'CONNECTION_ESTABLISHED',
        data: {
          userId: user._id,
          timestamp: new Date().toISOString()
        }
      }));

    } catch (error) {
      console.error('WebSocket connection error:', error);
      ws.close(1008, 'Authentication failed');
    }
  }

  /**
   * Handle incoming messages from client
   */
  handleMessage(ws, message) {
    try {
      const data = JSON.parse(message);
      
      switch (data.type) {
        case 'PING':
          ws.send(JSON.stringify({ type: 'PONG', timestamp: new Date().toISOString() }));
          break;
          
        case 'SUBSCRIBE_MARKET_DATA':
          this.subscribeToMarketData(ws, data.symbols);
          break;
          
        case 'UNSUBSCRIBE_MARKET_DATA':
          this.unsubscribeFromMarketData(ws, data.symbols);
          break;
          
        default:
          console.log('Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
    }
  }

  /**
   * Handle WebSocket disconnection
   */
  handleDisconnection(ws) {
    if (ws.userId && this.clients.has(ws.userId)) {
      this.clients.get(ws.userId).delete(ws);
      
      if (this.clients.get(ws.userId).size === 0) {
        this.clients.delete(ws.userId);
      }
    }
    
    console.log(`WebSocket disconnected for user: ${ws.userId}`);
  }

  /**
   * Subscribe to market data updates
   */
  subscribeToMarketData(ws, symbols) {
    if (!ws.marketDataSubscriptions) {
      ws.marketDataSubscriptions = new Set();
    }
    
    symbols.forEach(symbol => {
      ws.marketDataSubscriptions.add(symbol.toUpperCase());
    });
    
    console.log(`User ${ws.userId} subscribed to market data:`, symbols);
  }

  /**
   * Unsubscribe from market data updates
   */
  unsubscribeFromMarketData(ws, symbols) {
    if (ws.marketDataSubscriptions) {
      symbols.forEach(symbol => {
        ws.marketDataSubscriptions.delete(symbol.toUpperCase());
      });
    }
    
    console.log(`User ${ws.userId} unsubscribed from market data:`, symbols);
  }

  /**
   * Broadcast message to specific user
   */
  broadcastToUser(userId, type, data) {
    const userConnections = this.clients.get(userId.toString());
    
    if (userConnections) {
      const message = JSON.stringify({
        type,
        data,
        timestamp: new Date().toISOString()
      });

      userConnections.forEach(ws => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(message);
        }
      });
    }
  }

  /**
   * Broadcast market data to subscribed users
   */
  broadcastMarketData(symbol, marketData) {
    const message = JSON.stringify({
      type: 'MARKET_DATA_UPDATE',
      data: {
        symbol,
        ...marketData
      },
      timestamp: new Date().toISOString()
    });

    this.clients.forEach((connections, userId) => {
      connections.forEach(ws => {
        if (ws.readyState === WebSocket.OPEN && 
            ws.marketDataSubscriptions && 
            ws.marketDataSubscriptions.has(symbol.toUpperCase())) {
          ws.send(message);
        }
      });
    });
  }

  /**
   * Broadcast to all connected users
   */
  broadcastToAll(type, data) {
    const message = JSON.stringify({
      type,
      data,
      timestamp: new Date().toISOString()
    });

    this.clients.forEach((connections) => {
      connections.forEach(ws => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(message);
        }
      });
    });
  }

  /**
   * Start health check interval
   */
  startHealthCheck() {
    setInterval(() => {
      this.clients.forEach((connections) => {
        connections.forEach(ws => {
          if (!ws.isAlive) {
            ws.terminate();
            return;
          }
          
          ws.isAlive = false;
          ws.ping();
        });
      });
    }, 30000); // Check every 30 seconds
  }

  /**
   * Get connection statistics
   */
  getStats() {
    let totalConnections = 0;
    this.clients.forEach((connections) => {
      totalConnections += connections.size;
    });

    return {
      totalUsers: this.clients.size,
      totalConnections,
      connectedUsers: Array.from(this.clients.keys())
    };
  }

  /**
   * Close all connections
   */
  closeAll() {
    this.clients.forEach((connections) => {
      connections.forEach(ws => {
        ws.close(1001, 'Server shutdown');
      });
    });
    
    this.clients.clear();
  }
}

// Create singleton instance
const websocketService = new WebSocketService();

// Export both the service and helper functions
module.exports = {
  websocketService,
  broadcastToUser: (userId, type, data) => websocketService.broadcastToUser(userId, type, data),
  broadcastMarketData: (symbol, data) => websocketService.broadcastMarketData(symbol, data),
  broadcastToAll: (type, data) => websocketService.broadcastToAll(type, data)
};