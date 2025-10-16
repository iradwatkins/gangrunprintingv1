/**
 * Client-Side Monitoring System
 * Tracks user actions, errors, and performance metrics
 */

interface LogEntry {
  timestamp: string
  type: 'error' | 'warning' | 'info' | 'action' | 'network'
  level: 'critical' | 'high' | 'medium' | 'low'
  category: string
  message: string
  details?: any
  url: string
  userAgent: string
  sessionId: string
  userId?: string
  stack?: string
  source?: string
}

class ClientMonitor {
  private logs: LogEntry[] = []
  private sessionId: string
  private userId?: string
  private batchTimer?: NodeJS.Timeout
  private readonly MAX_LOGS = 100
  private readonly BATCH_INTERVAL = 5000 // 5 seconds
  private readonly API_ENDPOINT = '/api/monitoring/logs'

  constructor() {
    this.sessionId = this.generateSessionId()
    this.initializeErrorHandlers()
    this.initializeNetworkInterceptor()
    this.startBatchTimer()
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  }

  public setUserId(userId: string) {
    this.userId = userId
  }

  private initializeErrorHandlers() {
    // Global error handler
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        this.logError({
          category: 'javascript',
          message: event.message,
          details: {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
          },
          stack: event.error?.stack,
          source: 'window.onerror',
        })
      })

      // Unhandled promise rejections
      window.addEventListener('unhandledrejection', (event) => {
        this.logError({
          category: 'promise',
          message: `Unhandled Promise Rejection: ${event.reason}`,
          details: event.reason,
          stack: event.reason?.stack,
          source: 'unhandledrejection',
        })
      })

      // Console error override
      const originalConsoleError = console.error
      console.error = (...args) => {
        this.logError({
          category: 'console',
          message: args.join(' '),
          details: args,
          source: 'console.error',
        })
        originalConsoleError.apply(console, args)
      }

      // CSP violations
      document.addEventListener('securitypolicyviolation', (event) => {
        this.logWarning({
          category: 'csp',
          message: `CSP Violation: ${event.violatedDirective}`,
          details: {
            blockedURI: event.blockedURI,
            violatedDirective: event.violatedDirective,
            originalPolicy: event.originalPolicy,
            disposition: event.disposition,
            documentURI: event.documentURI,
            referrer: event.referrer,
            statusCode: event.statusCode,
            sourceFile: event.sourceFile,
            lineNumber: event.lineNumber,
            columnNumber: event.columnNumber,
          },
          source: 'CSP',
        })
      })
    }
  }

  private initializeNetworkInterceptor() {
    if (typeof window !== 'undefined') {
      // Intercept fetch
      const originalFetch = window.fetch
      window.fetch = async (...args) => {
        const start = Date.now()
        const [resource, config] = args
        const url = typeof resource === 'string' ? resource : resource.url

        try {
          const response = await originalFetch.apply(window, args)
          const duration = Date.now() - start

          // Log errors
          if (!response.ok) {
            this.logNetwork({
              category: 'fetch',
              message: `HTTP ${response.status}: ${url}`,
              details: {
                status: response.status,
                statusText: response.statusText,
                url,
                method: config?.method || 'GET',
                duration,
                headers: Object.fromEntries(response.headers.entries()),
              },
            })
          }

          // Log slow requests
          if (duration > 3000) {
            this.logWarning({
              category: 'performance',
              message: `Slow request: ${url} took ${duration}ms`,
              details: { url, duration, method: config?.method || 'GET' },
            })
          }

          return response
        } catch (error) {
          const duration = Date.now() - start
          this.logError({
            category: 'fetch',
            message: `Network error: ${url}`,
            details: { url, error: error?.toString(), duration },
            source: 'fetch',
          })
          throw error
        }
      }

      // Intercept XMLHttpRequest
      const originalXHROpen = XMLHttpRequest.prototype.open
      const originalXHRSend = XMLHttpRequest.prototype.send

      XMLHttpRequest.prototype.open = function (method, url, ...args) {
        this._monitorData = { method, url, startTime: 0 }
        return originalXHROpen.apply(this, [method, url, ...args])
      }

      XMLHttpRequest.prototype.send = function (...args) {
        if (this._monitorData) {
          this._monitorData.startTime = Date.now()

          this.addEventListener('load', () => {
            const duration = Date.now() - this._monitorData.startTime
            if (this.status >= 400) {
              ClientMonitor.getInstance().logNetwork({
                category: 'xhr',
                message: `HTTP ${this.status}: ${this._monitorData.url}`,
                details: {
                  status: this.status,
                  statusText: this.statusText,
                  url: this._monitorData.url,
                  method: this._monitorData.method,
                  duration,
                },
              })
            }
          })

          this.addEventListener('error', () => {
            const duration = Date.now() - this._monitorData.startTime
            ClientMonitor.getInstance().logError({
              category: 'xhr',
              message: `Network error: ${this._monitorData.url}`,
              details: {
                url: this._monitorData.url,
                method: this._monitorData.method,
                duration,
              },
              source: 'xhr',
            })
          })
        }

        return originalXHRSend.apply(this, args)
      }
    }
  }

  private createLogEntry(
    type: LogEntry['type'],
    level: LogEntry['level'],
    data: Partial<LogEntry>
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      type,
      level,
      category: data.category || 'general',
      message: data.message || '',
      details: data.details,
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      sessionId: this.sessionId,
      userId: this.userId,
      stack: data.stack,
      source: data.source,
    }
  }

  public logError(data: Partial<LogEntry>) {
    const entry = this.createLogEntry('error', 'high', data)
    this.addLog(entry)

    // Send critical errors immediately
    if (data.category === 'authentication' || data.category === 'payment') {
      this.sendLogs([entry])
    }
  }

  public logWarning(data: Partial<LogEntry>) {
    const entry = this.createLogEntry('warning', 'medium', data)
    this.addLog(entry)
  }

  public logInfo(data: Partial<LogEntry>) {
    const entry = this.createLogEntry('info', 'low', data)
    this.addLog(entry)
  }

  public logAction(data: Partial<LogEntry>) {
    const entry = this.createLogEntry('action', 'low', data)
    this.addLog(entry)
  }

  public logNetwork(data: Partial<LogEntry>) {
    const entry = this.createLogEntry('network', 'medium', data)
    this.addLog(entry)
  }

  private addLog(entry: LogEntry) {
    this.logs.push(entry)

    // Keep only the latest logs
    if (this.logs.length > this.MAX_LOGS) {
      this.logs = this.logs.slice(-this.MAX_LOGS)
    }
  }

  private startBatchTimer() {
    this.batchTimer = setInterval(() => {
      if (this.logs.length > 0) {
        this.sendLogs(this.logs)
        this.logs = []
      }
    }, this.BATCH_INTERVAL)
  }

  private async sendLogs(logs: LogEntry[]) {
    try {
      await fetch(this.API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ logs }),
      })
    } catch (error) {
      // Silently fail to avoid infinite loop
      console.warn('Failed to send logs to server:', error)
    }
  }

  public destroy() {
    if (this.batchTimer) {
      clearInterval(this.batchTimer)
    }
    // Send remaining logs
    if (this.logs.length > 0) {
      this.sendLogs(this.logs)
    }
  }

  // Singleton pattern
  private static instance: ClientMonitor

  public static getInstance(): ClientMonitor {
    if (!ClientMonitor.instance) {
      ClientMonitor.instance = new ClientMonitor()
    }
    return ClientMonitor.instance
  }

  // Public API for manual logging
  public static log(category: string, message: string, details?: any) {
    ClientMonitor.getInstance().logInfo({ category, message, details })
  }

  public static error(category: string, message: string, details?: any) {
    ClientMonitor.getInstance().logError({ category, message, details })
  }

  public static warning(category: string, message: string, details?: any) {
    ClientMonitor.getInstance().logWarning({ category, message, details })
  }

  public static action(action: string, details?: any) {
    ClientMonitor.getInstance().logAction({
      category: 'user-action',
      message: action,
      details,
    })
  }
}

export default ClientMonitor

// Export for use in components
export const monitor = {
  log: ClientMonitor.log,
  error: ClientMonitor.error,
  warning: ClientMonitor.warning,
  action: ClientMonitor.action,
  setUserId: (userId: string) => ClientMonitor.getInstance().setUserId(userId),
}