'use client';

import { useState, useEffect, useRef } from 'react';
import { TrendingUp, TrendingDown, Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui';
import { useMarketData } from '@/lib/hooks/use-mock-socket';
import { mockSymbols } from '@/mocks/data/symbols';

interface PriceTickerProps {
  symbols?: string[];
  speed?: 'slow' | 'medium' | 'fast';
  showControls?: boolean;
}

export function PriceTicker({ 
  symbols = mockSymbols.slice(0, 10).map(s => s.symbol), 
  speed = 'medium',
  showControls = true 
}: PriceTickerProps) {
  const [isPaused, setIsPaused] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const tickerRef = useRef<HTMLDivElement>(null);
  
  const { marketDataMap } = useMarketData(symbols);
  
  // Animation speeds in milliseconds
  const speeds = {
    slow: 8000,
    medium: 5000,
    fast: 3000,
  };

  // Auto-scroll through symbols
  useEffect(() => {
    if (isPaused || symbols.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % symbols.length);
    }, speeds[speed]);
    
    return () => clearInterval(interval);
  }, [isPaused, symbols.length, speed, speeds]);

  // Smooth scroll animation
  useEffect(() => {
    if (tickerRef.current) {
      const itemWidth = tickerRef.current.scrollWidth / symbols.length;
      tickerRef.current.scrollTo({
        left: currentIndex * itemWidth,
        behavior: 'smooth'
      });
    }
  }, [currentIndex, symbols.length]);

  const formatPrice = (price: number) => `₹${price.toFixed(2)}`;
  const formatChange = (change: number, changePercent: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${changePercent.toFixed(2)}%`;
  };

  const getSymbolName = (symbolCode: string) => {
    return mockSymbols.find(s => s.symbol === symbolCode)?.name || symbolCode;
  };

  return (
    <div className="bg-neutral-900 text-white border-b border-neutral-700">
      {/* Controls */}
      {showControls && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-700">
          <div className="flex items-center space-x-4">
            <h3 className="text-sm font-medium">Market Ticker</h3>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsPaused(!isPaused)}
                className="text-white hover:bg-neutral-700"
              >
                {isPaused ? (
                  <Play className="w-4 h-4" />
                ) : (
                  <Pause className="w-4 h-4" />
                )}
              </Button>
              <span className="text-xs text-neutral-400">
                {isPaused ? 'Paused' : 'Live'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 text-xs text-neutral-400">
            <span>Speed:</span>
            <select
              value={speed}
              onChange={(e) => setCurrentIndex(0)} // Reset to prevent issues
              className="bg-neutral-800 border border-neutral-600 rounded px-2 py-1 text-white"
            >
              <option value="slow">Slow</option>
              <option value="medium">Medium</option>
              <option value="fast">Fast</option>
            </select>
          </div>
        </div>
      )}

      {/* Ticker Content */}
      <div className="relative overflow-hidden">
        {/* Desktop Ticker - Horizontal Scroll */}
        <div 
          ref={tickerRef}
          className="hidden md:flex overflow-x-auto scrollbar-hide py-3"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div className="flex space-x-8 px-4 min-w-max">
            {symbols.map(symbolCode => {
              const marketData = marketDataMap.get(symbolCode);
              const symbolName = getSymbolName(symbolCode);
              
              return (
                <div
                  key={symbolCode}
                  className="flex items-center space-x-3 min-w-max"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{symbolCode}</span>
                    <span className="text-xs text-neutral-400 truncate max-w-24">
                      {symbolName}
                    </span>
                  </div>
                  
                  {marketData ? (
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold">
                        {formatPrice(marketData.price)}
                      </span>
                      
                      <div className={`flex items-center space-x-1 ${
                        marketData.change >= 0
                          ? 'text-green-400'
                          : 'text-red-400'
                      }`}>
                        {marketData.change >= 0 ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        <span className="text-sm font-medium">
                          {formatChange(marketData.change, marketData.changePercent)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-neutral-500">--</span>
                      <span className="text-sm text-neutral-500">Loading...</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile Ticker - Single Item Display */}
        <div className="md:hidden py-3 px-4">
          {symbols.length > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{symbols[currentIndex]}</span>
                  <span className="text-xs text-neutral-400">
                    {getSymbolName(symbols[currentIndex])}
                  </span>
                </div>
                
                {marketDataMap.get(symbols[currentIndex]) ? (
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold">
                      {formatPrice(marketDataMap.get(symbols[currentIndex])!.price)}
                    </span>
                    
                    <div className={`flex items-center space-x-1 ${
                      marketDataMap.get(symbols[currentIndex])!.change >= 0
                        ? 'text-green-400'
                        : 'text-red-400'
                    }`}>
                      {marketDataMap.get(symbols[currentIndex])!.change >= 0 ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      <span className="text-sm font-medium">
                        {formatChange(
                          marketDataMap.get(symbols[currentIndex])!.change,
                          marketDataMap.get(symbols[currentIndex])!.changePercent
                        )}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-neutral-500">--</span>
                    <span className="text-sm text-neutral-500">Loading...</span>
                  </div>
                )}
              </div>
              
              {/* Mobile Navigation Dots */}
              <div className="flex space-x-1">
                {symbols.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2 h-2 rounded-full ${
                      index === currentIndex
                        ? 'bg-white'
                        : 'bg-neutral-600'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Gradient Overlays for Desktop */}
        <div className="hidden md:block absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-neutral-900 to-transparent pointer-events-none" />
        <div className="hidden md:block absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-neutral-900 to-transparent pointer-events-none" />
      </div>

      {/* Market Status Indicator */}
      <div className="px-4 py-2 border-t border-neutral-700 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-neutral-400">Market Open</span>
        </div>
        
        <div className="flex items-center space-x-4 text-neutral-400">
          <span>NSE: 9:15 AM - 3:30 PM IST</span>
          <span>|</span>
          <span>{symbols.length} symbols</span>
        </div>
      </div>
    </div>
  );
}

// CSS for hiding scrollbar (add to globals.css if needed)
const tickerStyles = `
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
`;