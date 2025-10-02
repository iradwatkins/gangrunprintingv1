# Story 3.5: Payment Processing Integration

## Story Title
Complete Square, CashApp, and PayPal Payment Integration

## Story Type
Feature Completion

## Story Points
8

## Priority
P0 - Critical (Blocks Revenue)

## Epic
Epic 3: Core Commerce & Checkout

## Story Description

As a **customer**, I want to securely pay for my order using Square, CashApp Pay, or PayPal with a seamless checkout experience, so that I can complete my purchase with my preferred payment method.

## Background

The payment integration is currently 50% complete:
- ✅ Square SDK integrated
- ✅ Payment API endpoints created
- ⚠️ Square payment flow incomplete
- ❌ CashApp Pay not integrated
- ❌ PayPal not integrated
- ❌ Saved payment methods not implemented
- ❌ Payment failure handling incomplete
- ❌ 3D Secure not supported

This is a critical blocker for production revenue generation.

## Acceptance Criteria

### Must Have (P0)
- [ ] **Square Card Payment:**
  - [ ] Card input form renders using Square Web SDK
  - [ ] Card tokenization works correctly
  - [ ] Payment processes successfully for valid cards
  - [ ] Payment amount matches order total (including shipping & tax)
  - [ ] Success response returns payment ID and receipt URL
  - [ ] Failed payments show specific error messages to user
  - [ ] CVV verification required
  - [ ] Postal code verification required

- [ ] **Payment Flow:**
  - [ ] Customer enters card details on checkout page
  - [ ] "Place Order" button triggers payment processing
  - [ ] Loading state shown during payment processing
  - [ ] Success redirects to `/checkout/success` with order details
  - [ ] Failure shows error message and allows retry
  - [ ] Payment timeout after 30 seconds with error message

- [ ] **Order Creation on Payment Success:**
  - [ ] Order created in database only after payment succeeds
  - [ ] Payment ID stored with order
  - [ ] Order status set to "Paid"
  - [ ] Cart cleared after successful payment
  - [ ] Customer receives order confirmation email

- [ ] **Error Handling:**
  - [ ] Declined card: "Your card was declined. Please try a different payment method."
  - [ ] Insufficient funds: "Insufficient funds. Please use a different card."
  - [ ] Invalid card: "Invalid card number. Please check and try again."
  - [ ] Network error: "Payment connection failed. Please try again."
  - [ ] Timeout: "Payment timed out. Please try again."
  - [ ] All errors logged to Sentry with context

### Should Have (P1)
- [ ] **CashApp Pay Integration:**
  - [ ] CashApp button displays on checkout page
  - [ ] Clicking button opens CashApp payment flow
  - [ ] Payment redirects back to success page
  - [ ] CashApp payment ID stored with order

- [ ] **PayPal Integration:**
  - [ ] PayPal button displays on checkout page
  - [ ] Clicking button opens PayPal payment flow
  - [ ] Payment redirects back to success page
  - [ ] PayPal transaction ID stored with order

- [ ] **Saved Payment Methods:**
  - [ ] "Save card for future purchases" checkbox
  - [ ] Card tokenized and saved to user account
  - [ ] Saved cards display on checkout (last 4 digits only)
  - [ ] "Use saved card" option with CVV re-entry
  - [ ] Ability to remove saved cards

### Nice to Have (P2)
- [ ] **3D Secure Support:**
  - [ ] 3DS challenge triggered for eligible cards
  - [ ] Customer completes 3DS verification flow
  - [ ] Payment processes after 3DS verification
  - [ ] 3DS failures handled gracefully

- [ ] **Express Checkout:**
  - [ ] Apple Pay button (on iOS devices)
  - [ ] Google Pay button (on Android devices)
  - [ ] Express checkout skips address entry if available

## Technical Details

### Square Payment Flow
```typescript
// 1. Initialize Square SDK
const payments = Square.payments(applicationId, locationId)
const card = await payments.card()

// 2. Tokenize card
const tokenResult = await card.tokenize()
if (tokenResult.status === 'OK') {
  const token = tokenResult.token

  // 3. Process payment
  const response = await fetch('/api/checkout/process-square-payment', {
    method: 'POST',
    body: JSON.stringify({
      sourceId: token,
      amount: totalAmount,
      currency: 'USD',
      orderId: draftOrderId
    })
  })

  // 4. Handle response
  if (response.ok) {
    // Redirect to success
    router.push('/checkout/success?orderId=' + orderId)
  } else {
    // Show error
    const error = await response.json()
    setError(error.message)
  }
}
```

### API Endpoint Enhancement
**File:** `src/app/api/checkout/process-square-payment/route.ts`

```typescript
export async function POST(request: NextRequest) {
  // 1. Validate request
  const { sourceId, amount, orderId } = await request.json()

  // 2. Process payment with Square
  const payment = await squareClient.paymentsApi.createPayment({
    sourceId,
    amountMoney: {
      amount: BigInt(amount * 100), // Convert to cents
      currency: 'USD'
    },
    idempotencyKey: uuidv4()
  })

  // 3. Create order in transaction
  await prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        // ... order data
        paymentId: payment.result.payment.id,
        paymentStatus: 'PAID'
      }
    })

    // Clear cart
    await tx.cart.delete({ where: { userId } })
  })

  // 4. Send confirmation email
  await sendOrderConfirmationEmail(order)

  return NextResponse.json({
    success: true,
    orderId: order.id,
    receiptUrl: payment.result.payment.receiptUrl
  })
}
```

### Environment Variables Required
```env
# Square
SQUARE_APPLICATION_ID=sq0idp-...
SQUARE_ACCESS_TOKEN=sq0atp-...
SQUARE_LOCATION_ID=L...

# CashApp (optional)
CASHAPP_APP_ID=CA...
CASHAPP_SECRET=...

# PayPal (optional)
PAYPAL_CLIENT_ID=...
PAYPAL_SECRET=...
```

## Dependencies

### External Services
- Square Web Payments SDK (already integrated)
- CashApp Pay SDK (needs setup)
- PayPal Checkout SDK (needs setup)

### Internal APIs
- `/api/checkout/process-square-payment` (exists, needs completion)
- `/api/checkout/process-cashapp-payment` (new)
- `/api/checkout/process-paypal-payment` (new)

### Database
- `Order` table needs `paymentId` field (already exists)
- `PaymentMethod` table for saved cards (needs creation)

## Testing Requirements

### Unit Tests
- [ ] Square tokenization
- [ ] Payment processing logic
- [ ] Error handling for each failure type
- [ ] Order creation on payment success

### Integration Tests
- [ ] End-to-end checkout with Square test card
- [ ] Failed payment scenarios
- [ ] Payment timeout handling
- [ ] Order creation transaction

### Manual Testing Checklist
- [ ] Test with Square test card: `4111 1111 1111 1111`
- [ ] Test declined card: `4000 0000 0000 0002`
- [ ] Test insufficient funds: `4000 0000 0000 9995`
- [ ] Test invalid CVV
- [ ] Test expired card
- [ ] Test network disconnect during payment
- [ ] Verify order appears in admin
- [ ] Verify confirmation email sent

## Files to Modify

### Frontend
- `src/app/(customer)/checkout/page.tsx` - Add payment form
- `src/components/checkout/PaymentForm.tsx` - Square card form (new)
- `src/components/checkout/CashAppButton.tsx` - CashApp button (new)
- `src/components/checkout/PayPalButton.tsx` - PayPal button (new)

### Backend
- `src/app/api/checkout/process-square-payment/route.ts` - Complete implementation
- `src/app/api/checkout/process-cashapp-payment/route.ts` - New endpoint
- `src/app/api/checkout/process-paypal-payment/route.ts` - New endpoint
- `src/lib/square-client.ts` - Square SDK initialization

### Configuration
- `.env.production` - Add payment credentials
- `package.json` - Add SDK dependencies

## Risks & Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| PCI compliance issues | CRITICAL | MEDIUM | Use tokenized payments only, never store raw card data |
| Payment failures in production | HIGH | MEDIUM | Comprehensive error handling, monitoring with Sentry |
| Double-charging customers | HIGH | LOW | Use idempotency keys, transaction-based order creation |
| SDK breaking changes | MEDIUM | LOW | Pin SDK versions, test upgrades in staging |

## Success Metrics

- [ ] Payment success rate > 98%
- [ ] Average payment time < 3 seconds
- [ ] Zero payment security incidents
- [ ] Customer can complete purchase end-to-end
- [ ] Failed payments show helpful error messages

## Notes

- Square sandbox credentials available in `.env.development`
- Use test cards from Square documentation for testing
- Payment processing must complete before order creation
- Always use idempotency keys to prevent duplicate charges
- Log all payment attempts (success and failure) for audit trail

## Related Stories
- Story 3.6: Order Creation & Processing (dependency)
- Story 3.7: Order Confirmation Page (blocks)
- Story 3.8: Email Notifications (related)

## Definition of Done
- [ ] All acceptance criteria met
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] Manual testing checklist complete
- [ ] Code reviewed and approved
- [ ] Deployed to staging and tested
- [ ] PCI compliance verified
- [ ] Documentation updated
- [ ] Ready for production deployment