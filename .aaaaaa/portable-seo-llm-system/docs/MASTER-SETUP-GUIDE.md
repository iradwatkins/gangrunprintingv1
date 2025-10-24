# 📚 PORTABLE SEO + LLM SYSTEM - MASTER SETUP GUIDE

## 🎯 What You're Getting

This portable system includes:

✅ **Core SEO Foundation**

- Dynamic metadata generation (Open Graph, Twitter Cards)
- Schema.org JSON-LD (Product, Organization, LocalBusiness, FAQ, HowTo, Breadcrumbs)
- Dynamic sitemap generation
- AI-powered SEO content generator

✅ **LLM/AI Power Tools**

- Ollama client (local LLM for text generation)
- Google Imagen 4 (AI image generation)
- OpenAI integration (multi-language translation - 13 languages)
- Complete SEO Brain system (200-city campaign generator)

✅ **Analytics Intelligence**

- Winner/loser detection algorithms
- Performance analyzer with auto-optimization
- Telegram notification system
- A/B testing framework

✅ **Performance Enhancements**

- Redis caching layer (60-80% cost reduction)
- Smart rate limiting with exponential backoff
- Request deduplication
- Cache warming strategies

---

## 📋 PREREQUISITES

### Required Services

1. **Ollama** (Local LLM)
   - Install: https://ollama.ai/download
   - Run: `ollama pull qwen2.5:32b`
   - Verify: `curl http://localhost:11434/api/tags`

2. **PostgreSQL Database**
   - Any managed PostgreSQL (RDS, DigitalOcean, Supabase, etc.)
   - Or local: `docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=password postgres`

3. **Redis** (Optional but recommended)
   - Install: `docker run -d -p 6379:6379 redis`
   - Or use managed Redis (Redis Cloud, AWS ElastiCache)

### API Keys Needed

1. **Google AI Studio** (for image generation)
   - Get key: https://aistudio.google.com/app/apikey
   - Free tier: 60 requests/minute

2. **OpenAI** (for translation)
   - Get key: https://platform.openai.com/api-keys
   - Pay-as-you-go pricing

3. **Telegram Bot** (optional - for notifications)
   - Create bot: Talk to @BotFather on Telegram
   - Get chat ID: https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates

---

## 🚀 QUICK START (5 Minutes)

### Step 1: Copy Files to Your Project

```bash
# Copy the entire portable-seo-llm-system folder to your project
cp -r /root/portable-seo-llm-system /your/project/path/seo-llm

# Or download as ZIP and extract
```

### Step 2: Install Dependencies

```bash
cd /your/project/path

# Add to your package.json
npm install @google/genai openai @prisma/client ioredis axios axios-retry sharp
```

### Step 3: Set Environment Variables

```bash
cp seo-llm/.env.example .env

# Edit .env and fill in:
OLLAMA_BASE_URL=http://localhost:11434
GOOGLE_AI_STUDIO_API_KEY=your-key-here
OPENAI_API_KEY=sk-your-key-here
DATABASE_URL=postgresql://user:pass@localhost:5432/db
REDIS_URL=redis://localhost:6379  # Optional
```

### Step 4: Set Up Database

```bash
# Copy Prisma models to your schema
cat seo-llm/5-database-schema/prisma-models/schema.prisma >> prisma/schema.prisma

# Run migration
npx prisma migrate dev --name add_seo_llm_system
npx prisma generate
```

### Step 5: Test Integration

```bash
# Test Ollama connection
node seo-llm/scripts/test-ollama.ts

# Test image generation
node seo-llm/scripts/test-imagen.ts

# Test translation
node seo-llm/scripts/test-translation.ts
```

---

## 📁 FILE STRUCTURE EXPLAINED

```
seo-llm/
├── 1-core-seo/                    # SEO Foundation
│   ├── metadata/                  # Next.js metadata generators
│   ├── schema/                    # JSON-LD structured data
│   ├── sitemap/                   # Dynamic sitemap
│   └── content-generator/         # AI SEO writer
│
├── 2-llm-integrations/            # AI Services
│   ├── ollama/                    # Local LLM client
│   ├── google-imagen/             # Image generation
│   ├── openai/                    # Translation system
│   └── shared/                    # Image compression utils
│
├── 3-seo-brain/                   # 200-City System
│   ├── campaign-generator/        # City page generator
│   ├── performance-analyzer/      # Analytics + AI insights
│   ├── winner-analyzer/           # Success pattern detection
│   ├── loser-improver/            # Auto-optimization
│   └── telegram-notifier/         # Admin notifications
│
├── 4-analytics-integration/       # Tracking
│   ├── google-analytics/          # GA4 setup
│   └── performance-tracking/      # Custom events
│
├── 5-database-schema/             # Database
│   └── prisma-models/             # Required tables
│
├── 6-api-routes/                  # API Endpoints
│   ├── chat/                      # Customer chatbot
│   ├── seo-brain/                 # Campaign management
│   └── image-generation/          # Imagen API
│
├── 7-utilities/                   # Helpers
│   ├── caching/                   # Redis caching
│   ├── rate-limiting/             # API protection
│   └── error-handling/            # Graceful degradation
│
└── 8-n8n-workflows/               # Automation (optional)
```

---

## 🔧 INTEGRATION PATTERNS

### Pattern 1: Add SEO Metadata to Any Page

```typescript
// In your Next.js page file
import { generateMetadata } from '@/seo-llm/1-core-seo/metadata/metadata'

export const metadata = generateMetadata({
  title: 'Your Page Title',
  description: 'Your page description',
  keywords: ['keyword1', 'keyword2'],
  url: '/your-page',
})

export default function Page() {
  return <div>Your content</div>
}
```

### Pattern 2: Add Schema Markup

```typescript
import { generateProductSchema, generateFAQSchema } from '@/seo-llm/1-core-seo/schema/schema-generators'

export default function ProductPage({ product }) {
  const schemas = [
    generateProductSchema(product),
    generateFAQSchema(product.faqs),
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
      />
      {/* Your page content */}
    </>
  )
}
```

### Pattern 3: Use Ollama for Content Generation

```typescript
import { OllamaClient } from '@/seo-llm/2-llm-integrations/ollama/ollama-client'
import { getLLMCache } from '@/seo-llm/7-utilities/caching/redis-cache'

const ollama = new OllamaClient()
const cache = getLLMCache()

// Generate SEO content with caching
const content = await cache.cachedOllamaGenerate(
  `Write a 500-word description about ${productName}`,
  { temperature: 0.7, maxTokens: 2000 },
  async () => {
    return await ollama.generate({
      prompt: `Write a 500-word description about ${productName}`,
      system: 'You are an SEO content expert',
    })
  },
  86400 // Cache for 24 hours
)
```

### Pattern 4: Generate AI Images

```typescript
import { GoogleAIImageGenerator } from '@/seo-llm/2-llm-integrations/google-imagen/google-ai-client'

const generator = new GoogleAIImageGenerator()

const result = await generator.generateImage({
  prompt: 'Professional product photography of red skateboard',
  config: {
    aspectRatio: '4:3',
    imageSize: '2K',
  },
})

// result.buffer can be uploaded to S3/MinIO
```

### Pattern 5: Multi-Language Translation

```typescript
import { AutoTranslationService } from '@/seo-llm/2-llm-integrations/openai/auto-translate'

const translator = AutoTranslationService.getInstance()

const result = await translator.translateWithOpenAI('Hello, welcome to our store', {
  sourceLocale: 'en',
  targetLocale: 'es',
})

console.log(result.translatedText) // "Hola, bienvenido a nuestra tienda"
console.log(result.confidence) // 0.95
```

---

## 🧠 SEO BRAIN: 200-CITY CAMPAIGN SYSTEM

### What It Does

Generates 200 unique city landing pages for ANY product with:

1. AI-generated product images (Google Imagen 4)
2. City-specific hero images
3. 500-word unique content (localized for each city)
4. 10 benefits (city-specific)
5. 15 FAQs (location-aware)
6. Complete schema markup
7. SEO metadata

### How to Use

```typescript
import { generate200CityPages } from '@/seo-llm/3-seo-brain/campaign-generator/city-page-generator'
import { ollamaClient } from '@/seo-llm/2-llm-integrations/ollama/ollama-client'

// Start campaign
const result = await generate200CityPages(
  'campaign-12345',
  {
    productName: '1000 Business Cards',
    quantity: 1000,
    size: '3.5x2',
    material: '16pt Cardstock',
    turnaround: '5-7 business days',
    price: 49.99,
    onlineOnly: true,
    keywords: ['business cards', 'printing', 'online printing'],
  },
  ollamaClient
)

// Result:
// - 200 city pages generated
// - Each with unique content
// - Each with local schema markup
// - Total generation time: 6-7 hours
```

### Estimated Costs

- **Ollama**: $0 (runs locally)
- **Google Imagen**: $0.02/image × 400 images = $8
- **OpenAI** (if translating): $10-20 depending on languages
- **Total per campaign**: ~$18-30

---

## 📊 ANALYTICS + A/B TESTING

### Track Performance

```typescript
import { PerformanceAnalyzer } from '@/seo-llm/3-seo-brain/performance-analyzer/performance-analyzer'

const analyzer = new PerformanceAnalyzer()

// Analyze all city pages
const report = await analyzer.analyzeAllPages()

console.log(report.winners) // Top 20 performing pages
console.log(report.losers) // Bottom 20 underperformers
console.log(report.insights) // AI-generated insights
```

### Auto-Optimize Underperformers

```typescript
import { LoserImprover } from '@/seo-llm/3-seo-brain/loser-improver/loser-improver'

const improver = new LoserImprover()

// Get 3 improvement options for a page
const options = await improver.generateImprovementOptions(pageId)

// Option A: Rewrite intro
// Option B: Add more benefits
// Option C: Improve FAQs

// Apply best option
await improver.applyImprovement(pageId, options[0])
```

---

## 🎨 CUSTOMIZATION

### Change LLM Model

```typescript
// Use different Ollama model
const ollama = new OllamaClient('http://localhost:11434', 'llama3.2:70b')

// Or use OpenAI instead
import OpenAI from 'openai'
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
```

### Customize Content Prompts

Edit `/seo-llm/3-seo-brain/campaign-generator/city-content-prompts.ts`

### Add More Cities

Edit `/seo-llm/3-seo-brain/city-data/top-200-cities.json`

---

## 🐛 TROUBLESHOOTING

### Ollama Not Connecting

```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# If not, start it
ollama serve

# Pull model if needed
ollama pull qwen2.5:32b
```

### Redis Cache Not Working

```bash
# Check Redis connection
redis-cli ping
# Should return: PONG

# View cache stats
redis-cli
> KEYS llm:*
> INFO memory
```

### Rate Limit Errors

The system has built-in retry logic, but if you hit limits:

- **OpenAI**: Upgrade tier or reduce requests
- **Google Imagen**: Wait 1 minute between batches
- **Ollama**: Reduce concurrent requests in config

---

## 📈 PERFORMANCE OPTIMIZATION

### Expected Improvements

**Before:**

- Manual SEO writing: 2 hours/page × 200 pages = 400 hours
- Cost: $20/page × 200 = $4,000
- Translation: $50/page × 200 = $10,000
- **Total: $14,000 + 400 hours**

**After:**

- Automated generation: 6-7 hours for 200 pages
- Cost: $18-30 total
- No manual translation needed
- **Total: $30 + 7 hours**

**Savings: 98% cost reduction, 98% time savings**

### Cache Hit Rates

With proper Redis caching:

- First generation: 100% API calls
- Subsequent requests: 80% cache hits
- **Cost reduction: 80%**

---

## 🔐 SECURITY BEST PRACTICES

1. **Never commit API keys** - Use `.env` files
2. **Rate limit public endpoints** - Prevent abuse
3. **Validate all inputs** - Prevent prompt injection
4. **Cache sensitive data encrypted** - Use Redis encryption
5. **Monitor API usage** - Set billing alerts

---

## 📞 SUPPORT & RESOURCES

- **Ollama Docs**: https://ollama.ai/docs
- **Google AI Studio**: https://ai.google.dev/docs
- **OpenAI API**: https://platform.openai.com/docs
- **Prisma Docs**: https://www.prisma.io/docs

---

## 🚀 NEXT STEPS

1. ✅ Complete setup following this guide
2. ✅ Test all integrations
3. ✅ Generate your first city campaign
4. ✅ Monitor performance
5. ✅ Scale to more products

**Ready to deploy? See `CLAUDE-CODE-RECONSTRUCTION-PROMPT.md` for step-by-step rebuild instructions.**
