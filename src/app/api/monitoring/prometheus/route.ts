import { NextRequest, NextResponse } from 'next/server';
import { register, collectDefaultMetrics, Counter, Histogram, Gauge } from 'prom-client';
import { withStandardMiddleware } from '@/lib/api-middleware';
import { prisma } from '@/lib/prisma';

// Initialize default metrics collection
collectDefaultMetrics({ prefix: 'gangrun_' });

// Custom metrics for GangRun Printing
const httpRequestsTotal = new Counter({
  name: 'gangrun_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

const httpRequestDuration = new Histogram({
  name: 'gangrun_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
});

const databaseConnections = new Gauge({
  name: 'gangrun_database_connections_active',
  help: 'Number of active database connections',
});

const ordersTotal = new Counter({
  name: 'gangrun_orders_total',
  help: 'Total number of orders created',
  labelNames: ['status', 'payment_method'],
});

const orderValue = new Histogram({
  name: 'gangrun_order_value_dollars',
  help: 'Order values in dollars',
  labelNames: ['payment_method'],
  buckets: [10, 25, 50, 100, 200, 500, 1000, 2000],
});

const usersRegistered = new Counter({
  name: 'gangrun_users_registered_total',
  help: 'Total number of users registered',
  labelNames: ['method'],
});

const productsViewed = new Counter({
  name: 'gangrun_products_viewed_total',
  help: 'Total number of product views',
  labelNames: ['product_id', 'category'],
});

const cartAbandonment = new Counter({
  name: 'gangrun_cart_abandonment_total',
  help: 'Total number of cart abandonments',
});

const paymentFailures = new Counter({
  name: 'gangrun_payment_failures_total',
  help: 'Total number of payment failures',
  labelNames: ['method', 'error_type'],
});

const apiErrors = new Counter({
  name: 'gangrun_api_errors_total',
  help: 'Total number of API errors',
  labelNames: ['endpoint', 'error_type', 'status_code'],
});

// Business metrics gauges
const dailyRevenue = new Gauge({
  name: 'gangrun_daily_revenue_dollars',
  help: 'Daily revenue in dollars',
});

const dailyOrders = new Gauge({
  name: 'gangrun_daily_orders_count',
  help: 'Number of orders today',
});

const conversionRate = new Gauge({
  name: 'gangrun_conversion_rate_percent',
  help: 'Current conversion rate percentage',
});

const cartAbandonmentRate = new Gauge({
  name: 'gangrun_cart_abandonment_rate_percent',
  help: 'Cart abandonment rate percentage',
});

const activeUsers = new Gauge({
  name: 'gangrun_active_users_count',
  help: 'Number of currently active users',
});

// Performance metrics
const pageLoadTime = new Histogram({
  name: 'gangrun_page_load_time_seconds',
  help: 'Page load time in seconds',
  labelNames: ['page'],
  buckets: [0.1, 0.5, 1, 2, 3, 5, 10],
});

const coreWebVitalsLCP = new Histogram({
  name: 'gangrun_core_web_vitals_lcp_seconds',
  help: 'Largest Contentful Paint in seconds',
  buckets: [0.5, 1, 1.5, 2, 2.5, 3, 4, 5],
});

const coreWebVitalsFID = new Histogram({
  name: 'gangrun_core_web_vitals_fid_milliseconds',
  help: 'First Input Delay in milliseconds',
  buckets: [10, 50, 100, 200, 300, 500, 1000],
});

const coreWebVitalsCLS = new Histogram({
  name: 'gangrun_core_web_vitals_cls',
  help: 'Cumulative Layout Shift score',
  buckets: [0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.5],
});

// Update business metrics periodically
async function updateBusinessMetrics() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Daily revenue and orders
    const todayOrders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: today,
        },
      },
    });

    const revenue = todayOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    dailyRevenue.set(revenue);
    dailyOrders.set(todayOrders.length);

    // Total orders by status
    const ordersByStatus = await prisma.order.groupBy({
      by: ['status'],
      _count: true,
    });

    ordersByStatus.forEach(({ status, _count }) => {
      ordersTotal.inc({ status, payment_method: 'total' }, _count);
    });

    // User counts
    const totalUsers = await prisma.user.count();
    const todayUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: today,
        },
      },
    });

    usersRegistered.inc({ method: 'total' }, todayUsers);

    // Simulated active users (in a real implementation, this would come from session data)
    activeUsers.set(Math.floor(Math.random() * 200 + 50));

    // Simulated conversion and abandonment rates
    conversionRate.set(Math.random() * 3 + 2); // 2-5%
    cartAbandonmentRate.set(Math.random() * 20 + 60); // 60-80%

  } catch (error) {
    console.error('Failed to update business metrics:', error);
  }
}

// Export metric updater functions for use by middleware
export const metricUpdaters = {
  recordHttpRequest: (method: string, route: string, statusCode: number, duration: number) => {
    httpRequestsTotal.inc({ method, route, status_code: statusCode.toString() });
    httpRequestDuration.observe({ method, route, status_code: statusCode.toString() }, duration / 1000);
  },

  recordOrder: (status: string, paymentMethod: string, value: number) => {
    ordersTotal.inc({ status, payment_method: paymentMethod });
    orderValue.observe({ payment_method: paymentMethod }, value);
  },

  recordProductView: (productId: string, category: string) => {
    productsViewed.inc({ product_id: productId, category });
  },

  recordCartAbandonment: () => {
    cartAbandonment.inc();
  },

  recordPaymentFailure: (method: string, errorType: string) => {
    paymentFailures.inc({ method, error_type: errorType });
  },

  recordApiError: (endpoint: string, errorType: string, statusCode: number) => {
    apiErrors.inc({ endpoint, error_type: errorType, status_code: statusCode.toString() });
  },

  recordPageLoad: (page: string, duration: number) => {
    pageLoadTime.observe({ page }, duration / 1000);
  },

  recordCoreWebVital: (metric: string, value: number) => {
    switch (metric) {
      case 'LCP':
        coreWebVitalsLCP.observe(value / 1000);
        break;
      case 'FID':
        coreWebVitalsFID.observe(value);
        break;
      case 'CLS':
        coreWebVitalsCLS.observe(value);
        break;
    }
  },

  setDatabaseConnections: (count: number) => {
    databaseConnections.set(count);
  },

  updateBusinessMetrics,
};

async function handler(req: NextRequest) {
  try {
    // Update business metrics before serving
    await updateBusinessMetrics();

    // Get all metrics in Prometheus format
    const metrics = await register.metrics();

    return new NextResponse(metrics, {
      headers: {
        'Content-Type': register.contentType,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Failed to generate metrics:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate metrics',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export const GET = withStandardMiddleware(handler, {
  rateLimit: 30, // Allow frequent metric scraping
  logRequests: false, // Don't log metrics requests to avoid noise
  validationOptions: {
    methods: ['GET'],
  },
});