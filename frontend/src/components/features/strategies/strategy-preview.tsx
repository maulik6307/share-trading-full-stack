'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Eye, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Percent,
  BarChart3,
  Activity,
  AlertCircle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui';
import { Strategy } from '@/types/trading';
import { cn } from '@/lib/utils';

interface StrategyPreviewProps {
  strategy: Strategy;
  isVisible: boolean;
  onClose?: () => void;
  className?: string;
}

interface PreviewMetrics {
  estimatedReturn: number;
  estimatedReturnPercent: number;
  riskScore: number;
  maxDrawdown: number;
  winRate: number;
  tradesPerMonth: number;
  sharpeRatio: number;
}

export function StrategyPreview({
  strategy,
  isVisible,
  onClose,
  className,
}: StrategyPreviewProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [metrics, setMetrics] = useState<PreviewMetrics | null>(null);
  const [validationResults, setValidationResults] = useState<{
    isValid: boolean;
    warnings: string[];
    errors: string[];
  }>({
    isValid: true,
    warnings: [],
    errors: [],
  });

  // Calculate preview metrics based on strategy parameters
  const calculatePreviewMetrics = useMemo(() => {
    return (): PreviewMetrics => {
      const { parameters } = strategy;
      
      // Mock calculation based on parameters
      const quantity = parameters.quantity || 100;
      const stopLoss = parameters.stopLoss || 2.0;
      const takeProfit = parameters.takeProfit || 4.0;
      
      // Simple risk/reward calculation
      const riskRewardRatio = takeProfit / stopLoss;
      const estimatedWinRate = Math.min(0.8, 0.4 + (riskRewardRatio * 0.1));
      const avgWin = quantity * (takeProfit / 100) * 100; // Assuming ₹100 per share
      const avgLoss = quantity * (stopLoss / 100) * 100;
      
      const estimatedReturn = (estimatedWinRate * avgWin) - ((1 - estimatedWinRate) * avgLoss);
      const estimatedReturnPercent = (estimatedReturn / (quantity * 100)) * 100;
      
      return {
        estimatedReturn,
        estimatedReturnPercent,
        riskScore: Math.min(10, stopLoss * 2),
        maxDrawdown: stopLoss * 1.5,
        winRate: estimatedWinRate,
        tradesPerMonth: Math.floor(Math.random() * 20) + 10,
        sharpeRatio: Math.max(0.5, 2.0 - (stopLoss / 10)),
      };
    };
  }, [strategy.parameters]);

  // Validate strategy configuration
  const validateStrategy = useMemo(() => {
    return () => {
      const warnings: string[] = [];
      const errors: string[] = [];
      const { parameters } = strategy;

      // Parameter validation
      if (!parameters.symbol) {
        errors.push('Trading symbol is required');
      }
      
      if (!parameters.quantity || parameters.quantity <= 0) {
        errors.push('Quantity must be greater than 0');
      }
      
      if (parameters.quantity && parameters.quantity > 1000) {
        warnings.push('Large position size may increase risk');
      }
      
      if (parameters.stopLoss && parameters.stopLoss > 5) {
        warnings.push('High stop loss percentage may result in large losses');
      }
      
      if (parameters.takeProfit && parameters.stopLoss && parameters.takeProfit <= parameters.stopLoss) {
        warnings.push('Take profit should be higher than stop loss for better risk/reward');
      }

      // Code validation for CODE type strategies
      if (strategy.type === 'CODE') {
        if (!strategy.code || strategy.code.trim().length === 0) {
          errors.push('Strategy code is required');
        } else if (!strategy.code.includes('onTick')) {
          errors.push('Strategy must include an onTick function');
        }
      }

      return {
        isValid: errors.length === 0,
        warnings,
        errors,
      };
    };
  }, [strategy]);

  // Update metrics when strategy changes
  useEffect(() => {
    if (isVisible) {
      setIsLoading(true);
      
      // Simulate calculation delay
      const timer = setTimeout(() => {
        setMetrics(calculatePreviewMetrics());
        setValidationResults(validateStrategy());
        setIsLoading(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [strategy, isVisible, calculatePreviewMetrics, validateStrategy]);

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setMetrics(calculatePreviewMetrics());
      setValidationResults(validateStrategy());
      setIsLoading(false);
    }, 1000);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className={cn(
        'fixed right-0 top-0 h-full w-96 !mt-0 bg-white dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-700 shadow-xl !z-[51] overflow-y-auto',
        className
      )}
    >
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Eye className="h-5 w-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Strategy Preview
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
            </Button>
            {onClose && (
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
              >
                ×
              </Button>
            )}
          </div>
        </div>

        {/* Strategy Info */}
        <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4">
          <h4 className="font-semibold text-neutral-900 dark:text-white mb-2">
            {strategy.name}
          </h4>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
            {strategy.description}
          </p>
          <div className="flex items-center space-x-4 text-xs">
            <span className="bg-neutral-200 dark:bg-neutral-700 px-2 py-1 rounded">
              {strategy.type}
            </span>
            <span className="text-neutral-500">
              {Object.keys(strategy.parameters).length} parameters
            </span>
          </div>
        </div>

        {/* Validation Results */}
        <div className="space-y-3">
          {validationResults.errors.length > 0 && (
            <div className="bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <AlertCircle className="h-4 w-4 text-danger-600" />
                <span className="text-sm font-medium text-danger-800 dark:text-danger-200">
                  Errors Found
                </span>
              </div>
              <ul className="text-sm text-danger-700 dark:text-danger-300 space-y-1">
                {validationResults.errors.map((error, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <span className="w-1 h-1 bg-danger-500 rounded-full"></span>
                    <span>{error}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {validationResults.warnings.length > 0 && (
            <div className="bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <AlertCircle className="h-4 w-4 text-warning-600" />
                <span className="text-sm font-medium text-warning-800 dark:text-warning-200">
                  Warnings
                </span>
              </div>
              <ul className="text-sm text-warning-700 dark:text-warning-300 space-y-1">
                {validationResults.warnings.map((warning, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <span className="w-1 h-1 bg-warning-500 rounded-full"></span>
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {validationResults.isValid && validationResults.warnings.length === 0 && (
            <div className="bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-success-600" />
                <span className="text-sm text-success-700 dark:text-success-300">
                  Strategy configuration looks good
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Performance Metrics */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded mb-2"></div>
                <div className="h-8 bg-neutral-100 dark:bg-neutral-800 rounded"></div>
              </div>
            ))}
          </div>
        ) : metrics ? (
          <div className="space-y-4">
            <h4 className="font-semibold text-neutral-900 dark:text-white">
              Estimated Performance
            </h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-1">
                  <DollarSign className="h-4 w-4 text-success-600" />
                  <span className="text-xs text-neutral-600 dark:text-neutral-400">
                    Est. Return
                  </span>
                </div>
                <div className="text-lg font-semibold text-neutral-900 dark:text-white">
                  ₹{metrics.estimatedReturn.toFixed(0)}
                </div>
              </div>
              
              <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-1">
                  <Percent className="h-4 w-4 text-primary-600" />
                  <span className="text-xs text-neutral-600 dark:text-neutral-400">
                    Return %
                  </span>
                </div>
                <div className={cn(
                  'text-lg font-semibold',
                  metrics.estimatedReturnPercent >= 0 ? 'text-success-600' : 'text-danger-600'
                )}>
                  {metrics.estimatedReturnPercent >= 0 ? '+' : ''}{metrics.estimatedReturnPercent.toFixed(1)}%
                </div>
              </div>
              
              <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-success-600" />
                  <span className="text-xs text-neutral-600 dark:text-neutral-400">
                    Win Rate
                  </span>
                </div>
                <div className="text-lg font-semibold text-neutral-900 dark:text-white">
                  {(metrics.winRate * 100).toFixed(0)}%
                </div>
              </div>
              
              <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-1">
                  <TrendingDown className="h-4 w-4 text-danger-600" />
                  <span className="text-xs text-neutral-600 dark:text-neutral-400">
                    Max Drawdown
                  </span>
                </div>
                <div className="text-lg font-semibold text-danger-600">
                  -{metrics.maxDrawdown.toFixed(1)}%
                </div>
              </div>
              
              <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-1">
                  <BarChart3 className="h-4 w-4 text-primary-600" />
                  <span className="text-xs text-neutral-600 dark:text-neutral-400">
                    Sharpe Ratio
                  </span>
                </div>
                <div className="text-lg font-semibold text-neutral-900 dark:text-white">
                  {metrics.sharpeRatio.toFixed(2)}
                </div>
              </div>
              
              <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-1">
                  <Activity className="h-4 w-4 text-neutral-600" />
                  <span className="text-xs text-neutral-600 dark:text-neutral-400">
                    Trades/Month
                  </span>
                </div>
                <div className="text-lg font-semibold text-neutral-900 dark:text-white">
                  {metrics.tradesPerMonth}
                </div>
              </div>
            </div>

            {/* Risk Assessment */}
            <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4">
              <h5 className="font-medium text-neutral-900 dark:text-white mb-3">
                Risk Assessment
              </h5>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">
                    Risk Score
                  </span>
                  <span className={cn(
                    'text-sm font-medium',
                    metrics.riskScore <= 3 ? 'text-success-600' :
                    metrics.riskScore <= 6 ? 'text-warning-600' : 'text-danger-600'
                  )}>
                    {metrics.riskScore.toFixed(1)}/10
                  </span>
                </div>
                <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                  <div
                    className={cn(
                      'h-2 rounded-full transition-all',
                      metrics.riskScore <= 3 ? 'bg-success-500' :
                      metrics.riskScore <= 6 ? 'bg-warning-500' : 'bg-danger-500'
                    )}
                    style={{ width: `${(metrics.riskScore / 10) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Disclaimer */}
        <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-3">
          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            <strong>Disclaimer:</strong> These are estimated metrics based on historical patterns and current parameters. 
            Actual performance may vary significantly. Always backtest your strategy before deployment.
          </p>
        </div>
      </div>
    </motion.div>
  );
}