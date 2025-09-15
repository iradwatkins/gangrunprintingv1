import * as Sentry from '@sentry/nextjs';
import { User } from '@prisma/client';

// Initialize Sentry
export function initSentry() {
  if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 0.1, // Performance monitoring sample rate
      profilesSampleRate: 0.1, // Profiling sample rate
      debug: process.env.NODE_ENV === 'development',

      // Release tracking
      release: process.env.NEXT_PUBLIC_APP_VERSION || 'unknown',

      // Enhanced error context
      beforeSend: (event, hint) => {
        // Filter out known non-critical errors
        if (event.exception) {
          const error = hint.originalException;
          if (error instanceof Error) {
            // Filter hydration errors and other non-critical issues
            if (error.message.includes('Hydration') ||
                error.message.includes('ResizeObserver')) {
              return null;
            }
          }
        }
        return event;
      },

      // Transaction filtering
      beforeTransaction: (transaction) => {
        // Don't track health checks and other routine operations
        if (transaction.name?.includes('/api/health') ||
            transaction.name?.includes('/_next/')) {
          return null;
        }
        return transaction;
      },

      // Enhanced integration
      integrations: [
        new Sentry.BrowserTracing({
          // Capture interactions
          tracePropagationTargets: [
            'localhost',
            /^https:\/\/gangrunprinting\.com/,
            /^https:\/\/.*\.gangrunprinting\.com/,
          ],
        }),
        new Sentry.Replay({
          // Capture 10% of sessions for replay
          sessionSampleRate: 0.1,
          // Capture 100% of sessions with errors for replay
          errorSampleRate: 1.0,
        }),
      ],

      // Privacy settings
      sendDefaultPii: false,

      // Performance monitoring
      enableTracing: true,

      // Custom tags
      initialScope: {
        tags: {
          platform: 'nextjs',
          service: 'gangrun-printing',
        },
      },
    });
  }
}

// User context management
export function setUserContext(user: Partial<User>) {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.firstName + ' ' + user.lastName,
  });
}

export function clearUserContext() {
  Sentry.setUser(null);
}

// Custom error reporting
export function reportError(error: Error, context?: Record<string, any>) {
  Sentry.withScope((scope) => {
    if (context) {
      Object.keys(context).forEach(key => {
        scope.setContext(key, context[key]);
      });
    }
    Sentry.captureException(error);
  });
}

// Business logic error tracking
export function reportBusinessError(
  message: string,
  level: 'error' | 'warning' | 'info' = 'error',
  extra?: Record<string, any>
) {
  Sentry.withScope((scope) => {
    scope.setLevel(level);
    if (extra) {
      Object.keys(extra).forEach(key => {
        scope.setExtra(key, extra[key]);
      });
    }
    Sentry.captureMessage(message);
  });
}

// E-commerce specific error tracking
export function reportPaymentError(
  error: Error,
  paymentData: {
    orderId?: string;
    amount?: number;
    paymentMethod?: string;
  }
) {
  Sentry.withScope((scope) => {
    scope.setTag('errorType', 'payment');
    scope.setContext('payment', paymentData);
    Sentry.captureException(error);
  });
}

export function reportOrderError(
  error: Error,
  orderData: {
    orderId?: string;
    userId?: string;
    status?: string;
  }
) {
  Sentry.withScope((scope) => {
    scope.setTag('errorType', 'order');
    scope.setContext('order', orderData);
    Sentry.captureException(error);
  });
}

// Performance monitoring helpers
export function startTransaction(name: string, op: string = 'custom') {
  return Sentry.startTransaction({ name, op });
}

export function addBreadcrumb(message: string, category?: string, data?: any) {
  Sentry.addBreadcrumb({
    message,
    category: category || 'custom',
    data,
    level: 'info',
    timestamp: Date.now() / 1000,
  });
}

// Database operation tracking
export function trackDatabaseOperation(operation: string, table: string) {
  const transaction = Sentry.getCurrentHub().getScope()?.getTransaction();
  if (transaction) {
    const span = transaction.startChild({
      op: 'db.query',
      description: `${operation} ${table}`,
    });
    return span;
  }
  return null;
}

// API route helpers
export function trackApiRoute(method: string, route: string) {
  const transaction = Sentry.startTransaction({
    name: `${method} ${route}`,
    op: 'http.server',
  });

  return {
    transaction,
    finish: (status?: number) => {
      if (status) {
        transaction.setTag('http.status_code', status);
      }
      transaction.finish();
    }
  };
}

// Custom metrics
export function recordMetric(
  name: string,
  value: number,
  unit: 'millisecond' | 'count' | 'byte' = 'count',
  tags?: Record<string, string>
) {
  Sentry.metrics.increment(name, value, { unit, tags });
}

// E-commerce metrics
export function recordOrderMetrics(orderData: {
  totalValue: number;
  itemCount: number;
  paymentMethod: string;
}) {
  recordMetric('order.created', 1, 'count', {
    payment_method: orderData.paymentMethod
  });
  recordMetric('order.value', orderData.totalValue, 'count');
  recordMetric('order.items', orderData.itemCount, 'count');
}

export function recordPerformanceMetric(name: string, duration: number) {
  recordMetric(`performance.${name}`, duration, 'millisecond');
}