# EPIC-002: PRODUCTION MONITORING & OBSERVABILITY
## Following BMAD Methodology

---

## 📋 EPIC OVERVIEW
**Epic Number:** EPIC-002
**Epic Title:** Production Monitoring & Observability Implementation
**Priority:** P0 - CRITICAL
**Sprint Duration:** 2 Sprints (4 weeks)
**Epic Owner:** SRE Agent
**Start Date:** 2025-09-28

### BUSINESS JUSTIFICATION:
The GangRun Printing system is **LIVE IN PRODUCTION** processing customer orders with **ZERO MONITORING**. This creates unacceptable business risk:
- ❌ No error tracking - issues go undetected
- ❌ No performance monitoring - degradation invisible
- ❌ No alerting - manual discovery of problems
- ❌ No metrics - blind to system health
- ❌ No tracing - cannot debug issues

**Every hour without monitoring risks revenue loss and reputation damage.**

### EPIC ACCEPTANCE CRITERIA:
- [ ] Real-time error tracking with alerts
- [ ] Performance monitoring < 5 min latency
- [ ] 99.9% uptime measurement capability
- [ ] Automated alerting for critical issues
- [ ] Request tracing end-to-end
- [ ] Business metrics dashboard
- [ ] Zero performance impact (< 2% overhead)
- [ ] Complete monitoring runbook

---

## 🏃 SPRINT 1: FOUNDATION & ERROR TRACKING
**Duration:** 2 weeks
**Goal:** Establish error tracking and structured logging

### 📖 STORY 1.1: SENTRY ERROR TRACKING
**Story Points:** 8
**Agent:** Backend Agent
**Priority:** P0 - CRITICAL

#### USER STORY:
```
AS A system administrator
I WANT real-time error tracking
SO THAT I can fix issues before customers are affected
```

#### ACCEPTANCE CRITERIA:
- [ ] Sentry SDK integrated
- [ ] All errors captured with context
- [ ] Source maps configured
- [ ] User context attached
- [ ] Performance tracking enabled
- [ ] Alert rules configured

#### TASKS:
```yaml
tasks:
  - task_id: T1.1.1
    title: Install and Configure Sentry
    priority: P0
    estimate: 2h
    implementation: |
      npm install @sentry/nextjs
      npx @sentry/wizard -i nextjs

      # Environment variables needed:
      NEXT_PUBLIC_SENTRY_DSN=
      SENTRY_ORG=
      SENTRY_PROJECT=
      SENTRY_AUTH_TOKEN=

  - task_id: T1.1.2
    title: Implement Error Boundaries
    priority: P0
    estimate: 3h
    files:
      - src/app/error.tsx
      - src/app/global-error.tsx
      - src/components/ErrorBoundary.tsx

  - task_id: T1.1.3
    title: Add User Context
    priority: P0
    estimate: 2h
    implementation: |
      // In session validation
      Sentry.setUser({
        id: user.id,
        email: user.email,
        username: user.name
      })

  - task_id: T1.1.4
    title: Configure Alerts
    priority: P0
    estimate: 1h
    alerts:
      - Error rate > 1% - Critical
      - New error type - Warning
      - Performance regression - Warning
      - API timeout > 5s - Critical
```

---

### 📖 STORY 1.2: STRUCTURED LOGGING
**Story Points:** 5
**Agent:** Backend Agent
**Priority:** P0

#### USER STORY:
```
AS A developer
I WANT structured logs with correlation IDs
SO THAT I can trace requests across services
```

#### ACCEPTANCE CRITERIA:
- [ ] Winston logger configured
- [ ] Correlation IDs on all requests
- [ ] Log levels properly set
- [ ] JSON structured output
- [ ] Log aggregation ready
- [ ] No sensitive data logged

#### TASKS:
```yaml
tasks:
  - task_id: T1.2.1
    title: Enhance Logger Service
    priority: P0
    estimate: 3h
    file: src/lib/logger-enhanced.ts
    implementation: |
      import winston from 'winston';
      import { AsyncLocalStorage } from 'async_hooks';

      const asyncLocalStorage = new AsyncLocalStorage();

      export const logger = winston.createLogger({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.errors({ stack: true }),
          winston.format.json(),
          winston.format.printf(({ timestamp, level, message, ...meta }) => {
            const correlationId = asyncLocalStorage.getStore()?.correlationId;
            return JSON.stringify({
              timestamp,
              level,
              correlationId,
              message,
              ...meta
            });
          })
        ),
        transports: [
          new winston.transports.Console(),
          new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error'
          }),
          new winston.transports.File({
            filename: 'logs/combined.log'
          })
        ]
      });

  - task_id: T1.2.2
    title: Add Request Middleware
    priority: P0
    estimate: 2h
    file: middleware.ts
    implementation: |
      import { v4 as uuidv4 } from 'uuid';

      export function middleware(request: NextRequest) {
        const correlationId = request.headers.get('x-correlation-id') || uuidv4();

        // Add to async context
        asyncLocalStorage.run({ correlationId }, () => {
          logger.info('Request received', {
            method: request.method,
            url: request.url,
            correlationId
          });
        });

        const response = NextResponse.next();
        response.headers.set('x-correlation-id', correlationId);
        return response;
      }
```

---

### 📖 STORY 1.3: APPLICATION METRICS
**Story Points:** 8
**Agent:** SRE Agent
**Priority:** P0

#### USER STORY:
```
AS A business owner
I WANT to see real-time business metrics
SO THAT I can make data-driven decisions
```

#### ACCEPTANCE CRITERIA:
- [ ] Custom metrics exported
- [ ] Business KPIs tracked
- [ ] Performance metrics collected
- [ ] Database query metrics
- [ ] API endpoint metrics
- [ ] Resource usage tracked

#### TASKS:
```yaml
tasks:
  - task_id: T1.3.1
    title: Implement Prometheus Client
    priority: P0
    estimate: 3h
    implementation: |
      npm install prom-client

      // src/lib/metrics.ts
      import { Registry, Counter, Histogram, Gauge } from 'prom-client';

      export const register = new Registry();

      // Business metrics
      export const ordersTotal = new Counter({
        name: 'orders_total',
        help: 'Total number of orders',
        labelNames: ['status', 'payment_method'],
        registers: [register]
      });

      export const orderValue = new Histogram({
        name: 'order_value_dollars',
        help: 'Order value in dollars',
        buckets: [10, 50, 100, 250, 500, 1000, 2500, 5000],
        registers: [register]
      });

      // Performance metrics
      export const httpDuration = new Histogram({
        name: 'http_request_duration_ms',
        help: 'Duration of HTTP requests in ms',
        labelNames: ['method', 'route', 'status_code'],
        buckets: [10, 50, 100, 250, 500, 1000, 2500, 5000, 10000],
        registers: [register]
      });

  - task_id: T1.3.2
    title: Create Metrics Endpoint
    priority: P0
    estimate: 1h
    file: src/app/api/metrics/route.ts
    implementation: |
      import { register } from '@/lib/metrics';

      export async function GET() {
        const metrics = await register.metrics();
        return new Response(metrics, {
          headers: {
            'Content-Type': register.contentType,
          },
        });
      }

  - task_id: T1.3.3
    title: Instrument Critical Paths
    priority: P0
    estimate: 4h
    paths:
      - Order creation
      - Payment processing
      - User authentication
      - Product queries
      - File uploads
```

---

## 🏃 SPRINT 2: VISUALIZATION & ALERTING
**Duration:** 2 weeks
**Goal:** Deploy monitoring stack and alerting

### 📖 STORY 2.1: MONITORING INFRASTRUCTURE
**Story Points:** 13
**Agent:** DevOps Agent
**Priority:** P0

#### USER STORY:
```
AS A operations team
I WANT monitoring infrastructure
SO THAT we have visibility into system health
```

#### ACCEPTANCE CRITERIA:
- [ ] Prometheus deployed
- [ ] Grafana deployed
- [ ] Loki for logs
- [ ] Tempo for traces
- [ ] AlertManager configured
- [ ] Docker compose ready

#### TASKS:
```yaml
tasks:
  - task_id: T2.1.1
    title: Deploy Monitoring Stack
    priority: P0
    estimate: 4h
    file: docker-compose.monitoring.yml
    implementation: |
      version: '3.8'

      services:
        prometheus:
          image: prom/prometheus:latest
          ports:
            - "9090:9090"
          volumes:
            - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
            - prometheus_data:/prometheus
          command:
            - '--config.file=/etc/prometheus/prometheus.yml'
            - '--storage.tsdb.retention.time=30d'

        grafana:
          image: grafana/grafana:latest
          ports:
            - "3003:3000"
          environment:
            - GF_SECURITY_ADMIN_PASSWORD=admin
            - GF_INSTALL_PLUGINS=redis-datasource
          volumes:
            - grafana_data:/var/lib/grafana
            - ./monitoring/grafana/dashboards:/etc/grafana/provisioning/dashboards
            - ./monitoring/grafana/datasources:/etc/grafana/provisioning/datasources

        loki:
          image: grafana/loki:latest
          ports:
            - "3100:3100"
          volumes:
            - ./monitoring/loki.yml:/etc/loki/local-config.yaml
            - loki_data:/loki

        alertmanager:
          image: prom/alertmanager:latest
          ports:
            - "9093:9093"
          volumes:
            - ./monitoring/alertmanager.yml:/etc/alertmanager/alertmanager.yml

  - task_id: T2.1.2
    title: Configure Prometheus Scraping
    priority: P0
    estimate: 2h
    file: monitoring/prometheus.yml
    config: |
      global:
        scrape_interval: 15s
        evaluation_interval: 15s

      alerting:
        alertmanagers:
          - static_configs:
            - targets: ['alertmanager:9093']

      rule_files:
        - "alerts.yml"

      scrape_configs:
        - job_name: 'gangrunprinting'
          static_configs:
            - targets: ['host.docker.internal:3002']
          metrics_path: '/api/metrics'

        - job_name: 'postgres'
          static_configs:
            - targets: ['postgres:5432']
```

---

### 📖 STORY 2.2: DASHBOARDS & ALERTS
**Story Points:** 8
**Agent:** SRE Agent
**Priority:** P0

#### USER STORY:
```
AS A business stakeholder
I WANT dashboards and alerts
SO THAT I can monitor business KPIs
```

#### ACCEPTANCE CRITERIA:
- [ ] Business dashboard created
- [ ] Technical dashboard created
- [ ] Alert rules defined
- [ ] Notification channels configured
- [ ] SLA tracking enabled
- [ ] Runbook linked

#### TASKS:
```yaml
tasks:
  - task_id: T2.2.1
    title: Create Business Dashboard
    priority: P0
    estimate: 3h
    panels:
      - Orders per hour
      - Revenue today
      - Average order value
      - Top products
      - Conversion rate
      - Customer acquisition
      - Error rate
      - Performance SLA

  - task_id: T2.2.2
    title: Create Technical Dashboard
    priority: P0
    estimate: 3h
    panels:
      - Request rate
      - Response time (p50, p95, p99)
      - Error rate by endpoint
      - Database query time
      - Memory usage
      - CPU usage
      - Active connections
      - Cache hit rate

  - task_id: T2.2.3
    title: Configure Alert Rules
    priority: P0
    estimate: 2h
    file: monitoring/alerts.yml
    rules: |
      groups:
        - name: gangrunprinting
          interval: 30s
          rules:
            - alert: HighErrorRate
              expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
              for: 5m
              labels:
                severity: critical
              annotations:
                summary: "High error rate detected"
                description: "Error rate is {{ $value }} errors per second"

            - alert: SlowResponse
              expr: histogram_quantile(0.95, http_request_duration_ms) > 1000
              for: 10m
              labels:
                severity: warning
              annotations:
                summary: "Slow API response"
                description: "95th percentile response time is {{ $value }}ms"

            - alert: LowOrderRate
              expr: rate(orders_total[1h]) < 0.1
              for: 1h
              labels:
                severity: warning
              annotations:
                summary: "Low order rate"
                description: "Less than 6 orders in the last hour"
```

---

### 📖 STORY 2.3: DISTRIBUTED TRACING
**Story Points:** 8
**Agent:** Backend Agent
**Priority:** P1

#### USER STORY:
```
AS A developer
I WANT distributed tracing
SO THAT I can debug complex issues
```

#### ACCEPTANCE CRITERIA:
- [ ] OpenTelemetry configured
- [ ] Tempo integration
- [ ] Trace context propagation
- [ ] Database queries traced
- [ ] External API calls traced
- [ ] Trace sampling configured

#### TASKS:
```yaml
tasks:
  - task_id: T2.3.1
    title: Implement OpenTelemetry
    priority: P1
    estimate: 4h
    implementation: |
      npm install @opentelemetry/api @opentelemetry/sdk-node @opentelemetry/auto-instrumentations-node

      // src/lib/tracing.ts
      import { NodeSDK } from '@opentelemetry/sdk-node';
      import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
      import { Resource } from '@opentelemetry/resources';
      import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

      const sdk = new NodeSDK({
        resource: new Resource({
          [SemanticResourceAttributes.SERVICE_NAME]: 'gangrunprinting',
          [SemanticResourceAttributes.SERVICE_VERSION]: process.env.npm_package_version,
        }),
        instrumentations: [
          getNodeAutoInstrumentations({
            '@opentelemetry/instrumentation-fs': {
              enabled: false,
            },
          }),
        ],
      });

      sdk.start();
```

---

## 🎯 EPIC COMPLETION CRITERIA

### DEFINITION OF DONE:
```yaml
monitoring_complete:
  error_tracking:
    - Sentry integrated
    - All errors captured
    - Alerts configured
    - Source maps working

  logging:
    - Structured JSON logs
    - Correlation IDs
    - No sensitive data
    - Log aggregation ready

  metrics:
    - Business KPIs tracked
    - Performance metrics
    - Custom dashboards
    - Alert rules active

  infrastructure:
    - Prometheus running
    - Grafana accessible
    - Loki collecting logs
    - AlertManager configured

  documentation:
    - Runbook created
    - Alert response guides
    - Dashboard documentation
    - Troubleshooting guides
```

---

## 📊 SUCCESS METRICS

### KEY PERFORMANCE INDICATORS:
```yaml
kpis:
  - metric: Mean Time To Detection (MTTD)
    target: < 5 minutes
    current: Unknown

  - metric: Mean Time To Resolution (MTTR)
    target: < 30 minutes
    current: Unknown

  - metric: Error Detection Rate
    target: > 95%
    current: 0%

  - metric: Alert Accuracy
    target: > 90%
    current: N/A

  - metric: Monitoring Overhead
    target: < 2% CPU
    current: 0%
```

---

## 🚨 RISK REGISTER

### RISKS:
```yaml
risks:
  - risk: Performance impact from monitoring
    probability: Low
    impact: Medium
    mitigation: Use sampling, optimize collectors

  - risk: Alert fatigue from false positives
    probability: Medium
    impact: Medium
    mitigation: Tune thresholds iteratively

  - risk: Storage costs for metrics/logs
    probability: Medium
    impact: Low
    mitigation: Retention policies, aggregation
```

---

## 🚀 IMMEDIATE ACTIONS

```bash
# Step 1: Install Sentry (TODAY)
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs

# Step 2: Deploy monitoring stack
docker-compose -f docker-compose.monitoring.yml up -d

# Step 3: Configure alerts
curl -X POST http://localhost:9093/api/v1/alerts

# Step 4: Verify metrics
curl http://localhost:3002/api/metrics
curl http://localhost:9090/api/v1/targets

# Step 5: Access Grafana
open http://localhost:3003
```

---

## ✅ EPIC SUCCESS CRITERIA

When complete, GangRun Printing will have:
1. **100% error visibility** - No silent failures
2. **< 5 min detection time** - Fast issue discovery
3. **Business KPI dashboards** - Real-time insights
4. **Automated alerting** - Proactive response
5. **Distributed tracing** - Debug capability
6. **Performance baselines** - Regression detection

## 🎯 EPIC COMMAND

```markdown
ATTENTION ALL AGENTS:

EPIC-002 is now ACTIVE. Priority: CRITICAL.

The system is LIVE without monitoring - this is unacceptable.

IMMEDIATE ACTIONS:
1. Backend Agent: Install Sentry TODAY
2. DevOps Agent: Deploy monitoring stack
3. SRE Agent: Create dashboards and alerts

SUCCESS = ZERO BLIND SPOTS IN PRODUCTION

Begin Sprint 1 NOW.
```

This is your next BMAD-compliant epic ready for execution!