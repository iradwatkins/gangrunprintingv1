# GangRun Printing Deployment Guide

## Production Environment

- **URL**: https://gangrunprinting.com
- **Server**: 72.60.28.175
- **Port**: 3003 (production), 3013 (local development)
- **Deployment Platform**: Dokploy (MANDATORY - All deployments must go through Dokploy)

## Shared Services

All shared services are already deployed and managed separately:

### 1. N8N Automation

- **URL**: https://n8n.agistaffers.com
- **Purpose**: Order automation, vendor integration, workflow management
- **Webhook Endpoint**: https://n8n.agistaffers.com/webhook/gangrunprinting
- **Configuration**: Set N8N_API_KEY in environment

### 2. Chatwoot Support

- **URL**: https://chatwoot.agistaffers.com
- **Purpose**: Live chat support for customers
- **Configuration**:
  1. Create new inbox for GangRun Printing in Chatwoot admin
  2. Get website token from inbox settings
  3. Set NEXT_PUBLIC_CHATWOOT_WEBSITE_TOKEN in environment

### 3. Ollama AI

- **URL**: http://72.60.28.175:11434
- **Purpose**: AI-powered chat assistant
- **Model**: llama3
- **Note**: Shared instance, no additional configuration needed

### 4. MinIO Storage

- **Endpoint**: Configured via Dokploy
- **Bucket**: gangrun-files
- **Purpose**: File storage for uploads and documents

## Environment Variables

### Required for Production

```env
# Domain
DOMAIN=gangrunprinting.com
NEXTAUTH_URL=https://gangrunprinting.com

# Database (configured in Dokploy)
DATABASE_URL=postgresql://[user]:[password]@postgres:5432/gangrun_db

# Authentication
AUTH_SECRET=[32+ character secret]
AUTH_GOOGLE_ID=180548408438-40kht5tlgpiim2j4qhu0qs1mtonvnanq.apps.googleusercontent.com
AUTH_GOOGLE_SECRET=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

# Square Payment
SQUARE_ACCESS_TOKEN=EAAAlxUo1UKk1Lin6wHkpILz-NgqN0-OiNMWN9LBAK-axvt4gmBUCKw8PW1HZeJD
SQUARE_ENVIRONMENT=production
SQUARE_LOCATION_ID=LWMA9R9E2ENXP
SQUARE_APPLICATION_ID=sq0idp-AJF8fI5VayKCq9veQRAw5g

# SendGrid Email
SENDGRID_API_KEY=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
SENDGRID_BILLING_EMAIL=billing@gangrunprinting.com
SENDGRID_SUPPORT_EMAIL=support@gangrunprinting.com

# Shared Services
N8N_WEBHOOK_URL=https://n8n.agistaffers.com/webhook/gangrunprinting
NEXT_PUBLIC_CHATWOOT_WEBSITE_TOKEN=[from chatwoot inbox]
OLLAMA_URL=http://72.60.28.175:11434
```

## Deployment Steps

### 1. Initial Setup in Dokploy

1. Access Dokploy at http://72.60.28.175:3000
2. Create new project: "gangrunprinting"
3. Add application from GitHub repository
4. Configure environment variables
5. Set port to 3003
6. Enable automatic SSL with Let's Encrypt

### 2. Database Setup

```bash
# Run through Dokploy's terminal
npx prisma generate
npx prisma db push
npx tsx prisma/seed-categories.ts
npx tsx prisma/seed-addons.ts
npx tsx prisma/seed-paper-stocks-comprehensive.ts
npx tsx prisma/seed-size-groups-comprehensive.ts
npx tsx prisma/seed-quantity-groups-comprehensive.ts
npx tsx prisma/seed-products-comprehensive.ts
```

### 3. Configure Shared Services

#### N8N Workflow

1. Access N8N at https://n8n.agistaffers.com
2. Create new workflow for GangRun Printing
3. Add webhook trigger with path `/webhook/gangrunprinting`
4. Configure order processing nodes
5. Save and activate workflow

#### Chatwoot Inbox

1. Access Chatwoot at https://chatwoot.agistaffers.com
2. Create new website inbox for gangrunprinting.com
3. Copy website token
4. Add agents to inbox
5. Configure auto-assignment rules

### 4. Testing

```bash
# Test order workflow
npx tsx test-order-workflow.ts

# Test email sending
curl -X POST https://gangrunprinting.com/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# Test N8N webhook
curl -X POST https://gangrunprinting.com/api/webhooks/n8n \
  -H "Content-Type: application/json" \
  -d '{"action": "order.created", "orderNumber": "TEST-123"}'
```

## Backup and Restore

### Automated Backups

Add to crontab on server:

```bash
# Daily backup at 2 AM
0 2 * * * /app/scripts/backup.sh
```

### Manual Backup

```bash
./scripts/backup.sh
```

### Restore from Backup

```bash
./scripts/restore.sh
# Follow prompts to select backup file
```

## Monitoring

### Health Check Endpoints

- Application: https://gangrunprinting.com/api/health
- Chat Service: https://gangrunprinting.com/api/chat (GET)
- N8N Webhook: https://gangrunprinting.com/api/webhooks/n8n (GET)

### Logs

- Application logs: Available in Dokploy dashboard
- N8N workflows: Check execution history in N8N
- Chatwoot conversations: Monitor in Chatwoot dashboard

## Troubleshooting

### Common Issues

1. **502 Bad Gateway**
   - Check if application is running in Dokploy
   - Verify port configuration (should be 3003)
   - Check Traefik routing in Dokploy

2. **Database Connection Failed**
   - Verify DATABASE_URL in environment
   - Check PostgreSQL service in Dokploy
   - Run migrations: `npx prisma db push`

3. **Email Not Sending**
   - Verify SendGrid API key
   - Check email addresses are verified in SendGrid
   - Review email logs in application

4. **Chat Not Working**
   - Verify Chatwoot website token
   - Check if Chatwoot service is accessible
   - Ensure inbox is properly configured

5. **Payment Issues**
   - Verify Square credentials
   - Check Square webhook signature
   - Review Square dashboard for errors

## Security Notes

1. **Never commit** .env files with real credentials
2. **Always use** Dokploy for deployments (mandatory)
3. **Rotate** secrets regularly
4. **Monitor** failed login attempts
5. **Keep** dependencies updated
6. **Use** HTTPS only in production

## Support Contacts

- **Technical Issues**: Use Dokploy logs and monitoring
- **Payment Issues**: Check Square dashboard
- **Email Issues**: Review SendGrid dashboard
- **Chat Issues**: Monitor Chatwoot inbox
- **Automation Issues**: Check N8N workflow executions

## Production Checklist

- [ ] Environment variables configured
- [ ] Database migrated and seeded
- [ ] SSL certificate active
- [ ] Backup cron job configured
- [ ] N8N webhook active
- [ ] Chatwoot inbox configured
- [ ] SendGrid verified and tested
- [ ] Square webhook configured
- [ ] Health checks passing
- [ ] Test order completed successfully
