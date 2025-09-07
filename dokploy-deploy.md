# Dokploy Deployment Guide for GangRun Printing

## 🚀 DEPLOYMENT INSTRUCTIONS (MUST USE DOKPLOY UI)

### Step 1: Access Dokploy
- URL: http://72.60.28.175:3000
- Login with your Dokploy credentials

### Step 2: Create/Access gangrunprinting Project
1. Go to Projects section
2. Find or create "gangrunprinting" project
3. Enter the project

### Step 3: Create PostgreSQL Service
1. Click "Add Service"
2. Select "PostgreSQL" template
3. Configure:
   - Name: `gangrun-postgres`
   - Database: `gangrun_db`
   - User: `gangrun_user`
   - Password: `GangRun2024Secure!`
   - Port: 5432
4. Deploy the service

### Step 4: Create MinIO Service
1. Click "Add Service"
2. Select "MinIO" template
3. Configure:
   - Name: `gangrun-minio`
   - Root User: `gangrun_admin`
   - Root Password: `GangRunMinio2024!`
   - Port: 9000
   - Console Port: 9001
4. Deploy the service

### Step 5: Create Main Application
1. Click "Add Application"
2. Select "Git" deployment
3. Configure:
   - Repository: https://github.com/iradwatkins/gangrunprinting.git
   - Branch: main
   - Build Mode: Dockerfile
   - Port: 3000

### Step 6: Environment Variables (Set in Dokploy UI)
```env
# Database (use internal Dokploy network names)
DATABASE_URL=postgresql://gangrun_user:GangRun2024Secure!@gangrun-postgres:5432/gangrun_db

# NextAuth
NEXTAUTH_URL=https://gangrunprinting.com
NEXTAUTH_SECRET=generate-a-64-character-secret-here
AUTH_SECRET=same-as-nextauth-secret

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Square Payments
SQUARE_ACCESS_TOKEN=EAAAlxUo1UKk1Lin6wHkpILz-NgqN0-OiNMWN9LBAK-axvt4gmBUCKw8PW1HZeJD
SQUARE_ENVIRONMENT=production
SQUARE_LOCATION_ID=LWMA9R9E2ENXP
SQUARE_APPLICATION_ID=sq0idp-AJF8fI5VayKCq9veQRAw5g
SQUARE_WEBHOOK_SIGNATURE_KEY=your-webhook-signature

# SendGrid Email
SENDGRID_API_KEY=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
SENDGRID_FROM_EMAIL=support@gangrunprinting.com
SENDGRID_FROM_NAME=GangRun Printing

# MinIO (use internal Dokploy network names)
MINIO_ENDPOINT=gangrun-minio
MINIO_PORT=9000
MINIO_ACCESS_KEY=gangrun_admin
MINIO_SECRET_KEY=GangRunMinio2024!
MINIO_USE_SSL=false
MINIO_BUCKET_NAME=gangrun-files

# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://gangrunprinting.com
```

### Step 7: Domain Configuration
1. Go to "Domains" section in the application
2. Add domain: `gangrunprinting.com`
3. Enable SSL (Let's Encrypt)
4. Configure path: `/`

### Step 8: Post-Deployment Tasks
1. **Run Database Migrations**:
   - Access application terminal in Dokploy
   - Run: `npx prisma migrate deploy`
   - Run: `npx prisma db seed` (if seed script exists)

2. **Create MinIO Bucket**:
   - Access MinIO console at port 9001
   - Create bucket: `gangrun-files`
   - Set bucket policy to public-read for uploads

3. **Configure Square Webhooks**:
   - Go to Square Dashboard
   - Set webhook URL: https://gangrunprinting.com/api/webhooks/square
   - Enable order and payment events

### Step 9: Health Checks
1. Test application: https://gangrunprinting.com
2. Test API health: https://gangrunprinting.com/api/health
3. Verify database connection
4. Test file upload to MinIO
5. Send test email through SendGrid

## ⚠️ IMPORTANT REMINDERS
- **NEVER** use docker commands directly
- **ALWAYS** use Dokploy UI for all changes
- **NEVER** modify containers outside of Dokploy
- All services must be created through Dokploy's interface
- Use Dokploy's built-in logging and monitoring

## 🔍 Troubleshooting
- Check Dokploy logs for each service
- Verify network connectivity between services
- Ensure all environment variables are set
- Check that domains are properly configured
- Verify SSL certificates are active

## 📞 Support
- Dokploy Issues: Check Dokploy UI logs
- Application Issues: Check application logs in Dokploy
- Database Issues: Check PostgreSQL service logs
- File Upload Issues: Check MinIO service logs