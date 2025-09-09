# Production Secrets - KEEP SECURE!

## ⚠️ IMPORTANT: Do not commit this file to Git!
Add to .gitignore immediately after use.

## 1. AUTH_SECRET for Production
Replace the AUTH_SECRET in Dokploy with this secure value:
```
AUTH_SECRET=STbLCBDanDbqeDVMWEhAzfLdTvKlnPWZpD4a5Dwk
```

## 2. Square Webhook Configuration

### Setup Square Webhooks:
1. Go to: https://squareup.com/dashboard/apps
2. Select your application: "GangRun Printing"
3. Navigate to "Webhooks" section
4. Click "Add Endpoint"
5. Configure as follows:

**Webhook URL:**
```
https://gangrunprinting.com/api/webhooks/square
```

**Events to Subscribe:**
- ✅ payment.created
- ✅ payment.updated
- ✅ order.created
- ✅ order.updated
- ✅ order.fulfillment.updated
- ✅ refund.created

**After creating the webhook:**
1. Copy the "Signature Key" from Square
2. Add to Dokploy environment variables:
```
SQUARE_WEBHOOK_SIGNATURE_KEY=<paste_signature_key_here>
```

## 3. Database Commands

### Run these in Dokploy terminal after deployment:

**Initial Migration:**
```bash
npx prisma migrate deploy
```

**Seed Database (optional - for test data):**
```bash
npx prisma db seed
```

**Reset Database (if needed - CAUTION!):**
```bash
npx prisma migrate reset --force
```

## 4. N8N Webhook Setup

### Create N8N Workflow:
1. Access N8N: https://n8n.agistaffers.com
2. Create new workflow: "GangRun Order Processing"
3. Add Webhook node with path: `/webhook/gangrunprinting`
4. Copy the production webhook URL
5. Update in Dokploy:
```
N8N_WEBHOOK_URL=<paste_n8n_webhook_url>
N8N_API_KEY=<generate_in_n8n>
```

## 5. MinIO Bucket Setup

### Initialize MinIO:
1. Access MinIO console: http://72.60.28.175:9003
2. Login: gangrun_admin / GangRunMinio2024!
3. Create bucket: `gangrun-files`
4. Set bucket policy:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": ["s3:GetObject"],
      "Resource": ["arn:aws:s3:::gangrun-files/public/*"]
    }
  ]
}
```

## 6. Test Credentials

### Test Customer Account:
- Email: test@gangrunprinting.com
- Password: TestCustomer2024!

### Test Admin Account:
- Email: admin@gangrunprinting.com
- Password: AdminGangRun2024!

## 7. Monitoring URLs

- Main Site: https://gangrunprinting.com
- Health Check: https://gangrunprinting.com/api/health
- Admin Panel: https://gangrunprinting.com/admin
- Dokploy: https://72.60.28.175:3000
- MinIO Console: http://72.60.28.175:9003
- N8N: https://n8n.agistaffers.com

## 8. Emergency Contacts

- Dokploy Issues: Check logs at /var/log/dokploy
- Square API: 1-855-700-6000
- SendGrid Support: https://support.sendgrid.com
- Domain/DNS: Your registrar support

---
**Generated:** ${new Date().toISOString()}
**Remember:** Delete this file after configuring production!