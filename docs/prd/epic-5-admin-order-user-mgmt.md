# Epic 5: Admin Order & User Management

## Epic Status

**STATUS: ⚠️ IN PROGRESS (90% Complete)**
**Started:** 2025-09-16
**Target Completion:** 2025-10-10
**Implementation Score:** 90/100
**Stories Complete:** 7 of 8

---

## Epic Goal

Build comprehensive admin interfaces for viewing and managing orders, customers, and the broker discount system, enabling administrators to efficiently handle all business operations.

---

## Epic Description

### User Goal

**As an Administrator**, I need to be able to manage incoming orders, view customer details, update order statuses, and configure the broker discount system, so that I can efficiently run my printing business.

### Business Value

- Centralized order management increases operational efficiency
- Customer management enables better service
- Broker system supports reseller business model
- Real-time visibility into business operations
- Reduced manual work through automation

### Technical Summary

This epic implements comprehensive admin panels:

- **Order Management:** View, search, filter, and update orders
- **Customer Management:** View and manage customer accounts
- **Broker System:** Configure category-specific discounts
- **Product Management:** Already complete (Epic 2)
- **Analytics Dashboard:** Business metrics and insights
- **Configuration Management:** System settings

---

## Functional Requirements Addressed

- **FR4:** Broker system with category-specific discounts ⚠️ (Partial - UI needed)
- **FR5:** Order lifecycle management ✅

---

## Implementation Details

### ✅ Completed Components

#### 1. **Admin Layout & Navigation**

- Admin layout at `/admin`
- Top navigation bar
- Side navigation menu
- User profile dropdown
- Mobile-responsive navigation
- Active state indicators
- Quick search functionality
- Notification badge

#### 2. **Admin Dashboard** (`/admin`)

- Business metrics overview:
  - Total revenue
  - Orders today
  - Pending orders
  - Active customers
- Recent orders list
- Recent customers
- Quick stats cards
- Activity feed
- Performance charts (basic)

#### 3. **Order Management** (`/admin/orders`)

- **Order List View:**
  - Paginated order table
  - Order number with link
  - Customer name
  - Order date
  - Status badge with colors
  - Total amount
  - Quick actions menu
- **Filtering:**
  - By status (All, Pending, Processing, Completed, Cancelled)
  - By date range
  - By customer
  - By total amount range
- **Search:**
  - By order number
  - By customer name
  - By product name
- **Sorting:**
  - Date (newest/oldest)
  - Amount (high/low)
  - Status
  - Customer name
- **Bulk Actions:**
  - Export selected orders
  - Update status (bulk)
  - Print packing slips

#### 4. **Order Detail View** (`/admin/orders/[id]`)

- Comprehensive order information:
  - Order header (number, date, status)
  - Customer information
  - Shipping address
  - Billing address
  - Payment method
- **Order Items:**
  - Product details with images
  - Configurations
  - Quantities
  - Prices
  - Subtotals
- **Order Timeline:**
  - Order placed
  - Payment received
  - Processing started
  - Shipped
  - Delivered
  - Status updates
- **Actions:**
  - Update order status
  - Add internal notes
  - Print invoice
  - Print packing slip
  - Send notification email
  - Refund order
  - Cancel order

#### 5. **Customer Management** (`/admin/customers`)

- **Customer List View:**
  - Paginated customer table
  - Customer name with link
  - Email
  - Join date
  - Total orders
  - Total spent
  - Customer status
  - Broker badge (if applicable)
- **Filtering:**
  - By customer type (All, Regular, Broker)
  - By status (Active, Inactive)
  - By join date
  - By total spent
- **Search:**
  - By name
  - By email
  - By company
- **Sorting:**
  - Name (A-Z)
  - Join date
  - Total orders
  - Total spent
- **Actions:**
  - View customer details
  - View orders
  - Edit customer
  - Toggle broker status
  - Send email

#### 6. **Customer Detail View** (`/admin/customers/[id]`)

- Customer profile information
- Contact details
- Account status
- Broker status indicator
- **Order History:**
  - Complete order list
  - Quick stats
  - Lifetime value
  - Average order value
- **Addresses:**
  - Saved shipping addresses
  - Saved billing addresses
- **Payment Methods:**
  - Saved payment methods (tokenized)
- **Activity Log:**
  - Login history
  - Order history
  - Support interactions
- **Actions:**
  - Edit customer details
  - Toggle broker status
  - Configure broker discounts (if broker)
  - Send email
  - Add notes
  - View impersonation (support feature)

#### 7. **Product Management** (FROM EPIC 2)

Already complete - comprehensive product admin tools:

- `/admin/products` - Product list
- `/admin/products/new` - Create product
- `/admin/products/[id]/edit` - Edit product
- `/admin/categories` - Category management
- `/admin/quantities` - Quantity management
- `/admin/paper-stocks` - Paper stock management
- `/admin/add-ons` - Add-on management
- `/admin/addon-sets` - Add-on set management

#### 8. **Analytics Dashboard** (`/admin/analytics`)

- **Revenue Metrics:**
  - Today's revenue
  - This week
  - This month
  - This year
  - Revenue trend chart
- **Order Metrics:**
  - Orders by status
  - Orders by product category
  - Average order value
  - Orders over time chart
- **Customer Metrics:**
  - New customers
  - Returning customers
  - Customer lifetime value
  - Customer acquisition chart
- **Product Performance:**
  - Top selling products
  - Low stock alerts
  - Product revenue breakdown
- **Date Range Selector:**
  - Today
  - Last 7 days
  - Last 30 days
  - Last 90 days
  - Custom range

#### 9. **Monitoring Dashboard** (`/admin/monitoring`)

- System health metrics
- Database status
- API response times
- Error logs
- Active sessions
- Server resources

#### 10. **Billing Management** (`/admin/billing`)

- Subscription status
- Usage metrics
- Invoice history
- Payment method
- Upgrade/downgrade options

---

### ⚠️ Partially Complete Components

#### 1. **Broker Discount System** (20%)

**Status:** DATABASE READY, UI MISSING ❌

**Database Structure (Ready):**

```prisma
User {
  isBroker: Boolean
  brokerDiscounts: Json? // Category-specific discounts
}
```

**Required UI Components:**

1. **Broker Configuration Page** (`/admin/brokers`)
   - List of all brokers
   - Add new broker
   - Configure broker discounts
   - View broker performance

2. **Broker Discount Editor:**
   - Select categories for discounts
   - Set discount percentage per category
   - Global discount override
   - Discount tiers based on volume
   - Effective date ranges
   - Discount preview

3. **Customer Detail Integration:**
   - "Configure Broker Discounts" button
   - Modal/page with discount editor
   - Save and apply discounts
   - Discount history

**API Endpoints Needed:**

- `GET /api/admin/brokers` - List all brokers
- `POST /api/admin/brokers` - Create broker
- `PUT /api/admin/users/[id]/broker-discounts` - Update discounts
- `GET /api/admin/users/[id]/broker-discounts` - Get current discounts

---

### 📋 Enhancement Opportunities

#### 1. **Advanced Order Management**

- Order assignment to staff
- Internal order chat/comments
- Order workflow automation
- Custom order statuses
- Order tags/labels

#### 2. **Customer Insights**

- Customer segments
- RFM analysis (Recency, Frequency, Monetary)
- Churn prediction
- Lifetime value predictions
- Purchase patterns

#### 3. **Reporting**

- Custom report builder
- Scheduled report emails
- Export to Excel/PDF
- Advanced filtering
- Saved report templates

#### 4. **Staff Management**

- Admin user roles
- Permission management
- Activity logs
- Team collaboration features

---

## User Stories

### Story 5.1: Admin Layout & Navigation ✅

**Status:** COMPLETE
**Description:** Create admin section layout with navigation and user management.

**Acceptance Criteria:**

- ✅ Admin layout at `/admin`
- ✅ Top and side navigation
- ✅ User profile dropdown
- ✅ Mobile-responsive design
- ✅ Quick search functionality
- ✅ Notification system

---

### Story 5.2: Admin Dashboard ✅

**Status:** COMPLETE
**Description:** Build dashboard with business metrics and recent activity.

**Acceptance Criteria:**

- ✅ Dashboard at `/admin`
- ✅ Revenue metrics
- ✅ Order statistics
- ✅ Customer statistics
- ✅ Recent orders list
- ✅ Activity feed
- ✅ Quick stats cards

---

### Story 5.3: Order Management Interface ✅

**Status:** COMPLETE
**Description:** Create comprehensive order management with search, filter, and bulk actions.

**Acceptance Criteria:**

- ✅ Order list at `/admin/orders`
- ✅ Pagination
- ✅ Filter by status
- ✅ Date range filtering
- ✅ Search functionality
- ✅ Sort options
- ✅ Bulk actions
- ✅ Export functionality

---

### Story 5.4: Order Detail & Management ✅

**Status:** COMPLETE
**Description:** Build detailed order view with status management and actions.

**Acceptance Criteria:**

- ✅ Order detail at `/admin/orders/[id]`
- ✅ Complete order information
- ✅ Order timeline
- ✅ Status update functionality
- ✅ Internal notes
- ✅ Print invoice/packing slip
- ✅ Email notifications
- ✅ Refund/cancel actions

---

### Story 5.5: Customer Management Interface ✅

**Status:** COMPLETE
**Description:** Create customer management with search, filter, and broker identification.

**Acceptance Criteria:**

- ✅ Customer list at `/admin/customers`
- ✅ Pagination
- ✅ Filter by type (Regular/Broker)
- ✅ Search functionality
- ✅ Sort options
- ✅ Broker badge display
- ✅ Customer statistics

---

### Story 5.6: Customer Detail View ✅

**Status:** COMPLETE
**Description:** Build detailed customer view with order history and activity.

**Acceptance Criteria:**

- ✅ Customer detail at `/admin/customers/[id]`
- ✅ Customer profile
- ✅ Order history
- ✅ Lifetime statistics
- ✅ Saved addresses
- ✅ Saved payment methods
- ✅ Activity log
- ✅ Quick actions

---

### Story 5.7: Broker Discount Management ❌

**Status:** NOT STARTED
**Description:** Build UI for configuring and managing broker discount system.

**Acceptance Criteria:**

- ❌ Broker list page at `/admin/brokers`
- ❌ "Configure Discounts" in customer detail
- ❌ Discount editor interface
- ❌ Category-specific discount config
- ❌ Global discount override
- ❌ Discount preview
- ❌ Save and apply discounts
- ❌ Discount history log
- ❌ API endpoints for broker discounts

---

### Story 5.8: Admin Order Processing System ✅

**Status:** COMPLETE (Retrospective)
**Description:** Comprehensive print broker order management with status tracking, payment processing, vendor assignment, and email notifications.
**Story Points:** 21
**Completed:** 2025-10-02

**Acceptance Criteria:**

- ✅ 13 broker-specific order statuses (PENDING_PAYMENT → DELIVERED workflow)
- ✅ 18 new order tracking fields (deadlines, notes, pickup info, etc.)
- ✅ OrderService with 6 core methods (processPayment, assignVendor, updateStatus, etc.)
- ✅ Payment processing (Square webhook + manual capture)
- ✅ Professional email templates (5 notifications: confirmation, production, shipping, on-hold, pickup)
- ✅ Admin OrderQuickActions UI (status update, payment, invoice, shipping modals)
- ✅ 6 API endpoints (webhooks, admin actions, status management)
- ✅ Safe database migration with automatic backup

**Documentation:**

- Full story: [story-5.8-admin-order-processing-system.md](../stories/story-5.8-admin-order-processing-system.md)
- Deployment guide: [ADMIN-ORDER-SYSTEM-README.md](../../ADMIN-ORDER-SYSTEM-README.md)

**Known Issues:**

- ⚠️ Migration not yet run on production database
- ⚠️ Limited automated test coverage (~20%)
- ⚠️ N8N webhooks not yet configured

**Remaining Work:**

1. **Create Broker List Page** (`/admin/brokers`)

   ```typescript
   // Display all broker accounts
   - Broker name & company
   - Active discounts indicator
   - Total orders & revenue
   - Configure discounts button
   - Performance metrics
   ```

2. **Discount Configuration Modal:**

   ```typescript
   interface BrokerDiscount {
     categoryId: string
     discountPercent: number
     minOrderAmount?: number
     maxOrderAmount?: number
     effectiveDate?: Date
     expiryDate?: Date
   }
   ```

3. **Integration Points:**
   - Customer detail page: Add "Configure Broker Discounts" button
   - Product pricing API: Apply broker discounts
   - Order summary: Show discount breakdown
   - Analytics: Broker performance reports

4. **API Endpoints:**
   ```typescript
   PUT / api / admin / users / [id] / broker - discounts
   GET / api / admin / brokers
   GET / api / admin / brokers / [id] / performance
   ```

**Estimated Effort:** 12 hours

---

### Story 5.8: Analytics Dashboard ✅

**Status:** COMPLETE
**Description:** Build analytics dashboard with business insights and reports.

**Acceptance Criteria:**

- ✅ Analytics at `/admin/analytics`
- ✅ Revenue metrics
- ✅ Order metrics
- ✅ Customer metrics
- ✅ Product performance
- ✅ Date range selector
- ✅ Visual charts
- ✅ Export data

---

### Story 5.9: System Monitoring ✅

**Status:** COMPLETE
**Description:** Create monitoring dashboard for system health and performance.

**Acceptance Criteria:**

- ✅ Monitoring at `/admin/monitoring`
- ✅ System health metrics
- ✅ Database status
- ✅ API response times
- ✅ Error logs
- ✅ Active sessions
- ✅ Server resources

---

## Technical Architecture

### Admin Pages Structure

```
/admin (Dashboard)
├── /orders (Order Management)
│   └── /[id] (Order Detail)
├── /customers (Customer Management)
│   └── /[id] (Customer Detail)
├── /brokers (Broker Management) ❌ TO BE BUILT
├── /products (From Epic 2) ✅
├── /categories (From Epic 2) ✅
├── /quantities (From Epic 2) ✅
├── /paper-stocks (From Epic 2) ✅
├── /add-ons (From Epic 2) ✅
├── /addon-sets (From Epic 2) ✅
├── /analytics (Analytics Dashboard) ✅
├── /monitoring (System Monitoring) ✅
└── /billing (Billing Management) ✅
```

### Broker Discount Application Logic

```typescript
function calculatePriceWithBrokerDiscount(
  basePrice: number,
  productCategoryId: string,
  userId: string
): number {
  const user = await getUser(userId)

  if (!user.isBroker || !user.brokerDiscounts) {
    return basePrice
  }

  const categoryDiscount = user.brokerDiscounts[productCategoryId]

  if (!categoryDiscount) {
    return basePrice
  }

  const discountAmount = basePrice * (categoryDiscount / 100)
  return basePrice - discountAmount
}
```

---

## API Endpoints

### Order Management

- `GET /api/admin/orders` - List orders ✅
- `GET /api/admin/orders/[id]` - Get order ✅
- `PUT /api/admin/orders/[id]` - Update order ✅
- `PUT /api/admin/orders/[id]/status` - Update status ✅
- `POST /api/admin/orders/[id]/notes` - Add note ✅
- `POST /api/admin/orders/[id]/refund` - Refund order ✅

### Customer Management

- `GET /api/admin/customers` - List customers ✅
- `GET /api/admin/customers/[id]` - Get customer ✅
- `PUT /api/admin/customers/[id]` - Update customer ✅
- `PUT /api/admin/customers/[id]/broker-status` - Toggle broker ✅

### Broker Management (TO BE BUILT)

- `GET /api/admin/brokers` - List brokers ❌
- `GET /api/admin/brokers/[id]` - Get broker details ❌
- `PUT /api/admin/users/[id]/broker-discounts` - Update discounts ❌
- `GET /api/admin/brokers/[id]/performance` - Broker stats ❌

### Analytics

- `GET /api/admin/analytics/revenue` - Revenue data ✅
- `GET /api/admin/analytics/orders` - Order metrics ✅
- `GET /api/admin/analytics/customers` - Customer metrics ✅
- `GET /api/admin/analytics/products` - Product performance ✅

---

## Dependencies

### Internal

- Epic 1: Foundation (auth, database)
- Epic 2: Product Catalog (product management already built)
- Epic 3: Commerce (order data)

### External Services

- PostgreSQL (data persistence)
- Redis (caching)
- Resend (email notifications)

### Libraries

- React Hook Form (forms)
- React Query (data fetching)
- Chart.js or Recharts (analytics charts)
- date-fns (date handling)

---

## Remaining Work

### High Priority

**1. Broker Discount Management System (Story 5.7)** - 12 hours

- Create `/admin/brokers` page
- Build discount configuration UI
- Integrate with customer detail
- Create API endpoints
- Apply discounts in pricing engine
- Test discount calculations

**Total Remaining:** 12 hours (1.5 days)

---

## Risks & Mitigation

| Risk                             | Impact | Likelihood | Mitigation                                   | Status      |
| -------------------------------- | ------ | ---------- | -------------------------------------------- | ----------- |
| Complex discount logic           | MEDIUM | MEDIUM     | Comprehensive testing, formula documentation | 📋 Planned  |
| Performance with large datasets  | MEDIUM | MEDIUM     | Pagination, caching, indexes                 | ✅ Resolved |
| Permission management complexity | LOW    | LOW        | Role-based access control                    | ✅ Resolved |
| Report generation performance    | MEDIUM | LOW        | Background jobs, caching                     | ✅ Resolved |

---

## Success Metrics

### Current Achievement

- [x] Admin navigation: 100%
- [x] Dashboard: 100%
- [x] Order management: 100%
- [x] Customer management: 100%
- [x] Product management: 100% (Epic 2)
- [x] Analytics: 100%
- [x] Monitoring: 100%
- [ ] Broker discount system: 20%

**Overall Completion:** 85%

### Target Metrics (When Complete)

- Admin task completion time: -40%
- Order processing time: -50%
- Customer service response time: -30%
- Broker onboarding time: < 10 minutes
- Admin user satisfaction: > 90%

---

## Testing Requirements

### ✅ Completed Tests

- Order management flow tests
- Customer management tests
- Search and filter tests
- Analytics data accuracy tests

### 📋 Remaining Tests

- Broker discount calculation tests
- Discount application in pricing tests
- Broker performance reporting tests
- Edge cases for discount conflicts

---

## Documentation References

- [Admin User Guide](/docs/admin-user-guide.md)
- [Broker System Specification](/docs/broker-system-spec.md)
- [Order Management Workflow](/docs/order-management-workflow.md)

---

## Change Log

| Date       | Version | Description                   | Author           |
| ---------- | ------- | ----------------------------- | ---------------- |
| 2025-09-16 | 1.0     | Admin pages implemented       | Development Team |
| 2025-09-20 | 1.1     | Order management completed    | Development Team |
| 2025-09-25 | 1.2     | Customer management completed | Development Team |
| 2025-09-27 | 1.3     | Analytics dashboard added     | Development Team |
| 2025-09-30 | 2.0     | Sharded from monolithic PRD   | BMAD Agent       |

---

**Epic Owner:** Admin Experience Lead
**Last Updated:** 2025-09-30
**Previous Epic:** [Epic 4: Customer Account Management](./epic-4-customer-account-mgmt.md)
**Next Epic:** [Epic 6: Marketing & CRM Platform](./epic-6-marketing-crm-platform.md)
