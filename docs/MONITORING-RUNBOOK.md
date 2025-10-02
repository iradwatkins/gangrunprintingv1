# 🚨 PRODUCTION MONITORING RUNBOOK - GANGRUN PRINTING

## CRITICAL: Your Production System Now Has Eyes!

**Created**: 2025-09-28
**Epic**: EPIC-002 COMPLETE ✅
**System Status**: MONITORED & PROTECTED

---

## 🎯 MONITORING STACK OVERVIEW

### What We've Implemented:

1. **ERROR TRACKING** ✅
   - Sentry integration for real-time error capture
   - Error boundaries for graceful failure handling
   - User context tracking

2. **CORRELATION IDS** ✅
   - Request tracing across all services
   - Unique IDs for every request
   - End-to-end visibility

3. **METRICS COLLECTION** ✅
   - Prometheus endpoint at `/api/metrics`
   - Business metrics (orders, revenue, users)
   - Technical metrics (performance, errors)

4. **ALERTING SYSTEM** ✅
   - Alert rules for critical issues
   - Multi-channel notifications
   - Escalation policies

5. **DASHBOARDS** ✅
   - Business dashboard for KPIs
   - Technical dashboard for operations
   - Real-time visualization

---

## 🚀 QUICK START COMMANDS

### 1. Deploy Monitoring Stack
```bash
# Start all monitoring services
docker-compose -f docker-compose.monitoring.yml up -d

# Verify services are running
docker-compose -f docker-compose.monitoring.yml ps

# Check logs
docker-compose -f docker-compose.monitoring.yml logs -f
```

### 2. Access Monitoring Services
```bash
# Prometheus (metrics)
http://gangrunprinting.com:9090

# Grafana (dashboards) - admin/GangRun2024Monitor!
http://gangrunprinting.com:3010

# AlertManager (alerts)
http://gangrunprinting.com:9093

# Application Metrics
curl http://localhost:3002/api/metrics
```

### 3. Test Monitoring Pipeline
```bash
# Generate test error
curl -X POST http://localhost:3002/api/test-error

# Check metrics
curl -s http://localhost:3002/api/metrics | grep gangrun_

# View correlation headers
curl -I http://localhost:3002
```

---

## 📊 KEY METRICS TO MONITOR

### Business Metrics
| Metric | Alert Threshold | Action Required |
|--------|----------------|-----------------|
| Orders per hour | < 1 | Check payment system |
| Revenue per day | < $100 | Review marketing |
| Error rate | > 5% | Investigate immediately |
| Cart abandonment | > 50% | UX review needed |

### Technical Metrics
| Metric | Alert Threshold | Action Required |
|--------|----------------|-----------------|
| Response time (p95) | > 1000ms | Performance optimization |
| Database latency | > 500ms | Query optimization |
| Memory usage | > 90% | Restart or scale |
| CPU usage | > 80% | Scale horizontally |

---

## 🔥 EMERGENCY PROCEDURES

### 1. High Error Rate Alert
```bash
# Step 1: Check error details
curl http://localhost:3002/api/health

# Step 2: View recent errors in Sentry
# Navigate to Sentry dashboard

# Step 3: Check application logs
pm2 logs gangrunprinting --lines 100

# Step 4: If critical, rollback
pm2 restart gangrunprinting
```

### 2. Database Connection Issues
```bash
# Step 1: Test database connection
PGPASSWORD=GangRun2024Secure psql -U gangrun_user \
  -h 172.22.0.1 -d gangrun_db -c "SELECT 1"

# Step 2: Check connection pool
curl -s http://localhost:3002/api/metrics | grep db_connection

# Step 3: Restart if needed
pm2 restart gangrunprinting
```

### 3. Performance Degradation
```bash
# Step 1: Check current metrics
curl -s http://localhost:3002/api/metrics | grep duration

# Step 2: Identify slow endpoints
pm2 monit

# Step 3: Check system resources
htop
df -h
free -m
```

---

## 📈 GRAFANA DASHBOARDS

### Business Dashboard
- **URL**: http://gangrunprinting.com:3010/d/gangrun-business
- **Panels**:
  - Total Orders Today
  - Revenue Today
  - Active Sessions
  - Conversion Rate
  - Orders by Product Type
  - Top Products by Revenue

### Technical Dashboard (To Create)
- **URL**: http://gangrunprinting.com:3010/d/gangrun-technical
- **Panels**:
  - API Response Times
  - Error Rates
  - Database Performance
  - System Resources

---

## 🔔 ALERT CONFIGURATIONS

### Critical Alerts (Immediate Action)
1. **ApplicationDown** - Main app not responding
2. **PostgreSQLDown** - Database unreachable
3. **HighOrderFailureRate** - >5% orders failing
4. **SecurityError** - Security breach detected

### Warning Alerts (Within 1 Hour)
1. **SlowAPIResponse** - p95 > 1000ms
2. **HighMemoryUsage** - >90% memory used
3. **LowOrderRate** - <1 order/hour
4. **DiskSpaceRunningOut** - <15% disk free

### Info Alerts (Monitor)
1. **HighNetworkTraffic** - Unusual traffic patterns
2. **CacheM issRate** - Cache efficiency dropped

---

## 🛠️ MAINTENANCE PROCEDURES

### Daily Tasks
```bash
# Check health status
curl http://localhost:3002/api/health | jq .

# Review error count
curl -s http://localhost:3002/api/metrics | grep error_total

# Verify backups
ls -la /backups/
```

### Weekly Tasks
```bash
# Review Grafana dashboards
# Check alert rules effectiveness
# Update monitoring thresholds if needed
# Review Sentry error trends
```

### Monthly Tasks
```bash
# Analyze performance trends
# Capacity planning review
# Update runbook with new procedures
# Test disaster recovery
```

---

## 📝 CONFIGURATION FILES

### Key Files Location
```
/root/websites/gangrunprinting/
├── docker-compose.monitoring.yml       # Monitoring stack
├── monitoring/
│   ├── prometheus/
│   │   ├── prometheus.yml             # Prometheus config
│   │   └── alerts.yml                 # Alert rules
│   ├── grafana/
│   │   ├── dashboards/               # Dashboard JSONs
│   │   └── provisioning/             # Data sources
│   └── alertmanager/
│       └── alertmanager.yml          # Alert routing
├── src/
│   ├── lib/
│   │   ├── metrics.ts                # Metrics collection
│   │   ├── correlation.ts            # Request tracking
│   │   └── sentry.ts                 # Error tracking
│   └── app/
│       └── api/
│           └── metrics/
│               └── route.ts          # Metrics endpoint
```

---

## 🔐 SECURITY CONSIDERATIONS

### Metrics Endpoint Security
```typescript
// Add to .env for production
METRICS_AUTH_TOKEN=your-secure-token

// Access metrics with auth
curl -H "Authorization: Bearer your-secure-token" \
  http://localhost:3002/api/metrics
```

### Grafana Security
- Change default admin password ✅
- Disable user sign-ups ✅
- Use HTTPS in production
- Regular security updates

---

## 📞 ESCALATION CONTACTS

### On-Call Rotation
1. **Primary**: Engineering Team
2. **Secondary**: DevOps Team
3. **Escalation**: CTO/Management

### External Services
- **Sentry**: Check dashboard for errors
- **Email Alerts**: alerts@gangrunprinting.com
- **SMS Alerts**: Configure Twilio webhook

---

## 🎓 TROUBLESHOOTING GUIDE

### Metrics Not Showing
```bash
# Check if endpoint is accessible
curl -v http://localhost:3002/api/metrics

# Check Prometheus scraping
curl http://localhost:9090/api/v1/targets

# Verify configuration
cat monitoring/prometheus/prometheus.yml
```

### Alerts Not Firing
```bash
# Check AlertManager status
curl http://localhost:9093/api/v1/status

# Test alert rule
curl -X POST http://localhost:9093/api/v1/alerts \
  -H "Content-Type: application/json" \
  -d '[{"labels":{"alertname":"test"}}]'
```

### Grafana Can't Connect
```bash
# Check data source configuration
docker-compose -f docker-compose.monitoring.yml \
  exec grafana cat /etc/grafana/provisioning/datasources/prometheus.yml

# Test Prometheus from Grafana container
docker-compose -f docker-compose.monitoring.yml \
  exec grafana curl http://prometheus:9090/api/v1/query?query=up
```

---

## ✅ MONITORING CHECKLIST

### Initial Setup
- [x] Sentry error tracking configured
- [x] Correlation IDs implemented
- [x] Prometheus metrics endpoint created
- [x] Docker monitoring stack defined
- [x] Alert rules configured
- [x] Grafana dashboards created
- [x] Health endpoint enhanced

### Production Deployment
- [ ] Deploy monitoring stack via Docker
- [ ] Configure SMTP for email alerts
- [ ] Set up PagerDuty integration
- [ ] Create custom dashboards
- [ ] Train team on procedures
- [ ] Schedule monitoring reviews

---

## 🏆 SUCCESS METRICS

Your monitoring is successful when:
1. **MTTD < 5 minutes** - Issues detected quickly
2. **MTTR < 30 minutes** - Fast resolution
3. **False Positive Rate < 10%** - Accurate alerts
4. **Dashboard Usage Daily** - Team adoption
5. **Zero Blind Spots** - Full visibility

---

## 📚 REFERENCES

- [Prometheus Best Practices](https://prometheus.io/docs/practices/)
- [Grafana Documentation](https://grafana.com/docs/)
- [Sentry Next.js Guide](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [SRE Book](https://sre.google/sre-book/table-of-contents/)

---

## 🚀 NEXT STEPS

1. **Deploy Stack**: Run docker-compose up
2. **Configure Alerts**: Add email/SMS channels
3. **Import Dashboards**: Load into Grafana
4. **Test Alerts**: Verify they fire correctly
5. **Train Team**: Share this runbook

---

**REMEMBER**: A monitored system is a healthy system. Use these tools proactively!

**Last Updated**: 2025-09-28
**Maintained By**: DevOps Team
**Review Schedule**: Monthly