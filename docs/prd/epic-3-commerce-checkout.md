# Epic 3: Core Commerce & Checkout

## Epic Status

**STATUS: ⚠️ IN PROGRESS (80% Complete)**
**Started:** 2025-09-15
**Target Completion:** 2025-10-07
**Implementation Score:** 80/100

---

## Epic Goal

Implement the complete shopping cart and checkout process, including the floating side cart, multi-step checkout flow, address management, shipping selection, and payment processing integration with Square, CashApp, and PayPal.

---

## Epic Description

### User Goal

**As a Customer**, I want a clear, secure, and intuitive process to purchase the items in my cart, from adding products through final payment confirmation, so that I can complete my order with confidence.

### Business Value

- Converts product views into revenue
- Reduces cart abandonment through UX optimization
- Secure payment processing builds trust
- Multiple payment options increase conversion
- Clear checkout flow reduces support requests

### Technical Summary

This epic implements the complete commerce workflow:

- **Shopping Cart:** Persistent cart with session/database storage
- **Cart UI:** Floating side cart for quick access
- **Checkout Flow:** Multi-step process (shipping → payment → confirm)
- **Address Management:** Shipping and billing addresses
- **Payment Integration:** Square, CashApp, PayPal
- **Order Processing:** Transaction-based order creation
- **Confirmation:** Order summary and email notifications

---

## Functional Requirements Addressed

- **FR5:** Complete order lifecycle with status tracking ✅
- **FR10:** Square, CashApp, and PayPal payment integration ⚠️ (Partial)
- **NFR4:** Database transactions for order creation ✅
- **NFR5:** Session verification for protected operations ✅

---

## Implementation Details

### ✅ Completed Components

#### 1. **Shopping Cart System**

- Cart state management (Zustand)
- Add to cart functionality
- Update quantities
- Remove items
- Cart persistence (localStorage + database)
- Cart summary calculations
- Cart item validation

#### 2. **Cart UI Components**

- Floating side cart drawer
- Cart item display with images
- Quantity adjustment controls
- Remove item buttons
- Subtotal display
- "Proceed to Checkout" button
- Empty cart state
- Cart badge counter in header

#### 3. **Checkout Page Structure**

- Multi-step checkout layout
- Progress indicator
- Step navigation
- Form validation
- Error handling
- Loading states
- Responsive design

#### 4. **Order Creation System**

- Database transaction support
- Order model with relationships
- Order status management
- Customer reference number generation
- Order summary calculations
- Inventory validation (ready)

#### 5. **Order Success Page**

- Order confirmation display
- Order details summary
- Customer reference number
- Next steps information
- Email confirmation trigger
- Return to shop link

---

### ⚠️ Partially Complete Components

#### 1. **Address Management** (70%)

**Completed:**

- Address form component
- Validation with Zod schemas
- Shipping address entry
- Billing address toggle

**Remaining:**

- Address book functionality
- Save addresses for reuse
- Default address selection
- Address validation API
- International address support

#### 2. **Shipping Selection** (60%)

**Completed:**

- Basic shipping options display
- Shipping cost calculation structure

**Remaining:**

- FedEx integration
- Southwest Cargo/DASH integration
- Real-time rate calculation
- Delivery estimate display
- Shipping tracking preparation

#### 3. **Payment Processing** (50%)

**Completed:**

- Square SDK integration
- Basic payment form structure
- Payment API endpoints

**Remaining:**

- Complete Square payment flow
- CashApp Pay integration
- PayPal integration
- Saved payment methods
- Payment failure handling
- PCI compliance verification
- 3D Secure support

---

### ❌ Not Started Components

#### 1. **Cart Features**

- Product recommendations in cart
- Discount code application
- Gift wrapping options
- Special instructions field

#### 2. **Checkout Enhancements**

- Guest checkout
- Express checkout (Apple Pay, Google Pay)
- Order insurance options
- Subscription setup for recurring orders

#### 3. **Post-Purchase**

- Thank you page upsells (out of MVP scope)
- Social sharing
- Referral program integration

---

## User Stories

### Story 3.1: Shopping Cart Implementation ✅

**Status:** COMPLETE
**Description:** Implement persistent shopping cart with add/remove/update functionality and cart UI component.

**Acceptance Criteria:**

- ✅ Cart state management with Zustand
- ✅ Add to cart from product pages
- ✅ Update cart item quantities
- ✅ Remove items from cart
- ✅ Cart persistence across sessions
- ✅ Floating side cart drawer
- ✅ Cart badge with item count
- ✅ Subtotal calculation

---

### Story 3.2: Checkout Page Structure ✅

**Status:** COMPLETE
**Description:** Create multi-step checkout page with progress indicator and navigation.

**Acceptance Criteria:**

- ✅ Checkout page at `/checkout`
- ✅ Multi-step layout
- ✅ Progress indicator
- ✅ Step navigation controls
- ✅ Form validation framework
- ✅ Error handling
- ✅ Responsive design

---

### Story 3.3: Address Management ⚠️

**Status:** IN PROGRESS (70%)
**Description:** Implement shipping and billing address collection with validation.

**Acceptance Criteria:**

- ✅ Shipping address form
- ✅ Billing address form
- ✅ "Same as shipping" toggle
- ✅ Form validation with Zod
- ⚠️ Address book/saved addresses
- ⚠️ Default address selection
- ❌ Address validation API
- ❌ International support

**Remaining Work:**

- Implement address book storage
- Add address selection dropdown
- Integrate address validation service
- Add international address formats

---

### Story 3.4: Shipping Method Selection ⚠️

**Status:** IN PROGRESS (60%)
**Description:** Implement shipping provider selection with rate calculation.

**Acceptance Criteria:**

- ✅ Shipping options display
- ✅ Basic rate calculation structure
- ⚠️ FedEx integration
- ❌ Southwest Cargo/DASH integration
- ❌ Real-time rate API calls
- ❌ Delivery time estimates
- ❌ Tracking number preparation

**Remaining Work:**

- Integrate FedEx rate API
- Add Southwest Cargo/DASH
- Implement real-time rate fetching
- Display delivery estimates

---

### Story 3.5: Payment Processing Integration ⚠️

**Status:** IN PROGRESS (50%)
**Description:** Integrate Square, CashApp, and PayPal for payment processing.

**Acceptance Criteria:**

- ✅ Square SDK integrated
- ✅ Payment API endpoints created
- ⚠️ Square payment flow complete
- ❌ CashApp Pay integration
- ❌ PayPal integration
- ❌ Saved payment methods
- ❌ Payment error handling
- ❌ 3D Secure support

**Remaining Work:**

- Complete Square payment flow end-to-end
- Integrate CashApp Pay SDK
- Integrate PayPal SDK
- Implement saved card functionality
- Add comprehensive error handling
- Test payment failure scenarios
- Verify PCI compliance

---

### Story 3.6: Order Creation & Processing ✅

**Status:** COMPLETE
**Description:** Implement order creation with database transactions and status management.

**Acceptance Criteria:**

- ✅ Order creation API endpoint
- ✅ Database transaction support
- ✅ Order number generation
- ✅ Order status workflow
- ✅ Order items relationship
- ✅ Order totals calculation
- ✅ Error handling
- ✅ Rollback on failure

---

### Story 3.7: Order Confirmation Page ✅

**Status:** COMPLETE
**Description:** Create order success page with confirmation details.

**Acceptance Criteria:**

- ✅ Success page at `/checkout/success`
- ✅ Order details display
- ✅ Customer reference number
- ✅ Order summary
- ✅ Next steps information
- ✅ Email confirmation trigger
- ✅ Return to shop link

---

### Story 3.8: Email Notifications ⚠️

**Status:** IN PROGRESS (60%)
**Description:** Send order confirmation and status update emails.

**Acceptance Criteria:**

- ✅ Resend email service configured
- ✅ Order confirmation email template
- ⚠️ Email sending on order creation
- ❌ Order status update emails
- ❌ Shipping notification emails
- ❌ Cancellation emails

**Remaining Work:**

- Automate email sending on order creation
- Create status update email triggers
- Implement shipping notification
- Add cancellation email flow

---

## Technical Architecture

### Cart State Management

```
CartStore (Zustand)
├── items: CartItem[]
├── addItem()
├── updateQuantity()
├── removeItem()
├── clearCart()
├── getSubtotal()
└── persist to localStorage + database
```

### Checkout Flow

```
Step 1: Shipping Address
  ↓
Step 2: Shipping Method
  ↓
Step 3: Payment
  ↓
Step 4: Review & Confirm
  ↓
Order Creation (Transaction)
  ↓
Success Page + Email
```

### Order Creation Transaction

```typescript
await prisma.$transaction(async (tx) => {
  // 1. Create order
  const order = await tx.order.create({...})

  // 2. Create order items
  await tx.orderItem.createMany({...})

  // 3. Process payment
  const payment = await processPayment({...})

  // 4. Update order with payment
  await tx.order.update({...})

  // 5. Clear cart
  await tx.cart.delete({...})

  return order
})
```

---

## API Endpoints

### Cart APIs

- `GET /api/cart` - Get cart contents ✅
- `POST /api/cart` - Add item to cart ✅
- `PUT /api/cart/[id]` - Update cart item ✅
- `DELETE /api/cart/[id]` - Remove cart item ✅

### Checkout APIs

- `POST /api/checkout/calculate-shipping` ⚠️ (Partial)
- `POST /api/checkout/process-payment` ⚠️ (Partial)
- `POST /api/checkout/create-order` ✅
- `POST /api/checkout/process-square-payment` ⚠️ (Partial)

### Order APIs

- `GET /api/orders` - List user orders ✅
- `GET /api/orders/[id]` - Get order details ✅

---

## Dependencies

### Internal

- Epic 1: Foundation (database, auth)
- Epic 2: Product Catalog (products, pricing)

### External Services

- Square SDK (payment processing)
- CashApp SDK (payment processing)
- PayPal SDK (payment processing)
- FedEx API (shipping rates)
- Resend (email notifications)
- N8N (workflow automation - optional)

### Libraries

- Zustand (cart state management)
- React Hook Form (form handling)
- Zod (validation)
- Square Web Payments SDK

---

## Remaining Work Breakdown

### High Priority (Week 1)

1. **Complete Payment Integration** (Story 3.5)
   - Finish Square payment flow
   - Add error handling
   - Test payment scenarios
   - **Estimated:** 16 hours

2. **Shipping Integration** (Story 3.4)
   - FedEx API integration
   - Southwest Cargo/DASH setup
   - Real-time rate calculation
   - **Estimated:** 12 hours

### Medium Priority (Week 2)

3. **Address Book** (Story 3.3)
   - Saved addresses storage
   - Address selection UI
   - Default address logic
   - **Estimated:** 8 hours

4. **Email Automation** (Story 3.8)
   - Automate order confirmation
   - Status update emails
   - Shipping notifications
   - **Estimated:** 6 hours

### Total Remaining Effort

**Estimated:** 42 hours (5-6 working days)

---

## Risks & Mitigation

| Risk                                   | Impact   | Likelihood | Mitigation                           | Status      |
| -------------------------------------- | -------- | ---------- | ------------------------------------ | ----------- |
| Payment gateway integration complexity | HIGH     | MEDIUM     | Use official SDKs, extensive testing | ⚠️ Active   |
| Shipping rate API reliability          | MEDIUM   | MEDIUM     | Fallback rates, caching              | 📋 Planned  |
| Cart persistence across devices        | MEDIUM   | LOW        | Database sync + localStorage         | ✅ Resolved |
| Transaction rollback failures          | HIGH     | LOW        | Comprehensive error handling         | ✅ Resolved |
| PCI compliance issues                  | CRITICAL | LOW        | Use tokenized payments only          | ⚠️ Active   |

---

## Success Metrics

### Current Achievement

- [x] Cart functionality: 100%
- [x] Checkout structure: 100%
- [x] Order creation: 100%
- [x] Success page: 100%
- [~] Address management: 70%
- [~] Shipping selection: 60%
- [~] Payment processing: 50%
- [~] Email notifications: 60%

**Overall Completion:** 80%

### Target Metrics (When Complete)

- Cart abandonment rate: < 40%
- Checkout completion time: < 3 minutes
- Payment success rate: > 98%
- Order processing time: < 5 seconds
- Zero payment security incidents

---

## Testing Requirements

### ✅ Completed Tests

- Cart state management unit tests
- Order creation transaction tests
- Basic integration tests

### 📋 Remaining Tests

- Payment flow end-to-end tests
- Shipping calculation tests
- Address validation tests
- Email delivery tests
- Load testing for checkout
- Security testing for payment

---

## Documentation References

- [Checkout Flow Diagram](/docs/architecture/checkout-flow.md)
- [Payment Integration Guide](/docs/architecture/payment-integration.md)
- [Order Processing](/docs/architecture/order-processing.md)

---

## Change Log

| Date       | Version | Description                         | Author           |
| ---------- | ------- | ----------------------------------- | ---------------- |
| 2025-09-15 | 1.0     | Cart and basic checkout implemented | Development Team |
| 2025-09-20 | 1.1     | Order creation completed            | Development Team |
| 2025-09-25 | 1.2     | Success page added                  | Development Team |
| 2025-09-30 | 2.0     | Sharded from monolithic PRD         | BMAD Agent       |

---

**Epic Owner:** Commerce Lead
**Last Updated:** 2025-09-30
**Previous Epic:** [Epic 2: Product Catalog & Configuration](./epic-2-product-catalog-config.md)
**Next Epic:** [Epic 4: Customer Account Management](./epic-4-customer-account-mgmt.md)
