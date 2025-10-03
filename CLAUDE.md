# CLAUDE.md - AI Assistant Instructions

## 🔴 CRITICAL DEPLOYMENT RULES

### **DOCKER COMPOSE DEPLOYMENT ONLY - NO EXCEPTIONS**

### **FORBIDDEN TECHNOLOGIES: Dokploy, Clerk, Convex, Supabase**

### **USE NATIVE TECH STACK: Next.js + Lucia Auth + Prisma + PostgreSQL**

## 🚫 ABSOLUTELY FORBIDDEN TECHNOLOGIES

- **Dokploy** - Use Docker Compose instead
- **Clerk** - Use Lucia Auth (already implemented)
- **Convex** - Use Next.js API routes + Prisma
- **Supabase** - Use PostgreSQL + Prisma
- **NextAuth.js** - Use Lucia Auth (already implemented)

## ✅ APPROVED TECH STACK

- **Frontend**: Next.js 15 with App Router
- **Backend**: Next.js API routes with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Lucia Auth with Prisma adapter
- **File Storage**: MinIO
- **Email**: Resend
- **Deployment**: Docker Compose
- **Port**: 3002 for gangrunprinting.com

## 🔧 DEPLOYMENT METHOD

### **MANDATORY: Use Docker Compose for ALL deployments**

- **ALWAYS** use docker-compose.yml for deployment
- **ALWAYS** deploy on port 3002
- **ALWAYS** use PostgreSQL database
- **ALWAYS** use Lucia Auth for authentication
- **NEVER** use Dokploy, Clerk, Convex, or Supabase

## SERVER ACCESS RESTRICTIONS

### PRODUCTION SERVER: 72.60.28.175

## 🚫 ABSOLUTELY FORBIDDEN

1. **SteppersLife.com** - DO NOT:
   - Access any files belonging to SteppersLife.com
   - Modify any configurations for SteppersLife.com
   - Touch the SteppersLife.com database
   - Make any changes that could affect SteppersLife.com
   - Even view or read SteppersLife.com files unless explicitly requested

2. **Other Existing Websites**:
   - n8n.agistaffers.com - DO NOT ALTER
   - Any other existing applications - DO NOT ALTER

## ✅ ALLOWED ACTIONS

### Shared Resources You CAN Use:

- **N8N** (port 5678) - Workflow automation (existing service)
- **Ollama** (port 11434) - AI features (existing service)
- **MinIO** - File storage (create new buckets)
- **PostgreSQL** - Create NEW databases only

### Deployment Method:

- **MANDATORY: Use Docker Compose for deployment**
- **MANDATORY: Deploy on port 3002**
- **MANDATORY: Use existing PostgreSQL server for new database**
- Create isolated Docker containers via docker-compose
- Use separate database instances
- Configure unique ports to avoid conflicts

## DEPLOYMENT CHECKLIST

- [ ] Use Docker Compose deployment
- [ ] Create new PostgreSQL database (do not use existing ones)
- [ ] Configure MinIO bucket for GangRun Printing
- [ ] Set up N8N webhooks for automation
- [ ] Configure Ollama for AI chat support
- [ ] Ensure complete isolation from SteppersLife.com
- [ ] Deploy on port 3002

## VPS CREDENTIALS

- SSH: root@72.60.28.175
- Password: Bobby321&Gloria321Watkins?
- N8N: Pre-installed (port 5678)
- Ollama: Pre-installed (port 11434)

## SERVICE ARCHITECTURE

- **GangRun Printing**: Isolated Docker Compose stack on port 3002
  - Next.js application
  - PostgreSQL database (new instance)
  - MinIO file storage (new bucket)
  - Redis for caching/sessions
- **Shared Services**: Use existing services
  - N8N (workflow automation)
  - Ollama (AI services)

## GITHUB REPOSITORY

- https://github.com/iradwatkins/gangrunprinting.git

## STANDARD CONFIGURATIONS

- **Timezone**: Always use America/Chicago for all services
- **Database Naming**: Use descriptive names (e.g., gangrun_production)
- **Password Policy**: Use strong passwords with special characters

## STANDARD CREDENTIALS

- **Username**: iradwatkins
- **Email**: iradwatkins@gmail.com
- **Name**: Ira Watkins
- **Password**: Iw2006js!

## 🎯 BUSINESS MODEL (CRITICAL - READ THIS!)

### **How GangRun Printing Actually Operates:**

**Customer-Facing (What Customers See):**
- We present as a **real, professional printing company** to ALL customers
- 95% retail customers: Regular consumers ordering business cards, flyers, etc.
- 5% broker customers: Print resellers who get category-specific % discounts (because they order in volume)
- Customers place orders, pay, receive tracking updates, and get their printed products
- **NO customer ever knows we use vendor partners** - they see us as their printer

**Behind the Scenes (What We Actually Do):**
- We **coordinate with vendor print shops** for physical production
- Vendors handle: actual printing, quality control, bindery, packaging, and shipping
- We handle: customer service, order management, payment processing, file review, and status tracking
- We do **NOT** operate printing presses or manage physical production equipment
- We focus on the customer experience and logistics, not manufacturing

**Important Terminology:**
- ✅ Use: "printing company", "print shop", "customer orders"
- ❌ Avoid: "print broker workflow" (confusing - makes it sound like we're brokers ourselves)
- ✅ "Broker customers" or "reseller customers" = The 5% who get discounts
- ❌ "Broker workflow" = Wrong - implies we're a broker, not a printing company

**Order Status Workflow:**
- Order statuses reflect the printing process (CONFIRMATION → PRODUCTION → SHIPPED → DELIVERED)
- Even though vendors do the physical work, customers see seamless status updates as if we're printing
- Status: PRODUCTION = "Your order is being printed" (customer doesn't know it's at a vendor)

**Broker Discount System:**
- Database: User.isBroker (boolean flag)
- Database: User.brokerDiscounts (JSONB with category-specific percentages)
- Example: `{"Business Cards": 15, "Flyers": 20, "Brochures": 18}`
- Pricing engine applies these discounts automatically at checkout

## CURRENT AUTHENTICATION SYSTEM

### ✅ Lucia Auth Implementation (Correct)

- **Authentication**: Lucia Auth with Prisma adapter
- **Social Login**: Google OAuth integration
- **Magic Links**: Email-based passwordless authentication
- **Session Management**: Secure cookie-based sessions
- **Database**: User/Session tables in PostgreSQL

## 🚨 CRITICAL: UPLOAD ERR_CONNECTION_CLOSED FIX (2025-09-27)

### **DO NOT MODIFY THESE FILES WITHOUT READING DOCS**

**CRITICAL FILES FOR UPLOADS:**
1. `/middleware.ts` - Contains keep-alive headers (MANDATORY)
2. `/ecosystem.config.js` - 2G memory limit + Node options (MANDATORY)
3. `/src/app/api/products/upload-image/route.ts` - 60s timeout (MANDATORY)

**IF UPLOADS FAIL WITH ERR_CONNECTION_CLOSED:**
```bash
# Quick fix sequence
pm2 delete gangrunprinting
pm2 start ecosystem.config.js
pm2 save
node test-upload.js  # Test uploads
```

**Root Causes Fixed:**
- Next.js App Router 1MB limit → Fixed via middleware headers
- PM2 memory kills → Fixed via 2G limit + node args
- Timeout cascade → Fixed via synchronized 60s timeouts

**Full Documentation:** `/docs/CRITICAL-FIX-UPLOAD-ERR-CONNECTION-CLOSED.md`

## RECENT FIXES & KNOWN ISSUES

### ✅ FIXED: Magic Link Authentication (2025-09-14)

- **Issue**: Magic links failing with "expired" error immediately
- **Root Cause**: Double URL encoding + cookie setting in wrong context
- **Solution**: Created API route handler at `/api/auth/verify`
- **Details**: See `/docs/bmad/fixes/magic-link-authentication-fix.md`

### ✅ FIXED: Product Creation Page Not Loading (2025-09-18)

- **Issue**: `/admin/products/new` returning 404 errors and not loading
- **Symptom**: Page appears completely blank with no console errors
- **Root Cause**: Multiple duplicate/backup files in same route directory causing Next.js routing conflicts
- **Files Found**: `debug-page.tsx`, `fixed-page.tsx`, `page-backup.tsx`, `page-broken-backup.tsx`
- **Solution**: **REMOVE ALL BACKUP FILES** from route directories - keep only `page.tsx`
- **Key Lesson**: Next.js gets confused by multiple `.tsx` files in route directories, even with different names
- **Prevention**: Never leave backup/debug files in `/app/` route directories - move to `/docs/` or delete entirely

## 📊 POST-FIX HEALTH STATUS (2025-09-27)

### **Health Score: 82/100 - PRODUCTION READY ✅**

**Status Summary**:
- ✅ All critical bugs fixed
- ✅ Authentication fully functional
- ✅ Database optimized with proper indexes
- ✅ API endpoints secured with rate limiting
- ✅ Clean TypeScript build with zero errors
- ⚠️ Service layer partially complete (ProductService only)
- ❌ Production monitoring not configured
- ❌ API versioning not implemented

### Key Architectural Patterns to Follow

**1. Server Components for Data Fetching**
```typescript
// ✅ CORRECT - Server component fetches data
export default async function Page() {
  const data = await prisma.model.findMany()
  return <ClientComponent data={data} />
}

// ❌ WRONG - Client component with useEffect fetch
'use client'
export default function Page() {
  useEffect(() => { fetch('/api/...') }, [])
}
```

**2. Authentication Pattern**
```typescript
// Use this pattern in ALL protected routes
const { user, session } = await validateRequest()
if (!user) return unauthorized()
if (user.role !== 'ADMIN') return forbidden()
```

**3. Error Handling**
```typescript
// Server: Detailed logs, client: Generic messages
try {
  // operation
} catch (error) {
  logger.error('Detailed error', { error, context })
  return { error: 'Something went wrong' }
}
```

### Remaining Work (Priority Order)
1. **Complete service layers** (OrderService, UserService)
2. **Set up Sentry monitoring**
3. **Remove .bmad-backup files**
4. **Add API versioning**
5. **Implement comprehensive tests**

### Performance Benchmarks
- API Response: <150ms ✅
- Database Query: <85ms ✅
- Build Time: 1:45 ✅
- Page Load: 2.1s (target: <1.5s)

### Critical Files for Reference
- [Post-Fix Completion Checklist](/docs/POST-FIX-COMPLETION-CHECKLIST.md)
- [Architecture Decisions](/docs/architecture/decisions.md)
- [Remaining Work Stories](/docs/stories/remaining-work.md)

## 🎓 LESSONS LEARNED (October 3, 2025) - CRITICAL

### ⚠️ Issue: Product Configuration Not Loading
**Discovery Date:** October 3, 2025
**Severity:** P0 - Blocked 100% of customer purchases
**Status:** Root cause identified, partial fix implemented, requires completion

#### What Happened
- Automated E2E testing revealed customers could not add products to cart
- Product detail page showed "Loading quantities..." indefinitely
- No "Add to Cart" button appeared
- Complete sales funnel blockage

#### Root Cause
- **Primary:** React client-side hydration failure
- **Secondary:** useEffect hook not executing on client
- **Why:** Next.js 15 App Router SSR/hydration complexity
- **API Status:** Working perfectly (verified)
- **Database Status:** Working perfectly (verified)
- **Issue Location:** Frontend React component hydration only

#### Documentation Created
1. **[ROOT-CAUSE-ANALYSIS-PRODUCT-CONFIGURATION.md](./ROOT-CAUSE-ANALYSIS-PRODUCT-CONFIGURATION.md)** - Complete technical analysis
2. **[WEBSITE-AUDIT-REPORT-2025-10-03.md](./WEBSITE-AUDIT-REPORT-2025-10-03.md)** - Full audit with 5 customer personas
3. **[DEPLOYMENT-PREVENTION-CHECKLIST-BMAD.md](./DEPLOYMENT-PREVENTION-CHECKLIST-BMAD.md)** - Comprehensive pre-deploy checklist
4. **[test-e2e-customer-journey.js](./test-e2e-customer-journey.js)** - Automated E2E test suite

#### Prevention Measures Implemented
- ✅ E2E test suite with Puppeteer (5 customer personas)
- ✅ Deployment prevention checklist (BMAD Method™)
- ✅ Enhanced error logging for React hydration
- ✅ Server-side configuration fetch (partial implementation)
- ✅ Comprehensive root cause documentation

#### Key Takeaways (CRITICAL - READ BEFORE EVERY DEPLOYMENT)
1. **Test in browser, not just curl** - API working ≠ frontend working
2. **Verify React hydration** - Open DevTools, check for hydration errors
3. **Check useEffect executes** - Add console.logs, verify in browser console
4. **Critical paths need SSR** - Move data fetching to server components
5. **Add timeouts everywhere** - Never infinite loading states
6. **Run E2E tests** - Before every production deployment

#### Action Required
**Before Next Deployment:**
- [ ] Complete server-side configuration fetch debugging
- [ ] Verify initialConfiguration prop passes correctly
- [ ] Test complete customer journey in browser
- [ ] Run E2E test suite and verify all 5 personas pass
- [ ] Check React DevTools for hydration status
- [ ] Verify no console errors on product pages

## REMEMBER

- **NEVER** touch SteppersLife.com or any of its resources
- **NEVER** use Dokploy, Clerk, Convex, or Supabase
- **ALWAYS** use Docker Compose for deployments
- **ALWAYS** use the existing Lucia Auth implementation
- **ALWAYS** ensure isolation from existing applications
- **ALWAYS** follow server component pattern for data fetching
- **ALWAYS** use validateRequest() for authentication
- **ALWAYS** test in real browser before deploying (see [Deployment Checklist](./DEPLOYMENT-PREVENTION-CHECKLIST-BMAD.md))
- **ALWAYS** verify React hydration with Chrome DevTools
- **ALWAYS** run E2E test suite before production deployments ([test-e2e-customer-journey.js](./test-e2e-customer-journey.js))

## 🔍 TROUBLESHOOTING CHECKLIST - CHECK THIS FIRST!

### 0. Upload Errors (ERR_CONNECTION_CLOSED)

- **SYMPTOM**: File uploads fail immediately with connection closed
- **CHECK**: Is PM2 configured with 2G memory? `pm2 show gangrunprinting | grep max_memory`
- **CHECK**: Does middleware.ts have keep-alive headers?
- **CHECK**: Is upload route timeout set to 60 seconds?
- **FIX**: Run `pm2 delete gangrunprinting && pm2 start ecosystem.config.js`
- **TEST**: Run `node test-upload.js` to verify
- **DOCS**: See `/docs/CRITICAL-FIX-UPLOAD-ERR-CONNECTION-CLOSED.md`

### 1. Page Not Loading / 404 Errors

- **CHECK**: Are there backup/debug files in the route directory?
- **ACTION**: Remove ALL files except `page.tsx` from `/app/` route directories
- **FILES TO DELETE**: `*-backup.tsx`, `*-debug.tsx`, `*-broken.tsx`, `*-fixed.tsx`
- **NEVER**: Leave multiple `.tsx` files in route directories

### 2. Before Creating New Pages

- **FIRST**: Check if existing page just needs cleanup
- **INVESTIGATE**: Look for duplicate files causing conflicts
- **CLEAN**: Remove backup files before diagnosing "broken" pages

### 3. Next.js Route Conflicts

- **SYMPTOM**: Page returns 404 but file exists
- **CAUSE**: Multiple `.tsx` files in same route directory
- **FIX**: Keep only the main `page.tsx` file

# important-instruction-reminders

Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (\*.md) or README files. Only create documentation files if explicitly requested by the User.
