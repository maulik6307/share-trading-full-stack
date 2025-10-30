'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Copy, CheckCircle } from 'lucide-react';

interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  parameters?: Parameter[];
  requestBody?: any;
  responses: Response[];
  example: {
    request?: any;
    response: any;
  };
}

interface Parameter {
  name: string;
  type: string;
  required: boolean;
  description: string;
  example?: any;
}

interface Response {
  status: number;
  description: string;
  schema?: any;
}

const endpoints: ApiEndpoint[] = [
  {
    method: 'GET',
    path: '/api/v1/user',
    description: 'Get current user information',
    responses: [
      { status: 200, description: 'User information retrieved successfully' },
      { status: 401, description: 'Unauthorized - Invalid or missing token' }
    ],
    example: {
      response: {
        data: {
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
        },
        success: true,
        timestamp: "2024-01-20T14:45:00Z"
      }
    }
  },
  {
    method: 'PUT',
    path: '/api/v1/user',
    description: 'Update user profile information',
    requestBody: {
      name: "string (optional)",
      timezone: "string (optional)",
      preferences: "UserPreferences (optional)"
    },
    responses: [
      { status: 200, description: 'User updated successfully' },
      { status: 400, description: 'Invalid request data' },
      { status: 401, description: 'Unauthorized' }
    ],
    example: {
      request: {
        name: "John Smith",
        preferences: {
          theme: "light",
          notifications: {
            email: false,
            push: true,
            trading: true,
            system: true
          }
        }
      },
      response: {
        data: {
          id: "user_123",
          name: "John Smith",
          email: "john@example.com",
          timezone: "Asia/Kolkata",
          preferences: {
            theme: "light",
            notifications: {
              email: false,
              push: true,
              trading: true,
              system: true
            },
            defaultCurrency: "USD",
            dateFormat: "DD/MM/YYYY",
            language: "en"
          },
          updatedAt: "2024-01-20T15:00:00Z"
        },
        success: true,
        message: "User profile updated successfully",
        timestamp: "2024-01-20T15:00:00Z"
      }
    }
  },
  {
    method: 'GET',
    path: '/api/v1/orders',
    description: 'Get user orders with optional filtering',
    parameters: [
      { name: 'status', type: 'string', required: false, description: 'Filter by order status', example: 'PENDING' },
      { name: 'symbol', type: 'string', required: false, description: 'Filter by trading symbol', example: 'AAPL' },
      { name: 'strategyId', type: 'string', required: false, description: 'Filter by strategy ID' },
      { name: 'page', type: 'number', required: false, description: 'Page number for pagination', example: 1 },
      { name: 'limit', type: 'number', required: false, description: 'Number of items per page', example: 20 }
    ],
    responses: [
      { status: 200, description: 'Orders retrieved successfully' },
      { status: 401, description: 'Unauthorized' }
    ],
    example: {
      response: {
        data: [
          {
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
            commission: 0,
            createdAt: "2024-01-20T10:30:00Z",
            updatedAt: "2024-01-20T10:30:00Z",
            userId: "user_123"
          }
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1
        },
        success: true,
        timestamp: "2024-01-20T15:00:00Z"
      }
    }
  },
  {
    method: 'POST',
    path: '/api/v1/orders',
    description: 'Create a new trading order',
    requestBody: {
      symbol: "string (required)",
      side: "BUY | SELL (required)",
      type: "MARKET | LIMIT | STOP | STOP_LIMIT (required)",
      quantity: "number (required)",
      price: "number (optional, required for LIMIT orders)",
      stopPrice: "number (optional, required for STOP orders)",
      strategyId: "string (optional)"
    },
    responses: [
      { status: 201, description: 'Order created successfully' },
      { status: 400, description: 'Invalid order data' },
      { status: 401, description: 'Unauthorized' }
    ],
    example: {
      request: {
        symbol: "AAPL",
        side: "BUY",
        type: "LIMIT",
        quantity: 100,
        price: 150.25,
        strategyId: "strategy_ma_crossover_001"
      },
      response: {
        data: {
          id: "order_1705751234567_456",
          strategyId: "strategy_ma_crossover_001",
          symbol: "AAPL",
          side: "BUY",
          type: "LIMIT",
          quantity: 100,
          price: 150.25,
          status: "PENDING",
          filledQuantity: 0,
          remainingQuantity: 100,
          commission: 0,
          createdAt: "2024-01-20T15:05:00Z",
          updatedAt: "2024-01-20T15:05:00Z",
          userId: "user_123"
        },
        success: true,
        message: "Order placed successfully",
        timestamp: "2024-01-20T15:05:00Z"
      }
    }
  },
  {
    method: 'DELETE',
    path: '/api/v1/orders/{orderId}',
    description: 'Cancel an existing order',
    parameters: [
      { name: 'orderId', type: 'string', required: true, description: 'The ID of the order to cancel' }
    ],
    responses: [
      { status: 200, description: 'Order cancelled successfully' },
      { status: 404, description: 'Order not found' },
      { status: 400, description: 'Cannot cancel order (already filled or cancelled)' },
      { status: 401, description: 'Unauthorized' }
    ],
    example: {
      response: {
        data: {
          id: "order_1705751234567_456",
          status: "CANCELLED",
          remainingQuantity: 0,
          updatedAt: "2024-01-20T15:10:00Z"
        },
        success: true,
        message: "Order cancelled successfully",
        timestamp: "2024-01-20T15:10:00Z"
      }
    }
  },
  {
    method: 'GET',
    path: '/api/v1/positions',
    description: 'Get current trading positions',
    responses: [
      { status: 200, description: 'Positions retrieved successfully' },
      { status: 401, description: 'Unauthorized' }
    ],
    example: {
      response: {
        data: [
          {
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
        ],
        success: true,
        timestamp: "2024-01-20T15:00:00Z"
      }
    }
  },
  {
    method: 'GET',
    path: '/api/v1/strategies',
    description: 'Get user trading strategies',
    responses: [
      { status: 200, description: 'Strategies retrieved successfully' },
      { status: 401, description: 'Unauthorized' }
    ],
    example: {
      response: {
        data: [
          {
            id: "strategy_ma_crossover_001",
            name: "MA Crossover Strategy",
            description: "Simple moving average crossover strategy",
            type: "MA_CROSSOVER",
            parameters: {
              fastPeriod: 10,
              slowPeriod: 20,
              symbol: "AAPL"
            },
            status: "active",
            createdAt: "2024-01-15T10:00:00Z",
            updatedAt: "2024-01-18T16:30:00Z",
            userId: "user_123"
          }
        ],
        success: true,
        timestamp: "2024-01-20T15:00:00Z"
      }
    }
  },
  {
    method: 'POST',
    path: '/api/v1/backtests',
    description: 'Create a new backtest for a strategy',
    requestBody: {
      strategyId: "string (required)",
      startDate: "string (required, ISO date)",
      endDate: "string (required, ISO date)",
      initialCapital: "number (required)",
      symbols: "string[] (required)"
    },
    responses: [
      { status: 201, description: 'Backtest created successfully' },
      { status: 400, description: 'Invalid backtest configuration' },
      { status: 401, description: 'Unauthorized' }
    ],
    example: {
      request: {
        strategyId: "strategy_ma_crossover_001",
        startDate: "2024-01-01T00:00:00Z",
        endDate: "2024-01-15T23:59:59Z",
        initialCapital: 10000,
        symbols: ["AAPL", "GOOGL", "MSFT"]
      },
      response: {
        data: {
          id: "backtest_1705751234567_789",
          strategyId: "strategy_ma_crossover_001",
          status: "PENDING",
          progress: 0,
          createdAt: "2024-01-20T15:15:00Z"
        },
        success: true,
        message: "Backtest created successfully",
        timestamp: "2024-01-20T15:15:00Z"
      }
    }
  },
  {
    method: 'GET',
    path: '/api/v1/backtests/{backtestId}/results',
    description: 'Get backtest results and performance metrics',
    parameters: [
      { name: 'backtestId', type: 'string', required: true, description: 'The ID of the backtest' }
    ],
    responses: [
      { status: 200, description: 'Backtest results retrieved successfully' },
      { status: 404, description: 'Backtest not found' },
      { status: 202, description: 'Backtest still running' },
      { status: 401, description: 'Unauthorized' }
    ],
    example: {
      response: {
        data: {
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
        },
        success: true,
        timestamp: "2024-01-20T15:20:00Z"
      }
    }
  }
];

export function ApiEndpointCard() {
  const [expandedEndpoint, setExpandedEndpoint] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'POST': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'PUT': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'DELETE': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-neutral-100 text-neutral-800 dark:bg-neutral-900/20 dark:text-neutral-400';
    }
  };

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
          Available Endpoints
        </h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Click on any endpoint to view detailed information, parameters, and example responses.
        </p>
      </div>

      {endpoints.map((endpoint, index) => {
        const endpointId = `${endpoint.method}-${endpoint.path}`;
        const isExpanded = expandedEndpoint === endpointId;

        return (
          <div
            key={index}
            className="border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden"
          >
            <button
              onClick={() => setExpandedEndpoint(isExpanded ? null : endpointId)}
              className="w-full p-4 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getMethodColor(endpoint.method)}`}>
                    {endpoint.method}
                  </span>
                  <code className="text-sm font-mono text-neutral-900 dark:text-white">
                    {endpoint.path}
                  </code>
                </div>
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-neutral-500" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-neutral-500" />
                )}
              </div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
                {endpoint.description}
              </p>
            </button>

            {isExpanded && (
              <div className="border-t border-neutral-200 dark:border-neutral-700 p-4 bg-neutral-50 dark:bg-neutral-800/30">
                <div className="space-y-6">
                  {/* Parameters */}
                  {endpoint.parameters && endpoint.parameters.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">
                        Parameters
                      </h4>
                      <div className="space-y-2">
                        {endpoint.parameters.map((param, paramIndex) => (
                          <div
                            key={paramIndex}
                            className="flex items-start space-x-3 p-3 bg-white dark:bg-neutral-800 rounded border border-neutral-200 dark:border-neutral-700"
                          >
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <code className="text-sm font-mono text-primary-600 dark:text-primary-400">
                                  {param.name}
                                </code>
                                <span className="text-xs text-neutral-500">
                                  {param.type}
                                </span>
                                {param.required && (
                                  <span className="text-xs bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 px-1 rounded">
                                    required
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                                {param.description}
                              </p>
                              {param.example && (
                                <code className="text-xs text-neutral-500 mt-1 block">
                                  Example: {JSON.stringify(param.example)}
                                </code>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Request Body */}
                  {endpoint.requestBody && (
                    <div>
                      <h4 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">
                        Request Body
                      </h4>
                      <div className="bg-white dark:bg-neutral-800 rounded border border-neutral-200 dark:border-neutral-700 p-3">
                        <pre className="text-xs text-neutral-700 dark:text-neutral-300 overflow-x-auto">
                          {JSON.stringify(endpoint.requestBody, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* Responses */}
                  <div>
                    <h4 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">
                      Responses
                    </h4>
                    <div className="space-y-2">
                      {endpoint.responses.map((response, responseIndex) => (
                        <div
                          key={responseIndex}
                          className="flex items-center space-x-3 p-2 bg-white dark:bg-neutral-800 rounded border border-neutral-200 dark:border-neutral-700"
                        >
                          <span className={`px-2 py-1 text-xs font-medium rounded ${
                            response.status < 300 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                              : response.status < 500
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                          }`}>
                            {response.status}
                          </span>
                          <span className="text-sm text-neutral-700 dark:text-neutral-300">
                            {response.description}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Example */}
                  <div>
                    <h4 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">
                      Example
                    </h4>
                    <div className="space-y-4">
                      {endpoint.example.request && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                              Request
                            </h5>
                            <button
                              onClick={() => copyToClipboard(JSON.stringify(endpoint.example.request, null, 2), `${endpointId}-request`)}
                              className="flex items-center space-x-1 text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                            >
                              {copiedCode === `${endpointId}-request` ? (
                                <CheckCircle className="h-3 w-3" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                              <span>Copy</span>
                            </button>
                          </div>
                          <div className="bg-neutral-900 dark:bg-neutral-950 rounded p-3 overflow-x-auto">
                            <pre className="text-xs text-green-400">
                              {JSON.stringify(endpoint.example.request, null, 2)}
                            </pre>
                          </div>
                        </div>
                      )}

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                            Response
                          </h5>
                          <button
                            onClick={() => copyToClipboard(JSON.stringify(endpoint.example.response, null, 2), `${endpointId}-response`)}
                            className="flex items-center space-x-1 text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                          >
                            {copiedCode === `${endpointId}-response` ? (
                              <CheckCircle className="h-3 w-3" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                            <span>Copy</span>
                          </button>
                        </div>
                        <div className="bg-neutral-900 dark:bg-neutral-950 rounded p-3 overflow-x-auto">
                          <pre className="text-xs text-blue-400">
                            {JSON.stringify(endpoint.example.response, null, 2)}
                          </pre>
                        </div>
                      </div>
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