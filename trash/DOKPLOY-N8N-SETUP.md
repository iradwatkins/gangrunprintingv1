# N8n Setup Guide for Dokploy

## Method 1: Using Dokploy Template (Recommended)

### Step 1: Access Dokploy
1. Navigate to: **http://72.60.28.175:3000**
2. Log in with your credentials

### Step 2: Create Project
1. Click **"Projects"** in sidebar
2. Click **"Create Project"**
3. Name: **agistaffers**
4. Description: "Shared services for all websites"

### Step 3: Deploy N8n from Template
1. Inside **agistaffers** project, click **"Deploy"** or **"Add Application"**
2. Select **"Templates"** → **"N8n"**
3. Configure:
   - Application Name: `n8n-central`
   - Port: `5678`

### Step 4: Environment Variables
Add these in the template configuration:
```
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=N8nAdmin2024!
GENERIC_TIMEZONE=America/Chicago
TZ=America/Chicago
N8N_SECURE_COOKIE=true
```

### Step 5: Domain Configuration
1. Domain: `n8n.agistaffers.com`
2. Enable SSL/Let's Encrypt
3. Let Dokploy handle Traefik routing

### Step 6: Deploy
Click **"Deploy"** and wait for completion

---

## Method 2: Using Compose File (If Template Not Available)

### Step 1: Create Project
Same as Method 1

### Step 2: Add Compose Application
1. Inside **agistaffers** project, click **"Deploy"**
2. Select **"Compose"**
3. Name: `n8n-central`

### Step 3: Import Compose File
1. Copy contents of `n8n-dokploy-compose.yml`
2. Paste into Dokploy's compose editor
3. Or upload the file directly

### Step 4: Configure Domain
1. Set domain: `n8n.agistaffers.com`
2. Enable SSL

### Step 5: Deploy
Click **"Deploy"**

---

## Post-Deployment Verification

### Access N8n
1. URL: **https://n8n.agistaffers.com**
2. Username: **admin**
3. Password: **N8nAdmin2024!**

### Initial Setup
1. Complete the setup wizard
2. Create workflow folders:
   - `/GangRunPrinting`
   - `/SteppersLife`
   - `/AgiStaffers`
   - `/[Other Sites]`

### Test Webhook
Create a test webhook:
```
https://n8n.agistaffers.com/webhook/test
```

---

## Troubleshooting

### If N8n doesn't start:
1. Check logs in Dokploy UI
2. Verify PostgreSQL is running
3. Check port 5678 is not in use

### If domain doesn't work:
1. Verify DNS points to: 72.60.28.175
2. Check Traefik configuration in Dokploy
3. Ensure SSL certificate generated

### Database Connection Issues:
1. Verify PostgreSQL container name
2. Check network connectivity
3. Confirm password matches

---

## Integration with Websites

Each website can connect to N8n via:

### Webhooks
```javascript
// Example for GangRun Printing
const n8nWebhook = 'https://n8n.agistaffers.com/webhook/gangrun-order';

fetch(n8nWebhook, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(orderData)
});
```

### API Calls
```javascript
// N8n can call back to your application
// Configure in N8n workflow with HTTP Request node
```

---

## Security Notes

1. Change default passwords after first login
2. Consider IP whitelisting if needed
3. Regular backups through Dokploy
4. Monitor logs for suspicious activity

---

## Shared Service Benefits

- **Single Instance**: One N8n for all 8 websites
- **Centralized Management**: All workflows in one place
- **Resource Efficient**: Shared PostgreSQL and storage
- **Easy Updates**: Update once through Dokploy
- **Automatic Backups**: Via Dokploy's backup system