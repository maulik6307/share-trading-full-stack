const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const dashboardRoutes = require('./routes/dashboard');
const tradingRoutes = require('./routes/trading');
const strategyRoutes = require('./routes/strategy');
const backtestRoutes = require('./routes/backtest');
const settingsRoutes = require('./routes/settings');
const supportRoutes = require('./routes/support');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting (disabled in development for testing)
if (process.env.NODE_ENV !== 'development') {
  const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: {
      error: 'Too many requests from this IP, please try again later.'
    }
  });
  app.use('/api/', limiter);
} else {
  console.log('⚠️  Rate limiting disabled in development mode');
}

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API routes
const apiPrefix = process.env.API_PREFIX || '/api';
const apiVersion = process.env.API_VERSION || 'v1';

app.use(`${apiPrefix}/${apiVersion}/auth`, authRoutes);
app.use(`${apiPrefix}/${apiVersion}/users`, userRoutes);
app.use(`${apiPrefix}/${apiVersion}/dashboard`, dashboardRoutes);
app.use(`${apiPrefix}/${apiVersion}/trading`, tradingRoutes);
app.use(`${apiPrefix}/${apiVersion}/strategies`, strategyRoutes);
app.use(`${apiPrefix}/${apiVersion}/backtests`, backtestRoutes);
app.use(`${apiPrefix}/${apiVersion}/settings`, settingsRoutes);
app.use(`${apiPrefix}/${apiVersion}/support`, supportRoutes);

// Welcome route
app.get('/', (req, res) => {
  res.json({
    message: 'ShareTrading API Server',
    version: '1.0.0',
    documentation: `${req.protocol}://${req.get('host')}/api/docs`,
    health: `${req.protocol}://${req.get('host')}/health`
  });
});

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

// Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    console.error('💡 Check your MONGODB_URI environment variable');
    process.exit(1);
  }
};

// Connect to database
connectDB();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error('❌ Unhandled Promise Rejection:', err.message);
  console.error('Stack:', err.stack);
  
  // In development, don't crash the server for debugging
  if (process.env.NODE_ENV === 'development') {
    console.log('🔄 Server continuing in development mode...');
    return;
  }
  
  // In production, gracefully close server
  console.log('🔄 Shutting down server due to unhandled promise rejection...');
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err.message);
  console.error('Stack:', err.stack);
  
  // In development, don't crash the server for debugging
  if (process.env.NODE_ENV === 'development') {
    console.log('🔄 Server continuing in development mode...');
    return;
  }
  
  console.log('🔄 Shutting down server due to uncaught exception...');
  process.exit(1);
});

// Initialize WebSocket service
const { websocketService } = require('./services/websocketService');

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`🌐 API Base URL: http://localhost:${PORT}${apiPrefix}/${apiVersion}`);
  console.log(`💚 Health Check: http://localhost:${PORT}/health`);
  
  // Initialize WebSocket server
  websocketService.initialize(server);
  websocketService.startHealthCheck();
  console.log(`🔌 WebSocket server initialized on ws://localhost:${PORT}/ws`);
});

module.exports = app;