# FunnelKit Integration - Complete Implementation Guide

**Date:** October 6, 2025
**Status:** ✅ Database Schema Complete - Ready for Week 2 UI Implementation
**Integration Strategy:** Native Integration with Existing GangRun Platform

---

## 🎯 **Executive Summary**

FunnelKit has been **fully integrated** into the existing GangRun Printing platform with **zero conflicts**. All funnel models leverage existing infrastructure (User, Product, Order systems) for seamless operation.

### **What Was Added:**

- ✅ 8 new database models (Funnel, FunnelStep, FunnelStepProduct, OrderBump, Upsell, Downsell, FunnelAnalytics, FunnelVisit)
- ✅ 4 new enums (FunnelStatus, FunnelStepType, DiscountType, BumpPosition)
- ✅ 2 fields added to Order model (funnelId, funnelStepId) for tracking
- ✅ 4 relations added to Product model (FunnelStepProduct, OrderBump, Upsell, Downsell)
- ✅ 2 relations added to User model (Funnel, FunnelVisit)
- ✅ Full TypeScript types generated via Prisma Client

---

## 📊 **Database Schema Overview**

### **Core Funnel Models**

#### **1. Funnel (Main Container)**

```typescript
model Funnel {
  id               String       @id
  userId           String       // Links to User (funnel owner)
  name             String
  slug             String       @unique
  description      String?
  status           FunnelStatus @default(DRAFT)
  currency         String       @default("USD")
  timezone         String       @default("America/Chicago")

  // SEO & Tracking
  utmTracking      Json?        // {source, medium, campaign, term, content}
  seoTitle         String?
  seoDescription   String?
  ogImage          String?
  customDomain     String?
  pixelIds         Json?        // {facebook, google, tiktok}

  // Performance Metrics
  totalViews       Int          @default(0)
  totalConversions Int          @default(0)
  totalRevenue     Float        @default(0)

  settings         Json?
  createdAt        DateTime     @default(now())
  updatedAt        DateTime

  // Relations
  User            User              @relation(...)
  FunnelStep      FunnelStep[]
  FunnelAnalytics FunnelAnalytics[]
  FunnelVisit     FunnelVisit[]
  Order           Order[]
}
```

**Key Integration Points:**

- `userId` → `User.id` (existing auth system)
- `Order.funnelId` → `Funnel.id` (revenue tracking)

---

#### **2. FunnelStep (Individual Pages)**

```typescript
model FunnelStep {
  id             String         @id
  funnelId       String
  name           String
  slug           String         // URL segment
  type           FunnelStepType // LANDING, CHECKOUT, UPSELL, DOWNSELL, THANKYOU
  position       Int            // Order in sequence

  config         Json           // Template, layout, content
  design         Json?          // Style overrides

  seoTitle       String?
  seoDescription String?
  isActive       Boolean        @default(true)

  // Performance Metrics
  views          Int            @default(0)
  conversions    Int            @default(0)
  revenue        Float          @default(0)

  createdAt      DateTime       @default(now())
  updatedAt      DateTime

  // Relations
  Funnel            Funnel              @relation(...)
  FunnelStepProduct FunnelStepProduct[]
  OrderBump         OrderBump[]
  Upsell            Upsell[]
  Downsell          Downsell[]
  FunnelAnalytics   FunnelAnalytics[]
}
```

**Unique Constraints:**

- `@@unique([funnelId, position])` - No duplicate step positions
- `@@unique([funnelId, slug])` - No duplicate URLs within funnel

---

#### **3. FunnelStepProduct (Products in Steps)**

```typescript
model FunnelStepProduct {
  id            String        @id
  funnelStepId  String
  productId     String        // → Product.id (existing products)
  quantity      Int           @default(1)
  priceOverride Float?        // Optional funnel-specific pricing
  discountType  DiscountType?
  discountValue Float?
  isDefault     Boolean       @default(false)
  sortOrder     Int           @default(0)

  // Relations
  FunnelStep FunnelStep @relation(...)
  Product    Product    @relation(...) // USES EXISTING PRODUCTS!
}
```

**Key Integration:** Leverages existing `Product` model - no product duplication needed!

---

#### **4. OrderBump (Checkout Add-ons)**

```typescript
model OrderBump {
  id            String        @id
  funnelStepId  String
  productId     String        // → Product.id
  headline      String
  description   String?
  discountType  DiscountType?
  discountValue Float?
  position      BumpPosition  @default(ABOVE_PAYMENT)
  displayRules  Json?         // {minCartValue, categories, etc}
  design        Json?

  // Performance Metrics
  views         Int           @default(0)
  accepts       Int           @default(0)
  revenue       Float         @default(0)
  isActive      Boolean       @default(true)

  // Relations
  FunnelStep FunnelStep @relation(...)
  Product    Product    @relation(...)
}
```

---

#### **5. Upsell & 6. Downsell (Post-Purchase Offers)**

```typescript
model Upsell {
  id            String        @id
  funnelStepId  String
  productId     String
  headline      String
  description   String?
  discountType  DiscountType?
  discountValue Float?
  downsellId    String?       // Optional linked downsell
  design        Json?

  // Performance Metrics
  views         Int           @default(0)
  accepts       Int           @default(0)
  rejects       Int           @default(0)
  revenue       Float         @default(0)
  isActive      Boolean       @default(true)
}

model Downsell {
  // Similar structure to Upsell
  // Shown when upsell is rejected
}
```

---

#### **7. FunnelAnalytics (Time-Series Metrics)**

```typescript
model FunnelAnalytics {
  id             String   @id
  funnelId       String
  funnelStepId   String?     // NULL = funnel-level, SET = step-level
  date           DateTime @default(now())

  // Metrics
  views          Int      @default(0)
  uniqueVisitors Int      @default(0)
  conversions    Int      @default(0)
  revenue        Float    @default(0)
  avgTimeOnPage  Int?     // Seconds
  bounceRate     Float?   // Percentage
  exitRate       Float?   // Percentage

  sourceData     Json?    // UTM tracking, referrers
  deviceData     Json?    // {desktop, mobile, tablet}

  @@unique([funnelId, funnelStepId, date]) // One record per funnel/step/day
}
```

---

#### **8. FunnelVisit (Session Tracking)**

```typescript
model FunnelVisit {
  id            String    @id
  funnelId      String
  sessionId     String    // Browser session identifier
  userId        String?   // NULL if anonymous

  // Current State
  currentStepId String?
  entryStepId   String?

  // Attribution
  utmSource     String?
  utmMedium     String?
  utmCampaign   String?
  utmTerm       String?
  utmContent    String?
  referrer      String?

  // Device Info
  device        String?   // desktop, mobile, tablet
  browser       String?
  os            String?

  // Location
  country       String?
  region        String?
  city          String?
  ipAddress     String?

  // Conversion
  convertedAt   DateTime?
  orderId       String?   // → Order.id if converted

  // Relations
  Funnel Funnel @relation(...)
  User   User?  @relation(...)
}
```

---

## 🔗 **Integration Points with Existing Platform**

### **1. User System Integration**

```typescript
// User model (EXISTING) - NEW RELATIONS ADDED:
model User {
  // ... existing fields ...
  Funnel      Funnel[]      // User can create multiple funnels
  FunnelVisit FunnelVisit[] // Track user's funnel activity
}
```

**Usage:**

```typescript
// Get all funnels created by admin user
const userFunnels = await prisma.funnel.findMany({
  where: { userId: user.id },
  include: { FunnelStep: true },
})
```

---

### **2. Product System Integration**

```typescript
// Product model (EXISTING) - NEW RELATIONS ADDED:
model Product {
  // ... existing fields ...
  FunnelStepProduct FunnelStepProduct[] // Products in funnel steps
  OrderBump         OrderBump[]         // Products as order bumps
  Upsell            Upsell[]            // Products as upsells
  Downsell          Downsell[]          // Products as downsells
}
```

**Usage:**

```typescript
// Add existing product to funnel step
await prisma.funnelStepProduct.create({
  data: {
    funnelStepId: step.id,
    productId: 'existing-product-123', // Use existing product!
    priceOverride: 24.99, // Optional funnel pricing
    discountType: 'PERCENTAGE',
    discountValue: 20,
  },
})
```

---

### **3. Order System Integration**

```typescript
// Order model (EXISTING) - NEW FIELDS ADDED:
model Order {
  // ... existing fields ...
  funnelId     String? // Track which funnel generated order
  funnelStepId String? // Track which step converted

  Funnel Funnel? @relation(...)

  @@index([funnelId])
  @@index([funnelStepId])
}
```

**Usage:**

```typescript
// Create order from funnel checkout
const order = await prisma.order.create({
  data: {
    // ... existing order fields ...
    funnelId: funnel.id,
    funnelStepId: checkoutStep.id,
    userId: user.id,
    // Square payment, shipping, etc (existing logic)
  },
})

// Query funnel-generated orders
const funnelRevenue = await prisma.order.aggregate({
  where: { funnelId: funnel.id, status: 'PAID' },
  _sum: { total: true },
})
```

---

## 🎨 **Enums Reference**

### **FunnelStatus**

```typescript
enum FunnelStatus {
  DRAFT    // Being created/edited
  ACTIVE   // Live and accepting traffic
  PAUSED   // Temporarily disabled
  ARCHIVED // Completed/historical
}
```

### **FunnelStepType**

```typescript
enum FunnelStepType {
  LANDING   // Landing page (top of funnel)
  CHECKOUT  // Checkout page
  UPSELL    // Post-purchase upsell offer
  DOWNSELL  // Alternative offer after upsell rejection
  THANKYOU  // Order confirmation page
}
```

### **DiscountType**

```typescript
enum DiscountType {
  PERCENTAGE // e.g., 20% off
  FIXED      // e.g., $10 off
}
```

### **BumpPosition**

```typescript
enum BumpPosition {
  ABOVE_PAYMENT // Before payment form
  BELOW_PAYMENT // After payment form
  SIDEBAR       // In sidebar
}
```

---

## 📁 **File Structure**

### **Database Files**

```
prisma/
├── schema.prisma          # Main schema (UPDATED with Funnel models)
└── migrations/            # Auto-generated migrations
```

### **Components to Create (Week 2+)**

```
src/
├── app/
│   ├── admin/
│   │   └── funnels/       # TO CREATE
│   │       ├── page.tsx   # Funnel dashboard
│   │       └── [id]/      # Funnel editor
│   └── funnel/
│       └── [slug]/        # TO CREATE - Public funnel pages
│           ├── [step]/    # Dynamic funnel step rendering
│           └── page.tsx
│
├── components/
│   └── funnels/           # TO CREATE
│       ├── funnel-stats.tsx
│       ├── funnels-table.tsx
│       ├── create-funnel-button.tsx
│       ├── funnel-canvas.tsx      # Visual builder
│       └── step-editor.tsx        # Step configuration
│
└── lib/
    └── funnel/            # TO CREATE
        ├── funnel-service.ts      # Business logic
        └── funnel-analytics.ts    # Metrics calculation
```

---

## 🚀 **Next Steps: Week 2 Implementation**

### **Day 6: Funnel Dashboard (READY TO START)**

The code you were given can now be implemented! All database dependencies are satisfied.

**Create these files:**

1. **`/src/app/admin/funnels/page.tsx`**

   ```typescript
   import { validateRequest } from '@/lib/auth'
   import { prisma } from '@/lib/prisma'
   // ... (use your Week 2 Day 6 code)

   // This will now work because Funnel model exists!
   const funnels = await prisma.funnel.findMany({
     where: { userId: user.id },
     include: {
       FunnelStep: { orderBy: { position: 'asc' } },
       _count: { select: { FunnelStep: true } },
     },
   })
   ```

2. **`/src/components/funnels/funnel-stats.tsx`**
   - Uses provided Week 2 Day 6 code
   - Displays: Total Funnels, Views, Revenue, Conversion Rate

3. **`/src/components/funnels/funnels-table.tsx`**
   - Uses provided Week 2 Day 6 code
   - Shows funnel list with actions (Edit, Duplicate, Delete)

4. **`/src/components/funnels/create-funnel-button.tsx`**
   - Uses provided Week 2 Day 6 code
   - Modal dialog for creating new funnel

---

## 🔍 **Testing the Schema**

### **Create a Test Funnel**

```typescript
// scripts/test-funnel-creation.ts
import { prisma } from '@/lib/prisma'

async function testFunnelCreation() {
  // 1. Get admin user
  const admin = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
  })

  if (!admin) throw new Error('No admin user found')

  // 2. Create funnel
  const funnel = await prisma.funnel.create({
    data: {
      id: 'funnel-' + Date.now(),
      userId: admin.id,
      name: 'Test Business Card Funnel',
      slug: 'business-card-funnel-test',
      description: 'Test funnel for business cards',
      status: 'DRAFT',
      currency: 'USD',
      timezone: 'America/Chicago',
    },
  })

  console.log('✅ Funnel created:', funnel.id)

  // 3. Add checkout step
  const checkoutStep = await prisma.funnelStep.create({
    data: {
      id: 'step-' + Date.now(),
      funnelId: funnel.id,
      name: 'Checkout',
      slug: 'checkout',
      type: 'CHECKOUT',
      position: 1,
      config: {
        template: 'default-checkout',
        layout: 'single-column',
      },
    },
  })

  console.log('✅ Checkout step created:', checkoutStep.id)

  // 4. Get existing product
  const product = await prisma.product.findFirst({
    where: { isActive: true },
  })

  if (!product) {
    console.log('❌ No products found - create products first')
    return
  }

  // 5. Add product to step
  await prisma.funnelStepProduct.create({
    data: {
      id: 'fsp-' + Date.now(),
      funnelStepId: checkoutStep.id,
      productId: product.id,
      quantity: 1,
      isDefault: true,
      sortOrder: 0,
    },
  })

  console.log('✅ Product added to funnel step')

  // 6. Query complete funnel
  const completeFunnel = await prisma.funnel.findUnique({
    where: { id: funnel.id },
    include: {
      FunnelStep: {
        include: {
          FunnelStepProduct: {
            include: { Product: true },
          },
        },
      },
    },
  })

  console.log('✅ Complete funnel:', JSON.stringify(completeFunnel, null, 2))
}

testFunnelCreation().catch(console.error)
```

**Run test:**

```bash
npx tsx scripts/test-funnel-creation.ts
```

---

## ✅ **Validation Checklist**

- [x] Prisma schema updated with 8 new models
- [x] Schema formatted and validated (no syntax errors)
- [x] Database pushed successfully (`prisma db push`)
- [x] Prisma Client generated with new types
- [x] Existing models (User, Product, Order) extended with FK relations
- [x] No breaking changes to existing functionality
- [x] All indexes created for query performance
- [x] Enums defined for type safety

---

## 📚 **Key Relationships Summary**

```
User (existing)
 ├─> Funnel (1:many)
 │    ├─> FunnelStep (1:many)
 │    │    ├─> FunnelStepProduct (1:many) ──> Product (existing)
 │    │    ├─> OrderBump (1:many) ──> Product (existing)
 │    │    ├─> Upsell (1:many) ──> Product (existing)
 │    │    └─> Downsell (1:many) ──> Product (existing)
 │    ├─> FunnelAnalytics (1:many)
 │    ├─> FunnelVisit (1:many)
 │    └─> Order (1:many) (existing)
 └─> FunnelVisit (1:many)

Product (existing)
 ├─> FunnelStepProduct (1:many)
 ├─> OrderBump (1:many)
 ├─> Upsell (1:many)
 └─> Downsell (1:many)

Order (existing)
 └─> Funnel (many:1) - tracks which funnel generated order
```

---

## 🎉 **MILESTONE COMPLETE: Foundation Ready**

**Status:** ✅ **Week 1 Complete - Database Foundation Established**

**Ready for:** Week 2 UI Implementation (Dashboard, Visual Builder)

**Next Command:** Start implementing the Week 2 Day 6 code you were provided!

---

**Integration By:** James (AI Developer)
**Date:** October 6, 2025
**Verified:** Schema validated, database synced, Prisma Client generated
