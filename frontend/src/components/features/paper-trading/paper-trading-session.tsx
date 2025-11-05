'use client';

import { useState, useEffect, useCallback } from 'react';
import { Strategy, Order, Position, Alert } from '@/types/trading';
import { DeploymentConfig } from './strategy-deployment-modal';
import { Button, Badge, useToast } from '@/components/ui';
import { Play, Pause, Square, TrendingUp, TrendingDown, AlertTriangle, Clock, DollarSign } from 'lucide-react';
import { mockOrderService } from '@/mocks/services/order-service';
import { mockPositionService } from '@/mocks/services/position-service';
import { formatSafeDate } from '@/lib/utils/date-transform';

export interface PaperTradingSession {
  id: string;
  strategyId: string;
  strategy: Strategy;
  config: DeploymentConfig;
  status: 'RUNNING' | 'PAUSED' | 'STOPPED';
  startedAt: Date;
  pausedAt?: Date;
  stoppedAt?: Date;
  statistics: SessionStatistics;
  riskMetrics: RiskMetrics;
  alerts: Alert[];
}

interface SessionStatistics {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  totalPnL: number;
  totalPnLPercent: number;
  dayPnL: number;
  dayPnLPercent: number;
  maxDrawdown: number;
  maxDrawdownPercent: number;
  winRate: number;
  profitFactor: number;
  avgWin: number;
  avgLoss: number;
  largestWin: number;
  largestLoss: number;
  currentCapital: number;
  capitalUtilization: number;
  activePositions: number;
  pendingOrders: number;
}

interface RiskMetrics {
  dailyLossUsed: number;
  dailyLossPercent: number;
  drawdownUsed: number;
  drawdownPercent: number;
  positionSizeUsed: number;
  positionSizePercent: number;
  riskPerTradeUsed: number;
  riskPerTradePercent: number;
  isRiskLimitBreached: boolean;
  riskAlerts: string[];
}

interface PaperTradingSessionProps {
  session: PaperTradingSession;
  onUpdateSession: (session: PaperTradingSession) => void;
  onStopSession: (sessionId: string) => void;
}

export function PaperTradingSessionComponent({
  session,
  onUpdateSession,
  onStopSession,
}: PaperTradingSessionProps) {
  const { addToast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastSignalTime, setLastSignalTime] = useState<Date | null>(null);
  const [nextSignalCountdown, setNextSignalCountdown] = useState<number>(0);

  // Simulate strategy signal generation
  const generateStrategySignal = useCallback(() => {
    if (session.status !== 'RUNNING') return;

    // Check if within trading hours
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    const { start, end } = session.config.tradingHours;
    
    if (currentTime < start || currentTime > end) {
      return; // Outside trading hours
    }

    // Check risk limits
    if (session.riskMetrics.isRiskLimitBreached) {
      handleRiskLimitBreach();
      return;
    }

    // Simulate strategy logic based on type
    const shouldTrade = Math.random() < getSignalProbability(session.strategy);
    
    if (shouldTrade) {
      const signal = generateTradeSignal(session.strategy, session.config);
      if (signal) {
        executeTradeSignal(signal);
        setLastSignalTime(new Date());
      }
    }
  }, [session]);

  // Start/pause/stop session controls
  const handleStartPause = async () => {
    setIsProcessing(true);
    
    try {
      const updatedSession = { ...session };
      
      if (session.status === 'RUNNING') {
        updatedSession.status = 'PAUSED';
        updatedSession.pausedAt = new Date();
        
        addToast({
          type: 'info',
          title: 'Session Paused',
          description: `${session.strategy.name} paper trading has been paused.`,
        });
      } else {
        updatedSession.status = 'RUNNING';
        updatedSession.pausedAt = undefined;
        
        addToast({
          type: 'success',
          title: 'Session Resumed',
          description: `${session.strategy.name} paper trading has been resumed.`,
        });
      }
      
      onUpdateSession(updatedSession);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStop = async () => {
    setIsProcessing(true);
    
    try {
      // Close all open positions
      const positions = mockPositionService.getPositions();
      const strategyPositions = positions.filter(p => 
        // In a real implementation, positions would have strategyId
        true // For now, close all positions when stopping
      );
      
      for (const position of strategyPositions) {
        mockPositionService.closePosition(position.id);
      }
      
      // Cancel all pending orders
      const orders = mockOrderService.getOrders();
      const strategyOrders = orders.filter(o => 
        o.strategyId === session.strategyId && 
        (o.status === 'PENDING' || o.status === 'PARTIALLY_FILLED')
      );
      
      for (const order of strategyOrders) {
        mockOrderService.cancelOrder(order.id);
      }
      
      onStopSession(session.id);
      
      addToast({
        type: 'success',
        title: 'Session Stopped',
        description: `${session.strategy.name} paper trading has been stopped and all positions closed.`,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Risk management
  const handleRiskLimitBreach = () => {
    const updatedSession = { ...session };
    updatedSession.status = 'PAUSED';
    updatedSession.pausedAt = new Date();
    
    // Add risk alert
    const alert: Alert = {
      id: `alert-${Date.now()}`,
      type: 'ERROR',
      title: 'Risk Limit Breached',
      message: `Strategy ${session.strategy.name} has been paused due to risk limit breach.`,
      strategyId: session.strategyId,
      isRead: false,
      createdAt: new Date(),
    };
    
    updatedSession.alerts.unshift(alert);
    onUpdateSession(updatedSession);
    
    addToast({
      type: 'error',
      title: 'Risk Limit Breached',
      description: 'Paper trading session has been paused due to risk management rules.',
    });
  };

  // Signal generation logic
  const getSignalProbability = (strategy: Strategy): number => {
    // Base probability varies by strategy type
    const baseProbability = {
      'TEMPLATE': 0.02, // 2% chance per check
      'CODE': 0.015,    // 1.5% chance per check
      'VISUAL': 0.025,  // 2.5% chance per check
    }[strategy.type] || 0.02;
    
    // Adjust based on market conditions (simulated)
    const marketVolatility = Math.random();
    const adjustedProbability = baseProbability * (1 + marketVolatility);
    
    return Math.min(adjustedProbability, 0.1); // Cap at 10%
  };

  const generateTradeSignal = (strategy: Strategy, config: DeploymentConfig) => {
    // Check if we can place more trades
    if (session.statistics.activePositions >= config.maxConcurrentTrades) {
      return null;
    }
    
    // Simulate signal generation based on strategy parameters
    const side = Math.random() > 0.5 ? 'BUY' : 'SELL';
    const symbol = strategy.parameters?.symbol || 'RELIANCE';
    const baseQuantity = strategy.parameters?.quantity || 100;
    
    // Adjust quantity based on position sizing rules
    const maxQuantity = Math.floor(config.maxPositionSize / 1000); // Assuming ₹1000 per share
    const quantity = Math.min(baseQuantity, maxQuantity);
    
    return {
      symbol,
      side,
      type: 'MARKET' as const,
      quantity,
      strategyId: strategy.id,
      tags: ['paper-trading', 'auto-generated'],
    };
  };

  const executeTradeSignal = (signal: any) => {
    try {
      const order = mockOrderService.placeOrder(signal);
      
      if (order.status === 'REJECTED') {
        addToast({
          type: 'warning',
          title: 'Signal Rejected',
          description: `Trade signal for ${signal.symbol} was rejected: ${order.rejectionReason}`,
        });
      } else {
        addToast({
          type: 'info',
          title: 'Trade Signal Executed',
          description: `${signal.side} ${signal.quantity} ${signal.symbol} - Order placed`,
        });
      }
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Signal Execution Failed',
        description: 'Failed to execute trade signal',
      });
    }
  };

  // Update session statistics periodically
  useEffect(() => {
    if (session.status !== 'RUNNING') return;

    const interval = setInterval(() => {
      // Update statistics from current positions and orders
      const positions = mockPositionService.getPositions();
      const orders = mockOrderService.getOrders();
      const portfolio = mockPositionService.getPortfolio();
      
      // Calculate updated statistics
      const updatedStatistics: SessionStatistics = {
        ...session.statistics,
        activePositions: positions.length,
        pendingOrders: orders.filter(o => o.status === 'PENDING' || o.status === 'PARTIALLY_FILLED').length,
        totalPnL: portfolio.totalPnL,
        totalPnLPercent: (portfolio.totalPnL / session.config.capital) * 100,
        dayPnL: portfolio.dayPnL,
        dayPnLPercent: (portfolio.dayPnL / session.config.capital) * 100,
        currentCapital: session.config.capital + portfolio.totalPnL,
        capitalUtilization: (portfolio.totalValue / session.config.capital) * 100,
      };
      
      // Calculate risk metrics
      const updatedRiskMetrics: RiskMetrics = {
        ...session.riskMetrics,
        dailyLossUsed: Math.abs(Math.min(portfolio.dayPnL, 0)),
        dailyLossPercent: (Math.abs(Math.min(portfolio.dayPnL, 0)) / session.config.capital) * 100,
        drawdownUsed: Math.abs(Math.min(portfolio.totalPnL, 0)),
        drawdownPercent: (Math.abs(Math.min(portfolio.totalPnL, 0)) / session.config.capital) * 100,
        positionSizeUsed: portfolio.totalValue,
        positionSizePercent: (portfolio.totalValue / session.config.capital) * 100,
      };
      
      // Check risk limits
      updatedRiskMetrics.isRiskLimitBreached = 
        updatedRiskMetrics.dailyLossUsed >= session.config.maxDailyLoss ||
        updatedRiskMetrics.drawdownUsed >= session.config.maxDrawdown;
      
      const updatedSession = {
        ...session,
        statistics: updatedStatistics,
        riskMetrics: updatedRiskMetrics,
      };
      
      onUpdateSession(updatedSession);
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [session, onUpdateSession]);

  // Strategy signal generation timer
  useEffect(() => {
    if (session.status !== 'RUNNING') return;

    const interval = setInterval(() => {
      generateStrategySignal();
    }, 10000); // Check for signals every 10 seconds

    return () => clearInterval(interval);
  }, [generateStrategySignal]);

  // Countdown timer for next signal check
  useEffect(() => {
    if (session.status !== 'RUNNING') return;

    const interval = setInterval(() => {
      setNextSignalCountdown(prev => Math.max(0, prev - 1));
    }, 1000);

    // Reset countdown every 10 seconds
    const resetInterval = setInterval(() => {
      setNextSignalCountdown(10);
    }, 10000);

    return () => {
      clearInterval(interval);
      clearInterval(resetInterval);
    };
  }, [session.status]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RUNNING': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'PAUSED': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'STOPPED': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-neutral-100 text-neutral-800 dark:bg-neutral-900 dark:text-neutral-200';
    }
  };

  const formatDuration = (startTime: Date, endTime?: Date) => {
    const end = endTime || new Date();
    const duration = Math.floor((end.getTime() - startTime.getTime()) / 1000);
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = duration % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
            <TrendingUp className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
              {session.strategy.name}
            </h3>
            <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
              <Badge className={getStatusColor(session.status)}>
                {session.status}
              </Badge>
              <span>•</span>
              <span>Running for {formatDuration(session.startedAt, session.stoppedAt)}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleStartPause}
            disabled={isProcessing || session.status === 'STOPPED'}
          >
            {session.status === 'RUNNING' ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Resume
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleStop}
            disabled={isProcessing || session.status === 'STOPPED'}
            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          >
            <Square className="w-4 h-4 mr-2" />
            Stop
          </Button>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
        <div className="text-center p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
          <p className="text-xs text-neutral-600 dark:text-neutral-400">Total P&L</p>
          <p className={`text-lg font-bold ${
            session.statistics.totalPnL >= 0 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-red-600 dark:text-red-400'
          }`}>
            ₹{(session.statistics.totalPnL / 1000).toFixed(1)}K
          </p>
          <p className="text-xs text-neutral-500">
            {session.statistics.totalPnLPercent.toFixed(2)}%
          </p>
        </div>
        
        <div className="text-center p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
          <p className="text-xs text-neutral-600 dark:text-neutral-400">Day P&L</p>
          <p className={`text-lg font-bold ${
            session.statistics.dayPnL >= 0 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-red-600 dark:text-red-400'
          }`}>
            ₹{(session.statistics.dayPnL / 1000).toFixed(1)}K
          </p>
          <p className="text-xs text-neutral-500">
            {session.statistics.dayPnLPercent.toFixed(2)}%
          </p>
        </div>
        
        <div className="text-center p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
          <p className="text-xs text-neutral-600 dark:text-neutral-400">Win Rate</p>
          <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
            {(session.statistics.winRate * 100).toFixed(1)}%
          </p>
          <p className="text-xs text-neutral-500">
            {session.statistics.winningTrades}/{session.statistics.totalTrades}
          </p>
        </div>
        
        <div className="text-center p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
          <p className="text-xs text-neutral-600 dark:text-neutral-400">Active Positions</p>
          <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
            {session.statistics.activePositions}
          </p>
          <p className="text-xs text-neutral-500">
            Max: {session.config.maxConcurrentTrades}
          </p>
        </div>
        
        <div className="text-center p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
          <p className="text-xs text-neutral-600 dark:text-neutral-400">Capital Used</p>
          <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
            {session.statistics.capitalUtilization.toFixed(1)}%
          </p>
          <p className="text-xs text-neutral-500">
            ₹{(session.statistics.currentCapital / 100000).toFixed(1)}L
          </p>
        </div>
        
        <div className="text-center p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
          <p className="text-xs text-neutral-600 dark:text-neutral-400">Next Signal</p>
          <p className="text-lg font-bold text-neutral-600 dark:text-neutral-400">
            {session.status === 'RUNNING' ? `${nextSignalCountdown}s` : '--'}
          </p>
          <p className="text-xs text-neutral-500">
            {lastSignalTime ? formatSafeDate(lastSignalTime, { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'None'}
          </p>
        </div>
      </div>

      {/* Risk Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-neutral-600 dark:text-neutral-400">Daily Loss</span>
            <span className={`text-xs font-medium ${
              session.riskMetrics.dailyLossPercent > 80 ? 'text-red-600' : 
              session.riskMetrics.dailyLossPercent > 60 ? 'text-yellow-600' : 'text-green-600'
            }`}>
              {session.riskMetrics.dailyLossPercent.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                session.riskMetrics.dailyLossPercent > 80 ? 'bg-red-500' : 
                session.riskMetrics.dailyLossPercent > 60 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(session.riskMetrics.dailyLossPercent, 100)}%` }}
            />
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            ₹{(session.riskMetrics.dailyLossUsed / 1000).toFixed(1)}K / ₹{(session.config.maxDailyLoss / 1000).toFixed(1)}K
          </p>
        </div>
        
        <div className="p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-neutral-600 dark:text-neutral-400">Drawdown</span>
            <span className={`text-xs font-medium ${
              session.riskMetrics.drawdownPercent > 80 ? 'text-red-600' : 
              session.riskMetrics.drawdownPercent > 60 ? 'text-yellow-600' : 'text-green-600'
            }`}>
              {session.riskMetrics.drawdownPercent.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                session.riskMetrics.drawdownPercent > 80 ? 'bg-red-500' : 
                session.riskMetrics.drawdownPercent > 60 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(session.riskMetrics.drawdownPercent, 100)}%` }}
            />
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            ₹{(session.riskMetrics.drawdownUsed / 1000).toFixed(1)}K / ₹{(session.config.maxDrawdown / 1000).toFixed(1)}K
          </p>
        </div>
        
        <div className="p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-neutral-600 dark:text-neutral-400">Position Size</span>
            <span className={`text-xs font-medium ${
              session.riskMetrics.positionSizePercent > 80 ? 'text-red-600' : 
              session.riskMetrics.positionSizePercent > 60 ? 'text-yellow-600' : 'text-green-600'
            }`}>
              {session.riskMetrics.positionSizePercent.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                session.riskMetrics.positionSizePercent > 80 ? 'bg-red-500' : 
                session.riskMetrics.positionSizePercent > 60 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(session.riskMetrics.positionSizePercent, 100)}%` }}
            />
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            ₹{(session.riskMetrics.positionSizeUsed / 1000).toFixed(1)}K / ₹{(session.config.maxPositionSize / 1000).toFixed(1)}K
          </p>
        </div>
        
        <div className="p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className={`w-4 h-4 ${
              session.riskMetrics.isRiskLimitBreached ? 'text-red-500' : 'text-green-500'
            }`} />
            <span className="text-xs text-neutral-600 dark:text-neutral-400">Risk Status</span>
          </div>
          <p className={`text-sm font-medium ${
            session.riskMetrics.isRiskLimitBreached ? 'text-red-600' : 'text-green-600'
          }`}>
            {session.riskMetrics.isRiskLimitBreached ? 'BREACH' : 'NORMAL'}
          </p>
          <p className="text-xs text-neutral-500 mt-1">
            {session.riskMetrics.riskAlerts.length} alerts
          </p>
        </div>
      </div>

      {/* Recent Alerts */}
      {session.alerts.length > 0 && (
        <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4">
          <h4 className="text-sm font-medium text-neutral-900 dark:text-white mb-3">
            Recent Alerts
          </h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {session.alerts.slice(0, 3).map((alert) => (
              <div key={alert.id} className="flex items-start gap-3 p-2 bg-neutral-50 dark:bg-neutral-900 rounded">
                <AlertTriangle className={`w-4 h-4 mt-0.5 ${
                  alert.type === 'ERROR' ? 'text-red-500' : 
                  alert.type === 'WARNING' ? 'text-yellow-500' : 'text-blue-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">
                    {alert.title}
                  </p>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 truncate">
                    {alert.message}
                  </p>
                </div>
                <span className="text-xs text-neutral-500">
                  {formatSafeDate(alert.createdAt, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}