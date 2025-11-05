// Telemetry service for analytics tracking

export interface TelemetryEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp: Date;
  sessionId: string;
  userId?: string;
}

export interface UserAction {
  action: string;
  category: 'navigation' | 'trading' | 'strategy' | 'backtest' | 'user' | 'system';
  label?: string;
  value?: number;
  metadata?: Record<string, any>;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count' | 'percent';
  timestamp: Date;
}

export interface ErrorEvent {
  error: Error;
  context?: string;
  userId?: string;
  timestamp: Date;
  stack?: string;
  userAgent?: string;
  url?: string;
}

class TelemetryService {
  private static instance: TelemetryService;
  private sessionId: string;
  private userId?: string;
  private events: TelemetryEvent[] = [];
  private isEnabled = true;

  private constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeSession();
  }

  public static getInstance(): TelemetryService {
    if (!TelemetryService.instance) {
      TelemetryService.instance = new TelemetryService();
    }
    return TelemetryService.instance;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeSession(): void {
    this.track('session_start', {
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      timestamp: new Date().toISOString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
  }

  public setUserId(userId: string): void {
    this.userId = userId;
    this.track('user_identified', { userId });
  }

  public enable(): void {
    this.isEnabled = true;
    this.track('telemetry_enabled');
  }

  public disable(): void {
    this.track('telemetry_disabled');
    this.isEnabled = false;
  }

  public track(eventName: string, properties?: Record<string, any>): void {
    if (!this.isEnabled) return;

    const event: TelemetryEvent = {
      name: eventName,
      properties: properties || {},
      timestamp: new Date(),
      sessionId: this.sessionId,
      userId: this.userId,
    };

    this.events.push(event);
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Telemetry]', eventName, properties);
    }

    // Keep only last 1000 events to prevent memory issues
    if (this.events.length > 1000) {
      this.events = this.events.slice(-1000);
    }
  }

  public trackUserAction(action: UserAction): void {
    this.track(`${action.category}_${action.action}`, {
      category: action.category,
      label: action.label,
      value: action.value,
      ...action.metadata,
    });
  }

  public trackPerformance(metric: PerformanceMetric): void {
    this.track('performance_metric', {
      metricName: metric.name,
      value: metric.value,
      unit: metric.unit,
    });
  }

  public trackError(errorEvent: ErrorEvent): void {
    this.track('error_occurred', {
      errorMessage: errorEvent.error.message,
      errorName: errorEvent.error.name,
      context: errorEvent.context,
      stack: errorEvent.stack || errorEvent.error.stack,
      userAgent: errorEvent.userAgent,
      url: errorEvent.url,
    });
  }

  public trackPageView(page: string, title?: string): void {
    this.track('page_view', {
      page,
      title,
      referrer: typeof document !== 'undefined' ? document.referrer || '' : '',
    });
  }

  // Trading-specific tracking methods
  public trackStrategyCreated(strategyId: string, type: string, templateId?: string): void {
    this.trackUserAction({
      action: 'created',
      category: 'strategy',
      label: type,
      metadata: { strategyId, templateId },
    });
  }

  public trackStrategyDeployed(strategyId: string, mode: 'paper' | 'live'): void {
    this.trackUserAction({
      action: 'deployed',
      category: 'strategy',
      label: mode,
      metadata: { strategyId },
    });
  }

  public trackBacktestStarted(backtestId: string, strategyId: string, duration: string): void {
    this.trackUserAction({
      action: 'started',
      category: 'backtest',
      label: duration,
      metadata: { backtestId, strategyId },
    });
  }

  public trackBacktestCompleted(backtestId: string, duration: number, totalReturn: number): void {
    this.trackUserAction({
      action: 'completed',
      category: 'backtest',
      value: totalReturn,
      metadata: { backtestId, durationMs: duration },
    });
  }

  public trackOrderPlaced(orderId: string, symbol: string, side: string, type: string, quantity: number): void {
    this.trackUserAction({
      action: 'placed',
      category: 'trading',
      label: `${side}_${type}`,
      value: quantity,
      metadata: { orderId, symbol },
    });
  }

  public trackOrderFilled(orderId: string, symbol: string, fillPrice: number, quantity: number): void {
    this.trackUserAction({
      action: 'filled',
      category: 'trading',
      value: fillPrice * quantity,
      metadata: { orderId, symbol, fillPrice, quantity },
    });
  }

  public trackOnboardingStep(step: string, completed: boolean): void {
    this.trackUserAction({
      action: completed ? 'completed' : 'started',
      category: 'user',
      label: `onboarding_${step}`,
    });
  }

  public trackFeatureUsage(feature: string, action: string): void {
    this.trackUserAction({
      action,
      category: 'system',
      label: feature,
    });
  }

  // Analytics and reporting methods
  public getEvents(filter?: {
    category?: string;
    action?: string;
    startDate?: Date;
    endDate?: Date;
  }): TelemetryEvent[] {
    let filteredEvents = [...this.events];

    if (filter) {
      if (filter.category) {
        filteredEvents = filteredEvents.filter(event => 
          event.properties?.category === filter.category
        );
      }
      
      if (filter.action) {
        filteredEvents = filteredEvents.filter(event => 
          event.name.includes(filter.action!)
        );
      }
      
      if (filter.startDate) {
        filteredEvents = filteredEvents.filter(event => 
          event.timestamp >= filter.startDate!
        );
      }
      
      if (filter.endDate) {
        filteredEvents = filteredEvents.filter(event => 
          event.timestamp <= filter.endDate!
        );
      }
    }

    return filteredEvents.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  public getEventCounts(category?: string): Record<string, number> {
    const events = category ? 
      this.events.filter(e => e.properties?.category === category) : 
      this.events;

    const counts: Record<string, number> = {};
    
    events.forEach(event => {
      counts[event.name] = (counts[event.name] || 0) + 1;
    });

    return counts;
  }

  public getSessionStats(): {
    sessionId: string;
    userId?: string;
    startTime: Date;
    eventCount: number;
    duration: number;
    isActive: boolean;
  } {
    const sessionStart = this.events.find(e => e.name === 'session_start');
    const startTime = sessionStart?.timestamp || new Date();
    const duration = Date.now() - startTime.getTime();

    return {
      sessionId: this.sessionId,
      userId: this.userId,
      startTime,
      eventCount: this.events.length,
      duration,
      isActive: this.isEnabled,
    };
  }

  public exportEvents(): string {
    return JSON.stringify({
      sessionId: this.sessionId,
      userId: this.userId,
      exportedAt: new Date().toISOString(),
      events: this.events,
    }, null, 2);
  }

  public clearEvents(): void {
    this.events = [];
    this.track('events_cleared');
  }
}

// Export singleton instance
export const telemetryService = TelemetryService.getInstance();

// Convenience functions for common tracking patterns
export const trackEvent = (name: string, properties?: Record<string, any>) => {
  telemetryService.track(name, properties);
};

export const trackUserAction = (action: UserAction) => {
  telemetryService.trackUserAction(action);
};

export const trackError = (error: Error, context?: string) => {
  telemetryService.trackError({
    error,
    context,
    timestamp: new Date(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    url: typeof window !== 'undefined' ? window.location.href : undefined,
  });
};

export const trackPageView = (page: string, title?: string) => {
  telemetryService.trackPageView(page, title);
};