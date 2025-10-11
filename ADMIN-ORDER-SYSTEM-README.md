# 🎯 COMPLETE ADMIN ORDER PROCESSING SYSTEM

## ✅ WHAT'S BEEN BUILT

You now have a **fully functional print broker order management system** with:

### 1. **Database Schema** (`prisma/schema.prisma`)

- ✅ 13 broker-specific order statuses
- ✅ 18 new tracking fields (deadlines, notes, pickup info, etc.)
- ✅ Ready for migration

### 2. **Core Business Logic** (`src/lib/services/order-service.ts`)

- ✅ `OrderService.processPayment()` - Square webhook integration
- ✅ `OrderService.assignVendor()` - Print partner assignment
- ✅ `OrderService.updateStatus()` - Status management with validation
- ✅ `OrderService.updateShipping()` - Tracking & shipping
- ✅ `OrderService.markPickedUp()` - Local/airport pickup
- ✅ `OrderService.putOnHold()` - Quality control

### 3. **Payment System**

- ✅ Square webhook handler (`/api/webhooks/square/payment`)
- ✅ Manual payment capture (`/api/admin/orders/[id]/capture-payment`)
- ✅ Invoice generation & sending (`/api/admin/orders/[id]/send-invoice`)

### 4. **Admin UI Components**

- ✅ `OrderQuickActions` - One-click actions from orders list:
  - Update status
  - Capture payment
  - Send invoice
  - Add shipping info

### 5. **Email System** (`src/lib/email/`)

- ✅ React Email templates
- ✅ Order confirmation
- ✅ Production notification
- ✅ Shipping notification
- ✅ On-hold notification
- ✅ Ready for pickup

### 6. **API Endpoints**

- ✅ `PATCH /api/orders/[id]/status` - Update order status
- ✅ `POST /api/orders/[id]/assign-vendor` - Assign print vendor
- ✅ `POST /api/admin/orders/[id]/capture-payment` - Manual payment
- ✅ `POST /api/admin/orders/[id]/send-invoice` - Send invoice email
- ✅ `POST /api/admin/orders/[id]/shipping` - Update tracking

---

## 🚀 HOW TO DEPLOY

### Step 1: Run Database Migration

```bash
cd /root/websites/gangrunprinting

# Make migration script executable
chmod +x run-migration.sh

# Run migration (creates backup first)
./run-migration.sh
```

**What it does:**

- Creates backup of current database
- Adds new columns to Order table
- Updates OrderStatus enum to broker-specific statuses
- Maps existing orders to new statuses
- Creates performance indexes

### Step 2: Generate Prisma Client

```bash
npx prisma generate
```

### Step 3: Restart Application

```bash
pm2 restart gangrunprinting
pm2 save
```

### Step 4: Verify System

```bash
# Check webhook endpoint
curl https://gangrunprinting.com/api/webhooks/square/payment

# Should return: {"service":"Square Payment Webhook","status":"active"}
```

---

## 💻 HOW TO USE THE ADMIN DASHBOARD

### 1. **Update Order Status**

From the orders list (`/admin/orders`), click the **⋮** menu on any order:

**Quick Status Update:**

- Click "Update Status"
- Select new status from dropdown
- Add optional notes
- Click "Update Status"

**Valid Status Transitions:**

- PENDING_PAYMENT → CONFIRMATION, PAYMENT_DECLINED, CANCELLED
- CONFIRMATION → PRODUCTION, ON_HOLD, CANCELLED
- PRODUCTION → SHIPPED, READY_FOR_PICKUP, ON_THE_WAY
- SHIPPED → DELIVERED
- READY_FOR_PICKUP → PICKED_UP
- ON_THE_WAY → PICKED_UP

### 2. **Capture Payment (Manual)**

For phone orders or in-person payments:

1. Click "Capture Payment" from order menu
2. Verify amount
3. Select payment method:
   - Credit Card
   - Cash
   - Check
   - Wire Transfer
4. Click "Capture Payment"

**What happens:**

- Order status changes: PENDING_PAYMENT → CONFIRMATION
- Confirmation email sent to customer
- Payment recorded in order history

### 3. **Send Invoice to Customer**

Create an invoice with payment link:

1. Click "Send Invoice" from order menu
2. Confirm customer email
3. Click "Send Invoice"

**What happens:**

- Professional invoice PDF generated
- Email sent with "Pay Now" button
- Payment link opens in new tab
- Customer can pay via Square

### 4. **Add Shipping Information**

When order ships from vendor:

1. Click "Add Shipping Info" from order menu
2. Select carrier (FedEx, UPS, Southwest Cargo)
3. Enter tracking number
4. Click "Update Shipping"

**What happens:**

- Order status changes to SHIPPED
- Tracking email sent to customer
- Customer receives tracking link

### 5. **Assign Vendor to Order**

When files are approved:

1. Go to order detail page
2. Find "Vendor Assignment" section
3. Select vendor from dropdown
4. Set production deadline
5. Click "Assign Vendor"

**What happens:**

- Order status changes to PRODUCTION
- Vendor notified via N8N
- Production notification sent to customer
- Production deadline set

---

## 📧 EMAIL NOTIFICATIONS

Customers automatically receive emails when:

| Trigger             | Email Sent            | Content                                     |
| ------------------- | --------------------- | ------------------------------------------- |
| Payment received    | Order Confirmation    | Order summary, tracking link, next steps    |
| Vendor assigned     | In Production         | Production timeline, expected completion    |
| Order ships         | Shipping Notification | Tracking number, carrier, delivery estimate |
| Ready for pickup    | Pickup Ready          | Location, hours, what to bring              |
| Files need revision | On Hold               | Issue description, upload link              |
| Delivered           | Delivery Confirmation | Satisfaction survey, reorder link           |

---

## 🎨 CUSTOMIZING THE ADMIN DASHBOARD

### Add Quick Actions to Orders List

Edit `/root/websites/gangrunprinting/src/app/admin/orders/page.tsx`:

```tsx
import { OrderQuickActions } from '@/components/admin/orders/order-quick-actions'

// In the table row:
;<TableCell>
  <OrderQuickActions order={order} onUpdate={() => window.location.reload()} />
</TableCell>
```

### Add Bulk Actions

Create `/src/components/admin/orders/bulk-actions.tsx` to:

- Update multiple orders at once
- Send bulk emails
- Generate batch shipping labels
- Export to CSV

---

## 🔧 SQUARE WEBHOOK SETUP

### 1. Get Webhook Signature Key

1. Go to [Square Developer Dashboard](https://developer.squareup.com/)
2. Navigate to: **Webhooks** → **Subscriptions**
3. Create new subscription
4. Copy **Signature Key**

### 2. Configure Webhooks

**Webhook URL:**

```
https://gangrunprinting.com/api/webhooks/square/payment
```

**Events to Subscribe:**

- `payment.created`
- `payment.updated`

### 3. Update Environment Variables

Edit `.env`:

```bash
SQUARE_WEBHOOK_SIGNATURE_KEY=your_signature_key_here
SQUARE_WEBHOOK_URL=https://gangrunprinting.com/api/webhooks/square/payment
```

### 4. Test Webhook

```bash
# From Square Dashboard, send test event
# Check logs:
pm2 logs gangrunprinting --lines 50 | grep "Square Webhook"
```

---

## 🤖 N8N INTEGRATION (COMING NEXT)

When ready to connect N8N, I'll need:

1. **N8N Instance URL**
   - Example: `http://localhost:5678`

2. **Webhook URLs** you want to trigger:
   - Order paid
   - Vendor assigned
   - Order shipped
   - etc.

3. **What actions** you want N8N to perform:
   - Send Slack notifications?
   - Create tasks in project management tool?
   - Update inventory?
   - Send SMS via Twilio?
   - Trigger other automations?

---

## 📊 BROKER ORDER STATUSES

### Complete Status Flow

```
Customer Places Order
        ↓
┌─────────────────┐
│ PENDING_PAYMENT │ ← Awaiting customer payment
└────────┬────────┘
         │ Payment ✅
         ↓
┌─────────────────┐
│  CONFIRMATION   │ ← Files under review (you review)
└────────┬────────┘
         │ Files good? Assign vendor
         ↓
┌─────────────────┐
│   PRODUCTION    │ ← Vendor is printing
└────────┬────────┘
         │ Vendor completes
         ├──────────┬──────────┐
         ↓          ↓          ↓
    SHIPPED   READY_FOR_  ON_THE_WAY
              PICKUP      (Airport)
         │          │          │
         ↓          ↓          ↓
    DELIVERED  PICKED_UP  PICKED_UP
```

### Special Statuses

- **PAYMENT_DECLINED** - Payment failed, retry
- **ON_HOLD** - Files need revision
- **REPRINT** - Reprinting due to issue
- **CANCELLED** - Order cancelled
- **REFUNDED** - Payment refunded

---

## 🧪 TESTING THE SYSTEM

### Test Payment Capture

```bash
curl -X POST https://gangrunprinting.com/api/admin/orders/ORDER_ID/capture-payment \
  -H "Content-Type: application/json" \
  -H "Cookie: your-auth-cookie" \
  -d '{"amount":5000,"method":"CREDIT_CARD"}'
```

### Test Invoice Sending

```bash
curl -X POST https://gangrunprinting.com/api/admin/orders/ORDER_ID/send-invoice \
  -H "Cookie: your-auth-cookie"
```

### Test Status Update

```bash
curl -X PATCH https://gangrunprinting.com/api/orders/ORDER_ID/status \
  -H "Content-Type: application/json" \
  -H "Cookie: your-auth-cookie" \
  -d '{"toStatus":"PRODUCTION","notes":"Assigned to PrintVendor Inc"}'
```

---

## 🎯 NEXT STEPS

### Immediate (Do This Now):

1. ✅ Run database migration
2. ✅ Test order status updates
3. ✅ Test manual payment capture
4. ✅ Send test invoice

### Short-term (This Week):

1. Configure Square webhooks
2. Test payment webhook with real payment
3. Add OrderQuickActions to orders list
4. Train team on admin dashboard

### Medium-term (Next Week):

1. Connect N8N for automation
2. Customize email templates with logo
3. Add bulk actions for orders
4. Set up vendor notification system

### Long-term (This Month):

1. Build customer portal for order tracking
2. Integrate FedEx API for automatic label generation
3. Add analytics dashboard
4. Create vendor portal

---

## 🆘 TROUBLESHOOTING

### Order status won't update

- Check order's current status
- Verify valid status transition
- Check browser console for errors
- View PM2 logs: `pm2 logs gangrunprinting`

### Email not sending

- Verify Resend API key in `.env`
- Check email service logs
- Confirm customer email is valid
- Test with your own email first

### Payment not processing

- Verify Square credentials
- Check webhook signature key
- View Square Dashboard → Webhooks → Logs
- Test with Square sandbox first

### Database migration failed

- Restore from backup in `/root/backups/`
- Check PostgreSQL logs
- Verify database connection
- Contact for support

---

## 📞 SUPPORT

Questions? Need help?

- Email: iradwatkins@gmail.com
- Check PM2 logs: `pm2 logs gangrunprinting`
- View database: `psql -h 172.22.0.1 -U gangrun_user -d gangrun_db`

---

**Built with BMAD methodology for GangRun Printing** 🚀
