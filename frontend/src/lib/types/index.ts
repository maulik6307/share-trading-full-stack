// Core data model interfaces for the ShareTrading UI MVP

// User and Authentication Types
export interface User {
  id: string;
  name: string;
  email: string;
  timezone: string;
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  notifications: NotificationSettings;
  defaultCurrency: string;
  dateFormat: string;
  language: string;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  trading: boolean;
  system: boolean;
}

// Strategy Types
export type StrategyType = 'MA_CROSSOVER' | 'RSI' | 'BOLLINGER_BANDS' | 'CUSTOM';
export type StrategyStatus = 'draft' | 'active' | 'paused' | 'archived';

export interface Strategy {
  id: string;
  name: string;
  description?: string;
  type: StrategyType;
  parameters: Record<string, any>;
  code?: string;
  status: StrategyStatus;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface StrategyTemplate {
  id: string;
  name: string;
  description: string;
  type: StrategyType;
  defaultParameters: Record<string, any>;
  codeTemplate?: string;
}

// Trading Types
export type OrderSide = 'BUY' | 'SELL';
export type OrderType = 'MARKET' | 'LIMIT' | 'STOP' | 'STOP_LIMIT';
export type OrderStatus = 'PENDING' | 'FILLED' | 'PARTIALLY_FILLED' | 'CANCELLED' | 'REJECTED';

export interface Order {
  id: string;
  strategyId?: string;
  symbol: string;
  side: OrderSide;
  type: OrderType;
  quantity: number;
  price?: number;
  stopPrice?: number;
  status: OrderStatus;
  filledQuantity: number;
  avgFillPrice?: number;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface Position {
  id: string;
  symbol: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  unrealizedPnL: number;
  realizedPnL: number;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface Trade {
  id: string;
  orderId: string;
  strategyId?: string;
  symbol: string;
  side: OrderSide;
  quantity: number;
  price: number;
  commission: number;
  timestamp: Date;
  userId: string;
}

// Backtesting Types
export type BacktestStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface BacktestConfig {
  strategyId: string;
  startDate: Date;
  endDate: Date;
  initialCapital: number;
  symbols: string[];
  parameters?: Record<string, any>;
}

export interface BacktestResult {
  id: string;
  strategyId: string;
  config: BacktestConfig;
  status: BacktestStatus;
  summary: BacktestSummary;
  equityCurve: EquityPoint[];
  trades: Trade[];
  drawdownCurve: DrawdownPoint[];
  createdAt: Date;
  completedAt?: Date;
}

export interface BacktestSummary {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  totalReturn: number;
  totalReturnPercent: number;
  maxDrawdown: number;
  maxDrawdownPercent: number;
  sharpeRatio: number;
  profitFactor: number;
  avgWin: number;
  avgLoss: number;
  winRate: number;
}

export interface EquityPoint {
  timestamp: Date;
  equity: number;
  drawdown: number;
}

export interface DrawdownPoint {
  timestamp: Date;
  drawdown: number;
  drawdownPercent: number;
}

// Market Data Types
export interface MarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: Date;
}

export interface Candle {
  timestamp: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface ChartDataPoint {
  timestamp: Date;
  value: number;
  label?: string;
}

// UI Component Types
export interface TableColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  width?: string;
}

export interface PaginationConfig {
  page: number;
  pageSize: number;
  total: number;
}

export interface SortingConfig {
  field: string;
  direction: 'asc' | 'desc';
}

export interface FilteringConfig {
  field: string;
  value: any;
  operator: 'equals' | 'contains' | 'gt' | 'lt' | 'gte' | 'lte';
}

// Error Types
export type ErrorType = 'network' | 'validation' | 'system' | 'user';

export interface ErrorState {
  type: ErrorType;
  message: string;
  code?: string;
  recoverable: boolean;
  retryAction?: () => void;
}

// Theme and Design System Types
export type ThemeMode = 'light' | 'dark' | 'system';

export interface DesignTokens {
  colors: ColorPalette;
  typography: TypographyScale;
  spacing: SpacingScale;
  shadows: ShadowScale;
  borderRadius: RadiusScale;
  breakpoints: BreakpointScale;
}

export interface ColorPalette {
  primary: ColorScale;
  secondary: ColorScale;
  success: ColorScale;
  warning: ColorScale;
  danger: ColorScale;
  neutral: ColorScale;
}

export interface ColorScale {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
}

export interface TypographyScale {
  xs: string;
  sm: string;
  base: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  '4xl': string;
  '5xl': string;
}

export interface SpacingScale {
  0: string;
  1: string;
  2: string;
  3: string;
  4: string;
  5: string;
  6: string;
  8: string;
  10: string;
  12: string;
  16: string;
  20: string;
  24: string;
  32: string;
}

export interface ShadowScale {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
}

export interface RadiusScale {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
}

export interface BreakpointScale {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
}

// Mock Service Types
export interface MockDataService {
  getUser(): Promise<User>;
  getStrategies(): Promise<Strategy[]>;
  getBacktestResult(id: string): Promise<BacktestResult>;
  getPositions(): Promise<Position[]>;
  getOrders(): Promise<Order[]>;
  subscribeToMarketData(callback: (data: MarketData) => void): () => void;
}

export interface MockSocketEvent {
  type: 'price_update' | 'order_fill' | 'position_update' | 'system_alert';
  timestamp: Date;
  data: any;
}

// Analytics and Telemetry Types
export interface AnalyticsEvent {
  name: string;
  properties: Record<string, any>;
  timestamp: Date;
  userId?: string;
}

export interface TelemetryData {
  event: string;
  data: Record<string, any>;
  timestamp: Date;
  sessionId: string;
}