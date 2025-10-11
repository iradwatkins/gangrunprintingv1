# 🚀 GangRun Printing - Deployment Checklist

**Generated:** 2025-10-02
**Purpose:** Pre-deployment verification for Admin Order Processing System + Customer Orders Page

---

## 📊 Current System State

### What's Built & Documented ✅

- ✅ **Story 5.8:** Admin Order Processing System (complete, documented)
- ✅ **Epic 5:** 90% complete (7 of 8 stories done)
- ⚠️ **Story 4.3:** Customer Orders Page (documented but NOT implemented - stub only)
- ⚠️ **Epic 4:** 80% complete (corrected from 90% - documentation error discovered)

### Critical Production Blockers 🔴

1. **Database migration not run** - Orders have old statuses, admin can't see them
2. **Customer orders page is stub** - Customers can't view orders
3. **Email confirmations not sent** - Webhook flow depends on new statuses

---

## 🎯 Deployment Strategy

### Phase 1: Database Migration (30 min) - IMMEDIATE

**Goal:** Update order statuses to new broker workflow

### Phase 2: Testing & Verification (2 hours) - IMMEDIATE

**Goal:** Verify migration successful, existing orders visible in admin

### Phase 3: Customer Orders Implementation (12-16 hours) - HIGH PRIORITY

**Goal:** Implement Story 4.3 so customers can view orders

### Phase 4: End-to-End Testing (4 hours) - BEFORE NEXT DEPLOY

**Goal:** Verify complete order flow works

---

## Phase 1: Database Migration Checklist

### Pre-Migration Verification

- [ ] **1.1: Check database connection**

  ```bash
  export PGPASSWORD='GangRun2024Secure'
  psql -h 172.22.0.1 -U gangrun_user -d gangrun_db -c "SELECT 1;"
  ```

  Expected: Connection successful

- [ ] **1.2: Verify current order count**

  ```bash
  psql -h 172.22.0.1 -U gangrun_user -d gangrun_db -c "SELECT COUNT(*) FROM \"Order\";"
  ```

  Record count: **\_\_\_**

- [ ] **1.3: Check current order statuses**

  ```bash
  psql -h 172.22.0.1 -U gangrun_user -d gangrun_db -c "SELECT DISTINCT status FROM \"Order\" ORDER BY status;"
  ```

  Expect old statuses: PAID, PRE_PRESS, PRINTING, PAYMENT_FAILED, etc.

- [ ] **1.4: Verify backup directory exists**

  ```bash
  mkdir -p /root/backups
  ls -la /root/backups
  ```

- [ ] **1.5: Check disk space**

  ```bash
  df -h | grep "/$"
  ```

  Need at least 1GB free

- [ ] **1.6: Verify migration files exist**
  ```bash
  ls -la /root/websites/gangrunprinting/migrations/migrate-broker-order-system.sql
  ls -la /root/websites/gangrunprinting/run-migration.sh
  ```

### Run Migration

- [ ] **1.7: Make migration script executable**

  ```bash
  cd /root/websites/gangrunprinting
  chmod +x run-migration.sh
  ```

- [ ] **1.8: Review migration script (optional but recommended)**

  ```bash
  cat migrations/migrate-broker-order-system.sql
  ```

- [ ] **1.9: Run migration**

  ```bash
  ./run-migration.sh
  ```

  **IMPORTANT:** Type "yes" when prompted

- [ ] **1.10: Verify migration output**
      Expected messages:
  - ✓ Database connected successfully
  - ✓ Backup created successfully
  - ✓ Current order statuses: (shows status distribution)
  - ✓ Migration completed successfully

### Post-Migration Verification

- [ ] **1.11: Verify new order statuses exist**

  ```bash
  psql -h 172.22.0.1 -U gangrun_user -d gangrun_db -c "
    SELECT typname, enumlabel FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE typname = 'OrderStatus'
    ORDER BY enumsortorder;
  "
  ```

  Expect 13 broker statuses:
  - PENDING_PAYMENT
  - PAYMENT_DECLINED
  - CONFIRMATION
  - ON_HOLD
  - PRODUCTION
  - SHIPPED
  - READY_FOR_PICKUP
  - ON_THE_WAY
  - PICKED_UP
  - DELIVERED
  - REPRINT
  - CANCELLED
  - REFUNDED

- [ ] **1.12: Verify orders were migrated**

  ```bash
  psql -h 172.22.0.1 -U gangrun_user -d gangrun_db -c "
    SELECT status, COUNT(*) as count
    FROM \"Order\"
    GROUP BY status
    ORDER BY status;
  "
  ```

  Expect: Old PAID → CONFIRMATION, PRINTING → PRODUCTION, etc.

- [ ] **1.13: Verify no data loss**

  ```bash
  psql -h 172.22.0.1 -U gangrun_user -d gangrun_db -c "SELECT COUNT(*) FROM \"Order\";"
  ```

  Count should match pre-migration count from step 1.2

- [ ] **1.14: Check for specific test order**

  ```bash
  psql -h 172.22.0.1 -U gangrun_user -d gangrun_db -c "
    SELECT id, \"orderNumber\", status, email, total
    FROM \"Order\"
    WHERE \"orderNumber\" = 'GRP-689757';
  "
  ```

  Expect: Status should be CONFIRMATION (was PAID)

- [ ] **1.15: Generate new Prisma client**

  ```bash
  cd /root/websites/gangrunprinting
  npx prisma generate
  ```

  Expected: "Generated Prisma Client"

- [ ] **1.16: Restart application**

  ```bash
  pm2 restart gangrunprinting
  pm2 save
  ```

  Expected: gangrunprinting restarted

- [ ] **1.17: Check application logs**
  ```bash
  timeout 10 pm2 logs gangrunprinting --lines 20
  ```
  Look for errors (should be clean startup)

### Migration Rollback Plan (if needed)

**IF MIGRATION FAILS:**

- [ ] **1.18: Restore from backup**

  ```bash
  # Find backup file
  ls -lt /root/backups/ | head -5

  # Restore (use actual backup filename)
  psql -h 172.22.0.1 -U gangrun_user -d gangrun_db < /root/backups/backup_YYYYMMDD_HHMMSS.sql

  # Verify restoration
  psql -h 172.22.0.1 -U gangrun_user -d gangrun_db -c "SELECT COUNT(*) FROM \"Order\";"
  ```

---

## Phase 2: Testing & Verification

### Admin Dashboard Testing

- [ ] **2.1: Access admin dashboard**
  - Navigate to: https://gangrunprinting.com/admin
  - Login with admin credentials
  - Verify dashboard loads

- [ ] **2.2: Access orders page**
  - Navigate to: https://gangrunprinting.com/admin/orders
  - Verify orders list displays
  - **Critical:** Verify existing orders now appear (GRP-689757)

- [ ] **2.3: Verify order statuses display correctly**
  - Check status badges show new broker statuses
  - Verify color coding works
  - Check status filter dropdown has new statuses

- [ ] **2.4: Test order quick actions**
  - Click on an order's action menu
  - Verify modal opens (don't submit yet)
  - Test: Update Status, Capture Payment, Send Invoice, Add Shipping
  - Close modals without saving

- [ ] **2.5: Open order detail page**
  - Click on an order number
  - Verify detail page loads
  - Check all order information displays correctly

### Database Query Verification

- [ ] **2.6: Verify new tracking fields exist**

  ```bash
  psql -h 172.22.0.1 -U gangrun_user -d gangrun_db -c "\d \"Order\"" | grep -E "filesApproved|vendor|rush|priority"
  ```

  Expect: New columns visible

- [ ] **2.7: Verify indexes were created**
  ```bash
  psql -h 172.22.0.1 -U gangrun_user -d gangrun_db -c "
    SELECT indexname FROM pg_indexes
    WHERE tablename = 'Order'
    ORDER BY indexname;
  "
  ```
  Expect indexes like: Order_status_createdAt_idx, Order_rushOrder_idx, etc.

### Email System Verification

- [ ] **2.8: Check email service configuration**

  ```bash
  cd /root/websites/gangrunprinting
  grep -E "RESEND_API_KEY|SMTP" .env
  ```

  Verify Resend API key is set

- [ ] **2.9: Test email template rendering (optional)**
  - Navigate to email template test page (if exists)
  - Or check template files exist:
    ```bash
    ls -la src/lib/email/templates/
    ```

### Application Health Check

- [ ] **2.10: Check application is running**

  ```bash
  pm2 status gangrunprinting
  ```

  Status should be "online"

- [ ] **2.11: Check memory usage**

  ```bash
  pm2 show gangrunprinting | grep -E "memory|cpu"
  ```

  Memory should be < 1.5GB

- [ ] **2.12: Check for errors in logs**

  ```bash
  pm2 logs gangrunprinting --lines 100 | grep -i error
  ```

  No critical errors expected

- [ ] **2.13: Test homepage loads**

  ```bash
  curl -I https://gangrunprinting.com
  ```

  Expect: HTTP 200

- [ ] **2.14: Test API endpoint**
  ```bash
  curl https://gangrunprinting.com/api/products
  ```
  Expect: JSON response (not 500 error)

---

## Phase 3: Customer Orders Page Implementation

**NOTE:** This phase requires development work (Story 4.3)

### Pre-Implementation Checklist

- [ ] **3.1: Story 4.3 documented**
  - File: `/docs/stories/story-4.3-customer-order-history.md`
  - Status: ✅ Documented

- [ ] **3.2: Assign to developer**
  - Developer: ******\_\_\_******
  - Estimated time: 12-16 hours
  - Sprint: ******\_\_\_******

- [ ] **3.3: Create feature branch**
  ```bash
  git checkout -b feature/story-4.3-customer-orders
  ```

### Implementation Verification (Post-Development)

- [ ] **3.4: Code review completed**
  - Reviewer: ******\_\_\_******
  - Review date: ******\_\_\_******
  - Approved: ☐ Yes ☐ No

- [ ] **3.5: All acceptance criteria met**
  - Review Story 4.3 AC checklist
  - All 20 criteria checked off

- [ ] **3.6: Tests written and passing**
  - Unit tests: ☐ Pass
  - E2E tests: ☐ Pass
  - Test coverage: **\_**% (target: >70%)

- [ ] **3.7: Code follows patterns**
  - Server Component for data fetching ☐
  - Proper error handling ☐
  - Loading states implemented ☐
  - Responsive design ☐

---

## Phase 4: End-to-End Testing

### Complete Order Flow Test

- [ ] **4.1: Place new test order**
  - Navigate to product page
  - Configure product
  - Add to cart
  - Complete checkout
  - Pay with test card
  - Record order number: ******\_\_\_******

- [ ] **4.2: Verify order in customer account**
  - Login as customer who placed order
  - Navigate to `/account/orders`
  - **Critical:** Verify order appears in list
  - Check order status is correct
  - Click order to view details

- [ ] **4.3: Verify order in admin dashboard**
  - Login as admin
  - Navigate to `/admin/orders`
  - Find test order
  - Verify all details correct

- [ ] **4.4: Verify confirmation email sent**
  - Check customer email inbox
  - Verify order confirmation received
  - Check email content is correct
  - Verify links work

- [ ] **4.5: Update order status (admin)**
  - In admin, update test order to PRODUCTION
  - Save changes
  - Verify status updated

- [ ] **4.6: Verify status reflects in customer account**
  - Switch to customer account
  - Refresh orders page
  - Verify status shows PRODUCTION
  - Check order timeline updated

- [ ] **4.7: Test shipping notification**
  - In admin, add tracking number
  - Save shipping info
  - Check customer email for shipping notification

- [ ] **4.8: Complete order flow**
  - Update status to SHIPPED
  - Update status to DELIVERED
  - Verify all emails sent
  - Verify timeline complete

### Filter & Search Testing (Customer Side)

- [ ] **4.9: Test status filter**
  - Filter by DELIVERED
  - Verify only delivered orders shown
  - Try all status filters

- [ ] **4.10: Test date range filter**
  - Filter "Last 7 days"
  - Verify only recent orders shown
  - Try custom date range

- [ ] **4.11: Test search**
  - Search by order number
  - Search by product name
  - Verify results correct

- [ ] **4.12: Test sort**
  - Sort by date (newest/oldest)
  - Sort by amount (high/low)
  - Verify order changes

- [ ] **4.13: Test pagination**
  - If > 10 orders, test next/previous
  - Verify page numbers work
  - Check URL updates

### Performance Testing

- [ ] **4.14: Measure page load times**
  - Homepage: **\_** seconds (target: <2s)
  - Products page: **\_** seconds (target: <2s)
  - Orders page (customer): **\_** seconds (target: <2s)
  - Orders page (admin): **\_** seconds (target: <2s)

- [ ] **4.15: Test with multiple orders**
  - Create 25+ test orders (if possible)
  - Verify pagination works smoothly
  - Check no performance degradation

### Security Testing

- [ ] **4.16: Test authentication**
  - Logout, try to access `/account/orders`
  - Verify redirect to signin
  - Login, verify redirect back

- [ ] **4.17: Test authorization**
  - Customer A tries to view Customer B's order
  - Verify 403/404 error
  - Cannot see other customers' orders

- [ ] **4.18: Test admin access**
  - Non-admin user tries `/admin/orders`
  - Verify redirect or error
  - Only admin can access admin panel

### Error Handling Testing

- [ ] **4.19: Test database error handling**
  - Temporarily break database connection (optional)
  - Verify error message shown
  - Verify app doesn't crash

- [ ] **4.20: Test empty states**
  - New user with no orders → see empty state
  - Filter with no results → see "no results" message
  - Verify no JavaScript errors

---

## 📋 Pre-Deployment Final Checklist

### Code Quality

- [ ] **5.1: TypeScript build passes**

  ```bash
  npm run type-check
  ```

- [ ] **5.2: No console errors**
  - Check browser console on all pages
  - No critical errors

- [ ] **5.3: Prisma schema matches database**

  ```bash
  npx prisma db pull
  git diff prisma/schema.prisma
  ```

  No unexpected changes

- [ ] **5.4: All environment variables set**
  ```bash
  grep -v "^#" .env | grep -E "SQUARE|RESEND|DATABASE"
  ```

### Documentation

- [ ] **5.5: Story 5.8 documented** ✅
- [ ] **5.6: Story 4.3 documented** ✅
- [ ] **5.7: Epic 4 corrected** ✅
- [ ] **5.8: Epic 5 updated** ✅
- [ ] **5.9: Deployment checklist complete** (this document)

### Backups

- [ ] **5.10: Database backup exists**

  ```bash
  ls -lh /root/backups/ | head -3
  ```

- [ ] **5.11: Code backed up to GitHub**
  ```bash
  git status
  git push origin main
  ```

### Monitoring

- [ ] **5.12: Error tracking configured** (Sentry or similar)
  - Status: ☐ Yes ☐ No ☐ Planned

- [ ] **5.13: Uptime monitoring configured**
  - Status: ☐ Yes ☐ No ☐ Planned

- [ ] **5.14: Log aggregation configured**
  - Status: ☐ Yes ☐ No ☐ Planned

---

## 🚨 Known Issues & Workarounds

### Issue 1: Migration Not Run

**Status:** ⚠️ BLOCKER
**Impact:** Orders with old statuses invisible in admin
**Fix:** Complete Phase 1 of this checklist

### Issue 2: Customer Orders Page is Stub

**Status:** ⚠️ BLOCKER
**Impact:** Customers can't see their orders
**Fix:** Complete Story 4.3 implementation (Phase 3)

### Issue 3: Limited Test Coverage

**Status:** ⚠️ MEDIUM
**Impact:** Confidence in deployment lower
**Current:** ~20% coverage
**Target:** >60% coverage
**Fix:** Write tests during Story 4.3 implementation

### Issue 4: N8N Webhooks Not Configured

**Status:** ⚠️ LOW
**Impact:** Automation not enabled
**Fix:** Configure N8N after core features working

### Issue 5: No Sentry Monitoring

**Status:** ⚠️ MEDIUM
**Impact:** Errors not tracked in production
**Fix:** Story-004 from remaining-work.md

---

## 📞 Emergency Contacts & Rollback

### Rollback Procedure

**If deployment causes critical issues:**

1. **Restore database from backup:**

   ```bash
   psql -h 172.22.0.1 -U gangrun_user -d gangrun_db < /root/backups/backup_YYYYMMDD_HHMMSS.sql
   ```

2. **Revert code changes:**

   ```bash
   git reset --hard HEAD~1
   pm2 restart gangrunprinting
   ```

3. **Verify application running:**
   ```bash
   curl https://gangrunprinting.com
   pm2 status
   ```

### Support Information

- **Database:** PostgreSQL @ 172.22.0.1:5432
- **Application:** PM2 process "gangrunprinting" @ port 3002
- **Domain:** gangrunprinting.com
- **Server:** 72.60.28.175

---

## ✅ Deployment Sign-Off

**Phase 1: Database Migration**

- [ ] Completed by: ******\_\_\_****** Date: ******\_\_\_******
- [ ] Verified by: ******\_\_\_****** Date: ******\_\_\_******

**Phase 2: Testing & Verification**

- [ ] Completed by: ******\_\_\_****** Date: ******\_\_\_******
- [ ] Verified by: ******\_\_\_****** Date: ******\_\_\_******

**Phase 3: Customer Orders Implementation**

- [ ] Completed by: ******\_\_\_****** Date: ******\_\_\_******
- [ ] Verified by: ******\_\_\_****** Date: ******\_\_\_******

**Phase 4: End-to-End Testing**

- [ ] Completed by: ******\_\_\_****** Date: ******\_\_\_******
- [ ] Verified by: ******\_\_\_****** Date: ******\_\_\_******

**Final Deployment Approval:**

- [ ] Product Owner: ******\_\_\_****** Date: ******\_\_\_******
- [ ] Tech Lead: ******\_\_\_****** Date: ******\_\_\_******

---

**Document Version:** 1.0
**Last Updated:** 2025-10-02
**Next Review:** After Phase 4 completion
