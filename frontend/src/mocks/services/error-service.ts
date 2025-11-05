// Error simulation and retry logic service

export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  jitter: boolean;
}

export interface ErrorScenario {
  name: string;
  probability: number;
  errorType: 'network' | 'server' | 'validation' | 'timeout' | 'rate_limit';
  message: string;
  code?: string;
  recoverable: boolean;
  retryAfter?: number;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public code?: string,
    public type: ErrorScenario['errorType'] = 'server',
    public recoverable: boolean = true,
    public retryAfter?: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class ErrorService {
  private static instance: ErrorService;
  private errorScenarios: ErrorScenario[] = [
    {
      name: 'network_timeout',
      probability: 0.02,
      errorType: 'network',
      message: 'Request timed out. Please check your connection.',
      code: 'NETWORK_TIMEOUT',
      recoverable: true,
    },
    {
      name: 'server_error',
      probability: 0.01,
      errorType: 'server',
      message: 'Internal server error. Please try again later.',
      code: 'INTERNAL_ERROR',
      recoverable: true,
    },
    {
      name: 'rate_limit',
      probability: 0.005,
      errorType: 'rate_limit',
      message: 'Rate limit exceeded. Please wait before making more requests.',
      code: 'RATE_LIMIT_EXCEEDED',
      recoverable: true,
      retryAfter: 5000,
    },
    {
      name: 'validation_error',
      probability: 0.03,
      errorType: 'validation',
      message: 'Invalid request data. Please check your input.',
      code: 'VALIDATION_ERROR',
      recoverable: false,
    },
    {
      name: 'service_unavailable',
      probability: 0.008,
      errorType: 'server',
      message: 'Service temporarily unavailable. Please try again.',
      code: 'SERVICE_UNAVAILABLE',
      recoverable: true,
    },
  ];

  private defaultRetryConfig: RetryConfig = {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
    jitter: true,
  };

  private constructor() {}

  public static getInstance(): ErrorService {
    if (!ErrorService.instance) {
      ErrorService.instance = new ErrorService();
    }
    return ErrorService.instance;
  }

  public simulateError(context: string = 'general'): void {
    const scenario = this.selectErrorScenario();
    if (scenario) {
      console.warn(`[ErrorService] Simulating ${scenario.name} in ${context}`);
      throw new ApiError(
        scenario.message,
        scenario.code,
        scenario.errorType,
        scenario.recoverable,
        scenario.retryAfter
      );
    }
  }

  private selectErrorScenario(): ErrorScenario | null {
    const random = Math.random();
    let cumulativeProbability = 0;

    for (const scenario of this.errorScenarios) {
      cumulativeProbability += scenario.probability;
      if (random < cumulativeProbability) {
        return scenario;
      }
    }

    return null;
  }

  public async withRetry<T>(
    operation: () => Promise<T>,
    config: Partial<RetryConfig> = {},
    context: string = 'operation'
  ): Promise<T> {
    const retryConfig = { ...this.defaultRetryConfig, ...config };
    let lastError: Error;
    
    for (let attempt = 1; attempt <= retryConfig.maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry if it's the last attempt
        if (attempt === retryConfig.maxAttempts) {
          break;
        }

        // Don't retry non-recoverable errors
        if (error instanceof ApiError && !error.recoverable) {
          break;
        }

        // Calculate delay for next attempt
        const delay = this.calculateDelay(attempt, retryConfig, error as ApiError);
        
        console.warn(
          `[ErrorService] Attempt ${attempt}/${retryConfig.maxAttempts} failed for ${context}. Retrying in ${delay}ms...`,
          error
        );

        await this.sleep(delay);
      }
    }

    throw lastError!;
  }

  private calculateDelay(attempt: number, config: RetryConfig, error?: ApiError): number {
    // Use retryAfter from error if available
    if (error?.retryAfter) {
      return error.retryAfter;
    }

    // Calculate exponential backoff
    let delay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1);
    
    // Apply maximum delay limit
    delay = Math.min(delay, config.maxDelay);
    
    // Add jitter to prevent thundering herd
    if (config.jitter) {
      delay = delay * (0.5 + Math.random() * 0.5);
    }

    return Math.floor(delay);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  public addErrorScenario(scenario: ErrorScenario): void {
    this.errorScenarios.push(scenario);
  }

  public removeErrorScenario(name: string): void {
    this.errorScenarios = this.errorScenarios.filter(s => s.name !== name);
  }

  public updateErrorProbability(name: string, probability: number): void {
    const scenario = this.errorScenarios.find(s => s.name === name);
    if (scenario) {
      scenario.probability = probability;
    }
  }

  public getErrorScenarios(): ErrorScenario[] {
    return [...this.errorScenarios];
  }

  public setDefaultRetryConfig(config: Partial<RetryConfig>): void {
    this.defaultRetryConfig = { ...this.defaultRetryConfig, ...config };
  }

  // Specific error simulation methods for different contexts
  public simulateOrderError(): void {
    const orderErrors: ErrorScenario[] = [
      {
        name: 'insufficient_funds',
        probability: 1.0, // Always throw when called
        errorType: 'validation',
        message: 'Insufficient funds to place this order.',
        code: 'INSUFFICIENT_FUNDS',
        recoverable: false,
      },
      {
        name: 'invalid_symbol',
        probability: 1.0,
        errorType: 'validation',
        message: 'Invalid trading symbol.',
        code: 'INVALID_SYMBOL',
        recoverable: false,
      },
      {
        name: 'market_closed',
        probability: 1.0,
        errorType: 'validation',
        message: 'Market is currently closed.',
        code: 'MARKET_CLOSED',
        recoverable: false,
      },
    ];

    const scenario = orderErrors[Math.floor(Math.random() * orderErrors.length)];
    throw new ApiError(
      scenario.message,
      scenario.code,
      scenario.errorType,
      scenario.recoverable
    );
  }

  public simulateBacktestError(): void {
    const backtestErrors: ErrorScenario[] = [
      {
        name: 'invalid_date_range',
        probability: 1.0,
        errorType: 'validation',
        message: 'Invalid date range for backtest.',
        code: 'INVALID_DATE_RANGE',
        recoverable: false,
      },
      {
        name: 'insufficient_data',
        probability: 1.0,
        errorType: 'validation',
        message: 'Insufficient historical data for the selected period.',
        code: 'INSUFFICIENT_DATA',
        recoverable: false,
      },
      {
        name: 'strategy_compilation_error',
        probability: 1.0,
        errorType: 'validation',
        message: 'Strategy code contains compilation errors.',
        code: 'COMPILATION_ERROR',
        recoverable: false,
      },
    ];

    const scenario = backtestErrors[Math.floor(Math.random() * backtestErrors.length)];
    throw new ApiError(
      scenario.message,
      scenario.code,
      scenario.errorType,
      scenario.recoverable
    );
  }

  public simulateNetworkError(): void {
    throw new ApiError(
      'Network connection failed. Please check your internet connection.',
      'NETWORK_ERROR',
      'network',
      true
    );
  }

  public simulateTimeoutError(): void {
    throw new ApiError(
      'Request timed out. The server took too long to respond.',
      'TIMEOUT_ERROR',
      'timeout',
      true
    );
  }
}

export const errorService = ErrorService.getInstance();

// Utility function for wrapping API calls with retry logic
export async function withRetry<T>(
  operation: () => Promise<T>,
  config?: Partial<RetryConfig>,
  context?: string
): Promise<T> {
  return errorService.withRetry(operation, config, context);
}

// Error boundary helper for React components
export function isRecoverableError(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.recoverable;
  }
  return true; // Assume recoverable by default
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
}

export function getErrorCode(error: unknown): string | undefined {
  if (error instanceof ApiError) {
    return error.code;
  }
  return undefined;
}