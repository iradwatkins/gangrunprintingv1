# Admin Dashboard Implementation Plan

## Current State Assessment (25% Complete)

### ✅ What's Already Implemented

1. **Dashboard Overview** - Real-time metrics from database
   - Revenue tracking (today/month)
   - Order statistics
   - Customer counts
   - Completion rates
   - Recent orders display

2. **Product Management** - Fully functional
   - CRUD operations working
   - API integration complete
   - Image management
   - Stock configuration
   - Active/Featured toggles

3. **Basic Structure**
   - Admin layout with sidebar
   - Navigation components
   - Authentication checks
   - Basic UI components

### ❌ What's Missing (75% Remaining)

## Priority 1: Order Management System (Week 1)

### Task 1: Connect Orders Page to Database

**Files to modify**: `src/app/admin/orders/page.tsx`

```typescript
// Replace static data with database query
const orders = await prisma.order.findMany({
  include: {
    user: true,
    OrderItem: {
      include: {
        product: true,
      },
    },
  },
  orderBy: { createdAt: 'desc' },
})
```

### Task 2: Order Detail View

**Create**: `src/app/admin/orders/[id]/page.tsx`

Features:

- Order timeline with status updates
- Customer information
- Product details with configurations
- Artwork files display
- Payment information
- Shipping/billing addresses
- Print-ready order sheet generation
- Status update workflow

### Task 3: Order Status Management

**Create**: `src/components/admin/order-status-updater.tsx`

```typescript
interface OrderStatuses {
  PENDING_PAYMENT: 'Awaiting Payment'
  PAID: 'Payment Received'
  PROCESSING: 'Processing'
  PRINTING: 'In Production'
  QUALITY_CHECK: 'Quality Check'
  PACKAGING: 'Packaging'
  SHIPPED: 'Shipped'
  DELIVERED: 'Delivered'
  CANCELLED: 'Cancelled'
  REFUNDED: 'Refunded'
}
```

### Task 4: Vendor Assignment

**Create**: `src/components/admin/vendor-assignment.tsx`

Database schema needed:

```sql
CREATE TABLE "Vendor" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "categories" TEXT[],
    "isActive" BOOLEAN DEFAULT true
);

CREATE TABLE "OrderAssignment" (
    "id" TEXT PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "status" TEXT DEFAULT 'PENDING'
);
```

## Priority 2: Customer Management (Week 1-2)

### Task 5: Customer List Page

**Modify**: `src/app/admin/customers/page.tsx`

Features:

- Search and filtering
- Customer metrics (lifetime value, order count)
- Broker status indicators
- Bulk operations

### Task 6: Customer Profile

**Modify**: `src/app/admin/customers/[id]/page.tsx`

Features:

- Complete order history
- Communication log
- Custom pricing rules
- Broker tier management
- Notes and tags
- Activity timeline

### Task 7: Broker Management

**Create**: `src/components/admin/broker-settings.tsx`

```typescript
interface BrokerTier {
  id: string
  name: string
  discountPercentage: number
  categories: string[]
  minimumOrderValue?: number
}
```

## Priority 3: Analytics & Reporting (Week 2)

### Task 8: Sales Reports

**Create**: `src/app/admin/reports/sales/page.tsx`

Reports to implement:

- Daily/Weekly/Monthly sales
- Product performance
- Category breakdown
- Customer segments
- Geographic distribution

### Task 9: Revenue Analytics

**Create**: `src/components/admin/revenue-analytics.tsx`

Metrics:

- Revenue trends
- Average order value
- Conversion rates
- Customer acquisition cost
- Lifetime value

### Task 10: Export Functionality

**Create**: `src/lib/admin/export-service.ts`

```typescript
export async function exportToCSV(data: any[], filename: string) {
  // Implementation
}

export async function exportToPDF(data: any[], template: string) {
  // Implementation using React PDF
}
```

## Priority 4: System Features (Week 2-3)

### Task 11: Admin Activity Logging

**Create**: Middleware for logging

```typescript
// middleware/admin-logger.ts
export async function logAdminActivity(
  userId: string,
  action: string,
  entityType?: string,
  entityId?: string,
  metadata?: any
) {
  await prisma.adminActivity.create({
    data: {
      userId,
      action,
      entityType,
      entityId,
      metadata,
    },
  })
}
```

### Task 12: Notification System

**Create**: `src/components/admin/notifications.tsx`

Types:

- New orders
- Payment received
- Low stock alerts
- Customer messages
- System alerts

### Task 13: Search Functionality

**Create**: `src/components/admin/global-search.tsx`

Search across:

- Orders
- Customers
- Products
- Vendors

## Implementation Schedule

### Week 1 (Immediate)

- [ ] Day 1-2: Order management connection to database
- [ ] Day 3-4: Order detail view and status management
- [ ] Day 5: Vendor assignment system

### Week 2

- [ ] Day 1-2: Customer management improvements
- [ ] Day 3-4: Analytics and reporting base
- [ ] Day 5: Export functionality

### Week 3

- [ ] Day 1-2: Activity logging and audit trail
- [ ] Day 3-4: Notification system
- [ ] Day 5: Testing and refinement

## Technical Requirements

### API Endpoints Needed

```yaml
/api/admin/orders:
  GET: List with filters
  PATCH: Bulk status update

/api/admin/orders/{id}:
  GET: Full order details
  PATCH: Update order
  POST: Assign vendor

/api/admin/vendors:
  GET: List vendors
  POST: Create vendor
  PATCH: Update vendor

/api/admin/reports/sales:
  POST: Generate report

/api/admin/activity:
  GET: Activity log
```

### Database Migrations Required

```sql
-- Admin activity logging
CREATE TABLE "AdminActivity" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vendor management
CREATE TABLE "Vendor" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "categories" TEXT[],
    "isActive" BOOLEAN DEFAULT true,
    "settings" JSONB
);

-- Order assignments
CREATE TABLE "OrderAssignment" (
    "id" TEXT PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "status" TEXT DEFAULT 'PENDING',
    "vendorOrderId" TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### UI Components Required

```typescript
// Priority components to build
components/admin/
├── orders/
│   ├── OrdersDataTable.tsx     // Real data table
│   ├── OrderStatusBadge.tsx    // Status display
│   ├── OrderTimeline.tsx       // Status history
│   └── VendorAssignment.tsx    // Vendor selection
├── customers/
│   ├── CustomerProfile.tsx     // Full profile view
│   ├── OrderHistory.tsx        // Customer orders
│   └── BrokerSettings.tsx      // Discount config
├── analytics/
│   ├── SalesChart.tsx          // Revenue charts
│   ├── MetricsGrid.tsx         // KPI display
│   └── ReportGenerator.tsx     // Report builder
└── shared/
    ├── DataExport.tsx          // Export buttons
    ├── ActivityLog.tsx         // Audit display
    └── NotificationCenter.tsx  // Alert system
```

## Success Metrics

### Completion Criteria

- [ ] All orders displayed from database
- [ ] Order details fully viewable
- [ ] Status updates working
- [ ] Vendor assignment functional
- [ ] Customer profiles complete
- [ ] Basic reports generating
- [ ] Activity logging active
- [ ] Export features working

### Performance Targets

- Order list loads < 500ms
- Search results < 200ms
- Report generation < 3s
- Export processing < 5s

## Risk Mitigation

### Potential Issues

1. **Data volume**: Implement pagination
2. **Complex queries**: Add database indexes
3. **Report generation**: Use background jobs
4. **Export size**: Stream large exports

## Testing Requirements

### Unit Tests

- Order status transitions
- Report calculations
- Export formatting

### Integration Tests

- Order workflow
- Vendor assignment
- Customer management

### E2E Tests

- Complete order processing
- Report generation
- Data export

## Documentation Needed

1. Admin user guide
2. API documentation
3. Report definitions
4. Troubleshooting guide

---

## Next Steps

1. **Immediate**: Start with Order Management (Task 1-4)
2. **Review**: Check progress after each major component
3. **Test**: Continuous testing during development
4. **Deploy**: Incremental deployment of features

This plan will bring the Admin Dashboard from 25% to 100% completion, fulfilling all requirements from the Epic 5 specification.
