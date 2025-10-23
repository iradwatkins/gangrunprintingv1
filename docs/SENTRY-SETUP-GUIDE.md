# Sentry Production Monitoring Setup Guide

## ✅ Current Status

**Sentry is fully configured and ready to use!** All code is in place with enterprise features:

- ✅ Error tracking with filtering
- ✅ Performance monitoring (10% sample rate in production)
- ✅ Session tracking (release health)
- ✅ Custom breadcrumbs for debugging
- ✅ API route tracking
- ✅ User context tracking
- ✅ Performance metrics
- ✅ Error filtering (excludes hydration errors, chunk load errors, etc.)

## 🚀 Quick Start (5 Minutes)

### Step 1: Create Sentry Account

1. Go to [sentry.io](https://sentry.io)
2. Sign up for free account
3. Create new project:
   - Platform: **Next.js**
   - Project name: **gangrunprinting-production**
   - Alert frequency: **On every new issue**

### Step 2: Get Your DSN

After creating the project, Sentry will show you a DSN like:

```
https://abc123def456@o1234567.ingest.sentry.io/9876543
```

### Step 3: Configure Environment Variables

Edit `.env` file and uncomment/update these lines:

```bash
# Sentry Configuration
NEXT_PUBLIC_SENTRY_DSN=https://YOUR_DSN_HERE@o1234567.ingest.sentry.io/9876543
SENTRY_ORG=gangrunprinting
SENTRY_PROJECT=gangrunprinting-production
SENTRY_ENVIRONMENT=production

# Optional: For source map uploads (get from Sentry Settings > Auth Tokens)
SENTRY_AUTH_TOKEN=your_auth_token_here
```

### Step 4: Restart Application

```bash
# If using Docker
docker-compose restart app

# If using PM2
pm2 restart gangrunprinting

# If using npm run dev
# Just restart the dev server
```

### Step 5: Verify It's Working

1. Visit any page on your site
2. Go to Sentry dashboard
3. Check "Issues" tab - you should see "Sentry initialized successfully" in breadcrumbs
4. Test error tracking by visiting `/api/test-sentry-error` (you can create this endpoint)

## 📊 What You'll Get

### Real-Time Error Tracking

- Instant alerts when errors occur
- Full stack traces with source maps
- User context (who experienced the error)
- Browser/OS information
- Breadcrumb trail (what user did before error)

### Performance Monitoring

- API route response times
- Database query performance
- Frontend load times
- Transaction traces

### Release Health

- Crash-free user sessions
- Deploy tracking
- Release comparisons

## 🎯 Already Integrated Features

### 1. Global Error Boundary

All React errors are automatically caught and sent to Sentry.

### 2. API Error Tracking

API routes automatically track errors with full context:

```typescript
// Already done in your API routes
try {
  // API logic
} catch (error) {
  reportError(error, { route: '/api/checkout', method: 'POST' })
  throw error
}
```

### 3. User Context

When users sign in, Sentry tracks:

- User ID
- Email
- Role (CUSTOMER, ADMIN, etc.)

### 4. Custom Business Events

Track important business metrics:

```typescript
// Already integrated
reportBusinessError('Payment failed', 'error', {
  amount: 100.5,
  paymentMethod: 'square',
  customerId: 'cust_123',
})
```

### 5. Performance Tracking

Monitor slow operations:

```typescript
// Already in your code
recordPerformance('checkout_flow', duration, success)
```

## 🔍 Monitoring Dashboard

Once enabled, you'll see:

1. **Issues Tab**: All errors with frequency, affected users
2. **Performance Tab**: Slow transactions, API calls
3. **Releases Tab**: Health of each deployment
4. **Alerts**: Configured to notify on every new issue

## 💰 Pricing

Sentry Free Tier includes:

- 5,000 errors/month
- 10,000 performance units/month
- 1,000 replay sessions/month
- Unlimited team members
- **This is plenty for most businesses**

Paid plans start at $26/month if you need more.

## 🎨 Recommended Sentry Settings

### Alert Rules

Create these alerts in Sentry:

1. **Critical Errors**
   - Condition: New issue appears
   - Action: Email immediately
   - For: Payment errors, checkout errors

2. **High Error Rate**
   - Condition: > 50 errors in 1 hour
   - Action: Email + Slack
   - For: Any route

3. **Performance Degradation**
   - Condition: P95 response time > 2 seconds
   - Action: Email
   - For: API routes

### Ignore Rules

Already configured in code to filter:

- ✅ ResizeObserver errors (browser quirk)
- ✅ Hydration warnings (non-critical)
- ✅ ChunkLoadError (retry handles it)

## 🔧 Advanced Features (Optional)

### Source Maps Upload

For production, upload source maps so you see original code in stack traces:

```bash
# Automatically done in build if SENTRY_AUTH_TOKEN is set
npm run build
```

### Session Replay

Record user sessions when errors occur:

1. Go to Sentry Project Settings
2. Enable "Session Replay"
3. See exactly what user did before error

### Custom Dashboards

Create dashboards for:

- Payment success rate
- Order completion rate
- API endpoint health
- User satisfaction (based on errors)

## 📈 Success Metrics

After enabling, track:

1. **Error Rate**: Should be < 0.1% of requests
2. **Mean Time to Detection (MTTD)**: Instant with Sentry
3. **Mean Time to Resolution (MTTR)**: Track how fast you fix issues
4. **Release Health**: 99%+ crash-free sessions

## 🚨 Troubleshooting

### Sentry Not Sending Events

1. Check DSN is set: `echo $NEXT_PUBLIC_SENTRY_DSN`
2. Check logs: `docker logs gangrunprinting_app | grep Sentry`
3. Verify environment: Should see "Sentry initialized successfully"

### Too Many Events

If you hit limits:

1. Reduce `tracesSampleRate` in `src/lib/sentry.ts` (currently 10%)
2. Add more filters in `beforeSend` function
3. Upgrade to paid plan

### Missing Stack Traces

- Make sure `SENTRY_AUTH_TOKEN` is set
- Verify source maps uploaded: Check Sentry > Settings > Source Maps

## ✅ Post-Setup Checklist

After setup, verify:

- [ ] Can see errors in Sentry dashboard
- [ ] Email alerts configured
- [ ] Source maps uploaded (stack traces readable)
- [ ] User context showing (user email/ID)
- [ ] Performance data appearing
- [ ] Release health tracking enabled

## 📚 Resources

- [Sentry Next.js Docs](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Performance Monitoring](https://docs.sentry.io/product/performance/)
- [Alert Rules](https://docs.sentry.io/product/alerts/)
- [Session Replay](https://docs.sentry.io/product/session-replay/)

## 🎉 You're Done!

Once configured, Sentry will:

- ✅ Catch all production errors
- ✅ Track performance issues
- ✅ Monitor release health
- ✅ Alert you immediately when problems occur
- ✅ Help you fix issues faster

**Your website will now have enterprise-grade monitoring!**
