// Enterprise Sentry Configuration - Phase 3 Enhancement
import * as Sentry from '@sentry/nextjs'
import { logger } from './logger-safe'

// Check if Sentry is enabled
const SENTRY_ENABLED = process.env.NEXT_PUBLIC_SENTRY_DSN !== undefined

export function initSentry() {
  if (!SENTRY_ENABLED) {
    logger.info('Sentry disabled - no DSN configured')
    return
  }

  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

    // Performance Monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // Release Health (autoSessionTracking removed - not in current Sentry types)

    // Environment configuration
    environment: process.env.NODE_ENV || 'development',
    release: process.env.npm_package_version,

    // Debug mode for development
    debug: process.env.NODE_ENV === 'development',

    // Enable structured logging (experimental feature)
    _experiments: {
      enableLogs: true,
    },

    // Integrations - Console logging
    integrations: [Sentry.consoleLoggingIntegration({ levels: ['log', 'warn', 'error'] })],

    // Error filtering
    beforeSend(event, hint) {
      // Filter out known non-critical errors
      if (event.exception) {
        const error = hint.originalException
        if (error && typeof error === 'object' && 'message' in error) {
          const message = error.message as string

          // Skip common non-critical errors
          if (
            message.includes('ResizeObserver loop limit exceeded') ||
            message.includes('Non-Error promise rejection captured') ||
            message.includes('hydration') ||
            message.includes('ChunkLoadError')
          ) {
            return null
          }
        }
      }

      return event
    },

    // Configure tags
    initialScope: {
      tags: {
        component: 'gangrun-printing',
        version: '3.0.0-enterprise',
      },
    },
  })

  logger.info('Sentry initialized successfully')
}

export function reportError(error: Error, context?: Record<string, unknown>) {
  if (SENTRY_ENABLED) {
    Sentry.withScope((scope) => {
      if (context) {
        scope.setContext('additional', context)
      }
      Sentry.captureException(error)
    })
  }
  logger.error('Error reported:', { error: error.message, stack: error.stack, context })
}

export function reportBusinessError(
  message: string,
  level: 'info' | 'warning' | 'error' = 'error',
  context?: Record<string, unknown>
) {
  if (SENTRY_ENABLED) {
    Sentry.withScope((scope) => {
      scope.setLevel(level)
      if (context) {
        scope.setContext('business', context)
      }
      Sentry.captureMessage(message)
    })
  }
  logger.log(level, `Business error: ${message}`, context)
}

export function addBreadcrumb(message: string, category?: string, data?: Record<string, unknown>) {
  if (SENTRY_ENABLED) {
    Sentry.addBreadcrumb({
      message,
      category: category || 'default',
      data,
      timestamp: Date.now() / 1000,
    })
  }
  logger.debug('Breadcrumb added:', { message, category, data })
}

export function trackApiRoute(route: string, method: string, context?: Record<string, unknown>) {
  if (SENTRY_ENABLED) {
    Sentry.addBreadcrumb({
      message: `API ${method} ${route}`,
      category: 'api',
      data: context,
      timestamp: Date.now() / 1000,
    })
  }
  logger.http('API route tracked:', { method, route, context })
}

export function setUser(user: { id: string; email?: string; role?: string } | null) {
  if (SENTRY_ENABLED) {
    Sentry.setUser(
      user
        ? {
            id: user.id,
            email: user.email,
            role: user.role,
          }
        : null
    )
  }
  logger.debug('User context set:', { userId: user?.id, email: user?.email })
}

export function captureException(error: Error, context?: Record<string, unknown>) {
  if (SENTRY_ENABLED) {
    Sentry.withScope((scope) => {
      if (context) {
        scope.setContext('exception', context)
      }
      Sentry.captureException(error)
    })
  }
  logger.error('Exception captured:', { error: error.message, stack: error.stack, context })
}

export function captureMessage(
  message: string,
  level: 'debug' | 'info' | 'warning' | 'error' = 'info'
) {
  if (SENTRY_ENABLED) {
    Sentry.captureMessage(message, level)
  }
  logger.log(level, `Message captured: ${message}`)
}

export function recordMetric(name: string, value: number, tags?: Record<string, string>) {
  if (SENTRY_ENABLED) {
    // Metrics API not available in this Sentry version
    // Use custom event instead
    Sentry.captureMessage(`Metric: ${name}`, {
      level: 'info',
      tags: { ...tags, metric_name: name, metric_value: value.toString() },
    })
  }
  logger.info('Metric recorded:', { name, value, tags })
}

// New enterprise features
export function startTransaction(name: string, op: string) {
  if (SENTRY_ENABLED) {
    // startTransaction deprecated in newer Sentry versions
    // Using span instead
    Sentry.startSpan({ name, op }, () => {})
    return null
  }
  return null
}

export function recordPerformance(transactionName: string, duration: number, success: boolean) {
  if (SENTRY_ENABLED) {
    recordMetric(`transaction.${transactionName}.duration`, duration, {
      success: success.toString(),
    })
  }
  logger.info('Performance recorded:', { transactionName, duration, success })
}
