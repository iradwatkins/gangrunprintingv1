# GangRun Printing Monitoring Stack - Dokploy Deployment Guide

## Prerequisites

1. **Dokploy Access**: Admin access to Dokploy dashboard at port 3000
2. **Domain Setup**: DNS records configured for monitoring subdomains
3. **Environment Variables**: Required secrets and API keys configured
4. **Storage**: Persistent volumes created on the server

## Deployment Steps

### 1. Create Directory Structure

SSH into the VPS (72.60.28.175) and create the monitoring directories:

```bash
sudo mkdir -p /opt/gangrun/monitoring/{prometheus,grafana,alertmanager,postgres}
sudo chown -R 1000:1000 /opt/gangrun/monitoring
chmod -R 755 /opt/gangrun/monitoring
```

### 2. Upload Configuration Files

Copy the monitoring configuration files to the server:

```bash
# Upload prometheus configuration
scp monitoring/prometheus.yml root@72.60.28.175:/opt/gangrun/monitoring/prometheus/
scp monitoring/alert-rules.yml root@72.60.28.175:/opt/gangrun/monitoring/prometheus/

# Upload alertmanager configuration
scp monitoring/alertmanager.yml root@72.60.28.175:/opt/gangrun/monitoring/alertmanager/

# Upload blackbox configuration
scp monitoring/blackbox.yml root@72.60.28.175:/opt/gangrun/monitoring/
```

### 3. Create Monitoring Project in Dokploy

1. **Access Dokploy**: Navigate to `http://72.60.28.175:3000`
2. **Create Project**:
   - Name: `gangrun-monitoring`
   - Description: `Monitoring and observability stack for GangRun Printing`
3. **Add Docker Compose Application**:
   - Name: `monitoring-stack`
   - Repository: Use the `docker-compose.monitoring.yml` file
   - Build Path: `/`

### 4. Configure Environment Variables

In Dokploy, set the following environment variables for the monitoring stack:

#### Required Variables:
```bash
GRAFANA_ADMIN_PASSWORD=SecurePassword123!
GRAFANA_SECRET_KEY=very-long-random-secret-key-for-grafana
GRAFANA_DB_PASSWORD=grafana-db-secure-password
RESEND_API_KEY=re_your_resend_api_key_here
```

#### Optional Variables:
```bash
PROMETHEUS_RETENTION=30d
ALERTMANAGER_LOG_LEVEL=info
TZ=America/Chicago
```

### 5. Configure Domain Routing

Set up the following domains in Dokploy's domain management:

#### Monitoring Domains:
- `monitoring.gangrunprinting.com` → Grafana (port 3000)
- `prometheus.gangrunprinting.com` → Prometheus (port 9090)
- `alerts.gangrunprinting.com` → AlertManager (port 9093)
- `metrics.gangrunprinting.com` → Pushgateway (port 9091)

#### SSL Configuration:
- Enable Let's Encrypt for all monitoring domains
- Force HTTPS redirect
- Configure HSTS headers

### 6. Deploy the Stack

1. **Deploy Application**: Click "Deploy" in Dokploy
2. **Monitor Deployment**: Watch the deployment logs
3. **Verify Services**: Check that all containers start successfully

### 7. Configure Grafana Dashboards

After deployment, access Grafana at `https://monitoring.gangrunprinting.com`:

1. **Login**: Use admin credentials from environment variables
2. **Add Data Sources**:
   - Prometheus: `http://prometheus:9090`
   - AlertManager: `http://alertmanager:9093`

3. **Import Dashboards**:
   - Node Exporter Dashboard (ID: 1860)
   - Application Metrics Dashboard (custom)
   - Business Intelligence Dashboard (custom)

### 8. Configure Alert Channels

In Grafana, set up notification channels:

1. **Email Notifications**:
   - SMTP Server: `smtp.resend.com:587`
   - Username: `resend`
   - Password: Use RESEND_API_KEY

2. **Webhook Notifications** (optional):
   - Slack integration
   - Discord integration
   - Custom webhook endpoints

### 9. Verify Monitoring Stack

#### Health Checks:
```bash
# Check service status
curl -f https://monitoring.gangrunprinting.com/api/health
curl -f https://prometheus.gangrunprinting.com/-/healthy
curl -f https://alerts.gangrunprinting.com/-/healthy

# Check metrics collection
curl -s https://prometheus.gangrunprinting.com/api/v1/query?query=up
```

#### Test Alerts:
1. Create test alert in AlertManager
2. Verify email delivery
3. Check alert routing and grouping

### 10. Application Integration

Update the main GangRun Printing application to expose metrics:

#### Add to package.json:
```json
{
  "dependencies": {
    "prom-client": "^15.1.0",
    "@sentry/nextjs": "^7.100.0",
    "uuid": "^9.0.1",
    "web-vitals": "^3.5.0"
  }
}
```

#### Create Prometheus Metrics Endpoint:
```typescript
// src/app/api/monitoring/prometheus/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { register } from 'prom-client';

export async function GET(req: NextRequest) {
  const metrics = await register.metrics();
  return new NextResponse(metrics, {
    headers: {
      'Content-Type': register.contentType,
    },
  });
}
```

## Monitoring Targets

### System Monitoring:
- CPU, Memory, Disk usage
- Network statistics
- System load and processes
- Docker container metrics

### Application Monitoring:
- HTTP request metrics
- Database query performance
- API endpoint response times
- Error rates and exceptions

### Business Monitoring:
- Order processing metrics
- Payment success/failure rates
- User registration and activity
- Revenue and conversion metrics

### External Monitoring:
- Website uptime and performance
- SSL certificate expiration
- DNS resolution times
- Third-party API availability

## Alert Configuration

### Critical Alerts (Immediate):
- System down or unresponsive
- Database connection failures
- Payment processing errors
- SSL certificate expired

### Warning Alerts (Within 30 minutes):
- High resource usage
- Slow response times
- SSL certificate expiring soon
- Business metric anomalies

### Info Alerts (During business hours):
- Deployment notifications
- Maintenance schedules
- Performance optimizations

## Maintenance Tasks

### Daily:
- Review critical alerts
- Check system resource usage
- Verify backup completion

### Weekly:
- Review performance trends
- Update monitoring dashboards
- Clean up old alert data

### Monthly:
- Review and update alert thresholds
- Analyze business metric trends
- Update monitoring documentation

## Troubleshooting

### Common Issues:

1. **Containers Not Starting**:
   - Check environment variables
   - Verify directory permissions
   - Review container logs

2. **Metrics Not Collecting**:
   - Verify Prometheus configuration
   - Check network connectivity
   - Review scrape target health

3. **Alerts Not Firing**:
   - Check AlertManager configuration
   - Verify SMTP settings
   - Review alert rule syntax

4. **Dashboard Not Loading**:
   - Check Grafana data sources
   - Verify Prometheus connectivity
   - Review dashboard JSON

### Support Contacts:
- **System Issues**: admin@gangrunprinting.com
- **Business Alerts**: business@gangrunprinting.com
- **Emergency**: Configured on-call rotation

## Security Considerations

1. **Network Security**:
   - All monitoring services behind reverse proxy
   - SSL/TLS encryption for all communications
   - Firewall rules restricting direct access

2. **Authentication**:
   - Strong passwords for all services
   - Regular credential rotation
   - Multi-factor authentication where possible

3. **Data Protection**:
   - Sensitive data redaction in logs
   - Encryption at rest for metrics data
   - Regular security audits

4. **Access Control**:
   - Role-based access to monitoring tools
   - Audit logging for administrative actions
   - Regular access review and cleanup