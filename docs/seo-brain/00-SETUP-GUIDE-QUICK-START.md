# SEO Brain - Quick Start Setup Guide

**Version:** 1.0.0
**Mode:** Conservative (All changes require your approval)
**Status:** Ready to Deploy

---

## 🎯 What You're Building

An autonomous AI system that:
1. Creates 1 master product (e.g., "5000 4x6 Flyers - $179")
2. Generates **200 city landing pages** automatically
3. Each page gets:
   - ✅ Main product image (Google AI)
   - ✅ City hero image (Google AI)
   - ✅ 500-word unique content (Ollama)
   - ✅ 10 city-specific benefits
   - ✅ 15 comprehensive FAQs
   - ✅ Complete schema markup
4. Monitors performance continuously
5. Sends you Telegram alerts with improvement options
6. Waits for your approval before making changes

**Total Generation Time:** 6-7 hours per product
**Cost:** $0 (uses your existing Ollama + Google AI setup)

---

## ⚡ Quick Start (15 Minutes)

### Step 1: Add Environment Variables

Add these to your `.env` file:

```bash
# SEO Brain Telegram Bot
SEO_BRAIN_TELEGRAM_BOT_TOKEN=7510262123:AAFiInboeGKrhovu8hcmDvZsDgEpS3W1yWs
TELEGRAM_ADMIN_CHAT_ID=your_chat_id_here

# SEO Brain Mode
SEO_BRAIN_MODE=CONSERVATIVE

# Ollama (should already be configured)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=deepseek-r1:32b
```

### Step 2: Get Your Telegram Chat ID

```bash
# Run setup script
npx tsx src/scripts/seo-brain/setup-telegram.ts
```

**Follow the instructions to:**
1. Message @userinfobot on Telegram
2. Get your Chat ID
3. Add it to `.env`
4. Test connection

### Step 3: Run Database Migration

```bash
# Apply SEO Brain tables
npx prisma migrate deploy

# Verify tables created
npx prisma studio
# Check for: ProductCampaignQueue, CityPerformanceSnapshot, etc.
```

### Step 4: Start Your First Campaign

```bash
# Launch campaign generator
npx tsx src/scripts/seo-brain/start-product-campaign.ts
```

**You'll be prompted for:**
- Product name: `5000 4x6 Flyers 9pt Cardstock`
- Quantity: `5000`
- Size: `4x6`
- Material: `9pt Cardstock`
- Turnaround: `3-4 days`
- Price: `179`
- Keywords: `flyer printing, club flyers, event flyers`

**Then it will:**
1. Generate main product image (30 seconds)
2. Generate 200 city pages with unique content (6-7 hours)
3. Generate 200 city hero images (parallel processing)
4. Submit sitemap to Google
5. Send you Telegram notification when complete

---

## 📬 What You'll Receive on Telegram

### During Generation:
```
🤖 SEO Brain Started

Product: 5000 4x6 Flyers 9pt Cardstock
Campaign ID: campaign-1729380000000

Generating 200 city pages...
Estimated time: 6-7 hours

You'll be notified when complete.
```

### After Completion:
```
✅ Campaign Complete: 5000 4x6 Flyers

Cities generated: 200/200
Total pages created: 200
Estimated monthly traffic: 10,000 views
Estimated monthly revenue: $400

Top cities: New York, Los Angeles, Chicago

Next: Wait 7-14 days for Google indexing
```

### When Optimization Needed (Conservative Mode):
```
🟡 Decision Needed: Los Angeles, CA

📉 Underperformer Detected
Product: 5000 4x6 Flyers
Current rank: #47 (vs avg #12)
Traffic: 12 views (vs avg 89 views)
Conversions: 0 (vs avg 3)

🤔 Your Options:

Option A: Apply NYC Winner Pattern
✅ Pros: Proven results, quick fix, +200% conversion expected
❌ Cons: Generic approach, may not fit LA culture
🎯 Confidence: 85%

Option B: Generate Custom LA Content
✅ Pros: Perfectly tailored, mentions Venice Beach, Hollywood
❌ Cons: Takes 2 hours, untested
🎯 Confidence: 70%

Option C: Wait 7 More Days
✅ Pros: More data, conservative
❌ Cons: Lost revenue opportunity (~$400)
🎯 Confidence: 40%

Reply with: A, B, or C
```

---

## 🎛️ How to Respond to Decisions

### Via Telegram:
Simply reply to the message with your choice:
- `A` - Apply NYC Winner Pattern
- `B` - Generate Custom LA Content
- `C` - Wait 7 More Days

### Via Admin Dashboard (Coming Soon):
Navigate to `/admin/seo-brain/decisions` to review and approve in bulk

---

## 📊 Monitoring Your Campaigns

### View Active Campaigns:
```bash
# Check campaign status
npx prisma studio

# Navigate to: ProductCampaignQueue
# You'll see:
# - Status (GENERATING, OPTIMIZING, COMPLETED)
# - Cities generated (0-200)
# - Metrics (views, conversions, revenue)
```

### View City Performance:
```bash
# Navigate to: CityLandingPage
# Filter by: landingPageSetId = your_campaign_id
# Sort by: revenue DESC (see top performers)
```

### View Decision History:
```bash
# Navigate to: SEOBrainDecision
# See all decisions made, your responses, outcomes
```

---

## 🔧 Troubleshooting

### "Telegram not sending messages"
```bash
# Check connection
npx tsx src/scripts/seo-brain/setup-telegram.ts

# Common issues:
# 1. TELEGRAM_ADMIN_CHAT_ID not set
# 2. Haven't started conversation with bot yet
# 3. Bot token incorrect
```

### "Ollama not generating content"
```bash
# Test Ollama connection
curl http://localhost:11434/api/generate -d '{
  "model": "deepseek-r1:32b",
  "prompt": "Test",
  "stream": false
}'

# If fails, restart Ollama
# Check if model is pulled: ollama list
```

### "Google AI images failing"
```bash
# Check existing Google AI setup
# Verify env variables for Google AI
# Test with existing product image generator
```

### "City pages not generating"
```bash
# Check logs during generation
# Verify database connection
# Ensure 200 cities exist in database
# Check City table: SELECT COUNT(*) FROM "City"
```

---

## 📈 Expected Timeline

**Day 1:** Start campaign, generation runs (6-7 hours)
**Day 1-7:** Google crawls and indexes pages
**Day 7-14:** First traffic arrives
**Day 14:** SEO Brain analyzes performance, sends first decisions
**Day 30:** Campaign marked OPTIMIZED, ready for next product

---

## 🎓 Key Concepts

### Conservative Mode (Current):
- ✅ You approve EVERY change
- SEO Brain never acts without permission
- Best for learning how it works

### Semi-Autonomous Mode (Future):
- SEO Brain auto-applies "safe" changes
- Asks for approval on major decisions
- Upgrade after you trust the system

### Fully Autonomous Mode (Future):
- SEO Brain makes all decisions
- Only sends summary reports
- For Month 3+ when proven

---

## 📚 Next Steps

After setup complete:

1. **Week 1:** Monitor generation progress
2. **Week 2:** Submit sitemap to Google Search Console
3. **Week 3:** Wait for indexing
4. **Week 4:** Receive first decision requests
5. **Month 2:** Start second product campaign

---

## 🚀 You're Ready!

Run your first campaign:
```bash
npx tsx src/scripts/seo-brain/start-product-campaign.ts
```

Questions? Check:
- `/docs/seo-brain/01-FAQ.md`
- `/docs/seo-brain/02-TROUBLESHOOTING.md`
- Message @iradwatkins on Telegram
