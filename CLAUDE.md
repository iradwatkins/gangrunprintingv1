# CLAUDE.md - AI Assistant Instructions

## 🔴 CRITICAL DEPLOYMENT RULES

### **DOCKER COMPOSE DEPLOYMENT ONLY - NO EXCEPTIONS**

### **FORBIDDEN TECHNOLOGIES: Dokploy, Clerk, Convex, Supabase**

### **USE NATIVE TECH STACK: Next.js + Lucia Auth + Prisma + PostgreSQL**

---

## 🔒 EXCLUSIVE PORT ALLOCATION (October 14, 2025)

### **GANGRUNPRINTING.COM - 5 DEDICATED PORTS - DOCKER DEPLOYMENT**

**🎯 YOUR EXCLUSIVE PORTS - LOCKED AND RESERVED PERMANENTLY:**

| Port | Service | Purpose | Container Name | Status |
|------|---------|---------|----------------|--------|
| **3020** | Next.js App | Main website (external) | gangrunprinting_app | ✅ ACTIVE |
| **5435** | PostgreSQL | Database | gangrunprinting-postgres | ✅ ACTIVE |
| **6302** | Redis | Cache/Sessions | gangrunprinting-redis | ✅ ACTIVE |
| **9002** | MinIO API | File storage | gangrunprinting-minio | ✅ ACTIVE |
| **9102** | MinIO Console | Storage admin | gangrunprinting-minio | ✅ ACTIVE |

**🐳 DOCKER PORT MAPPING:**
- App container: `3020:3002` (external:internal)
- Internal port 3002 stays the same inside container
- Nginx proxies `gangrunprinting.com` → `localhost:3020`
- **CRITICAL: Port 3002 on host CANNOT be used** - Docker containers exit immediately (status 0) when mapped to host port 3002
- **Verified Issue (Oct 20, 2025)**: Unknown conflict on host port 3002 causes container instability
- **Port 3020 is MANDATORY** - Do NOT attempt to change this mapping to 3002:3002

**🛡️ PROTECTION LEVEL: MAXIMUM**
- These 5 ports are EXCLUSIVELY for gangrunprinting.com
- NO other service can use these ports
- Documented in `/root/PORT_MANAGEMENT_KEY.md`
- Documented in `/root/GANGRUNPRINTING-EXCLUSIVE-PORTS.md`
- Enforced via Docker Compose isolation

**💡 DEPLOYMENT RULES:**
- **ALWAYS** use these exact ports in docker-compose.yml
- **ALWAYS** use these exact container names
- **NEVER** share ports with other services
- **NEVER** use port 3000 (globally forbidden)
- Port 3002 on host has auto-restart conflict - use port 3020 instead

**📋 Quick Reference:**
```bash
# View complete port allocation
cat /root/GANGRUNPRINTING-EXCLUSIVE-PORTS.md

# View system port registry
cat /root/PORT_MANAGEMENT_KEY.md
```

---

## 💰 CRITICAL MEMORY NOTE - PRICING SYSTEM (October 5, 2025)

### 🚨 MANDATORY REFERENCE BEFORE ANY PRICING CHANGES

**IF PRICING STRUCTURE IS GOING BAD OR YOU NEED TO MODIFY PRICING LOGIC:**

**YOU MUST READ THIS DOCUMENT FIRST:**
📄 **[PRICING-REFERENCE.md](/root/websites/gangrunprinting/docs/PRICING-REFERENCE.md)**

### The Golden Formula (DO NOT CHANGE):

```
FINAL PRICE = (Base Product × Turnaround Multiplier) + All Addons

WHERE:
- piece = quantity (ALWAYS)
- Turnaround multiplier applies to BASE ONLY
- Addons calculated AFTER turnaround
- Percentage addons apply to (Base × Turnaround)
```

### Critical Rules (NEVER VIOLATE):

1. **Order of Calculation:**
   - Step 1: Calculate Base Product Price
   - Step 2: Apply Turnaround Multiplier to BASE
   - Step 3: Calculate Addon Costs
   - Step 4: Add Addons to (Base × Turnaround)

2. **Turnaround Multipliers (Database):**
   - Economy: 1.1 (10% markup)
   - Fast: 1.3 (30% markup)
   - Faster: 1.5 (50% markup)
   - Crazy Fast: 2.0 (100% markup)

3. **Frontend Display:**
   - Each turnaround option MUST show: `(Base × Turnaround) + Addons`
   - Prices MUST update when addons selected/deselected
   - "Add to Cart" button MUST match selected turnaround price

### If You Break Pricing:

1. **Stop immediately**
2. **Read [PRICING-REFERENCE.md](/root/websites/gangrunprinting/docs/PRICING-REFERENCE.md)**
3. **Compare your changes against documented formulas**
4. **Run test script:** `npx tsx scripts/test-addon-pricing.ts`
5. **Verify in browser, not just backend**

### Related Documentation:

- 📄 [PRICING-REFERENCE.md](/root/websites/gangrunprinting/docs/PRICING-REFERENCE.md) - Complete pricing bible
- 📄 [PRODUCT-OPTIONS-SAFE-LIST.md](/root/websites/gangrunprinting/docs/PRODUCT-OPTIONS-SAFE-LIST.md) - All 18 addons
- 🧪 [test-addon-pricing.ts](/root/websites/gangrunprinting/scripts/test-addon-pricing.ts) - Automated tests

---

## 🔒 MANDATORY UI PATTERN: CREATE PRODUCT PAGE (October 13, 2025)

### **CRITICAL - THIS PATTERN IS LOCKED AND CANNOT BE CHANGED**

**User Statement:** "this create a product interface is mandatory to be used. You cannot change from this type of create a product interface. It works perfectly. Put this as a mandatory, must visually look like this."

### The Pattern

**File:** `/src/app/admin/products/new/page.tsx`
**Visual Reference:** `.aaaaaa/cargo/ilikethis.png` (✅ CORRECT)
**Anti-Pattern:** `.aaaaaa/cargo/idontlikethis.png` (❌ NEVER USE)

### Must Follow

1. ✅ **Clean Card-based layout** - Each section in a `<Card>` component
2. ✅ **Simple Select dropdowns** - For all configuration options
3. ✅ **Inline preview badges/pills** - Show selected items immediately
4. ✅ **Minimal text** - Concise helper text only
5. ✅ **Match Edit Product page** - Visually identical to `/admin/products/[id]/edit`

### Forbidden

1. ❌ **Custom complex components** - No ProductSpecifications, ProductDesignOptions, ProductAdditionalOptions
2. ❌ **Progress bars or workflow indicators** - No completion percentages or step circles
3. ❌ **Configuration summary boxes** - No alert-style summary panels
4. ❌ **"How it works" information boxes** - No verbose explanatory panels
5. ❌ **Purple accent colors** - Use default primary (orange/coral)

### If Asked To Modify

1. **STOP** - Read `/docs/MANDATORY-CREATE-PRODUCT-UI-PATTERN.md` first
2. **CHECK** - Does request violate the mandatory pattern?
3. **ASK** - Get explicit user approval if deviation needed
4. **DOCUMENT** - Update both docs if change approved

**Full Documentation:** `/docs/MANDATORY-CREATE-PRODUCT-UI-PATTERN.md`

---

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
- **File Storage**: MinIO (Docker container)
- **Email**: Resend
- **Deployment**: Docker Compose (October 14, 2025)
- **Port**: 3020 external / 3002 internal for gangrunprinting.com

## 🔧 DEPLOYMENT METHOD

### **MANDATORY: Use Docker Compose for ALL deployments**

- **ALWAYS** use docker-compose.yml for deployment
- **ALWAYS** deploy on port 3020 (external) / 3002 (internal container)
- **ALWAYS** use PostgreSQL database (Docker container on port 5435)
- **ALWAYS** use Lucia Auth for authentication
- **ALWAYS** use MinIO for file storage (Docker container on ports 9002/9102)
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
- **MANDATORY: Deploy on port 3020 (external) / 3002 (internal)**
- **MANDATORY: Use dedicated PostgreSQL Docker container on port 5435**
- **MANDATORY: Use dedicated MinIO Docker container on ports 9002/9102**
- Create isolated Docker containers via docker-compose
- Use separate database instances (dedicated PostgreSQL container)
- Configure unique ports to avoid conflicts
- Test file uploads with: `node test-minio-docker.js`

## DEPLOYMENT CHECKLIST

- [x] Use Docker Compose deployment ✅ (October 14, 2025)
- [x] Create dedicated PostgreSQL container (port 5435) ✅
- [x] Migrate data to new PostgreSQL ✅
- [x] Configure MinIO bucket for GangRun Printing ✅
- [x] Test file uploads (customer & product images) ✅
- [ ] Set up N8N webhooks for automation
- [ ] Configure Ollama for AI chat support
- [x] Ensure complete isolation from SteppersLife.com ✅
- [x] Deploy on port 3020 (external) / 3002 (internal) ✅

**Docker Deployment Commands:**
```bash
# Start all containers
docker-compose up -d

# Check container status
docker ps | grep gangrun

# View logs
docker logs --tail=50 gangrunprinting_app

# Test file uploads
node test-minio-docker.js

# Restart services
docker-compose restart app
```

## VPS CREDENTIALS

- SSH: root@72.60.28.175
- Password: Bobby321&Gloria321Watkins?
- N8N: Pre-installed (port 5678)
- Ollama: Pre-installed (port 11434)

## SERVICE ARCHITECTURE

- **GangRun Printing**: Isolated Docker Compose stack (DEPLOYED October 14, 2025)
  - Next.js application (port 3020 external / 3002 internal)
  - PostgreSQL database (dedicated container on port 5435)
  - MinIO file storage (dedicated container on ports 9002/9102)
  - Redis for caching/sessions (dedicated container on port 6302)
  - All services connected via `gangrun_network` bridge
  - Data migrated successfully from stores-postgres
  - File uploads tested and working ✅
- **Shared Services**: Use existing services
  - N8N (workflow automation on port 5678)
  - Ollama (AI services on port 11434)

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

## 🚫 CRITICAL PRIORITY RULES (October 10, 2025)

### **200 CITY PRODUCTS - FORBIDDEN TO DISCUSS UNTIL ALL ELSE COMPLETE**

**RULE:** It is **ABSOLUTELY FORBIDDEN** to ask about, mention, suggest, or work on the 200 City Products feature until **EVERYTHING ELSE** is complete.

**Prohibited Actions:**

- ❌ Asking "should I work on city products?"
- ❌ Mentioning city products in priority lists
- ❌ Suggesting city products as next task
- ❌ Building city product generation scripts
- ❌ ANY discussion of 200 Cities feature

**Required Behavior:**

- ✅ Work on ALL other tasks first (ChatGPT feed, schema markup, E-E-A-T, FunnelKit, etc.)
- ✅ Only mention 200 Cities when user explicitly brings it up
- ✅ Treat 200 Cities as lowest priority until user says otherwise

**Reference:** See [BMAD-EXECUTION-REPORT-2025-10-10.md](docs/BMAD-EXECUTION-REPORT-2025-10-10.md) for full context

**Enforcement:** This is a **HARD RULE** - violating it wastes user's time.

---

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

## 🎓 CODE QUALITY PRINCIPLES (October 18, 2025)

### **DRY (Don't Repeat Yourself) + SoC (Separation of Concerns)**

**MANDATORY: Apply these principles to ALL new code**

**DRY Principle:**
- ✅ Extract shared logic into utilities/base classes
- ✅ Single source of truth for all functionality
- ❌ Never duplicate code across components
- ❌ Never copy-paste without extracting to shared function

**SoC Principle:**
- ✅ Separate business logic from UI components
- ✅ Separate provider-specific logic from infrastructure (error handling, logging)
- ✅ Each module has ONE clear responsibility
- ❌ Never mix concerns (e.g., API calls + UI rendering in same file)

**Reference Documentation:**
- [BMAD-ROOT-CAUSE-ANALYSIS-SHIPPING-PAYMENTS-2025-10-18.md](docs/BMAD-ROOT-CAUSE-ANALYSIS-SHIPPING-PAYMENTS-2025-10-18.md)
- [CRITICAL-FIXES-SHIPPING-PAYMENTS-2025-10-18.md](CRITICAL-FIXES-SHIPPING-PAYMENTS-2025-10-18.md)

---

## 🚨 CRITICAL: SQUARE PAYMENT CONFIGURATION (October 18, 2025)

### **Cash App Pay + Square Card - Environment Variables**

**MANDATORY: All Square integrations require BOTH backend + frontend variables**

**Backend Only (NO NEXT_PUBLIC_ prefix):**
```bash
SQUARE_ACCESS_TOKEN=EAAAxxxxxxxxx          # Secret - server-side only
SQUARE_WEBHOOK_SIGNATURE=wh_xxxxxx        # Secret - webhook verification
```

**Frontend Required (MUST have NEXT_PUBLIC_ prefix):**
```bash
NEXT_PUBLIC_SQUARE_APPLICATION_ID=sq0idp-xxxxxxxxx
NEXT_PUBLIC_SQUARE_LOCATION_ID=Lxxxxxxxxx
NEXT_PUBLIC_SQUARE_ENVIRONMENT=sandbox
```

**Why This Matters:**
- Next.js ONLY exposes `NEXT_PUBLIC_*` variables to browser
- Cash App Pay runs in browser, not server
- Missing `NEXT_PUBLIC_` prefix = undefined values = integration fails
- Symptom: "Cash App Pay is not available for this merchant"

**Reference:** [BMAD-ROOT-CAUSE-ANALYSIS-SHIPPING-PAYMENTS-2025-10-18.md](docs/BMAD-ROOT-CAUSE-ANALYSIS-SHIPPING-PAYMENTS-2025-10-18.md)

---

## 🚨 CRITICAL: SOUTHWEST CARGO SHIPPING (October 18, 2025)

### **Southwest Cargo - Database-Driven Architecture**

**MANDATORY: Southwest Cargo uses DATABASE for airport data**

**Correct Implementation:**
- ✅ **Active File:** `/src/lib/shipping/modules/southwest-cargo/provider.ts`
- ✅ **Airport Data:** Database table `Airport` (82 airports)
- ✅ **Seed Script:** `npx tsx src/scripts/seed-southwest-airports.ts`
- ✅ **API Endpoint:** `/api/airports` (returns all active airports)

**FORBIDDEN:**
- ❌ **Dead Code Removed:** `~/src/lib/shipping/providers/southwest-cargo.ts~` (DELETED October 18, 2025)
- ❌ **Never use hardcoded arrays** for airport data
- ❌ **Never create duplicate provider files**

**If Southwest "repeatedly has problems":**
1. Check for duplicate files in `/src/lib/shipping/providers/`
2. Verify imports use `/modules/southwest-cargo` not `/providers/`
3. Verify airports seeded: `SELECT COUNT(*) FROM "Airport" WHERE operator='Southwest Cargo'` (should return 82)
4. Run seed if needed: `npx tsx src/scripts/seed-southwest-airports.ts`

**Reference:** [FIX-SOUTHWEST-AIRPORTS-NOT-DISPLAYING.md](FIX-SOUTHWEST-AIRPORTS-NOT-DISPLAYING.md)

---

## REMEMBER

- **NEVER** touch SteppersLife.com or any of its resources
- **NEVER** use Dokploy, Clerk, Convex, or Supabase
- **NEVER** ask about or suggest 200 City Products until all else complete (see Critical Priority Rules)
- **NEVER** duplicate code - apply DRY principle (see Code Quality Principles above)
- **ALWAYS** use Docker Compose for deployments
- **ALWAYS** use the existing Lucia Auth implementation
- **ALWAYS** ensure isolation from existing applications
- **ALWAYS** follow server component pattern for data fetching
- **ALWAYS** use validateRequest() for authentication
- **ALWAYS** apply DRY + SoC principles to new code (see Code Quality Principles above)
- **ALWAYS** use database-driven Southwest Cargo provider (see Southwest Cargo section above)
- **ALWAYS** add `NEXT_PUBLIC_` prefix for browser-accessible env vars (see Square Payment Configuration above)
- **ALWAYS** test in real browser before deploying (see [Deployment Checklist](./DEPLOYMENT-PREVENTION-CHECKLIST-BMAD.md))
- **ALWAYS** verify React hydration with Chrome DevTools
- **ALWAYS** run E2E test suite before production deployments ([test-e2e-customer-journey.js](./test-e2e-customer-journey.js))
- **ALWAYS** check [CRITICAL-SEED-DATA-PROTECTION-BMAD-AUDIT.md](docs/CRITICAL-SEED-DATA-PROTECTION-BMAD-AUDIT.md) before deleting any seed data

## 🔍 TROUBLESHOOTING CHECKLIST - CHECK THIS FIRST!

### 0. Cash App Pay Not Working (October 18, 2025)

- **SYMPTOM**: Cash App button never appears / shows error "not available for this merchant"
- **CHECK**: Are `NEXT_PUBLIC_SQUARE_*` variables set in `.env`?
- **CHECK**: Run `grep NEXT_PUBLIC_SQUARE .env` - should show 3 variables
- **FIX**: Add to `.env`:
  ```bash
  NEXT_PUBLIC_SQUARE_APPLICATION_ID=sq0idp-YOUR_APP_ID
  NEXT_PUBLIC_SQUARE_LOCATION_ID=LYOUR_LOCATION_ID
  NEXT_PUBLIC_SQUARE_ENVIRONMENT=sandbox
  ```
- **TEST**: Restart dev server, go to `/checkout`, verify Cash App button appears
- **DOCS**: See [BMAD-ROOT-CAUSE-ANALYSIS-SHIPPING-PAYMENTS-2025-10-18.md](docs/BMAD-ROOT-CAUSE-ANALYSIS-SHIPPING-PAYMENTS-2025-10-18.md)

### 1. Southwest Cargo Unreliable / "Repeatedly Having Problems" (October 18, 2025)

- **SYMPTOM**: Southwest shipping rates intermittently fail or don't appear
- **CHECK**: Are there duplicate provider files? `ls src/lib/shipping/providers/southwest*`
- **FIX**: Should return "No such file" (duplicates deleted October 18, 2025)
- **CHECK**: Is import correct? `grep "from.*southwest" src/lib/shipping/module-registry.ts`
- **FIX**: Should import from `./modules/southwest-cargo` NOT `./providers/southwest-cargo`
- **DOCS**: See [CRITICAL-FIXES-SHIPPING-PAYMENTS-2025-10-18.md](CRITICAL-FIXES-SHIPPING-PAYMENTS-2025-10-18.md)

### 2. Southwest Airport Selector - No Airports Displaying (October 18, 2025)

- **SYMPTOM**: Airport dropdown shows "No airport pickup locations are currently available"
- **CHECK**: Are airports seeded? `psql $DATABASE_URL -c "SELECT COUNT(*) FROM \"Airport\""`
- **FIX**: Should return 82. If not, run: `npx tsx src/scripts/seed-southwest-airports.ts`
- **TEST**: API should return airports: `curl http://localhost:3020/api/airports | jq .count`
- **DOCS**: See [FIX-SOUTHWEST-AIRPORTS-NOT-DISPLAYING.md](FIX-SOUTHWEST-AIRPORTS-NOT-DISPLAYING.md)

### 3. Upload Errors (ERR_CONNECTION_CLOSED)

- **SYMPTOM**: File uploads fail immediately with connection closed
- **CHECK**: Is PM2 configured with 2G memory? `pm2 show gangrunprinting | grep max_memory`
- **CHECK**: Does middleware.ts have keep-alive headers?
- **CHECK**: Is upload route timeout set to 60 seconds?
- **FIX**: Run `pm2 delete gangrunprinting && pm2 start ecosystem.config.js`
- **TEST**: Run `node test-upload.js` to verify
- **DOCS**: See `/docs/CRITICAL-FIX-UPLOAD-ERR-CONNECTION-CLOSED.md`

### 4. Page Not Loading / 404 Errors

- **CHECK**: Are there backup/debug files in the route directory?
- **ACTION**: Remove ALL files except `page.tsx` from `/app/` route directories
- **FILES TO DELETE**: `*-backup.tsx`, `*-debug.tsx`, `*-broken.tsx`, `*-fixed.tsx`
- **NEVER**: Leave multiple `.tsx` files in route directories

### 5. Before Creating New Pages

- **FIRST**: Check if existing page just needs cleanup
- **INVESTIGATE**: Look for duplicate files causing conflicts
- **CLEAN**: Remove backup files before diagnosing "broken" pages

### 6. Next.js Route Conflicts

- **SYMPTOM**: Page returns 404 but file exists
- **CAUSE**: Multiple `.tsx` files in same route directory
- **FIX**: Keep only the main `page.tsx` file

# important-instruction-reminders

Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (\*.md) or README files. Only create documentation files if explicitly requested by the User.
