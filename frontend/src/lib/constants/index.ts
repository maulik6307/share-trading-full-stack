// Application constants for ShareTrading UI MVP

// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';
export const WEBSOCKET_URL = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:3001';

// Application Settings
export const APP_NAME = 'ShareTrading UI MVP';
export const APP_DESCRIPTION = 'AI-driven paper trading and backtesting platform';
export const DEFAULT_CURRENCY = 'USD';
export const DEFAULT_TIMEZONE = 'Asia/Kolkata';

// Trading Constants
export const DEFAULT_INITIAL_CAPITAL = 100000;
export const MIN_ORDER_QUANTITY = 1;
export const MAX_ORDER_QUANTITY = 10000;
export const DEFAULT_COMMISSION = 0.001; // 0.1%

// Strategy Types
export const STRATEGY_TYPES = {
  MA_CROSSOVER: 'Moving Average Crossover',
  RSI: 'RSI Strategy',
  BOLLINGER_BANDS: 'Bollinger Bands',
  CUSTOM: 'Custom Strategy',
} as const;

// Order Types
export const ORDER_TYPES = {
  MARKET: 'Market',
  LIMIT: 'Limit',
  STOP: 'Stop',
  STOP_LIMIT: 'Stop Limit',
} as const;

// Order Sides
export const ORDER_SIDES = {
  BUY: 'Buy',
  SELL: 'Sell',
} as const;

// Order Status
export const ORDER_STATUS = {
  PENDING: 'Pending',
  FILLED: 'Filled',
  PARTIALLY_FILLED: 'Partially Filled',
  CANCELLED: 'Cancelled',
  REJECTED: 'Rejected',
} as const;

// Strategy Status
export const STRATEGY_STATUS = {
  DRAFT: 'Draft',
  ACTIVE: 'Active',
  PAUSED: 'Paused',
  ARCHIVED: 'Archived',
} as const;

// Backtest Status
export const BACKTEST_STATUS = {
  PENDING: 'Pending',
  RUNNING: 'Running',
  COMPLETED: 'Completed',
  FAILED: 'Failed',
  CANCELLED: 'Cancelled',
} as const;

// UI Constants
export const THEME_MODES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const;

export const TABLE_PAGE_SIZES = [10, 25, 50, 100] as const;
export const DEFAULT_PAGE_SIZE = 25;

// Chart Constants
export const CHART_COLORS = {
  PRIMARY: '#0ea5e9',
  SUCCESS: '#22c55e',
  DANGER: '#ef4444',
  WARNING: '#f59e0b',
  NEUTRAL: '#737373',
} as const;

// Animation Durations (in milliseconds)
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;

// Breakpoints (matching Tailwind CSS)
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const;

// Mock Data Constants
export const MOCK_SYMBOLS = [
  'AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA',
  'META', 'NVDA', 'NFLX', 'ADBE', 'CRM',
] as const;

export const MOCK_TIMEFRAMES = [
  '1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w', '1M'
] as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error occurred. Please try again.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Server error occurred. Please try again later.',
  UNKNOWN_ERROR: 'An unknown error occurred.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  STRATEGY_CREATED: 'Strategy created successfully',
  STRATEGY_UPDATED: 'Strategy updated successfully',
  STRATEGY_DELETED: 'Strategy deleted successfully',
  BACKTEST_STARTED: 'Backtest started successfully',
  ORDER_PLACED: 'Order placed successfully',
  ORDER_CANCELLED: 'Order cancelled successfully',
  SETTINGS_SAVED: 'Settings saved successfully',
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  THEME: 'sharetrading-theme',
  USER_PREFERENCES: 'sharetrading-user-preferences',
  STRATEGY_DRAFTS: 'sharetrading-strategy-drafts',
  BACKTEST_CACHE: 'sharetrading-backtest-cache',
} as const;

// Feature Flags
export const FEATURE_FLAGS = {
  ENABLE_DARK_MODE: true,
  ENABLE_PAPER_TRADING: true,
  ENABLE_BACKTESTING: true,
  ENABLE_STRATEGY_BUILDER: true,
  ENABLE_ANALYTICS: true,
} as const;