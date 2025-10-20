# N8N Workflow Import Instructions

**Complete guide to importing marketing automation workflows into N8N**

---

## Overview

8 workflow JSON files have been created in `/n8n-workflows/` directory:

1. `1-abandoned-cart-3hr.json` - Abandoned Cart (3 hour)
2. `2-abandoned-cart-24hr.json` - Abandoned Cart (24 hour)
3. `3-abandoned-cart-72hr.json` - Abandoned Cart (72 hour - Final)
4. `4-winback-campaign.json` - Customer Win-back
5. `5-order-anniversaries.json` - Order Anniversaries
6. `6-review-collection.json` - Review Collection (3 days after delivery)
7. `7-post-purchase-webhook.json` - Post-Purchase Thank You (webhook)
8. `8-order-delivered-webhook.json` - Order Delivered Review Request (webhook)

---

## Method 1: Import via N8N Web UI (Recommended)

### Step 1: Access N8N

1. Go to **https://n8n.agistaffers.com**
2. Log in with your credentials

### Step 2: Import Each Workflow

For each of the 8 JSON files:

1. Click **"+ New workflow"** (top right)
2. Click the **3-dot menu** (⋮) in the top right
3. Select **"Import from File"**
4. Choose the JSON file from `/root/websites/gangrunprinting/n8n-workflows/`
5. Click **"Open"**
6. The workflow will load with all nodes configured
7. Click **"Save"** (top right)
8. Give it the name from the JSON (e.g., "GangRun - Abandoned Cart (3hr)")

### Step 3: Activate Workflows

After importing all 8 workflows:

1. Go to **"Workflows"** page (sidebar)
2. For each workflow, click the **toggle switch** to activate it
3. Verify the toggle shows **"Active"** (green)

---

## Method 2: Import via CLI (Faster for Multiple Workflows)

If you have SSH access to the N8N server:

```bash
# Navigate to workflow directory
cd /root/websites/gangrunprinting/n8n-workflows

# Import all workflows at once (if N8N CLI is configured)
for file in *.json; do
  n8n import:workflow --input="$file"
done
```

**Note:** This requires N8N CLI to be properly configured with database access.

---

## Method 3: Manual Copy-Paste

If file upload doesn't work:

1. Open the JSON file in a text editor
2. Copy the entire contents
3. In N8N, click **"+ New workflow"**
4. Click the **3-dot menu** → **"Import from URL or Text"**
5. Paste the JSON content
6. Click **"Import"**
7. Save the workflow

---

## Post-Import Configuration

### 1. Update Webhook URLs (if needed)

The webhook workflows (#7 and #8) use these paths:
- Post-Purchase: `/webhook/gangrun-order-created`
- Order Delivered: `/webhook/gangrun-order-delivered`

**Verify webhook URLs:**
1. Open each webhook workflow
2. Click the **"Webhook"** node
3. Verify the webhook path matches database records:
   ```sql
   SELECT name, url, trigger FROM "N8NWebhook";
   ```

**Expected webhook URLs:**
- `http://localhost:5678/webhook/gangrun-order-created`
- `http://localhost:5678/webhook/gangrun-order-delivered`

### 2. Set Cron Schedules

Verify each cron workflow has the correct schedule:

| Workflow | Schedule | Cron Expression |
|----------|----------|----------------|
| Abandoned Cart (3hr) | Every hour | `0 * * * *` |
| Abandoned Cart (24hr) | Every hour | `0 * * * *` |
| Abandoned Cart (72hr) | Every hour | `0 * * * *` |
| Win-back Campaign | Daily at 10 AM | `0 10 * * *` |
| Order Anniversaries | Daily at 9 AM | `0 9 * * *` |
| Review Collection | Daily at 2 PM | `0 14 * * *` |

### 3. Test Each Workflow

**Manual Testing:**

1. Open workflow in N8N
2. Click **"Execute Workflow"** button (top right)
3. Check execution logs for errors
4. Verify API calls succeed
5. Check email delivery in Resend dashboard

**Test Sequence:**

```bash
# 1. Test abandoned cart API
curl "https://gangrunprinting.com/api/marketing/carts/abandoned?minHours=3&maxHours=4"

# 2. Test coupon generation API
curl -X POST "https://gangrunprinting.com/api/marketing/coupons/generate" \
  -H "Content-Type: application/json" \
  -d '{"type":"PERCENTAGE","value":10,"campaign":"test"}'

# 3. Test email rendering API
curl -X POST "https://gangrunprinting.com/api/marketing/emails/render" \
  -H "Content-Type: application/json" \
  -d '{
    "template":"abandoned_cart",
    "to":"test@example.com",
    "subject":"Test Email",
    "data":{"customerName":"Test User","items":[],"total":5000}
  }'
```

---

## Troubleshooting

### Issue: Import fails with "Invalid JSON"

**Solution:**
- Verify JSON file is not corrupted
- Check for syntax errors in JSON
- Try Method 3 (copy-paste) instead

### Issue: Workflow nodes show errors after import

**Solution:**
- Check API endpoint URLs are correct (`https://gangrunprinting.com/api/...`)
- Verify all required parameters are set
- Test API endpoints manually with curl

### Issue: Cron schedules not triggering

**Solution:**
- Verify workflow is **Active** (green toggle)
- Check timezone is set to `America/Chicago`
- Check N8N execution logs for errors

### Issue: Webhooks not receiving events

**Solution:**
1. Verify webhook URLs in database match N8N:
   ```sql
   SELECT * FROM "N8NWebhook" WHERE "isActive" = true;
   ```
2. Check webhook service is being called:
   ```bash
   # Check application logs
   docker logs gangrunprinting_app --tail=100 | grep -i webhook
   ```
3. Test webhook manually:
   ```bash
   curl -X POST http://localhost:5678/webhook/gangrun-order-created \
     -H "Content-Type: application/json" \
     -d '{"event":"order.created","data":{"id":"test"}}'
   ```

---

## Verification Checklist

After importing all workflows:

- [ ] **All 8 workflows imported successfully**
- [ ] **All workflows are Active** (green toggle)
- [ ] **Cron schedules verified** (check Schedule Trigger nodes)
- [ ] **Webhook paths correct** (check database vs N8N)
- [ ] **Timezone set to America/Chicago**
- [ ] **Test execution successful** (no errors in logs)
- [ ] **API endpoints responding** (test with curl)
- [ ] **Email delivery working** (check Resend dashboard)

---

## Monitoring Workflows

### N8N Dashboard

**View Executions:**
1. Go to **"Executions"** tab (sidebar)
2. Filter by workflow name
3. Check success/failure status
4. View execution details and logs

**Monitor Active Workflows:**
1. Go to **"Workflows"** page
2. Check "Last Execution" column
3. Verify recent executions are successful

### Database Monitoring

**Check webhook trigger counts:**
```sql
SELECT
  name,
  "triggerCount",
  "lastTriggered",
  "isActive"
FROM "N8NWebhook"
ORDER BY "lastTriggered" DESC;
```

**Check webhook logs for errors:**
```sql
SELECT
  w.name,
  l.status,
  l."executedAt",
  l.response
FROM "N8NWebhookLog" l
JOIN "N8NWebhook" w ON l."webhookId" = w.id
WHERE l.status != 200
ORDER BY l."executedAt" DESC
LIMIT 20;
```

---

## Next Steps

After successful import and testing:

1. **Monitor executions for 48 hours** - Check for any errors
2. **Verify email delivery** - Check Resend dashboard
3. **Test real customer flow** - Create test order and verify emails sent
4. **Adjust timing if needed** - Modify cron schedules based on performance
5. **Monitor abandoned cart recovery rate** - Track in database

---

## Support

**Documentation:**
- Main Guide: `/docs/N8N-MARKETING-AUTOMATION-SETUP.md`
- Location Guide: `/docs/WHERE-IS-MARKETING-AUTOMATION.md`
- Implementation Details: `/docs/MARKETING-AUTOMATION-COMPLETE.md`

**Key Resources:**
- N8N: https://n8n.agistaffers.com
- Resend Dashboard: https://resend.com/emails
- Admin Dashboard: https://gangrunprinting.com/admin/marketing/automation

---

**All workflows are ready to import and activate!**
