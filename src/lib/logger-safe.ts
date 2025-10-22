// Edge runtime safe logger

// Simple console-based logger that works in all environments
class SafeLogger {
  debug(message: string, meta?: any) {
    if (process.env.NODE_ENV === 'development') {
        `[DEBUG] ${new Date().toISOString()} ${message}`,
        meta ? JSON.stringify(meta) : ''
      )
    }
  }

  info(message: string, meta?: any) {
  }

  warn(message: string, meta?: any) {
    console.warn(`[WARN] ${new Date().toISOString()} ${message}`, meta ? JSON.stringify(meta) : '')
  }

  error(message: string, meta?: any) {
    console.error(
      `[ERROR] ${new Date().toISOString()} ${message}`,
      meta ? JSON.stringify(meta) : ''
    )
  }

  http(message: string, meta?: any) {
    if (process.env.NODE_ENV === 'development') {
    }
  }

  log(level: string, message: string, meta?: any) {
      `[${level.toUpperCase()}] ${new Date().toISOString()} ${message}`,
      meta ? JSON.stringify(meta) : ''
    )
  }

  child(meta?: any) {
    return this
  }

  end() {
    // No-op
  }
}

const safeLogger = new SafeLogger()

export const logger = safeLogger
export const authLogger = safeLogger
export const apiLogger = safeLogger
export const dbLogger = safeLogger
export const uploadLogger = safeLogger

export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export function logDatabaseQuery(query: string, duration: number, requestId?: string) {
  safeLogger.debug('Database query executed', {
    requestId,
    query: query.substring(0, 100) + (query.length > 100 ? '...' : ''),
    duration: `${duration}ms`,
  })
}

export function logError(error: Error, context?: Record<string, any>) {
  safeLogger.error('Application error occurred', {
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name,
    },
    ...context,
  })
}

export function logBusinessEvent(event: string, data?: Record<string, any>) {
  safeLogger.info(`Business event: ${event}`, data)
}

export function logPerformance(operation: string, duration: number, context?: Record<string, any>) {
  const level = duration > 1000 ? 'warn' : 'info'
  safeLogger.log(level, `Performance: ${operation}`, {
    duration: `${duration}ms`,
    slow: duration > 1000,
    ...context,
  })
}

export function logSecurity(event: string, context?: Record<string, any>) {
  safeLogger.warn(`Security event: ${event}`, context)
}

export default safeLogger
