# Story 3.8: Email Automation for Order Lifecycle

## Story Title

Automate Email Notifications Throughout Order Lifecycle

## Story Type

Feature Completion

## Story Points

3

## Priority

P1 - High (Customer Communication)

## Epic

Epic 3: Core Commerce & Checkout

## Story Description

As a **customer**, I want to receive automatic email notifications when my order is placed, updated, shipped, or cancelled, so that I stay informed about my order status without having to check the website constantly.

## Background

The email system is currently 60% complete:

- ✅ Resend email service configured and working
- ✅ Order confirmation email template created
- ❌ Email sending not automated (must be triggered manually)
- ❌ No status update emails
- ❌ No shipping notification emails
- ❌ No cancellation emails

Currently, customers only receive emails if manually triggered by admin. This creates:

- Poor customer experience (lack of communication)
- Increased support requests ("Where's my order?")
- Reduced trust in the business
- Manual admin work to send notifications

This story completes the email automation to provide seamless customer communication.

## Acceptance Criteria

### Must Have (P0)

- [ ] **Order Confirmation Email (Automated):**
  - [ ] Automatically sent when order successfully created
  - [ ] Triggered after payment confirmation
  - [ ] Contains order number, items, total, shipping address
  - [ ] Includes estimated delivery date
  - [ ] Links to order tracking page
  - [ ] Professional branding with logo
  - [ ] Mobile-responsive template

- [ ] **Order Status Update Emails:**
  - [ ] Automatically sent when order status changes
  - [ ] Different template for each status:
    - Order received/confirmed
    - Processing started
    - Quality check complete
    - Ready for shipping
  - [ ] Includes current status in subject line
  - [ ] Shows status timeline/progress bar
  - [ ] Next steps clearly explained

- [ ] **Shipping Notification Email:**
  - [ ] Automatically sent when order is shipped
  - [ ] Contains tracking number (if available)
  - [ ] Link to carrier tracking page
  - [ ] Estimated delivery date
  - [ ] Shipping method used (FedEx, Southwest Cargo, etc.)
  - [ ] "What to do if package doesn't arrive" section

- [ ] **Order Cancellation Email:**
  - [ ] Automatically sent when order is cancelled
  - [ ] Explains cancellation reason (if provided)
  - [ ] Refund information and timeline
  - [ ] Customer support contact info
  - [ ] Link to browse products again
  - [ ] Different templates for customer vs admin cancellation

### Should Have (P1)

- [ ] **Delivery Confirmation Email:**
  - [ ] Sent when carrier confirms delivery
  - [ ] Request for product review
  - [ ] "How was your experience?" survey link
  - [ ] Discount code for next order (5% off)
  - [ ] Social media sharing options

- [ ] **Order Problem Emails:**
  - [ ] Delayed shipment notification
  - [ ] Production issue alert
  - [ ] Address verification needed
  - [ ] Payment issue (declined card)
  - [ ] Clear next steps for customer

- [ ] **Email Preferences:**
  - [ ] Customer can opt out of marketing emails
  - [ ] Customer cannot opt out of transactional emails
  - [ ] Unsubscribe link in marketing emails only
  - [ ] Email preference management page

- [ ] **Admin Notification Emails:**
  - [ ] New order received (to admin)
  - [ ] Payment failed (to admin)
  - [ ] High-value order alert (>$500)
  - [ ] Low stock alert
  - [ ] Customer inquiry submitted

### Nice to Have (P2)

- [ ] **Smart Email Timing:**
  - [ ] Don't send emails between 10 PM - 8 AM customer local time
  - [ ] Batch multiple updates into single email (if < 1 hour apart)
  - [ ] Respect customer timezone preferences

- [ ] **Email Analytics:**
  - [ ] Track email open rates
  - [ ] Track link click rates
  - [ ] Track conversion from emails
  - [ ] A/B test email templates
  - [ ] Dashboard showing email performance

- [ ] **Advanced Templates:**
  - [ ] Personalized product recommendations
  - [ ] Dynamic content based on order history
  - [ ] Seasonal/holiday themed templates
  - [ ] Multiple language support

## Technical Details

### Email Service (Resend - Already Configured)

```typescript
// Already exists in codebase
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
```

### Email Sending Service

**File:** `src/services/EmailService.ts` (new)

```typescript
import { Resend } from 'resend'
import { Order, OrderStatus } from '@prisma/client'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM_EMAIL = 'orders@gangrunprinting.com'

export class EmailService {
  /**
   * Send order confirmation email immediately after order creation
   */
  static async sendOrderConfirmation(order: Order & { orderItems: any[]; user: any }) {
    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: order.user.email,
        subject: `Order Confirmation #${order.orderNumber}`,
        react: OrderConfirmationEmail({
          orderNumber: order.orderNumber,
          customerName: order.user.name,
          orderDate: order.createdAt,
          items: order.orderItems,
          total: order.total,
          shippingAddress: order.shippingAddress,
          estimatedDelivery: this.calculateEstimatedDelivery(order),
          trackingUrl: `${process.env.NEXT_PUBLIC_APP_URL}/track/${order.orderNumber}`,
        }),
      })

      console.log(`✅ Order confirmation email sent for order ${order.orderNumber}`)
    } catch (error) {
      console.error(`❌ Failed to send order confirmation email:`, error)
      // Don't throw - email failure shouldn't block order creation
    }
  }

  /**
   * Send status update email when order status changes
   */
  static async sendStatusUpdate(order: Order & { user: any }, previousStatus: OrderStatus) {
    const statusMessages = {
      PENDING: "We've received your order",
      PROCESSING: 'Your order is being prepared',
      QUALITY_CHECK: 'Quality check in progress',
      READY_TO_SHIP: 'Your order is ready to ship',
      SHIPPED: 'Your order has been shipped',
      DELIVERED: 'Your order has been delivered',
      CANCELLED: 'Your order has been cancelled',
    }

    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: order.user.email,
        subject: `Order ${order.orderNumber}: ${statusMessages[order.status]}`,
        react: OrderStatusUpdateEmail({
          orderNumber: order.orderNumber,
          customerName: order.user.name,
          currentStatus: order.status,
          previousStatus,
          statusMessage: statusMessages[order.status],
          trackingUrl: `${process.env.NEXT_PUBLIC_APP_URL}/track/${order.orderNumber}`,
          estimatedDelivery: this.calculateEstimatedDelivery(order),
        }),
      })

      console.log(`✅ Status update email sent for order ${order.orderNumber}: ${order.status}`)
    } catch (error) {
      console.error(`❌ Failed to send status update email:`, error)
    }
  }

  /**
   * Send shipping notification with tracking info
   */
  static async sendShippingNotification(
    order: Order & { user: any },
    trackingNumber: string,
    carrier: string
  ) {
    const carrierUrls = {
      FedEx: `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`,
      'Southwest Cargo': `https://www.swacargo.com/tracking?trackingNumber=${trackingNumber}`,
      USPS: `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`,
    }

    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: order.user.email,
        subject: `Your order #${order.orderNumber} has shipped!`,
        react: ShippingNotificationEmail({
          orderNumber: order.orderNumber,
          customerName: order.user.name,
          trackingNumber,
          carrier,
          trackingUrl:
            carrierUrls[carrier] || `${process.env.NEXT_PUBLIC_APP_URL}/track/${order.orderNumber}`,
          estimatedDelivery: this.calculateEstimatedDelivery(order),
          items: order.orderItems,
        }),
      })

      console.log(`✅ Shipping notification sent for order ${order.orderNumber}`)
    } catch (error) {
      console.error(`❌ Failed to send shipping notification:`, error)
    }
  }

  /**
   * Send cancellation notification
   */
  static async sendCancellationNotification(
    order: Order & { user: any },
    reason?: string,
    cancelledBy: 'customer' | 'admin' = 'admin'
  ) {
    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: order.user.email,
        subject: `Order ${order.orderNumber} has been cancelled`,
        react: OrderCancellationEmail({
          orderNumber: order.orderNumber,
          customerName: order.user.name,
          reason,
          cancelledBy,
          refundAmount: order.total,
          refundTimeline: '5-7 business days',
          supportEmail: 'support@gangrunprinting.com',
          shopUrl: `${process.env.NEXT_PUBLIC_APP_URL}/products`,
        }),
      })

      console.log(`✅ Cancellation email sent for order ${order.orderNumber}`)
    } catch (error) {
      console.error(`❌ Failed to send cancellation email:`, error)
    }
  }

  /**
   * Send delivery confirmation with review request
   */
  static async sendDeliveryConfirmation(order: Order & { user: any }) {
    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: order.user.email,
        subject: `Your order #${order.orderNumber} has been delivered!`,
        react: DeliveryConfirmationEmail({
          orderNumber: order.orderNumber,
          customerName: order.user.name,
          items: order.orderItems,
          reviewUrl: `${process.env.NEXT_PUBLIC_APP_URL}/account/orders/${order.id}/review`,
          discountCode: await this.generateDiscountCode(order.userId),
          supportEmail: 'support@gangrunprinting.com',
        }),
      })

      console.log(`✅ Delivery confirmation sent for order ${order.orderNumber}`)
    } catch (error) {
      console.error(`❌ Failed to send delivery confirmation:`, error)
    }
  }

  private static calculateEstimatedDelivery(order: Order): Date {
    // Basic calculation - enhance based on actual shipping method
    const businessDays = order.shippingMethod === 'express' ? 2 : 5
    const estimatedDate = new Date()
    estimatedDate.setDate(estimatedDate.getDate() + businessDays)
    return estimatedDate
  }

  private static async generateDiscountCode(userId: string): Promise<string> {
    // Generate 5% discount code for next order
    // Implementation depends on discount system
    return `THANKS5-${userId.substring(0, 6).toUpperCase()}`
  }
}
```

### Integration with Order Creation

**File:** `src/app/api/checkout/process-square-payment/route.ts` (modify)

```typescript
// After successful payment and order creation
await prisma.$transaction(async (tx) => {
  // Create order
  const order = await tx.order.create({
    data: {
      // ... order data
    },
    include: {
      orderItems: true,
      user: true,
    },
  })

  // Clear cart
  await tx.cart.delete({ where: { userId } })

  return order
})

// ✅ SEND EMAIL AFTER TRANSACTION COMMITS
await EmailService.sendOrderConfirmation(order)

return NextResponse.json({
  success: true,
  orderId: order.id,
})
```

### Integration with Order Status Updates

**File:** `src/app/api/orders/[id]/route.ts` (modify)

```typescript
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { status, trackingNumber, carrier } = await request.json()

  // Get current order
  const currentOrder = await prisma.order.findUnique({
    where: { id },
    include: { user: true, orderItems: true },
  })

  if (!currentOrder) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  // Update order
  const updatedOrder = await prisma.order.update({
    where: { id },
    data: {
      status,
      trackingNumber,
      carrier,
      shippedAt: status === 'SHIPPED' ? new Date() : undefined,
      deliveredAt: status === 'DELIVERED' ? new Date() : undefined,
    },
    include: { user: true, orderItems: true },
  })

  // ✅ SEND APPROPRIATE EMAIL BASED ON STATUS CHANGE
  if (status !== currentOrder.status) {
    if (status === 'SHIPPED' && trackingNumber) {
      await EmailService.sendShippingNotification(updatedOrder, trackingNumber, carrier)
    } else if (status === 'DELIVERED') {
      await EmailService.sendDeliveryConfirmation(updatedOrder)
    } else if (status === 'CANCELLED') {
      await EmailService.sendCancellationNotification(updatedOrder)
    } else {
      await EmailService.sendStatusUpdate(updatedOrder, currentOrder.status)
    }
  }

  return NextResponse.json({ order: updatedOrder })
}
```

### Email Templates (React Email)

**File:** `src/emails/OrderConfirmationEmail.tsx` (already exists, may need updates)

```tsx
import { Html, Head, Body, Container, Section, Text, Button } from '@react-email/components'

export function OrderConfirmationEmail({
  orderNumber,
  customerName,
  orderDate,
  items,
  total,
  shippingAddress,
  estimatedDelivery,
  trackingUrl,
}) {
  return (
    <Html>
      <Head />
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.header}>
            <Text style={styles.heading}>Order Confirmation</Text>
          </Section>

          <Section style={styles.content}>
            <Text style={styles.greeting}>Hi {customerName},</Text>

            <Text style={styles.text}>
              Thank you for your order! We've received your order #{orderNumber} and we're getting
              it ready for production.
            </Text>

            <Section style={styles.orderDetails}>
              <Text style={styles.subheading}>Order Details</Text>
              <Text style={styles.detail}>Order Number: #{orderNumber}</Text>
              <Text style={styles.detail}>
                Order Date: {new Date(orderDate).toLocaleDateString()}
              </Text>
              <Text style={styles.detail}>
                Estimated Delivery: {new Date(estimatedDelivery).toLocaleDateString()}
              </Text>
            </Section>

            <Section style={styles.items}>
              <Text style={styles.subheading}>Items Ordered</Text>
              {items.map((item, index) => (
                <div key={index} style={styles.item}>
                  <Text>
                    {item.quantity}x {item.name}
                  </Text>
                  <Text>${item.unitPrice.toFixed(2)}</Text>
                </div>
              ))}
              <div style={styles.total}>
                <Text style={styles.totalLabel}>Total:</Text>
                <Text style={styles.totalAmount}>${total.toFixed(2)}</Text>
              </div>
            </Section>

            <Section style={styles.shippingAddress}>
              <Text style={styles.subheading}>Shipping Address</Text>
              <Text>{shippingAddress.line1}</Text>
              {shippingAddress.line2 && <Text>{shippingAddress.line2}</Text>}
              <Text>
                {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}
              </Text>
            </Section>

            <Button href={trackingUrl} style={styles.button}>
              Track Your Order
            </Button>

            <Text style={styles.footer}>Questions? Contact us at support@gangrunprinting.com</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const styles = {
  body: { backgroundColor: '#f6f9fc', fontFamily: 'Arial, sans-serif' },
  container: { margin: '0 auto', padding: '20px', maxWidth: '600px' },
  header: { textAlign: 'center', marginBottom: '20px' },
  heading: { fontSize: '24px', fontWeight: 'bold', color: '#333' },
  // ... more styles
}
```

## Files to Create/Modify

### Backend (New Files)

- `src/services/EmailService.ts` - Email sending logic
- `src/emails/OrderStatusUpdateEmail.tsx` - Status update template
- `src/emails/ShippingNotificationEmail.tsx` - Shipping template
- `src/emails/OrderCancellationEmail.tsx` - Cancellation template
- `src/emails/DeliveryConfirmationEmail.tsx` - Delivery template

### Backend (Modifications)

- `src/app/api/checkout/process-square-payment/route.ts` - Add email trigger
- `src/app/api/orders/[id]/route.ts` - Add email triggers on status change
- `src/emails/OrderConfirmationEmail.tsx` - Enhance existing template

### Configuration

- `.env.production` - Ensure RESEND_API_KEY is set
- Add FROM_EMAIL and SUPPORT_EMAIL variables

## Testing Requirements

### Unit Tests

- [ ] EmailService methods send emails correctly
- [ ] Email templates render without errors
- [ ] Email content includes all required fields
- [ ] Email subject lines are descriptive

### Integration Tests

- [ ] Order creation triggers confirmation email
- [ ] Status update triggers appropriate email
- [ ] Shipping update sends tracking email
- [ ] Cancellation sends cancellation email
- [ ] Email failures don't block order processing

### Manual Testing Checklist

- [ ] Place order, receive confirmation email
- [ ] Check email formatting in Gmail, Outlook, Apple Mail
- [ ] Check mobile email rendering
- [ ] Update order status to "Processing", receive email
- [ ] Add tracking number, receive shipping email
- [ ] Click tracking link, verify it works
- [ ] Mark order delivered, receive delivery email
- [ ] Cancel order, receive cancellation email
- [ ] Verify all emails have unsubscribe link (if applicable)
- [ ] Test with different customer names/addresses

## Dependencies

### External Services

- Resend (already configured)
- React Email library (already installed)

### Environment Variables Required

```env
RESEND_API_KEY=re_...
NEXT_PUBLIC_APP_URL=https://gangrunprinting.com
SUPPORT_EMAIL=support@gangrunprinting.com
FROM_EMAIL=orders@gangrunprinting.com
```

### Database

- `Order` model (exists)
- `User` model (exists)
- `OrderItem` model (exists)

## Risks & Mitigation

| Risk                            | Impact | Likelihood | Mitigation                                   |
| ------------------------------- | ------ | ---------- | -------------------------------------------- |
| Email service downtime          | MEDIUM | LOW        | Don't block order creation, queue for retry  |
| Emails marked as spam           | MEDIUM | MEDIUM     | Proper SPF/DKIM/DMARC setup, quality content |
| Email delivery delays           | LOW    | MEDIUM     | Acceptable - not critical path               |
| Email template rendering issues | LOW    | LOW        | Test across email clients                    |

## Success Metrics

- [ ] Order confirmation sent within 5 seconds of order creation
- [ ] Email delivery rate > 95%
- [ ] Email open rate > 40%
- [ ] Email click-through rate > 15%
- [ ] Customer support "Where's my order?" tickets reduced by 60%

## Email Flow Diagram

```
Order Created
  ↓
[✉️ Order Confirmation] (immediately)
  ↓
Status: PROCESSING
  ↓
[✉️ Order Processing Update] (when status changes)
  ↓
Status: READY_TO_SHIP
  ↓
[✉️ Ready to Ship Update] (when status changes)
  ↓
Status: SHIPPED
  ↓
[✉️ Shipping Notification + Tracking] (when tracking added)
  ↓
Status: DELIVERED
  ↓
[✉️ Delivery Confirmation + Review Request] (when delivered)

// Alternative flows:
Status: CANCELLED
  ↓
[✉️ Cancellation Notice + Refund Info]
```

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] Manual testing checklist complete
- [ ] Code reviewed and approved
- [ ] Email templates tested across clients
- [ ] SPF/DKIM configured for domain
- [ ] Deployed to staging and tested
- [ ] All emails sending automatically
- [ ] Documentation updated
- [ ] Ready for production deployment

## Related Stories

- Story 3.5: Payment Processing (dependency - triggers confirmation email)
- Story 3.6: Order Creation & Processing (dependency)
- Story 5.4: Order Detail & Management (related - admin triggers status updates)
