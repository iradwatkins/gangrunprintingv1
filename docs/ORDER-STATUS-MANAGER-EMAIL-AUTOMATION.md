# Order Status Manager - Email Automation System

**Status:** ✅ **COMPLETE** (Phase 4 - October 2025)

## Overview

The Order Status Manager includes a powerful email automation system that automatically sends emails to customers when orders transition to specific statuses. This is fully integrated with **Resend** for reliable email delivery.

---

## How It Works

### 1. **Status Configuration**

Each order status (both core and custom) has these email-related fields:

- **`sendEmailOnEnter`**: Boolean flag that enables/disables automatic email sending
- **`emailTemplateId`**: Optional reference to a custom EmailTemplate in the database

### 2. **Automatic Triggering**

Emails are automatically sent when:

1. An order transitions to a status with `sendEmailOnEnter: true`
2. Via `OrderService.updateStatus()` - Single order status changes
3. Via Bulk Status Update API - Multiple orders at once

### 3. **Email Template Resolution**

The system uses a cascading template resolution:

```
1. Custom Database Template (if emailTemplateId is set)
   ↓ fallback if error
2. Default Generic Status Update Email
```

---

## Architecture

### Files Created (Phase 4)

**Email Service:**

- `/src/lib/email/status-change-email-service.ts` - Main automation service

**Integration Points:**

- `/src/lib/services/order-service.ts` - Line 215: Auto-send on status update
- `/src/app/api/admin/orders/bulk-status-update/route.ts` - Line 150: Bulk email sending

---

## Usage Examples

### Example 1: Enable Email for a Status

```typescript
// Update a status to send emails automatically
await prisma.customOrderStatus.update({
  where: { slug: 'PRODUCTION' },
  data: {
    sendEmailOnEnter: true,
    emailTemplateId: 'production-started-template-id', // Optional
  },
})
```

### Example 2: Programmatic Status Change

```typescript
// This will automatically send email if PRODUCTION has sendEmailOnEnter: true
await OrderService.updateStatus({
  orderId: 'order-123',
  fromStatus: 'CONFIRMATION',
  toStatus: 'PRODUCTION',
  notes: 'Vendor assigned, starting production',
  changedBy: 'admin@gangrunprinting.com',
})
```

### Example 3: Bulk Status Update with Emails

```http
POST /api/admin/orders/bulk-status-update
Content-Type: application/json
Authorization: Bearer <admin-token>

{
  "orderIds": ["order-1", "order-2", "order-3"],
  "toStatus": "SHIPPED",
  "notes": "Batch shipped via FedEx",
  "sendEmail": true
}
```

**Response:**

```json
{
  "success": true,
  "result": {
    "success": ["order-1", "order-2", "order-3"],
    "failed": [],
    "summary": {
      "total": 3,
      "succeeded": 3,
      "failed": 0
    }
  },
  "message": "Updated 3 of 3 orders"
}
```

---

## Custom Email Templates

### Database Structure

```typescript
EmailTemplate {
  id: string
  name: string
  subject: string
  content: {
    html: string  // HTML version with variables
    text: string  // Plain text version
  }
}
```

### Available Variables

All email templates support these variables:

| Variable             | Description                  | Example                                     |
| -------------------- | ---------------------------- | ------------------------------------------- |
| `{{orderNumber}}`    | Order number                 | ORD-2025-123                                |
| `{{customerName}}`   | Customer's name              | John Doe                                    |
| `{{statusName}}`     | Human-readable status        | Production                                  |
| `{{statusSlug}}`     | Database slug                | PRODUCTION                                  |
| `{{trackingNumber}}` | Tracking number if available | 1Z999AA10123456784                          |
| `{{trackingUrl}}`    | Full tracking URL            | https://gangrunprinting.com/track?order=... |
| `{{orderUrl}}`       | Order details page           | https://gangrunprinting.com/orders/123      |
| `{{notes}}`          | Status change notes          | Vendor assigned: ABC Print Shop             |
| `{{total}}`          | Order total formatted        | $299.99                                     |

### Template Example

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Order Update</title>
  </head>
  <body style="font-family: Arial, sans-serif;">
    <h1>Your Order is Now in Production!</h1>

    <p>Hi {{customerName}},</p>

    <p>Great news! Your order <strong>{{orderNumber}}</strong> has entered production.</p>

    <p><strong>Order Total:</strong> {{total}}</p>

    {{#if notes}}
    <p><strong>Notes:</strong> {{notes}}</p>
    {{/if}}

    <p>
      <a
        href="{{orderUrl}}"
        style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px;"
      >
        Track Your Order
      </a>
    </p>

    <p>Questions? Reply to this email or call 1-800-PRINTING</p>

    <p>
      Best regards,<br />
      GangRun Printing Team
    </p>
  </body>
</html>
```

---

## Default Email Fallback

If no custom template is configured, the system uses the default status update email from `/src/lib/email-templates.ts`:

```typescript
getOrderStatusUpdateEmail({
  orderNumber: order.orderNumber,
  customerName: order.User?.name || 'Valued Customer',
  status: status.name,
  trackingNumber: order.trackingNumber,
})
```

This provides a clean, professional email with:

- Order number
- Status name
- Tracking information (if available)
- Link to track order
- GangRun Printing branding

---

## Email Delivery

### Provider: Resend

All emails are sent through **Resend** using the configuration in `/src/lib/resend.ts`.

**Environment Variables Required:**

```bash
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=orders@gangrunprinting.com
RESEND_FROM_NAME=GangRun Printing
```

### Error Handling

Email failures **DO NOT** block status updates:

```typescript
// If email fails, status update still succeeds
try {
  await StatusChangeEmailService.sendStatusChangeEmail(...)
} catch (error) {
  console.error('[Email Error]', error)
  // Status update continues
}
```

This ensures operational continuity even if email service has issues.

---

## Testing Email Automation

### 1. Test Single Order Update

```bash
# Create test order in CONFIRMATION status
# Then update to PRODUCTION (if it has sendEmailOnEnter: true)

curl -X PATCH https://gangrunprinting.com/api/orders/ORDER_ID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "toStatus": "PRODUCTION",
    "notes": "Test email automation"
  }'
```

### 2. Preview Email Template

```typescript
import { StatusChangeEmailService } from '@/lib/email/status-change-email-service'

// Preview email with sample data
const preview = await StatusChangeEmailService.previewTemplate(
  'template-id',
  'sample-order-id' // optional
)

console.log(preview.subject)
console.log(preview.html)
console.log(preview.text)
```

### 3. Check Resend Dashboard

Monitor email delivery at: https://resend.com/emails

- Delivery status
- Open rates
- Click rates
- Bounce/spam reports

---

## Admin Configuration Workflow

### Step 1: Configure Status Email Settings

Navigate to: `/admin/settings/order-statuses`

For each status:

1. Click "Edit"
2. Toggle "Send Email on Status Change"
3. (Optional) Select an email template
4. Click "Save"

### Step 2: Create Custom Email Templates

Navigate to: `/admin/emails` (if available)

1. Click "Create Template"
2. Set template name and subject
3. Write HTML/text content with variables
4. Save template
5. Link template to status(es)

### Step 3: Test with Sample Order

1. Create a test order
2. Manually change its status
3. Check customer email inbox
4. Verify email content and formatting

---

## Production Checklist

Before going live with email automation:

- [ ] **Verify Resend API key** is set in production environment
- [ ] **Test all core status transitions** (CONFIRMATION, PRODUCTION, SHIPPED, etc.)
- [ ] **Review email templates** for branding and accuracy
- [ ] **Check spam filters** - Send test emails to Gmail, Outlook, Yahoo
- [ ] **Set up email monitoring** - Monitor Resend dashboard for delivery issues
- [ ] **Configure email template fallbacks** - Ensure default templates work
- [ ] **Test bulk status updates** - Verify emails send for all orders
- [ ] **Check unsubscribe links** - Ensure compliance (if required)
- [ ] **Monitor error logs** - Watch for email failures in production

---

## API Reference

### StatusChangeEmailService

#### `sendStatusChangeEmail(orderId, toStatusSlug, options?)`

Main entry point for triggering automated emails.

**Parameters:**

- `orderId` (string): Order ID to send email for
- `toStatusSlug` (string): Target status slug (e.g., 'PRODUCTION')
- `options` (optional):
  - `notes` (string): Status change notes
  - `changedBy` (string): Who made the change
  - `metadata` (object): Additional data

**Returns:** `Promise<boolean>` - true if email sent, false if skipped/failed

**Example:**

```typescript
const sent = await StatusChangeEmailService.sendStatusChangeEmail('order-123', 'PRODUCTION', {
  notes: 'Assigned to vendor: ABC Print',
  changedBy: 'admin@gangrunprinting.com',
})
```

#### `previewTemplate(templateId, sampleOrderId?)`

Generate email preview with sample/real data.

**Parameters:**

- `templateId` (string): EmailTemplate ID
- `sampleOrderId` (string, optional): Real order ID for data

**Returns:**

```typescript
{
  subject: string
  html: string
  text: string
}
```

---

## Future Enhancements (Not Yet Implemented)

Potential improvements for future phases:

1. **Email Scheduling** - Delay email sending by X minutes/hours
2. **A/B Testing** - Test multiple template variations
3. **Email Analytics** - Track opens, clicks, conversions per status
4. **Conditional Logic** - Send different emails based on order value/type
5. **Multi-language Support** - Detect customer language and send appropriate template
6. **SMS Integration** - Send SMS alongside email for critical statuses
7. **Email Digest** - Batch multiple status updates into single email
8. **Unsubscribe Management** - Allow customers to opt-out of certain emails

---

## Troubleshooting

### Issue: Emails not sending

**Check:**

1. Is `sendEmailOnEnter` enabled for the status?
2. Is Resend API key configured?
3. Check application logs for errors
4. Verify order has valid email address
5. Check Resend dashboard for delivery failures

### Issue: Wrong template rendering

**Check:**

1. Is correct `emailTemplateId` linked to status?
2. Are template variables using correct syntax (`{{variable}}`)?
3. Is template content valid JSON?
4. Check browser console for template errors

### Issue: Variables not replacing

**Check:**

1. Variable syntax: Use `{{variable}}` or `{variable}`
2. Case-sensitive: `{{customerName}}` not `{{CustomerName}}`
3. Check order data: Does order have the required fields?
4. Test with preview function first

---

## Support

For email automation issues:

1. Check logs: `pm2 logs gangrunprinting | grep StatusChangeEmail`
2. Test Resend connection: `node test-resend-connection.js`
3. Review this documentation
4. Contact: iradwatkins@gmail.com

---

**Last Updated:** October 2025
**Status:** Production Ready ✅
**Integration:** Resend API
**Author:** Claude Code (BMAD Method)
