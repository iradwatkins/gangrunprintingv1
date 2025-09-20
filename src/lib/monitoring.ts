import { reportError, recordMetric, addBreadcrumb } from '@/lib/sentry'

// Core Web Vitals monitoring
export interface WebVitalsMetric {
  name: 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB' | 'INP'
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  delta: number
  id: string
  navigationType: string
}

export function reportWebVitals(metric: WebVitalsMetric) {
  // Record the metric in Sentry
  recordMetric(`web_vitals.${metric.name.toLowerCase()}`, metric.value, 'millisecond', {
    rating: metric.rating,
    navigation_type: metric.navigationType,
  })

  // Add breadcrumb for debugging
  addBreadcrumb(`Web Vital: ${metric.name}`, 'performance', {
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
  })

  // Log to Google Analytics if available
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', metric.name, {
      event_category: 'Web Vitals',
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      non_interaction: true,
    })
  }
}

// Performance monitoring utilities
export class PerformanceMonitor {
  private startTimes: Map<string, number> = new Map()

  start(operation: string): void {
    this.startTimes.set(operation, performance.now())
    addBreadcrumb(`Started: ${operation}`, 'performance')
  }

  end(operation: string, metadata?: Record<string, any>): number {
    const startTime = this.startTimes.get(operation)
    if (!startTime) {
      return 0
    }

    const duration = performance.now() - startTime
    this.startTimes.delete(operation)

    // Record performance metric
    recordMetric(`operation.${operation}`, duration, 'millisecond', metadata)

    addBreadcrumb(`Completed: ${operation}`, 'performance', { duration, ...metadata })

    return duration
  }

  measure(operation: string, fn: () => Promise<any>): Promise<any> {
    this.start(operation)
    return fn().finally(() => {
      this.end(operation)
    })
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor()

// API response time monitoring
export function monitorApiCall(endpoint: string, method: string = 'GET') {
  const startTime = performance.now()

  return {
    success: (status: number, responseSize?: number) => {
      const duration = performance.now() - startTime
      recordMetric('api.response_time', duration, 'millisecond', {
        endpoint,
        method,
        status: status.toString(),
        result: 'success',
      })

      if (responseSize) {
        recordMetric('api.response_size', responseSize, 'byte', {
          endpoint,
          method,
        })
      }
    },
    error: (status: number, error?: Error) => {
      const duration = performance.now() - startTime
      recordMetric('api.response_time', duration, 'millisecond', {
        endpoint,
        method,
        status: status.toString(),
        result: 'error',
      })

      if (error) {
        reportError(error, {
          apiCall: true,
          endpoint,
          method,
          status,
        })
      }
    },
  }
}

// Database query monitoring
export function monitorDatabaseQuery(operation: string, table: string) {
  const startTime = performance.now()

  return {
    success: (recordCount?: number) => {
      const duration = performance.now() - startTime
      recordMetric('db.query_time', duration, 'millisecond', {
        operation,
        table,
        result: 'success',
      })

      if (recordCount !== undefined) {
        recordMetric('db.records_affected', recordCount, 'count', {
          operation,
          table,
        })
      }
    },
    error: (error: Error) => {
      const duration = performance.now() - startTime
      recordMetric('db.query_time', duration, 'millisecond', {
        operation,
        table,
        result: 'error',
      })

      reportError(error, {
        databaseQuery: true,
        operation,
        table,
      })
    },
  }
}

// Business metrics tracking
export class BusinessMetricsTracker {
  // E-commerce specific metrics
  trackProductView(productId: string, productName: string, category?: string) {
    recordMetric('business.product_view', 1, 'count', {
      product_id: productId,
      category,
    })

    addBreadcrumb('Product viewed', 'business', { productId, productName, category })
  }

  trackAddToCart(productId: string, quantity: number, price: number) {
    recordMetric('business.add_to_cart', 1, 'count', {
      product_id: productId,
    })
    recordMetric('business.cart_value_added', price * quantity, 'count')

    addBreadcrumb('Item added to cart', 'business', { productId, quantity, price })
  }

  trackCartAbandonment(cartValue: number, itemCount: number) {
    recordMetric('business.cart_abandonment', 1, 'count')
    recordMetric('business.abandoned_cart_value', cartValue, 'count')

    addBreadcrumb('Cart abandoned', 'business', { cartValue, itemCount })
  }

  trackOrderCreated(orderId: string, orderValue: number, itemCount: number, paymentMethod: string) {
    recordMetric('business.order_created', 1, 'count', {
      payment_method: paymentMethod,
    })
    recordMetric('business.order_value', orderValue, 'count')
    recordMetric('business.order_items', itemCount, 'count')

    addBreadcrumb('Order created', 'business', { orderId, orderValue, itemCount, paymentMethod })
  }

  trackPaymentSuccess(orderId: string, amount: number, method: string) {
    recordMetric('business.payment_success', 1, 'count', {
      payment_method: method,
    })
    recordMetric('business.revenue', amount, 'count')

    addBreadcrumb('Payment successful', 'business', { orderId, amount, method })
  }

  trackPaymentFailure(orderId: string, amount: number, method: string, error: string) {
    recordMetric('business.payment_failure', 1, 'count', {
      payment_method: method,
      error_type: error,
    })

    addBreadcrumb('Payment failed', 'business', { orderId, amount, method, error })
  }

  trackUserRegistration(method: 'email' | 'google') {
    recordMetric('business.user_registration', 1, 'count', {
      method,
    })

    addBreadcrumb('User registered', 'business', { method })
  }

  trackSearchQuery(query: string, resultCount: number) {
    recordMetric('business.search_query', 1, 'count')
    recordMetric('business.search_results', resultCount, 'count')

    addBreadcrumb('Search performed', 'business', { query, resultCount })
  }
}

// Global business metrics tracker instance
export const businessMetrics = new BusinessMetricsTracker()

// User experience monitoring
export function trackUserInteraction(action: string, element?: string, value?: number) {
  recordMetric('ux.interaction', 1, 'count', {
    action,
    element,
  })

  if (value !== undefined) {
    recordMetric(`ux.${action}_value`, value, 'count')
  }

  addBreadcrumb('User interaction', 'ux', { action, element, value })
}

// Error rate monitoring
export function trackErrorRate(component: string, error: Error) {
  recordMetric('error.rate', 1, 'count', {
    component,
    error_type: error.name,
  })

  reportError(error, {
    component,
    errorTracking: true,
  })
}

// Page load monitoring
export function trackPageLoad(page: string, loadTime: number) {
  recordMetric('page.load_time', loadTime, 'millisecond', {
    page,
  })

  addBreadcrumb('Page loaded', 'navigation', { page, loadTime })
}

// Resource monitoring
export function trackResourceLoad(
  type: 'image' | 'script' | 'style' | 'font',
  url: string,
  loadTime: number
) {
  recordMetric('resource.load_time', loadTime, 'millisecond', {
    type,
    url,
  })

  addBreadcrumb('Resource loaded', 'resource', { type, url, loadTime })
}
