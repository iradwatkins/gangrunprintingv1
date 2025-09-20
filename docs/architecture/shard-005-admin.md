# Architecture Shard 005: Admin Dashboard & Management

## Overview

**Epic**: Admin Order & User Management
**Status**: 25% Complete - Basic structure in place
**Priority**: High - Required for MVP

## Technical Requirements

### Admin Dashboard Components

```typescript
// Required admin modules
interface AdminModules {
  dashboard: {
    metrics: OrderMetrics
    recentOrders: Order[]
    userActivity: UserActivity[]
  }
  orders: {
    management: OrderManagement
    processing: OrderProcessing
    fulfillment: VendorIntegration
  }
  products: {
    catalog: ProductCatalog
    pricing: PricingEngine
    inventory: InventoryTracking
  }
  customers: {
    profiles: CustomerProfiles
    brokers: BrokerManagement
    segmentation: CustomerSegmentation
  }
  reports: {
    sales: SalesReports
    analytics: BusinessAnalytics
    exports: DataExports
  }
}
```

### Implementation Tasks

#### 1. Dashboard Overview Page

- [ ] Create admin layout with sidebar navigation
- [ ] Build metrics dashboard with charts (recharts)
- [ ] Implement real-time order notifications
- [ ] Add quick action buttons
- [ ] Create activity feed component

#### 2. Order Management System

- [ ] Order list with advanced filtering
- [ ] Order detail view with timeline
- [ ] Status update workflow
- [ ] Print-ready order sheets
- [ ] Vendor assignment interface
- [ ] Bulk order operations

#### 3. Product Management

- [ ] Product CRUD operations
- [ ] Bulk import/export
- [ ] Pricing rule configuration
- [ ] Category management
- [ ] Image upload with optimization
- [ ] SEO metadata editing

#### 4. Customer Management

- [ ] Customer list with search
- [ ] Customer profiles with order history
- [ ] Broker tier management
- [ ] Custom pricing rules
- [ ] Communication log
- [ ] Export customer data

#### 5. Reporting & Analytics

- [ ] Sales reports by period
- [ ] Product performance metrics
- [ ] Customer lifetime value
- [ ] Revenue forecasting
- [ ] Export to CSV/PDF
- [ ] Scheduled report emails

### Database Schema Extensions

```sql
-- Admin activity logging
CREATE TABLE "AdminActivity" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "User"("id")
);

-- Vendor management
CREATE TABLE "Vendor" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "apiEndpoint" TEXT,
    "categories" TEXT[],
    "isActive" BOOLEAN DEFAULT true,
    "settings" JSONB,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order assignments
CREATE TABLE "OrderAssignment" (
    "id" TEXT PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "status" TEXT DEFAULT 'PENDING',
    "vendorOrderId" TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("orderId") REFERENCES "Order"("id"),
    FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id")
);
```

### API Endpoints

```yaml
# Admin API routes
/api/admin/dashboard:
  GET: Dashboard metrics and activity

/api/admin/orders:
  GET: List orders with filters
  PUT: Bulk update orders

/api/admin/orders/{id}:
  GET: Order details with timeline
  PATCH: Update order status
  POST: Assign to vendor

/api/admin/products:
  GET: Product list for management
  POST: Create new product
  PUT: Bulk update products

/api/admin/customers:
  GET: Customer list with metrics
  POST: Create customer account

/api/admin/customers/{id}:
  GET: Customer profile and history
  PATCH: Update customer settings

/api/admin/reports:
  POST: Generate report
  GET: List available reports
```

### UI Components Required

```typescript
// Admin-specific components
components/admin/
├── dashboard/
│   ├── MetricCard.tsx
│   ├── OrderChart.tsx
│   ├── RecentActivity.tsx
│   └── QuickActions.tsx
├── orders/
│   ├── OrderTable.tsx
│   ├── OrderDetails.tsx
│   ├── OrderTimeline.tsx
│   └── VendorAssignment.tsx
├── products/
│   ├── ProductForm.tsx
│   ├── PricingRules.tsx
│   └── BulkImport.tsx
├── customers/
│   ├── CustomerTable.tsx
│   ├── CustomerProfile.tsx
│   └── BrokerSettings.tsx
└── shared/
    ├── AdminLayout.tsx
    ├── DataTable.tsx
    └── ExportButton.tsx
```

### Security Requirements

- Role-based access control (RBAC)
- Admin action logging
- IP whitelisting (optional)
- Two-factor authentication
- Session timeout after inactivity
- Audit trail for all changes

### Performance Considerations

- Paginated data tables
- Virtual scrolling for large lists
- Lazy loading of chart data
- Optimistic UI updates
- Background job processing
- Caching of report data

### Integration Points

- N8N for workflow automation
- Email service for notifications
- File storage for exports
- Payment gateway for refunds
- Analytics for business metrics

## Success Criteria

- [ ] Admin can view real-time dashboard
- [ ] Orders can be managed efficiently
- [ ] Products can be created/edited
- [ ] Customer data is accessible
- [ ] Reports can be generated
- [ ] All actions are logged
- [ ] Performance targets met (<500ms response)

## Dependencies

- Completed authentication system (Shard 002) ✅
- Order system implementation (Shard 004) ✅
- Product catalog (Shard 003) ✅
- Email service configuration ✅

## Next Steps

1. Implement basic admin layout
2. Create dashboard with metrics
3. Build order management interface
4. Add product management
5. Implement customer views
6. Add reporting functionality
7. Test with real data
8. Optimize performance
