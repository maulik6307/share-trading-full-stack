'use client';

import { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, TrendingDown, BarChart3, Activity, Settings } from 'lucide-react';
import { Button } from '@/components/ui';
import { useMarketData } from '@/lib/hooks/use-mock-socket';
import { mockSymbols } from '@/mocks/data/symbols';

interface MarketDataChartProps {
  symbol: string;
  height?: number;
  showControls?: boolean;
}

interface ChartDataPoint {
  timestamp: string;
  time: number;
  price: number;
  volume: number;
  sma20?: number;
  sma50?: number;
  rsi?: number;
  macd?: number;
  signal?: number;
  histogram?: number;
}

interface TechnicalIndicators {
  sma20: boolean;
  sma50: boolean;
  rsi: boolean;
  macd: boolean;
  bollinger: boolean;
}

export function MarketDataChart({ 
  symbol, 
  height = 400, 
  showControls = true 
}: MarketDataChartProps) {
  const [timeframe, setTimeframe] = useState<'1m' | '5m' | '15m' | '1h' | '1d'>('5m');
  const [chartType, setChartType] = useState<'line' | 'area' | 'candlestick'>('line');
  const [activeTab, setActiveTab] = useState<'price' | 'volume' | 'indicators'>('price');
  const [indicators, setIndicators] = useState<TechnicalIndicators>({
    sma20: true,
    sma50: false,
    rsi: false,
    macd: false,
    bollinger: false,
  });
  
  const [historicalData, setHistoricalData] = useState<ChartDataPoint[]>([]);
  const { marketDataMap } = useMarketData([symbol]);
  
  const symbolInfo = mockSymbols.find(s => s.symbol === symbol);
  const currentMarketData = marketDataMap.get(symbol);

  // Generate historical data with technical indicators
  useEffect(() => {
    const generateHistoricalData = () => {
      const now = new Date();
      const dataPoints: ChartDataPoint[] = [];
      const basePrice = currentMarketData?.price || 1000;
      
      // Generate 100 data points
      for (let i = 99; i >= 0; i--) {
        const timestamp = new Date(now.getTime() - i * getTimeframeMs(timeframe));
        
        // Generate realistic price movement
        const volatility = 0.02; // 2% volatility
        const trend = Math.sin(i * 0.1) * 0.001; // Small trend component
        const randomWalk = (Math.random() - 0.5) * volatility;
        const priceMultiplier = 1 + trend + randomWalk;
        
        const price = basePrice * Math.pow(priceMultiplier, i / 10);
        const volume = Math.floor(Math.random() * 100000) + 10000;
        
        dataPoints.push({
          timestamp: timestamp.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          time: timestamp.getTime(),
          price: Math.round(price * 100) / 100,
          volume,
        });
      }
      
      // Calculate technical indicators
      return calculateTechnicalIndicators(dataPoints);
    };

    setHistoricalData(generateHistoricalData());
  }, [symbol, timeframe, currentMarketData?.price]);

  // Update latest data point with real-time data
  useEffect(() => {
    if (currentMarketData && historicalData.length > 0) {
      setHistoricalData(prev => {
        const updated = [...prev];
        const latest = updated[updated.length - 1];
        
        if (latest) {
          updated[updated.length - 1] = {
            ...latest,
            price: currentMarketData.price,
            volume: currentMarketData.volume,
          };
        }
        
        return updated;
      });
    }
  }, [currentMarketData, historicalData.length]);

  const getTimeframeMs = (tf: string) => {
    const timeframes = {
      '1m': 60 * 1000,
      '5m': 5 * 60 * 1000,
      '15m': 15 * 60 * 1000,
      '1h': 60 * 60 * 1000,
      '1d': 24 * 60 * 60 * 1000,
    };
    return timeframes[tf as keyof typeof timeframes] || timeframes['5m'];
  };

  const calculateTechnicalIndicators = (data: ChartDataPoint[]): ChartDataPoint[] => {
    return data.map((point, index) => {
      const result = { ...point };
      
      // Simple Moving Averages
      if (index >= 19) {
        const sma20Sum = data.slice(index - 19, index + 1).reduce((sum, p) => sum + p.price, 0);
        result.sma20 = sma20Sum / 20;
      }
      
      if (index >= 49) {
        const sma50Sum = data.slice(index - 49, index + 1).reduce((sum, p) => sum + p.price, 0);
        result.sma50 = sma50Sum / 50;
      }
      
      // RSI (simplified)
      if (index >= 14) {
        const period = 14;
        const changes = data.slice(index - period + 1, index + 1).map((p, i, arr) => 
          i > 0 ? p.price - arr[i - 1].price : 0
        );
        
        const gains = changes.filter(c => c > 0).reduce((sum, c) => sum + c, 0) / period;
        const losses = Math.abs(changes.filter(c => c < 0).reduce((sum, c) => sum + c, 0)) / period;
        
        const rs = gains / (losses || 1);
        result.rsi = 100 - (100 / (1 + rs));
      }
      
      // MACD (simplified)
      if (index >= 25) {
        const ema12 = calculateEMA(data.slice(0, index + 1).map(p => p.price), 12);
        const ema26 = calculateEMA(data.slice(0, index + 1).map(p => p.price), 26);
        result.macd = ema12 - ema26;
        
        if (index >= 33) {
          const macdLine = data.slice(index - 8, index + 1).map(p => p.macd || 0);
          result.signal = calculateEMA(macdLine, 9);
          result.histogram = (result.macd || 0) - (result.signal || 0);
        }
      }
      
      return result;
    });
  };

  const calculateEMA = (prices: number[], period: number): number => {
    const multiplier = 2 / (period + 1);
    let ema = prices[0];
    
    for (let i = 1; i < prices.length; i++) {
      ema = (prices[i] * multiplier) + (ema * (1 - multiplier));
    }
    
    return ema;
  };

  const priceChange = useMemo(() => {
    if (historicalData.length < 2) return { change: 0, changePercent: 0 };
    
    const latest = historicalData[historicalData.length - 1];
    const previous = historicalData[historicalData.length - 2];
    
    const change = latest.price - previous.price;
    const changePercent = (change / previous.price) * 100;
    
    return { change, changePercent };
  }, [historicalData]);

  const formatPrice = (price: number) => `₹${price.toFixed(2)}`;
  const formatVolume = (volume: number) => {
    if (volume >= 100000) return `${(volume / 100000).toFixed(1)}L`;
    if (volume >= 1000) return `${(volume / 1000).toFixed(1)}K`;
    return volume.toString();
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-neutral-800 p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-neutral-900 dark:text-white">
            {label}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {
                entry.name === 'Volume' 
                  ? formatVolume(entry.value)
                  : entry.name.includes('RSI')
                  ? `${entry.value.toFixed(1)}`
                  : formatPrice(entry.value)
              }
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
      {/* Header */}
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                {symbol}
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {symbolInfo?.name}
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-neutral-900 dark:text-white">
                {currentMarketData ? formatPrice(currentMarketData.price) : '--'}
              </span>
              
              {currentMarketData && (
                <div className={`flex items-center space-x-1 ${
                  currentMarketData.change >= 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {currentMarketData.change >= 0 ? (
                    <TrendingUp className="w-5 h-5" />
                  ) : (
                    <TrendingDown className="w-5 h-5" />
                  )}
                  <span className="font-medium">
                    {currentMarketData.change >= 0 ? '+' : ''}
                    {currentMarketData.changePercent.toFixed(2)}%
                  </span>
                </div>
              )}
            </div>
          </div>

          {showControls && (
            <div className="flex items-center space-x-2">
              {/* Timeframe Selector */}
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value as any)}
                className="px-3 py-1 border border-neutral-200 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-800 text-sm"
              >
                <option value="1m">1m</option>
                <option value="5m">5m</option>
                <option value="15m">15m</option>
                <option value="1h">1h</option>
                <option value="1d">1d</option>
              </select>
              
              {/* Chart Type Selector */}
              <div className="flex border border-neutral-200 dark:border-neutral-700 rounded-md">
                <button
                  onClick={() => setChartType('line')}
                  className={`p-2 ${
                    chartType === 'line'
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                      : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
                  }`}
                >
                  <Activity className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setChartType('area')}
                  className={`p-2 border-l border-neutral-200 dark:border-neutral-700 ${
                    chartType === 'area'
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                      : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Chart Tabs */}
        <div className="flex space-x-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-md">
          {[
            { id: 'price', label: 'Price' },
            { id: 'volume', label: 'Volume' },
            { id: 'indicators', label: 'Indicators' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 text-sm font-medium rounded-sm transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-neutral-900 shadow-sm dark:bg-neutral-950 dark:text-white'
                  : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Content */}
      <div className="p-4">
        <div style={{ height }}>
          {activeTab === 'price' && (
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'line' ? (
                <LineChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis 
                    dataKey="timestamp" 
                    stroke="#6B7280"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#6B7280"
                    fontSize={12}
                    tickFormatter={formatPrice}
                    domain={['dataMin - 10', 'dataMax + 10']}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={false}
                    name="Price"
                  />
                  
                  {indicators.sma20 && (
                    <Line
                      type="monotone"
                      dataKey="sma20"
                      stroke="#F59E0B"
                      strokeWidth={1}
                      strokeDasharray="5 5"
                      dot={false}
                      name="SMA 20"
                    />
                  )}
                  
                  {indicators.sma50 && (
                    <Line
                      type="monotone"
                      dataKey="sma50"
                      stroke="#EF4444"
                      strokeWidth={1}
                      strokeDasharray="5 5"
                      dot={false}
                      name="SMA 50"
                    />
                  )}
                </LineChart>
              ) : (
                <AreaChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis 
                    dataKey="timestamp" 
                    stroke="#6B7280"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#6B7280"
                    fontSize={12}
                    tickFormatter={formatPrice}
                    domain={['dataMin - 10', 'dataMax + 10']}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke="#3B82F6"
                    fill="#3B82F6"
                    fillOpacity={0.1}
                    strokeWidth={2}
                    name="Price"
                  />
                </AreaChart>
              )}
            </ResponsiveContainer>
          )}

          {activeTab === 'volume' && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis 
                  dataKey="timestamp" 
                  stroke="#6B7280"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#6B7280"
                  fontSize={12}
                  tickFormatter={formatVolume}
                />
                <Tooltip content={<CustomTooltip />} />
                
                <Area
                  type="monotone"
                  dataKey="volume"
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.3}
                  strokeWidth={1}
                  name="Volume"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}

          {activeTab === 'indicators' && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis 
                  dataKey="timestamp" 
                  stroke="#6B7280"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#6B7280"
                  fontSize={12}
                  domain={[0, 100]}
                />
                <Tooltip content={<CustomTooltip />} />
                
                {indicators.rsi && (
                  <>
                    <Line
                      type="monotone"
                      dataKey="rsi"
                      stroke="#8B5CF6"
                      strokeWidth={2}
                      dot={false}
                      name="RSI"
                    />
                    <ReferenceLine y={70} stroke="#EF4444" strokeDasharray="2 2" />
                    <ReferenceLine y={30} stroke="#10B981" strokeDasharray="2 2" />
                  </>
                )}
                
                {indicators.macd && (
                  <>
                    <Line
                      type="monotone"
                      dataKey="macd"
                      stroke="#F59E0B"
                      strokeWidth={1}
                      dot={false}
                      name="MACD"
                    />
                    <Line
                      type="monotone"
                      dataKey="signal"
                      stroke="#EF4444"
                      strokeWidth={1}
                      dot={false}
                      name="Signal"
                    />
                  </>
                )}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Indicator Controls */}
        {activeTab === 'price' && (
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => setIndicators(prev => ({ ...prev, sma20: !prev.sma20 }))}
              className={`px-3 py-1 rounded-md text-sm ${
                indicators.sma20
                  ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                  : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400'
              }`}
            >
              SMA 20
            </button>
            <button
              onClick={() => setIndicators(prev => ({ ...prev, sma50: !prev.sma50 }))}
              className={`px-3 py-1 rounded-md text-sm ${
                indicators.sma50
                  ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                  : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400'
              }`}
            >
              SMA 50
            </button>
          </div>
        )}

        {activeTab === 'indicators' && (
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => setIndicators(prev => ({ ...prev, rsi: !prev.rsi }))}
              className={`px-3 py-1 rounded-md text-sm ${
                indicators.rsi
                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                  : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400'
              }`}
            >
              RSI
            </button>
            <button
              onClick={() => setIndicators(prev => ({ ...prev, macd: !prev.macd }))}
              className={`px-3 py-1 rounded-md text-sm ${
                indicators.macd
                  ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                  : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400'
              }`}
            >
              MACD
            </button>
          </div>
        )}
      </div>
    </div>
  );
}