'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Code, 
  Play, 
  Save, 
  RotateCcw, 
  AlertCircle, 
  CheckCircle,
  Maximize2,
  Minimize2,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';

// Dynamically import Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96 bg-neutral-900 rounded-lg">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
        <p className="text-neutral-400">Loading code editor...</p>
      </div>
    </div>
  ),
});

interface CodeEditorProps {
  code: string;
  onChange: (code: string) => void;
  onValidationChange?: (isValid: boolean, errors: string[]) => void;
  className?: string;
  readOnly?: boolean;
}

export function CodeEditor({
  code,
  onChange,
  onValidationChange,
  className,
  readOnly = false,
}: CodeEditorProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [isValid, setIsValid] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [currentCode, setCurrentCode] = useState(code);

  // Track changes
  useEffect(() => {
    setHasUnsavedChanges(currentCode !== code);
  }, [currentCode, code]);

  // Separate effect for validation to avoid infinite loops
  useEffect(() => {
    validateCode(currentCode);
  }, [currentCode]);

  const handleEditorChange = (value: string | undefined) => {
    const newCode = value || '';
    setCurrentCode(newCode);
    onChange(newCode);
  };

  const handleEditorDidMount = (editor: any, monaco: any) => {
    // Configure Monaco for JavaScript
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.CommonJS,
      noEmit: true,
      esModuleInterop: true,
      jsx: monaco.languages.typescript.JsxEmit.React,
      reactNamespace: 'React',
      allowJs: true,
      typeRoots: ['node_modules/@types'],
    });

    // Add trading API type definitions
    const tradingApiTypes = `
      declare global {
        interface TradingParams {
          [key: string]: any;
        }
        
        interface Position {
          isLong: boolean;
          isShort: boolean;
          quantity: number;
          avgPrice: number;
          unrealizedPnL: number;
        }
        
        interface MarketData {
          symbol: string;
          price: number;
          prices: number[];
          volume: number;
          timestamp: Date;
        }
        
        interface OrderOptions {
          stopLoss?: number;
          takeProfit?: number;
          orderType?: 'MARKET' | 'LIMIT';
          timeInForce?: 'GTC' | 'IOC' | 'FOK';
        }
        
        const params: TradingParams;
        const position: Position;
        
        function buy(quantity: number, options?: OrderOptions): void;
        function sell(quantity: number, options?: OrderOptions): void;
        function calculateMA(prices: number[], period: number): number;
        function calculateRSI(prices: number[], period: number): number;
        function calculateBollingerBands(prices: number[], period: number, stdDev: number): { upper: number; middle: number; lower: number };
        function log(message: string): void;
        
        function onTick(data: MarketData): void;
        function onOrderFilled(order: any): void;
        function onPositionChanged(position: Position): void;
      }
    `;

    monaco.languages.typescript.javascriptDefaults.addExtraLib(
      tradingApiTypes,
      'trading-api.d.ts'
    );
  };

  const validateCode = useCallback((codeToValidate: string) => {
    const newErrors: string[] = [];
    
    // Basic syntax validation
    try {
      // Check for required onTick function
      if (!codeToValidate.includes('function onTick')) {
        newErrors.push('Strategy must include an onTick function');
      }
      
      // Check for basic JavaScript syntax errors
      new Function(codeToValidate);
    } catch (error) {
      if (error instanceof Error) {
        newErrors.push(`Syntax error: ${error.message}`);
      }
    }
    
    // Check for common issues
    if (codeToValidate.includes('console.log')) {
      newErrors.push('Use log() instead of console.log() for strategy logging');
    }
    
    const newIsValid = newErrors.length === 0;
    setErrors(newErrors);
    setIsValid(newIsValid);
    onValidationChange?.(newIsValid, newErrors);
  }, []); // Removed onValidationChange from dependencies

  const handleSave = () => {
    // In a real implementation, this would save to backend
    setHasUnsavedChanges(false);
  };

  const handleReset = () => {
    const defaultCode = getDefaultCode();
    setCurrentCode(defaultCode);
    onChange(defaultCode);
    setHasUnsavedChanges(false);
  };

  const handleTest = () => {
    // In a real implementation, this would run a quick test
    console.log('Testing strategy code...');
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const getDefaultCode = () => {
    return `// Trading Strategy Template
function onTick(data) {
  // Access current market data
  const currentPrice = data.price;
  const prices = data.prices; // Historical prices array
  
  // Access strategy parameters
  const quantity = params.quantity || 100;
  
  // Example: Simple moving average crossover
  if (prices.length >= 20) {
    const fastMA = calculateMA(prices, 10);
    const slowMA = calculateMA(prices, 20);
    
    // Buy signal: fast MA crosses above slow MA
    if (fastMA > slowMA && !position.isLong) {
      buy(quantity, {
        stopLoss: params.stopLoss,
        takeProfit: params.takeProfit
      });
      log('Buy signal triggered at ' + currentPrice);
    }
    
    // Sell signal: fast MA crosses below slow MA
    if (fastMA < slowMA && position.isLong) {
      sell(position.quantity);
      log('Sell signal triggered at ' + currentPrice);
    }
  }
}

// Optional: Handle order fills
function onOrderFilled(order) {
  log('Order filled: ' + order.side + ' ' + order.quantity + ' at ' + order.price);
}

// Optional: Handle position changes
function onPositionChanged(position) {
  log('Position changed: ' + position.quantity + ' shares, P&L: ' + position.unrealizedPnL);
}`;
  };



  return (
    <div className={cn(
      'space-y-4',
      isFullscreen && 'fixed inset-0 z-50 bg-white dark:bg-neutral-900 p-6',
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Code className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
            Strategy Code
          </h3>
          {hasUnsavedChanges && (
            <span className="text-xs bg-warning-100 dark:bg-warning-900/20 text-warning-700 dark:text-warning-300 px-2 py-1 rounded">
              Unsaved changes
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleTest}
            className="flex items-center space-x-2"
          >
            <Play className="h-4 w-4" />
            <span>Test</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="flex items-center space-x-2"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            disabled={!hasUnsavedChanges}
            className="flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>Save</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={toggleFullscreen}
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Validation Status */}
      {errors.length > 0 ? (
        <div className="bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertCircle className="h-5 w-5 text-danger-600" />
            <h4 className="text-sm font-medium text-danger-800 dark:text-danger-200">
              Code Issues Found
            </h4>
          </div>
          <ul className="text-sm text-danger-700 dark:text-danger-300 space-y-1">
            {errors.map((error, index) => (
              <li key={index} className="flex items-center space-x-2">
                <span className="w-1 h-1 bg-danger-500 rounded-full"></span>
                <span>{error}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-success-600" />
            <span className="text-sm text-success-700 dark:text-success-300">
              Code is valid and ready to use
            </span>
          </div>
        </div>
      )}

      {/* Editor Container */}
      <div className={cn(
        'border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden',
        isFullscreen ? 'flex-1' : 'h-96'
      )}>
        <MonacoEditor
          height="100%"
          language="javascript"
          theme="vs-dark"
          value={currentCode}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: false,
            readOnly,
            cursorStyle: 'line',
            wordWrap: 'on',
            contextmenu: true,
            folding: true,
            foldingStrategy: 'indentation',
            showFoldingControls: 'always',
            unfoldOnClickAfterEndOfLine: false,
            tabSize: 2,
            insertSpaces: true,
            automaticLayout: true,
          }}
        />
      </div>

      {/* Help Text */}
      <div className="bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <FileText className="h-4 w-4 text-neutral-500 mt-0.5" />
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            <p className="font-medium mb-1">Available Functions:</p>
            <ul className="space-y-1 text-xs">
              <li><code className="bg-neutral-200 dark:bg-neutral-700 px-1 rounded">buy(quantity, options)</code> - Place a buy order</li>
              <li><code className="bg-neutral-200 dark:bg-neutral-700 px-1 rounded">sell(quantity)</code> - Place a sell order</li>
              <li><code className="bg-neutral-200 dark:bg-neutral-700 px-1 rounded">calculateMA(prices, period)</code> - Calculate moving average</li>
              <li><code className="bg-neutral-200 dark:bg-neutral-700 px-1 rounded">calculateRSI(prices, period)</code> - Calculate RSI</li>
              <li><code className="bg-neutral-200 dark:bg-neutral-700 px-1 rounded">log(message)</code> - Log messages for debugging</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}