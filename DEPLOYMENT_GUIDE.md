# GangRun Printing - Production Deployment Guide

## 🚀 Quick Start Deployment Steps

### Step 1: Prepare for Deployment

1. **Commit and push your changes:**
```bash
git add .
git commit -m "Production-ready configuration with fixed Square API and environment variables"
git push origin main
```

### Step 2: Deploy via Dokploy

1. **Access Dokploy Dashboard:**
   - Navigate to: https://72.60.28.175:3000
   - Login with your admin credentials

2. **Create/Update GangRun Printing Application:**
   - Go to Projects → gangrunprinting
   - Click on "Deploy from GitHub"
   - Repository: https://github.com/iradwatkins/gangrunprinting.git
   - Branch: main

3. **Configure Environment Variables in Dokploy:**
   - Copy ALL variables from `.env.production` file
   - Important: Generate a new AUTH_SECRET for production (32+ characters)
   - Important: Get Square webhook signature key from Square dashboard

4. **Deploy the Application:**
   - Click "Deploy" button
   - Wait for build to complete (approx 3-5 minutes)
   - Check logs for any errors

### Step 3: Database Migration

After deployment, run database migrations:

1. In Dokploy, go to your application
2. Open terminal/console
3. Run: `npx prisma migrate deploy`
4. Run: `npx prisma db seed` (for initial data)

### Step 4: Verify Deployment

1. **Check Application Health:**
   - Visit: https://gangrunprinting.com
   - Check: https://gangrunprinting.com/api/health

2. **Test Critical Features:**
   - [ ] Homepage loads correctly
   - [ ] Products page displays items
   - [ ] Cart functionality works
   - [ ] Checkout process initiates
   - [ ] Admin dashboard accessible at /admin
   - [ ] PWA install prompt appears (HTTPS only)
   - [ ] Push notifications permission prompt shows

## 📋 Environment Variables Checklist

Ensure these are set in Dokploy:

### Required Variables:
- [x] DATABASE_URL - PostgreSQL connection string
- [x] AUTH_SECRET - Generate new 32+ char secret
- [x] AUTH_GOOGLE_ID - Google OAuth client ID
- [x] AUTH_GOOGLE_SECRET - Google OAuth secret
- [x] SQUARE_ACCESS_TOKEN - Production token
- [x] SQUARE_LOCATION_ID - Your location ID
- [x] SQUARE_APPLICATION_ID - Your app ID
- [ ] SQUARE_WEBHOOK_SIGNATURE_KEY - Get from Square dashboard
- [x] SENDGRID_API_KEY - Email service key
- [x] NEXT_PUBLIC_VAPID_PUBLIC_KEY - Push notifications
- [x] VAPID_PRIVATE_KEY - Push notifications
- [x] MINIO credentials - Object storage

### Optional Variables:
- [ ] N8N_API_KEY - Workflow automation (configure in N8N)
- [ ] OLLAMA_URL - AI chat support

## 🔧 Post-Deployment Tasks

### Immediate (Production Critical):

1. **Configure Square Webhooks:**
   - Go to Square Dashboard → Webhooks
   - Add endpoint: https://gangrunprinting.com/api/webhooks/square
   - Subscribe to: payment.created, payment.updated, order.updated
   - Copy signature key to SQUARE_WEBHOOK_SIGNATURE_KEY

2. **Set up Domain DNS:**
   - Ensure gangrunprinting.com points to 72.60.28.175
   - Dokploy will handle SSL certificates automatically

3. **Initialize MinIO Buckets:**
   - Access MinIO console at port 9003
   - Create bucket: gangrun-files
   - Set public read policy for product images

### Within 24 Hours:

4. **Configure N8N Workflows:**
   - Access N8N at https://n8n.agistaffers.com
   - Create webhook: /webhook/gangrunprinting
   - Set up order processing workflow
   - Configure email notification triggers

5. **Set up Monitoring:**
   - Configure uptime monitoring for gangrunprinting.com
   - Set up error alerts via email
   - Monitor Square webhook delivery

6. **Complete Admin Features:**
   - Test order management workflow
   - Configure inventory alerts
   - Set up daily sales reports

## 🚨 Troubleshooting

### Database Connection Issues:
```bash
# In Dokploy terminal
psql $DATABASE_URL -c "SELECT 1"
```

### Build Failures:
```bash
# Check build logs in Dokploy
# Or manually build locally:
npm run build
```

### Square Payment Issues:
- Verify SQUARE_ENVIRONMENT is "production"
- Check Square API credentials are for production
- Ensure webhook signature is correct

### Push Notifications Not Working:
- Verify HTTPS is enabled (required for PWA)
- Check VAPID keys are correctly set
- Test at: /api/notifications/test

## 📊 Success Metrics

After deployment, verify:
- [ ] Site loads in under 3 seconds
- [ ] All products display with images
- [ ] Cart persists across sessions
- [ ] Checkout redirects to Square
- [ ] Orders save to database
- [ ] Admin can view orders
- [ ] Email notifications send
- [ ] PWA installs on mobile
- [ ] Push notifications work

## 🔐 Security Checklist

- [ ] Changed all default passwords
- [ ] Generated new AUTH_SECRET
- [ ] Verified HTTPS is enforced
- [ ] Database is not publicly accessible
- [ ] MinIO admin panel is secured
- [ ] Environment variables not in repository
- [ ] Rate limiting configured
- [ ] CORS properly configured

## 📞 Support Contacts

- **Dokploy Issues:** Check Dokploy logs first
- **Square API:** Square Developer Support
- **SendGrid:** Check API key and sender verification
- **Domain/SSL:** Dokploy handles via Let's Encrypt

## 🎯 Next Steps After Deployment

1. **Week 1:** Monitor performance, fix any bugs
2. **Week 2:** Implement customer feedback
3. **Week 3:** Add advanced features (loyalty program, bulk orders)
4. **Month 2:** Optimize based on analytics data

---

**Last Updated:** December 2024
**Deployment Method:** Dokploy (MANDATORY - No direct Docker deployments)
**Production URL:** https://gangrunprinting.com