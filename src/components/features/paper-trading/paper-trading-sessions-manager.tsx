'use client';

import { useState, useEffect } from 'react';
import { Strategy, Alert } from '@/types/trading';
import { PaperTradingSession, PaperTradingSessionComponent } from './paper-trading-session';
import { StrategyDeploymentModal, DeploymentConfig } from './strategy-deployment-modal';
import { Button, Badge, useToast } from '@/components/ui';
import { Plus, Play, Pause, Square, TrendingUp, AlertTriangle, Clock } from 'lucide-react';
import { mockStrategies } from '@/mocks/data/strategies';

interface PaperTradingSessionsManagerProps {
  onSessionUpdate?: (sessions: PaperTradingSession[]) => void;
}

export function PaperTradingSessionsManager({
  onSessionUpdate,
}: PaperTradingSessionsManagerProps) {
  const { addToast } = useToast();
  const [sessions, setSessions] = useState<PaperTradingSession[]>([]);
  const [strategies] = useState<Strategy[]>(mockStrategies.filter(s => s.status === 'ACTIVE'));
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);
  const [isDeploymentModalOpen, setIsDeploymentModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load existing sessions from localStorage on mount
  useEffect(() => {
    const savedSessions = localStorage.getItem('paperTradingSessions');
    if (savedSessions) {
      try {
        const parsedSessions = JSON.parse(savedSessions).map((session: any) => ({
          ...session,
          startedAt: new Date(session.startedAt),
          pausedAt: session.pausedAt ? new Date(session.pausedAt) : undefined,
          stoppedAt: session.stoppedAt ? new Date(session.stoppedAt) : undefined,
          alerts: session.alerts.map((alert: any) => ({
            ...alert,
            createdAt: new Date(alert.createdAt),
            expiresAt: alert.expiresAt ? new Date(alert.expiresAt) : undefined,
          })),
        }));
        setSessions(parsedSessions);
      } catch (error) {
        console.error('Failed to load saved sessions:', error);
      }
    }
  }, []);

  // Save sessions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('paperTradingSessions', JSON.stringify(sessions));
    onSessionUpdate?.(sessions);
  }, [sessions, onSessionUpdate]);

  const handleDeployStrategy = (strategy: Strategy) => {
    // Check if strategy is already deployed
    const existingSession = sessions.find(s => 
      s.strategyId === strategy.id && s.status !== 'STOPPED'
    );
    
    if (existingSession) {
      addToast({
        type: 'warning',
        title: 'Strategy Already Deployed',
        description: `${strategy.name} is already running in paper trading.`,
      });
      return;
    }
    
    setSelectedStrategy(strategy);
    setIsDeploymentModalOpen(true);
  };

  const handleConfirmDeployment = async (config: DeploymentConfig) => {
    if (!selectedStrategy) return;
    
    setIsLoading(true);
    
    try {
      // Create new session
      const newSession: PaperTradingSession = {
        id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        strategyId: selectedStrategy.id,
        strategy: selectedStrategy,
        config,
        status: 'RUNNING',
        startedAt: new Date(),
        statistics: {
          totalTrades: 0,
          winningTrades: 0,
          losingTrades: 0,
          totalPnL: 0,
          totalPnLPercent: 0,
          dayPnL: 0,
          dayPnLPercent: 0,
          maxDrawdown: 0,
          maxDrawdownPercent: 0,
          winRate: 0,
          profitFactor: 0,
          avgWin: 0,
          avgLoss: 0,
          largestWin: 0,
          largestLoss: 0,
          currentCapital: config.capital,
          capitalUtilization: 0,
          activePositions: 0,
          pendingOrders: 0,
        },
        riskMetrics: {
          dailyLossUsed: 0,
          dailyLossPercent: 0,
          drawdownUsed: 0,
          drawdownPercent: 0,
          positionSizeUsed: 0,
          positionSizePercent: 0,
          riskPerTradeUsed: 0,
          riskPerTradePercent: 0,
          isRiskLimitBreached: false,
          riskAlerts: [],
        },
        alerts: [],
      };
      
      setSessions(prev => [newSession, ...prev]);
      
      addToast({
        type: 'success',
        title: 'Strategy Deployed',
        description: `${selectedStrategy.name} has been deployed to paper trading.`,
      });
      
      setIsDeploymentModalOpen(false);
      setSelectedStrategy(null);
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Deployment Failed',
        description: 'Failed to deploy strategy. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateSession = (updatedSession: PaperTradingSession) => {
    setSessions(prev => 
      prev.map(session => 
        session.id === updatedSession.id ? updatedSession : session
      )
    );
  };

  const handleStopSession = (sessionId: string) => {
    setSessions(prev => 
      prev.map(session => 
        session.id === sessionId 
          ? { ...session, status: 'STOPPED' as const, stoppedAt: new Date() }
          : session
      )
    );
    
    addToast({
      type: 'info',
      title: 'Session Stopped',
      description: 'Paper trading session has been stopped.',
    });
  };

  const handleStopAllSessions = () => {
    const runningSessions = sessions.filter(s => s.status === 'RUNNING' || s.status === 'PAUSED');
    
    if (runningSessions.length === 0) {
      addToast({
        type: 'info',
        title: 'No Active Sessions',
        description: 'There are no active sessions to stop.',
      });
      return;
    }
    
    setSessions(prev => 
      prev.map(session => 
        session.status !== 'STOPPED' 
          ? { ...session, status: 'STOPPED' as const, stoppedAt: new Date() }
          : session
      )
    );
    
    addToast({
      type: 'success',
      title: 'All Sessions Stopped',
      description: `Stopped ${runningSessions.length} active sessions.`,
    });
  };

  const activeSessions = sessions.filter(s => s.status !== 'STOPPED');
  const runningSessions = sessions.filter(s => s.status === 'RUNNING');
  const totalPnL = sessions.reduce((sum, s) => sum + s.statistics.totalPnL, 0);
  const totalCapital = sessions.reduce((sum, s) => sum + s.config.capital, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Paper Trading Sessions
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400">
            Deploy and manage your strategy paper trading sessions
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {activeSessions.length > 0 && (
            <Button
              variant="outline"
              onClick={handleStopAllSessions}
              className="text-red-600 hover:text-red-700 dark:text-red-400"
            >
              <Square className="w-4 h-4 mr-2" />
              Stop All
            </Button>
          )}
          
          <Button onClick={() => setIsDeploymentModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Deploy Strategy
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      {sessions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
          <div className="text-center">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Active Sessions</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {activeSessions.length}
            </p>
            <p className="text-xs text-neutral-500">
              {runningSessions.length} running
            </p>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Total P&L</p>
            <p className={`text-2xl font-bold ${
              totalPnL >= 0 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              ₹{(totalPnL / 1000).toFixed(1)}K
            </p>
            <p className="text-xs text-neutral-500">
              {totalCapital > 0 ? ((totalPnL / totalCapital) * 100).toFixed(2) : '0.00'}%
            </p>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Total Capital</p>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white">
              ₹{(totalCapital / 100000).toFixed(1)}L
            </p>
            <p className="text-xs text-neutral-500">
              Deployed across {sessions.length} strategies
            </p>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Total Trades</p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {sessions.reduce((sum, s) => sum + s.statistics.totalTrades, 0)}
            </p>
            <p className="text-xs text-neutral-500">
              {sessions.reduce((sum, s) => sum + s.statistics.winningTrades, 0)} wins
            </p>
          </div>
        </div>
      )}

      {/* Available Strategies for Deployment */}
      {!isDeploymentModalOpen && strategies.length > 0 && (
        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
            Available Strategies
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {strategies.map((strategy) => {
              const isDeployed = sessions.some(s => 
                s.strategyId === strategy.id && s.status !== 'STOPPED'
              );
              
              return (
                <div
                  key={strategy.id}
                  className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:border-primary-300 dark:hover:border-primary-600 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-neutral-900 dark:text-white">
                        {strategy.name}
                      </h4>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {strategy.type} • {strategy.parameters?.symbol || 'N/A'}
                      </p>
                    </div>
                    <Badge className={`${
                      isDeployed 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-neutral-100 text-neutral-800 dark:bg-neutral-900 dark:text-neutral-200'
                    }`}>
                      {isDeployed ? 'Deployed' : 'Available'}
                    </Badge>
                  </div>
                  
                  {strategy.performance && (
                    <div className="mb-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-neutral-600 dark:text-neutral-400">Backtest Return:</span>
                        <span className={`font-medium ${
                          strategy.performance.totalReturnPercent >= 0 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {strategy.performance.totalReturnPercent.toFixed(2)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600 dark:text-neutral-400">Win Rate:</span>
                        <span className="font-medium text-neutral-900 dark:text-white">
                          {(strategy.performance.winRate * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <Button
                    size="sm"
                    variant={isDeployed ? "outline" : "primary"}
                    onClick={() => handleDeployStrategy(strategy)}
                    disabled={isDeployed || isLoading}
                    className="w-full"
                  >
                    {isDeployed ? (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Already Deployed
                      </>
                    ) : (
                      <>
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Deploy to Paper Trading
                      </>
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Sessions */}
      {activeSessions.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
            Active Sessions ({activeSessions.length})
          </h3>
          {activeSessions.map((session) => (
            <PaperTradingSessionComponent
              key={session.id}
              session={session}
              onUpdateSession={handleUpdateSession}
              onStopSession={handleStopSession}
            />
          ))}
        </div>
      )}

      {/* Stopped Sessions */}
      {sessions.filter(s => s.status === 'STOPPED').length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
            Stopped Sessions ({sessions.filter(s => s.status === 'STOPPED').length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sessions.filter(s => s.status === 'STOPPED').map((session) => (
              <div
                key={session.id}
                className="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-700"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-neutral-900 dark:text-white">
                    {session.strategy.name}
                  </h4>
                  <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                    STOPPED
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-neutral-600 dark:text-neutral-400">Final P&L</p>
                    <p className={`font-medium ${
                      session.statistics.totalPnL >= 0 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      ₹{(session.statistics.totalPnL / 1000).toFixed(1)}K
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-neutral-600 dark:text-neutral-400">Total Trades</p>
                    <p className="font-medium text-neutral-900 dark:text-white">
                      {session.statistics.totalTrades}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-neutral-600 dark:text-neutral-400">Duration</p>
                    <p className="font-medium text-neutral-900 dark:text-white">
                      {session.stoppedAt && Math.floor((session.stoppedAt.getTime() - session.startedAt.getTime()) / (1000 * 60 * 60))}h
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-neutral-600 dark:text-neutral-400">Win Rate</p>
                    <p className="font-medium text-neutral-900 dark:text-white">
                      {(session.statistics.winRate * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {sessions.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <TrendingUp className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
            No Paper Trading Sessions
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            Deploy your first strategy to start paper trading and test your algorithms with real market simulation.
          </p>
          <Button onClick={() => setIsDeploymentModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Deploy Your First Strategy
          </Button>
        </div>
      )}

      {/* Deployment Modal */}
      {selectedStrategy && (
        <StrategyDeploymentModal
          isOpen={isDeploymentModalOpen}
          onClose={() => {
            setIsDeploymentModalOpen(false);
            setSelectedStrategy(null);
          }}
          strategy={selectedStrategy}
          onDeploy={handleConfirmDeployment}
        />
      )}

      {/* Strategy Selection Modal */}
      {!selectedStrategy && isDeploymentModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
              Select Strategy to Deploy
            </h2>
            
            <div className="space-y-3 mb-6">
              {strategies.map((strategy) => {
                const isDeployed = sessions.some(s => 
                  s.strategyId === strategy.id && s.status !== 'STOPPED'
                );
                
                return (
                  <button
                    key={strategy.id}
                    onClick={() => {
                      if (!isDeployed) {
                        setSelectedStrategy(strategy);
                      }
                    }}
                    disabled={isDeployed}
                    className={`w-full p-4 text-left border rounded-lg transition-colors ${
                      isDeployed
                        ? 'border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 cursor-not-allowed'
                        : 'border-neutral-200 dark:border-neutral-700 hover:border-primary-300 dark:hover:border-primary-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-neutral-900 dark:text-white">
                        {strategy.name}
                      </h3>
                      <Badge className={`${
                        isDeployed 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      }`}>
                        {isDeployed ? 'Already Deployed' : strategy.type}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                      {strategy.description}
                    </p>
                    
                    {strategy.performance && (
                      <div className="flex gap-4 text-sm">
                        <span className="text-neutral-600 dark:text-neutral-400">
                          Return: <span className={`font-medium ${
                            strategy.performance.totalReturnPercent >= 0 
                              ? 'text-green-600 dark:text-green-400' 
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            {strategy.performance.totalReturnPercent.toFixed(2)}%
                          </span>
                        </span>
                        <span className="text-neutral-600 dark:text-neutral-400">
                          Win Rate: <span className="font-medium text-neutral-900 dark:text-white">
                            {(strategy.performance.winRate * 100).toFixed(1)}%
                          </span>
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setIsDeploymentModalOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}