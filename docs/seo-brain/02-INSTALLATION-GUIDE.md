# SEO Brain Installation Guide

**Estimated Time:** 30-45 minutes
**Difficulty:** Intermediate
**Prerequisites:** Basic command line knowledge

---

## Prerequisites

### Required Software

- ✅ Node.js 18+ (already installed)
- ✅ PostgreSQL (Docker container on port 5435)
- ✅ n8n (running on port 5678)
- ✅ Ollama (running on port 11434 with deepseek-r1:32b model)
- ✅ Google Cloud account (for Imagen 4 API)
- ✅ Telegram Bot Token

---

## Step 1: Database Migration

The database schema was created automatically. Verify it exists:

```bash
psql $DATABASE_URL -c "SELECT COUNT(*) FROM \"ProductCampaignQueue\""
```

Expected output: `0` (table exists but empty)

If error occurs, run the migration:

```bash
npx prisma migrate deploy
```

---

## Step 2: Environment Variables

Add to `/root/websites/gangrunprinting/.env`:

```bash
# ========================================
# SEO BRAIN CONFIGURATION
# ========================================

# Telegram Bot
SEO_BRAIN_TELEGRAM_BOT_TOKEN=7510262123:AAFiInboeGKrhovu8hcmDvZsDgEpS3W1yWs
TELEGRAM_ADMIN_CHAT_ID=YOUR_CHAT_ID_HERE

# SEO Brain Mode
SEO_BRAIN_MODE=CONSERVATIVE

# Ollama (Local AI)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=deepseek-r1:32b

# Google AI (Image Generation)
GOOGLE_AI_PROJECT_ID=your-project-id
GOOGLE_AI_LOCATION=us-central1
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json

# Optional: Performance Tuning
SEO_BRAIN_BATCH_SIZE=10
SEO_BRAIN_BATCH_DELAY_MS=2000
```

---

## Step 3: Get Your Telegram Chat ID

### Method 1: Using the Setup Script

```bash
npx tsx src/scripts/seo-brain/setup-telegram.ts
```

This script will:

1. Test the bot token
2. Ask you to message the bot
3. Display your Chat ID
4. Save it to `.env`

### Method 2: Manual

1. Message your bot on Telegram: `@YourBotName`
2. Send any message (e.g., "Hello")
3. Visit: `https://api.telegram.org/bot7510262123:AAFiInboeGKrhovu8hcmDvZsDgEpS3W1yWs/getUpdates`
4. Find your Chat ID in the JSON response
5. Add to `.env`: `TELEGRAM_ADMIN_CHAT_ID=123456789`

---

## Step 4: Verify Ollama

Check Ollama is running and has the correct model:

```bash
curl http://localhost:11434/api/tags
```

Expected output should include `deepseek-r1:32b`.

If not installed:

```bash
ollama pull deepseek-r1:32b
```

---

## Step 5: Google AI Setup (Image Generation)

### 5.1 Enable Vertex AI API

1. Go to: https://console.cloud.google.com/apis/library/aiplatform.googleapis.com
2. Enable the API
3. Wait 2-3 minutes for propagation

### 5.2 Create Service Account

```bash
gcloud iam service-accounts create seo-brain-images \
    --display-name="SEO Brain Image Generator"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
    --member="serviceAccount:seo-brain-images@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/aiplatform.user"

gcloud iam service-accounts keys create ~/seo-brain-sa.json \
    --iam-account=seo-brain-images@YOUR_PROJECT_ID.iam.gserviceaccount.com
```

### 5.3 Update .env

```bash
GOOGLE_AI_PROJECT_ID=your-actual-project-id
GOOGLE_APPLICATION_CREDENTIALS=/root/seo-brain-sa.json
```

---

## Step 6: Import n8n Workflows

### 6.1 Access n8n

```bash
# n8n should already be running
# Visit: http://72.60.28.175:5678
```

### 6.2 Import Workflows

For each workflow file in `/root/websites/gangrunprinting/src/n8n-workflows/`:

1. Click **+ Add workflow**
2. Click **⋮** (three dots) → **Import from File**
3. Select workflow JSON file
4. Click **Save**

**Import Order:**

1. `01-product-to-200-cities-orchestrator.json`
2. `02-city-page-generator.json`
3. `03-performance-monitor-daily.json`
4. `04-winner-detector.json`
5. `05-loser-improver.json`
6. `06-decision-handler.json`
7. `07-telegram-response-handler.json`
8. `08-sitemap-submitter.json`
9. `09-daily-optimizer.json`

### 6.3 Configure Credentials

Each workflow needs these credentials:

**PostgreSQL:**

- Host: `gangrunprinting-postgres`
- Port: `5432`
- Database: `gangrun_db`
- User: `gangrun_user`
- Password: (from DATABASE_URL)

**Telegram API:**

- Bot Token: `7510262123:AAFiInboeGKrhovu8hcmDvZsDgEpS3W1yWs`

### 6.4 Activate Workflows

For each workflow:

1. Click the workflow name
2. Toggle **Inactive** → **Active** (top right)

---

## Step 7: Verify Installation

### 7.1 Test Ollama Connection

```bash
npx tsx -e "
import { ollamaClient } from './src/lib/seo-brain/ollama-client.js'
const result = await ollamaClient.testConnection()
console.log(result)
"
```

Expected: `{ success: true, model: 'deepseek-r1:32b' }`

### 7.2 Test Telegram

```bash
npx tsx src/scripts/seo-brain/setup-telegram.ts
```

You should receive a test message in Telegram.

### 7.3 Test n8n Webhook

```bash
curl -X POST http://localhost:5678/webhook-test/seo-brain-start \
  -H "Content-Type: application/json" \
  -d '{
    "productName": "Test Product",
    "quantity": 5000,
    "size": "4x6",
    "material": "9pt Cardstock",
    "turnaround": "3-4 days",
    "price": 179
  }'
```

Expected: `{ "success": true, "campaignId": "campaign-..." }`

---

## Step 8: Build & Deploy

### 8.1 Install Dependencies

```bash
cd /root/websites/gangrunprinting
npm install
```

### 8.2 Build Application

```bash
npm run build
```

### 8.3 Restart Docker Containers

```bash
docker-compose restart app
```

### 8.4 Verify Application

```bash
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://localhost:3020
```

Expected: `HTTP Status: 200`

---

## Step 9: Run First Campaign (Test)

### 9.1 Interactive Script

```bash
npx tsx src/scripts/seo-brain/start-product-campaign.ts
```

Follow the prompts:

- Product Name: `Test Flyers`
- Quantity: `5000`
- Size: `4x6`
- Material: `9pt Cardstock`
- Turnaround: `3-4 days`
- Price: `179`
- Keywords: `flyer printing, club flyers`

### 9.2 Monitor Progress

```bash
# Check campaign status
npx tsx -e "
import { prisma } from './src/lib/prisma.js'
const campaigns = await prisma.productCampaignQueue.findMany({
  orderBy: { createdAt: 'desc' },
  take: 1
})
console.log(campaigns[0])
"
```

### 9.3 Check Telegram

You should receive:

- "🚀 Campaign Started" (immediate)
- "🎉 Campaign Complete" (after 6-7 hours)

---

## Troubleshooting

### Ollama Not Responding

```bash
# Check if running
curl http://localhost:11434/api/tags

# Restart if needed
systemctl restart ollama
```

### Telegram Not Sending

```bash
# Test bot token
curl https://api.telegram.org/bot7510262123:AAFiInboeGKrhovu8hcmDvZsDgEpS3W1yWs/getMe

# Verify Chat ID
echo $TELEGRAM_ADMIN_CHAT_ID
```

### Database Connection Failed

```bash
# Check PostgreSQL container
docker ps | grep gangrun

# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

### n8n Workflows Not Triggering

1. Check workflow is **Active** (not Inactive)
2. Verify credentials are saved
3. Check webhook URL matches API route
4. View execution logs in n8n UI

---

## Next Steps

1. ✅ Installation Complete!
2. Read [03-USAGE-GUIDE.md](./03-USAGE-GUIDE.md) to start using SEO Brain
3. Review [04-API-REFERENCE.md](./04-API-REFERENCE.md) for API details
4. Check [06-TROUBLESHOOTING.md](./06-TROUBLESHOOTING.md) if issues arise

---

## Support

- **Documentation:** `/docs/seo-brain/`
- **Telegram Bot:** Micheal (SEO LLM Landing Page Master)
- **Logs:** `docker logs --tail=100 gangrunprinting_app`
