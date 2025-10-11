# 🚀 PRODUCTION MONITORING URLS - GANGRUN PRINTING

## DEPLOYMENT STATUS: LIVE ✅

**Date**: 2025-09-28
**Epic**: EPIC-002 COMPLETE
**Environment**: Production

---

## 📊 MONITORING SERVICE URLS

### 1. Application Endpoints

```bash
# Main Application
https://gangrunprinting.com (Port 3002)

# Health Check
https://gangrunprinting.com/api/health
curl https://gangrunprinting.com/api/health

# Metrics Endpoint (Prometheus format)
https://gangrunprinting.com/api/metrics
curl https://gangrunprinting.com/api/metrics
```

### 2. Prometheus (Metrics Collection)

```bash
# Web Interface
http://gangrunprinting.com:9090
http://72.60.28.175:9090

# API Endpoints
http://gangrunprinting.com:9090/api/v1/targets    # View all scrape targets
http://gangrunprinting.com:9090/api/v1/query      # Query metrics
http://gangrunprinting.com:9090/api/v1/alerts     # Active alerts

# Status Pages
http://gangrunprinting.com:9090/targets           # Target health
http://gangrunprinting.com:9090/config            # Configuration
http://gangrunprinting.com:9090/rules             # Alert rules
```

### 3. Grafana (Visualization)

```bash
# Web Interface
http://gangrunprinting.com:3010
http://72.60.28.175:3010

# Login Credentials
Username: admin
Password: GangRun2024Monitor!

# API Endpoints
http://gangrunprinting.com:3010/api/health        # Health check
http://gangrunprinting.com:3010/api/datasources   # Data sources
http://gangrunprinting.com:3010/api/dashboards    # Dashboards

# Direct Dashboard URLs (after login)
http://gangrunprinting.com:3010/dashboards        # Dashboard list
http://gangrunprinting.com:3010/explore           # Explore metrics
```

### 4. AlertManager (Alert Management)

```bash
# Web Interface
http://gangrunprinting.com:9093
http://72.60.28.175:9093

# API Endpoints (v2)
http://gangrunprinting.com:9093/api/v2/alerts     # Active alerts
http://gangrunprinting.com:9093/api/v2/silences   # Alert silences
http://gangrunprinting.com:9093/api/v2/status     # Status

# Alert Groups
http://gangrunprinting.com:9093/#/alerts          # View all alerts
http://gangrunprinting.com:9093/#/silences        # Manage silences
```

### 5. Node Exporter (System Metrics)

```bash
# Metrics Endpoint
http://gangrunprinting.com:9100/metrics
http://72.60.28.175:9100/metrics

# Quick System Check
curl http://localhost:9100/metrics | grep node_
```

---

## 🔍 QUICK ACCESS COMMANDS

### Check Service Status

```bash
# All monitoring containers
docker-compose -f docker-compose.monitoring-prod.yml ps

# Individual service logs
docker logs gangrun_prometheus
docker logs gangrun_grafana
docker logs gangrun_alertmanager
docker logs gangrun_node_exporter
```

### Test Metrics Collection

```bash
# Application metrics
curl -s http://localhost:3002/api/metrics | grep gangrun_

# Prometheus targets
curl -s http://localhost:9090/api/v1/targets | jq '.data.activeTargets[].health'

# Grafana health
curl -s http://localhost:3010/api/health | jq
```

### Send Test Alert

```bash
curl -X POST http://localhost:9093/api/v2/alerts \
  -H "Content-Type: application/json" \
  -d '[{
    "labels": {"alertname": "TestAlert", "severity": "warning"},
    "annotations": {"summary": "Test alert"}
  }]'
```

---

## 📈 KEY METRICS TO MONITOR

### Business Metrics

- `gangrun_orders_total` - Total orders
- `gangrun_revenue_total_cents` - Revenue in cents
- `gangrun_active_sessions` - Active user sessions
- `gangrun_users_total` - Total registered users

### Performance Metrics

- `gangrun_http_request_duration_ms` - API response times
- `gangrun_db_query_duration_ms` - Database query times
- `gangrun_errors_total` - Error counts by type

### System Metrics

- `node_cpu_seconds_total` - CPU usage
- `node_memory_MemAvailable_bytes` - Available memory
- `node_filesystem_avail_bytes` - Disk space
- `node_network_receive_bytes_total` - Network traffic

---

## 🔐 SECURITY NOTES

### Production Access

- All services except application metrics are on internal ports
- Consider using nginx reverse proxy for HTTPS on monitoring services
- Grafana has authentication enabled (admin/GangRun2024Monitor!)
- Prometheus and AlertManager have no auth (add nginx basic auth)

### Recommended Security Enhancements

```nginx
# Add to nginx config for basic auth on monitoring services
location /prometheus/ {
    proxy_pass http://localhost:9090/;
    auth_basic "Monitoring Access";
    auth_basic_user_file /etc/nginx/.htpasswd;
}
```

---

## 🚨 IMPORTANT CONFIGURATIONS

### Sentry Error Tracking

```bash
# Current Configuration (Placeholder - needs real DSN)
NEXT_PUBLIC_SENTRY_DSN=https://placeholder@o123456.ingest.sentry.io/1234567
SENTRY_ORG=gangrunprinting
SENTRY_PROJECT=gangrunprinting-production

# To activate Sentry:
1. Create account at https://sentry.io
2. Create new project for Next.js
3. Copy DSN from project settings
4. Update .env and ecosystem.config.js
5. Restart PM2: pm2 restart gangrunprinting
```

### Alert Webhook Configuration

```yaml
# Current webhook endpoint (in alertmanager config)
webhook_configs:
  - url: 'http://host.docker.internal:3002/api/webhooks/alerts'
    send_resolved: true
```

---

## 📋 MONITORING CHECKLIST

### Daily Checks

- [ ] Check Prometheus targets: http://gangrunprinting.com:9090/targets
- [ ] Review Grafana dashboards: http://gangrunprinting.com:3010
- [ ] Check active alerts: http://gangrunprinting.com:9093
- [ ] Monitor error rates in metrics

### Weekly Tasks

- [ ] Review metric trends in Grafana
- [ ] Check disk usage for metric storage
- [ ] Validate alert rules are firing correctly
- [ ] Review and tune alert thresholds

### Monthly Tasks

- [ ] Backup Grafana dashboards
- [ ] Review metric retention policies
- [ ] Update monitoring documentation
- [ ] Performance review of monitoring stack

---

## 🛠️ TROUBLESHOOTING

### Service Not Accessible

```bash
# Check if container is running
docker ps | grep gangrun_

# Check container logs
docker logs <container_name> --tail 50

# Restart specific service
docker-compose -f docker-compose.monitoring-prod.yml restart <service_name>
```

### Metrics Not Showing

```bash
# Verify application metrics endpoint
curl http://localhost:3002/api/metrics

# Check Prometheus scraping
curl http://localhost:9090/api/v1/targets

# Verify Grafana datasource
curl -u admin:GangRun2024Monitor! http://localhost:3010/api/datasources
```

---

## 📞 SUPPORT CONTACTS

**Monitoring Stack Issues**: DevOps Team
**Application Metrics**: Backend Team
**Dashboard Creation**: Data Team
**Alert Configuration**: SRE Team

---

## 🎯 SUCCESS METRICS

The monitoring system is working when:

1. ✅ All Prometheus targets show "up" status
2. ✅ Grafana can query and display metrics
3. ✅ Alerts are firing and being received
4. ✅ Application metrics are being collected
5. ✅ System metrics show reasonable values

---

**Last Updated**: 2025-09-28
**Status**: PRODUCTION READY ✅
**Epic**: EPIC-002 COMPLETE

## END OF DOCUMENT
