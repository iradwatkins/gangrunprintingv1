import { v4 as uuidv4 } from 'uuid'
import { reportError, addBreadcrumb } from '@/lib/sentry'

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal'
export type LogContext =
  | 'api'
  | 'auth'
  | 'business'
  | 'system'
  | 'user'
  | 'payment'
  | 'order'
  | 'product'

export interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context: LogContext
  correlationId: string
  userId?: string
  sessionId?: string
  ip?: string
  userAgent?: string
  metadata?: Record<string, any>
  error?: {
    name: string
    message: string
    stack?: string
  }
  performance?: {
    duration: number
    memory?: number
  }
  business?: {
    orderId?: string
    productId?: string
    amount?: number
    currency?: string
  }
}

class StructuredLogger {
  private static instance: StructuredLogger
  private correlationId: string
  private userId?: string
  private sessionId?: string
  private context: Record<string, any> = {}

  private constructor() {
    this.correlationId = uuidv4()
  }

  static getInstance(): StructuredLogger {
    if (!StructuredLogger.instance) {
      StructuredLogger.instance = new StructuredLogger()
    }
    return StructuredLogger.instance
  }

  // Set correlation ID for distributed tracing
  setCorrelationId(correlationId: string): void {
    this.correlationId = correlationId
  }

  // Set user context
  setUserContext(userId: string, sessionId?: string): void {
    this.userId = userId
    this.sessionId = sessionId
  }

  // Set additional context
  setContext(key: string, value: Record<string, unknown>): void {
    this.context[key] = value
  }

  // Clear context
  clearContext(): void {
    this.context = {}
    this.userId = undefined
    this.sessionId = undefined
  }

  // Create log entry
  private createLogEntry(
    level: LogLevel,
    message: string,
    context: LogContext,
    metadata?: Record<string, any>,
    error?: Error,
    performance?: { duration: number; memory?: number },
    business?: { orderId?: string; productId?: string; amount?: number; currency?: string }
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      correlationId: this.correlationId,
      userId: this.userId,
      sessionId: this.sessionId,
      metadata: {
        ...this.context,
        ...metadata,
      },
    }

    // Add request context if available (browser)
    if (typeof window !== 'undefined') {
      entry.userAgent = navigator.userAgent
    }

    // Add error details
    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      }
    }

    // Add performance data
    if (performance) {
      entry.performance = performance
    }

    // Add business data
    if (business) {
      entry.business = business
    }

    return entry
  }

  // Log at different levels
  debug(message: string, context: LogContext = 'system', metadata?: Record<string, any>): void {
    const entry = this.createLogEntry('debug', message, context, metadata)
    this.outputLog(entry)
  }

  info(message: string, context: LogContext = 'system', metadata?: Record<string, any>): void {
    const entry = this.createLogEntry('info', message, context, metadata)
    this.outputLog(entry)
    this.sendToMonitoring(entry)
  }

  warn(message: string, context: LogContext = 'system', metadata?: Record<string, any>): void {
    const entry = this.createLogEntry('warn', message, context, metadata)
    this.outputLog(entry)
    this.sendToMonitoring(entry)
  }

  error(
    message: string,
    context: LogContext = 'system',
    error?: Error,
    metadata?: Record<string, any>
  ): void {
    const entry = this.createLogEntry('error', message, context, metadata, error)
    this.outputLog(entry)
    this.sendToMonitoring(entry)

    // Report to Sentry
    if (error) {
      reportError(error, {
        context,
        correlationId: this.correlationId,
        userId: this.userId,
        sessionId: this.sessionId,
        ...metadata,
      })
    }
  }

  fatal(
    message: string,
    context: LogContext = 'system',
    error?: Error,
    metadata?: Record<string, any>
  ): void {
    const entry = this.createLogEntry('fatal', message, context, metadata, error)
    this.outputLog(entry)
    this.sendToMonitoring(entry)

    // Report to Sentry with high priority
    if (error) {
      reportError(error, {
        context,
        level: 'fatal',
        correlationId: this.correlationId,
        userId: this.userId,
        sessionId: this.sessionId,
        ...metadata,
      })
    }
  }

  // Business-specific logging methods
  logBusinessEvent(
    event: string,
    businessData: { orderId?: string; productId?: string; amount?: number; currency?: string },
    metadata?: Record<string, any>
  ): void {
    const entry = this.createLogEntry(
      'info',
      event,
      'business',
      metadata,
      undefined,
      undefined,
      businessData
    )
    this.outputLog(entry)
    this.sendToMonitoring(entry)
  }

  logPaymentEvent(
    event: string,
    paymentData: {
      orderId: string
      amount: number
      currency: string
      method?: string
      status?: string
    },
    metadata?: Record<string, any>
  ): void {
    const entry = this.createLogEntry(
      'info',
      event,
      'payment',
      { ...metadata, paymentMethod: paymentData.method, status: paymentData.status },
      undefined,
      undefined,
      paymentData
    )
    this.outputLog(entry)
    this.sendToMonitoring(entry)
  }

  logUserAction(action: string, userId: string, metadata?: Record<string, any>): void {
    const entry = this.createLogEntry('info', action, 'user', { ...metadata, actionUserId: userId })
    this.outputLog(entry)
    this.sendToMonitoring(entry)
  }

  logApiCall(
    method: string,
    endpoint: string,
    statusCode: number,
    duration: number,
    metadata?: Record<string, any>
  ): void {
    const level: LogLevel = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info'
    const entry = this.createLogEntry(
      level,
      `${method} ${endpoint}`,
      'api',
      { ...metadata, method, endpoint, statusCode },
      undefined,
      { duration }
    )
    this.outputLog(entry)
    this.sendToMonitoring(entry)
  }

  // Performance logging
  logPerformance(
    operation: string,
    duration: number,
    context: LogContext = 'system',
    metadata?: Record<string, any>
  ): void {
    const entry = this.createLogEntry(
      'info',
      `Performance: ${operation}`,
      context,
      metadata,
      undefined,
      { duration, memory: this.getMemoryUsage() }
    )
    this.outputLog(entry)
    this.sendToMonitoring(entry)
  }

  // Database operation logging
  logDatabaseOperation(
    operation: string,
    table: string,
    duration: number,
    recordsAffected?: number,
    error?: Error
  ): void {
    const level: LogLevel = error ? 'error' : 'debug'
    const entry = this.createLogEntry(
      level,
      `DB ${operation}: ${table}`,
      'system',
      {
        operation,
        table,
        recordsAffected,
      },
      error,
      { duration }
    )
    this.outputLog(entry)

    if (level !== 'debug') {
      this.sendToMonitoring(entry)
    }
  }

  // Authentication logging
  logAuthEvent(
    event: string,
    userId?: string,
    success: boolean = true,
    metadata?: Record<string, any>
  ): void {
    const level: LogLevel = success ? 'info' : 'warn'
    const entry = this.createLogEntry(level, `Auth: ${event}`, 'auth', {
      ...metadata,
      authSuccess: success,
      authUserId: userId,
    })
    this.outputLog(entry)
    this.sendToMonitoring(entry)
  }

  // Security logging
  logSecurityEvent(
    event: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    metadata?: Record<string, any>
  ): void {
    const level: LogLevel =
      severity === 'critical' ? 'fatal' : severity === 'high' ? 'error' : 'warn'
    const entry = this.createLogEntry(level, `Security: ${event}`, 'system', {
      ...metadata,
      securitySeverity: severity,
    })
    this.outputLog(entry)
    this.sendToMonitoring(entry)

    // Also add breadcrumb for security events
    addBreadcrumb(event, 'security', { severity, ...metadata })
  }

  // Output log to console (development) or structured format (production)
  private outputLog(entry: LogEntry): void {
    if (process.env.NODE_ENV === 'development') {
      // Pretty print in development
      const color = this.getLogColor(entry.level)
      console.log(
        `%c[${entry.level.toUpperCase()}] %c${entry.timestamp} %c${entry.context}:%c ${entry.message}`,
        `color: ${color}; font-weight: bold;`,
        'color: #6b7280;',
        'color: #3b82f6; font-weight: bold;',
        'color: inherit;',
        entry.metadata || entry.error || entry.performance || entry.business
      )
    } else {
      // Structured JSON in production
      console.log(JSON.stringify(entry))
    }
  }

  // Send to external monitoring services
  private sendToMonitoring(entry: LogEntry): void {
    // Add breadcrumb to Sentry
    addBreadcrumb(entry.message, entry.context, {
      level: entry.level,
      correlationId: entry.correlationId,
      ...entry.metadata,
    })

    // Send to custom monitoring endpoint (if needed)
    if (typeof window !== 'undefined' && entry.level !== 'debug') {
      // Client-side: Send via beacon API for reliability
      try {
        navigator.sendBeacon('/api/monitoring/logs', JSON.stringify(entry))
      } catch (error) {
        // Fallback to fetch if beacon fails
        fetch('/api/monitoring/logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entry),
        }).catch(() => {
          // Ignore fetch errors to prevent infinite loops
        })
      }
    }
  }

  private getLogColor(level: LogLevel): string {
    switch (level) {
      case 'debug':
        return '#6b7280'
      case 'info':
        return '#3b82f6'
      case 'warn':
        return '#f59e0b'
      case 'error':
        return '#ef4444'
      case 'fatal':
        return '#dc2626'
      default:
        return '#374151'
    }
  }

  private getMemoryUsage(): number | undefined {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      return (performance as any).memory?.usedJSHeapSize
    }
    return undefined
  }
}

// Export singleton instance
export const logger = StructuredLogger.getInstance()

// Convenience functions for common logging patterns
export const logApiRequest = (method: string, endpoint: string, correlationId: string) => {
  logger.setCorrelationId(correlationId)
  logger.info(`API Request: ${method} ${endpoint}`, 'api', { method, endpoint })
}

export const logApiResponse = (
  method: string,
  endpoint: string,
  statusCode: number,
  duration: number
) => {
  logger.logApiCall(method, endpoint, statusCode, duration)
}

export const logBusinessTransaction = (
  type: string,
  orderId: string,
  amount: number,
  currency: string = 'USD',
  metadata?: Record<string, any>
) => {
  logger.logBusinessEvent(type, { orderId, amount, currency }, metadata)
}

export const logUserActivity = (
  activity: string,
  userId: string,
  metadata?: Record<string, any>
) => {
  logger.logUserAction(activity, userId, metadata)
}

export const logSystemError = (message: string, error: Error, metadata?: Record<string, any>) => {
  logger.error(message, 'system', error, metadata)
}

export const logPerformanceMetric = (
  operation: string,
  duration: number,
  metadata?: Record<string, any>
) => {
  logger.logPerformance(operation, duration, 'system', metadata)
}

// Hook for React components to automatically set correlation IDs
export const useLogging = () => {
  const setCorrelationId = (id: string) => logger.setCorrelationId(id)
  const setUserContext = (userId: string, sessionId?: string) =>
    logger.setUserContext(userId, sessionId)
  const clearContext = () => logger.clearContext()

  return {
    logger,
    setCorrelationId,
    setUserContext,
    clearContext,
  }
}
