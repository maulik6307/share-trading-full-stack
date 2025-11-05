'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Copy, CheckCircle } from 'lucide-react';

interface SchemaProperty {
  name: string;
  type: string;
  required: boolean;
  description: string;
  example?: any;
  properties?: SchemaProperty[];
}

interface Schema {
  name: string;
  description: string;
  properties: SchemaProperty[];
  example: any;
}

const schemas: Schema[] = [
  {
    name: 'User',
    description: 'User account information and preferences',
    properties: [
      { name: 'id', type: 'string', required: true, description: 'Unique user identifier', example: 'user_123' },
      { name: 'name', type: 'string', required: true, description: 'User full name', example: 'John Doe' },
      { name: 'email', type: 'string', required: true, description: 'User email address', example: 'john@example.com' },
      { name: 'timezone', type: 'string', required: true, description: 'User timezone', example: 'Asia/Kolkata' },
      { 
        name: 'preferences', 
        type: 'UserPreferences', 
        required: true, 
        description: 'User preferences object',
        properties: [
          { name: 'theme', type: 'string', required: true, description: 'UI theme preference', example: 'dark' },
          { 
            name: 'notifications', 
            type: 'NotificationSettings', 
            required: true, 
            description: 'Notification preferences',
            properties: [
              { name: 'email', type: 'boolean', required: true, description: 'Email notifications enabled', example: true },
              { name: 'push', type: 'boolean', required: true, description: 'Push notifications enabled', example: true },
              { name: 'trading', type: 'boolean', required: true, description: 'Trading notifications enabled', example: true },
              { name: 'system', type: 'boolean', required: true, description: 'System notifications enabled', example: false }
            ]
          },
          { name: 'defaultCurrency', type: 'string', required: true, description: 'Default currency', example: 'USD' },
          { name: 'dateFormat', type: 'string', required: true, description: 'Date format preference', example: 'DD/MM/YYYY' },
          { name: 'language', type: 'string', required: true, description: 'Language preference', example: 'en' }
        ]
      },
      { name: 'createdAt', type: 'Date', required: true, description: 'Account creation timestamp', example: '2024-01-15T10:30:00Z' },
      { name: 'updatedAt', type: 'Date', required: true, description: 'Last update timestamp', example: '2024-01-20T14:45:00Z' }
    ],
    example: {
      id: "user_123",
      name: "John Doe",
      email: "john@example.com",
      timezone: "Asia/Kolkata",
      preferences: {
        theme: "dark",
        notifications: {
          email: true,
          push: true,
          trading: true,
          system: false
        },
        defaultCurrency: "USD",
        dateFormat: "DD/MM/YYYY",
        language: "en"
      },
      createdAt: "2024-01-15T10:30:00Z",
      updatedAt: "2024-01-20T14:45:00Z"
    }
  },
  {
    name: 'Order',
    description: 'Trading order information',
    properties: [
      { name: 'id', type: 'string', required: true, description: 'Unique order identifier', example: 'order_1705751234567_123' },
      { name: 'strategyId', type: 'string', required: false, description: 'Associated strategy ID', example: 'strategy_ma_crossover_001' },
      { name: 'symbol', type: 'string', required: true, description: 'Trading symbol', example: 'AAPL' },
      { name: 'side', type: 'OrderSide', required: true, description: 'Order side (BUY | SELL)', example: 'BUY' },
      { name: 'type', type: 'OrderType', required: true, description: 'Order type (MARKET | LIMIT | STOP | STOP_LIMIT)', example: 'LIMIT' },
      { name: 'quantity', type: 'number', required: true, description: 'Order quantity', example: 100 },
      { name: 'price', type: 'number', required: false, description: 'Order price (for LIMIT orders)', example: 150.25 },
      { name: 'stopPrice', type: 'number', required: false, description: 'Stop price (for STOP orders)', example: 145.00 },
      { name: 'status', type: 'OrderStatus', required: true, description: 'Order status', example: 'PENDING' },
      { name: 'filledQuantity', type: 'number', required: true, description: 'Filled quantity', example: 0 },
      { name: 'remainingQuantity', type: 'number', required: true, description: 'Remaining quantity', example: 100 },
      { name: 'avgFillPrice', type: 'number', required: false, description: 'Average fill price', example: null },
      { name: 'commission', type: 'number', required: true, description: 'Commission paid', example: 0 },
      { name: 'createdAt', type: 'Date', required: true, description: 'Order creation timestamp', example: '2024-01-20T10:30:00Z' },
      { name: 'updatedAt', type: 'Date', required: true, description: 'Last update timestamp', example: '2024-01-20T10:30:00Z' },
      { name: 'userId', type: 'string', required: true, description: 'User ID', example: 'user_123' }
    ],
    example: {
      id: "order_1705751234567_123",
      strategyId: "strategy_ma_crossover_001",
      symbol: "AAPL",
      side: "BUY",
      type: "LIMIT",
      quantity: 100,
      price: 150.25,
      status: "PENDING",
      filledQuantity: 0,
      remainingQuantity: 100,
      avgFillPrice: null,
      commission: 0,
      createdAt: "2024-01-20T10:30:00Z",
      updatedAt: "2024-01-20T10:30:00Z",
      userId: "user_123"
    }
  },
  {
    name: 'Position',
    description: 'Current trading position',
    properties: [
      { name: 'id', type: 'string', required: true, description: 'Unique position identifier', example: 'pos_aapl_001' },
      { name: 'symbol', type: 'string', required: true, description: 'Trading symbol', example: 'AAPL' },
      { name: 'quantity', type: 'number', required: true, description: 'Position quantity', example: 100 },
      { name: 'avgPrice', type: 'number', required: true, description: 'Average entry price', example: 148.75 },
      { name: 'currentPrice', type: 'number', required: true, description: 'Current market price', example: 150.25 },
      { name: 'unrealizedPnL', type: 'number', required: true, description: 'Unrealized profit/loss', example: 150.00 },
      { name: 'realizedPnL', type: 'number', required: true, description: 'Realized profit/loss', example: 0 },
      { name: 'createdAt', type: 'Date', required: true, description: 'Position creation timestamp', example: '2024-01-19T14:30:00Z' },
      { name: 'updatedAt', type: 'Date', required: true, description: 'Last update timestamp', example: '2024-01-20T15:00:00Z' },
      { name: 'userId', type: 'string', required: true, description: 'User ID', example: 'user_123' }
    ],
    example: {
      id: "pos_aapl_001",
      symbol: "AAPL",
      quantity: 100,
      avgPrice: 148.75,
      currentPrice: 150.25,
      unrealizedPnL: 150.00,
      realizedPnL: 0,
      createdAt: "2024-01-19T14:30:00Z",
      updatedAt: "2024-01-20T15:00:00Z",
      userId: "user_123"
    }
  },
  {
    name: 'Strategy',
    description: 'Trading strategy configuration',
    properties: [
      { name: 'id', type: 'string', required: true, description: 'Unique strategy identifier', example: 'strategy_ma_crossover_001' },
      { name: 'name', type: 'string', required: true, description: 'Strategy name', example: 'MA Crossover Strategy' },
      { name: 'description', type: 'string', required: false, description: 'Strategy description', example: 'Simple moving average crossover strategy' },
      { name: 'type', type: 'StrategyType', required: true, description: 'Strategy type', example: 'MA_CROSSOVER' },
      { name: 'parameters', type: 'object', required: true, description: 'Strategy parameters', example: { fastPeriod: 10, slowPeriod: 20, symbol: 'AAPL' } },
      { name: 'code', type: 'string', required: false, description: 'Strategy code (for custom strategies)', example: null },
      { name: 'status', type: 'StrategyStatus', required: true, description: 'Strategy status', example: 'active' },
      { name: 'createdAt', type: 'Date', required: true, description: 'Strategy creation timestamp', example: '2024-01-15T10:00:00Z' },
      { name: 'updatedAt', type: 'Date', required: true, description: 'Last update timestamp', example: '2024-01-18T16:30:00Z' },
      { name: 'userId', type: 'string', required: true, description: 'User ID', example: 'user_123' }
    ],
    example: {
      id: "strategy_ma_crossover_001",
      name: "MA Crossover Strategy",
      description: "Simple moving average crossover strategy",
      type: "MA_CROSSOVER",
      parameters: {
        fastPeriod: 10,
        slowPeriod: 20,
        symbol: "AAPL"
      },
      code: null,
      status: "active",
      createdAt: "2024-01-15T10:00:00Z",
      updatedAt: "2024-01-18T16:30:00Z",
      userId: "user_123"
    }
  },
  {
    name: 'BacktestResult',
    description: 'Backtest execution results and performance metrics',
    properties: [
      { name: 'id', type: 'string', required: true, description: 'Unique result identifier', example: 'result_1705751234567_789' },
      { name: 'backtestId', type: 'string', required: true, description: 'Associated backtest ID', example: 'backtest_1705751234567_789' },
      { 
        name: 'summary', 
        type: 'BacktestSummary', 
        required: true, 
        description: 'Performance summary metrics',
        properties: [
          { name: 'totalTrades', type: 'number', required: true, description: 'Total number of trades', example: 25 },
          { name: 'winningTrades', type: 'number', required: true, description: 'Number of winning trades', example: 15 },
          { name: 'losingTrades', type: 'number', required: true, description: 'Number of losing trades', example: 10 },
          { name: 'totalReturn', type: 'number', required: true, description: 'Total return amount', example: 1250.50 },
          { name: 'totalReturnPercent', type: 'number', required: true, description: 'Total return percentage', example: 12.51 },
          { name: 'maxDrawdown', type: 'number', required: true, description: 'Maximum drawdown amount', example: 450.25 },
          { name: 'maxDrawdownPercent', type: 'number', required: true, description: 'Maximum drawdown percentage', example: 4.50 },
          { name: 'sharpeRatio', type: 'number', required: true, description: 'Sharpe ratio', example: 1.85 },
          { name: 'profitFactor', type: 'number', required: true, description: 'Profit factor', example: 1.65 },
          { name: 'avgWin', type: 'number', required: true, description: 'Average winning trade', example: 125.30 },
          { name: 'avgLoss', type: 'number', required: true, description: 'Average losing trade', example: -75.20 },
          { name: 'winRate', type: 'number', required: true, description: 'Win rate percentage', example: 60.0 }
        ]
      },
      { name: 'equityCurve', type: 'EquityPoint[]', required: true, description: 'Equity curve data points' },
      { name: 'trades', type: 'Trade[]', required: true, description: 'Individual trade records' },
      { name: 'drawdownCurve', type: 'DrawdownPoint[]', required: true, description: 'Drawdown curve data points' }
    ],
    example: {
      id: "result_1705751234567_789",
      backtestId: "backtest_1705751234567_789",
      summary: {
        totalTrades: 25,
        winningTrades: 15,
        losingTrades: 10,
        totalReturn: 1250.50,
        totalReturnPercent: 12.51,
        maxDrawdown: 450.25,
        maxDrawdownPercent: 4.50,
        sharpeRatio: 1.85,
        profitFactor: 1.65,
        avgWin: 125.30,
        avgLoss: -75.20,
        winRate: 60.0
      },
      equityCurve: [
        { timestamp: "2024-01-01T00:00:00Z", equity: 10000, drawdown: 0 },
        { timestamp: "2024-01-02T00:00:00Z", equity: 10125, drawdown: 0 }
      ],
      trades: [
        {
          id: "trade_001",
          orderId: "order_001",
          symbol: "AAPL",
          side: "BUY",
          quantity: 100,
          price: 148.50,
          commission: 1.00,
          timestamp: "2024-01-02T10:30:00Z",
          userId: "user_123"
        }
      ]
    }
  },
  {
    name: 'ApiResponse<T>',
    description: 'Standard API response wrapper',
    properties: [
      { name: 'data', type: 'T', required: true, description: 'Response data payload' },
      { name: 'success', type: 'boolean', required: true, description: 'Success indicator', example: true },
      { name: 'message', type: 'string', required: false, description: 'Optional response message', example: 'Operation completed successfully' },
      { name: 'timestamp', type: 'Date', required: true, description: 'Response timestamp', example: '2024-01-20T15:00:00Z' }
    ],
    example: {
      data: "/* Actual response data */",
      success: true,
      message: "Operation completed successfully",
      timestamp: "2024-01-20T15:00:00Z"
    }
  },
  {
    name: 'PaginatedResponse<T>',
    description: 'Paginated API response wrapper',
    properties: [
      { name: 'data', type: 'T[]', required: true, description: 'Array of response data items' },
      { 
        name: 'pagination', 
        type: 'PaginationInfo', 
        required: true, 
        description: 'Pagination information',
        properties: [
          { name: 'page', type: 'number', required: true, description: 'Current page number', example: 1 },
          { name: 'limit', type: 'number', required: true, description: 'Items per page', example: 20 },
          { name: 'total', type: 'number', required: true, description: 'Total number of items', example: 100 },
          { name: 'totalPages', type: 'number', required: true, description: 'Total number of pages', example: 5 }
        ]
      },
      { name: 'success', type: 'boolean', required: true, description: 'Success indicator', example: true },
      { name: 'timestamp', type: 'Date', required: true, description: 'Response timestamp', example: '2024-01-20T15:00:00Z' }
    ],
    example: {
      data: ["/* Array of items */"],
      pagination: {
        page: 1,
        limit: 20,
        total: 100,
        totalPages: 5
      },
      success: true,
      timestamp: "2024-01-20T15:00:00Z"
    }
  }
];

export function SchemaViewer() {
  const [expandedSchema, setExpandedSchema] = useState<string | null>(null);
  const [expandedProperty, setExpandedProperty] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const renderProperty = (property: SchemaProperty, depth = 0, parentPath = '') => {
    const propertyPath = `${parentPath}.${property.name}`;
    const hasNestedProperties = property.properties && property.properties.length > 0;
    const isExpanded = expandedProperty === propertyPath;

    return (
      <div key={propertyPath} className={`${depth > 0 ? 'ml-4 border-l border-neutral-200 dark:border-neutral-700 pl-4' : ''}`}>
        <div className="flex items-start space-x-3 p-3 bg-white dark:bg-neutral-800 rounded border border-neutral-200 dark:border-neutral-700 mb-2">
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              {hasNestedProperties && (
                <button
                  onClick={() => setExpandedProperty(isExpanded ? null : propertyPath)}
                  className="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronRight className="h-3 w-3" />
                  )}
                </button>
              )}
              <code className="text-sm font-mono text-primary-600 dark:text-primary-400">
                {property.name}
              </code>
              <span className="text-xs text-neutral-500">
                {property.type}
              </span>
              {property.required && (
                <span className="text-xs bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 px-1 rounded">
                  required
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
              {property.description}
            </p>
            {property.example !== undefined && (
              <code className="text-xs text-neutral-500 mt-1 block">
                Example: {JSON.stringify(property.example)}
              </code>
            )}
          </div>
        </div>

        {hasNestedProperties && isExpanded && (
          <div className="ml-4 space-y-1">
            {property.properties!.map(nestedProperty => 
              renderProperty(nestedProperty, depth + 1, propertyPath)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
          Data Schemas
        </h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Complete data model definitions with properties, types, and example values.
        </p>
      </div>

      {schemas.map((schema, index) => {
        const isExpanded = expandedSchema === schema.name;

        return (
          <div
            key={index}
            className="border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden"
          >
            <button
              onClick={() => setExpandedSchema(isExpanded ? null : schema.name)}
              className="w-full p-4 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <code className="text-lg font-mono font-semibold text-primary-600 dark:text-primary-400">
                    {schema.name}
                  </code>
                </div>
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-neutral-500" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-neutral-500" />
                )}
              </div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
                {schema.description}
              </p>
            </button>

            {isExpanded && (
              <div className="border-t border-neutral-200 dark:border-neutral-700 p-4 bg-neutral-50 dark:bg-neutral-800/30">
                <div className="space-y-6">
                  {/* Properties */}
                  <div>
                    <h4 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">
                      Properties
                    </h4>
                    <div className="space-y-1">
                      {schema.properties.map(property => 
                        renderProperty(property, 0, schema.name)
                      )}
                    </div>
                  </div>

                  {/* Example */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">
                        Example
                      </h4>
                      <button
                        onClick={() => copyToClipboard(JSON.stringify(schema.example, null, 2), `${schema.name}-example`)}
                        className="flex items-center space-x-1 text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                      >
                        {copiedCode === `${schema.name}-example` ? (
                          <CheckCircle className="h-3 w-3" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                        <span>Copy</span>
                      </button>
                    </div>
                    <div className="bg-neutral-900 dark:bg-neutral-950 rounded p-3 overflow-x-auto">
                      <pre className="text-xs text-green-400">
                        {JSON.stringify(schema.example, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}