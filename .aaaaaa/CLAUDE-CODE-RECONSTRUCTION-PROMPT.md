# 🤖 CLAUDE CODE RECONSTRUCTION PROMPT

## 📋 COPY THIS ENTIRE PROMPT TO CLAUDE CODE

---

**CONTEXT:** I have a portable SEO + LLM system that I want to integrate into my website. This system includes:

- Core SEO components (metadata, schema markup, sitemaps)
- LLM integrations (Ollama, Google Imagen 4, OpenAI)
- SEO Brain system (200-city campaign generator)
- Analytics integration
- Caching + rate limiting
- API routes

**GOAL:** Help me integrate this portable system into my existing Next.js/React website step by step.

---

## 🎯 YOUR TASK AS CLAUDE CODE

Please help me integrate the portable SEO + LLM system by following these steps:

### **PHASE 1: Initial Assessment (5 minutes)**

1. **Analyze my current project structure**
   - What framework am I using? (Next.js, React, etc.)
   - Do I have Prisma set up?
   - What's my current database?
   - Do I have any existing SEO setup?

2. **Check prerequisites**
   - Is Ollama installed and running? (`curl http://localhost:11434/api/tags`)
   - Do I have Redis available?
   - Do I have the required API keys?

3. **Ask me clarifying questions**:
   - What's my primary use case? (e-commerce, SaaS, blog, local business, etc.)
   - Do I want to generate city landing pages? (Yes/No)
   - How many languages do I need? (1 = English only, or 13 languages)
   - Do I want AI chatbot on my site? (Yes/No)

---

### **PHASE 2: File Integration (15 minutes)**

**Step 1: Copy Core Files**

```bash
# You'll help me copy these files to my project:
portable-seo-llm-system/
├── 1-core-seo/              → /src/lib/seo/
├── 2-llm-integrations/      → /src/lib/llm/
├── 3-seo-brain/             → /src/lib/seo-brain/
├── 6-api-routes/            → /src/app/api/
└── 7-utilities/             → /src/lib/utils/
```

**For each directory, you should:**

1. Show me the command to copy files
2. Explain what each file does
3. Check for any naming conflicts
4. Update import paths if needed

**Step 2: Install Dependencies**

```bash
# You'll add these to my package.json:
npm install @google/genai openai @prisma/client ioredis axios axios-retry sharp
```

**Step 3: Set Up Environment Variables**

```bash
# You'll help me create/update .env with:
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5:32b
GOOGLE_AI_STUDIO_API_KEY=
OPENAI_API_KEY=
DATABASE_URL=
REDIS_URL=redis://localhost:6379
NEXT_PUBLIC_SITE_URL=https://mysite.com
```

**You should ask me for each API key or help me get them if I don't have them yet.**

---

### **PHASE 3: Database Setup (10 minutes)**

**Step 1: Merge Prisma Schemas**

You should:

1. Read my existing `prisma/schema.prisma`
2. Read the portable system's schema (`5-database-schema/prisma-models/schema.prisma`)
3. Identify which models I need based on my use case
4. Merge them without conflicts
5. Show me the diff before applying

**Required models for basic SEO:**

- City (if using geo-targeting)
- ProductSEOContent (for caching AI content)
- Translation (if multi-language)

**Step 2: Run Migration**

```bash
npx prisma migrate dev --name add_seo_llm_system
npx prisma generate
```

You should verify the migration succeeded and show me any errors.

---

### **PHASE 4: Integration Testing (10 minutes)**

**Test 1: Ollama Connection**

Create a test file and help me verify Ollama works:

```typescript
// test-ollama.ts
import { OllamaClient } from '@/lib/llm/ollama/ollama-client'

const client = new OllamaClient()
const test = await client.testConnection()

console.log(test) // Should show: { success: true, model: 'qwen2.5:32b' }
```

**Test 2: Google Imagen**

```typescript
// test-imagen.ts
import { GoogleAIImageGenerator } from '@/lib/llm/google-imagen/google-ai-client'

const generator = new GoogleAIImageGenerator()
const result = await generator.generateImage({
  prompt: 'Professional product photo of a red apple',
  config: { aspectRatio: '1:1' },
})

console.log('Image generated:', result.buffer.length, 'bytes')
```

**Test 3: Redis Cache**

```typescript
// test-cache.ts
import { getLLMCache } from '@/lib/utils/caching/redis-cache'

const cache = getLLMCache()
const stats = await cache.getStats()

console.log('Cache stats:', stats)
```

**You should run each test and debug any issues that arise.**

---

### **PHASE 5: First Integration (20 minutes)**

**Goal:** Add AI-powered SEO to ONE existing page on my site.

**Step 1: Choose a Page**

Help me pick the best page to start with (usually a product page or landing page).

**Step 2: Add Metadata**

```typescript
// In the chosen page file
import { generateMetadata } from '@/lib/seo/metadata/metadata'

export const metadata = generateMetadata({
  title: 'My Product Name',
  description: 'AI-generated description here',
  keywords: ['keyword1', 'keyword2'],
})
```

**Step 3: Add Schema Markup**

```typescript
import { generateProductSchema } from '@/lib/seo/schema/schema-generators'

export default function ProductPage({ product }) {
  const schema = generateProductSchema(product)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      {/* Rest of page */}
    </>
  )
}
```

**Step 4: Test in Browser**

You should:

1. Help me build and run the site
2. Check the page source for metadata
3. Verify schema markup with Google's Rich Results Test
4. Check for any errors in console

---

### **PHASE 6: AI Content Generation (15 minutes)**

**Goal:** Generate SEO content for the page using Ollama.

**Step 1: Create Content API Route**

```typescript
// /api/generate-seo/route.ts
import { OllamaClient } from '@/lib/llm/ollama/ollama-client'

export async function POST(req: Request) {
  const { productName } = await req.json()

  const ollama = new OllamaClient()
  const content = await ollama.generate({
    prompt: `Write a 200-word SEO-optimized description for ${productName}`,
    system: 'You are an SEO content expert',
  })

  return Response.json({ content })
}
```

**Step 2: Call from Frontend**

```typescript
const response = await fetch('/api/generate-seo', {
  method: 'POST',
  body: JSON.stringify({ productName: 'My Product' }),
})

const { content } = await response.json()
console.log('AI generated:', content)
```

**You should help me test this and verify Ollama generates quality content.**

---

### **PHASE 7: (Optional) 200-City Campaign (30 minutes)**

**Only if I said YES to city landing pages.**

**Step 1: Seed City Data**

```bash
# You'll help me run:
npx tsx scripts/seed-cities.ts
```

This adds 200 US cities to my database.

**Step 2: Create Campaign API**

```typescript
// /api/seo-brain/start-campaign/route.ts
import { generate200CityPages } from '@/lib/seo-brain/campaign-generator/city-page-generator'

export async function POST(req: Request) {
  const campaign = await generate200CityPages(...)
  return Response.json({ success: true, campaign })
}
```

**Step 3: Start First Campaign**

You'll help me:

1. Choose a product
2. Configure campaign settings
3. Start generation
4. Monitor progress (takes 6-7 hours)
5. Review generated pages

---

### **PHASE 8: Production Readiness (10 minutes)**

**Checklist you'll help me verify:**

- [ ] All API keys are in `.env` (not committed to git)
- [ ] Redis is running and connected
- [ ] Ollama is running on production server
- [ ] Database has all required tables
- [ ] Test generation works end-to-end
- [ ] Error handling is in place
- [ ] Rate limiting is configured
- [ ] Cache is warming up

**Performance checks:**

- Cache hit rate > 70%
- Page load time < 2 seconds
- SEO score (Lighthouse) > 90

---

## 🎨 CUSTOMIZATION REQUESTS

**After basic integration, help me with:**

1. **Custom prompts** - Modify AI generation style for my brand voice
2. **More languages** - Add specific languages beyond the default 13
3. **Custom schema** - Add industry-specific schema types
4. **A/B testing** - Set up winner/loser detection for my pages
5. **Analytics integration** - Connect to my GA4 account
6. **Custom city data** - Add cities beyond the default 200

---

## 🐛 DEBUGGING PROTOCOL

**If something breaks, you should:**

1. **Check logs** - Show me relevant error messages
2. **Verify prerequisites** - Re-check Ollama, Redis, API keys
3. **Test in isolation** - Create minimal reproduction case
4. **Check documentation** - Reference `/docs/MASTER-SETUP-GUIDE.md`
5. **Fallback gracefully** - Ensure site still works without AI features

---

## 📊 SUCCESS CRITERIA

**By the end, I should have:**

✅ At least ONE page with AI-powered SEO
✅ Schema markup validating in Google's Rich Results Test
✅ Sitemap including AI-generated pages
✅ Ollama generating quality content
✅ Redis caching reducing API calls by 60%+
✅ Zero console errors
✅ Fast page load times (<2s)
✅ Lighthouse SEO score > 90

---

## 🎯 IMPORTANT GUIDELINES FOR YOU (CLAUDE CODE)

1. **Go step-by-step** - Don't rush ahead
2. **Test after each step** - Verify before moving on
3. **Explain what you're doing** - I want to learn
4. **Ask before major changes** - Confirm destructive operations
5. **Show me the code** - Don't just tell me what to do
6. **Debug thoroughly** - Help me fix any errors
7. **Optimize for my use case** - Not just copy-paste

---

## 🚀 READY TO START?

**Begin by asking me:**

1. What framework/stack am I using?
2. What's my primary use case?
3. Do I have Ollama installed?
4. Do I have the required API keys?
5. What's my immediate goal? (Add SEO to existing pages? Generate new pages? Translate content?)

**Then proceed with PHASE 1: Initial Assessment.**

---

## 📎 ADDITIONAL RESOURCES

Reference these files during integration:

- **Setup Guide**: `/docs/MASTER-SETUP-GUIDE.md`
- **API Reference**: `/docs/API-REFERENCE.md` (if exists)
- **Environment Variables**: `/.env.example`
- **Database Schema**: `/5-database-schema/REQUIRED-MODELS.md`

---

**LET'S BUILD SOMETHING AMAZING! 🚀**
