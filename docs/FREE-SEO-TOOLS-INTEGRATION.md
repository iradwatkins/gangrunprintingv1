# 🆓 FREE SEO/AI-SEO Tracking Tools - Integration Guide

## 🎯 Your Question:

> "what free services can we use to integrate into the system that will help us with seo llm aiseo tracking and help us to understand what action need to be done to get more ranking."

---

## ✅ FREE Tools We Can Integrate (No Cost)

### 1. **Google Search Console API** ⭐ (100% Free Forever)

**What It Does:**

- Tracks keyword rankings in Google
- Shows clicks, impressions, CTR, position
- Reports technical SEO issues
- Shows which pages rank for what keywords
- Mobile usability reports

**How to Integrate:**

```bash
# Step 1: Install dependency
npm install googleapis

# Step 2: Get credentials (free)
# 1. Go to: https://console.cloud.google.com/apis/credentials
# 2. Create OAuth 2.0 Client ID
# 3. Enable Google Search Console API
# 4. Download credentials JSON

# Step 3: Add to .env
GOOGLE_SEARCH_CONSOLE_CLIENT_ID=your_client_id
GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET=your_secret
GOOGLE_SEARCH_CONSOLE_REFRESH_TOKEN=your_token
```

**What You Get:**

```json
{
  "keyword": "postcard printing",
  "position": 12,
  "clicks": 89,
  "impressions": 2847,
  "ctr": 3.1
}
```

**Action Alerts:**

- ⚠️ "Postcard" dropped from #5 to #12 → Update keywords
- ✅ "Business Cards" improved #15 to #8 → Keep strategy
- 🔴 Mobile usability issues on 3 pages → Fix responsive design

---

### 2. **LLMrefs** ⭐ (Free Plan: 1 keyword/month)

**What It Does:**

- Tracks mentions in ChatGPT, Perplexity, Claude, Gemini
- Shows if your brand appears in AI responses
- Monitors competitor mentions
- Citation tracking

**Free Plan:**

- 1 keyword tracked
- Monthly reports
- All AI platforms

**How to Integrate:**

```bash
# Step 1: Sign up (free)
# https://llmrefs.com

# Step 2: Add your brand
Brand: "GangRun Printing"
Domain: gangrunprinting.com
Keyword: "postcard printing services"

# Step 3: Get API key (if available)
# Check LLMrefs dashboard for API access
```

**What You Get:**

```json
{
  "keyword": "postcard printing services",
  "chatgpt_mentions": 23,
  "perplexity_mentions": 8,
  "gemini_mentions": 12,
  "sentiment": "positive",
  "competitors_mentioned": ["Vistaprint", "Moo"],
  "your_ranking": 3
}
```

**Action Alerts:**

- ✅ You appear in 23 ChatGPT responses this month
- ⚠️ Vistaprint mentioned 45 times (you: 23) → Improve content
- 🔴 Not mentioned in "business card printing" → Add keywords

---

### 3. **Knowatoa** (Free Plan Available)

**What It Does:**

- Multi-AI platform tracking (ChatGPT, Gemini, Perplexity, Claude, Meta AI)
- Shows if your website is mentioned
- Tracks product mentions
- Free plan for basic tracking

**How to Use:**

```bash
# Sign up: https://knowatoa.com
# Add queries:
- "best postcard printing service"
- "cheap business card printing"
- "club promoter flyer printing"

# Check daily if gangrunprinting.com is mentioned
```

---

### 4. **Otterly.AI** (14-Day Free Trial, Then $29/mo)

**What It Does:**

- Google AI Overviews tracking
- ChatGPT citation monitoring
- Perplexity mentions
- Daily tracking
- Unlimited brand reports

**Free Trial:**

- 14 days full access
- All features unlocked

**After Trial:**

- $29/month (cheapest LLM tracking)
- Unlimited prompts
- Daily updates

**ROI:** If it brings 1 extra customer/month ($50 avg order) → Pays for itself

---

### 5. **Morningscore ChatGPT Tracker** (Free Trial: 20 prompts)

**What It Does:**

- Tracks 20 prompts for free
- Shows ChatGPT rankings
- Citation tracking

**How to Use:**

```bash
# Sign up: https://morningscore.io/chatgpt-rank-tracker/
# Add 20 prompts (free):
1. "best postcard printing"
2. "cheap business cards"
3. "club promoter printing services"
4. "event flyer printing"
... (16 more)
```

---

### 6. **SEO Gets** (Free - Google Search Console Wrapper)

**What It Does:**

- Beautiful dashboard for GSC data
- Shows page growth/decline instantly
- Multi-site management
- 100% free

**How to Use:**

```bash
# 1. Connect Google Search Console
# 2. Go to: https://seogets.com
# 3. Link your GSC account (free)
# 4. See all your sites in one dashboard
```

---

### 7. **Ahrefs Webmaster Tools** (Free Plan)

**What It Does:**

- Backlink tracking
- SEO audit
- Keyword research (limited)
- Site health monitoring

**Free Plan:**

- Verify your website
- Full site audit
- Backlink checker
- Keyword explorer (limited)

**How to Use:**

```bash
# 1. Sign up: https://ahrefs.com/webmaster-tools
# 2. Verify gangrunprinting.com
# 3. Get weekly SEO audits (free)
```

---

## 🛠️ Integration Architecture

### Phase 1: Core SEO Tracking (Free)

```typescript
// /src/lib/seo/integrations.ts

import { google } from 'googleapis'

/**
 * Google Search Console Integration
 * Cost: FREE (forever)
 */
export async function getGoogleSearchData(siteUrl: string) {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_ID,
    process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET
  )

  auth.setCredentials({
    refresh_token: process.env.GOOGLE_SEARCH_CONSOLE_REFRESH_TOKEN,
  })

  const searchConsole = google.searchconsole({ version: 'v1', auth })

  const response = await searchConsole.searchanalytics.query({
    siteUrl,
    requestBody: {
      startDate: '2025-09-10',
      endDate: '2025-10-10',
      dimensions: ['query', 'page'],
      rowLimit: 1000,
    },
  })

  return response.data.rows
}

/**
 * Track all products daily
 */
export async function trackAllProductsSEO() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { id: true, slug: true, seoKeywords: true },
  })

  for (const product of products) {
    const gscData = await getGoogleSearchData(
      `https://gangrunprinting.com/products/${product.slug}`
    )

    // Analyze data
    const rankings = gscData.map((row) => ({
      keyword: row.keys[0],
      position: row.position,
      clicks: row.clicks,
      impressions: row.impressions,
    }))

    // Check for ranking drops
    const alerts = detectRankingIssues(rankings, product)

    // Update database
    await prisma.product.update({
      where: { id: product.id },
      data: {
        seoMetrics: {
          lastChecked: new Date(),
          rankings,
          alerts,
          totalClicks: gscData.reduce((sum, r) => sum + r.clicks, 0),
          totalImpressions: gscData.reduce((sum, r) => sum + r.impressions, 0),
        },
      },
    })

    // Send alerts if needed
    if (alerts.length > 0) {
      await sendSEOAlert(product, alerts)
    }
  }
}

/**
 * Detect ranking issues
 */
function detectRankingIssues(currentRankings, product) {
  const alerts = []
  const previousMetrics = product.seoMetrics?.rankings || []

  for (const ranking of currentRankings) {
    const previous = previousMetrics.find((r) => r.keyword === ranking.keyword)

    if (previous) {
      const positionDrop = ranking.position - previous.position

      // Alert if dropped 3+ positions
      if (positionDrop >= 3) {
        alerts.push({
          type: 'RANKING_DROP',
          severity: positionDrop >= 5 ? 'HIGH' : 'MEDIUM',
          keyword: ranking.keyword,
          oldPosition: previous.position,
          newPosition: ranking.position,
          action: 'UPDATE_CONTENT',
          suggestion: `Add more keywords related to "${ranking.keyword}"`,
        })
      }

      // Alert if impressions dropped 50%+
      const impressionDrop = (previous.impressions - ranking.impressions) / previous.impressions
      if (impressionDrop >= 0.5) {
        alerts.push({
          type: 'TRAFFIC_DROP',
          severity: 'HIGH',
          keyword: ranking.keyword,
          oldImpressions: previous.impressions,
          newImpressions: ranking.impressions,
          action: 'CHECK_COMPETITION',
          suggestion: 'Competitor may have new content',
        })
      }
    }
  }

  return alerts
}
```

---

### Phase 2: LLM Tracking (Manual + Free Trial)

**Strategy:**

1. Use **LLMrefs free plan** for 1 main keyword: "postcard printing services"
2. Use **Knowatoa free plan** for brand monitoring
3. Use **Morningscore free trial** for 20 prompts
4. Manually check ChatGPT monthly for brand mentions

**Monthly Process:**

```bash
# Test ChatGPT mentions (manual, free)
# Go to: https://chatgpt.com
# Ask: "What are the best postcard printing services?"
# Check if gangrunprinting.com is mentioned

# Test Perplexity (manual, free)
# Go to: https://perplexity.ai
# Ask: "Where can I print business cards for clubs?"
# Check if you're mentioned

# Test Google Gemini (manual, free)
# Go to: https://gemini.google.com
# Ask: "Best flyer printing for events"
# Check citations
```

---

### Phase 3: Automated Tracking Setup

**Cron Job (runs daily at 3am):**

```bash
# Add to crontab
0 3 * * * cd /root/websites/gangrunprinting && npx tsx scripts/daily-seo-check.ts
```

**Script: `/scripts/daily-seo-check.ts`**

```typescript
/**
 * Daily SEO Health Check
 * - Runs at 3am daily
 * - Checks Google Search Console
 * - Detects ranking drops
 * - Sends email alerts
 * - Updates admin dashboard
 */

async function dailySEOCheck() {
  console.log('🔍 Starting daily SEO check...')

  // 1. Update Google Search Console data
  await trackAllProductsSEO()

  // 2. Generate daily report
  const report = await generateDailySEOReport()

  // 3. Send email if action needed
  if (report.criticalIssues > 0) {
    await sendEmail({
      to: 'iradwatkins@gmail.com',
      subject: `🚨 SEO Alert: ${report.criticalIssues} issues need attention`,
      body: formatSEOReport(report),
    })
  }

  console.log('✅ SEO check complete')
}

dailySEOCheck()
```

---

## 📊 What You'll See in Admin Dashboard

### `/admin/seo/performance` Page:

```
┌──────────────────────────────────────────────────────────────┐
│ SEO HEALTH DASHBOARD                                          │
├──────────────────────────────────────────────────────────────┤
│ Overall SEO Score: 78/100 (↑ 5 from last week)              │
│                                                               │
│ Google Rankings:                                              │
│   🟢 Improving: 12 keywords (↑ 3+ positions)                 │
│   🟡 Stable: 45 keywords (±2 positions)                      │
│   🔴 Declining: 3 keywords (↓ 3+ positions) ⚠️               │
│                                                               │
│ AI Search Visibility:                                         │
│   ChatGPT mentions: 23 (from LLMrefs)                        │
│   Perplexity mentions: 8 (manual check)                      │
│   Google AI Overviews: Featured 3 times                      │
│                                                               │
│ Action Items (3):                                             │
│   1. 🔴 "Business Cards" dropped #5 → #12                    │
│      → UPDATE: Add "club promoter" keyword                   │
│                                                               │
│   2. 🟡 "Flyers" bounce rate 65% (avg 45%)                   │
│      → ADD: FAQ section, video, better images                │
│                                                               │
│   3. 🟢 "Postcards" traffic up 45%                           │
│      → EXPAND: Create more city-specific pages               │
└──────────────────────────────────────────────────────────────┘

[Auto-Fix SEO Issues] [View Full Report] [Export CSV]
```

---

## 💰 Cost Breakdown

### 100% Free (No Cost Ever):

1. **Google Search Console API** - $0/month
2. **LLMrefs** (1 keyword) - $0/month
3. **Knowatoa** (basic plan) - $0/month
4. **SEO Gets** - $0/month
5. **Ahrefs Webmaster Tools** - $0/month
6. **Manual ChatGPT checking** - $0/month

**Total Cost: $0/month**

### Optional Paid (After Free Trials):

- **Otterly.AI** - $29/month (worth it if brings 1 customer)
- **LLMrefs Pro** - $49/month (10 keywords)
- **Morningscore** - $99/month (unlimited prompts)

**Recommended:** Start 100% free, add paid tools only if seeing ROI

---

## 🚀 Quick Setup (30 Minutes)

### Step 1: Google Search Console (10 min)

```bash
# 1. Verify site: https://search.google.com/search-console
# 2. Get API credentials: https://console.cloud.google.com/apis/credentials
# 3. Add to .env
# 4. Test: npx tsx scripts/test-gsc-api.ts
```

### Step 2: LLMrefs (5 min)

```bash
# 1. Sign up: https://llmrefs.com
# 2. Add brand: "GangRun Printing"
# 3. Add keyword: "postcard printing services"
# 4. Check dashboard daily
```

### Step 3: Manual AI Checks (10 min)

```bash
# Test once a week:
# 1. ChatGPT: "best postcard printing"
# 2. Perplexity: "business card printing for clubs"
# 3. Gemini: "event flyer printing services"
# 4. Record if gangrunprinting.com mentioned
```

### Step 4: Automated Tracking (5 min)

```bash
# Add cron job:
crontab -e
# Add line:
0 3 * * * cd /root/websites/gangrunprinting && npx tsx scripts/daily-seo-check.ts
```

---

## ✅ What Actions You'll Get

### Example Alert Email:

```
Subject: 🚨 SEO Alert: 2 issues need attention

Hi,

Your daily SEO check found issues:

🔴 CRITICAL (Fix Today):
   Product: "Business Cards"
   Issue: Ranking dropped #5 → #12 for "business card printing"
   Reason: Competitor updated content
   Action:
   1. Add keyword "club promoter business cards"
   2. Update meta description to include price
   3. Add FAQ section about same-day printing

🟡 MEDIUM (Fix This Week):
   Product: "Flyers"
   Issue: Bounce rate 65% (site avg: 45%)
   Action:
   1. Add video to product page
   2. Improve hero image
   3. Add customer testimonials

✅ GOOD NEWS:
   - "Postcards" traffic up 45% this month
   - "Banners" improved from #15 → #8
   - Overall SEO score: 78/100 (↑5)

[View Full Report] [Auto-Fix Issues]
```

---

## 📚 Summary

**Free Tools to Integrate:**

1. ✅ Google Search Console API (rankings, traffic)
2. ✅ LLMrefs (ChatGPT/AI mentions)
3. ✅ Knowatoa (multi-AI tracking)
4. ✅ SEO Gets (pretty GSC dashboard)
5. ✅ Ahrefs Webmaster Tools (backlinks, audits)

**What You Get:**

- Daily SEO health checks
- Ranking drop alerts
- AI mention tracking
- Action recommendations
- Automated reports

**Total Cost:** $0/month

**Next:** Want me to build the integration scripts and admin dashboard?
