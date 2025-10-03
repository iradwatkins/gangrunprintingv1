# 📧 Resend Email Service Setup Guide

## ⚠️ CRITICAL: Email Service Not Yet Configured

The email service for order confirmations is **NOT CONFIGURED**. Orders are being created but customers are **NOT receiving confirmation emails**.

---

## 🚨 Current Status

- **Resend API Key:** ❌ NOT SET
- **Email Sending:** ❌ NOT WORKING  
- **Order Confirmations:** ❌ NOT BEING SENT
- **Customer Email:** appvillagellc@gmail.com NOT receiving emails

---

## 📋 Setup Instructions

### Step 1: Create Resend Account
1. Go to https://resend.com
2. Sign up for an account (free tier includes 3,000 emails/month)
3. Verify your email address

### Step 2: Get Your API Key
1. Log in to Resend dashboard
2. Go to "API Keys" section
3. Create a new API key with "Full Access"
4. Copy the key (starts with `re_`)

### Step 3: Verify Your Domain
1. In Resend dashboard, go to "Domains"
2. Add domain: `gangrunprinting.com`
3. Add the DNS records to your domain:
   - SPF record
   - DKIM records
   - Wait for verification (usually 5-10 minutes)

### Step 4: Configure Environment Variables

Create or update `.env.local` file in project root:

```env
# Resend Email Configuration
RESEND_API_KEY=re_YOUR_API_KEY_HERE
RESEND_FROM_EMAIL=orders@gangrunprinting.com
RESEND_FROM_NAME=GangRun Printing
ADMIN_EMAIL=iradwatkins@gmail.com
```

### Step 5: Test Email Service

Run the test script:
```bash
node test-resend-connection.js
```

This will:
- Verify API key is configured
- Test connection to Resend API
- Send a test email to appvillagellc@gmail.com
- Confirm email delivery is working

### Step 6: Deploy to Production

1. Add environment variables to production server:
```bash
# On production server
echo "RESEND_API_KEY=re_YOUR_KEY" >> .env
echo "RESEND_FROM_EMAIL=orders@gangrunprinting.com" >> .env
echo "RESEND_FROM_NAME=GangRun Printing" >> .env
```

2. Restart the application:
```bash
pm2 restart gangrunprinting
```

---

## 📨 What Emails Will Be Sent

Once configured, the system will automatically send:

### 1. Order Confirmation Email (Immediate)
- Sent when order is placed
- Contains order number, items, total
- Sent to customer email

### 2. Order Status Updates
- When order moves to production
- When order ships (with tracking)
- When order is delivered

### 3. Admin Notifications
- New order alerts to admin email
- Payment confirmations
- Special instructions alerts

---

## 🧪 Testing Email Delivery

### Test with Real Order:
1. Configure Resend as above
2. Place test order at https://gangrunprinting.com/checkout
3. Use email: appvillagellc@gmail.com
4. Select "Test Cash" payment
5. Check email for confirmation

### Test with Script:
```bash
# Quick test
node test-resend-connection.js

# Full order test (5 orders)
node test-bmad-qa-complete-order-flow.js
```

---

## 📊 Email Templates

The system uses professional HTML email templates located in:
- `/src/lib/email/templates/order-confirmation.tsx`
- `/src/lib/email/templates/order-in-production.tsx`
- `/src/lib/email/templates/order-shipped.tsx`

Templates include:
- Company branding
- Order details
- Shipping information
- Track order button
- Customer support contact

---

## 🔍 Troubleshooting

### Emails Not Sending:
1. Check API key is correct
2. Verify domain is verified in Resend
3. Check spam folder
4. Review Resend dashboard for errors

### Test Connection:
```bash
# This will show detailed diagnostics
node test-resend-connection.js
```

### Check Logs:
```bash
# On production server
pm2 logs gangrunprinting | grep -i email
```

---

## 📞 Support

### Resend Support:
- Dashboard: https://resend.com/emails
- Docs: https://resend.com/docs
- Status: https://status.resend.com

### Order Email Issues:
- Check: appvillagellc@gmail.com (including spam)
- Admin: iradwatkins@gmail.com
- Test Order: Use product https://gangrunprinting.com/products/asdfasd

---

## ✅ Verification Checklist

- [ ] Resend account created
- [ ] API key obtained
- [ ] Domain verified (gangrunprinting.com)
- [ ] Environment variables set (.env.local)
- [ ] Test script passes (test-resend-connection.js)
- [ ] Test email received at appvillagellc@gmail.com
- [ ] Production server updated with env vars
- [ ] Real order sends confirmation email

---

## 🚀 Once Setup is Complete

Orders will automatically:
1. Send confirmation email to customer
2. Update order status in database
3. Notify admin of new orders
4. Track delivery status
5. Send shipping notifications

**IMPORTANT:** Until Resend is configured, NO emails will be sent and customers will NOT receive order confirmations.

---

*Last Updated: October 3, 2025*