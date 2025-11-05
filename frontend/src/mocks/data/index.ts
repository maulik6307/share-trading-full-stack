// Central export for all mock data

export * from './users';
export * from './symbols';
export * from './strategies';
export * from './orders';
export * from './positions';
export * from './backtests';
export * from './alerts';

// Re-export types for convenience
export type {
  User,
  UserPreferences,
  NotificationSettings,
} from '@/types/user';

export type {
  Symbol,
  MarketData,
  Order,
  Position,
  Trade,
  Strategy,
  StrategyTemplate,
  ParameterSchema,
  StrategyPerformance,
  Backtest,
  BacktestResult,
  BacktestSummary,
  EquityPoint,
  DrawdownPoint,
  MonthlyReturn,
  RiskMetrics,
  Portfolio,
  Alert,
  Watchlist,
  OrderSide,
  OrderType,
  OrderStatus,
  PositionSide,
  StrategyType,
  StrategyStatus,
  BacktestStatus,
} from '@/types/trading';