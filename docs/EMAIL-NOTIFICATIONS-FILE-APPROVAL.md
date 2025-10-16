# Email Notifications - File Approval System

## Overview

The file approval system sends automated email notifications to customers and admins at key stages of the proof approval workflow. All emails are sent via Resend using React Email templates.

---

## Email Templates

All templates extend `EmailLayout` for consistent branding and include:
- GangRun Printing header with logo
- Clear call-to-action buttons
- Order number and context
- Footer with contact information

### 1. Proof Ready for Review (`proof-ready.tsx`)

**Recipient:** Customer
**Trigger:** Admin uploads a proof file with status "WAITING"
**Purpose:** Notify customer that their proof is ready for approval

**Content:**
- Hero banner: "Your Proof is Ready!"
- Order number
- Proof file name/label
- Optional message from admin
- Important checklist (spelling, colors, layout, contact info)
- Primary CTA: "Review & Approve Proof" → Order tracking page
- Warning about responsibility for approved errors

**Email Subject:** `Your Proof is Ready for Review - Order {orderNumber} 📄`

**Example:**
```
📄 Your Proof is Ready!
Order #GRP-12345

Hi John,

Great news! Your proof is ready for review. Please take a moment to check it
carefully before we proceed with production.

Proof File: Business Card Proof V1
Message from our team: "We adjusted the logo size as requested."

⚠️ Important
Please review your proof carefully and check for:
- Spelling and grammar
- Colors and image quality
- Layout and alignment
- Contact information accuracy

[Review & Approve Proof]
```

---

### 2. Proof Approved (`proof-approved.tsx`)

**Recipient:** Admin
**Trigger:** Customer approves a proof
**Purpose:** Notify production team to proceed or wait for remaining approvals

**Content:**
- Hero banner: "✓ Proof Approved" or "✅ All Proofs Approved!" (if all approved)
- Order number and customer details
- Proof file name/label
- Optional message from customer
- Success box if all proofs approved → "Ready for Production"
- Primary CTA: "View Order in Admin"
- Next steps checklist

**Email Subject:**
- Single proof: `Proof Approved - Order {orderNumber} ✓`
- All approved: `🎉 All Proofs Approved - Ready for Production - {orderNumber}`

**Example (All Approved):**
```
✅ All Proofs Approved!
Order #GRP-12345

Production Team,

John Doe has approved the following proof:

Proof File: Business Card Proof V1
Customer: John Doe (john@example.com)
Customer message: "Looks perfect, please proceed!"

🎉 Ready for Production
All proofs for this order have been approved. The order is now ready to begin production.

[View Order in Admin]

Next Steps:
- Assign vendor for production
- Update order status to "IN_PRODUCTION"
- Notify customer when printing begins
```

---

### 3. Proof Rejected (`proof-rejected.tsx`)

**Recipient:** Admin
**Trigger:** Customer rejects a proof and requests changes
**Purpose:** Notify design team to make revisions

**Content:**
- Hero banner: "🔄 Changes Requested"
- Order number and customer details
- Proof file name/label
- Customer's requested changes (highlighted)
- Primary CTA: "View Order & Create Revised Proof"
- Next steps for creating revision
- Tip: Clearly mention what was changed in revision

**Email Subject:** `Changes Requested - Order {orderNumber} 🔄`

**Example:**
```
🔄 Changes Requested
Order #GRP-12345

Design Team,

John Doe has reviewed the proof and requested changes:

Proof File: Business Card Proof V1
Customer: John Doe (john@example.com)

📝 Requested Changes:
"Please make the logo 20% larger and change the phone number to 555-1234.
Also, can you adjust the spacing between the name and title?"

[View Order & Create Revised Proof]

Next Steps:
- Review the customer's change requests carefully
- Make the necessary design revisions
- Upload a new proof file for customer approval
- Add a message explaining what was changed

💡 Tip
When uploading the revised proof, clearly mention what changes were made so
the customer can easily verify their requests were addressed.
```

---

### 4. Customer Artwork Uploaded (`artwork-uploaded.tsx`)

**Recipient:** Admin
**Trigger:** Customer uploads design files (or files associated with order after checkout)
**Purpose:** Notify production team to review files and create proof

**Content:**
- Hero banner: "🎨 New Artwork Uploaded"
- Order number and customer details
- Count of files uploaded
- List of file names
- Primary CTA: "Review Files & Create Proof"
- Next steps for proof creation
- Important reminder about prompt review

**Email Subject:** `New Artwork Uploaded - Order {orderNumber} 🎨`

**Example:**
```
🎨 New Artwork Uploaded
Order #GRP-12345

Production Team,

John Doe has uploaded 3 design files for their order:

Customer: John Doe (john@example.com)
Order: #GRP-12345

📁 Uploaded Files:
- BusinessCard_Front.pdf
- BusinessCard_Back.pdf
- Logo.ai

[Review Files & Create Proof]

Next Steps:
- Download and review all customer artwork files
- Check file quality, resolution, and design elements
- Create a proof for customer approval
- Upload the proof and notify the customer

⚠️ Important
Please review the files promptly so we can get the proof to the customer for
approval. Fast turnaround time keeps customers happy!
```

---

## Email Service API

**Location:** `/src/lib/email/file-approval-email-service.ts`

### Class: `FileApprovalEmailService`

Static methods for sending file approval emails via Resend.

#### `sendProofReadyNotification()`

Send proof ready email to customer.

```typescript
await FileApprovalEmailService.sendProofReadyNotification(
  {
    id: order.id,
    orderNumber: order.orderNumber,
    email: order.email,
    User: { name: 'John Doe' },
  },
  {
    id: file.id,
    label: 'Business Card Proof V1',
    filename: 'proof-v1.pdf',
  },
  'We adjusted the logo size as requested.' // Optional admin message
);
```

#### `sendProofApprovedNotification()`

Send proof approved email to admin.

```typescript
await FileApprovalEmailService.sendProofApprovedNotification(
  {
    id: order.id,
    orderNumber: order.orderNumber,
    email: order.email,
    User: { name: 'John Doe' },
  },
  {
    id: file.id,
    label: 'Business Card Proof V1',
    filename: 'proof-v1.pdf',
  },
  'Looks perfect, please proceed!', // Optional customer message
  true // allProofsApproved flag
);
```

#### `sendProofRejectedNotification()`

Send proof rejected email to admin.

```typescript
await FileApprovalEmailService.sendProofRejectedNotification(
  {
    id: order.id,
    orderNumber: order.orderNumber,
    email: order.email,
    User: { name: 'John Doe' },
  },
  {
    id: file.id,
    label: 'Business Card Proof V1',
    filename: 'proof-v1.pdf',
  },
  'Please make the logo 20% larger...' // Required: customer's change request
);
```

#### `sendArtworkUploadedNotification()`

Send artwork uploaded email to admin.

```typescript
await FileApprovalEmailService.sendArtworkUploadedNotification(
  {
    id: order.id,
    orderNumber: order.orderNumber,
    email: order.email,
    User: { name: 'John Doe' },
  },
  [
    { filename: 'BusinessCard_Front.pdf', label: 'Front Design' },
    { filename: 'BusinessCard_Back.pdf', label: 'Back Design' },
  ]
);
```

---

## API Integration Points

### 1. File Association Route

**File:** `/src/app/api/orders/[id]/files/associate-temp/route.ts`
**Method:** POST
**Trigger:** Customer artwork files associated with order after checkout

```typescript
// After creating OrderFile records
try {
  const { FileApprovalEmailService } = await import('@/lib/email/file-approval-email-service');
  await FileApprovalEmailService.sendArtworkUploadedNotification(
    orderData,
    files.map(f => ({ filename: f.filename, label: f.label }))
  );
} catch (emailError) {
  console.error('Failed to send artwork uploaded email:', emailError);
  // Don't fail the request if email fails
}
```

### 2. File Upload Route

**File:** `/src/app/api/orders/[id]/files/route.ts`
**Method:** POST
**Trigger:** Admin uploads a proof file with "WAITING" approval status

```typescript
// After creating OrderFile record
if (uploadedByRole === 'ADMIN' && fileType === 'ADMIN_PROOF' && approvalStatus === 'WAITING') {
  try {
    const { FileApprovalEmailService } = await import('@/lib/email/file-approval-email-service');
    await FileApprovalEmailService.sendProofReadyNotification(
      orderData,
      fileInfo,
      message // Optional admin message
    );
  } catch (emailError) {
    console.error('Failed to send proof ready email:', emailError);
  }
}
```

### 3. File Approval Route

**File:** `/src/app/api/orders/[id]/files/[fileId]/approve/route.ts`
**Method:** POST
**Trigger:** Customer approves or rejects a proof

```typescript
// After updating file approval status
try {
  const { FileApprovalEmailService } = await import('@/lib/email/file-approval-email-service');

  if (status === 'APPROVED') {
    await FileApprovalEmailService.sendProofApprovedNotification(
      orderData,
      fileInfo,
      customerMessage,
      allProofsApproved // Boolean flag
    );
  } else {
    await FileApprovalEmailService.sendProofRejectedNotification(
      orderData,
      fileInfo,
      customerMessage // Required for rejection
    );
  }
} catch (emailError) {
  console.error('Failed to send approval email:', emailError);
}
```

---

## Configuration

### Environment Variables

Required for email sending:

```env
# Resend API Key
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# From Email Configuration
RESEND_FROM_EMAIL=orders@gangrunprinting.com
RESEND_FROM_NAME=GangRun Printing

# Admin Email (receives notifications)
ADMIN_EMAIL=iradwatkins@gmail.com

# Application URL (for email links)
NEXT_PUBLIC_APP_URL=https://gangrunprinting.com
```

### Default Settings

```typescript
class FileApprovalEmailService {
  private static readonly FROM_EMAIL = 'orders@gangrunprinting.com';
  private static readonly FROM_NAME = 'GangRun Printing';
  private static readonly ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'iradwatkins@gmail.com';
}
```

---

## Error Handling

All email sending is wrapped in try-catch blocks and **does not fail the main request** if email sending fails.

```typescript
try {
  await FileApprovalEmailService.sendProofReadyNotification(...);
} catch (emailError) {
  console.error('Failed to send proof ready email:', emailError);
  // Request continues successfully
}
```

**Rationale:**
- Order operations should not fail due to email delivery issues
- Failed emails are logged for monitoring
- Core functionality (file upload, approval) remains reliable

**Monitoring:**
- Check server logs for email errors
- Use Resend dashboard to monitor delivery rates
- Set up alerts for high failure rates

---

## Testing Email Templates

### Development Mode

Test emails using React Email preview server:

```bash
cd src/lib/email/templates
npm run email:dev
```

Visit `http://localhost:3001` to preview all templates.

### Manual Testing

Send test emails from API routes:

```typescript
// Test proof ready email
const { FileApprovalEmailService } = await import('@/lib/email/file-approval-email-service');

await FileApprovalEmailService.sendProofReadyNotification(
  {
    id: 'test-order-id',
    orderNumber: 'TEST-001',
    email: 'test@example.com',
    User: { name: 'Test Customer' },
  },
  {
    id: 'test-file-id',
    label: 'Test Proof',
    filename: 'test.pdf',
  },
  'This is a test proof.'
);
```

### Production Testing Checklist

- [ ] Send proof ready email to real customer email
- [ ] Verify all links work (tracking page, download links)
- [ ] Check email renders correctly in Gmail, Outlook, Apple Mail
- [ ] Verify mobile responsive design
- [ ] Test with/without customer messages
- [ ] Test "all proofs approved" variant
- [ ] Verify admin emails arrive promptly
- [ ] Check spam folder if emails missing
- [ ] Verify customer can reply to emails

---

## Troubleshooting

### Emails Not Sending

1. **Check Resend API Key**
   ```bash
   echo $RESEND_API_KEY
   ```
   Verify key is set and valid in `.env` file

2. **Check Server Logs**
   ```bash
   pm2 logs gangrunprinting | grep "Email"
   ```
   Look for error messages

3. **Test Resend Connection**
   ```typescript
   const { sendEmail } = await import('@/lib/resend');
   await sendEmail({
     to: 'test@example.com',
     subject: 'Test',
     html: '<p>Test email</p>',
   });
   ```

### Emails in Spam Folder

1. **Verify SPF/DKIM records** for `gangrunprinting.com`
2. **Check sender reputation** in Resend dashboard
3. **Avoid spam trigger words** in subject lines
4. **Include unsubscribe link** (already in EmailLayout footer)

### Template Rendering Issues

1. **Check React Email version** compatibility
2. **Verify all imports** in template files
3. **Test with `render()` function** directly
4. **Check for TypeScript errors** in template files

---

## Future Enhancements

### Planned Features

1. **Email Preferences** - Allow customers to opt-in/out of notifications
2. **Batch Notifications** - Daily digest for admins with pending proofs
3. **SMS Notifications** - Critical alerts via Twilio
4. **In-App Notifications** - Bell icon notifications in dashboard
5. **Email Templates Editor** - Admin interface to customize email copy
6. **A/B Testing** - Test different subject lines and CTAs
7. **Email Analytics** - Track open rates, click rates, conversion

### Localization

Support for multiple languages:
- Detect user language preference
- Load appropriate template strings
- Support RTL languages

### Advanced Features

- **Proof annotations** - Email includes visual markup from customer
- **Video proofs** - Embed video preview in email
- **Live chat link** - Direct support link in emails
- **Calendar integration** - Add production timeline to calendar

---

**Last Updated:** October 15, 2025
**Status:** Production Ready ✅
**Email Service:** Resend
**Templates:** React Email 2.0+
