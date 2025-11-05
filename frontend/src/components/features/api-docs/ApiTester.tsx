'use client';

import { useState } from 'react';
import { Play, Copy, CheckCircle, AlertCircle, Clock, CheckSquare } from 'lucide-react';
import { mockApiService } from '@/mocks/services/api-service';
import { OrderSide, OrderType, StrategyType, StrategyStatus } from '@/types/trading';

interface TestEndpoint {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  parameters?: TestParameter[];
  requestBody?: any;
  testFunction: () => Promise<any>;
}

interface TestParameter {
  name: string;
  type: string;
  required: boolean;
  description: string;
  defaultValue?: any;
}

interface TestResult {
  success: boolean;
  status: number;
  data?: any;
  error?: string;
  duration: number;
  timestamp: Date;
}

const testEndpoints: TestEndpoint[] = [
  {
    id: 'get-user',
    name: 'Get User Profile',
    method: 'GET',
    path: '/api/v1/user',
    description: 'Retrieve current user information',
    testFunction: () => mockApiService.getUser()
  },
  {
    id: 'get-orders',
    name: 'Get Orders',
    method: 'GET',
    path: '/api/v1/orders',
    description: 'Retrieve user orders with optional filtering',
    parameters: [
      { name: 'status', type: 'string', required: false, description: 'Filter by order status', defaultValue: 'PENDING' },
      { name: 'page', type: 'number', required: false, description: 'Page number', defaultValue: 1 },
      { name: 'limit', type: 'number', required: false, description: 'Items per page', defaultValue: 10 }
    ],
    testFunction: () => mockApiService.getOrders({ status: 'PENDING', page: 1, limit: 10 })
  },
  {
    id: 'create-order',
    name: 'Create Order',
    method: 'POST',
    path: '/api/v1/orders',
    description: 'Create a new trading order',
    requestBody: {
      symbol: 'AAPL',
      side: 'BUY',
      type: 'LIMIT',
      quantity: 100,
      price: 150.25
    },
    testFunction: () => mockApiService.createOrder({
      symbol: 'AAPL',
      side: 'BUY' as OrderSide,
      type: 'LIMIT' as OrderType,
      quantity: 100,
      price: 150.25,
      commission: 0,
      avgFillPrice: undefined,
      strategyId: undefined,
      stopPrice: undefined,
      rejectionReason: undefined,
      filledAt: undefined,
      tags: undefined
    })
  },
  {
    id: 'get-positions',
    name: 'Get Positions',
    method: 'GET',
    path: '/api/v1/positions',
    description: 'Retrieve current trading positions',
    testFunction: () => mockApiService.getPositions()
  },
  {
    id: 'get-strategies',
    name: 'Get Strategies',
    method: 'GET',
    path: '/api/v1/strategies',
    description: 'Retrieve user trading strategies',
    testFunction: () => mockApiService.getStrategies()
  },
  {
    id: 'create-strategy',
    name: 'Create Strategy',
    method: 'POST',
    path: '/api/v1/strategies',
    description: 'Create a new trading strategy',
    requestBody: {
      name: 'Test MA Strategy',
      description: 'Test moving average crossover strategy',
      type: 'MA_CROSSOVER',
      parameters: {
        fastPeriod: 10,
        slowPeriod: 20,
        symbol: 'AAPL'
      },
      status: 'draft'
    },
    testFunction: () => mockApiService.createStrategy({
      name: 'Test MA Strategy',
      description: 'Test moving average crossover strategy',
      type: 'TEMPLATE' as StrategyType,
      status: 'DRAFT' as StrategyStatus,
      parameters: {
        fastPeriod: 10,
        slowPeriod: 20,
        symbol: 'AAPL'
      },
      code: undefined,
      templateId: undefined,
      isTemplate: false,
      tags: [],
      lastBacktestId: undefined,
      deployedAt: undefined,
      performance: undefined
    })
  },
  {
    id: 'get-backtests',
    name: 'Get Backtests',
    method: 'GET',
    path: '/api/v1/backtests',
    description: 'Retrieve backtest history',
    testFunction: () => mockApiService.getBacktests()
  },
  {
    id: 'create-backtest',
    name: 'Create Backtest',
    method: 'POST',
    path: '/api/v1/backtests',
    description: 'Create a new backtest',
    requestBody: {
      strategyId: 'strategy_ma_crossover_001',
      startDate: '2024-01-01T00:00:00Z',
      endDate: '2024-01-15T23:59:59Z',
      initialCapital: 10000,
      symbols: ['AAPL', 'GOOGL']
    },
    testFunction: () => mockApiService.createBacktest({
      strategyId: 'strategy_ma_crossover_001',
      name: 'Test Backtest',
      startDate: new Date('2024-01-01T00:00:00Z'),
      endDate: new Date('2024-01-15T23:59:59Z'),
      initialCapital: 10000,
      commission: 1.0,
      slippage: 0.01,
      startedAt: undefined,
      completedAt: undefined,
      errorMessage: undefined,
      result: undefined
    })
  },
  {
    id: 'get-market-data',
    name: 'Get Market Data',
    method: 'GET',
    path: '/api/v1/market-data',
    description: 'Retrieve market data for symbols',
    parameters: [
      { name: 'symbols', type: 'string[]', required: false, description: 'Array of symbols', defaultValue: ['AAPL', 'GOOGL'] }
    ],
    testFunction: () => mockApiService.getMarketData(['AAPL', 'GOOGL'])
  },
  {
    id: 'get-alerts',
    name: 'Get Alerts',
    method: 'GET',
    path: '/api/v1/alerts',
    description: 'Retrieve user alerts and notifications',
    parameters: [
      { name: 'isRead', type: 'boolean', required: false, description: 'Filter by read status', defaultValue: false }
    ],
    testFunction: () => mockApiService.getAlerts({ isRead: false })
  }
];

export function ApiTester() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<TestEndpoint | null>(null);
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({});
  const [runningTests, setRunningTests] = useState<Set<string>>(new Set());
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const runTest = async (endpoint: TestEndpoint) => {
    setRunningTests(prev => new Set([...Array.from(prev), endpoint.id]));
    
    const startTime = Date.now();
    
    try {
      const result = await endpoint.testFunction();
      const duration = Date.now() - startTime;
      
      setTestResults(prev => ({
        ...prev,
        [endpoint.id]: {
          success: true,
          status: 200,
          data: result,
          duration,
          timestamp: new Date()
        }
      }));
    } catch (error) {
      const duration = Date.now() - startTime;
      
      setTestResults(prev => ({
        ...prev,
        [endpoint.id]: {
          success: false,
          status: 500,
          error: error instanceof Error ? error.message : 'Unknown error',
          duration,
          timestamp: new Date()
        }
      }));
    } finally {
      setRunningTests(prev => {
        const newSet = new Set(Array.from(prev));
        newSet.delete(endpoint.id);
        return newSet;
      });
    }
  };

  const runAllTests = async () => {
    for (const endpoint of testEndpoints) {
      await runTest(endpoint);
      // Add small delay between tests
      await new Promise(resolve => setTimeout(resolve, 200));
    }
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

  const getStatusColor = (success: boolean) => {
    return success 
      ? 'text-green-600 dark:text-green-400' 
      : 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
              API Testing Interface
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Test API endpoints with real mock data and see live responses.
            </p>
          </div>
          <button
            onClick={runAllTests}
            disabled={runningTests.size > 0}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Play className="h-4 w-4" />
            <span>Run All Tests</span>
          </button>
        </div>

        {/* Test Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4">
            <div className="flex items-center space-x-2">
              <CheckSquare className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
              <span className="text-sm font-medium text-neutral-900 dark:text-white">Total Tests</span>
            </div>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white mt-1">
              {testEndpoints.length}
            </p>
          </div>

          <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-neutral-900 dark:text-white">Passed</span>
            </div>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
              {Object.values(testResults).filter(r => r.success).length}
            </p>
          </div>

          <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <span className="text-sm font-medium text-neutral-900 dark:text-white">Failed</span>
            </div>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
              {Object.values(testResults).filter(r => !r.success).length}
            </p>
          </div>

          <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-neutral-900 dark:text-white">Running</span>
            </div>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
              {Array.from(runningTests).length}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test List */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">
            Available Tests
          </h4>
          {testEndpoints.map((endpoint) => {
            const result = testResults[endpoint.id];
            const isRunning = runningTests.has(endpoint.id);

            return (
              <div
                key={endpoint.id}
                className={`border border-neutral-200 dark:border-neutral-700 rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedEndpoint?.id === endpoint.id
                    ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800'
                    : 'bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                }`}
                onClick={() => setSelectedEndpoint(endpoint)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getMethodColor(endpoint.method)}`}>
                      {endpoint.method}
                    </span>
                    <span className="text-sm font-medium text-neutral-900 dark:text-white">
                      {endpoint.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {result && (
                      <div className={`flex items-center space-x-1 ${getStatusColor(result.success)}`}>
                        {result.success ? (
                          <CheckCircle className="h-3 w-3" />
                        ) : (
                          <AlertCircle className="h-3 w-3" />
                        )}
                        <span className="text-xs">{result.duration}ms</span>
                      </div>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        runTest(endpoint);
                      }}
                      disabled={isRunning}
                      className="p-1 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 disabled:opacity-50"
                    >
                      {isRunning ? (
                        <Clock className="h-4 w-4 animate-spin" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                  {endpoint.description}
                </p>
                <code className="text-xs text-neutral-500 mt-1 block">
                  {endpoint.path}
                </code>
              </div>
            );
          })}
        </div>

        {/* Test Details */}
        <div className="space-y-4">
          {selectedEndpoint ? (
            <>
              <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">
                    Test Details
                  </h4>
                  <button
                    onClick={() => runTest(selectedEndpoint)}
                    disabled={runningTests.has(selectedEndpoint.id)}
                    className="flex items-center space-x-2 px-3 py-1 bg-primary-600 text-white text-sm rounded hover:bg-primary-700 disabled:opacity-50 transition-colors"
                  >
                    {runningTests.has(selectedEndpoint.id) ? (
                      <Clock className="h-3 w-3 animate-spin" />
                    ) : (
                      <Play className="h-3 w-3" />
                    )}
                    <span>Run Test</span>
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getMethodColor(selectedEndpoint.method)}`}>
                        {selectedEndpoint.method}
                      </span>
                      <code className="text-sm font-mono text-neutral-900 dark:text-white">
                        {selectedEndpoint.path}
                      </code>
                    </div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {selectedEndpoint.description}
                    </p>
                  </div>

                  {selectedEndpoint.parameters && (
                    <div>
                      <h5 className="text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Parameters
                      </h5>
                      <div className="space-y-1">
                        {selectedEndpoint.parameters.map((param, index) => (
                          <div key={index} className="text-xs">
                            <code className="text-primary-600 dark:text-primary-400">{param.name}</code>
                            <span className="text-neutral-500 ml-2">({param.type})</span>
                            {param.required && (
                              <span className="text-red-500 ml-1">*</span>
                            )}
                            <p className="text-neutral-600 dark:text-neutral-400 ml-4">
                              {param.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedEndpoint.requestBody && (
                    <div>
                      <h5 className="text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Request Body
                      </h5>
                      <div className="bg-neutral-100 dark:bg-neutral-900 rounded p-2 overflow-x-auto">
                        <pre className="text-xs text-neutral-700 dark:text-neutral-300">
                          {JSON.stringify(selectedEndpoint.requestBody, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Test Result */}
              {testResults[selectedEndpoint.id] && (
                <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">
                      Test Result
                    </h4>
                    <button
                      onClick={() => copyToClipboard(
                        JSON.stringify(testResults[selectedEndpoint.id].data || testResults[selectedEndpoint.id].error, null, 2),
                        `result-${selectedEndpoint.id}`
                      )}
                      className="flex items-center space-x-1 text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                    >
                      {copiedCode === `result-${selectedEndpoint.id}` ? (
                        <CheckCircle className="h-3 w-3" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                      <span>Copy</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-4 text-sm">
                      <div className={`flex items-center space-x-1 ${getStatusColor(testResults[selectedEndpoint.id].success)}`}>
                        {testResults[selectedEndpoint.id].success ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <AlertCircle className="h-4 w-4" />
                        )}
                        <span>
                          {testResults[selectedEndpoint.id].success ? 'Success' : 'Failed'}
                        </span>
                      </div>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        {testResults[selectedEndpoint.id].duration}ms
                      </span>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        {testResults[selectedEndpoint.id].timestamp.toLocaleTimeString()}
                      </span>
                    </div>

                    <div className="bg-neutral-900 dark:bg-neutral-950 rounded p-3 overflow-x-auto">
                      <pre className={`text-xs ${testResults[selectedEndpoint.id].success ? 'text-green-400' : 'text-red-400'}`}>
                        {JSON.stringify(
                          testResults[selectedEndpoint.id].data || testResults[selectedEndpoint.id].error,
                          null,
                          2
                        )}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-8 text-center">
              <Play className="h-8 w-8 text-neutral-400 mx-auto mb-3" />
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Select an endpoint from the list to view details and run tests
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}