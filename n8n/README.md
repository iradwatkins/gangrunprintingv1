# N8N Integration Guide for GangRun Printing

## 📋 Overview

This directory contains N8N workflow configurations for automating GangRun Printing's order processing, vendor management, and Telegram notifications.

## 📱 Telegram Integration

Your Telegram bot is configured and ready:

- **Bot Name**: Halle (Personal Assistant AI)
- **Bot Username**: @irapa_bot
- **Your Chat ID**: 7154912264
- **Bot Token**: 7241850736:AAHqJYoWRzJdtFUclpdmosvVZN5C6DDbKL4

Notifications will be sent directly to your Telegram for:

- New orders
- Payment confirmations
- Order issues
- Daily reports
- Low stock alerts

## 🚀 Quick Setup

### 1. Access N8N Dashboard

- URL: https://n8n.agistaffers.com
- Login with your credentials

### 2. Import the Workflow

1. In N8N, click "Workflows" → "Import from File"
2. Upload `workflows/gangrun-order-processing.json`
3. Review the workflow nodes

### 3. Configure Webhook

1. Open the imported workflow
2. Click on the "Webhook Receiver" node
3. Copy the webhook URL (it will be something like: `https://n8n.agistaffers.com/webhook/gangrun`)
4. Update your `.env` file:
   ```
   N8N_WEBHOOK_URL=https://n8n.agistaffers.com/webhook/gangrun
   ```

### 4. Configure Credentials (if needed)

- **PostgreSQL**: For logging events
- **HTTP Request**: For vendor APIs
- **SMTP**: For email notifications

### 5. Activate the Workflow

1. Toggle the workflow to "Active"
2. Test with the test script: `npm run test:n8n`

## 📡 Webhook Events

The application sends the following events to N8N:

### Order Events

| Event                  | Description          | Payload                             |
| ---------------------- | -------------------- | ----------------------------------- |
| `order.created`        | New order placed     | Order details, items, customer info |
| `order.status_changed` | Order status updated | Order ID, old status, new status    |
| `order.shipped`        | Order shipped        | Tracking info, carrier details      |
| `order.issue_detected` | Problem with order   | Issue type, severity, description   |

### Payment Events

| Event              | Description       | Payload                        |
| ------------------ | ----------------- | ------------------------------ |
| `payment.received` | Payment confirmed | Amount, transaction ID, method |
| `payment.refunded` | Refund processed  | Amount, reason, refund ID      |

### File Events

| Event           | Description      | Payload                         |
| --------------- | ---------------- | ------------------------------- |
| `file.uploaded` | Artwork uploaded | File name, size, type, order ID |

### Vendor Events

| Event             | Description              | Payload                    |
| ----------------- | ------------------------ | -------------------------- |
| `vendor.assigned` | Order assigned to vendor | Vendor info, order details |

### Notification Events

| Event               | Description           | Payload                  |
| ------------------- | --------------------- | ------------------------ |
| `notification.send` | Customer notification | Type, recipient, subject |

### Report Events

| Event                 | Description   | Payload                         |
| --------------------- | ------------- | ------------------------------- |
| `report.daily`        | Daily summary | Orders, revenue, pending items  |
| `inventory.low_stock` | Stock alert   | Product, current stock, minimum |

## 🧪 Testing

### Test Individual Events

```bash
# Test order created event
curl -X POST https://n8n.agistaffers.com/webhook/gangrun \
  -H "Content-Type: application/json" \
  -d '{
    "event": "order.created",
    "data": {
      "orderNumber": "TEST-001",
      "customerEmail": "test@example.com",
      "total": 99.99,
      "items": [
        {
          "productName": "Business Cards",
          "quantity": 500,
          "price": 49.99
        }
      ]
    },
    "timestamp": "2024-01-01T12:00:00Z",
    "source": "gangrunprinting"
  }'
```

### Test Script

```bash
# Run the N8N test script
npx tsx scripts/test-n8n-webhook.ts
```

## 🔄 Workflow Logic

### Order Processing Flow

1. **Order Created** →
   - Log to database
   - Send confirmation email
   - Create production ticket

2. **Payment Received** →
   - Update order status
   - Send to print queue
   - Notify production team

3. **Status Changed** →
   - If "PRINTING" → Send to vendor
   - If "SHIPPED" → Send tracking email
   - If "DELIVERED" → Request review

## 🔧 Advanced Configuration

### Environment Variables

Add these to N8N's environment:

```env
# Vendor APIs
VENDOR_API_KEY=your_vendor_key
VENDOR_API_URL=https://api.printvendor.com

# Notifications
SLACK_WEBHOOK_URL=your_slack_webhook
ADMIN_EMAIL=admin@gangrunprinting.com

# Database (for logging)
POSTGRES_HOST=gangrunprinting-postgres
POSTGRES_DB=gangrun_db
POSTGRES_USER=gangrun_user
POSTGRES_PASSWORD=your_password
```

### Custom Vendor Integration

To add a new print vendor:

1. Duplicate the "Send to Print Vendor" node
2. Update the API endpoint and credentials
3. Map the order data to vendor's format
4. Add error handling

### Email Templates

Configure email nodes with these templates:

- Order confirmation
- Payment received
- Order shipped
- Delivery confirmation
- Review request

## 📊 Monitoring

### View Webhook Logs

1. In N8N, go to "Executions"
2. Filter by workflow name
3. View successful and failed executions

### Debug Failed Webhooks

1. Click on failed execution
2. View error details
3. Check node outputs
4. Retry if needed

## 🚨 Troubleshooting

### Webhook Not Receiving Data

1. Check webhook URL in `.env`
2. Verify workflow is active
3. Check N8N logs for errors
4. Test with curl command

### Vendor API Failures

1. Verify API credentials
2. Check vendor API status
3. Review error logs
4. Enable retry mechanism

### Database Connection Issues

1. Check PostgreSQL credentials
2. Verify network connectivity
3. Check database permissions
4. Review connection string

## 📈 Production Best Practices

1. **Error Handling**: Add error nodes for each critical path
2. **Retries**: Configure automatic retries for vendor APIs
3. **Logging**: Log all events to database for audit trail
4. **Notifications**: Alert admins on critical failures
5. **Backups**: Export workflows regularly
6. **Testing**: Test all paths before activating
7. **Monitoring**: Set up alerts for webhook failures

## 🔗 Useful Links

- [N8N Documentation](https://docs.n8n.io)
- [Webhook Node Docs](https://docs.n8n.io/nodes/n8n-nodes-base.webhook/)
- [PostgreSQL Node Docs](https://docs.n8n.io/nodes/n8n-nodes-base.postgres/)
- [HTTP Request Node Docs](https://docs.n8n.io/nodes/n8n-nodes-base.httpRequest/)

## 💡 Tips

- Use "Sticky Notes" in N8N to document complex logic
- Test with small data sets first
- Use "Function" nodes for complex transformations
- Enable "Save Execution Progress" for debugging
- Use environment variables for sensitive data
