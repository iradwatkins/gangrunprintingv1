import { NextRequest, NextResponse } from 'next/server';
import { withStandardMiddleware } from '@/lib/api-middleware';
import { redis } from '@/lib/redis';
import { reportError, reportBusinessError } from '@/lib/sentry';
import { resend } from '@/lib/resend';

interface Alert {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'system' | 'business' | 'performance' | 'error' | 'security';
  status: 'active' | 'acknowledged' | 'resolved';
  timestamp: string;
  metadata?: Record<string, any>;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
}

interface AlertRule {
  id: string;
  name: string;
  metric: string;
  operator: '>' | '<' | '=' | '>=' | '<=';
  threshold: number;
  duration: number; // minutes
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'system' | 'business' | 'performance' | 'error' | 'security';
  enabled: boolean;
  notificationChannels: string[];
}

// Default alert rules
const defaultAlertRules: AlertRule[] = [
  {
    id: 'high-cpu-usage',
    name: 'High CPU Usage',
    metric: 'system.cpu',
    operator: '>',
    threshold: 80,
    duration: 5,
    severity: 'high',
    type: 'system',
    enabled: true,
    notificationChannels: ['email', 'sentry'],
  },
  {
    id: 'high-memory-usage',
    name: 'High Memory Usage',
    metric: 'system.memory',
    operator: '>',
    threshold: 90,
    duration: 5,
    severity: 'critical',
    type: 'system',
    enabled: true,
    notificationChannels: ['email', 'sentry'],
  },
  {
    id: 'high-error-rate',
    name: 'High Error Rate',
    metric: 'performance.errorRate',
    operator: '>',
    threshold: 5,
    duration: 2,
    severity: 'critical',
    type: 'error',
    enabled: true,
    notificationChannels: ['email', 'sentry'],
  },
  {
    id: 'slow-response-time',
    name: 'Slow Response Time',
    metric: 'performance.avgResponseTime',
    operator: '>',
    threshold: 2000,
    duration: 3,
    severity: 'medium',
    type: 'performance',
    enabled: true,
    notificationChannels: ['email'],
  },
  {
    id: 'low-conversion-rate',
    name: 'Low Conversion Rate',
    metric: 'business.conversionRate',
    operator: '<',
    threshold: 1.5,
    duration: 30,
    severity: 'medium',
    type: 'business',
    enabled: true,
    notificationChannels: ['email'],
  },
  {
    id: 'high-cart-abandonment',
    name: 'High Cart Abandonment',
    metric: 'business.cartAbandonmentRate',
    operator: '>',
    threshold: 80,
    duration: 60,
    severity: 'medium',
    type: 'business',
    enabled: true,
    notificationChannels: ['email'],
  },
  {
    id: 'payment-failures',
    name: 'Payment Failures',
    metric: 'business.paymentFailures',
    operator: '>',
    threshold: 10,
    duration: 10,
    severity: 'high',
    type: 'business',
    enabled: true,
    notificationChannels: ['email', 'sentry'],
  },
];

async function getActiveAlerts(): Promise<Alert[]> {
  try {
    const alertsJson = await redis.get('alerts:active');
    return alertsJson ? JSON.parse(alertsJson) : [];
  } catch (error) {
    console.error('Failed to get active alerts:', error);
    return [];
  }
}

async function saveAlert(alert: Alert): Promise<void> {
  try {
    const alerts = await getActiveAlerts();
    const existingIndex = alerts.findIndex(a => a.id === alert.id);

    if (existingIndex >= 0) {
      alerts[existingIndex] = alert;
    } else {
      alerts.push(alert);
    }

    await redis.setex('alerts:active', 86400, JSON.stringify(alerts)); // 24 hours
  } catch (error) {
    console.error('Failed to save alert:', error);
  }
}

async function sendAlertNotifications(alert: Alert, rule: AlertRule): Promise<void> {
  const notifications: Promise<any>[] = [];

  // Send email notification
  if (rule.notificationChannels.includes('email')) {
    const emailPromise = resend.emails.send({
      from: 'alerts@gangrunprinting.com',
      to: ['admin@gangrunprinting.com'], // In production, this would be configurable
      subject: `[${alert.severity.toUpperCase()}] ${alert.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: ${alert.severity === 'critical' ? '#dc2626' : alert.severity === 'high' ? '#ea580c' : '#1d4ed8'};">
            Alert: ${alert.title}
          </h2>

          <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; border-left: 4px solid ${alert.severity === 'critical' ? '#dc2626' : alert.severity === 'high' ? '#ea580c' : '#1d4ed8'};">
            <p><strong>Description:</strong> ${alert.description}</p>
            <p><strong>Severity:</strong> ${alert.severity.toUpperCase()}</p>
            <p><strong>Type:</strong> ${alert.type}</p>
            <p><strong>Timestamp:</strong> ${new Date(alert.timestamp).toLocaleString()}</p>

            ${alert.metadata ? `
              <h3>Additional Information:</h3>
              <pre style="background-color: #1f2937; color: #f9fafb; padding: 12px; border-radius: 4px; overflow-x: auto;">
${JSON.stringify(alert.metadata, null, 2)}
              </pre>
            ` : ''}
          </div>

          <p style="margin-top: 24px;">
            Please investigate this alert immediately and take appropriate action.
          </p>

          <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
            <p>This alert was generated automatically by the GangRun Printing monitoring system.</p>
          </div>
        </div>
      `,
    });

    notifications.push(emailPromise);
  }

  // Send Sentry notification
  if (rule.notificationChannels.includes('sentry')) {
    if (alert.severity === 'critical' || alert.severity === 'high') {
      reportError(new Error(`Alert: ${alert.title}`), {
        alert: true,
        alertId: alert.id,
        severity: alert.severity,
        type: alert.type,
        description: alert.description,
        metadata: alert.metadata,
      });
    } else {
      reportBusinessError(`Alert: ${alert.title}`, 'warning', {
        alertId: alert.id,
        severity: alert.severity,
        type: alert.type,
        description: alert.description,
        metadata: alert.metadata,
      });
    }
  }

  // Wait for all notifications to complete
  try {
    await Promise.allSettled(notifications);
  } catch (error) {
    console.error('Failed to send alert notifications:', error);
  }
}

async function checkAlertRules(): Promise<void> {
  try {
    // Get current metrics
    const metricsResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/monitoring/metrics?type=all`);
    if (!metricsResponse.ok) {
      throw new Error('Failed to fetch metrics');
    }

    const { data: metrics } = await metricsResponse.json();
    const rules = defaultAlertRules.filter(rule => rule.enabled);

    for (const rule of rules) {
      const metricValue = getMetricValue(metrics, rule.metric);
      if (metricValue === undefined) continue;

      const isThresholdBreached = checkThreshold(metricValue, rule.operator, rule.threshold);

      if (isThresholdBreached) {
        const alertId = `${rule.id}-${Date.now()}`;
        const alert: Alert = {
          id: alertId,
          title: rule.name,
          description: `${rule.metric} is ${metricValue} (threshold: ${rule.operator} ${rule.threshold})`,
          severity: rule.severity,
          type: rule.type,
          status: 'active',
          timestamp: new Date().toISOString(),
          metadata: {
            rule: rule.id,
            metric: rule.metric,
            value: metricValue,
            threshold: rule.threshold,
            operator: rule.operator,
          },
        };

        await saveAlert(alert);
        await sendAlertNotifications(alert, rule);
      }
    }
  } catch (error) {
    console.error('Failed to check alert rules:', error);
  }
}

function getMetricValue(metrics: any, metricPath: string): number | undefined {
  const parts = metricPath.split('.');
  let value = metrics;

  for (const part of parts) {
    value = value?.[part];
    if (value === undefined) return undefined;
  }

  return typeof value === 'number' ? value : undefined;
}

function checkThreshold(value: number, operator: string, threshold: number): boolean {
  switch (operator) {
    case '>': return value > threshold;
    case '<': return value < threshold;
    case '>=': return value >= threshold;
    case '<=': return value <= threshold;
    case '=': return value === threshold;
    default: return false;
  }
}

async function handleGet(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');

  try {
    switch (type) {
      case 'rules':
        return NextResponse.json({
          success: true,
          data: defaultAlertRules,
        });

      case 'check':
        await checkAlertRules();
        return NextResponse.json({
          success: true,
          message: 'Alert rules checked successfully',
        });

      case 'active':
      default:
        const alerts = await getActiveAlerts();
        return NextResponse.json({
          success: true,
          data: alerts.filter(alert => alert.status === 'active'),
        });
    }
  } catch (error) {
    console.error('Failed to handle GET request:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve alerts',
      },
      { status: 500 }
    );
  }
}

async function handlePost(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, alertId, ...data } = body;

    switch (action) {
      case 'acknowledge':
        const alerts = await getActiveAlerts();
        const alertIndex = alerts.findIndex(a => a.id === alertId);

        if (alertIndex >= 0) {
          alerts[alertIndex].status = 'acknowledged';
          alerts[alertIndex].acknowledgedBy = data.acknowledgedBy || 'system';
          alerts[alertIndex].acknowledgedAt = new Date().toISOString();

          await redis.setex('alerts:active', 86400, JSON.stringify(alerts));

          return NextResponse.json({
            success: true,
            message: 'Alert acknowledged successfully',
          });
        } else {
          return NextResponse.json(
            {
              success: false,
              error: 'Alert not found',
            },
            { status: 404 }
          );
        }

      case 'resolve':
        const allAlerts = await getActiveAlerts();
        const resolveIndex = allAlerts.findIndex(a => a.id === alertId);

        if (resolveIndex >= 0) {
          allAlerts[resolveIndex].status = 'resolved';
          allAlerts[resolveIndex].resolvedAt = new Date().toISOString();

          await redis.setex('alerts:active', 86400, JSON.stringify(allAlerts));

          return NextResponse.json({
            success: true,
            message: 'Alert resolved successfully',
          });
        } else {
          return NextResponse.json(
            {
              success: false,
              error: 'Alert not found',
            },
            { status: 404 }
          );
        }

      case 'create':
        const newAlert: Alert = {
          id: `manual-${Date.now()}`,
          title: data.title,
          description: data.description,
          severity: data.severity || 'medium',
          type: data.type || 'system',
          status: 'active',
          timestamp: new Date().toISOString(),
          metadata: data.metadata,
        };

        await saveAlert(newAlert);

        return NextResponse.json({
          success: true,
          data: newAlert,
        });

      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid action',
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Failed to handle POST request:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process alert action',
      },
      { status: 500 }
    );
  }
}

export const GET = withStandardMiddleware(handleGet, {
  rateLimit: 60,
  logRequests: true,
  validationOptions: {
    methods: ['GET'],
  },
});

export const POST = withStandardMiddleware(handlePost, {
  rateLimit: 30,
  logRequests: true,
  validationOptions: {
    methods: ['POST'],
    contentTypes: ['application/json'],
    maxBodySize: 1024 * 1024, // 1MB
  },
});