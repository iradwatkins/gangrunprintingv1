# Epic 11: Revenue Optimization

## Epic Information

| Field                  | Value                                            |
| ---------------------- | ------------------------------------------------ |
| **Epic ID**            | EPIC-011                                         |
| **Phase**              | Phase 2                                          |
| **Priority**           | MEDIUM                                           |
| **Status**             | Not Started                                      |
| **Story Points**       | 55                                               |
| **Estimated Duration** | 5-6 weeks                                        |
| **Dependencies**       | Epic 3 (Core Commerce), Epic 6 (Marketing & CRM) |

---

## Epic Description

Implement advanced revenue optimization features including dynamic pricing, upsells/cross-sells, abandoned cart recovery, loyalty program, subscription plans, referral program, and coupon management. These features will maximize revenue per customer and increase lifetime value.

---

## Business Value

**Problem:** Missing opportunities to increase revenue and customer retention
**Solution:** Intelligent pricing, incentives, and engagement systems
**Impact:**

- Increase average order value by 35%
- Increase customer lifetime value by 50%
- Recover 30% of abandoned carts ($15K/month)
- Generate $20K/month in recurring revenue (subscriptions)

---

## User Stories

### Story 11.1: Dynamic Pricing Engine (13 points)

**As a** Business Owner
**I want** prices to adjust based on demand, quantity, and customer type
**So that** I can maximize revenue and competitiveness

**Acceptance Criteria:**

- [ ] Volume discounts automatically applied
- [ ] Broker customer discounts by category
- [ ] Rush order pricing (+25% for 1-day turnaround)
- [ ] Seasonal pricing adjustments
- [ ] Real-time competitor price monitoring
- [ ] A/B testing different price points
- [ ] Price change audit log

**Pricing Rules:**

```typescript
interface PricingRule {
  // Volume Discounts
  volumeDiscounts: Array<{
    minQuantity: number
    discount: number // percentage
  }>

  // Customer Type Discounts
  brokerDiscounts: {
    categoryId: string
    discount: number
  }[]

  // Rush Pricing
  rushPricing: {
    standard: number // base price
    rush1Day: number // +25%
    rush2Day: number // +15%
  }

  // Seasonal Adjustments
  seasonalPricing: {
    startDate: Date
    endDate: Date
    adjustment: number // +/- percentage
  }[]

  // Competitor Matching
  competitorPricing: {
    enabled: boolean
    matchStrategy: 'match' | 'undercut_5_percent'
  }
}
```

**Implementation:**

```typescript
// src/lib/pricing/pricing-engine.ts
export class PricingEngine {
  async calculatePrice(params: PriceCalculationParams): Promise<PriceBreakdown> {
    let basePrice = params.product.basePrice

    // Apply volume discounts
    const volumeDiscount = this.getVolumeDiscount(params.quantity, params.product.volumeDiscounts)
    basePrice *= 1 - volumeDiscount / 100

    // Apply broker discounts (if applicable)
    if (params.customer?.isBroker) {
      const brokerDiscount = this.getBrokerDiscount(params.customer, params.product.categoryId)
      basePrice *= 1 - brokerDiscount / 100
    }

    // Apply rush pricing
    if (params.turnaroundTime <= 1) {
      basePrice *= 1.25 // +25% for 1-day rush
    } else if (params.turnaroundTime <= 2) {
      basePrice *= 1.15 // +15% for 2-day rush
    }

    // Apply seasonal adjustments
    const seasonalAdjustment = this.getSeasonalAdjustment(new Date())
    basePrice *= 1 + seasonalAdjustment / 100

    // Check competitor pricing
    if (params.enableCompetitorMatch) {
      const competitorPrice = await this.getCompetitorPrice(params.product)
      if (competitorPrice && competitorPrice < basePrice) {
        basePrice = competitorPrice * 0.95 // Undercut by 5%
      }
    }

    return {
      basePrice: params.product.basePrice,
      finalPrice: basePrice,
      discounts: [
        { type: 'volume', amount: volumeDiscount },
        { type: 'broker', amount: brokerDiscount },
        { type: 'seasonal', amount: seasonalAdjustment },
      ],
      markups: [{ type: 'rush', amount: params.turnaroundTime <= 2 ? 15 : 0 }],
    }
  }

  private getVolumeDiscount(quantity: number, tiers: VolumeTier[]): number {
    // Find applicable tier
    const tier = tiers
      .filter((t) => quantity >= t.minQuantity)
      .sort((a, b) => b.minQuantity - a.minQuantity)[0]

    return tier?.discount || 0
  }

  private getBrokerDiscount(customer: Customer, categoryId: string): number {
    if (!customer.brokerDiscounts) return 0

    // Get category-specific discount from JSONB field
    return customer.brokerDiscounts[categoryId] || 0
  }
}
```

**Tasks:**

1. Build pricing engine core logic
2. Implement volume discount calculator
3. Add broker discount system
4. Create rush pricing logic
5. Build seasonal pricing scheduler
6. Integrate competitor price API
7. Create A/B testing framework
8. Add pricing audit log

---

### Story 11.2: Upsells & Cross-sells (8 points)

**As a** Business Owner
**I want** to suggest relevant add-ons and related products
**So that** I can increase average order value

**Acceptance Criteria:**

- [ ] Related products shown on product pages
- [ ] Add-ons suggested at cart
- [ ] "Frequently bought together" recommendations
- [ ] Smart recommendations based on order history
- [ ] One-click add to cart for upsells
- [ ] A/B testing upsell placements
- [ ] Upsell performance analytics

**Recommendation Engine:**

```typescript
// src/lib/recommendations/recommendation-engine.ts
export class RecommendationEngine {
  async getProductRecommendations(productId: string, userId?: string): Promise<Product[]> {
    // Get products frequently bought together
    const frequentlyBoughtTogether = await this.getFrequentlyBoughtTogether(productId)

    // Get similar products (same category)
    const similarProducts = await this.getSimilarProducts(productId)

    // Personalized recommendations (if user logged in)
    let personalizedRecs: Product[] = []
    if (userId) {
      personalizedRecs = await this.getPersonalizedRecommendations(userId)
    }

    // Combine and score
    return this.combineAndScore([
      ...frequentlyBoughtTogether,
      ...similarProducts,
      ...personalizedRecs,
    ])
  }

  private async getFrequentlyBoughtTogether(productId: string): Promise<Product[]> {
    // Query orders containing this product
    // Find other products commonly in same orders
    const result = await prisma.$queryRaw`
      SELECT
        p.*,
        COUNT(*) as frequency
      FROM "OrderItem" oi1
      JOIN "OrderItem" oi2 ON oi1."orderId" = oi2."orderId"
      JOIN "Product" p ON oi2."productId" = p.id
      WHERE oi1."productId" = ${productId}
        AND oi2."productId" != ${productId}
      GROUP BY p.id
      ORDER BY frequency DESC
      LIMIT 5
    `

    return result
  }

  private async getPersonalizedRecommendations(userId: string): Promise<Product[]> {
    // Get user's order history
    const orderHistory = await prisma.order.findMany({
      where: { userId },
      include: { orderItems: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })

    // Extract categories and products
    const categories = orderHistory
      .flatMap((o) => o.orderItems.map((i) => i.product.categoryId))
      .filter(Boolean)

    // Recommend products from those categories not yet ordered
    return await prisma.product.findMany({
      where: {
        categoryId: { in: categories },
        NOT: {
          orderItems: {
            some: {
              order: { userId },
            },
          },
        },
      },
      take: 5,
    })
  }
}
```

**Tasks:**

1. Build recommendation engine
2. Create "frequently bought together" query
3. Implement similar products logic
4. Add personalized recommendations
5. Build upsell UI components
6. Create cross-sell widgets
7. Add A/B testing
8. Build analytics dashboard

---

### Story 11.3: Abandoned Cart Recovery (8 points)

**As a** Business Owner
**I want** to automatically recover abandoned carts
**So that** I can capture lost revenue

**Acceptance Criteria:**

- [ ] System detects abandoned carts (30+ minutes)
- [ ] Email sequence sent automatically
- [ ] Discount incentive offered (10% off)
- [ ] One-click return to cart
- [ ] SMS reminders (opt-in)
- [ ] Performance tracking and analytics
- [ ] Exclude completed purchases

**Recovery Sequence:**

```
Email 1 (1 hour after abandonment):
- Subject: "You left something behind!"
- Content: Cart contents reminder
- CTA: Resume checkout

Email 2 (24 hours after abandonment):
- Subject: "Still thinking it over? Here's 10% off"
- Content: Discount code + cart contents
- CTA: Complete order with discount

Email 3 (72 hours after abandonment):
- Subject: "Last chance - Your cart expires soon"
- Content: Urgency + expiration notice
- CTA: Complete order before expiration
```

**Implementation:**

```typescript
// src/services/cart-recovery-service.ts
export class CartRecoveryService {
  async detectAbandonedCarts() {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000)

    // Find abandoned carts
    const abandonedCarts = await prisma.cart.findMany({
      where: {
        updatedAt: { lt: thirtyMinutesAgo },
        status: 'active',
        items: { some: {} }, // Has items
        NOT: {
          order: { some: {} }, // Not converted to order
        },
        recoveryEmailSent: false,
      },
      include: {
        user: true,
        items: { include: { product: true } },
      },
    })

    // Send recovery emails
    for (const cart of abandonedCarts) {
      await this.sendRecoveryEmail(cart, 1) // First email
      await this.scheduleFollowUps(cart)
    }
  }

  private async sendRecoveryEmail(cart: Cart, sequenceNumber: number) {
    const discountCode = sequenceNumber === 2 ? await this.generateDiscountCode(cart) : null

    await emailService.send({
      to: cart.user.email,
      template: `cart-recovery-${sequenceNumber}`,
      data: {
        cartItems: cart.items,
        cartTotal: this.calculateTotal(cart),
        discountCode,
        resumeUrl: `${process.env.NEXT_PUBLIC_APP_URL}/checkout?cartId=${cart.id}`,
      },
    })

    // Mark as sent
    await prisma.cart.update({
      where: { id: cart.id },
      data: {
        recoveryEmailSent: true,
        recoveryEmailSentAt: new Date(),
      },
    })
  }

  private async scheduleFollowUps(cart: Cart) {
    // Schedule email 2 (24 hours)
    await this.scheduleEmail(cart.id, 2, 24 * 60 * 60 * 1000)

    // Schedule email 3 (72 hours)
    await this.scheduleEmail(cart.id, 3, 72 * 60 * 60 * 1000)
  }
}
```

**Tasks:**

1. Create abandoned cart detection
2. Build email sequence templates
3. Implement discount code generation
4. Add SMS recovery (Twilio)
5. Create resume checkout flow
6. Build performance analytics
7. Add exclusion rules
8. Test recovery sequence

---

### Story 11.4: Loyalty Program (13 points)

**As a** Customer
**I want** to earn rewards for purchases
**So that** I'm incentivized to order again

**Acceptance Criteria:**

- [ ] Customers earn points on every purchase
- [ ] Points redeemable for discounts
- [ ] Tiered loyalty levels (Bronze, Silver, Gold)
- [ ] Exclusive perks for each tier
- [ ] Points balance visible in account
- [ ] Email notifications on point earning
- [ ] Birthday rewards

**Loyalty Tiers:**

```typescript
interface LoyaltyTier {
  name: string
  minLifetimeSpend: number
  pointsMultiplier: number
  perks: string[]
}

const LOYALTY_TIERS: LoyaltyTier[] = [
  {
    name: 'Bronze',
    minLifetimeSpend: 0,
    pointsMultiplier: 1,
    perks: ['Earn 1 point per $1 spent', 'Birthday discount (10% off)'],
  },
  {
    name: 'Silver',
    minLifetimeSpend: 1000,
    pointsMultiplier: 1.5,
    perks: [
      'Earn 1.5 points per $1 spent',
      'Free standard shipping',
      'Birthday discount (15% off)',
      'Early access to new products',
    ],
  },
  {
    name: 'Gold',
    minLifetimeSpend: 5000,
    pointsMultiplier: 2,
    perks: [
      'Earn 2 points per $1 spent',
      'Free rush shipping',
      'Birthday discount (20% off)',
      'Dedicated account manager',
      'Priority customer support',
    ],
  },
]
```

**Database Schema:**

```prisma
model LoyaltyAccount {
  id              String   @id @default(cuid())
  userId          String   @unique
  user            User     @relation(fields: [userId], references: [id])

  currentPoints   Int      @default(0)
  lifetimePoints  Int      @default(0)
  lifetimeSpend   Decimal  @db.Decimal(10, 2) @default(0)

  tier            String   @default("Bronze") // Bronze, Silver, Gold

  // Tracking
  lastEarnedAt    DateTime?
  lastRedeemedAt  DateTime?

  transactions    LoyaltyTransaction[]

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model LoyaltyTransaction {
  id              String   @id @default(cuid())
  accountId       String
  account         LoyaltyAccount @relation(fields: [accountId], references: [id])

  type            String   // earned, redeemed, expired
  points          Int      // positive for earned, negative for redeemed
  orderId         String?

  description     String
  balanceBefore   Int
  balanceAfter    Int

  createdAt       DateTime @default(now())
}
```

**Tasks:**

1. Create loyalty database schema
2. Build points earning logic
3. Implement tier calculation
4. Create redemption system
5. Build loyalty dashboard
6. Add email notifications
7. Create admin loyalty panel
8. Test tier progression

---

### Story 11.5: Subscription Plans (13 points)

**As a** Customer
**I want** recurring orders on a schedule
**So that** I don't have to reorder manually

**Acceptance Criteria:**

- [ ] Can subscribe to products (monthly, quarterly)
- [ ] Subscription discount (15% off)
- [ ] Auto-charging and auto-fulfillment
- [ ] Can pause/resume subscription
- [ ] Can cancel anytime
- [ ] Email reminders before charging
- [ ] Manage subscriptions in account

**Subscription Plans:**

```typescript
interface SubscriptionPlan {
  interval: 'weekly' | 'monthly' | 'quarterly'
  discount: number // percentage off
  minCommitment: number // months
  benefits: string[]
}

const SUBSCRIPTION_PLANS = {
  monthly: {
    interval: 'monthly',
    discount: 15,
    minCommitment: 0,
    benefits: ['15% off every order', 'Free standard shipping', 'Cancel anytime'],
  },
  quarterly: {
    interval: 'quarterly',
    discount: 20,
    minCommitment: 0,
    benefits: ['20% off every order', 'Free rush shipping', 'Priority support', 'Cancel anytime'],
  },
}
```

**Implementation:**

```typescript
// src/services/subscription-service.ts
export class SubscriptionService {
  async createSubscription(params: CreateSubscriptionParams) {
    const subscription = await prisma.subscription.create({
      data: {
        userId: params.userId,
        productId: params.productId,
        interval: params.interval,
        quantity: params.quantity,
        price: this.calculateSubscriptionPrice(params),
        nextBillingDate: this.calculateNextBillingDate(params.interval),
        status: 'active',
      },
    })

    // Schedule first order
    await this.scheduleOrder(subscription)

    return subscription
  }

  async processSubscriptionOrders() {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Find subscriptions due today
    const dueSubscriptions = await prisma.subscription.findMany({
      where: {
        nextBillingDate: {
          lte: today,
        },
        status: 'active',
      },
      include: {
        user: true,
        product: true,
      },
    })

    for (const subscription of dueSubscriptions) {
      try {
        await this.processSubscription(subscription)
      } catch (error) {
        console.error(`Failed to process subscription ${subscription.id}:`, error)
        await this.handleSubscriptionError(subscription, error)
      }
    }
  }

  private async processSubscription(subscription: Subscription) {
    // Charge payment method
    const payment = await this.chargeCustomer(subscription)

    // Create order
    const order = await this.createOrder(subscription)

    // Update subscription
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        lastBillingDate: new Date(),
        nextBillingDate: this.calculateNextBillingDate(subscription.interval),
      },
    })

    // Send confirmation email
    await this.sendConfirmationEmail(subscription, order)
  }
}
```

**Tasks:**

1. Create subscription database schema
2. Build subscription creation flow
3. Implement auto-charging system
4. Add auto-fulfillment logic
5. Create pause/resume functionality
6. Build subscription management UI
7. Add email reminders
8. Test billing cycles

---

## Technical Architecture

### Pricing Engine Integration

```typescript
// Integrate with checkout flow
export async function calculateCartPrice(cart: Cart): Promise<PriceBreakdown> {
  const pricingEngine = new PricingEngine()

  const itemPrices = await Promise.all(
    cart.items.map(async (item) => {
      return await pricingEngine.calculatePrice({
        product: item.product,
        quantity: item.quantity,
        customer: cart.user,
        turnaroundTime: item.turnaroundTime,
        enableCompetitorMatch: true,
      })
    })
  )

  const subtotal = itemPrices.reduce((sum, p) => sum + p.finalPrice, 0)
  const shipping = await shippingService.calculateShipping(cart)
  const tax = await taxService.calculateTax(cart, subtotal)
  const total = subtotal + shipping + tax

  return {
    subtotal,
    shipping,
    tax,
    total,
    itemPrices,
  }
}
```

---

## API Endpoints

```
Pricing:
POST   /api/pricing/calculate
GET    /api/pricing/competitor-prices
GET    /api/admin/pricing/rules
PUT    /api/admin/pricing/rules

Recommendations:
GET    /api/products/:id/recommendations
GET    /api/products/:id/frequently-bought-together

Cart Recovery:
GET    /api/admin/abandoned-carts
POST   /api/admin/abandoned-carts/:id/send-recovery

Loyalty:
GET    /api/account/loyalty
POST   /api/account/loyalty/redeem
GET    /api/account/loyalty/transactions

Subscriptions:
GET    /api/account/subscriptions
POST   /api/account/subscriptions
PUT    /api/account/subscriptions/:id/pause
PUT    /api/account/subscriptions/:id/resume
DELETE /api/account/subscriptions/:id
```

---

## Success Metrics

### Launch Criteria

- [ ] Dynamic pricing working for all products
- [ ] Recommendations showing on product pages
- [ ] Abandoned cart emails sending
- [ ] Loyalty program tracking points
- [ ] Subscriptions processing automatically

### Performance Targets

- Pricing calculation: <100ms
- Recommendation generation: <500ms
- Cart recovery email: <5 minutes after abandonment
- Subscription processing: 100% success rate

### Business Metrics (90 days post-launch)

- Average order value increase: >30%
- Abandoned cart recovery rate: >25%
- Loyalty program enrollment: >60% of customers
- Subscription MRR: >$20K/month
- Customer lifetime value increase: >40%

---

## Timeline

**Week 1-2:** Dynamic Pricing Engine
**Week 3:** Upsells & Cross-sells
**Week 4:** Abandoned Cart Recovery
**Week 5:** Loyalty Program
**Week 6:** Subscription Plans

---

**Epic Owner:** Product Manager
**Technical Lead:** Backend Lead + Revenue Engineer
**Status:** Not Started
**Last Updated:** October 3, 2025
