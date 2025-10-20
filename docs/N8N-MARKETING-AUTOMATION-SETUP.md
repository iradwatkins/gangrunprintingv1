# N8N Marketing Automation Setup Guide

**Complete setup guide for GangRun Printing's Hybrid Marketing Automation System**

---

## Architecture Overview

**Hybrid System:**
- **N8N** - Execution engine (scheduling, cron jobs, error handling)
- **Next.js** - Business logic (API endpoints, email templates, database)
- **PostgreSQL** - Single source of truth (CartSession, Coupon, Order, User)
- **React Email + Resend** - Email rendering and delivery

---

## Phase 1: N8N Cron Workflows (Automated Background Jobs)

### Workflow 1: Abandoned Cart Reminders (Hourly)

**Purpose:** Send 3-part email sequence to customers with abandoned carts

**Trigger:** Cron Schedule - Every hour (`0 * * * *`)

**Workflow Nodes:**

1. **Cron Trigger** (Every hour)
2. **HTTP Request** - Fetch 3-hour abandoned carts
   - Method: GET
   - URL: `https://gangrunprinting.com/api/marketing/carts/abandoned?minHours=3&maxHours=4`
3. **Split In Batches** - Process one cart at a time
4. **HTTP Request** - Generate coupon (10% off)
   - Method: POST
   - URL: `https://gangrunprinting.com/api/marketing/coupons/generate`
   - Body:
     ```json
     {
       "type": "PERCENTAGE",
       "value": 10,
       "userId": "{{ $json.userId }}",
       "campaign": "abandoned_cart",
       "expiresInDays": 7
     }
     ```
5. **HTTP Request** - Render and send email
   - Method: POST
   - URL: `https://gangrunprinting.com/api/marketing/emails/render`
   - Body:
     ```json
     {
       "template": "abandoned_cart",
       "to": "{{ $json.email }}",
       "subject": "Your Cart is Waiting! Save 10% Now 🛒",
       "data": {
         "customerName": "{{ $json.User.name }}",
         "items": "{{ $json.items }}",
         "subtotal": "{{ $json.subtotal }}",
         "total": "{{ $json.total }}",
         "cartUrl": "https://gangrunprinting.com/checkout?session={{ $json.sessionId }}",
         "couponCode": "{{ $node['HTTP Request 1'].json.coupon.code }}",
         "couponValue": 10,
         "hoursSinceAbandonment": "{{ $json.hoursSinceActivity }}"
       }
     }
     ```

**Repeat for 24-hour and 72-hour sequences** (adjust minHours/maxHours)

---

### Workflow 2: Tiered Abandoned Cart (Hourly)

**Purpose:** Send different discounts based on cart value ($50/$200/$500)

**Same as Workflow 1, but with 3 parallel branches:**

1. **Branch 1:** carts $0-$50 (5% discount)
   - URL: `.../abandoned?minHours=3&maxHours=4&minValue=0&maxValue=5000`
   - Coupon value: 5%

2. **Branch 2:** carts $50-$200 (10% discount)
   - URL: `.../abandoned?minHours=3&maxHours=4&minValue=5000&maxValue=20000`
   - Coupon value: 10%

3. **Branch 3:** carts $200+ (15% discount)
   - URL: `.../abandoned?minHours=3&maxHours=4&minValue=20000`
   - Coupon value: 15%

---

### Workflow 3: Customer Win-back (Daily)

**Purpose:** Re-engage customers who haven't ordered in 60+ days

**Trigger:** Cron Schedule - Daily at 10 AM (`0 10 * * *`)

**Workflow Nodes:**

1. **Cron Trigger** (Daily 10 AM)
2. **HTTP Request** - Fetch inactive customers
   - Method: GET
   - URL: `https://gangrunprinting.com/api/marketing/customers/inactive?minDays=60&maxDays=90`
3. **Split In Batches**
4. **HTTP Request** - Generate coupon (20% off)
   - Coupon type: PERCENTAGE, value: 20
5. **HTTP Request** - Send winback email
   - Template: "winback"
   - Subject: "We Miss You! Come Back for 20% OFF 💙"
   - Data:
     ```json
     {
       "customerName": "{{ $json.userName }}",
       "lastOrderDate": "{{ $json.lastOrderDate }}",
       "lastOrderNumber": "{{ $json.lastOrderNumber }}",
       "daysSinceLastOrder": "{{ $json.daysSinceLastOrder }}",
       "couponCode": "{{ $node['HTTP Request 1'].json.coupon.code }}",
       "couponValue": 20
     }
     ```

---

### Workflow 4: Order Anniversaries (Daily)

**Purpose:** Celebrate customer order anniversaries (1 year, 2 years, etc.)

**Trigger:** Cron Schedule - Daily at 9 AM (`0 9 * * *`)

**Workflow Nodes:**

1. **Cron Trigger** (Daily 9 AM)
2. **HTTP Request** - Fetch anniversaries
   - URL: `https://gangrunprinting.com/api/marketing/customers/anniversaries?type=any_purchase&daysAgo=365`
3. **Split In Batches**
4. **HTTP Request** - Send anniversary email
   - Template: "anniversary"
   - Subject: "🎉 Happy {{ $json.yearsAgo }}-Year Anniversary!"
   - Data:
     ```json
     {
       "customerName": "{{ $json.userName }}",
       "orderDate": "{{ $json.orderDate }}",
       "orderNumber": "{{ $json.orderNumber }}",
       "yearsAgo": "{{ $json.yearsAgo }}"
     }
     ```

---

### Workflow 5: Review Collection (Daily)

**Purpose:** Request reviews 3 days after order delivery

**Trigger:** Cron Schedule - Daily at 2 PM (`0 14 * * *`)

**Workflow Nodes:**

1. **Cron Trigger** (Daily 2 PM)
2. **HTTP Request** - Fetch delivered orders (3 days ago)
   - Method: GET
   - URL: `https://gangrunprinting.com/api/orders?status=DELIVERED&deliveredDaysAgo=3`
   - Note: You'll need to create this API endpoint
3. **Split In Batches**
4. **HTTP Request** - Send review request
   - Template: "review_request"
   - Subject: "How Did We Do? Leave a Review ⭐"
   - Data:
     ```json
     {
       "customerName": "{{ $json.User.name }}",
       "orderNumber": "{{ $json.orderNumber }}",
       "orderDate": "{{ $json.createdAt }}",
       "reviewUrl": "https://gangrunprinting.com/reviews/new?order={{ $json.id }}"
     }
     ```

---

## Phase 2: N8N Webhook Workflows (Real-time Triggers)

### Workflow 6: Post-Purchase Thank You

**Purpose:** Send thank you email immediately after order payment

**Trigger:** Webhook

**Setup:**
1. Create webhook node in N8N → Copy webhook URL
2. Add to database:
   ```sql
   INSERT INTO "N8NWebhook" (id, name, url, trigger, description)
   VALUES (
     'webhook_order_created',
     'Post-Purchase Thank You',
     'https://n8n.agistaffers.com/webhook/order-created',
     'order.created',
     'Send thank you email after order payment'
   );
   ```

**Workflow Nodes:**

1. **Webhook Trigger** (`/webhook/order-created`)
2. **HTTP Request** - Send thank you email
   - Template: "thank_you"
   - Subject: "Thank You for Your Order! 🎉"
   - Data:
     ```json
     {
       "customerName": "{{ $json.User.name }}",
       "orderNumber": "{{ $json.orderNumber }}",
       "orderTotal": "{{ $json.total }}",
       "trackingUrl": "https://gangrunprinting.com/orders/{{ $json.id }}/track"
     }
     ```

---

### Workflow 7: Order Delivered → Review Request

**Purpose:** Send review request immediately when order status changes to DELIVERED

**Trigger:** Webhook (`/webhook/order-delivered`)

**Same setup as Workflow 6, but triggered on** `order.delivered` **event**

---

## Phase 3: Next.js Integration

### Update Order API Route

Edit `/src/app/api/orders/route.ts` to trigger N8N webhooks:

```typescript
// After creating order (payment successful)
const webhooks = await prisma.n8NWebhook.findMany({
  where: {
    trigger: 'order.created',
    isActive: true,
  },
})

for (const webhook of webhooks) {
  try {
    await fetch(webhook.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'order.created',
        order: createdOrder,
      }),
    })

    await prisma.n8NWebhook.update({
      where: { id: webhook.id },
      data: {
        lastTriggered: new Date(),
        triggerCount: { increment: 1 },
      },
    })
  } catch (error) {
    console.error(`Webhook ${webhook.name} failed:`, error)
  }
}
```

---

## Testing Checklist

**Test Each Workflow:**

1. **Abandoned Cart:**
   - Add items to cart
   - Wait 3 hours (or manually mark cart as abandoned in DB)
   - Run workflow manually in N8N
   - Verify email received with correct coupon code

2. **Win-back:**
   - Set last order date to 60+ days ago
   - Run workflow manually
   - Verify email received

3. **Anniversary:**
   - Set order date to exactly 1 year ago
   - Run workflow manually
   - Verify email received

4. **Review Request:**
   - Create order and mark as delivered 3 days ago
   - Run workflow manually
   - Verify email received

5. **Post-Purchase:**
   - Complete checkout and payment
   - Verify webhook triggered automatically
   - Verify thank you email received

---

## Monitoring & Maintenance

**N8N Dashboard:**
- View all workflow executions
- Check success/failure rates
- View error logs

**Database Queries:**

```sql
-- Check webhook trigger counts
SELECT name, trigger, "triggerCount", "lastTriggered"
FROM "N8NWebhook"
ORDER BY "lastTriggered" DESC;

-- Check abandoned carts
SELECT COUNT(*), AVG(total)
FROM "CartSession"
WHERE abandoned = true AND recovered = false;

-- Check coupon usage
SELECT code, "usageCount", "usageLimit", "expiresAt"
FROM "Coupon"
WHERE "isActive" = true
ORDER BY "createdAt" DESC
LIMIT 20;
```

---

## Configuration Summary

**Timing:**
- Abandoned Cart Email #1: 3 hours after abandonment
- Abandoned Cart Email #2: 24 hours after abandonment
- Abandoned Cart Email #3: 72 hours after abandonment
- Review Request: 3 days after delivery
- Win-back: 60-90 days after last order
- Anniversaries: Exactly 365 days (1 year)

**Discounts:**
- Abandoned Cart (standard): 10% off
- Abandoned Cart (tiered): 5% / 10% / 15% based on cart value
- Win-back: 20% off
- All coupons expire in 7 days

**Email Sending:**
- All emails sent via Resend
- From: GangRun Printing <orders@gangrunprinting.com>
- Templates: React Email (brand-consistent, professional)

---

## Next Steps

1. **Deploy Next.js changes** (API routes, email templates)
2. **Set up N8N workflows** (follow guides above)
3. **Test each workflow** (use testing checklist)
4. **Monitor for 1 week** (check execution logs, email delivery)
5. **Optimize** (adjust timing, copy, discounts based on performance)

---

**CRITICAL:** Always test workflows in sandbox/staging before production!
