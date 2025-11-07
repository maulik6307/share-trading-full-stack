'use client';

import { useState, useEffect, memo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  AlertCircle,
  Calculator
} from 'lucide-react';
import { Button, Input, Select, Modal } from '@/components/ui';
import { useToast } from '@/components/ui';
import { Order, OrderSide, OrderType, Symbol, MarketData } from '@/types/trading';
import { cn } from '@/lib/utils';

interface OrderEntryFormProps {
  symbols: Symbol[];
  marketData: MarketData[];
  onPlaceOrder: (order: Omit<Order, 'id' | 'status' | 'filledQuantity' | 'remainingQuantity' | 'commission' | 'createdAt' | 'updatedAt'>) => void;
  className?: string;
}

interface OrderFormData {
  symbol: string;
  side: OrderSide;
  type: OrderType;
  quantity: number;
  price?: number;
  stopPrice?: number;
}

const initialFormData: OrderFormData = {
  symbol: '',
  side: 'BUY',
  type: 'MARKET',
  quantity: 0,
};

const OrderEntryFormComponent = function OrderEntryForm({ symbols, marketData, onPlaceOrder, className }: OrderEntryFormProps) {
  const [formData, setFormData] = useState<OrderFormData>(initialFormData);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [estimatedValue, setEstimatedValue] = useState<number>(0);
  const { addToast } = useToast();

  // Get current market data for selected symbol
  const currentMarketData = marketData.find(data => data.symbol === formData.symbol);

  // Calculate estimated order value
  useEffect(() => {
    if (formData.quantity > 0) {
      let price = 0;
      
      if (formData.type === 'MARKET' && currentMarketData) {
        price = formData.side === 'BUY' ? currentMarketData.ask || currentMarketData.price : currentMarketData.bid || currentMarketData.price;
      } else if (formData.price) {
        price = formData.price;
      }
      
      setEstimatedValue(price * formData.quantity);
    } else {
      setEstimatedValue(0);
    }
  }, [formData, currentMarketData]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.symbol) {
      newErrors.symbol = 'Symbol is required';
    }

    if (formData.quantity <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
    }

    if (formData.type === 'LIMIT' && (!formData.price || formData.price <= 0)) {
      newErrors.price = 'Price is required for limit orders';
    }

    if (formData.type === 'STOP' && (!formData.stopPrice || formData.stopPrice <= 0)) {
      newErrors.stopPrice = 'Stop price is required for stop orders';
    }

    if (formData.type === 'STOP_LIMIT') {
      if (!formData.price || formData.price <= 0) {
        newErrors.price = 'Price is required for stop-limit orders';
      }
      if (!formData.stopPrice || formData.stopPrice <= 0) {
        newErrors.stopPrice = 'Stop price is required for stop-limit orders';
      }
    }

    // Validate price ranges if market data is available
    if (currentMarketData && formData.price) {
      const currentPrice = currentMarketData.price;
      const priceDeviation = Math.abs(formData.price - currentPrice) / currentPrice;
      
      if (priceDeviation > 0.1) { // 10% deviation warning
        newErrors.price = `Price deviates significantly from market price (₹${currentPrice.toFixed(2)})`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof OrderFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setShowConfirmation(true);
  };

  const handleConfirmOrder = () => {
    const order: Omit<Order, 'id' | 'status' | 'filledQuantity' | 'remainingQuantity' | 'commission' | 'createdAt' | 'updatedAt'> = {
      symbol: formData.symbol,
      side: formData.side,
      type: formData.type,
      quantity: formData.quantity,
      price: formData.price,
      stopPrice: formData.stopPrice,
      tags: ['manual'],
    };

    onPlaceOrder(order);
    setShowConfirmation(false);
    setFormData(initialFormData);
    
    addToast({
      type: 'success',
      title: 'Order Placed',
      description: `${formData.side} order for ${formData.quantity} ${formData.symbol} has been submitted.`
    });
  };

  const handleQuickFill = (percentage: number) => {
    if (currentMarketData) {
      const price = formData.side === 'BUY' ? currentMarketData.ask || currentMarketData.price : currentMarketData.bid || currentMarketData.price;
      const adjustedPrice = price * (1 + (percentage / 100));
      handleInputChange('price', Number(adjustedPrice.toFixed(2)));
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const orderTypeOptions = [
    { value: 'MARKET', label: 'Market' },
    { value: 'LIMIT', label: 'Limit' },
    { value: 'STOP', label: 'Stop' },
    { value: 'STOP_LIMIT', label: 'Stop Limit' },
  ];

  const symbolOptions = symbols.map(symbol => ({
    value: symbol.symbol,
    label: `${symbol.symbol} - ${symbol.name}`,
  }));

  return (
    <>
      <div className={cn(
        'bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6',
        className
      )}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
            Place Order
          </h3>
          <div className="flex items-center space-x-2">
            <Button
              variant={formData.side === 'BUY' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => handleInputChange('side', 'BUY')}
              className={cn(
                'flex items-center space-x-1',
                formData.side === 'BUY' && 'bg-green-600 hover:bg-green-700 text-white'
              )}
            >
              <TrendingUp className="h-4 w-4" />
              <span>Buy</span>
            </Button>
            <Button
              variant={formData.side === 'SELL' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => handleInputChange('side', 'SELL')}
              className={cn(
                'flex items-center space-x-1',
                formData.side === 'SELL' && 'bg-red-600 hover:bg-red-700 text-white'
              )}
            >
              <TrendingDown className="h-4 w-4" />
              <span>Sell</span>
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Symbol Selection */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Symbol
            </label>
            <Select
              value={formData.symbol}
              onChange={(e) => handleInputChange('symbol', e.target.value)}
              options={symbolOptions}
              placeholder="Select a symbol"
              error={errors.symbol}
            />
            {currentMarketData && (
              <div className="mt-2 p-2 bg-neutral-50 dark:bg-neutral-900 rounded text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600 dark:text-neutral-400">Current Price:</span>
                  <span className={cn(
                    'font-medium',
                    currentMarketData.change >= 0 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  )}>
                    ₹{currentMarketData.price.toFixed(2)} ({currentMarketData.changePercent.toFixed(2)}%)
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-neutral-600 dark:text-neutral-400">Bid/Ask:</span>
                  <span className="text-neutral-900 dark:text-white">
                    ₹{currentMarketData.bid?.toFixed(2) || 'N/A'} / ₹{currentMarketData.ask?.toFixed(2) || 'N/A'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Order Type */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Order Type
            </label>
            <Select
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value as OrderType)}
              options={orderTypeOptions}
            />
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Quantity
            </label>
            <Input
              type="number"
              value={formData.quantity || ''}
              onChange={(e) => handleInputChange('quantity', Number(e.target.value))}
              placeholder="Enter quantity"
              min="1"
              step="1"
              error={errors.quantity}
            />
          </div>

          {/* Price (for LIMIT and STOP_LIMIT orders) */}
          {(formData.type === 'LIMIT' || formData.type === 'STOP_LIMIT') && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Price
              </label>
              <Input
                type="number"
                value={formData.price || ''}
                onChange={(e) => handleInputChange('price', Number(e.target.value))}
                placeholder="Enter price"
                min="0"
                step="0.05"
                error={errors.price}
              />
              {currentMarketData && (
                <div className="mt-2 flex items-center space-x-2">
                  <span className="text-xs text-neutral-600 dark:text-neutral-400">Quick fill:</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleQuickFill(-1)}
                    className="text-xs px-2 py-1 h-auto"
                  >
                    -1%
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleQuickFill(0)}
                    className="text-xs px-2 py-1 h-auto"
                  >
                    Market
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleQuickFill(1)}
                    className="text-xs px-2 py-1 h-auto"
                  >
                    +1%
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Stop Price (for STOP and STOP_LIMIT orders) */}
          {(formData.type === 'STOP' || formData.type === 'STOP_LIMIT') && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Stop Price
              </label>
              <Input
                type="number"
                value={formData.stopPrice || ''}
                onChange={(e) => handleInputChange('stopPrice', Number(e.target.value))}
                placeholder="Enter stop price"
                min="0"
                step="0.05"
                error={errors.stopPrice}
              />
            </div>
          )}

          {/* Order Summary */}
          {estimatedValue > 0 && (
            <div className="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Calculator className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
                <span className="text-sm font-medium text-neutral-900 dark:text-white">
                  Order Summary
                </span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-600 dark:text-neutral-400">Estimated Value:</span>
                  <span className="font-medium text-neutral-900 dark:text-white">
                    {formatCurrency(estimatedValue)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600 dark:text-neutral-400">Est. Commission:</span>
                  <span className="font-medium text-neutral-900 dark:text-white">
                    {formatCurrency(estimatedValue * 0.0001)} {/* 0.01% commission */}
                  </span>
                </div>
                <div className="flex justify-between border-t border-neutral-200 dark:border-neutral-700 pt-1">
                  <span className="text-neutral-600 dark:text-neutral-400">Total:</span>
                  <span className="font-semibold text-neutral-900 dark:text-white">
                    {formatCurrency(estimatedValue + (estimatedValue * 0.0001))}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className={cn(
              'w-full flex items-center justify-center space-x-2',
              formData.side === 'BUY' 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-red-600 hover:bg-red-700 text-white'
            )}
            disabled={!formData.symbol || formData.quantity <= 0}
          >
            <DollarSign className="h-4 w-4" />
            <span>Place {formData.side} Order</span>
          </Button>
        </form>
      </div>

      {/* Confirmation Modal */}
      <Modal isOpen={showConfirmation} onClose={() => setShowConfirmation(false)}>
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className={cn(
              'p-2 rounded-full',
              formData.side === 'BUY' ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'
            )}>
              {formData.side === 'BUY' ? (
                <TrendingUp className={cn(
                  'h-5 w-5',
                  'text-green-600 dark:text-green-400'
                )} />
              ) : (
                <TrendingDown className={cn(
                  'h-5 w-5',
                  'text-red-600 dark:text-red-400'
                )} />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Confirm Order
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Please review your order details
              </p>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex justify-between">
              <span className="text-neutral-600 dark:text-neutral-400">Symbol:</span>
              <span className="font-medium text-neutral-900 dark:text-white">{formData.symbol}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600 dark:text-neutral-400">Side:</span>
              <span className={cn(
                'font-medium',
                formData.side === 'BUY' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              )}>
                {formData.side}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600 dark:text-neutral-400">Type:</span>
              <span className="font-medium text-neutral-900 dark:text-white">{formData.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600 dark:text-neutral-400">Quantity:</span>
              <span className="font-medium text-neutral-900 dark:text-white">{formData.quantity}</span>
            </div>
            {formData.price && (
              <div className="flex justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">Price:</span>
                <span className="font-medium text-neutral-900 dark:text-white">₹{formData.price.toFixed(2)}</span>
              </div>
            )}
            {formData.stopPrice && (
              <div className="flex justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">Stop Price:</span>
                <span className="font-medium text-neutral-900 dark:text-white">₹{formData.stopPrice.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-neutral-200 dark:border-neutral-700 pt-3">
              <span className="text-neutral-600 dark:text-neutral-400">Estimated Value:</span>
              <span className="font-semibold text-neutral-900 dark:text-white">
                {formatCurrency(estimatedValue)}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2 mb-6 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <p className="text-sm text-amber-800 dark:text-amber-200">
              This is a paper trading order. No real money will be involved.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowConfirmation(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmOrder}
              className={cn(
                'flex-1',
                formData.side === 'BUY' 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-red-600 hover:bg-red-700 text-white'
              )}
            >
              Confirm Order
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

// Memoize the component to prevent unnecessary re-renders
export const OrderEntryForm = memo(OrderEntryFormComponent);