import { useState, useEffect, useCallback, useMemo } from 'react';
import { tradingAPI } from '@/lib/api/trading-api';
import { tradingWebSocket } from '@/lib/websocket/trading-websocket';
import { MarketData } from '@/types/trading';

export function useMarketData(symbols?: string[]) {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoize symbols to prevent unnecessary re-renders
  const symbolsKey = useMemo(() => symbols?.join(',') || '', [symbols]);

  // Load initial market data
  const loadMarketData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await tradingAPI.getMarketData(symbols);
      setMarketData(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load market data';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [symbolsKey]); // Use memoized key instead of array

  // Handle real-time market data updates - memoized and throttled to prevent excessive re-renders
  const handleMarketDataUpdate = useCallback((data: MarketData) => {
    setMarketData(prev => {
      const index = prev.findIndex(m => m.symbol === data.symbol);
      if (index >= 0) {
        const updated = [...prev];
        // Only update if the price has actually changed significantly (avoid micro-updates)
        const existingData = updated[index];
        const priceChange = Math.abs(existingData.price - data.price);
        const significantChange = priceChange > 0.01; // Only update for changes > 1 paisa
        
        if (significantChange || data.volume !== existingData.volume) {
          updated[index] = { ...updated[index], ...data };
          return updated;
        }
        return prev; // No significant change, don't trigger re-render
      } else {
        return [...prev, data];
      }
    });
  }, []);

  useEffect(() => {
    tradingWebSocket.on('marketDataUpdate', handleMarketDataUpdate);

    return () => {
      tradingWebSocket.off('marketDataUpdate', handleMarketDataUpdate);
    };
  }, [handleMarketDataUpdate]);

  // Subscribe to WebSocket updates for symbols
  useEffect(() => {
    if (symbols && symbols.length > 0) {
      tradingWebSocket.subscribeToMarketData(symbols);
      
      return () => {
        tradingWebSocket.unsubscribeFromMarketData(symbols);
      };
    }
  }, [symbolsKey]); // Use memoized key instead of array

  // Load data on mount
  useEffect(() => {
    loadMarketData();
  }, [loadMarketData]);

  // Get specific symbol data
  const getSymbolData = useCallback((symbol: string): MarketData | undefined => {
    return marketData.find(data => data.symbol === symbol.toUpperCase());
  }, [marketData]);

  // Get current price for a symbol
  const getCurrentPrice = useCallback((symbol: string): number => {
    const data = getSymbolData(symbol);
    return data?.price || 0;
  }, [getSymbolData]);

  return {
    marketData,
    loading,
    error,
    loadMarketData,
    getSymbolData,
    getCurrentPrice
  };
}

export function useSymbolData(symbol: string) {
  const [symbolData, setSymbolData] = useState<MarketData | null>(null);
  const [ohlcData, setOhlcData] = useState<Array<{
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load symbol data and OHLC data
  const loadSymbolData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [data, ohlc] = await Promise.all([
        tradingAPI.getSymbolData(symbol),
        tradingAPI.getOHLCData(symbol, '1d', 100)
      ]);
      
      setSymbolData(data);
      setOhlcData(ohlc);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load symbol data';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [symbol]);

  // Handle real-time updates for this symbol
  useEffect(() => {
    const handleMarketDataUpdate = (data: MarketData) => {
      if (data.symbol === symbol.toUpperCase()) {
        setSymbolData(prev => prev ? { ...prev, ...data } : data);
      }
    };

    tradingWebSocket.on('marketDataUpdate', handleMarketDataUpdate);
    tradingWebSocket.subscribeToMarketData([symbol]);

    return () => {
      tradingWebSocket.off('marketDataUpdate', handleMarketDataUpdate);
      tradingWebSocket.unsubscribeFromMarketData([symbol]);
    };
  }, [symbol]);

  // Load data on mount or symbol change
  useEffect(() => {
    loadSymbolData();
  }, [loadSymbolData]);

  return {
    symbolData,
    ohlcData,
    loading,
    error,
    loadSymbolData
  };
}