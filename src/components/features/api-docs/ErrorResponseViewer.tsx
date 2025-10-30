'use client';

import { useState } from 'react';
import { AlertTriangle, Copy, CheckCircle, Info, XCircle, AlertCircle } from 'lucide-react';

interface ErrorExample {
  status: number;
  title: string;
  description: string;
  causes: string[];
  resolution: string;
  example: {
    error: any;
    headers?: Record<string, string>;
  };
}

const errorExamples: ErrorExample[] = [
  {
    status: 400,
    title: 'Bad Request',
    description: 'The request was invalid or cannot be served. This usually indicates a client-side error.',
    causes: [
      'Missing required parameters',
      'Invalid parameter values or types',
      'Malformed JSON in request body',
      'Invalid date formats',
      'Constraint violations (e.g., negative quantities)'
    ],
    resolution: 'Check the request parameters and body format. Ensure all required fields are provided with valid values.',
    example: {
      error: {
        message: "Invalid order data: quantity must be greater than 0",
        code: "VALIDATION_ERROR",
        details: {
          field: "quantity",
          value: -10,
          constraint: "must be positive"
        },
        timestamp: "2024-01-20T15:30:00Z"
      },
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': 'req_1705751800000_abc123'
      }
    }
  },
  {
    status: 401,
    title: 'Unauthorized',
    description: 'Authentication failed or user does not have permission to access the resource.',
    causes: [
      'Missing Authorization header',
      'Invalid or expired JWT token',
      'Token signature verification failed',
      'User account suspended or deactivated'
    ],
    resolution: 'Ensure a valid Bearer token is included in the Authorization header. Refresh the token if expired.',
    example: {
      error: {
        message: "Invalid or expired authentication token",
        code: "AUTH_TOKEN_INVALID",
        details: {
          reason: "Token signature verification failed",
          expiredAt: "2024-01-20T14:00:00Z"
        },
        timestamp: "2024-01-20T15:30:00Z"
      },
      headers: {
        'Content-Type': 'application/json',
        'WWW-Authenticate': 'Bearer realm="ShareTrading API"'
      }
    }
  },
  {
    status: 403,
    title: 'Forbidden',
    description: 'The request was valid but the server is refusing to fulfill it due to insufficient permissions.',
    causes: [
      'User lacks required permissions for the operation',
      'Account subscription level insufficient',
      'Resource access restricted by policy',
      'Rate limiting or quota exceeded'
    ],
    resolution: 'Verify user permissions and account status. Contact support if access should be granted.',
    example: {
      error: {
        message: "Insufficient permissions to access this resource",
        code: "PERMISSION_DENIED",
        details: {
          requiredPermission: "trading:orders:create",
          userPermissions: ["trading:orders:read", "trading:positions:read"],
          accountType: "basic"
        },
        timestamp: "2024-01-20T15:30:00Z"
      }
    }
  },
  {
    status: 404,
    title: 'Not Found',
    description: 'The requested resource could not be found on the server.',
    causes: [
      'Invalid resource ID in URL path',
      'Resource has been deleted',
      'Incorrect API endpoint URL',
      'Resource belongs to different user'
    ],
    resolution: 'Verify the resource ID and endpoint URL. Ensure the resource exists and belongs to the authenticated user.',
    example: {
      error: {
        message: "Order not found",
        code: "RESOURCE_NOT_FOUND",
        details: {
          resourceType: "Order",
          resourceId: "order_invalid_123",
          userId: "user_123"
        },
        timestamp: "2024-01-20T15:30:00Z"
      }
    }
  },
  {
    status: 409,
    title: 'Conflict',
    description: 'The request conflicts with the current state of the resource.',
    causes: [
      'Attempting to cancel an already filled order',
      'Duplicate resource creation',
      'Concurrent modification conflicts',
      'Business rule violations'
    ],
    resolution: 'Check the current state of the resource and adjust the request accordingly.',
    example: {
      error: {
        message: "Cannot cancel order with status FILLED",
        code: "OPERATION_CONFLICT",
        details: {
          orderId: "order_1705751234567_123",
          currentStatus: "FILLED",
          requestedOperation: "cancel",
          filledAt: "2024-01-20T14:45:00Z"
        },
        timestamp: "2024-01-20T15:30:00Z"
      }
    }
  },
  {
    status: 422,
    title: 'Unprocessable Entity',
    description: 'The request was well-formed but contains semantic errors or business logic violations.',
    causes: [
      'Invalid business logic combinations',
      'Insufficient account balance',
      'Market hours restrictions',
      'Position size limits exceeded'
    ],
    resolution: 'Review the business rules and constraints. Ensure the request complies with trading regulations and account limits.',
    example: {
      error: {
        message: "Insufficient buying power for order",
        code: "BUSINESS_RULE_VIOLATION",
        details: {
          requiredAmount: 15025.00,
          availableAmount: 5000.00,
          currency: "USD",
          orderId: "order_1705751234567_456"
        },
        timestamp: "2024-01-20T15:30:00Z"
      }
    }
  },
  {
    status: 429,
    title: 'Too Many Requests',
    description: 'The user has sent too many requests in a given amount of time (rate limiting).',
    causes: [
      'API rate limit exceeded',
      'Too many concurrent requests',
      'Burst limit exceeded',
      'Daily quota reached'
    ],
    resolution: 'Reduce request frequency and implement exponential backoff. Check rate limit headers for guidance.',
    example: {
      error: {
        message: "Rate limit exceeded",
        code: "RATE_LIMIT_EXCEEDED",
        details: {
          limit: 100,
          remaining: 0,
          resetTime: "2024-01-20T16:00:00Z",
          retryAfter: 1800
        },
        timestamp: "2024-01-20T15:30:00Z"
      },
      headers: {
        'X-RateLimit-Limit': '100',
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': '1705752000',
        'Retry-After': '1800'
      }
    }
  },
  {
    status: 500,
    title: 'Internal Server Error',
    description: 'An unexpected error occurred on the server side.',
    causes: [
      'Database connection failures',
      'Third-party service unavailable',
      'Unhandled application exceptions',
      'Configuration errors'
    ],
    resolution: 'This is a server-side issue. Retry the request after a short delay. Contact support if the problem persists.',
    example: {
      error: {
        message: "An internal server error occurred",
        code: "INTERNAL_SERVER_ERROR",
        details: {
          errorId: "err_1705751800000_xyz789",
          timestamp: "2024-01-20T15:30:00Z"
        },
        timestamp: "2024-01-20T15:30:00Z"
      },
      headers: {
        'X-Error-ID': 'err_1705751800000_xyz789'
      }
    }
  },
  {
    status: 502,
    title: 'Bad Gateway',
    description: 'The server received an invalid response from an upstream server.',
    causes: [
      'Market data provider unavailable',
      'Trading system maintenance',
      'Network connectivity issues',
      'Load balancer configuration problems'
    ],
    resolution: 'This indicates a temporary service disruption. Retry the request after a delay.',
    example: {
      error: {
        message: "Market data service temporarily unavailable",
        code: "UPSTREAM_SERVICE_ERROR",
        details: {
          service: "market-data-provider",
          lastSuccessfulResponse: "2024-01-20T15:25:00Z",
          estimatedRecovery: "2024-01-20T15:35:00Z"
        },
        timestamp: "2024-01-20T15:30:00Z"
      }
    }
  },
  {
    status: 503,
    title: 'Service Unavailable',
    description: 'The server is temporarily unable to handle the request due to maintenance or overload.',
    causes: [
      'Scheduled maintenance window',
      'System overload or capacity issues',
      'Database maintenance',
      'Emergency system shutdown'
    ],
    resolution: 'Wait for the maintenance to complete or system load to decrease. Check the Retry-After header for guidance.',
    example: {
      error: {
        message: "Service temporarily unavailable due to maintenance",
        code: "SERVICE_UNAVAILABLE",
        details: {
          maintenanceWindow: {
            start: "2024-01-20T15:00:00Z",
            end: "2024-01-20T16:00:00Z"
          },
          reason: "Database maintenance"
        },
        timestamp: "2024-01-20T15:30:00Z"
      },
      headers: {
        'Retry-After': '1800'
      }
    }
  }
];

export function ErrorResponseViewer() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getStatusColor = (status: number) => {
    if (status >= 400 && status < 500) {
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
    } else if (status >= 500) {
      return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
    }
    return 'bg-neutral-100 text-neutral-800 dark:bg-neutral-900/20 dark:text-neutral-400';
  };

  const getStatusIcon = (status: number) => {
    if (status >= 400 && status < 500) {
      return <AlertCircle className="h-4 w-4" />;
    } else if (status >= 500) {
      return <XCircle className="h-4 w-4" />;
    }
    return <Info className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
          Error Responses
        </h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Comprehensive guide to API error responses, common causes, and resolution strategies.
        </p>
      </div>

      {/* Error Response Format */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Standard Error Response Format
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
              All API errors follow a consistent structure to help with debugging and error handling.
            </p>
            <div className="bg-blue-900 dark:bg-blue-950 rounded p-3 overflow-x-auto">
              <pre className="text-xs text-blue-300 dark:text-blue-400">
{`{
  "message": "Human-readable error description",
  "code": "MACHINE_READABLE_ERROR_CODE",
  "details": {
    // Additional context-specific information
  },
  "timestamp": "2024-01-20T15:30:00Z"
}`}
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Error Examples */}
      <div className="space-y-4">
        {errorExamples.map((error, index) => (
          <div
            key={index}
            className="border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden"
          >
            <div className="p-4 bg-white dark:bg-neutral-800">
              <div className="flex items-start space-x-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${getStatusColor(error.status)}`}>
                  {getStatusIcon(error.status)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(error.status)}`}>
                      {error.status}
                    </span>
                    <h4 className="text-lg font-semibold text-neutral-900 dark:text-white">
                      {error.title}
                    </h4>
                  </div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                    {error.description}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* Common Causes */}
                    <div>
                      <h5 className="text-sm font-medium text-neutral-900 dark:text-white mb-2">
                        Common Causes
                      </h5>
                      <ul className="text-xs text-neutral-600 dark:text-neutral-400 space-y-1">
                        {error.causes.map((cause, causeIndex) => (
                          <li key={causeIndex} className="flex items-start space-x-2">
                            <span className="w-1 h-1 bg-neutral-400 rounded-full mt-2 flex-shrink-0"></span>
                            <span>{cause}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Resolution */}
                    <div>
                      <h5 className="text-sm font-medium text-neutral-900 dark:text-white mb-2">
                        Resolution
                      </h5>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">
                        {error.resolution}
                      </p>
                    </div>
                  </div>

                  {/* Example Response */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-sm font-medium text-neutral-900 dark:text-white">
                        Example Response
                      </h5>
                      <button
                        onClick={() => copyToClipboard(JSON.stringify(error.example.error, null, 2), `error-${error.status}`)}
                        className="flex items-center space-x-1 text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                      >
                        {copiedCode === `error-${error.status}` ? (
                          <CheckCircle className="h-3 w-3" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                        <span>Copy</span>
                      </button>
                    </div>
                    
                    <div className="bg-neutral-900 dark:bg-neutral-950 rounded p-3 overflow-x-auto mb-3">
                      <pre className="text-xs text-red-400">
                        {JSON.stringify(error.example.error, null, 2)}
                      </pre>
                    </div>

                    {/* Response Headers */}
                    {error.example.headers && (
                      <div>
                        <h6 className="text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                          Response Headers
                        </h6>
                        <div className="bg-neutral-100 dark:bg-neutral-800 rounded p-2">
                          {Object.entries(error.example.headers).map(([key, value]) => (
                            <div key={key} className="text-xs text-neutral-600 dark:text-neutral-400">
                              <span className="font-mono text-neutral-800 dark:text-neutral-200">{key}:</span> {value}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Best Practices */}
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-green-900 dark:text-green-100 mb-2">
              Error Handling Best Practices
            </h4>
            <ul className="text-sm text-green-700 dark:text-green-300 space-y-2">
              <li className="flex items-start space-x-2">
                <span className="w-1 h-1 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                <span>Always check the HTTP status code and error code for proper error categorization</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-1 h-1 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                <span>Implement exponential backoff for retryable errors (5xx status codes)</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-1 h-1 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                <span>Log error details including the error ID for support troubleshooting</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-1 h-1 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                <span>Respect rate limiting headers and implement appropriate throttling</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-1 h-1 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                <span>Provide meaningful error messages to end users based on error codes</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}