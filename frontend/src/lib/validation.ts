// Data validation utilities for trading entities

import {
  Order,
  Position,
  Strategy,
  Backtest,
  Trade,
  MarketData,
  ParameterSchema
} from '@/types/trading';

export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Order validation
export const validateOrder = (order: Partial<Order>): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!order.symbol || order.symbol.trim().length === 0) {
    errors.push(new ValidationError('Symbol is required', 'symbol'));
  }

  if (!order.side || !['BUY', 'SELL'].includes(order.side)) {
    errors.push(new ValidationError('Valid side (BUY/SELL) is required', 'side'));
  }

  if (!order.type || !['MARKET', 'LIMIT', 'STOP', 'STOP_LIMIT'].includes(order.type)) {
    errors.push(new ValidationError('Valid order type is required', 'type'));
  }

  if (!order.quantity || order.quantity <= 0) {
    errors.push(new ValidationError('Quantity must be greater than 0', 'quantity'));
  }

  if (order.type === 'LIMIT' && (!order.price || order.price <= 0)) {
    errors.push(new ValidationError('Price is required for limit orders', 'price'));
  }

  if ((order.type === 'STOP' || order.type === 'STOP_LIMIT') && (!order.stopPrice || order.stopPrice <= 0)) {
    errors.push(new ValidationError('Stop price is required for stop orders', 'stopPrice'));
  }

  if (order.filledQuantity && order.filledQuantity < 0) {
    errors.push(new ValidationError('Filled quantity cannot be negative', 'filledQuantity'));
  }

  if (order.quantity && order.filledQuantity && order.filledQuantity > order.quantity) {
    errors.push(new ValidationError('Filled quantity cannot exceed order quantity', 'filledQuantity'));
  }

  return errors;
};

// Position validation
export const validatePosition = (position: Partial<Position>): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!position.symbol || position.symbol.trim().length === 0) {
    errors.push(new ValidationError('Symbol is required', 'symbol'));
  }

  if (!position.side || !['LONG', 'SHORT'].includes(position.side)) {
    errors.push(new ValidationError('Valid side (LONG/SHORT) is required', 'side'));
  }

  if (position.quantity === undefined || position.quantity === 0) {
    errors.push(new ValidationError('Quantity cannot be zero', 'quantity'));
  }

  if (position.side === 'LONG' && position.quantity && position.quantity < 0) {
    errors.push(new ValidationError('Long position quantity must be positive', 'quantity'));
  }

  if (position.side === 'SHORT' && position.quantity && position.quantity > 0) {
    errors.push(new ValidationError('Short position quantity must be negative', 'quantity'));
  }

  if (!position.avgPrice || position.avgPrice <= 0) {
    errors.push(new ValidationError('Average price must be greater than 0', 'avgPrice'));
  }

  if (!position.currentPrice || position.currentPrice <= 0) {
    errors.push(new ValidationError('Current price must be greater than 0', 'currentPrice'));
  }

  return errors;
};

// Strategy validation
export const validateStrategy = (strategy: Partial<Strategy>): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!strategy.name || strategy.name.trim().length === 0) {
    errors.push(new ValidationError('Strategy name is required', 'name'));
  }

  if (strategy.name && strategy.name.length > 100) {
    errors.push(new ValidationError('Strategy name must be less than 100 characters', 'name'));
  }

  if (!strategy.type || !['VISUAL', 'CODE', 'TEMPLATE'].includes(strategy.type)) {
    errors.push(new ValidationError('Valid strategy type is required', 'type'));
  }

  if (strategy.type === 'CODE' && (!strategy.code || strategy.code.trim().length === 0)) {
    errors.push(new ValidationError('Code is required for code-based strategies', 'code'));
  }

  if (strategy.type === 'TEMPLATE' && !strategy.templateId) {
    errors.push(new ValidationError('Template ID is required for template-based strategies', 'templateId'));
  }

  if (!strategy.parameters || typeof strategy.parameters !== 'object') {
    errors.push(new ValidationError('Parameters object is required', 'parameters'));
  }

  return errors;
};

// Strategy parameter validation
export const validateStrategyParameters = (
  parameters: Record<string, any>,
  schema: ParameterSchema[]
): ValidationError[] => {
  const errors: ValidationError[] = [];

  schema.forEach(param => {
    const value = parameters[param.key];

    if (param.required && (value === undefined || value === null || value === '')) {
      errors.push(new ValidationError(`${param.label} is required`, param.key));
      return;
    }

    if (value !== undefined && value !== null) {
      switch (param.type) {
        case 'number':
          if (typeof value !== 'number' || isNaN(value)) {
            errors.push(new ValidationError(`${param.label} must be a valid number`, param.key));
          } else {
            if (param.min !== undefined && value < param.min) {
              errors.push(new ValidationError(`${param.label} must be at least ${param.min}`, param.key));
            }
            if (param.max !== undefined && value > param.max) {
              errors.push(new ValidationError(`${param.label} must be at most ${param.max}`, param.key));
            }
          }
          break;

        case 'string':
          if (typeof value !== 'string') {
            errors.push(new ValidationError(`${param.label} must be a string`, param.key));
          }
          break;

        case 'boolean':
          if (typeof value !== 'boolean') {
            errors.push(new ValidationError(`${param.label} must be a boolean`, param.key));
          }
          break;

        case 'select':
          if (param.options && !param.options.some(opt => opt.value === value)) {
            errors.push(new ValidationError(`${param.label} must be one of the available options`, param.key));
          }
          break;

        case 'range':
          if (typeof value !== 'number' || isNaN(value)) {
            errors.push(new ValidationError(`${param.label} must be a valid number`, param.key));
          } else {
            if (param.min !== undefined && value < param.min) {
              errors.push(new ValidationError(`${param.label} must be at least ${param.min}`, param.key));
            }
            if (param.max !== undefined && value > param.max) {
              errors.push(new ValidationError(`${param.label} must be at most ${param.max}`, param.key));
            }
          }
          break;
      }
    }
  });

  return errors;
};

// Backtest validation
export const validateBacktest = (backtest: Partial<Backtest>): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!backtest.name || backtest.name.trim().length === 0) {
    errors.push(new ValidationError('Backtest name is required', 'name'));
  }

  if (!backtest.strategyId || backtest.strategyId.trim().length === 0) {
    errors.push(new ValidationError('Strategy ID is required', 'strategyId'));
  }

  if (!backtest.startDate) {
    errors.push(new ValidationError('Start date is required', 'startDate'));
  }

  if (!backtest.endDate) {
    errors.push(new ValidationError('End date is required', 'endDate'));
  }

  if (backtest.startDate && backtest.endDate && backtest.startDate >= backtest.endDate) {
    errors.push(new ValidationError('End date must be after start date', 'endDate'));
  }

  if (!backtest.initialCapital || backtest.initialCapital <= 0) {
    errors.push(new ValidationError('Initial capital must be greater than 0', 'initialCapital'));
  }

  if (backtest.commission !== undefined && backtest.commission < 0) {
    errors.push(new ValidationError('Commission cannot be negative', 'commission'));
  }

  if (backtest.slippage !== undefined && backtest.slippage < 0) {
    errors.push(new ValidationError('Slippage cannot be negative', 'slippage'));
  }

  return errors;
};

// Trade validation
export const validateTrade = (trade: Partial<Trade>): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!trade.orderId || trade.orderId.trim().length === 0) {
    errors.push(new ValidationError('Order ID is required', 'orderId'));
  }

  if (!trade.symbol || trade.symbol.trim().length === 0) {
    errors.push(new ValidationError('Symbol is required', 'symbol'));
  }

  if (!trade.side || !['BUY', 'SELL'].includes(trade.side)) {
    errors.push(new ValidationError('Valid side (BUY/SELL) is required', 'side'));
  }

  if (!trade.quantity || trade.quantity <= 0) {
    errors.push(new ValidationError('Quantity must be greater than 0', 'quantity'));
  }

  if (!trade.price || trade.price <= 0) {
    errors.push(new ValidationError('Price must be greater than 0', 'price'));
  }

  if (trade.commission !== undefined && trade.commission < 0) {
    errors.push(new ValidationError('Commission cannot be negative', 'commission'));
  }

  if (!trade.executedAt) {
    errors.push(new ValidationError('Execution date is required', 'executedAt'));
  }

  return errors;
};

// Market data validation
export const validateMarketData = (data: Partial<MarketData>): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!data.symbol || data.symbol.trim().length === 0) {
    errors.push(new ValidationError('Symbol is required', 'symbol'));
  }

  if (data.price === undefined || data.price < 0) {
    errors.push(new ValidationError('Price must be non-negative', 'price'));
  }

  if (data.volume !== undefined && data.volume < 0) {
    errors.push(new ValidationError('Volume cannot be negative', 'volume'));
  }

  if (data.high !== undefined && data.low !== undefined && data.high < data.low) {
    errors.push(new ValidationError('High price cannot be less than low price', 'high'));
  }

  if (!data.timestamp) {
    errors.push(new ValidationError('Timestamp is required', 'timestamp'));
  }

  return errors;
};

// Generic validation helper
export const isValidationError = (error: any): error is ValidationError => {
  return error instanceof ValidationError;
};

// Validation result helper
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export const createValidationResult = (errors: ValidationError[]): ValidationResult => {
  return {
    isValid: errors.length === 0,
    errors,
  };
};