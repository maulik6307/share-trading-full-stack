'use client';

import { useState } from 'react';
import { Strategy } from '@/types/trading';
import { Button, Modal, Input, Select, Label, useToast } from '@/components/ui';
import { AlertTriangle, TrendingUp, DollarSign, Settings } from 'lucide-react';

interface StrategyDeploymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  strategy: Strategy;
  onDeploy: (deploymentConfig: DeploymentConfig) => void;
}

export interface DeploymentConfig {
  strategyId: string;
  capital: number;
  maxPositionSize: number;
  maxPositionSizePercent: number;
  riskPerTrade: number;
  riskPerTradePercent: number;
  maxDailyLoss: number;
  maxDailyLossPercent: number;
  maxDrawdown: number;
  maxDrawdownPercent: number;
  enableStopLoss: boolean;
  stopLossPercent: number;
  enableTakeProfit: boolean;
  takeProfitPercent: number;
  enableTrailingStop: boolean;
  trailingStopPercent: number;
  maxConcurrentTrades: number;
  tradingHours: {
    start: string;
    end: string;
    timezone: string;
  };
  notifications: {
    onTrade: boolean;
    onProfit: boolean;
    onLoss: boolean;
    onRiskAlert: boolean;
  };
}

export function StrategyDeploymentModal({
  isOpen,
  onClose,
  strategy,
  onDeploy,
}: StrategyDeploymentModalProps) {
  const { addToast } = useToast();
  const [config, setConfig] = useState<DeploymentConfig>({
    strategyId: strategy.id,
    capital: 100000, // Default 1 lakh
    maxPositionSize: 20000, // Default 20k per position
    maxPositionSizePercent: 20, // 20% of capital
    riskPerTrade: 2000, // Default 2k risk per trade
    riskPerTradePercent: 2, // 2% of capital
    maxDailyLoss: 5000, // Default 5k daily loss limit
    maxDailyLossPercent: 5, // 5% of capital
    maxDrawdown: 10000, // Default 10k max drawdown
    maxDrawdownPercent: 10, // 10% of capital
    enableStopLoss: true,
    stopLossPercent: 2,
    enableTakeProfit: true,
    takeProfitPercent: 4,
    enableTrailingStop: false,
    trailingStopPercent: 1,
    maxConcurrentTrades: 3,
    tradingHours: {
      start: '09:15',
      end: '15:30',
      timezone: 'Asia/Kolkata',
    },
    notifications: {
      onTrade: true,
      onProfit: true,
      onLoss: true,
      onRiskAlert: true,
    },
  });

  const [activeTab, setActiveTab] = useState<'sizing' | 'risk' | 'execution' | 'notifications'>('sizing');
  const [isDeploying, setIsDeploying] = useState(false);

  const handleDeploy = async () => {
    // Validate configuration
    const validation = validateConfig(config);
    if (!validation.isValid) {
      addToast({
        type: 'error',
        title: 'Invalid Configuration',
        description: validation.message,
      });
      return;
    }

    setIsDeploying(true);
    
    try {
      // Simulate deployment delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      onDeploy(config);
      
      addToast({
        type: 'success',
        title: 'Strategy Deployed',
        description: `${strategy.name} has been successfully deployed to paper trading.`,
      });
      
      onClose();
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Deployment Failed',
        description: 'Failed to deploy strategy. Please try again.',
      });
    } finally {
      setIsDeploying(false);
    }
  };

  const validateConfig = (config: DeploymentConfig): { isValid: boolean; message?: string } => {
    if (config.capital <= 0) {
      return { isValid: false, message: 'Capital must be greater than 0' };
    }
    
    if (config.maxPositionSize > config.capital) {
      return { isValid: false, message: 'Max position size cannot exceed capital' };
    }
    
    if (config.riskPerTrade > config.capital * 0.1) {
      return { isValid: false, message: 'Risk per trade cannot exceed 10% of capital' };
    }
    
    if (config.maxDailyLoss > config.capital * 0.2) {
      return { isValid: false, message: 'Max daily loss cannot exceed 20% of capital' };
    }
    
    return { isValid: true };
  };

  const updateConfig = (field: keyof DeploymentConfig, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const updateNestedConfig = (parent: keyof DeploymentConfig, field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent] as any),
        [field]: value,
      },
    }));
  };

  const calculateRiskMetrics = () => {
    const positionSizePercent = (config.maxPositionSize / config.capital) * 100;
    const riskPercent = (config.riskPerTrade / config.capital) * 100;
    const dailyLossPercent = (config.maxDailyLoss / config.capital) * 100;
    const drawdownPercent = (config.maxDrawdown / config.capital) * 100;
    
    return {
      positionSizePercent,
      riskPercent,
      dailyLossPercent,
      drawdownPercent,
    };
  };

  const riskMetrics = calculateRiskMetrics();

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="p-6 max-h-128 overflow-y-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
            <TrendingUp className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
              Deploy Strategy to Paper Trading
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {strategy.name} • Configure deployment parameters
            </p>
          </div>
        </div>

        {/* Strategy Info */}
        <div className="mb-6 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-neutral-600 dark:text-neutral-400">Type</p>
              <p className="font-medium text-neutral-900 dark:text-white">{strategy.type}</p>
            </div>
            <div>
              <p className="text-neutral-600 dark:text-neutral-400">Status</p>
              <p className="font-medium text-neutral-900 dark:text-white">{strategy.status}</p>
            </div>
            <div>
              <p className="text-neutral-600 dark:text-neutral-400">Symbol</p>
              <p className="font-medium text-neutral-900 dark:text-white">
                {strategy.parameters?.symbol || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-neutral-600 dark:text-neutral-400">Last Backtest</p>
              <p className="font-medium text-neutral-900 dark:text-white">
                {strategy.performance ? `${strategy.performance.totalReturnPercent.toFixed(2)}%` : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-neutral-200 dark:border-neutral-700 mb-6">
          <nav className="flex space-x-8">
            {[
              { id: 'sizing', label: 'Position Sizing', icon: DollarSign },
              { id: 'risk', label: 'Risk Management', icon: AlertTriangle },
              { id: 'execution', label: 'Execution', icon: Settings },
              { id: 'notifications', label: 'Notifications', icon: TrendingUp },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === id
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6 min-h-[400px]">
          {activeTab === 'sizing' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="capital">Total Capital (₹)</Label>
                  <Input
                    id="capital"
                    type="number"
                    value={config.capital}
                    onChange={(e) => updateConfig('capital', Number(e.target.value))}
                    min={10000}
                    max={10000000}
                    step={1000}
                  />
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                    Total capital allocated for this strategy
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="maxPositionSize">Max Position Size (₹)</Label>
                  <Input
                    id="maxPositionSize"
                    type="number"
                    value={config.maxPositionSize}
                    onChange={(e) => updateConfig('maxPositionSize', Number(e.target.value))}
                    min={1000}
                    max={config.capital}
                    step={1000}
                  />
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                    {riskMetrics.positionSizePercent.toFixed(1)}% of capital
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="riskPerTrade">Risk Per Trade (₹)</Label>
                  <Input
                    id="riskPerTrade"
                    type="number"
                    value={config.riskPerTrade}
                    onChange={(e) => updateConfig('riskPerTrade', Number(e.target.value))}
                    min={100}
                    max={config.capital * 0.1}
                    step={100}
                  />
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                    {riskMetrics.riskPercent.toFixed(1)}% of capital
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="maxConcurrentTrades">Max Concurrent Trades</Label>
                  <Input
                    id="maxConcurrentTrades"
                    type="number"
                    value={config.maxConcurrentTrades}
                    onChange={(e) => updateConfig('maxConcurrentTrades', Number(e.target.value))}
                    min={1}
                    max={10}
                  />
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                    Maximum number of simultaneous positions
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'risk' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="maxDailyLoss">Max Daily Loss (₹)</Label>
                  <Input
                    id="maxDailyLoss"
                    type="number"
                    value={config.maxDailyLoss}
                    onChange={(e) => updateConfig('maxDailyLoss', Number(e.target.value))}
                    min={500}
                    max={config.capital * 0.2}
                    step={500}
                  />
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                    {riskMetrics.dailyLossPercent.toFixed(1)}% of capital
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="maxDrawdown">Max Drawdown (₹)</Label>
                  <Input
                    id="maxDrawdown"
                    type="number"
                    value={config.maxDrawdown}
                    onChange={(e) => updateConfig('maxDrawdown', Number(e.target.value))}
                    min={1000}
                    max={config.capital * 0.3}
                    step={1000}
                  />
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                    {riskMetrics.drawdownPercent.toFixed(1)}% of capital
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enableStopLoss">Stop Loss</Label>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">
                      Automatically close losing positions
                    </p>
                  </div>
                  <input
                    id="enableStopLoss"
                    type="checkbox"
                    checked={config.enableStopLoss}
                    onChange={(e) => updateConfig('enableStopLoss', e.target.checked)}
                    className="rounded border-neutral-300 dark:border-neutral-600"
                  />
                </div>
                
                {config.enableStopLoss && (
                  <div>
                    <Label htmlFor="stopLossPercent">Stop Loss %</Label>
                    <Input
                      id="stopLossPercent"
                      type="number"
                      value={config.stopLossPercent}
                      onChange={(e) => updateConfig('stopLossPercent', Number(e.target.value))}
                      min={0.5}
                      max={10}
                      step={0.1}
                    />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enableTakeProfit">Take Profit</Label>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">
                      Automatically close winning positions
                    </p>
                  </div>
                  <input
                    id="enableTakeProfit"
                    type="checkbox"
                    checked={config.enableTakeProfit}
                    onChange={(e) => updateConfig('enableTakeProfit', e.target.checked)}
                    className="rounded border-neutral-300 dark:border-neutral-600"
                  />
                </div>
                
                {config.enableTakeProfit && (
                  <div>
                    <Label htmlFor="takeProfitPercent">Take Profit %</Label>
                    <Input
                      id="takeProfitPercent"
                      type="number"
                      value={config.takeProfitPercent}
                      onChange={(e) => updateConfig('takeProfitPercent', Number(e.target.value))}
                      min={1}
                      max={20}
                      step={0.1}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'execution' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="tradingStart">Trading Start Time</Label>
                  <Input
                    id="tradingStart"
                    type="time"
                    value={config.tradingHours.start}
                    onChange={(e) => updateNestedConfig('tradingHours', 'start', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="tradingEnd">Trading End Time</Label>
                  <Input
                    id="tradingEnd"
                    type="time"
                    value={config.tradingHours.end}
                    onChange={(e) => updateNestedConfig('tradingHours', 'end', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <Select
                  value={config.tradingHours.timezone}
                  onChange={(e) => updateNestedConfig('tradingHours', 'timezone', e.target.value)}
                  options={[
                    { value: "Asia/Kolkata", label: "Asia/Kolkata (IST)" },
                    { value: "America/New_York", label: "America/New_York (EST)" },
                    { value: "Europe/London", label: "Europe/London (GMT)" },
                    { value: "Asia/Tokyo", label: "Asia/Tokyo (JST)" },
                  ]}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enableTrailingStop">Trailing Stop</Label>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                    Dynamic stop loss that follows profitable positions
                  </p>
                </div>
                <input
                  id="enableTrailingStop"
                  type="checkbox"
                  checked={config.enableTrailingStop}
                  onChange={(e) => updateConfig('enableTrailingStop', e.target.checked)}
                  className="rounded border-neutral-300 dark:border-neutral-600"
                />
              </div>
              
              {config.enableTrailingStop && (
                <div>
                  <Label htmlFor="trailingStopPercent">Trailing Stop %</Label>
                  <Input
                    id="trailingStopPercent"
                    type="number"
                    value={config.trailingStopPercent}
                    onChange={(e) => updateConfig('trailingStopPercent', Number(e.target.value))}
                    min={0.5}
                    max={5}
                    step={0.1}
                  />
                </div>
              )}
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-4">
              {[
                { key: 'onTrade', label: 'Trade Executions', description: 'Notify when trades are executed' },
                { key: 'onProfit', label: 'Profitable Trades', description: 'Notify when trades close with profit' },
                { key: 'onLoss', label: 'Loss Trades', description: 'Notify when trades close with loss' },
                { key: 'onRiskAlert', label: 'Risk Alerts', description: 'Notify when risk limits are approached' },
              ].map(({ key, label, description }) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <Label htmlFor={key}>{label}</Label>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">{description}</p>
                  </div>
                  <input
                    id={key}
                    type="checkbox"
                    checked={config.notifications[key as keyof typeof config.notifications]}
                    onChange={(e) => updateNestedConfig('notifications', key, e.target.checked)}
                    className="rounded border-neutral-300 dark:border-neutral-600"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-700">
          <Button variant="outline" onClick={onClose} disabled={isDeploying}>
            Cancel
          </Button>
          <Button onClick={handleDeploy} disabled={isDeploying}>
            {isDeploying ? 'Deploying...' : 'Deploy Strategy'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}