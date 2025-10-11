# 🚀 GANGRUN PRINTING - DEVELOPER HANDOFF DOCUMENT

**Date:** October 2, 2025
**System:** GangRun Printing - E-Commerce Platform
**Version:** 1.0.0
**Environment:** Production (Port 3002)
**Status:** 78/100 - Production Ready with 1 Critical Blocker

---

## 📋 TABLE OF CONTENTS

1. [Executive Summary](#executive-summary)
2. [System Architecture](#system-architecture)
3. [Business Model](#business-model)
4. [Critical Next Steps](#critical-next-steps)
5. [BMAD Agent Guide](#bmad-agent-guide)
6. [System Access](#system-access)
7. [Deployment Status](#deployment-status)
8. [Epic Completion Status](#epic-completion-status)
9. [Known Issues](#known-issues)
10. [Code Structure](#code-structure)
11. [Database Schema](#database-schema)
12. [API Endpoints](#api-endpoints)
13. [Testing Guidelines](#testing-guidelines)
14. [Troubleshooting](#troubleshooting)

---

## 🎯 EXECUTIVE SUMMARY

### What's Working

✅ **Admin Operations:** Fully functional order management, customer management, product catalog
✅ **Product System:** Complete modular product architecture with real-time pricing
✅ **Checkout Flow:** Shopping cart, checkout, Square payments, FedEx shipping
✅ **Order Processing:** 13 order statuses, vendor coordination, email notifications
✅ **Authentication:** Lucia Auth with Google OAuth and Magic Links

### Critical Blocker

❌ **Customer Order History (Story 4.3):** Stub page exists but customers cannot view their orders
**Impact:** BLOCKS customer-facing launch
**Effort:** 12-16 hours
**Priority:** CRITICAL

### System Health

- **Core E-Commerce:** 78/100 (one critical blocker)
- **Admin Tools:** 100/100 (fully operational)
- **Customer Features:** 60/100 (missing order history)
- **Overall:** Production-ready for admin use, needs Story 4.3 for customers

---

## 🏗️ SYSTEM ARCHITECTURE

### Tech Stack

- **Frontend:** Next.js 15.5.2 with App Router, TypeScript 5.9.2
- **Backend:** Next.js API routes (serverless)
- **Database:** PostgreSQL 15 (172.22.0.1:5432)
- **ORM:** Prisma (80+ models)
- **Auth:** Lucia Auth (Google OAuth, Magic Links)
- **Payments:** Square API
- **Shipping:** FedEx API
- **Email:** Resend + React Email templates
- **File Storage:** MinIO (port 9000)
- **Process Manager:** PM2
- **Deployment:** Docker Compose (port 3002)

### Architecture Pattern

- **Server Components First:** Data fetching in server components
- **API Routes:** For mutations and complex operations
- **Service Layer:** Business logic in `/src/services/`
- **Repository Pattern:** Database access in `/src/repositories/`
- **Type Safety:** TypeScript strict mode, Zod validation

---

## 💼 BUSINESS MODEL

### How GangRun Printing Operates

**Customer-Facing (What Customers See):**

- Professional printing company offering business cards, flyers, brochures, etc.
- 95% retail customers (regular consumers)
- 5% broker customers (resellers who get category-specific % discounts)
- Seamless ordering, payment, tracking, and delivery experience

**Behind the Scenes (How We Operate):**

- We coordinate with vendor print shops for physical production
- Vendors handle: printing, quality control, bindery, packaging, shipping
- We handle: customer service, order management, payments, file review, status tracking
- We do NOT operate printing presses or physical production

**Key Point:** Customers never know we use vendors - they see us as their printer.

### Broker Discount System

- Database: `User.isBroker` (boolean), `User.brokerDiscounts` (JSONB)
- Example: `{"Business Cards": 15, "Flyers": 20, "Brochures": 18}` (percentages)
- Pricing engine automatically applies discounts at checkout
- Backend complete, admin UI needed (Story 5.7)

### Terminology Guide

- ✅ **Use:** "printing company", "print shop", "customer orders"
- ❌ **Avoid:** "broker workflow" (confusing - sounds like we're brokers)
- ✅ **Broker customers** = The 5% who get discounts (resellers)
- ✅ **Vendor coordination** = Internal operations (customers don't see)

**Reference:** Full business model in [CLAUDE.md lines 120-153](CLAUDE.md#L120-L153)

---

## 🚨 CRITICAL NEXT STEPS

### Priority 1: Fix Customer Order History (CRITICAL)

**BMAD Agent:** `/BMad:agents:dev` (Developer Agent)

**Task:** Implement Story 4.3 - Customer Order History
**Status:** BLOCKING customer launch
**Effort:** 12-16 hours
**Assignee:** Lead Developer

**Current State:**

- File: [src/app/account/orders/page.tsx](src/app/account/orders/page.tsx) (31 lines, stub)
- Shows hardcoded "You haven't placed any orders yet" to ALL customers
- No database query, no filtering, no pagination

**Required Implementation:**

- Fetch orders from database for logged-in user
- Display order cards with status badges, dates, totals
- Filter by status (All, Active, Completed, Cancelled)
- Filter by date range
- Search by order number
- Sort by date/amount/status
- Pagination (20 per page)
- Conditional empty state (only if NO orders exist)
- Loading states, error handling

**Implementation Guide:** [docs/stories/story-4.3-customer-order-history.md](docs/stories/story-4.3-customer-order-history.md) (600+ lines)

**Acceptance Criteria (20 items):**

1. Fetch user's orders: `prisma.order.findMany({ where: { userId: user.id } })`
2. Display order cards with: number, date, status badge, total, items
3. Implement filters (status, date range)
4. Implement search (order number)
5. Implement sorting (date, amount, status)
6. Add pagination controls
7. Show conditional empty state
8. Add loading skeleton
9. Handle errors gracefully
10. Mobile responsive design
11. Link to order detail pages
12. Show order status colors
13. Display item count per order
14. Format dates (MM/DD/YYYY)
15. Format currency ($X.XX)
16. Add "View Details" buttons
17. Show status icons
18. Implement URL query params for filters
19. Add filter reset button
20. Test with real customer account

**Testing:**

1. Create test orders in database
2. Log in as customer
3. Visit `/account/orders`
4. Verify orders display correctly
5. Test all filters and search
6. Test pagination
7. Test on mobile devices

---

### Priority 2: Complete Epic 4 (OPTIONAL)

**BMAD Agent:** `/BMad:agents:dev` (Developer Agent)

**Task:** Implement Story 4.5 - Re-Order Functionality
**Status:** Nice-to-have, not blocking
**Effort:** 6-8 hours
**Priority:** MEDIUM

**Implementation:**

- Add "Re-Order" button to order cards
- Add "Re-Order" button to order detail page
- Create re-order modal component
- Implement re-order logic (check availability, prices)
- Populate cart with order items
- Handle out-of-stock items

---

### Priority 3: Complete Epic 5 (OPTIONAL)

**BMAD Agent:** `/BMad:agents:dev` (Developer Agent)

**Task:** Implement Story 5.7 - Broker Discount Management UI
**Status:** Backend complete, needs admin UI
**Effort:** 8-10 hours
**Priority:** MEDIUM

**Implementation:**

- Create admin page: `/admin/customers/[id]/broker-discounts`
- Display customer's broker status
- Show current broker discounts by category
- Form to edit discount percentages
- Save/update functionality
- Validation (0-100% range)

---

### Priority 4: Additional Payment Options (OPTIONAL)

**BMAD Agent:** `/BMad:agents:dev` (Developer Agent)

**Task:** Integrate CashApp and PayPal
**Status:** Square working, these are extras
**Effort:** 8-12 hours (4-6h each)
**Priority:** MEDIUM

---

### Priority 5: Marketing Suite (FUTURE)

**BMAD Agent:** `/BMad:agents:architect` then `/BMad:agents:dev`

**Task:** Complete Epic 6 - Marketing & CRM
**Status:** 25% complete (skeleton only)
**Effort:** 120-150 hours (3-4 weeks)
**Priority:** LOW (not needed for e-commerce launch)

---

## 🤖 BMAD AGENT GUIDE

### What is BMAD?

BMAD (Build, Monitor, Analyze, Deploy) is an AI-driven development methodology using specialized agents for different tasks.

### Available BMAD Agents

#### `/BMad:agents:dev` - Developer Agent

**Use For:**

- Writing code (features, bug fixes, refactoring)
- Implementing stories and tasks
- Code reviews
- Technical implementation
- Database queries
- API development

**Examples:**

- Implementing Story 4.3 (customer order history)
- Fixing bugs in checkout flow
- Adding new API endpoints
- Refactoring components

---

#### `/BMad:agents:qa` - QA Agent (Quinn)

**Use For:**

- Testing features
- Finding bugs
- Verifying acceptance criteria
- Test plan creation
- Quality audits
- Regression testing

**Examples:**

- Testing customer order history after implementation
- Verifying all 20 acceptance criteria for Story 4.3
- Running comprehensive system audit
- Testing payment flows

---

#### `/BMad:agents:pm` - Project Manager Agent (John)

**Use For:**

- Creating epics and stories
- Task breakdown
- Documentation updates
- Progress tracking
- Roadmap planning
- Sprint planning

**Examples:**

- Creating Story 4.3 documentation
- Breaking down Epic 6 into stories
- Updating epic completion status
- Planning next sprint

---

#### `/BMad:agents:po` - Product Owner Agent

**Use For:**

- Business requirements
- Feature prioritization
- User story creation
- Acceptance criteria definition
- Stakeholder communication

**Examples:**

- Defining broker discount requirements
- Prioritizing Epic 6 features
- Writing user stories
- Creating product roadmap

---

#### `/BMad:agents:architect` - Architect Agent

**Use For:**

- System design
- Architecture decisions
- Database schema design
- API design
- Performance optimization
- Scalability planning

**Examples:**

- Designing Marketing CRM architecture
- Database optimization
- API versioning strategy
- Microservices planning

---

#### `/BMad:agents:ux-expert` - UX Expert Agent

**Use For:**

- UI/UX design
- User experience audits
- Accessibility
- Design systems
- User flow optimization

**Examples:**

- Improving checkout UX
- Designing broker discount UI
- Accessibility audit
- Mobile experience optimization

---

#### `/BMad:agents:analyst` - Business Analyst Agent

**Use For:**

- Business metrics
- Analytics reports
- Data analysis
- Performance reports
- ROI calculations

**Examples:**

- Sales analytics
- Customer behavior analysis
- Conversion rate optimization
- Revenue forecasting

---

#### `/BMad:agents:sm` - Scrum Master Agent

**Use For:**

- Sprint management
- Daily standups
- Retrospectives
- Removing blockers
- Team coordination

**Examples:**

- Planning sprints
- Tracking velocity
- Facilitating retrospectives
- Managing backlog

---

### BMAD Agent Usage Examples

#### Scenario 1: Implementing Story 4.3

```bash
# Step 1: Use PM agent to review story
/BMad:agents:pm
"Review Story 4.3 customer order history and confirm all requirements"

# Step 2: Use Dev agent to implement
/BMad:agents:dev
"Implement Story 4.3 customer order history page with all 20 acceptance criteria"

# Step 3: Use QA agent to test
/BMad:agents:qa
"Test Story 4.3 implementation and verify all acceptance criteria are met"
```

#### Scenario 2: Bug Fix

```bash
# Step 1: Use QA agent to identify bug
/BMad:agents:qa
"Audit checkout flow and identify any bugs"

# Step 2: Use Dev agent to fix
/BMad:agents:dev
"Fix the payment processing bug identified in QA audit"

# Step 3: Use QA agent to verify
/BMad:agents:qa
"Verify the payment bug is fixed and no regressions introduced"
```

#### Scenario 3: New Feature Planning

```bash
# Step 1: Use PO agent to define requirements
/BMad:agents:po
"Define requirements for broker discount management UI"

# Step 2: Use Architect agent to design
/BMad:agents:architect
"Design the architecture for broker discount management system"

# Step 3: Use PM agent to create stories
/BMad:agents:pm
"Create stories for broker discount management feature"

# Step 4: Use Dev agent to implement
/BMad:agents:dev
"Implement Story 5.7 broker discount management UI"
```

---

## 🔐 SYSTEM ACCESS

### Production Server

- **Host:** 72.60.28.175
- **SSH:** `ssh root@72.60.28.175`
- **Password:** `Bobby321&Gloria321Watkins?`
- **Application Port:** 3002
- **Application URL:** http://gangrunprinting.com (http://72.60.28.175:3002)

### Database

- **Host:** 172.22.0.1
- **Port:** 5432
- **Database:** gangrun_db
- **User:** gangrun_user
- **Password:** GangRun2024Secure

**Connect:**

```bash
PGPASSWORD='GangRun2024Secure' psql -h 172.22.0.1 -U gangrun_user -d gangrun_db
```

### MinIO (File Storage)

- **Host:** 172.22.0.1
- **Port:** 9000
- **Console:** 9001
- **Access Key:** (check .env)
- **Secret Key:** (check .env)
- **Bucket:** gangrun-uploads

### N8N (Workflow Automation)

- **URL:** http://72.60.28.175:5678
- **Port:** 5678
- **Status:** Pre-installed, ready to use

### Ollama (AI Services)

- **URL:** http://72.60.28.175:11434
- **Port:** 11434
- **Status:** Pre-installed, ready to use

### Admin Account

- **Email:** iradwatkins@gmail.com
- **Name:** Ira Watkins
- **Password:** Iw2006js!
- **Role:** ADMIN

### GitHub Repository

- **URL:** https://github.com/iradwatkins/gangrunprinting.git
- **Branch:** main
- **Deployment:** PM2 on port 3002

---

## 📦 DEPLOYMENT STATUS

### Current Deployment

- **Status:** ✅ RUNNING
- **Process Manager:** PM2
- **Process Name:** gangrunprinting
- **Port:** 3002
- **PID:** 1780826
- **Uptime:** Running since last restart
- **Memory:** ~17 MB
- **Restart Count:** 152

### PM2 Commands

```bash
# Check status
pm2 status

# View logs
pm2 logs gangrunprinting

# Restart application
pm2 restart gangrunprinting

# Stop application
pm2 stop gangrunprinting

# Start application
pm2 start ecosystem.config.js

# Save PM2 process list
pm2 save
```

### Build & Deploy

```bash
# Navigate to project
cd /root/websites/gangrunprinting

# Pull latest code
git pull origin main

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Build application
npm run build

# Restart PM2
pm2 restart gangrunprinting

# Check logs
pm2 logs gangrunprinting --lines 50
```

### Environment Variables

Located in: `/root/websites/gangrunprinting/.env`

**Critical Variables:**

- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Auth secret key
- `SQUARE_ACCESS_TOKEN` - Square payment API
- `FEDEX_API_KEY` - FedEx shipping API
- `RESEND_API_KEY` - Email service
- `MINIO_ENDPOINT` - File storage endpoint

---

## 📊 EPIC COMPLETION STATUS

### Epic 1: Foundational Setup & Theming ✅

**Status:** COMPLETE (100%)
**File:** [docs/prd/epic-1-foundation-theming.md](docs/prd/epic-1-foundation-theming.md)

- ✅ Next.js + TypeScript setup
- ✅ Database schema (80+ models)
- ✅ Authentication (Lucia Auth)
- ✅ Theme customization
- ✅ PWA configuration

---

### Epic 2: Product Catalog & Configuration ✅

**Status:** COMPLETE (100%)
**File:** [docs/prd/epic-2-product-catalog-config.md](docs/prd/epic-2-product-catalog-config.md)

- ✅ Modular product architecture
- ✅ Real-time pricing engine
- ✅ Product configurator
- ✅ Admin product management

---

### Epic 3: Core Commerce & Checkout ⚠️

**Status:** IN PROGRESS (80%)
**File:** [docs/prd/epic-3-commerce-checkout.md](docs/prd/epic-3-commerce-checkout.md)

**Completed:**

- ✅ Shopping cart
- ✅ Checkout flow
- ✅ Square payments
- ✅ FedEx shipping
- ✅ Order creation

**Remaining:**

- ❌ CashApp integration
- ❌ PayPal integration

---

### Epic 4: Customer Account Management ⚠️

**Status:** IN PROGRESS (80% - CRITICAL BLOCKER)
**File:** [docs/prd/epic-4-customer-account-mgmt.md](docs/prd/epic-4-customer-account-mgmt.md)

**Completed:**

- ✅ Story 4.1: Account layout
- ✅ Story 4.2: Dashboard
- ✅ Story 4.4: Order detail view
- ✅ Story 4.6: Profile management
- ✅ Story 4.7: Address management
- ✅ Story 4.8: Payment methods
- ✅ Story 4.9: Downloads

**Remaining:**

- ❌ **Story 4.3: Order History** (CRITICAL BLOCKER)
- ❌ Story 4.5: Re-order functionality

---

### Epic 5: Admin Order & User Management ⚠️

**Status:** IN PROGRESS (90%)
**File:** [docs/prd/epic-5-admin-order-user-mgmt.md](docs/prd/epic-5-admin-order-user-mgmt.md)

**Completed (7 of 8 stories):**

- ✅ Story 5.1: Admin layout
- ✅ Story 5.2: Admin dashboard
- ✅ Story 5.3: Order list & filtering
- ✅ Story 5.4: Order detail view
- ✅ Story 5.5: Customer management
- ✅ Story 5.6: Customer detail view
- ✅ Story 5.8: Order processing system (NEW - Oct 2, 2025)

**Remaining:**

- ❌ Story 5.7: Broker discount management UI

---

### Epic 6: Marketing & CRM Platform ❌

**Status:** MINIMAL (25%)
**File:** [docs/prd/epic-6-marketing-crm-platform.md](docs/prd/epic-6-marketing-crm-platform.md)

**Completed:**

- ⚠️ Basic structure (routes only)
- ⚠️ UI skeletons (no functionality)

**Remaining (ALL):**

- ❌ CRM/Contacts hub
- ❌ Email builder (drag-and-drop)
- ❌ Email campaigns
- ❌ Automation engine
- ❌ Analytics dashboard

**Priority:** LOW (not needed for e-commerce launch)

---

## 🐛 KNOWN ISSUES

### Critical (BLOCKING)

#### 1. Customer Order History Not Implemented

**Issue:** Story 4.3 - Customers cannot view their orders
**File:** [src/app/account/orders/page.tsx](src/app/account/orders/page.tsx)
**Status:** ❌ CRITICAL - Blocks customer launch
**Assigned:** Unassigned
**BMAD Agent:** `/BMad:agents:dev`

**Problem:**

- Page exists but shows hardcoded "You haven't placed any orders yet"
- No database query implemented
- No filtering, search, or pagination

**Impact:**

- Customers cannot see their order history
- Breaks customer experience
- Must fix before customer launch

**Solution:**

- Implement full order history page per Story 4.3
- See [docs/stories/story-4.3-customer-order-history.md](docs/stories/story-4.3-customer-order-history.md)

---

### Non-Critical (Can Launch Without)

#### 2. Re-Order Functionality Missing

**Issue:** Story 4.5 - No re-order button
**Status:** ⚠️ MEDIUM priority
**Assigned:** Unassigned
**BMAD Agent:** `/BMad:agents:dev`

**Impact:** Nice-to-have, not blocking launch

---

#### 3. Broker Discount Management UI Missing

**Issue:** Story 5.7 - Admin cannot manage broker discounts via UI
**Status:** ⚠️ MEDIUM priority
**Assigned:** Unassigned
**BMAD Agent:** `/BMad:agents:dev`

**Impact:** Backend works, admin can manually update database

---

#### 4. CashApp/PayPal Integration Missing

**Issue:** Epic 3 - Only Square payment available
**Status:** ⚠️ MEDIUM priority
**Assigned:** Unassigned
**BMAD Agent:** `/BMad:agents:dev`

**Impact:** Square works fine, these are extras

---

#### 5. Marketing/CRM Suite Incomplete

**Issue:** Epic 6 - Only 25% complete
**Status:** ⚠️ LOW priority
**Assigned:** Unassigned
**BMAD Agent:** `/BMad:agents:architect` then `/BMad:agents:dev`

**Impact:** Not needed for e-commerce launch

---

## 📁 CODE STRUCTURE

### Directory Layout

```
/root/websites/gangrunprinting/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (customer)/         # Customer-facing pages
│   │   │   ├── page.tsx        # Homepage
│   │   │   ├── products/       # Product catalog
│   │   │   ├── cart/           # Shopping cart
│   │   │   └── checkout/       # Checkout flow
│   │   ├── account/            # Customer account section
│   │   │   ├── dashboard/      # Account dashboard
│   │   │   ├── orders/         # Order history (NEEDS FIX)
│   │   │   ├── orders/[id]/    # Order detail (WORKING)
│   │   │   └── details/        # Profile management
│   │   ├── admin/              # Admin panel
│   │   │   ├── dashboard/      # Admin dashboard
│   │   │   ├── orders/         # Order management (WORKING)
│   │   │   ├── customers/      # Customer management
│   │   │   └── products/       # Product management
│   │   ├── api/                # API routes
│   │   │   ├── products/       # Product APIs
│   │   │   ├── orders/         # Order APIs
│   │   │   ├── checkout/       # Checkout APIs
│   │   │   ├── shipping/       # FedEx shipping APIs
│   │   │   └── webhooks/       # Payment webhooks
│   │   └── auth/               # Authentication pages
│   ├── components/             # React components
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── admin/              # Admin components
│   │   ├── checkout/           # Checkout components
│   │   └── products/           # Product components
│   ├── lib/                    # Utilities
│   │   ├── auth.ts             # Lucia Auth config
│   │   ├── prisma.ts           # Prisma client
│   │   ├── email/              # Email templates
│   │   └── services/           # Service layer
│   │       └── order-service.ts # Order management
│   ├── services/               # Business logic
│   │   ├── OrderService.ts     # Order operations
│   │   ├── ProductService.ts   # Product operations
│   │   └── UserService.ts      # User operations
│   └── repositories/           # Data access layer
│       └── ProductRepository.ts
├── prisma/
│   └── schema.prisma           # Database schema (80+ models)
├── docs/                       # Documentation
│   ├── prd/                    # Product requirements (epics)
│   ├── stories/                # Story documentation
│   └── architecture/           # Architecture docs
├── migrations/                 # Database migrations
│   └── migrate-broker-order-system.sql
├── .env                        # Environment variables
├── ecosystem.config.js         # PM2 configuration
├── CLAUDE.md                   # AI assistant instructions
└── HANDOFF-DOCUMENT.md         # This file
```

---

## 🗄️ DATABASE SCHEMA

### Key Models (80+ total)

#### User Management

- `User` - Customer/admin accounts
  - `id`, `email`, `name`, `role` (ADMIN/USER/CUSTOMER)
  - `isBroker` (boolean) - Identifies broker customers
  - `brokerDiscounts` (JSONB) - Category-specific percentages
- `Session` - Lucia Auth sessions
- `Account` - OAuth accounts

#### Product Catalog

- `ProductCategory` - Product categories
- `Product` - Products with modular architecture
- `ProductQuantityGroup` - Quantity tiers
- `ProductSizeGroup` - Size variations
- `ProductPaperStockSet` - Paper stock options
- `ProductAddOnSet` - Add-on services
- `PaperStock` - Paper types and weights
- `TurnaroundTime` - Delivery options

#### Orders

- `Order` - Customer orders
  - 13 order statuses (PENDING_PAYMENT, CONFIRMATION, PRODUCTION, etc.)
  - 18 tracking fields (filesApprovedAt, vendorNotifiedAt, rushOrder, etc.)
  - Shipping/billing addresses
  - Payment info
- `OrderItem` - Individual line items
- `OrderItemAddOn` - Add-ons per item
- `StatusHistory` - Order status changes (toStatus, fromStatus)

#### Shopping Cart

- `Cart` - Customer shopping carts
- `CartItem` - Cart line items

#### Vendors

- `Vendor` - Print shop vendors
- `VendorProduct` - Vendor-product relationships

### Database Access Patterns

**✅ CORRECT - Server Components:**

```typescript
// app/account/orders/page.tsx (NEEDS TO BE IMPLEMENTED)
import { prisma } from '@/lib/prisma'
import { validateRequest } from '@/lib/auth'

export default async function OrdersPage() {
  const { user } = await validateRequest()

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    include: {
      OrderItem: {
        include: { Product: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return <OrderList orders={orders} />
}
```

**❌ WRONG - Client Components:**

```typescript
// Don't do this!
'use client'
export default function OrdersPage() {
  const [orders, setOrders] = useState([])

  useEffect(() => {
    fetch('/api/orders').then(r => r.json()).then(setOrders)
  }, [])

  return <OrderList orders={orders} />
}
```

---

## 🔌 API ENDPOINTS

### Order Management

- `GET /api/orders` - List orders (admin)
- `GET /api/orders/[id]` - Get order details
- `POST /api/orders` - Create order
- `PATCH /api/orders/[id]` - Update order
- `PATCH /api/orders/[id]/status` - Update order status
- `POST /api/orders/[id]/assign-vendor` - Assign vendor
- `POST /api/orders/[id]/notify-vendor` - Notify vendor

### Products

- `GET /api/products` - List products
- `GET /api/products/[id]` - Get product details
- `GET /api/products/[id]/configuration` - Get product configuration
- `POST /api/products/[id]/calculate-price` - Calculate price

### Checkout

- `POST /api/checkout/create-payment` - Create Square payment
- `POST /api/checkout/confirm` - Confirm order

### Shipping

- `POST /api/shipping/calculate` - Calculate shipping rates
- `POST /api/shipping/label` - Create shipping label
- `GET /api/shipping/track/[tracking]` - Track shipment

### Authentication

- `POST /api/auth/signin` - Sign in
- `POST /api/auth/signout` - Sign out
- `GET /api/auth/verify` - Verify magic link

---

## 🧪 TESTING GUIDELINES

### Manual Testing Checklist

#### Customer Order History (Story 4.3)

After implementing, test:

1. **Login as Customer**

   ```
   Email: (create test customer)
   Password: (set password)
   ```

2. **Navigate to Order History**

   ```
   URL: http://gangrunprinting.com/account/orders
   ```

3. **Verify Orders Display**
   - [ ] Orders appear in list
   - [ ] Order cards show: number, date, status, total
   - [ ] Status badges have correct colors
   - [ ] Dates formatted correctly
   - [ ] Currency formatted correctly
   - [ ] Product thumbnails display

4. **Test Filtering**
   - [ ] Filter by status (All, Active, Completed, Cancelled)
   - [ ] Filter by date range (last 7 days, 30 days, 90 days, custom)
   - [ ] Filters work correctly
   - [ ] URL updates with filter params
   - [ ] Filters persist on page reload

5. **Test Search**
   - [ ] Search by order number
   - [ ] Search results accurate
   - [ ] Clear search works
   - [ ] No results message appears

6. **Test Sorting**
   - [ ] Sort by date (newest first)
   - [ ] Sort by date (oldest first)
   - [ ] Sort by amount (highest first)
   - [ ] Sort by amount (lowest first)
   - [ ] Sort by status

7. **Test Pagination**
   - [ ] Create 25+ test orders
   - [ ] Pagination shows (20 per page)
   - [ ] Next/Previous buttons work
   - [ ] Page numbers work
   - [ ] Current page highlighted

8. **Test Empty State**
   - [ ] Delete all orders for test user
   - [ ] Empty state appears
   - [ ] "Browse Products" button works
   - [ ] Appropriate message shown

9. **Test Mobile**
   - [ ] Responsive design works
   - [ ] Filters accessible on mobile
   - [ ] Cards stack properly
   - [ ] Touch targets appropriate size

10. **Test Edge Cases**
    - [ ] Orders with no items
    - [ ] Orders with many items
    - [ ] Long order numbers
    - [ ] Large order totals
    - [ ] Old order dates

### Automated Testing

**Unit Tests:**

```typescript
// tests/orders/page.test.tsx
describe('OrdersPage', () => {
  it('fetches and displays orders', async () => {
    // Test order fetching logic
  })

  it('filters orders by status', () => {
    // Test filtering logic
  })

  it('searches orders by number', () => {
    // Test search logic
  })
})
```

**Integration Tests:**

```typescript
// tests/api/orders.test.ts
describe('Orders API', () => {
  it('GET /api/orders returns user orders', async () => {
    // Test API endpoint
  })
})
```

---

## 🔧 TROUBLESHOOTING

### Common Issues

#### 1. Application Not Starting

**Symptoms:** PM2 shows "error" status

**Troubleshooting:**

```bash
# Check logs
pm2 logs gangrunprinting --lines 100

# Check for common issues
# - Missing .env file
# - Database connection failed
# - Port already in use

# Verify database connection
PGPASSWORD='GangRun2024Secure' psql -h 172.22.0.1 -U gangrun_user -d gangrun_db -c "SELECT 1;"

# Check port availability
lsof -i :3002

# Rebuild and restart
cd /root/websites/gangrunprinting
npm run build
pm2 restart gangrunprinting
```

---

#### 2. Database Connection Issues

**Symptoms:** "Can't reach database server"

**Troubleshooting:**

```bash
# Test database connection
PGPASSWORD='GangRun2024Secure' psql -h 172.22.0.1 -U gangrun_user -d gangrun_db

# Check DATABASE_URL in .env
cat .env | grep DATABASE_URL

# Verify PostgreSQL is running
docker ps | grep postgres

# Check network connectivity
ping 172.22.0.1
```

---

#### 3. Build Failures

**Symptoms:** "npm run build" fails

**Troubleshooting:**

```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules
rm -rf node_modules
npm install

# Generate Prisma client
npx prisma generate

# Run type check
npx tsc --noEmit

# Check for TypeScript errors
# Fix any errors before building

# Retry build
npm run build
```

---

#### 4. PM2 Memory Issues

**Symptoms:** Application crashes frequently

**Troubleshooting:**

```bash
# Check memory usage
pm2 show gangrunprinting

# Check ecosystem.config.js memory limit
cat ecosystem.config.js | grep max_memory_restart

# Should be: max_memory_restart: '2G'

# If not set, update ecosystem.config.js
# Then restart
pm2 delete gangrunprinting
pm2 start ecosystem.config.js
pm2 save
```

---

#### 5. Upload Errors (ERR_CONNECTION_CLOSED)

**Symptoms:** File uploads fail immediately

**Troubleshooting:**

```bash
# Check PM2 memory configuration
pm2 show gangrunprinting | grep max_memory

# Verify middleware.ts has keep-alive headers
cat src/middleware.ts | grep "Connection: keep-alive"

# Restart with correct config
pm2 delete gangrunprinting
pm2 start ecosystem.config.js
pm2 save

# Test uploads
node test-upload.js
```

**Reference:** [docs/CRITICAL-FIX-UPLOAD-ERR-CONNECTION-CLOSED.md](docs/CRITICAL-FIX-UPLOAD-ERR-CONNECTION-CLOSED.md)

---

#### 6. Order History Page Showing "No Orders"

**Symptoms:** Customer has orders but page shows "no orders"

**This is the CURRENT ISSUE - Story 4.3 needs implementation**

**Temporary Workaround:**

- Check order detail page directly: `/account/orders/[orderId]`
- Use admin dashboard to view customer orders

**Permanent Fix:**

- Implement Story 4.3 as documented above

---

## 📞 SUPPORT & ESCALATION

### Getting Help

#### For Development Questions

**BMAD Agent:** `/BMad:agents:dev`

```
Ask: "How do I implement [feature]?"
```

#### For Testing Questions

**BMAD Agent:** `/BMad:agents:qa`

```
Ask: "How do I test [feature]?"
```

#### For Architecture Questions

**BMAD Agent:** `/BMad:agents:architect`

```
Ask: "What's the best way to design [system]?"
```

#### For Business Questions

**BMAD Agent:** `/BMad:agents:po`

```
Ask: "What are the requirements for [feature]?"
```

### Documentation References

- **Business Model:** [CLAUDE.md](CLAUDE.md#L120-L153)
- **Epic Summaries:** [docs/prd/](docs/prd/)
- **Story Details:** [docs/stories/](docs/stories/)
- **Architecture:** [docs/architecture/](docs/architecture/)
- **API Docs:** [docs/api/](docs/api/)
- **Deployment:** [DEPLOYMENT-CHECKLIST.md](DEPLOYMENT-CHECKLIST.md)

---

## ✅ HANDOFF CHECKLIST

### Before Starting Work

- [ ] Read this handoff document completely
- [ ] Review [CLAUDE.md](CLAUDE.md) business model section
- [ ] Log in to production server (72.60.28.175)
- [ ] Verify PM2 is running: `pm2 status`
- [ ] Test database connection
- [ ] Review Story 4.3 documentation
- [ ] Create test customer account
- [ ] Create test orders in database
- [ ] Familiarize with BMAD agents

### Implementing Story 4.3

- [ ] Use `/BMad:agents:dev` for implementation
- [ ] Read [docs/stories/story-4.3-customer-order-history.md](docs/stories/story-4.3-customer-order-history.md)
- [ ] Review existing order detail page for patterns
- [ ] Implement order fetching from database
- [ ] Implement filtering (status, date range)
- [ ] Implement search (order number)
- [ ] Implement sorting (date, amount, status)
- [ ] Implement pagination (20 per page)
- [ ] Add loading states
- [ ] Add error handling
- [ ] Add mobile responsive design
- [ ] Test all 20 acceptance criteria
- [ ] Use `/BMad:agents:qa` to verify implementation
- [ ] Deploy to production
- [ ] Verify on live site

### After Story 4.3 Complete

- [ ] Update Epic 4 status to 90% complete
- [ ] Mark Story 4.3 as ✅ COMPLETE
- [ ] Document any issues encountered
- [ ] Test with real customer account
- [ ] Celebrate! 🎉 System is now customer-ready

---

## 🎯 SUCCESS CRITERIA

### Story 4.3 is Complete When:

1. ✅ Customer can view all their orders
2. ✅ Orders display with correct information
3. ✅ Status badges show with correct colors
4. ✅ Filters work (status, date range)
5. ✅ Search works (order number)
6. ✅ Sorting works (date, amount, status)
7. ✅ Pagination works (20 per page)
8. ✅ Empty state only shows when NO orders
9. ✅ Loading states appear during fetch
10. ✅ Errors handled gracefully
11. ✅ Mobile responsive
12. ✅ Links to order detail pages work
13. ✅ All 20 acceptance criteria pass
14. ✅ QA agent verification complete
15. ✅ Deployed to production
16. ✅ Tested on live site

### System is Customer-Ready When:

1. ✅ Story 4.3 complete
2. ✅ All QA tests pass
3. ✅ No critical bugs
4. ✅ Performance acceptable (<2s page load)
5. ✅ Mobile experience tested
6. ✅ All payment flows working
7. ✅ All email notifications sending
8. ✅ Admin can manage orders
9. ✅ Customers can view orders
10. ✅ Customers can place orders

---

## 📈 METRICS & MONITORING

### Key Metrics to Track

**Performance:**

- Page load time (<2 seconds)
- API response time (<150ms)
- Database query time (<85ms)
- Build time (<2 minutes)

**Usage:**

- Orders per day
- Customer registrations
- Product views
- Cart abandonment rate
- Checkout completion rate

**Errors:**

- Application errors (0 critical)
- Payment failures (<1%)
- Email delivery failures (<0.1%)
- Database connection errors (0)

### Health Check Endpoints

```bash
# Application health
curl http://localhost:3002/api/health

# Database health
curl http://localhost:3002/api/health/db

# Payment system health
curl http://localhost:3002/api/health/payments
```

---

## 🚀 DEPLOYMENT PIPELINE

### Standard Deployment Process

1. **Pull Latest Code**

   ```bash
   cd /root/websites/gangrunprinting
   git pull origin main
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Run Migrations** (if needed)

   ```bash
   npx prisma migrate deploy
   ```

4. **Generate Prisma Client**

   ```bash
   npx prisma generate
   ```

5. **Build Application**

   ```bash
   npm run build
   ```

6. **Restart PM2**

   ```bash
   pm2 restart gangrunprinting
   ```

7. **Verify Deployment**

   ```bash
   pm2 logs gangrunprinting --lines 50
   curl http://localhost:3002
   ```

8. **Save PM2 State**
   ```bash
   pm2 save
   ```

---

## 🎓 LEARNING RESOURCES

### Documentation

- **Next.js 15:** https://nextjs.org/docs
- **Prisma:** https://www.prisma.io/docs
- **Lucia Auth:** https://lucia-auth.com
- **Tailwind CSS:** https://tailwindcss.com/docs
- **shadcn/ui:** https://ui.shadcn.com

### Internal Docs

- [CLAUDE.md](CLAUDE.md) - Business model & AI instructions
- [docs/prd/](docs/prd/) - Product requirements
- [docs/stories/](docs/stories/) - Story documentation
- [docs/architecture/](docs/architecture/) - Architecture decisions

### BMAD Method

- Epic-driven development
- Agent-based task assignment
- Story-based implementation
- Continuous QA validation

---

## 📋 FINAL NOTES

### Remember

- ✅ Use BMAD agents for all tasks
- ✅ Follow server component pattern for data fetching
- ✅ Always use `validateRequest()` for authentication
- ✅ Test on mobile devices
- ✅ Keep CLAUDE.md updated
- ✅ Document all changes
- ✅ Use proper TypeScript types
- ✅ Follow existing code patterns

### Priority Order

1. **CRITICAL:** Fix Story 4.3 (customer order history) - 12-16 hours
2. **MEDIUM:** Implement Story 4.5 (re-order) - 6-8 hours
3. **MEDIUM:** Implement Story 5.7 (broker discount UI) - 8-10 hours
4. **MEDIUM:** Add CashApp/PayPal - 8-12 hours
5. **LOW:** Build Marketing/CRM suite - 120-150 hours

### Contact

- **Owner:** Ira Watkins
- **Email:** iradwatkins@gmail.com
- **GitHub:** https://github.com/iradwatkins

---

## 🎉 READY TO START!

**Next Action:** Use `/BMad:agents:dev` to implement Story 4.3

```bash
/BMad:agents:dev
"Implement Story 4.3: Customer Order History page.
Follow the 20 acceptance criteria in docs/stories/story-4.3-customer-order-history.md.
Current page at src/app/account/orders/page.tsx is a stub.
Replace with full implementation that fetches orders from database and displays them with filtering, search, sorting, and pagination."
```

Good luck! The system is 78% complete and just needs Story 4.3 to be customer-ready! 🚀

---

**Document Version:** 1.0.0
**Last Updated:** October 2, 2025
**Status:** Production Ready (with 1 blocker)
**Next Review:** After Story 4.3 completion
