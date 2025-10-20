# SEO Brain Architecture Overview

**Last Updated:** October 19, 2025
**Version:** 1.0.0
**Status:** Production Ready

---

## System Overview

The **SEO Brain** is an autonomous AI system that generates and optimizes 200-city landing pages for each product. It operates in **Conservative Mode**, requiring user approval for all changes via Telegram.

### Core Capabilities

1. **200-City Generation**: Creates unique landing pages for top 200 US cities
2. **AI Content Creation**: 500-word intros, 10 benefits, 15 FAQs per city (via Ollama)
3. **Image Generation**: Main product image + 200 unique city hero images (via Google Imagen 4)
4. **Performance Analysis**: Identifies top 20% winners and bottom 20% losers
5. **Pattern Extraction**: AI learns what makes winners successful
6. **Autonomous Optimization**: Generates A/B/C improvement options
7. **Conservative Mode**: All changes require user approval via Telegram

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      USER (Telegram)                        │
│                 Receives A/B/C decisions                     │
│                 Approves with "A", "B", or "C"              │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│                   TELEGRAM BOT                               │
│            (Micheal - SEO LLM Landing Page Master)          │
│     Token: 7510262123:AAFiInboeGKrhovu8hcmDvZsDgEpS3W1yWs   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│                     n8n WORKFLOWS                            │
│  ┌────────────────┐  ┌────────────────┐  ┌───────────────┐ │
│  │ 01-Orchestrator│  │ 02-City        │  │ 03-Performance│ │
│  │    (Main)      │  │   Generator    │  │   Monitor     │ │
│  └────────────────┘  └────────────────┘  └───────────────┘ │
│  ┌────────────────┐  ┌────────────────┐  ┌───────────────┐ │
│  │ 04-Winner      │  │ 05-Loser       │  │ 06-Decision   │ │
│  │   Detector     │  │   Improver     │  │   Handler     │ │
│  └────────────────┘  └────────────────┘  └───────────────┘ │
│  ┌────────────────┐  ┌────────────────┐  ┌───────────────┐ │
│  │ 07-Telegram    │  │ 08-Sitemap     │  │ 09-Daily      │ │
│  │   Response     │  │   Submitter    │  │   Optimizer   │ │
│  └────────────────┘  └────────────────┘  └───────────────┘ │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│                  NEXT.JS API ROUTES                          │
│  /api/seo-brain/start-campaign         (POST)               │
│  /api/seo-brain/campaign-status        (GET)                │
│  /api/seo-brain/performance            (GET)                │
│  /api/seo-brain/approve-decision       (POST/GET)           │
│  /api/seo-brain/analyze-now            (POST)               │
│  /api/seo-brain/webhook                (POST)               │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│                  SEO BRAIN CORE LIBRARY                      │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  orchestrator.ts          - Main decision engine       │ │
│  │  city-page-generator.ts   - Generates 200 pages        │ │
│  │  city-content-prompts.ts  - Premium 500-word prompts   │ │
│  │  winner-analyzer.ts       - Pattern extraction         │ │
│  │  loser-improver.ts        - Improvement options        │ │
│  │  performance-analyzer.ts  - Metrics calculation        │ │
│  │  telegram-notifier.ts     - Telegram communication     │ │
│  │  ollama-client.ts         - AI client wrapper          │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                         │
│  ┌───────────────┐  ┌───────────────┐  ┌──────────────────┐ │
│  │ Ollama        │  │ Google AI     │  │ PostgreSQL       │ │
│  │ (DeepSeek R1) │  │ (Imagen 4)    │  │ (Database)       │ │
│  │ Port: 11434   │  │ Image Gen     │  │ Port: 5435       │ │
│  └───────────────┘  └───────────────┘  └──────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Flow: 200-City Campaign

### 1. Campaign Start

```
User (Script/API) → POST /api/seo-brain/start-campaign
    ↓
Create ProductCampaignQueue record (status: GENERATING)
    ↓
Generate ONE main product image (Google AI)
    ↓
Loop 200 cities in batches of 10:
    - Generate city intro (Ollama, 500 words)
    - Generate city benefits (Ollama, 10 items)
    - Generate city FAQs (Ollama, 15 items)
    - Generate city hero image (Google AI)
    - Create CityLandingPage record
    - Wait 2 seconds
    ↓
Update campaign status: COMPLETED
    ↓
Send Telegram notification: "200 cities complete!"
```

**Time:** 6-7 hours total

---

### 2. Daily Optimization (3 AM)

```
n8n Daily Optimizer Trigger (3 AM)
    ↓
Get all COMPLETED campaigns (last 30 days)
    ↓
For each campaign:
    ├─ Analyze Winners (GET /api/seo-brain/analyze-winners)
    │   └─ Extract pattern from top 20% performers
    │   └─ Save to CityWinnerPattern table
    │   └─ Telegram: "Winner pattern found!"
    │
    └─ Improve Losers (POST /api/seo-brain/improve-losers)
        └─ Get bottom 20% performers
        └─ Generate A/B/C options (Ollama)
        └─ Save to SEOBrainDecision table
        └─ Telegram: "Decision needed: A, B, or C?"
```

---

### 3. User Decision Flow

```
User receives Telegram message:
    "🔧 Decision Needed: Improve new-york-ny

    Option A: Update title format [75% confidence, +10-15 points]
    Option B: Rewrite intro + benefits [65% confidence, +20-25 points]
    Option C: Complete regeneration [55% confidence, +30-40 points]

    Reply: A, B, or C"

User replies: "B"
    ↓
n8n Telegram Response Handler catches "B"
    ↓
POST /api/seo-brain/webhook
    ↓
Find pending decision (status: PENDING)
    ↓
Update decision (selectedOption: "B", status: APPROVED)
    ↓
Execute improvement:
    - Regenerate intro using winner pattern
    - Regenerate benefits
    - Add CTA placements
    ↓
Telegram: "✅ Decision executed! Option B applied."
```

---

## Database Schema

### ProductCampaignQueue
Tracks each product's 200-city campaign

```sql
CREATE TABLE "ProductCampaignQueue" (
  "id" TEXT PRIMARY KEY,
  "productName" TEXT NOT NULL,
  "productSpec" JSONB NOT NULL,
  "status" TEXT DEFAULT 'PENDING',
  "citiesGenerated" INTEGER DEFAULT 0,
  "citiesIndexed" INTEGER DEFAULT 0,
  "generationStartedAt" TIMESTAMP,
  "generationCompletedAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT NOW()
);
```

### CityLandingPage
Individual city page content

```sql
CREATE TABLE "CityLandingPage" (
  "id" TEXT PRIMARY KEY,
  "landingPageSetId" TEXT REFERENCES "ProductCampaignQueue"(id),
  "slug" TEXT UNIQUE NOT NULL,
  "title" TEXT NOT NULL,
  "aiIntro" TEXT,                    -- 500-word intro
  "aiBenefits" TEXT,                 -- 10 benefits
  "faqSchema" JSONB,                 -- 15 FAQs
  "mainProductImageUrl" TEXT,        -- Main product image
  "cityHeroImageUrl" TEXT,           -- City-specific hero
  "views" INTEGER DEFAULT 0,
  "revenue" DECIMAL DEFAULT 0,
  "conversionRate" DECIMAL,
  "createdAt" TIMESTAMP DEFAULT NOW()
);
```

### CityWinnerPattern
Extracted patterns from top performers

```sql
CREATE TABLE "CityWinnerPattern" (
  "id" TEXT PRIMARY KEY,
  "productType" TEXT NOT NULL,
  "patternName" TEXT NOT NULL,
  "pattern" JSONB NOT NULL,          -- Full pattern data
  "sourceCities" TEXT[],
  "sourcePages" TEXT[],
  "avgPerformanceScore" INTEGER,
  "sampleSize" INTEGER,
  "timesReplicated" INTEGER DEFAULT 0,
  "timesSuccessful" INTEGER DEFAULT 0,
  "successRate" DECIMAL,
  "confidence" INTEGER,
  "createdAt" TIMESTAMP DEFAULT NOW()
);
```

### SEOBrainDecision
User decisions awaiting approval

```sql
CREATE TABLE "SEOBrainDecision" (
  "id" TEXT PRIMARY KEY,
  "campaignId" TEXT,
  "decisionType" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "context" JSONB,
  "options" JSONB NOT NULL,          -- A, B, C options
  "selectedOption" TEXT,             -- User's choice
  "userFeedback" TEXT,
  "status" TEXT DEFAULT 'PENDING',
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "respondedAt" TIMESTAMP,
  "executedAt" TIMESTAMP
);
```

### CityPerformanceSnapshot
Daily performance tracking

```sql
CREATE TABLE "CityPerformanceSnapshot" (
  "id" TEXT PRIMARY KEY,
  "cityLandingPageId" TEXT REFERENCES "CityLandingPage"(id),
  "timestamp" TIMESTAMP NOT NULL,
  "views" INTEGER,
  "conversions" INTEGER,
  "revenue" DECIMAL,
  "conversionRate" DECIMAL,
  "avgOrderValue" DECIMAL,
  "performanceScore" INTEGER
);
```

### SEOBrainAlert
Telegram notification log

```sql
CREATE TABLE "SEOBrainAlert" (
  "id" TEXT PRIMARY KEY,
  "campaignId" TEXT,
  "alertType" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "severity" TEXT DEFAULT 'INFO',
  "telegramSent" BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMP DEFAULT NOW()
);
```

---

## Performance Scoring Algorithm

```typescript
function calculatePerformanceScore(metrics: {
  conversions: number
  views: number
  revenue: number
}): number {
  // Normalize to 0-100 scale
  const conversionScore = Math.min(100, (conversions / 10) * 100)
  const viewScore = Math.min(100, (views / 500) * 100)
  const revenueScore = Math.min(100, (revenue / 1000) * 100)

  // Weighted formula
  return conversionScore * 0.5 + viewScore * 0.3 + revenueScore * 0.2
}
```

**Weights:**
- Conversions: 50% (most important)
- Views: 30% (traffic quality)
- Revenue: 20% (business impact)

---

## Winner/Loser Detection

- **Winners:** Top 20% by performance score
- **Losers:** Bottom 20% by performance score
- **Minimum Sample:** At least 10 cities in each category

---

## Next Steps

1. Read [02-INSTALLATION-GUIDE.md](./02-INSTALLATION-GUIDE.md) for setup
2. Read [03-USAGE-GUIDE.md](./03-USAGE-GUIDE.md) for operation
3. Review [04-API-REFERENCE.md](./04-API-REFERENCE.md) for endpoints
4. Check [05-N8N-SETUP.md](./05-N8N-SETUP.md) for workflow configuration
5. See [06-TROUBLESHOOTING.md](./06-TROUBLESHOOTING.md) for issues
6. Read [07-BEST-PRACTICES.md](./07-BEST-PRACTICES.md) for optimization
