# Epic 8: Advanced Payment Integration

## Epic Information

| Field                  | Value                                   |
| ---------------------- | --------------------------------------- |
| **Epic ID**            | EPIC-008                                |
| **Phase**              | Phase 2                                 |
| **Priority**           | HIGH                                    |
| **Status**             | Not Started                             |
| **Story Points**       | 34                                      |
| **Estimated Duration** | 3-4 weeks                               |
| **Dependencies**       | Epic 3 (Core Commerce - Square working) |

---

## Epic Description

Expand payment options beyond Square to include PayPal, CashApp, and ACH bank transfers. Implement split payments, saved payment methods, recurring billing, and comprehensive payment analytics. This will increase conversion rates and reduce cart abandonment.

---

## Business Value

**Problem:** Limited payment options causing cart abandonment (12% drop-off rate)
**Solution:** Multiple payment methods with saved cards and flexible payment options
**Impact:**

- Reduce cart abandonment by 40% (from 12% to 7%)
- Increase conversion rate by 25%
- Reduce payment processing fees by 15% (by offering ACH)
- Enable recurring revenue streams

---

## Current State

### ✅ What's Already Built:

- Square payment integration (working)
- Basic checkout flow
- Order payment tracking
- Payment confirmation emails

### ❌ What's Missing:

- PayPal integration
- CashApp Pay integration
- ACH bank transfers
- Saved payment methods
- Split payments
- Payment method selection UI
- Recurring billing infrastructure

---

## User Stories

### Story 8.1: PayPal Integration (8 points)

**As a** Customer
**I want** to pay with PayPal
**So that** I can use my preferred payment method

**Acceptance Criteria:**

- [ ] PayPal button appears at checkout
- [ ] Customer can pay with PayPal balance or linked card
- [ ] Order status updates correctly after PayPal payment
- [ ] Refunds can be issued to PayPal
- [ ] PayPal transactions appear in admin dashboard
- [ ] Webhook integration for payment status
- [ ] Test mode for development

**Tasks:**

1. Set up PayPal Business account
2. Install PayPal SDK
3. Create PayPal payment route handler
4. Build PayPal button component
5. Implement webhook handler for status updates
6. Add refund capability
7. Create admin view for PayPal transactions
8. Test with PayPal sandbox

**Technical Notes:**

```typescript
// PayPal SDK integration
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js"

// Checkout page
<PayPalButtons
  createOrder={async () => {
    const response = await fetch('/api/checkout/paypal/create-order', {
      method: 'POST',
      body: JSON.stringify({ cartId }),
    })
    const { id } = await response.json()
    return id
  }}
  onApprove={async (data) => {
    await fetch('/api/checkout/paypal/capture-order', {
      method: 'POST',
      body: JSON.stringify({ orderId: data.orderID }),
    })
  }}
/>
```

---

### Story 8.2: CashApp Pay Integration (8 points)

**As a** Customer
**I want** to pay with CashApp
**So that** I can use my Cash App balance

**Acceptance Criteria:**

- [ ] CashApp button appears at checkout
- [ ] Customer redirected to Cash App for payment
- [ ] Payment confirmation redirects back to site
- [ ] Order status updates after successful payment
- [ ] Failed payments handled gracefully
- [ ] CashApp transactions in admin dashboard

**Tasks:**

1. Set up Cash App business account
2. Integrate Cash App Pay API
3. Create payment initiation route
4. Build CashApp button component
5. Implement return URL handler
6. Add webhook for payment confirmation
7. Create admin transaction view
8. Test with Cash App sandbox

---

### Story 8.3: ACH Bank Transfer (8 points)

**As a** Customer
**I want** to pay via bank transfer (ACH)
**So that** I can avoid credit card fees and pay directly from my bank

**Acceptance Criteria:**

- [ ] Customer can link bank account
- [ ] Plaid integration for bank verification
- [ ] ACH payment initiated for orders
- [ ] 3-5 day processing time communicated clearly
- [ ] Order held until ACH clears
- [ ] Failed ACH payments handled (NSF, etc.)
- [ ] Bank accounts can be saved for future orders

**Tasks:**

1. Set up Plaid account
2. Integrate Plaid Link for bank connection
3. Create ACH payment processing route
4. Build bank account selection UI
5. Implement payment status tracking
6. Add failure handling (NSF, rejected)
7. Create saved bank accounts feature
8. Test with Plaid sandbox

**Important Considerations:**

- ACH takes 3-5 business days to clear
- Orders should not be sent to vendor until ACH clears
- Customer should be clearly informed of timeline
- Reduced processing fees (0.8% vs 2.9% for cards)

---

### Story 8.4: Saved Payment Methods (5 points)

**As a** Customer
**I want** to save my payment methods
**So that** I can checkout faster next time

**Acceptance Criteria:**

- [ ] Customers can save credit cards
- [ ] Customers can save PayPal accounts
- [ ] Customers can save bank accounts
- [ ] Default payment method can be set
- [ ] Saved methods can be edited/deleted
- [ ] PCI compliance maintained (tokenization)
- [ ] CVV still required for saved cards

**Tasks:**

1. Create payment methods database table
2. Implement card tokenization (via Square)
3. Build saved payment methods UI
4. Add default payment method setting
5. Create edit/delete functionality
6. Implement CVV verification flow
7. Add payment method selection at checkout
8. Test security and PCI compliance

**Database Schema:**

```prisma
model PaymentMethod {
  id              String   @id @default(cuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id])

  type            String   // card, paypal, bank_account
  provider        String   // square, paypal, plaid

  // Tokenized data (never store real card numbers)
  token           String   // Provider's token
  last4           String?  // Last 4 digits for display
  brand           String?  // visa, mastercard, etc.
  expiryMonth     Int?
  expiryYear      Int?

  // Bank account info (if applicable)
  bankName        String?
  accountType     String?  // checking, savings

  isDefault       Boolean  @default(false)
  nickname        String?  // "Work Card", "Personal Account"

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

---

### Story 8.5: Split Payments (5 points)

**As a** Customer
**I want** to split payment between two methods
**So that** I can use a gift card plus my credit card

**Acceptance Criteria:**

- [ ] Customer can select "Split Payment" option
- [ ] Can choose two payment methods
- [ ] Can specify amount for each method
- [ ] System validates total equals order amount
- [ ] Both payments processed atomically (all or nothing)
- [ ] Refunds split proportionally
- [ ] Clear receipt showing split

**Tasks:**

1. Design split payment UI
2. Build payment amount allocation logic
3. Implement dual payment processing
4. Add atomic transaction handling
5. Create proportional refund logic
6. Update receipt generation
7. Add admin view for split payments
8. Test edge cases (one fails, both fail)

---

## Technical Architecture

### Payment Provider Abstraction

```typescript
// src/lib/payments/payment-provider.ts
export interface PaymentProvider {
  name: string

  // Payment processing
  createPayment(amount: number, metadata: PaymentMetadata): Promise<PaymentIntent>
  capturePayment(paymentId: string): Promise<PaymentResult>
  refundPayment(paymentId: string, amount?: number): Promise<RefundResult>

  // Customer payment methods
  savePaymentMethod(customerId: string, token: string): Promise<SavedPaymentMethod>
  deletePaymentMethod(methodId: string): Promise<void>

  // Webhooks
  verifyWebhook(payload: any, signature: string): boolean
  handleWebhook(event: WebhookEvent): Promise<void>
}

// Implementations
export class SquarePaymentProvider implements PaymentProvider {
  name = 'square'
  // ... implementation
}

export class PayPalPaymentProvider implements PaymentProvider {
  name = 'paypal'
  // ... implementation
}

export class PlaidACHProvider implements PaymentProvider {
  name = 'plaid'
  // ... implementation
}

// Payment service using providers
export class PaymentService {
  private providers: Map<string, PaymentProvider>

  constructor() {
    this.providers = new Map([
      ['square', new SquarePaymentProvider()],
      ['paypal', new PayPalPaymentProvider()],
      ['plaid', new PlaidACHProvider()],
    ])
  }

  async processPayment(
    provider: string,
    amount: number,
    metadata: PaymentMetadata
  ): Promise<PaymentResult> {
    const paymentProvider = this.providers.get(provider)
    if (!paymentProvider) {
      throw new Error(`Unknown payment provider: ${provider}`)
    }

    const payment = await paymentProvider.createPayment(amount, metadata)
    return await paymentProvider.capturePayment(payment.id)
  }

  async processSplitPayment(
    payments: Array<{ provider: string; amount: number; metadata: PaymentMetadata }>
  ): Promise<PaymentResult[]> {
    // Start transaction
    const results: PaymentResult[] = []
    const completed: PaymentResult[] = []

    try {
      // Process all payments
      for (const payment of payments) {
        const result = await this.processPayment(payment.provider, payment.amount, payment.metadata)
        results.push(result)
        completed.push(result)
      }

      return results
    } catch (error) {
      // If any payment fails, refund all completed payments
      for (const result of completed) {
        const provider = this.providers.get(result.provider)
        await provider?.refundPayment(result.id)
      }
      throw error
    }
  }
}
```

### Payment Method Selection UI

```typescript
// src/components/checkout/payment-method-selector.tsx
'use client'

export function PaymentMethodSelector() {
  const [selectedMethod, setSelectedMethod] = useState<string>('card')
  const [savedMethods, setSavedMethods] = useState<SavedPaymentMethod[]>([])
  const [useSavedMethod, setUseSavedMethod] = useState(false)

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Payment Method</h3>

      {/* Payment type selector */}
      <div className="grid grid-cols-2 gap-4">
        <PaymentOption
          icon={<CreditCard />}
          title="Credit/Debit Card"
          selected={selectedMethod === 'card'}
          onClick={() => setSelectedMethod('card')}
        />
        <PaymentOption
          icon={<PayPalIcon />}
          title="PayPal"
          selected={selectedMethod === 'paypal'}
          onClick={() => setSelectedMethod('paypal')}
        />
        <PaymentOption
          icon={<CashAppIcon />}
          title="Cash App"
          selected={selectedMethod === 'cashapp'}
          onClick={() => setSelectedMethod('cashapp')}
        />
        <PaymentOption
          icon={<Bank />}
          title="Bank Transfer (ACH)"
          subtitle="3-5 business days"
          selected={selectedMethod === 'ach'}
          onClick={() => setSelectedMethod('ach')}
        />
      </div>

      {/* Saved methods */}
      {savedMethods.length > 0 && selectedMethod === 'card' && (
        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={useSavedMethod}
              onChange={(e) => setUseSavedMethod(e.target.checked)}
            />
            Use saved payment method
          </label>

          {useSavedMethod && (
            <select className="mt-2 w-full rounded border p-2">
              {savedMethods.map((method) => (
                <option key={method.id} value={method.id}>
                  {method.brand} •••• {method.last4} (expires {method.expiryMonth}/
                  {method.expiryYear})
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* Payment form based on selected method */}
      {selectedMethod === 'card' && !useSavedMethod && <CardPaymentForm />}
      {selectedMethod === 'paypal' && <PayPalButtons />}
      {selectedMethod === 'cashapp' && <CashAppButton />}
      {selectedMethod === 'ach' && <PlaidLink />}
    </div>
  )
}
```

---

## Database Schema

```prisma
// Enhanced Payment model
model Payment {
  id              String   @id @default(cuid())
  orderId         String
  order           Order    @relation(fields: [orderId], references: [id])

  provider        String   // square, paypal, cashapp, plaid
  providerPaymentId String // Provider's transaction ID

  amount          Decimal  @db.Decimal(10, 2)
  currency        String   @default("USD")
  status          String   // pending, processing, succeeded, failed, refunded

  // For split payments
  parentPaymentId String?  // If this is part of a split payment
  splitAmount     Decimal? @db.Decimal(10, 2)

  // Payment method used
  paymentMethodId String?
  paymentMethod   PaymentMethod? @relation(fields: [paymentMethodId], references: [id])

  // Metadata
  metadata        Json?
  failureReason   String?
  refundedAmount  Decimal? @db.Decimal(10, 2)
  refundedAt      DateTime?

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([orderId])
  @@index([provider])
  @@index([status])
}

model PaymentMethod {
  id              String   @id @default(cuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id])

  type            String   // card, paypal, bank_account, cashapp
  provider        String   // square, paypal, plaid

  // Tokenized data
  token           String   @unique
  last4           String?
  brand           String?
  expiryMonth     Int?
  expiryYear      Int?

  // Bank account info
  bankName        String?
  accountType     String?

  // PayPal info
  paypalEmail     String?

  isDefault       Boolean  @default(false)
  nickname        String?

  payments        Payment[]

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([userId])
  @@index([type])
}

// Webhook event log
model PaymentWebhookEvent {
  id            String   @id @default(cuid())
  provider      String   // square, paypal, plaid
  eventType     String   // payment.succeeded, payment.failed, etc.
  eventId       String   @unique // Provider's event ID
  payload       Json
  processed     Boolean  @default(false)
  processedAt   DateTime?
  error         String?
  createdAt     DateTime @default(now())

  @@index([provider, eventType])
  @@index([processed])
}
```

---

## API Endpoints

```
Square (existing):
POST   /api/checkout/square/create-payment
POST   /api/checkout/square/webhook

PayPal (new):
POST   /api/checkout/paypal/create-order
POST   /api/checkout/paypal/capture-order
POST   /api/checkout/paypal/webhook

CashApp (new):
POST   /api/checkout/cashapp/create-payment
GET    /api/checkout/cashapp/return
POST   /api/checkout/cashapp/webhook

ACH/Plaid (new):
POST   /api/checkout/plaid/create-link-token
POST   /api/checkout/plaid/exchange-token
POST   /api/checkout/plaid/create-payment
POST   /api/checkout/plaid/webhook

Payment Methods:
GET    /api/account/payment-methods
POST   /api/account/payment-methods
DELETE /api/account/payment-methods/:id
PUT    /api/account/payment-methods/:id/default

Admin:
GET    /api/admin/payments
GET    /api/admin/payments/:id
POST   /api/admin/payments/:id/refund
GET    /api/admin/payments/analytics
```

---

## Testing Strategy

### Unit Tests

- Payment provider abstraction
- Split payment logic (atomic transactions)
- Refund calculations
- Webhook signature verification

### Integration Tests

- PayPal sandbox transactions
- Cash App test environment
- Plaid sandbox bank connections
- Saved payment method creation

### E2E Tests

1. Complete purchase with each payment method
2. Save payment method and reuse it
3. Split payment between card and PayPal
4. ACH payment with 3-day clearing period
5. Failed payment handling
6. Refund to various payment methods

---

## Success Metrics

### Launch Criteria

- [ ] All 4 payment methods working (Square, PayPal, CashApp, ACH)
- [ ] Saved payment methods functional
- [ ] Split payments tested
- [ ] Webhooks handling all events
- [ ] PCI compliance verified
- [ ] Refunds working for all methods

### Performance Targets

- Payment processing time: <3 seconds
- Webhook processing: <2 seconds
- Checkout conversion rate increase: >20%
- Cart abandonment reduction: >30%

### Business Metrics (60 days post-launch)

- PayPal adoption: >30% of transactions
- ACH adoption: >10% of transactions (from $0 to $10K+/month)
- Saved payment method usage: >40% of returning customers
- Payment failure rate: <2%
- Customer satisfaction: >90%

---

## Security & Compliance

### PCI Compliance

- Never store raw card numbers
- Use tokenization for all card data
- Implement CVV verification
- Use HTTPS for all transactions
- Regular security audits

### ACH Compliance (NACHA Rules)

- Customer authorization required
- Clear processing timeline communication
- NSF handling procedures
- Record keeping (7 years)

### Data Protection

- Encrypt payment tokens at rest
- Use secure webhook signatures
- Implement rate limiting on payment endpoints
- Monitor for fraudulent patterns

---

## Risks & Mitigation

### Risk 1: Payment Provider Downtime

**Impact:** High
**Probability:** Low
**Mitigation:**

- Multiple payment providers available
- Graceful degradation (disable unavailable methods)
- Real-time status monitoring
- Clear customer communication

### Risk 2: Fraud

**Impact:** High
**Probability:** Medium
**Mitigation:**

- Implement address verification (AVS)
- CVV verification required
- Monitor for suspicious patterns
- Rate limiting on payment attempts
- Integration with fraud detection services

### Risk 3: ACH Failures (NSF)

**Impact:** Medium
**Probability:** Medium
**Mitigation:**

- Clear timeline communication
- Don't ship until ACH clears
- Automated retry for failed ACH
- Customer notification system
- Account flagging for repeated failures

---

## Timeline

### Week 1: PayPal Integration

- PayPal setup and SDK integration
- Create order and capture flows
- Webhook handling
- Admin dashboard updates

### Week 2: CashApp & ACH

- Cash App Pay integration
- Plaid setup and bank linking
- ACH payment processing
- Testing in sandbox environments

### Week 3: Saved Methods & Split Payments

- Payment methods database and UI
- Tokenization implementation
- Split payment logic
- Security audit

### Week 4: Testing & Polish

- End-to-end testing
- PCI compliance review
- Performance optimization
- Documentation

---

## Dependencies

**Required:**

- Epic 3: Core Commerce (Square integration working) ✅
- PayPal Business account approval
- Cash App Business account approval
- Plaid account and API access
- PCI compliance certification

**Optional:**

- Fraud detection service (e.g., Stripe Radar, Sift)
- Payment analytics dashboard

---

**Epic Owner:** Backend Lead
**Technical Lead:** Payment Systems Engineer
**Status:** Not Started
**Last Updated:** October 3, 2025
