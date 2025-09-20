# GangRun Printing - Production Deployment Guide

## 📋 Pre-Deployment Checklist

### Required Credentials

You need to gather these credentials before proceeding:

#### 1. **Square Payment Processing**

- [ ] Square Access Token
- [ ] Square Location ID
- [ ] Square Application ID
- [ ] Square Environment (sandbox for testing, production for live)

**How to get Square credentials:**

1. Go to https://developer.squareup.com/apps
2. Create or select your application
3. Navigate to "Credentials" tab
4. Copy the required values

#### 2. **SendGrid Email Service**

- [ ] SendGrid API Key
- [ ] From Email Address (e.g., orders@gangrunprinting.com)
- [ ] From Name (e.g., "GangRun Printing")

**How to get SendGrid credentials:**

1. Go to https://app.sendgrid.com/settings/api_keys
2. Create a new API key with "Mail Send" permissions
3. Verify your sender email address

#### 3. **Database**

- [ ] PostgreSQL connection string (will be created in Dokploy)

#### 4. **N8N Automation**

- [ ] N8N Webhook URL (e.g., https://n8n.agistaffers.com/webhook/gangrun)
- [ ] N8N API Key (if required)

## 🚀 Deployment Steps

### Step 1: Configure Environment Variables

Run the setup script to configure your environment:

```bash
./scripts/setup-production.sh
```

This will prompt you for all required credentials and create your `.env` file.

### Step 2: Test Integrations Locally

Before deploying, test all integrations:

```bash
npx tsx scripts/test-integrations.ts
```

All tests should pass before proceeding to deployment.

### Step 3: Build and Test Locally

```bash
# Install dependencies
npm install

# Run database migrations
npx prisma migrate deploy

# Build the application
npm run build

# Test the build locally
npm start
```

Visit http://localhost:3003 to verify the application works.

### Step 4: Deploy to Dokploy

#### A. Through Dokploy UI:

1. **Login to Dokploy**: https://72.60.28.175:3000

2. **Create New Project**:
   - Name: `gangrunprinting`
   - Description: "GangRun Printing E-commerce Platform"

3. **Add PostgreSQL Service**:
   - Go to Services → Add Service → PostgreSQL
   - Database Name: `gangrun_db`
   - Username: `gangrun_user`
   - Password: [Generate secure password]
   - Note the connection string

4. **Add Application**:
   - Type: Docker Compose
   - Repository: https://github.com/iradwatkins/gangrunprinting.git
   - Branch: main
   - Compose File: docker-compose.dokploy.yml

5. **Configure Environment Variables** in Dokploy:

   ```env
   DATABASE_URL=postgresql://gangrun_user:password@gangrunprinting-postgres:5432/gangrun_db
   NEXTAUTH_URL=https://gangrunprinting.com
   AUTH_SECRET=[Generated in Step 1]
   SQUARE_ACCESS_TOKEN=[Your Square Token]
   SQUARE_LOCATION_ID=[Your Square Location]
   SQUARE_APPLICATION_ID=[Your Square App ID]
   SQUARE_ENVIRONMENT=production
   SENDGRID_API_KEY=[Your SendGrid Key]
   SENDGRID_FROM_EMAIL=[Your From Email]
   SENDGRID_FROM_NAME=GangRun Printing
   N8N_WEBHOOK_URL=[Your N8N Webhook]
   ```

6. **Configure Domain**:
   - Domain: gangrunprinting.com
   - Enable SSL: Yes (Let's Encrypt)
   - Force HTTPS: Yes

7. **Deploy**: Click "Deploy" button

#### B. Through Command Line:

```bash
# Push to GitHub
git add .
git commit -m "Ready for production deployment"
git push origin main

# SSH into server
ssh root@72.60.28.175

# Navigate to Dokploy projects
cd /var/lib/dokploy/projects/gangrunprinting

# Pull latest code
git pull origin main

# Deploy through Dokploy CLI
dokploy deploy gangrunprinting
```

### Step 5: Post-Deployment Setup

1. **Run Database Migrations**:

```bash
# SSH into the container
docker exec -it gangrunprinting-app sh

# Run migrations
npx prisma migrate deploy

# Seed initial data (optional)
npm run seed
```

2. **Create MinIO Bucket**:

```bash
# Access MinIO console at http://72.60.28.175:9003
# Login with credentials from docker-compose
# Create bucket: gangrun-files
```

3. **Configure N8N Workflows**:

- Login to N8N: https://n8n.agistaffers.com
- Create webhook node for order processing
- Configure vendor integration workflows

4. **Test Order Flow**:

- Place a test order
- Verify payment processing
- Check email delivery
- Confirm N8N webhook triggers

## 🔍 Monitoring & Maintenance

### Health Checks

Test the application health:

```bash
curl https://gangrunprinting.com/api/health
```

### View Logs

```bash
# Application logs
docker logs gangrunprinting-app -f

# Database logs
docker logs gangrunprinting-postgres -f

# MinIO logs
docker logs gangrunprinting-minio -f
```

### Database Backup

```bash
# Create backup
docker exec gangrunprinting-postgres pg_dump -U gangrun_user gangrun_db > backup_$(date +%Y%m%d).sql

# Restore backup
docker exec -i gangrunprinting-postgres psql -U gangrun_user gangrun_db < backup.sql
```

## 🚨 Troubleshooting

### Common Issues

1. **Payment not working**:
   - Verify Square credentials in environment variables
   - Check Square webhook configuration
   - Review logs for Square API errors

2. **Emails not sending**:
   - Verify SendGrid API key
   - Check sender email is verified in SendGrid
   - Review email logs in application

3. **File uploads failing**:
   - Verify MinIO is running
   - Check bucket exists and has proper permissions
   - Review MinIO access credentials

4. **Database connection issues**:
   - Verify DATABASE_URL is correct
   - Check PostgreSQL container is running
   - Review database logs

### Emergency Rollback

```bash
# Stop current deployment
docker-compose -f docker-compose.dokploy.yml down

# Restore previous version
git checkout [previous-commit-hash]
docker-compose -f docker-compose.dokploy.yml up -d
```

## 📞 Support Contacts

- **Technical Issues**: iradwatkins@gmail.com
- **Dokploy Support**: Through Dokploy dashboard
- **Server Access**: root@72.60.28.175

## ✅ Launch Checklist

Before going live:

- [ ] All integration tests pass
- [ ] Payment processing works (test mode)
- [ ] Email notifications work
- [ ] File uploads work
- [ ] Database migrations complete
- [ ] SSL certificate active
- [ ] Domain properly configured
- [ ] N8N workflows configured
- [ ] Backup strategy in place
- [ ] Monitoring configured

## 🎉 Post-Launch

1. Switch Square from sandbox to production mode
2. Monitor application logs for first 24 hours
3. Set up automated backups
4. Configure uptime monitoring
5. Create admin user accounts
