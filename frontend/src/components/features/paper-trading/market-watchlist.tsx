'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, Plus, X, TrendingUp, TrendingDown, Bell, BellOff } from 'lucide-react';
import { Button, Input, Modal } from '@/components/ui';
import { useMarketData, useSystemAlerts, useMockSocketControls } from '@/lib/hooks/use-mock-socket';
import { mockSymbols } from '@/mocks/data/symbols';
import { Symbol, MarketData, Watchlist } from '@/types/trading';

interface MarketWatchlistProps {
  marketData?: MarketData[];
  onSymbolSelect?: (symbol: string) => void;
  selectedSymbol?: string;
}

interface WatchlistItem extends Symbol {
  marketData?: MarketData;
  alertEnabled: boolean;
  alertThreshold?: number;
  alertType?: 'above' | 'below';
}

export function MarketWatchlist({ marketData = [], onSymbolSelect, selectedSymbol }: MarketWatchlistProps) {
  const [watchlists, setWatchlists] = useState<Watchlist[]>([
    {
      id: 'default',
      name: 'My Watchlist',
      symbols: ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK'],
      isDefault: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ]);
  
  const [activeWatchlistId, setActiveWatchlistId] = useState('default');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddSymbol, setShowAddSymbol] = useState(false);
  const [showCreateWatchlist, setShowCreateWatchlist] = useState(false);
  const [newWatchlistName, setNewWatchlistName] = useState('');
  const [alertSettings, setAlertSettings] = useState<Record<string, { enabled: boolean; threshold?: number; type?: 'above' | 'below' }>>({});

  const activeWatchlist = watchlists.find(w => w.id === activeWatchlistId);
  const watchedSymbols = activeWatchlist?.symbols || [];
  
  // Get real-time market data for watched symbols (fallback to mock if no data provided)
  const { marketDataMap, lastUpdate } = useMarketData(marketData.length > 0 ? [] : watchedSymbols);
  const { simulateAlert } = useMockSocketControls();

  // Create a map from provided marketData
  const providedDataMap = marketData.reduce((acc, data) => {
    acc[data.symbol] = data;
    return acc;
  }, {} as Record<string, MarketData>);

  // Filter available symbols for search
  const filteredSymbols = useMemo(() => {
    if (!searchQuery) return mockSymbols;
    
    const query = searchQuery.toLowerCase();
    return mockSymbols.filter(symbol => 
      symbol.symbol.toLowerCase().includes(query) ||
      symbol.name.toLowerCase().includes(query) ||
      symbol.sector.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Create watchlist items with market data
  const watchlistItems: WatchlistItem[] = useMemo(() => {
    return watchedSymbols.map(symbolCode => {
      const symbol = mockSymbols.find(s => s.symbol === symbolCode);
      const alertConfig = alertSettings[symbolCode];
      
      // Use provided market data if available, otherwise use mock data
      let marketDataForSymbol: MarketData | undefined;
      
      if (marketData.length > 0) {
        marketDataForSymbol = providedDataMap[symbolCode];
      } else {
        const marketDataUpdate = marketDataMap.get(symbolCode);
        // Convert MarketDataUpdate to MarketData format
        marketDataForSymbol = marketDataUpdate ? {
          symbol: marketDataUpdate.symbol,
          price: marketDataUpdate.price,
          change: marketDataUpdate.change,
          changePercent: marketDataUpdate.changePercent,
          volume: marketDataUpdate.volume,
          high: marketDataUpdate.price * 1.02, // Mock high
          low: marketDataUpdate.price * 0.98, // Mock low
          open: marketDataUpdate.price - marketDataUpdate.change, // Mock open
          previousClose: marketDataUpdate.price - marketDataUpdate.change, // Mock previous close
          timestamp: marketDataUpdate.timestamp,
        } : undefined;
      }
      
      return {
        ...symbol!,
        marketData: marketDataForSymbol,
        alertEnabled: alertConfig?.enabled || false,
        alertThreshold: alertConfig?.threshold,
        alertType: alertConfig?.type,
      };
    }).filter(Boolean);
  }, [watchedSymbols, marketDataMap, alertSettings, marketData, providedDataMap]);

  // Check for price alerts
  useEffect(() => {
    watchlistItems.forEach(item => {
      if (item.alertEnabled && item.alertThreshold && item.marketData) {
        const { price } = item.marketData;
        const { alertThreshold, alertType } = item;
        
        const shouldAlert = alertType === 'above' 
          ? price >= alertThreshold 
          : price <= alertThreshold;
          
        if (shouldAlert) {
          simulateAlert('WARNING', 
            `${item.symbol} price ${alertType} alert: ₹${price.toFixed(2)} (threshold: ₹${alertThreshold.toFixed(2)})`
          );
          
          // Disable alert after triggering to prevent spam
          setAlertSettings(prev => ({
            ...prev,
            [item.symbol]: { ...prev[item.symbol], enabled: false }
          }));
        }
      }
    });
  }, [watchlistItems, simulateAlert]);

  const handleAddSymbol = (symbolCode: string) => {
    if (!activeWatchlist || activeWatchlist.symbols.includes(symbolCode)) return;
    
    setWatchlists(prev => prev.map(w => 
      w.id === activeWatchlistId 
        ? { ...w, symbols: [...w.symbols, symbolCode], updatedAt: new Date() }
        : w
    ));
    
    setShowAddSymbol(false);
    setSearchQuery('');
  };

  const handleRemoveSymbol = (symbolCode: string) => {
    if (!activeWatchlist) return;
    
    setWatchlists(prev => prev.map(w => 
      w.id === activeWatchlistId 
        ? { ...w, symbols: w.symbols.filter(s => s !== symbolCode), updatedAt: new Date() }
        : w
    ));
    
    // Remove alert settings
    setAlertSettings(prev => {
      const { [symbolCode]: removed, ...rest } = prev;
      return rest;
    });
  };

  const handleCreateWatchlist = () => {
    if (!newWatchlistName.trim()) return;
    
    const newWatchlist: Watchlist = {
      id: `watchlist_${Date.now()}`,
      name: newWatchlistName.trim(),
      symbols: [],
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setWatchlists(prev => [...prev, newWatchlist]);
    setActiveWatchlistId(newWatchlist.id);
    setNewWatchlistName('');
    setShowCreateWatchlist(false);
  };

  const handleDeleteWatchlist = (watchlistId: string) => {
    if (watchlists.find(w => w.id === watchlistId)?.isDefault) return;
    
    setWatchlists(prev => prev.filter(w => w.id !== watchlistId));
    
    if (activeWatchlistId === watchlistId) {
      const defaultWatchlist = watchlists.find(w => w.isDefault);
      setActiveWatchlistId(defaultWatchlist?.id || watchlists[0]?.id);
    }
  };

  const handleToggleAlert = (symbolCode: string) => {
    setAlertSettings(prev => ({
      ...prev,
      [symbolCode]: {
        ...prev[symbolCode],
        enabled: !prev[symbolCode]?.enabled,
        threshold: prev[symbolCode]?.threshold || marketDataMap.get(symbolCode)?.price,
        type: prev[symbolCode]?.type || 'above',
      }
    }));
  };

  const handleUpdateAlertThreshold = (symbolCode: string, threshold: number, type: 'above' | 'below') => {
    setAlertSettings(prev => ({
      ...prev,
      [symbolCode]: {
        ...prev[symbolCode],
        threshold,
        type,
        enabled: prev[symbolCode]?.enabled || false,
      }
    }));
  };

  const formatPrice = (price: number) => `₹${price.toFixed(2)}`;
  const formatChange = (change: number, changePercent: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}₹${change.toFixed(2)} (${sign}${changePercent.toFixed(2)}%)`;
  };

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
      {/* Header */}
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
            Market Watchlist
          </h3>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddSymbol(true)}
            >
              <Plus className="w-4 h-4 mr-1" />
              Symbol
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCreateWatchlist(true)}
            >
              New List
            </Button>
          </div>
        </div>
        
        {/* Watchlist Tabs */}
        <div className="flex space-x-2 overflow-x-auto">
          {watchlists.map(watchlist => (
            <button
              key={watchlist.id}
              onClick={() => setActiveWatchlistId(watchlist.id)}
              className={`px-3 py-1 rounded-md text-sm font-medium whitespace-nowrap ${
                activeWatchlistId === watchlist.id
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                  : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
              }`}
            >
              {watchlist.name}
              {!watchlist.isDefault && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteWatchlist(watchlist.id);
                  }}
                  className="ml-2 text-neutral-400 hover:text-red-500"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Watchlist Items */}
      <div className="max-h-96 overflow-y-auto">
        {watchlistItems.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-neutral-500 dark:text-neutral-400 mb-4">
              No symbols in this watchlist
            </p>
            <Button
              variant="outline"
              onClick={() => setShowAddSymbol(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Symbol
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
            {watchlistItems.map(item => (
              <div
                key={item.symbol}
                className={`p-3 hover:bg-neutral-50 dark:hover:bg-neutral-700 cursor-pointer ${
                  selectedSymbol === item.symbol ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                }`}
                onClick={() => onSymbolSelect?.(item.symbol)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                        {item.symbol}
                      </h4>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">
                        {item.exchange}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleAlert(item.symbol);
                        }}
                        className={`p-1 rounded ${
                          item.alertEnabled
                            ? 'text-yellow-500 hover:text-yellow-600'
                            : 'text-neutral-400 hover:text-neutral-500'
                        }`}
                      >
                        {item.alertEnabled ? <Bell className="w-3 h-3" /> : <BellOff className="w-3 h-3" />}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveSymbol(item.symbol);
                        }}
                        className="text-neutral-400 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                      {item.name}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    {item.marketData ? (
                      <>
                        <p className="text-sm font-medium text-neutral-900 dark:text-white">
                          {formatPrice(item.marketData.price)}
                        </p>
                        <div className={`flex items-center text-xs ${
                          item.marketData.change >= 0
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {item.marketData.change >= 0 ? (
                            <TrendingUp className="w-3 h-3 mr-1" />
                          ) : (
                            <TrendingDown className="w-3 h-3 mr-1" />
                          )}
                          {formatChange(item.marketData.change, item.marketData.changePercent)}
                        </div>
                      </>
                    ) : (
                      <div className="text-xs text-neutral-400">Loading...</div>
                    )}
                  </div>
                </div>
                
                {/* Alert Settings */}
                {item.alertEnabled && (
                  <div className="mt-2 pt-2 border-t border-neutral-200 dark:border-neutral-600">
                    <div className="flex items-center space-x-2 text-xs">
                      <select
                        value={item.alertType || 'above'}
                        onChange={(e) => handleUpdateAlertThreshold(
                          item.symbol,
                          item.alertThreshold || item.marketData?.price || 0,
                          e.target.value as 'above' | 'below'
                        )}
                        className="px-2 py-1 border border-neutral-300 dark:border-neutral-600 rounded text-xs bg-white dark:bg-neutral-700"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <option value="above">Above</option>
                        <option value="below">Below</option>
                      </select>
                      <input
                        type="number"
                        value={item.alertThreshold || ''}
                        onChange={(e) => handleUpdateAlertThreshold(
                          item.symbol,
                          parseFloat(e.target.value) || 0,
                          item.alertType || 'above'
                        )}
                        placeholder="Price"
                        className="px-2 py-1 border border-neutral-300 dark:border-neutral-600 rounded text-xs w-20 bg-white dark:bg-neutral-700"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Last Update */}
      {lastUpdate && (
        <div className="p-2 border-t border-neutral-200 dark:border-neutral-700 text-xs text-neutral-500 dark:text-neutral-400 text-center">
          Last updated: {lastUpdate.toLocaleTimeString()}
        </div>
      )}

      {/* Add Symbol Modal */}
      <Modal
        isOpen={showAddSymbol}
        onClose={() => {
          setShowAddSymbol(false);
          setSearchQuery('');
        }}
        title="Add Symbol to Watchlist"
      >
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search symbols, companies, or sectors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="max-h-64 overflow-y-auto border border-neutral-200 dark:border-neutral-700 rounded-md">
            {filteredSymbols.map(symbol => (
              <button
                key={symbol.symbol}
                onClick={() => handleAddSymbol(symbol.symbol)}
                disabled={activeWatchlist?.symbols.includes(symbol.symbol)}
                className="w-full p-3 text-left hover:bg-neutral-50 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed border-b border-neutral-200 dark:border-neutral-700 last:border-b-0"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-white">
                      {symbol.symbol}
                    </p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      {symbol.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-neutral-600 dark:text-neutral-300">
                      {symbol.exchange}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {symbol.sector}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </Modal>

      {/* Create Watchlist Modal */}
      <Modal
        isOpen={showCreateWatchlist}
        onClose={() => {
          setShowCreateWatchlist(false);
          setNewWatchlistName('');
        }}
        title="Create New Watchlist"
      >
        <div className="space-y-4">
          <Input
            type="text"
            placeholder="Watchlist name"
            value={newWatchlistName}
            onChange={(e) => setNewWatchlistName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleCreateWatchlist()}
          />
          
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateWatchlist(false);
                setNewWatchlistName('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateWatchlist}
              disabled={!newWatchlistName.trim()}
            >
              Create
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}