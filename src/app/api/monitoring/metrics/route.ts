import { NextRequest, NextResponse } from 'next/server';
import { withStandardMiddleware } from '@/lib/api-middleware';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';

interface SystemMetrics {
  timestamp: string;
  cpu: number;
  memory: number;
  disk: number;
  network: {
    incoming: number;
    outgoing: number;
  };
  uptime: number;
  activeConnections: number;
}

interface BusinessMetrics {
  timestamp: string;
  totalRevenue: number;
  ordersCount: number;
  averageOrderValue: number;
  conversionRate: number;
  cartAbandonmentRate: number;
  topProducts: Array<{
    id: string;
    name: string;
    sales: number;
    revenue: number;
  }>;
  userStats: {
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
  };
}

interface PerformanceMetrics {
  timestamp: string;
  avgResponseTime: number;
  errorRate: number;
  throughput: number;
  coreWebVitals: {
    lcp: number;
    fid: number;
    cls: number;
    fcp: number;
    ttfb: number;
  };
  pageViews: number;
  bounceRate: number;
}

interface ErrorMetrics {
  timestamp: string;
  totalErrors: number;
  errorsByType: Record<string, number>;
  errorsByEndpoint: Record<string, number>;
  criticalErrors: number;
  resolvedErrors: number;
  topErrors: Array<{
    message: string;
    count: number;
    lastOccurred: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }>;
}

async function getSystemMetrics(): Promise<SystemMetrics> {
  // In a real implementation, these would come from system monitoring tools
  // For now, we'll simulate the data
  const cached = await redis.get('metrics:system');
  if (cached) {
    return JSON.parse(cached);
  }

  const metrics: SystemMetrics = {
    timestamp: new Date().toISOString(),
    cpu: Math.random() * 80 + 10, // 10-90%
    memory: Math.random() * 70 + 20, // 20-90%
    disk: Math.random() * 50 + 30, // 30-80%
    network: {
      incoming: Math.random() * 1000 + 100, // KB/s
      outgoing: Math.random() * 500 + 50,
    },
    uptime: 99.8,
    activeConnections: Math.floor(Math.random() * 200 + 50),
  };

  // Cache for 1 minute
  await redis.setex('metrics:system', 60, JSON.stringify(metrics));
  return metrics;
}

async function getBusinessMetrics(): Promise<BusinessMetrics> {
  const cached = await redis.get('metrics:business');
  if (cached) {
    return JSON.parse(cached);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    // Get today's orders
    const todayOrders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: today,
        },
      },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    const totalRevenue = todayOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const averageOrderValue = todayOrders.length > 0 ? totalRevenue / todayOrders.length : 0;

    // Get top products
    const productSales = new Map<string, { id: string; name: string; sales: number; revenue: number }>();

    todayOrders.forEach(order => {
      order.orderItems.forEach(item => {
        const existing = productSales.get(item.productId) || {
          id: item.productId,
          name: item.product.name,
          sales: 0,
          revenue: 0,
        };

        existing.sales += item.quantity;
        existing.revenue += item.price * item.quantity;
        productSales.set(item.productId, existing);
      });
    });

    const topProducts = Array.from(productSales.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Get user statistics
    const totalUsers = await prisma.user.count();
    const newUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: today,
        },
      },
    });

    // Calculate conversion rate (simplified)
    const totalSessions = Math.floor(Math.random() * 1000 + 500); // Simulate sessions
    const conversionRate = todayOrders.length > 0 ? (todayOrders.length / totalSessions) * 100 : 0;

    const metrics: BusinessMetrics = {
      timestamp: new Date().toISOString(),
      totalRevenue,
      ordersCount: todayOrders.length,
      averageOrderValue,
      conversionRate,
      cartAbandonmentRate: Math.random() * 30 + 60, // 60-90% (simulated)
      topProducts,
      userStats: {
        totalUsers,
        activeUsers: Math.floor(Math.random() * 200 + 50), // Simulated
        newUsers,
      },
    };

    // Cache for 5 minutes
    await redis.setex('metrics:business', 300, JSON.stringify(metrics));
    return metrics;
  } catch (error) {
    console.error('Failed to get business metrics:', error);

    // Return fallback metrics
    const fallbackMetrics: BusinessMetrics = {
      timestamp: new Date().toISOString(),
      totalRevenue: 0,
      ordersCount: 0,
      averageOrderValue: 0,
      conversionRate: 0,
      cartAbandonmentRate: 70,
      topProducts: [],
      userStats: {
        totalUsers: 0,
        activeUsers: 0,
        newUsers: 0,
      },
    };

    return fallbackMetrics;
  }
}

async function getPerformanceMetrics(): Promise<PerformanceMetrics> {
  const cached = await redis.get('metrics:performance');
  if (cached) {
    return JSON.parse(cached);
  }

  // Simulate performance metrics
  const metrics: PerformanceMetrics = {
    timestamp: new Date().toISOString(),
    avgResponseTime: Math.random() * 300 + 100, // 100-400ms
    errorRate: Math.random() * 2, // 0-2%
    throughput: Math.random() * 1000 + 500, // req/min
    coreWebVitals: {
      lcp: Math.random() * 2 + 1.5, // 1.5-3.5s
      fid: Math.random() * 100 + 50, // 50-150ms
      cls: Math.random() * 0.2, // 0-0.2
      fcp: Math.random() * 1.5 + 0.5, // 0.5-2s
      ttfb: Math.random() * 500 + 200, // 200-700ms
    },
    pageViews: Math.floor(Math.random() * 5000 + 1000),
    bounceRate: Math.random() * 40 + 30, // 30-70%
  };

  // Cache for 2 minutes
  await redis.setex('metrics:performance', 120, JSON.stringify(metrics));
  return metrics;
}

async function getErrorMetrics(): Promise<ErrorMetrics> {
  const cached = await redis.get('metrics:errors');
  if (cached) {
    return JSON.parse(cached);
  }

  // In a real implementation, this would come from error tracking service
  const errorTypes = ['API Error', 'Database Error', 'Payment Error', 'Validation Error', 'Network Error'];
  const endpoints = ['/api/orders', '/api/products', '/api/auth', '/api/payments', '/api/users'];

  const errorsByType = errorTypes.reduce((acc, type) => {
    acc[type] = Math.floor(Math.random() * 50);
    return acc;
  }, {} as Record<string, number>);

  const errorsByEndpoint = endpoints.reduce((acc, endpoint) => {
    acc[endpoint] = Math.floor(Math.random() * 30);
    return acc;
  }, {} as Record<string, number>);

  const totalErrors = Object.values(errorsByType).reduce((sum, count) => sum + count, 0);

  const topErrors = [
    {
      message: 'Payment gateway timeout',
      count: Math.floor(Math.random() * 20 + 5),
      lastOccurred: new Date(Date.now() - Math.random() * 3600000).toISOString(),
      severity: 'high' as const,
    },
    {
      message: 'Database connection pool exhausted',
      count: Math.floor(Math.random() * 10 + 1),
      lastOccurred: new Date(Date.now() - Math.random() * 7200000).toISOString(),
      severity: 'critical' as const,
    },
    {
      message: 'Validation failed: Invalid email format',
      count: Math.floor(Math.random() * 50 + 10),
      lastOccurred: new Date(Date.now() - Math.random() * 1800000).toISOString(),
      severity: 'medium' as const,
    },
  ];

  const metrics: ErrorMetrics = {
    timestamp: new Date().toISOString(),
    totalErrors,
    errorsByType,
    errorsByEndpoint,
    criticalErrors: Math.floor(totalErrors * 0.05), // 5% critical
    resolvedErrors: Math.floor(totalErrors * 0.8), // 80% resolved
    topErrors,
  };

  // Cache for 3 minutes
  await redis.setex('metrics:errors', 180, JSON.stringify(metrics));
  return metrics;
}

async function handler(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');

  try {
    switch (type) {
      case 'system':
        const systemMetrics = await getSystemMetrics();
        return NextResponse.json({ success: true, data: systemMetrics });

      case 'business':
        const businessMetrics = await getBusinessMetrics();
        return NextResponse.json({ success: true, data: businessMetrics });

      case 'performance':
        const performanceMetrics = await getPerformanceMetrics();
        return NextResponse.json({ success: true, data: performanceMetrics });

      case 'errors':
        const errorMetrics = await getErrorMetrics();
        return NextResponse.json({ success: true, data: errorMetrics });

      case 'all':
      default:
        // Get all metrics
        const [system, business, performance, errors] = await Promise.all([
          getSystemMetrics(),
          getBusinessMetrics(),
          getPerformanceMetrics(),
          getErrorMetrics(),
        ]);

        return NextResponse.json({
          success: true,
          data: {
            system,
            business,
            performance,
            errors,
            timestamp: new Date().toISOString(),
          },
        });
    }
  } catch (error) {
    console.error('Failed to get metrics:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve metrics',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export const GET = withStandardMiddleware(handler, {
  rateLimit: 60, // 60 requests per minute
  logRequests: true,
  validationOptions: {
    methods: ['GET'],
  },
});