# Epic 7: Complete Vendor Automation

## Epic Information

| Field                  | Value                           |
| ---------------------- | ------------------------------- |
| **Epic ID**            | EPIC-007                        |
| **Phase**              | Phase 2                         |
| **Priority**           | HIGH                            |
| **Status**             | 50% Complete (Partial)          |
| **Story Points**       | 21                              |
| **Estimated Duration** | 2-3 weeks                       |
| **Dependencies**       | Epic 5 (Admin Order Management) |

---

## Epic Description

Complete the vendor automation system that was partially implemented in Phase 1. This system will automatically route approved orders to vendor print shops, track production status, handle vendor responses, and manage the complete vendor lifecycle without manual intervention.

---

## Business Value

**Problem:** Currently requires manual vendor coordination and order placement
**Solution:** Fully automated vendor order routing and status tracking
**Impact:**

- Reduce order processing time by 80% (from 30 minutes to 5 minutes)
- Eliminate manual data entry errors
- Handle 10x more orders with same staff
- Enable 24/7 order processing

---

## Current State (50% Complete)

### ✅ What's Already Built:

- Database schema for vendor management
- Vendor model in Prisma
- Basic vendor assignment UI
- Order status tracking foundation

### ❌ What's Missing:

- Automated order routing logic
- Vendor API integrations
- Automated status synchronization
- Vendor response handling
- Error recovery and retry logic

---

## User Stories

### Story 7.1: Automated Vendor Selection (5 points)

**As an** Admin
**I want** orders to automatically route to the best vendor
**So that** I don't need to manually assign vendors for every order

**Acceptance Criteria:**

- [ ] System automatically selects vendor based on product type
- [ ] Considers vendor capacity and lead times
- [ ] Fallback to secondary vendor if primary is unavailable
- [ ] Logs vendor selection reasoning
- [ ] Manual override option available
- [ ] Vendor performance metrics influence selection
- [ ] Rush orders prioritized to fast vendors

**Tasks:**

1. Create vendor selection algorithm
2. Build capacity tracking system
3. Implement vendor performance scoring
4. Add fallback vendor logic
5. Create manual override UI
6. Build selection audit log
7. Add rush order priority logic
8. Test with multiple vendor scenarios

---

### Story 7.2: Vendor API Integration (8 points)

**As a** System
**I want** to automatically send orders to vendor APIs
**So that** orders are placed without human intervention

**Acceptance Criteria:**

- [ ] System formats order data per vendor requirements
- [ ] Sends order via vendor's preferred method (API/Email/FTP)
- [ ] Receives confirmation from vendor
- [ ] Stores vendor order ID for tracking
- [ ] Handles authentication and rate limits
- [ ] Retries failed submissions automatically
- [ ] Notifies admin of permanent failures

**Tasks:**

1. Design vendor API adapter pattern
2. Build vendor-specific adapters (PrintFly, 4Over, etc.)
3. Implement authentication handling
4. Create order format transformers
5. Build retry logic with exponential backoff
6. Add rate limiting protection
7. Create failure notification system
8. Test with vendor sandbox environments

**Vendor Integration Plan:**

- **PrintFly** (primary vendor for business cards)
- **4Over** (backup vendor for business cards, primary for flyers)
- **PrintingCenterUSA** (large format printing)

---

### Story 7.3: Order Status Synchronization (5 points)

**As a** Customer
**I want** real-time order status updates
**So that** I know exactly where my order is in production

**Acceptance Criteria:**

- [ ] System polls vendor APIs for status updates
- [ ] Updates order status automatically (PRODUCTION → SHIPPED)
- [ ] Retrieves tracking numbers when available
- [ ] Sends customer notifications on status changes
- [ ] Handles delayed status updates gracefully
- [ ] Detects and alerts on stuck orders
- [ ] Updates expected delivery dates

**Tasks:**

1. Build vendor status polling service
2. Create status mapping (vendor statuses → our statuses)
3. Implement tracking number extraction
4. Add customer notification triggers
5. Build stuck order detection
6. Create delivery date estimation logic
7. Add status change audit log
8. Test with various vendor response formats

---

### Story 7.4: Vendor Error Handling (3 points)

**As an** Admin
**I want** the system to handle vendor errors gracefully
**So that** orders don't get stuck or lost

**Acceptance Criteria:**

- [ ] System detects vendor API failures
- [ ] Automatically retries with exponential backoff
- [ ] Escalates to admin after 3 failed attempts
- [ ] Logs all error details for debugging
- [ ] Provides clear error messages
- [ ] Suggests alternative vendors for failed orders
- [ ] Maintains order integrity during failures

**Tasks:**

1. Build error detection system
2. Implement retry logic (exponential backoff)
3. Create admin escalation workflow
4. Add detailed error logging
5. Build vendor switching logic
6. Create error dashboard
7. Add order integrity checks
8. Test failure scenarios

---

## Technical Architecture

### Vendor Adapter Pattern

```typescript
// src/lib/vendors/vendor-adapter.ts
export interface VendorAdapter {
  name: string

  // Order submission
  submitOrder(order: Order): Promise<VendorOrderResponse>

  // Status tracking
  getOrderStatus(vendorOrderId: string): Promise<VendorStatus>

  // Pricing (for vendor comparison)
  getQuote(orderDetails: OrderDetails): Promise<number>

  // Capabilities
  supportsProduct(productType: string): boolean
  getLeadTime(productType: string): number
}

// Example implementation
export class PrintFlyAdapter implements VendorAdapter {
  name = 'PrintFly'

  async submitOrder(order: Order) {
    // Transform order to PrintFly format
    const printFlyOrder = this.transformOrder(order)

    // Submit via API
    const response = await fetch('https://api.printfly.com/orders', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PRINTFLY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(printFlyOrder),
    })

    return await response.json()
  }

  async getOrderStatus(vendorOrderId: string) {
    const response = await fetch(`https://api.printfly.com/orders/${vendorOrderId}/status`, {
      headers: {
        Authorization: `Bearer ${process.env.PRINTFLY_API_KEY}`,
      },
    })

    const data = await response.json()
    return this.mapStatus(data.status)
  }

  private mapStatus(printFlyStatus: string): VendorStatus {
    const statusMap = {
      received: 'RECEIVED',
      in_production: 'PRODUCTION',
      shipped: 'SHIPPED',
      delivered: 'DELIVERED',
    }
    return statusMap[printFlyStatus] || 'UNKNOWN'
  }
}
```

### Vendor Selection Algorithm

```typescript
// src/lib/vendors/vendor-selector.ts
export class VendorSelector {
  async selectVendor(order: Order): Promise<Vendor> {
    // Get all vendors that support this product type
    const capableVendors = await this.getCapableVendors(order.productType)

    // Score each vendor
    const scoredVendors = await Promise.all(
      capableVendors.map(async (vendor) => ({
        vendor,
        score: await this.scoreVendor(vendor, order),
      }))
    )

    // Sort by score (highest first)
    scoredVendors.sort((a, b) => b.score - a.score)

    // Return top vendor
    return scoredVendors[0].vendor
  }

  private async scoreVendor(vendor: Vendor, order: Order): Promise<number> {
    let score = 100

    // Performance history (40% weight)
    const performance = await this.getVendorPerformance(vendor.id)
    score += (performance.onTimeRate - 0.5) * 40

    // Current capacity (30% weight)
    const capacity = await this.getVendorCapacity(vendor.id)
    score += (capacity.availableCapacity / capacity.totalCapacity) * 30

    // Lead time (20% weight)
    const leadTime = vendor.getLeadTime(order.productType)
    const targetLeadTime = order.rushOrder ? 2 : 5
    score += targetLeadTime >= leadTime ? 20 : 0

    // Price (10% weight)
    const quote = await vendor.getQuote(order)
    const avgPrice = await this.getAveragePrice(order.productType)
    score += ((avgPrice - quote) / avgPrice) * 10

    return score
  }
}
```

### Status Synchronization Service

```typescript
// src/services/vendor-sync-service.ts
export class VendorSyncService {
  // Run every 5 minutes
  async syncOrderStatuses() {
    // Get all orders in vendor processing
    const pendingOrders = await prisma.order.findMany({
      where: {
        status: {
          in: ['PRODUCTION', 'PRINTING', 'SHIPPED'],
        },
        vendorOrderId: { not: null },
      },
      include: { vendor: true },
    })

    // Check status for each order
    for (const order of pendingOrders) {
      try {
        await this.syncOrderStatus(order)
      } catch (error) {
        console.error(`Failed to sync order ${order.id}:`, error)
        await this.handleSyncError(order, error)
      }
    }
  }

  private async syncOrderStatus(order: Order) {
    // Get vendor adapter
    const adapter = this.getVendorAdapter(order.vendor.name)

    // Fetch current status
    const vendorStatus = await adapter.getOrderStatus(order.vendorOrderId)

    // Update if changed
    if (vendorStatus.status !== order.status) {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: vendorStatus.status,
          trackingNumber: vendorStatus.trackingNumber,
          estimatedDelivery: vendorStatus.estimatedDelivery,
        },
      })

      // Notify customer
      await this.notifyCustomer(order, vendorStatus.status)
    }
  }
}
```

---

## Database Schema Updates

```prisma
// Additions to existing Vendor model
model Vendor {
  id                String   @id @default(cuid())
  name              String
  apiEndpoint       String?
  apiKey            String?  // Encrypted
  authType          String   @default("api_key") // api_key, oauth, basic
  supportedProducts String[] // Array of product types
  isActive          Boolean  @default(true)

  // Capacity tracking
  maxDailyOrders    Int      @default(100)
  currentDailyOrders Int     @default(0)

  // Performance metrics
  onTimeRate        Float    @default(0.95)
  qualityScore      Float    @default(0.90)
  avgLeadTime       Int      @default(5) // days

  // Configuration
  config            Json     // Vendor-specific settings

  orders            Order[]
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}

// New model for vendor order tracking
model VendorOrder {
  id              String   @id @default(cuid())
  orderId         String
  order           Order    @relation(fields: [orderId], references: [id])
  vendorId        String
  vendor          Vendor   @relation(fields: [vendorId], references: [id])

  vendorOrderId   String   // Vendor's internal order ID
  vendorStatus    String   // Vendor's raw status
  mappedStatus    String   // Our status

  submittedAt     DateTime @default(now())
  acknowledgedAt  DateTime?
  completedAt     DateTime?

  // Retry tracking
  attemptCount    Int      @default(0)
  lastAttemptAt   DateTime?
  lastError       String?

  // Raw data
  requestPayload  Json     // What we sent
  responsePayload Json?    // What they returned

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

// Error tracking
model VendorError {
  id          String   @id @default(cuid())
  vendorId    String
  vendor      Vendor   @relation(fields: [vendorId], references: [id])
  orderId     String?
  errorType   String   // api_error, timeout, invalid_response, etc.
  errorMessage String
  errorData   Json?
  resolved    Boolean  @default(false)
  resolvedAt  DateTime?
  createdAt   DateTime @default(now())
}
```

---

## API Endpoints

```
Vendor Management:
GET    /api/admin/vendors
GET    /api/admin/vendors/:id
POST   /api/admin/vendors
PUT    /api/admin/vendors/:id
DELETE /api/admin/vendors/:id
POST   /api/admin/vendors/:id/test  // Test API connection

Vendor Order Processing:
POST   /api/admin/orders/:id/submit-to-vendor  // Manual submission
POST   /api/admin/orders/:id/sync-status       // Force status sync
GET    /api/admin/orders/:id/vendor-details    // View vendor response

Vendor Performance:
GET    /api/admin/vendors/:id/performance
GET    /api/admin/vendors/:id/orders
GET    /api/admin/vendors/compare

Automation (Internal):
POST   /api/cron/sync-vendor-statuses  // Called by cron job
POST   /api/cron/submit-pending-orders // Auto-submit approved orders
```

---

## Testing Strategy

### Unit Tests

- Vendor adapter implementations
- Status mapping logic
- Vendor selection algorithm
- Error handling and retry logic

### Integration Tests

- API submissions to vendor sandboxes
- Status polling and updates
- Error detection and recovery
- Order lifecycle (submit → track → complete)

### E2E Tests

1. Create order → Auto-assign vendor → Submit → Track → Complete
2. Vendor API failure → Retry → Switch vendor → Success
3. Status sync → Customer notification
4. Rush order → Fast vendor selection

---

## Success Metrics

### Launch Criteria

- [ ] 3+ vendor adapters implemented and tested
- [ ] Automated vendor selection working
- [ ] Status sync running every 5 minutes
- [ ] Error detection and retry logic functioning
- [ ] Manual override capability available
- [ ] Admin dashboard showing vendor performance

### Performance Targets

- Vendor selection time: <2 seconds
- Order submission time: <10 seconds
- Status sync latency: <5 minutes
- Error recovery rate: >95%

### Business Metrics (30 days post-launch)

- Order processing time reduced by 80%
- Vendor coordination time: <5 minutes per order
- Automated order rate: >90%
- Vendor error rate: <2%
- Customer satisfaction with updates: >85%

---

## Risks & Mitigation

### Risk 1: Vendor API Changes

**Impact:** High
**Probability:** Medium
**Mitigation:**

- Version all API integrations
- Monitor for API deprecation notices
- Build adapter abstraction layer
- Test vendor APIs weekly

### Risk 2: Vendor Downtime

**Impact:** High
**Probability:** Low
**Mitigation:**

- Maintain 2+ vendors per product type
- Automatic failover to backup vendor
- Queue orders during downtime
- Real-time status monitoring

### Risk 3: Status Sync Delays

**Impact:** Medium
**Probability:** Medium
**Mitigation:**

- Poll vendor APIs every 5 minutes
- Webhook support where available
- Customer expectations set correctly
- Manual status override option

---

## Timeline

### Week 1: Foundation

- Vendor adapter pattern implementation
- Vendor selection algorithm
- Database schema updates
- Admin vendor management UI

### Week 2: Integration

- PrintFly adapter implementation
- 4Over adapter implementation
- Order submission logic
- Error handling system

### Week 3: Automation

- Status synchronization service
- Automated order routing
- Retry logic
- Performance monitoring

---

## Dependencies

**Required:**

- Epic 5: Admin Order Management (complete)
- Vendor API credentials and documentation
- Vendor sandbox access for testing

**Optional:**

- N8N workflow automation (can enhance but not required)
- Monitoring system (Sentry) for error tracking

---

**Epic Owner:** Technical Lead
**Status:** 50% Complete (Partial)
**Last Updated:** October 3, 2025
