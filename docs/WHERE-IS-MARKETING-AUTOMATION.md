# Marketing Automation - Location Guide

**Quick Reference:** Where to find everything related to the new marketing automation system

---

## 📍 Admin Dashboard - GangRun Printing

### Access the Marketing Section

**URL:** https://gangrunprinting.com/admin/marketing

**Navigation Path:**
```
Admin Dashboard → Sidebar → Marketing
```

### Marketing Subsections

**1. Automation** 📧
- **URL:** `/admin/marketing/automation`
- **Purpose:** View and manage automation workflows
- **What you'll see:**
  - List of all workflows (once N8N is set up)
  - Workflow status (Active/Inactive)
  - Execution counts
  - Last triggered timestamps

**2. Create New Workflow**
- **URL:** `/admin/marketing/automation/new`
- **Purpose:** Create new automation workflows
- **Note:** This is the UI-based workflow builder (database-driven)
  - N8N will read workflows from this database
  - Visual workflow editor for non-technical users

**3. Analytics** 📊
- **URL:** `/admin/marketing/analytics`
- **Purpose:** View marketing performance metrics
- **Metrics to track:**
  - Email open rates
  - Click-through rates
  - Conversion rates
  - Revenue from campaigns

**4. Campaigns** 📢
- **URL:** `/admin/marketing/campaigns`
- **Purpose:** Manage marketing campaigns

**5. Segments** 👥
- **URL:** `/admin/marketing/segments`
- **Purpose:** Customer segmentation
- **Connected to:** `CustomerSegment` database table

**6. Email Builder** ✉️
- **URL:** `/admin/marketing/email-builder`
- **Purpose:** Custom email template builder

---

## 🔌 API Endpoints - New Marketing Automation

All new API endpoints are live at `https://gangrunprinting.com/api/marketing/`

### Cart Tracking

**Track Cart Sessions:**
```
POST https://gangrunprinting.com/api/marketing/carts/track

Body:
{
  "sessionId": "unique-session-id",
  "userId": "user-id-if-logged-in",
  "email": "customer@email.com",
  "items": [...],
  "subtotal": 4999,
  "total": 5499
}
```

**Fetch Abandoned Carts:**
```
GET https://gangrunprinting.com/api/marketing/carts/abandoned?minHours=3&maxHours=72

Response:
{
  "success": true,
  "count": 15,
  "carts": [...]
}
```

### Customer Data

**Fetch Anniversaries:**
```
GET https://gangrunprinting.com/api/marketing/customers/anniversaries?type=first_purchase&daysAgo=365

Response:
{
  "success": true,
  "count": 8,
  "customers": [...]
}
```

**Fetch Inactive Customers:**
```
GET https://gangrunprinting.com/api/marketing/customers/inactive?minDays=60&maxDays=90

Response:
{
  "success": true,
  "count": 23,
  "customers": [...]
}
```

### Coupons

**Generate Coupon:**
```
POST https://gangrunprinting.com/api/marketing/coupons/generate

Body:
{
  "type": "PERCENTAGE",
  "value": 10,
  "userId": "user-id",
  "campaign": "abandoned_cart",
  "expiresInDays": 7
}

Response:
{
  "success": true,
  "coupon": {
    "code": "CART12345678",
    "value": 10,
    "expiresAt": "2025-10-27T..."
  }
}
```

**Validate Coupon:**
```
GET https://gangrunprinting.com/api/marketing/coupons/validate?code=CART12345678

Response:
{
  "valid": true,
  "coupon": {
    "code": "CART12345678",
    "type": "PERCENTAGE",
    "value": 10,
    "minPurchase": null,
    "expiresAt": "2025-10-27T..."
  }
}
```

### Email Rendering

**Render and Send Email:**
```
POST https://gangrunprinting.com/api/marketing/emails/render

Body:
{
  "template": "abandoned_cart",
  "to": "customer@email.com",
  "subject": "Your Cart is Waiting! Save 10% Now 🛒",
  "data": {
    "customerName": "John Doe",
    "items": [...],
    "total": 5499,
    "couponCode": "CART12345678",
    "cartUrl": "https://gangrunprinting.com/checkout?session=xxx"
  }
}

Response:
{
  "success": true,
  "message": "Email sent to customer@email.com",
  "template": "abandoned_cart"
}
```

---

## 🤖 N8N Workflows - n8n.agistaffers.com

### Access N8N

**URL:** https://n8n.agistaffers.com

**Login Credentials:**
- Check your N8N admin credentials
- Usually the same as your admin user

### Where to Create Workflows

**Step 1: Log in to N8N**
- Go to https://n8n.agistaffers.com
- Enter credentials

**Step 2: Create New Workflow**
- Click "+ New Workflow" (top right)
- Give it a descriptive name

### 7 Workflows to Create

**Cron-based Workflows (Automated):**

1. **Abandoned Cart - 3 Hour**
   - Name: `GangRun - Abandoned Cart (3hr)`
   - Trigger: Cron - Every hour (`0 * * * *`)
   - Calls: `/api/marketing/carts/abandoned?minHours=3&maxHours=4`

2. **Abandoned Cart - 24 Hour**
   - Name: `GangRun - Abandoned Cart (24hr)`
   - Trigger: Cron - Every hour (`0 * * * *`)
   - Calls: `/api/marketing/carts/abandoned?minHours=24&maxHours=25`

3. **Abandoned Cart - 72 Hour**
   - Name: `GangRun - Abandoned Cart (72hr)`
   - Trigger: Cron - Every hour (`0 * * * *`)
   - Calls: `/api/marketing/carts/abandoned?minHours=72&maxHours=73`

4. **Abandoned Cart - Tiered**
   - Name: `GangRun - Abandoned Cart Tiered`
   - Trigger: Cron - Every hour (`0 * * * *`)
   - Calls: 3 parallel branches for different cart values

5. **Win-back Campaign**
   - Name: `GangRun - Customer Win-back`
   - Trigger: Cron - Daily at 10 AM (`0 10 * * *`)
   - Calls: `/api/marketing/customers/inactive?minDays=60&maxDays=90`

6. **Order Anniversaries**
   - Name: `GangRun - Order Anniversaries`
   - Trigger: Cron - Daily at 9 AM (`0 9 * * *`)
   - Calls: `/api/marketing/customers/anniversaries?daysAgo=365`

7. **Review Collection**
   - Name: `GangRun - Review Collection`
   - Trigger: Cron - Daily at 2 PM (`0 14 * * *`)
   - Calls: `/api/orders?status=DELIVERED&deliveredDaysAgo=3`

**Webhook-based Workflows (Real-time):**

8. **Post-Purchase Thank You**
   - Name: `GangRun - Order Created Webhook`
   - Trigger: Webhook - `/webhook/order-created`
   - Listens for: `order.created` event

9. **Order Delivered Review**
   - Name: `GangRun - Order Delivered Webhook`
   - Trigger: Webhook - `/webhook/order-delivered`
   - Listens for: `order.delivered` event

---

## 🗂️ Database Tables - PostgreSQL

### New Tables Created

**CartSession**
```sql
-- View abandoned carts
SELECT * FROM "CartSession"
WHERE abandoned = true
ORDER BY "abandonedAt" DESC
LIMIT 20;

-- Check recovery rate
SELECT
  COUNT(*) FILTER (WHERE recovered = true) * 100.0 / COUNT(*) as recovery_rate
FROM "CartSession"
WHERE abandoned = true;
```

**Coupon**
```sql
-- View active coupons
SELECT * FROM "Coupon"
WHERE "isActive" = true
  AND ("expiresAt" IS NULL OR "expiresAt" > NOW())
ORDER BY "createdAt" DESC
LIMIT 20;

-- Check coupon usage
SELECT
  code,
  type,
  value,
  "usageCount",
  "usageLimit",
  "expiresAt"
FROM "Coupon"
WHERE "usageCount" > 0
ORDER BY "createdAt" DESC;
```

**N8NWebhook**
```sql
-- View registered webhooks
SELECT
  name,
  url,
  trigger,
  "isActive",
  "triggerCount",
  "lastTriggered"
FROM "N8NWebhook"
ORDER BY "triggerCount" DESC;
```

**N8NWebhookLog**
```sql
-- View webhook execution logs
SELECT
  w.name,
  l.status,
  l."executedAt",
  l.response
FROM "N8NWebhookLog" l
JOIN "N8NWebhook" w ON l."webhookId" = w.id
ORDER BY l."executedAt" DESC
LIMIT 50;

-- Check for failed webhooks
SELECT
  w.name,
  COUNT(*) as failure_count
FROM "N8NWebhookLog" l
JOIN "N8NWebhook" w ON l."webhookId" = w.id
WHERE l.status != 200
GROUP BY w.name
ORDER BY failure_count DESC;
```

---

## 📧 Email Templates - React Email

**Location:** `/src/lib/email/templates/marketing/`

**Templates Available:**

1. **abandoned-cart.tsx**
   - Used by: Abandoned cart workflows
   - Shows: Cart items, coupon code, CTA button

2. **winback.tsx**
   - Used by: Win-back campaign workflow
   - Shows: Last order info, coupon code, popular products

3. **anniversary.tsx**
   - Used by: Anniversary workflow
   - Shows: Order date, celebration message

4. **review-request.tsx**
   - Used by: Review collection workflow
   - Shows: 5-star rating, order info, review CTA

5. **thank-you.tsx**
   - Used by: Post-purchase webhook
   - Shows: Order summary, what's next, upsell products

---

## 🔍 How to Test Everything

### Test API Endpoints

**Using curl:**
```bash
# Test abandoned carts API
curl -X GET "https://gangrunprinting.com/api/marketing/carts/abandoned?minHours=3&maxHours=72"

# Test coupon generation
curl -X POST "https://gangrunprinting.com/api/marketing/coupons/generate" \
  -H "Content-Type: application/json" \
  -d '{"type":"PERCENTAGE","value":10,"campaign":"test"}'

# Test email rendering
curl -X POST "https://gangrunprinting.com/api/marketing/emails/render" \
  -H "Content-Type: application/json" \
  -d '{
    "template":"abandoned_cart",
    "to":"test@example.com",
    "subject":"Test Email",
    "data":{"customerName":"Test User","items":[],"total":5000}
  }'
```

### Test in Admin Dashboard

1. **Go to:** https://gangrunprinting.com/admin/marketing/automation
2. **You should see:** List of workflows from database
3. **Click:** "Create New Workflow" to test the UI builder

### Test in N8N

1. **Go to:** https://n8n.agistaffers.com
2. **Create:** A new workflow
3. **Add nodes:**
   - Cron Trigger node
   - HTTP Request node (call GangRun API)
   - HTTP Request node (render email)
4. **Test:** Click "Execute Workflow" to test manually

---

## 📊 Monitoring Dashboards

### GangRun Admin Dashboard

**Analytics Page:**
- URL: https://gangrunprinting.com/admin/marketing/analytics
- Shows: Campaign performance, email metrics

**Automation Page:**
- URL: https://gangrunprinting.com/admin/marketing/automation
- Shows: Workflow list, execution counts

### N8N Dashboard

**Executions:**
- URL: https://n8n.agistaffers.com/executions
- Shows: All workflow executions, success/failure

**Workflows:**
- URL: https://n8n.agistaffers.com/workflows
- Shows: All workflows, active/inactive status

### Resend Dashboard

**Email Logs:**
- URL: https://resend.com/emails
- Shows: All sent emails, delivery status, opens, clicks

---

## 🚀 Quick Start Checklist

**To activate the full system:**

- [ ] **Access Admin Dashboard**
  - Go to: https://gangrunprinting.com/admin/marketing
  - Verify: All pages load correctly

- [ ] **Access N8N**
  - Go to: https://n8n.agistaffers.com
  - Log in with admin credentials

- [ ] **Create N8N Workflows**
  - Follow guide: `/docs/N8N-MARKETING-AUTOMATION-SETUP.md`
  - Create all 7 cron workflows
  - Create 2 webhook workflows

- [ ] **Seed Webhooks in Database**
  - Run SQL from deployment summary
  - Verify with: `SELECT * FROM "N8NWebhook"`

- [ ] **Test Each Workflow**
  - Run manually in N8N
  - Verify emails received
  - Check database for logs

- [ ] **Monitor Performance**
  - Check N8N executions daily
  - Review email delivery in Resend
  - Query database for metrics

---

## 📞 Support

**Documentation:**
- Setup Guide: `/docs/N8N-MARKETING-AUTOMATION-SETUP.md`
- Implementation: `/docs/MARKETING-AUTOMATION-COMPLETE.md`
- Deployment: `/docs/DEPLOYMENT-SUMMARY-2025-10-20.md`
- This Guide: `/docs/WHERE-IS-MARKETING-AUTOMATION.md`

**Key URLs:**
- Admin: https://gangrunprinting.com/admin/marketing
- N8N: https://n8n.agistaffers.com
- Resend: https://resend.com/emails
- GitHub: https://github.com/iradwatkins/gangrunprintingv1

---

**Everything is ready to go! Just need to set up N8N workflows following the guide.**
