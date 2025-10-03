# Epic 9: Enhanced Admin Capabilities

## Epic Information

| Field | Value |
|-------|-------|
| **Epic ID** | EPIC-009 |
| **Phase** | Phase 2 |
| **Priority** | MEDIUM |
| **Status** | Not Started |
| **Story Points** | 34 |
| **Estimated Duration** | 3-4 weeks |
| **Dependencies** | Epic 5 (Admin Order Management 85% complete) |

---

## Epic Description

Build advanced admin tools for business operations including analytics dashboard, bulk operations, inventory management, reporting, audit logs, and admin role management. These tools will increase operational efficiency and provide data-driven insights for business decisions.

---

## Business Value

**Problem:** Limited admin tools causing inefficiency and lack of business insights
**Solution:** Comprehensive admin platform with analytics, automation, and bulk operations
**Impact:**
- Reduce admin time by 60% (from 10 hours/week to 4 hours/week)
- Enable data-driven decision making
- Improve order accuracy by 40%
- Scale operations without adding staff

---

## User Stories

### Story 9.1: Analytics Dashboard (8 points)

**As an** Admin
**I want** a comprehensive analytics dashboard
**So that** I can understand business performance and make data-driven decisions

**Acceptance Criteria:**
- [ ] Dashboard shows key metrics (revenue, orders, customers)
- [ ] Date range selector (today, week, month, year, custom)
- [ ] Revenue trends with charts
- [ ] Top products by revenue and quantity
- [ ] Customer acquisition metrics
- [ ] Order status breakdown
- [ ] Real-time updates
- [ ] Export data to CSV/Excel

**Key Metrics:**
```typescript
interface DashboardMetrics {
  // Revenue
  totalRevenue: number
  revenueChange: number // % change vs previous period
  averageOrderValue: number

  // Orders
  totalOrders: number
  ordersChange: number
  pendingOrders: number
  shippedOrders: number

  // Customers
  totalCustomers: number
  newCustomers: number
  returningCustomers: number
  customerRetentionRate: number

  // Products
  topProducts: Array<{
    productId: string
    name: string
    revenue: number
    quantity: number
  }>

  // Trends
  revenueTrend: Array<{ date: string; revenue: number }>
  ordersTrend: Array<{ date: string; orders: number }>
}
```

**Tasks:**
1. Design dashboard layout
2. Create metrics calculation service
3. Build chart components (line, bar, pie)
4. Implement date range selector
5. Add real-time data updates
6. Create export functionality
7. Add mobile responsive view
8. Performance optimization (caching)

---

### Story 9.2: Bulk Operations (8 points)

**As an** Admin
**I want** to perform bulk actions on orders and products
**So that** I can manage large volumes efficiently

**Acceptance Criteria:**
- [ ] Can select multiple orders
- [ ] Can bulk update order status
- [ ] Can bulk assign vendors
- [ ] Can bulk download order files
- [ ] Can bulk update product prices
- [ ] Can bulk activate/deactivate products
- [ ] Confirmation dialog before bulk actions
- [ ] Progress indicator for long operations

**Bulk Operations Supported:**
```typescript
// Orders
- Bulk status update (PENDING → PRODUCTION)
- Bulk vendor assignment
- Bulk file download (ZIP)
- Bulk order export (CSV)
- Bulk email notifications

// Products
- Bulk price update (absolute or percentage)
- Bulk category change
- Bulk activation/deactivation
- Bulk tag management
- Bulk image upload

// Customers
- Bulk email campaigns
- Bulk tag assignment
- Bulk export
```

**Tasks:**
1. Create bulk selection UI
2. Build bulk action menu
3. Implement progress tracking
4. Add confirmation dialogs
5. Create background job processing
6. Build result reporting
7. Add error handling
8. Test with large datasets

---

### Story 9.3: Inventory Management (5 points)

**As an** Admin
**I want** to track and manage inventory
**So that** I can prevent out-of-stock situations

**Acceptance Criteria:**
- [ ] Can view inventory levels by product
- [ ] Low stock alerts (email + dashboard)
- [ ] Can set reorder points
- [ ] Can manually adjust inventory
- [ ] Inventory history tracking
- [ ] Automated inventory reduction on order
- [ ] Inventory reports

**Database Schema:**
```prisma
model Inventory {
  id              String   @id @default(cuid())
  productId       String
  product         Product  @relation(fields: [productId], references: [id])

  quantityOnHand  Int      @default(0)
  reorderPoint    Int      @default(100)
  reorderQuantity Int      @default(500)

  // Tracking
  lastRestocked   DateTime?
  lastChecked     DateTime?

  // Alerts
  lowStockAlertSent Boolean @default(false)
  outOfStock      Boolean  @default(false)

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@unique([productId])
}

model InventoryTransaction {
  id          String   @id @default(cuid())
  inventoryId String
  inventory   Inventory @relation(fields: [inventoryId], references: [id])

  type        String   // adjustment, order, restock, return
  quantity    Int      // positive for additions, negative for reductions
  reason      String?
  orderId     String?
  userId      String?

  balanceBefore Int
  balanceAfter  Int

  createdAt   DateTime @default(now())
}
```

**Tasks:**
1. Create inventory database schema
2. Build inventory list page
3. Add reorder point alerts
4. Implement manual adjustment form
5. Create inventory history view
6. Add automated reduction on orders
7. Build inventory reports
8. Test low stock alerts

---

### Story 9.4: Advanced Reporting (8 points)

**As an** Admin
**I want** customizable reports
**So that** I can analyze specific aspects of the business

**Acceptance Criteria:**
- [ ] Pre-built report templates available
- [ ] Can create custom reports
- [ ] Can save and schedule reports
- [ ] Email delivery of scheduled reports
- [ ] Export to PDF, CSV, Excel
- [ ] Visual charts and graphs
- [ ] Comparison periods (YoY, MoM)

**Report Types:**
```typescript
// Sales Reports
- Daily/Weekly/Monthly Sales Summary
- Sales by Product Category
- Sales by Customer Type (retail vs broker)
- Payment Method Analysis
- Discount/Coupon Usage

// Order Reports
- Order Status Summary
- Average Order Value Trends
- Order Fulfillment Time Analysis
- Vendor Performance Report
- Shipping Cost Analysis

// Customer Reports
- Customer Lifetime Value Report
- Customer Acquisition Report
- Customer Retention Report
- Top Customers by Revenue
- Customer Geography Analysis

// Product Reports
- Product Performance Report
- Inventory Turnover Report
- Price Analysis Report
- Product Profitability Report
```

**Tasks:**
1. Design report builder UI
2. Create report templates
3. Build custom report creator
4. Implement scheduling system
5. Add email delivery
6. Create export functionality
7. Build comparison features
8. Add visual charts

---

### Story 9.5: Audit Logs (5 points)

**As an** Admin
**I want** detailed audit logs
**So that** I can track all system changes and troubleshoot issues

**Acceptance Criteria:**
- [ ] All admin actions are logged
- [ ] Logs include user, timestamp, action, and changes
- [ ] Can search and filter logs
- [ ] Can export logs
- [ ] Logs are tamper-proof
- [ ] Retention policy enforced (90 days)
- [ ] Sensitive data masked in logs

**Logged Actions:**
```typescript
// User Management
- User created/updated/deleted
- Role changes
- Password resets
- Login attempts (success/failure)

// Order Management
- Order status changes
- Payment refunds
- Order cancellations
- Vendor assignments

// Product Management
- Product created/updated/deleted
- Price changes
- Inventory adjustments
- Product activation/deactivation

// System
- Configuration changes
- Integration settings
- Email template updates
```

**Database Schema:**
```prisma
model AuditLog {
  id          String   @id @default(cuid())

  // Who
  userId      String?
  userEmail   String
  userRole    String

  // What
  action      String   // user.created, order.status_changed, etc.
  entityType  String   // User, Order, Product, etc.
  entityId    String?

  // When
  timestamp   DateTime @default(now())

  // Changes
  oldValue    Json?    // Previous state
  newValue    Json?    // New state
  metadata    Json?    // Additional context

  // Request context
  ipAddress   String?
  userAgent   String?
  requestId   String?

  @@index([userId])
  @@index([entityType, entityId])
  @@index([action])
  @@index([timestamp])
}
```

**Tasks:**
1. Create audit log database schema
2. Build logging middleware
3. Implement action tracking
4. Create audit log viewer UI
5. Add search and filtering
6. Build export functionality
7. Implement retention policy
8. Add sensitive data masking

---

## Technical Architecture

### Analytics Service

```typescript
// src/services/analytics-service.ts
export class AnalyticsService {
  async getDashboardMetrics(dateRange: DateRange): Promise<DashboardMetrics> {
    const [revenue, orders, customers, products] = await Promise.all([
      this.getRevenueMetrics(dateRange),
      this.getOrderMetrics(dateRange),
      this.getCustomerMetrics(dateRange),
      this.getProductMetrics(dateRange),
    ])

    return {
      ...revenue,
      ...orders,
      ...customers,
      ...products,
    }
  }

  private async getRevenueMetrics(dateRange: DateRange) {
    const currentRevenue = await prisma.order.aggregate({
      where: {
        createdAt: {
          gte: dateRange.start,
          lte: dateRange.end,
        },
        status: { in: ['COMPLETED', 'SHIPPED', 'DELIVERED'] },
      },
      _sum: { total: true },
      _avg: { total: true },
      _count: true,
    })

    const previousRevenue = await prisma.order.aggregate({
      where: {
        createdAt: {
          gte: this.getPreviousPeriod(dateRange).start,
          lte: this.getPreviousPeriod(dateRange).end,
        },
        status: { in: ['COMPLETED', 'SHIPPED', 'DELIVERED'] },
      },
      _sum: { total: true },
    })

    const revenueChange =
      ((currentRevenue._sum.total - previousRevenue._sum.total) /
        previousRevenue._sum.total) *
      100

    return {
      totalRevenue: currentRevenue._sum.total || 0,
      revenueChange,
      averageOrderValue: currentRevenue._avg.total || 0,
    }
  }

  async getRevenueTrend(dateRange: DateRange, granularity: 'day' | 'week' | 'month') {
    // Use SQL for efficient date grouping
    const trend = await prisma.$queryRaw`
      SELECT
        DATE_TRUNC(${granularity}, created_at) as date,
        SUM(total) as revenue,
        COUNT(*) as orders
      FROM "Order"
      WHERE created_at >= ${dateRange.start}
        AND created_at <= ${dateRange.end}
        AND status IN ('COMPLETED', 'SHIPPED', 'DELIVERED')
      GROUP BY DATE_TRUNC(${granularity}, created_at)
      ORDER BY date ASC
    `

    return trend
  }
}
```

### Bulk Operations Service

```typescript
// src/services/bulk-operations-service.ts
export class BulkOperationsService {
  async bulkUpdateOrderStatus(
    orderIds: string[],
    newStatus: OrderStatus,
    userId: string
  ): Promise<BulkOperationResult> {
    const results = {
      success: 0,
      failed: 0,
      errors: [] as Array<{ orderId: string; error: string }>,
    }

    // Process in batches of 10
    const batches = chunk(orderIds, 10)

    for (const batch of batches) {
      await Promise.all(
        batch.map(async (orderId) => {
          try {
            await prisma.order.update({
              where: { id: orderId },
              data: { status: newStatus },
            })

            // Log audit trail
            await this.auditLog.log({
              userId,
              action: 'order.bulk_status_update',
              entityType: 'Order',
              entityId: orderId,
              newValue: { status: newStatus },
            })

            results.success++
          } catch (error) {
            results.failed++
            results.errors.push({
              orderId,
              error: error instanceof Error ? error.message : 'Unknown error',
            })
          }
        })
      )
    }

    return results
  }

  async bulkUpdateProductPrices(
    productIds: string[],
    adjustment: PriceAdjustment,
    userId: string
  ): Promise<BulkOperationResult> {
    const results = { success: 0, failed: 0, errors: [] }

    for (const productId of productIds) {
      try {
        const product = await prisma.product.findUnique({
          where: { id: productId },
          select: { basePrice: true },
        })

        if (!product) {
          throw new Error('Product not found')
        }

        const newPrice =
          adjustment.type === 'percentage'
            ? product.basePrice * (1 + adjustment.value / 100)
            : product.basePrice + adjustment.value

        await prisma.product.update({
          where: { id: productId },
          data: { basePrice: newPrice },
        })

        results.success++
      } catch (error) {
        results.failed++
        results.errors.push({
          productId,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    return results
  }
}
```

---

## API Endpoints

```
Analytics:
GET    /api/admin/analytics/dashboard
GET    /api/admin/analytics/revenue-trend
GET    /api/admin/analytics/orders-trend
GET    /api/admin/analytics/top-products
GET    /api/admin/analytics/customer-metrics

Bulk Operations:
POST   /api/admin/bulk/orders/update-status
POST   /api/admin/bulk/orders/assign-vendor
POST   /api/admin/bulk/orders/download-files
POST   /api/admin/bulk/products/update-prices
POST   /api/admin/bulk/products/toggle-active

Inventory:
GET    /api/admin/inventory
GET    /api/admin/inventory/:productId
POST   /api/admin/inventory/:productId/adjust
GET    /api/admin/inventory/:productId/history
GET    /api/admin/inventory/low-stock

Reports:
GET    /api/admin/reports/templates
POST   /api/admin/reports/generate
POST   /api/admin/reports/schedule
GET    /api/admin/reports/scheduled
DELETE /api/admin/reports/scheduled/:id

Audit Logs:
GET    /api/admin/audit-logs
GET    /api/admin/audit-logs/:id
GET    /api/admin/audit-logs/export
```

---

## Testing Strategy

### Unit Tests
- Analytics calculations
- Bulk operation logic
- Inventory reduction calculations
- Report generation

### Integration Tests
- Dashboard data accuracy
- Bulk operations with large datasets
- Inventory transactions
- Audit log creation

### E2E Tests
1. View dashboard and verify metrics
2. Perform bulk order status update
3. Create custom report and export
4. Review audit log for admin action
5. Receive low stock alert

---

## Success Metrics

### Launch Criteria
- [ ] Dashboard loads in <2 seconds
- [ ] Bulk operations handle 100+ items
- [ ] All reports exportable
- [ ] Audit logs capturing all actions
- [ ] Inventory alerts working

### Performance Targets
- Dashboard load time: <2 seconds
- Analytics query time: <500ms
- Bulk operation: 10 items per second
- Report generation: <10 seconds

### Business Metrics (30 days post-launch)
- Admin efficiency increase: >50%
- Time spent on reporting: Reduced by 70%
- Inventory stockouts: Reduced by 80%
- Decision-making speed: 2x faster
- Admin satisfaction: >90%

---

## Risks & Mitigation

### Risk 1: Performance with Large Datasets
**Impact:** High
**Probability:** Medium
**Mitigation:**
- Database indexing on key fields
- Query optimization
- Pagination for bulk operations
- Caching for analytics

### Risk 2: Data Accuracy
**Impact:** High
**Probability:** Low
**Mitigation:**
- Comprehensive test suite
- Real-time validation
- Audit trails for verification
- Regular data integrity checks

---

## Timeline

### Week 1: Analytics Dashboard
- Metrics calculation service
- Dashboard UI
- Chart components
- Export functionality

### Week 2: Bulk Operations
- Bulk selection UI
- Action processing
- Progress tracking
- Error handling

### Week 3: Inventory & Reporting
- Inventory management
- Report templates
- Custom report builder
- Scheduling system

### Week 4: Audit Logs & Polish
- Audit logging
- Log viewer UI
- Performance optimization
- Testing

---

**Epic Owner:** Product Manager
**Technical Lead:** Full Stack Lead
**Status:** Not Started
**Last Updated:** October 3, 2025
