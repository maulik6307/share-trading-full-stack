'use client';

import { useState, useEffect } from 'react';
import { Bell, BellOff, Plus, X, TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button, Input, Modal } from '@/components/ui';
import { useSystemAlerts, useMarketData, useMockSocketControls } from '@/lib/hooks/use-mock-socket';
import { mockSymbols } from '@/mocks/data/symbols';
import { Alert, MarketData } from '@/types/trading';
import { formatSafeDate } from '@/lib/utils/date-transform';

interface PriceAlert {
  id: string;
  symbol: string;
  type: 'above' | 'below' | 'change_percent';
  threshold: number;
  isActive: boolean;
  createdAt: Date;
  triggeredAt?: Date;
  message?: string;
}

interface PriceAlertsProps {
  watchedSymbols?: string[];
  marketData?: MarketData[];
}

export function PriceAlerts({ watchedSymbols = [], marketData = [] }: PriceAlertsProps) {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [showCreateAlert, setShowCreateAlert] = useState(false);
  const [newAlert, setNewAlert] = useState({
    symbol: '',
    type: 'above' as 'above' | 'below' | 'change_percent',
    threshold: 0,
  });
  
  const { alerts: systemAlerts, unreadCount, markAllAsRead, clearAlerts } = useSystemAlerts();
  const { marketDataMap } = useMarketData(watchedSymbols);
  const { simulateAlert } = useMockSocketControls();

  // Load saved alerts from localStorage
  useEffect(() => {
    const savedAlerts = localStorage.getItem('priceAlerts');
    if (savedAlerts) {
      try {
        const parsed = JSON.parse(savedAlerts);
        setAlerts(parsed.map((alert: any) => ({
          ...alert,
          createdAt: new Date(alert.createdAt),
          triggeredAt: alert.triggeredAt ? new Date(alert.triggeredAt) : undefined,
        })));
      } catch (error) {
        console.error('Failed to load saved alerts:', error);
      }
    }
  }, []);

  // Save alerts to localStorage
  useEffect(() => {
    localStorage.setItem('priceAlerts', JSON.stringify(alerts));
  }, [alerts]);

  // Check for alert triggers
  useEffect(() => {
    alerts.forEach(alert => {
      if (!alert.isActive || alert.triggeredAt) return;
      
      const marketData = marketDataMap.get(alert.symbol);
      if (!marketData) return;
      
      let shouldTrigger = false;
      let message = '';
      
      switch (alert.type) {
        case 'above':
          shouldTrigger = marketData.price >= alert.threshold;
          message = `${alert.symbol} price above ₹${alert.threshold ? alert.threshold.toFixed(2) : '0.00'}: ₹${marketData.price ? marketData.price.toFixed(2) : '0.00'}`;
          break;
          
        case 'below':
          shouldTrigger = marketData.price <= alert.threshold;
          message = `${alert.symbol} price below ₹${alert.threshold ? alert.threshold.toFixed(2) : '0.00'}: ₹${marketData.price ? marketData.price.toFixed(2) : '0.00'}`;
          break;
          
        case 'change_percent':
          shouldTrigger = Math.abs(marketData.changePercent || 0) >= alert.threshold;
          message = `${alert.symbol} price change ${(marketData.changePercent || 0) >= 0 ? '+' : ''}${marketData.changePercent ? marketData.changePercent.toFixed(2) : '0.00'}% (threshold: ${alert.threshold}%)`;
          break;
      }
      
      if (shouldTrigger) {
        // Trigger system alert
        simulateAlert('WARNING', message);
        
        // Mark alert as triggered
        setAlerts(prev => prev.map(a => 
          a.id === alert.id 
            ? { ...a, triggeredAt: new Date(), message }
            : a
        ));
      }
    });
  }, [alerts, marketDataMap, simulateAlert]);

  const handleCreateAlert = () => {
    if (!newAlert.symbol || newAlert.threshold <= 0) return;
    
    const alert: PriceAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      symbol: newAlert.symbol,
      type: newAlert.type,
      threshold: newAlert.threshold,
      isActive: true,
      createdAt: new Date(),
    };
    
    setAlerts(prev => [...prev, alert]);
    setNewAlert({ symbol: '', type: 'above', threshold: 0 });
    setShowCreateAlert(false);
  };

  const handleDeleteAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId));
  };

  const handleToggleAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a => 
      a.id === alertId 
        ? { ...a, isActive: !a.isActive, triggeredAt: undefined }
        : a
    ));
  };

  const handleResetAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a => 
      a.id === alertId 
        ? { ...a, triggeredAt: undefined, isActive: true }
        : a
    ));
  };

  const getSymbolName = (symbolCode: string) => {
    return mockSymbols.find(s => s.symbol === symbolCode)?.name || symbolCode;
  };

  const getCurrentPrice = (symbol: string) => {
    return marketDataMap.get(symbol)?.price;
  };

  const formatAlertType = (type: string) => {
    switch (type) {
      case 'above': return 'Above';
      case 'below': return 'Below';
      case 'change_percent': return 'Change %';
      default: return type;
    }
  };

  const getAlertIcon = (alert: PriceAlert) => {
    if (alert.triggeredAt) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    
    if (!alert.isActive) {
      return <BellOff className="w-4 h-4 text-neutral-400" />;
    }
    
    switch (alert.type) {
      case 'above':
        return <TrendingUp className="w-4 h-4 text-blue-500" />;
      case 'below':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      case 'change_percent':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Bell className="w-4 h-4 text-neutral-500" />;
    }
  };

  const symbolOptions = mockSymbols.map(symbol => ({
    label: `${symbol.symbol} - ${symbol.name}`,
    value: symbol.symbol,
  }));

  return (
    <div className="space-y-6">
      {/* System Alerts */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Recent Alerts
              </h3>
              {unreadCount > 0 && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                  {unreadCount} new
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={markAllAsRead}
                >
                  Mark All Read
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={clearAlerts}
              >
                Clear All
              </Button>
            </div>
          </div>
        </div>
        
        <div className="max-h-64 overflow-y-auto">
          {systemAlerts.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
              <p className="text-neutral-500 dark:text-neutral-400">
                No alerts yet. Create price alerts to get notified of market movements.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {systemAlerts.map((alert, index) => (
                <div key={index} className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className={`p-1 rounded-full ${
                      alert.type === 'ERROR' ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400' :
                      alert.type === 'WARNING' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400' :
                      alert.type === 'SUCCESS' ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400' :
                      'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
                    }`}>
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-900 dark:text-white">
                        {alert.message}
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {alert.timestamp.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Price Alerts Management */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Price Alerts
            </h3>
            <Button
              onClick={() => setShowCreateAlert(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Alert
            </Button>
          </div>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {alerts.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
              <p className="text-neutral-500 dark:text-neutral-400 mb-4">
                No price alerts configured
              </p>
              <Button
                variant="outline"
                onClick={() => setShowCreateAlert(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Alert
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {alerts.map(alert => (
                <div key={alert.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getAlertIcon(alert)}
                      
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-neutral-900 dark:text-white">
                            {alert.symbol}
                          </span>
                          <span className="text-sm text-neutral-500 dark:text-neutral-400">
                            {formatAlertType(alert.type)}
                          </span>
                          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                            {alert.type === 'change_percent' ? `${alert.threshold}%` : `₹${alert.threshold ? alert.threshold.toFixed(2) : '0.00'}`}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-xs text-neutral-500 dark:text-neutral-400">
                          <span>{getSymbolName(alert.symbol)}</span>
                          {getCurrentPrice(alert.symbol) && (
                            <span>Current: ₹{getCurrentPrice(alert.symbol) ? getCurrentPrice(alert.symbol)!.toFixed(2) : '0.00'}</span>
                          )}
                          <span>Created: {formatSafeDate(alert.createdAt, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          {alert.triggeredAt && (
                            <span className="text-green-600 dark:text-green-400">
                              Triggered: {alert.triggeredAt.toLocaleString()}
                            </span>
                          )}
                        </div>
                        
                        {alert.message && (
                          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                            {alert.message}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {alert.triggeredAt ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResetAlert(alert.id)}
                        >
                          Reset
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleAlert(alert.id)}
                        >
                          {alert.isActive ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                        </Button>
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteAlert(alert.id)}
                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Alert Modal */}
      <Modal
        isOpen={showCreateAlert}
        onClose={() => {
          setShowCreateAlert(false);
          setNewAlert({ symbol: '', type: 'above', threshold: 0 });
        }}
        title="Create Price Alert"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Symbol
            </label>
            <select
              value={newAlert.symbol}
              onChange={(e) => setNewAlert(prev => ({ ...prev, symbol: e.target.value }))}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-700 text-sm"
            >
              <option value="">Select a symbol</option>
              {symbolOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Alert Type
            </label>
            <select
              value={newAlert.type}
              onChange={(e) => setNewAlert(prev => ({ ...prev, type: e.target.value as any }))}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-700 text-sm"
            >
              <option value="above">Price Above</option>
              <option value="below">Price Below</option>
              <option value="change_percent">Change Percentage</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Threshold {newAlert.type === 'change_percent' ? '(%)' : '(₹)'}
            </label>
            <Input
              type="number"
              value={newAlert.threshold || ''}
              onChange={(e) => setNewAlert(prev => ({ ...prev, threshold: parseFloat(e.target.value) || 0 }))}
              placeholder={newAlert.type === 'change_percent' ? 'e.g., 5 for 5%' : 'e.g., 1500.00'}
              step={newAlert.type === 'change_percent' ? '0.1' : '0.01'}
            />
            
            {newAlert.symbol && getCurrentPrice(newAlert.symbol) && (
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Current price: ₹{getCurrentPrice(newAlert.symbol) ? getCurrentPrice(newAlert.symbol)!.toFixed(2) : '0.00'}
              </p>
            )}
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateAlert(false);
                setNewAlert({ symbol: '', type: 'above', threshold: 0 });
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateAlert}
              disabled={!newAlert.symbol || newAlert.threshold <= 0}
            >
              Create Alert
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}