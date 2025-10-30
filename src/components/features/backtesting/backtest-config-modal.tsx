'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Calendar, 
  DollarSign, 
  Settings, 
  Play,
  AlertTriangle,
  Info
} from 'lucide-react';
import { Modal, Button, Input } from '@/components/ui';
import { Strategy } from '@/types/trading';
import { cn } from '@/lib/utils';

interface BacktestConfig {
  name: string;
  startDate: string;
  endDate: string;
  initialCapital: number;
  commission: number;
  slippage: number;
}

interface BacktestConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (config: BacktestConfig) => void;
  strategy?: Strategy | null;
  className?: string;
}

export function BacktestConfigModal({
  isOpen,
  onClose,
  onSubmit,
  strategy,
  className,
}: BacktestConfigModalProps) {
  const [config, setConfig] = useState<BacktestConfig>({
    name: '',
    startDate: '',
    endDate: '',
    initialCapital: 100000,
    commission: 0.1,
    slippage: 0.05,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set default dates and name when strategy changes
  useEffect(() => {
    if (strategy) {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 6); // Default to 6 months back
      
      setConfig(prev => ({
        ...prev,
        name: `${strategy.name} Backtest - ${new Date().toLocaleDateString()}`,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      }));
    }
  }, [strategy]);

  const validateConfig = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!config.name.trim()) {
      newErrors.name = 'Backtest name is required';
    }
    
    if (!config.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    
    if (!config.endDate) {
      newErrors.endDate = 'End date is required';
    }
    
    if (config.startDate && config.endDate) {
      const start = new Date(config.startDate);
      const end = new Date(config.endDate);
      const today = new Date();
      
      if (start >= end) {
        newErrors.endDate = 'End date must be after start date';
      }
      
      if (end > today) {
        newErrors.endDate = 'End date cannot be in the future';
      }
      
      // Check if date range is too short (less than 1 day)
      const daysDiff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
      if (daysDiff < 1) {
        newErrors.endDate = 'Date range must be at least 1 day';
      }
      
      // Warn if date range is too long (more than 2 years)
      if (daysDiff > 730) {
        newErrors.endDate = 'Date range longer than 2 years may take significant time to process';
      }
    }
    
    if (config.initialCapital <= 0) {
      newErrors.initialCapital = 'Initial capital must be greater than 0';
    }
    
    if (config.initialCapital < 1000) {
      newErrors.initialCapital = 'Initial capital should be at least $1,000 for realistic results';
    }
    
    if (config.commission < 0) {
      newErrors.commission = 'Commission cannot be negative';
    }
    
    if (config.commission > 10) {
      newErrors.commission = 'Commission seems unusually high (>$10 per trade)';
    }
    
    if (config.slippage < 0) {
      newErrors.slippage = 'Slippage cannot be negative';
    }
    
    if (config.slippage > 1) {
      newErrors.slippage = 'Slippage seems unusually high (>1%)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateConfig()) return;
    
    setIsSubmitting(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      onSubmit(config);
      handleClose();
    } catch (error) {
      console.error('Error submitting backtest:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setConfig({
      name: '',
      startDate: '',
      endDate: '',
      initialCapital: 100000,
      commission: 0.1,
      slippage: 0.05,
    });
    setErrors({});
    setIsSubmitting(false);
    onClose();
  };

  const handleInputChange = (field: keyof BacktestConfig, value: string | number) => {
    setConfig(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getDateRangeInfo = () => {
    if (!config.startDate || !config.endDate) return null;
    
    const start = new Date(config.startDate);
    const end = new Date(config.endDate);
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff <= 0) return null;
    
    const months = Math.floor(daysDiff / 30);
    const years = Math.floor(daysDiff / 365);
    
    let duration = '';
    if (years > 0) {
      duration = `${years} year${years > 1 ? 's' : ''}`;
      if (months % 12 > 0) {
        duration += ` ${months % 12} month${months % 12 > 1 ? 's' : ''}`;
      }
    } else if (months > 0) {
      duration = `${months} month${months > 1 ? 's' : ''}`;
    } else {
      duration = `${daysDiff} day${daysDiff > 1 ? 's' : ''}`;
    }
    
    return { daysDiff, duration };
  };

  const dateRangeInfo = getDateRangeInfo();

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="lg"
      className={cn('max-w-2xl', className)}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
              Configure Backtest
            </h2>
            {strategy && (
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                Strategy: <span className="font-medium">{strategy.name}</span>
              </p>
            )}
          </div>
          <button
            onClick={handleClose}
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Configuration Form */}
        <div className="space-y-6">
          {/* Basic Settings */}
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4 flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Basic Settings
            </h3>
            
            <div className="space-y-4">
              <Input
                label="Backtest Name"
                placeholder="Enter a name for this backtest"
                value={config.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                error={errors.name}
                required
              />
            </div>
          </div>

          {/* Date Range */}
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Date Range
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Start Date"
                type="date"
                value={config.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                error={errors.startDate}
                required
              />
              
              <Input
                label="End Date"
                type="date"
                value={config.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                error={errors.endDate}
                required
              />
            </div>
            
            {dateRangeInfo && (
              <div className="mt-3 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                <div className="flex items-center space-x-2 text-sm">
                  <Info className="h-4 w-4 text-primary-500" />
                  <span className="text-neutral-700 dark:text-neutral-300">
                    Duration: <span className="font-medium">{dateRangeInfo.duration}</span>
                    {dateRangeInfo.daysDiff > 365 && (
                      <span className="text-warning-600 dark:text-warning-400 ml-2">
                        (Long backtests may take several minutes)
                      </span>
                    )}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Financial Settings */}
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4 flex items-center">
              <DollarSign className="h-5 w-5 mr-2" />
              Financial Settings
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Initial Capital ($)"
                type="number"
                value={config.initialCapital}
                onChange={(e) => handleInputChange('initialCapital', Number(e.target.value))}
                error={errors.initialCapital}
                min={0}
                step={1000}
                required
              />
              
              <Input
                label="Commission ($ per trade)"
                type="number"
                value={config.commission}
                onChange={(e) => handleInputChange('commission', Number(e.target.value))}
                error={errors.commission}
                min={0}
                step={0.01}
              />
              
              <Input
                label="Slippage (%)"
                type="number"
                value={config.slippage}
                onChange={(e) => handleInputChange('slippage', Number(e.target.value))}
                error={errors.slippage}
                min={0}
                step={0.01}
              />
            </div>
            
            <div className="mt-3 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
              <div className="text-sm text-neutral-600 dark:text-neutral-400">
                <p className="mb-1">
                  <span className="font-medium">Commission:</span> Fixed cost per trade execution
                </p>
                <p>
                  <span className="font-medium">Slippage:</span> Market impact as percentage of trade value
                </p>
              </div>
            </div>
          </div>

          {/* Warning for strategy without parameters */}
          {strategy && Object.keys(strategy.parameters).length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 rounded-lg p-4"
            >
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-warning-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-warning-800 dark:text-warning-200">
                    Strategy Configuration Notice
                  </h4>
                  <p className="text-sm text-warning-700 dark:text-warning-300 mt-1">
                    This strategy has no configured parameters. Make sure the strategy logic is properly defined before running the backtest.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-neutral-200 dark:border-neutral-700">
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            {dateRangeInfo && (
              <span>
                Estimated runtime: {dateRangeInfo.daysDiff > 365 ? '2-5 minutes' : '30-60 seconds'}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting || !strategy}
              className="flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Starting...</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  <span>Start Backtest</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}