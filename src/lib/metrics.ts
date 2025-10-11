import { Registry, Counter, Histogram, Gauge, Summary, collectDefaultMetrics } from 'prom-client'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger-safe'

// CRITICAL: Production metrics for monitoring

// Create a Registry
export const register = new Registry()

// Register default metrics (CPU, memory, etc.)
collectDefaultMetrics({
  register,
  prefix: 'gangrun_',
  gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5],
})

// ========================================
// BUSINESS METRICS
// ========================================

// Order metrics
export const ordersTotal = new Counter({
  name: 'gangrun_orders_total',
  help: 'Total number of orders created',
  labelNames: ['status', 'payment_method', 'product_type'],
  registers: [register],
})

export const orderValue = new Histogram({
  name: 'gangrun_order_value_dollars',
  help: 'Order value in dollars',
  labelNames: ['product_type', 'customer_type'],
  buckets: [10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000],
  registers: [register],
})

export const activeOrders = new Gauge({
  name: 'gangrun_active_orders',
  help: 'Number of currently active orders',
  labelNames: ['status'],
  registers: [register],
})

// Revenue metrics
export const revenueTotal = new Counter({
  name: 'gangrun_revenue_total_cents',
  help: 'Total revenue in cents',
  labelNames: ['product_type', 'payment_method'],
  registers: [register],
})

// Customer metrics
export const customersTotal = new Counter({
  name: 'gangrun_customers_total',
  help: 'Total number of customers',
  labelNames: ['type', 'source'],
  registers: [register],
})

export const activeSessions = new Gauge({
  name: 'gangrun_active_sessions',
  help: 'Number of active user sessions',
  registers: [register],
})

// Product metrics
export const productViews = new Counter({
  name: 'gangrun_product_views_total',
  help: 'Total product page views',
  labelNames: ['product_id', 'product_name'],
  registers: [register],
})

export const cartAbandonment = new Counter({
  name: 'gangrun_cart_abandonment_total',
  help: 'Number of abandoned carts',
  registers: [register],
})

// ========================================
// TECHNICAL METRICS
// ========================================

// HTTP metrics
export const httpRequestDuration = new Histogram({
  name: 'gangrun_http_request_duration_ms',
  help: 'Duration of HTTP requests in milliseconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000],
  registers: [register],
})

export const httpRequestTotal = new Counter({
  name: 'gangrun_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
})

// Database metrics
export const dbQueryDuration = new Histogram({
  name: 'gangrun_db_query_duration_ms',
  help: 'Database query duration in milliseconds',
  labelNames: ['operation', 'table'],
  buckets: [1, 5, 10, 25, 50, 100, 250, 500, 1000, 2500],
  registers: [register],
})

export const dbConnectionPool = new Gauge({
  name: 'gangrun_db_connection_pool',
  help: 'Database connection pool status',
  labelNames: ['state'],
  registers: [register],
})

// Cache metrics
export const cacheHits = new Counter({
  name: 'gangrun_cache_hits_total',
  help: 'Number of cache hits',
  labelNames: ['cache_type'],
  registers: [register],
})

export const cacheMisses = new Counter({
  name: 'gangrun_cache_misses_total',
  help: 'Number of cache misses',
  labelNames: ['cache_type'],
  registers: [register],
})

// Error metrics
export const errorTotal = new Counter({
  name: 'gangrun_errors_total',
  help: 'Total number of errors',
  labelNames: ['type', 'severity', 'component'],
  registers: [register],
})

// Authentication metrics
export const authAttempts = new Counter({
  name: 'gangrun_auth_attempts_total',
  help: 'Authentication attempts',
  labelNames: ['method', 'success'],
  registers: [register],
})

// File upload metrics
export const fileUploads = new Counter({
  name: 'gangrun_file_uploads_total',
  help: 'Total file uploads',
  labelNames: ['type', 'success'],
  registers: [register],
})

export const uploadSize = new Histogram({
  name: 'gangrun_upload_size_bytes',
  help: 'File upload size in bytes',
  labelNames: ['type'],
  buckets: [1000, 10000, 100000, 1000000, 10000000, 100000000],
  registers: [register],
})

// API metrics
export const apiCallDuration = new Summary({
  name: 'gangrun_api_call_duration_ms',
  help: 'External API call duration',
  labelNames: ['api', 'endpoint', 'method'],
  percentiles: [0.5, 0.9, 0.95, 0.99],
  registers: [register],
})

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Record an HTTP request
 */
export function recordHttpRequest(
  method: string,
  route: string,
  statusCode: number,
  duration: number
): void {
  httpRequestTotal.inc({ method, route, status_code: statusCode.toString() })
  httpRequestDuration.observe({ method, route, status_code: statusCode.toString() }, duration)

  // Track errors
  if (statusCode >= 400) {
    errorTotal.inc({
      type: statusCode >= 500 ? 'server_error' : 'client_error',
      severity: statusCode >= 500 ? 'error' : 'warning',
      component: 'http',
    })
  }
}

/**
 * Record a database query
 */
export function recordDbQuery(operation: string, table: string, duration: number): void {
  dbQueryDuration.observe({ operation, table }, duration)
}

/**
 * Record an order
 */
export function recordOrder(
  status: string,
  paymentMethod: string,
  productType: string,
  value: number
): void {
  ordersTotal.inc({ status, payment_method: paymentMethod, product_type: productType })
  orderValue.observe({ product_type: productType, customer_type: 'standard' }, value)
  revenueTotal.inc(
    { product_type: productType, payment_method: paymentMethod },
    Math.round(value * 100)
  )
}

/**
 * Record cache access
 */
export function recordCacheAccess(cacheType: string, hit: boolean): void {
  if (hit) {
    cacheHits.inc({ cache_type: cacheType })
  } else {
    cacheMisses.inc({ cache_type: cacheType })
  }
}

/**
 * Update active metrics
 */
export async function updateActiveMetrics(): Promise<void> {
  try {
    // Update active sessions
    const sessionCount = await prisma.session.count({
      where: {
        expiresAt: {
          gte: new Date(),
        },
      },
    })
    activeSessions.set(sessionCount)

    // Update active orders
    const orderCounts = await prisma.order.groupBy({
      by: ['status'],
      _count: true,
    })

    orderCounts.forEach(({ status, _count }) => {
      activeOrders.set({ status }, _count)
    })

    // Update database connection pool
    // This is a placeholder - actual implementation depends on your DB client
    dbConnectionPool.set({ state: 'active' }, 10)
    dbConnectionPool.set({ state: 'idle' }, 5)
    dbConnectionPool.set({ state: 'waiting' }, 0)
  } catch (error) {
    logger.error('Failed to update active metrics:', error)
  }
}

/**
 * Start metrics collection interval
 */
let metricsInterval: NodeJS.Timeout | null = null

export function startMetricsCollection(): void {
  // Update active metrics every 30 seconds
  if (!metricsInterval) {
    metricsInterval = setInterval(() => {
      updateActiveMetrics().catch(console.error)
    }, 30000)

    // Initial update
    updateActiveMetrics().catch(console.error)
  }
}

/**
 * Stop metrics collection
 */
export function stopMetricsCollection(): void {
  if (metricsInterval) {
    clearInterval(metricsInterval)
    metricsInterval = null
  }
}

/**
 * Get all metrics
 */
export async function getMetrics(): Promise<string> {
  return register.metrics()
}

/**
 * Get metrics content type
 */
export function getMetricsContentType(): string {
  return register.contentType
}
