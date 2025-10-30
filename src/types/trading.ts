// Core trading entity types for the shareTrading UI MVP

export type OrderSide = 'BUY' | 'SELL';
export type OrderType = 'MARKET' | 'LIMIT' | 'STOP' | 'STOP_LIMIT';
export type OrderStatus = 'PENDING' | 'FILLED' | 'PARTIALLY_FILLED' | 'CANCELLED' | 'REJECTED';
export type PositionSide = 'LONG' | 'SHORT';
export type StrategyType = 'VISUAL' | 'CODE' | 'TEMPLATE';
export type StrategyStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'STOPPED';
export type BacktestStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface Symbol {
  symbol: string;
  name: string;
  exchange: string;
  sector: string;
  currency: string;
  lotSize: number;
  tickSize: number;
  isActive: boolean;
}

export interface MarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  timestamp: Date;
  bid?: number;
  ask?: number;
  bidSize?: number;
  askSize?: number;
}

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
  remainingQuantity: number;
  commission: number;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
  filledAt?: Date;
  tags?: string[];
}

export interface Position {
  id: string;
  symbol: string;
  side: PositionSide;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  unrealizedPnL: number;
  realizedPnL: number;
  totalPnL: number;
  dayPnL: number;
  commission: number;
  marketValue: number;
  costBasis: number;
  createdAt: Date;
  updatedAt: Date;
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
  pnl: number;
  executedAt: Date;
  tags?: string[];
}

export interface Strategy {
  id: string;
  name: string;
  description: string;
  type: StrategyType;
  status: StrategyStatus;
  parameters: Record<string, any>;
  code?: string;
  templateId?: string;
  isTemplate: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  lastBacktestId?: string;
  deployedAt?: Date;
  performance?: StrategyPerformance;
}

export interface StrategyPerformance {
  totalReturn: number;
  totalReturnPercent: number;
  sharpeRatio: number;
  maxDrawdown: number;
  maxDrawdownPercent: number;
  winRate: number;
  profitFactor: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  avgWin: number;
  avgLoss: number;
  largestWin: number;
  largestLoss: number;
}

export interface StrategyTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  defaultParameters: Record<string, any>;
  parameterSchema: ParameterSchema[];
  code?: string;
  isBuiltIn: boolean;
  createdAt: Date;
}

export interface ParameterSchema {
  key: string;
  label: string;
  type: 'number' | 'string' | 'boolean' | 'select' | 'range';
  defaultValue: any;
  min?: number;
  max?: number;
  step?: number;
  options?: { label: string; value: any }[];
  required: boolean;
  description?: string;
}

export interface Backtest {
  id: string;
  strategyId: string;
  name: string;
  status: BacktestStatus;
  startDate: Date;
  endDate: Date;
  initialCapital: number;
  commission: number;
  slippage: number;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  progress: number;
  errorMessage?: string;
  result?: BacktestResult;
}

export interface BacktestResult {
  id: string;
  backtestId: string;
  summary: BacktestSummary;
  equityCurve: EquityPoint[];
  drawdownCurve: DrawdownPoint[];
  trades: Trade[];
  monthlyReturns: MonthlyReturn[];
  riskMetrics: RiskMetrics;
}

export interface BacktestSummary {
  totalReturn: number;
  totalReturnPercent: number;
  annualizedReturn: number;
  sharpeRatio: number;
  sortinoRatio: number;
  maxDrawdown: number;
  maxDrawdownPercent: number;
  maxDrawdownDuration: number;
  volatility: number;
  winRate: number;
  profitFactor: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  avgWin: number;
  avgLoss: number;
  largestWin: number;
  largestLoss: number;
  avgTradeDuration: number;
  finalCapital: number;
  totalCommission: number;
  totalSlippage: number;
}

export interface EquityPoint {
  date: Date;
  equity: number;
  drawdown: number;
  returns: number;
}

export interface DrawdownPoint {
  date: Date;
  drawdown: number;
  drawdownPercent: number;
  isNewHigh: boolean;
}

export interface MonthlyReturn {
  year: number;
  month: number;
  return: number;
  returnPercent: number;
}

export interface RiskMetrics {
  var95: number;
  var99: number;
  cvar95: number;
  cvar99: number;
  beta: number;
  alpha: number;
  informationRatio: number;
  calmarRatio: number;
  sterlingRatio: number;
}

export interface Portfolio {
  id: string;
  name: string;
  totalValue: number;
  totalPnL: number;
  totalPnLPercent: number;
  dayPnL: number;
  dayPnLPercent: number;
  cash: number;
  positions: Position[];
  orders: Order[];
  updatedAt: Date;
}

export interface Alert {
  id: string;
  type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
  title: string;
  message: string;
  symbol?: string;
  strategyId?: string;
  orderId?: string;
  isRead: boolean;
  createdAt: Date;
  expiresAt?: Date;
}

export interface Watchlist {
  id: string;
  name: string;
  symbols: string[];
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}