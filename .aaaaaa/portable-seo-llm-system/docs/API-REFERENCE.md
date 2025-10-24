# 📘 API REFERENCE

Complete reference for all functions, classes, and APIs in the Portable SEO + LLM System.

---

## 📊 1. CORE SEO

### Metadata Generation

#### `generateMetadata(options: PageMetadata): Metadata`

Generate Next.js metadata for SEO optimization.

**Parameters:**

```typescript
interface PageMetadata {
  title: string
  description?: string
  keywords?: string[]
  image?: string
  url?: string
  type?: 'website' | 'article' | 'product' | 'product.group'
  noindex?: boolean
}
```

**Returns:** Next.js `Metadata` object

**Example:**

```typescript
import { generateMetadata } from '@/seo-llm/1-core-seo/metadata/metadata'

export const metadata = generateMetadata({
  title: 'Business Cards - Professional Printing',
  description: 'High-quality business cards with fast turnaround',
  keywords: ['business cards', 'printing', 'professional'],
  url: '/products/business-cards',
  type: 'product',
})
```

---

### Schema Markup

#### `generateProductSchema(product, baseUrl): object`

Generate Product schema markup.

**Parameters:**

```typescript
interface Product {
  id: string
  name: string
  description?: string
  imageUrl?: string
  price: number
  sku?: string
}
```

**Returns:** JSON-LD object

**Example:**

```typescript
import { generateProductSchema } from '@/seo-llm/1-core-seo/schema/schema-generators'

const schema = generateProductSchema(
  {
    id: 'prod-123',
    name: '1000 Business Cards',
    price: 49.99,
    imageUrl: '/images/product.jpg',
  },
  'https://yoursite.com'
)
```

#### `generateFAQSchema(faqs): object`

Generate FAQ schema markup.

**Parameters:**

```typescript
interface FAQ {
  question: string
  answer: string
}
```

**Example:**

```typescript
const faqSchema = generateFAQSchema([
  {
    question: 'What is the turnaround time?',
    answer: '5-7 business days for standard orders',
  },
])
```

---

## 🤖 2. LLM INTEGRATIONS

### Ollama Client

#### `class OllamaClient`

**Constructor:**

```typescript
new OllamaClient(baseUrl?: string, defaultModel?: string)
```

**Methods:**

##### `generate(options): Promise<string>`

Generate text completion.

```typescript
interface OllamaGenerateOptions {
  prompt: string
  system?: string
  model?: string
  temperature?: number
  maxTokens?: number
}

const client = new OllamaClient()
const response = await client.generate({
  prompt: 'Write a product description',
  system: 'You are an SEO expert',
  temperature: 0.7,
  maxTokens: 500,
})
```

##### `generateJSON<T>(options): Promise<T>`

Generate structured JSON response.

```typescript
const faqs = await client.generateJSON<{ question: string; answer: string }[]>({
  prompt: 'Generate 5 FAQs about business cards',
})
```

##### `testConnection(): Promise<{success: boolean; model?: string; error?: string}>`

Test Ollama connection.

```typescript
const status = await client.testConnection()
if (status.success) {
  console.log('Connected to model:', status.model)
}
```

---

### Google Imagen (Image Generation)

#### `class GoogleAIImageGenerator`

**Constructor:**

```typescript
new GoogleAIImageGenerator(apiKey?: string)
```

**Methods:**

##### `generateImage(options): Promise<ImageGenerationResult>`

Generate a single image.

```typescript
interface GenerateImageOptions {
  prompt: string
  negativePrompt?: string
  config?: {
    numberOfImages?: 1 | 2 | 3 | 4
    aspectRatio?: '1:1' | '3:4' | '4:3' | '9:16' | '16:9'
    imageSize?: '1K' | '2K'
    personGeneration?: 'dont_allow' | 'allow_adult' | 'allow_all'
  }
}

const generator = new GoogleAIImageGenerator()
const result = await generator.generateImage({
  prompt: 'Professional product photography of red skateboard',
  config: {
    aspectRatio: '4:3',
    imageSize: '2K',
  },
})

// result.buffer: Buffer ready for upload
// result.imageBytes: Base64 string
```

##### `generateBatch(prompts, config): Promise<ImageGenerationResult[]>`

Generate multiple images.

```typescript
const results = await generator.generateBatch([
  'Product photo angle 1',
  'Product photo angle 2',
  'Product photo angle 3',
])
```

---

### OpenAI Translation

#### `class AutoTranslationService`

**Singleton pattern:**

```typescript
const translator = AutoTranslationService.getInstance()
```

**Methods:**

##### `translateWithOpenAI(text, options): Promise<TranslationResult>`

Translate text.

```typescript
interface AutoTranslateOptions {
  sourceLocale: string
  targetLocale: string
  context?: string
  model?: string
  temperature?: number
}

const result = await translator.translateWithOpenAI('Welcome to our store', {
  sourceLocale: 'en',
  targetLocale: 'es',
  context: 'E-commerce homepage',
})

console.log(result.translatedText) // "Bienvenido a nuestra tienda"
console.log(result.confidence) // 0.95
```

##### `batchTranslateMissing(sourceLocale, targetLocale): Promise<BatchResult>`

Auto-translate all missing translations.

```typescript
const result = await translator.batchTranslateMissing('en', 'es')
console.log(`Translated: ${result.translated}`)
console.log(`Skipped: ${result.skipped}`)
console.log(`Errors: ${result.errors.length}`)
```

**Supported Languages:**

- `en` (English)
- `es` (Spanish)
- `fr` (French)
- `de` (German)
- `it` (Italian)
- `pt` (Portuguese)
- `nl` (Dutch)
- `ru` (Russian)
- `ja` (Japanese)
- `ko` (Korean)
- `zh` (Chinese)
- `ar` (Arabic)

---

## 🧠 3. SEO BRAIN SYSTEM

### 200-City Campaign Generator

#### `generate200CityPages(campaignId, productSpec, ollamaClient): Promise<CampaignResult>`

Generate 200 city landing pages.

**Parameters:**

```typescript
interface ProductCampaignSpec {
  productName: string
  quantity: number
  size: string
  material: string
  turnaround: string
  price: number
  onlineOnly: boolean
  keywords: string[]
  industries?: string[]
}

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
    keywords: ['business cards', 'printing'],
  },
  ollamaClient
)

// Result:
// - generated: 200 (number of successful pages)
// - failed: 0
// - results: Array of CityPageGenerationResult
```

**Generation Time:** 6-7 hours for 200 pages

**Cost Estimate:**

- Ollama: $0 (local)
- Google Imagen: ~$8 (400 images)
- Total: ~$8

---

### Performance Analyzer

#### `class PerformanceAnalyzer`

Analyze and optimize city pages.

```typescript
const analyzer = new PerformanceAnalyzer()

// Analyze all pages
const report = await analyzer.analyzeAllPages()

console.log(report.winners) // Top 20% performers
console.log(report.losers) // Bottom 20% underperformers
console.log(report.insights) // AI-generated insights
```

---

### Winner/Loser Detection

#### `class WinnerAnalyzer`

Extract success patterns from top performers.

```typescript
const winnerAnalyzer = new WinnerAnalyzer()

const patterns = await winnerAnalyzer.analyzeWinners()

// Returns:
// - Common keywords
// - Content length patterns
// - Schema types used
// - Conversion triggers
```

#### `class LoserImprover`

Generate improvement options for underperformers.

```typescript
const improver = new LoserImprover()

const options = await improver.generateImprovementOptions(pageId)

// Returns 3 options:
// A: Rewrite intro
// B: Add more benefits
// C: Improve FAQs

// Apply best option
await improver.applyImprovement(pageId, options[0])
```

---

## 🔧 4. UTILITIES

### Redis Cache

#### `class LLMCache`

Cache LLM responses to reduce API costs.

**Constructor:**

```typescript
const cache = new LLMCache(redisUrl?: string)
// Or use singleton:
const cache = getLLMCache()
```

**Methods:**

##### `cachedOllamaGenerate(prompt, options, generator, ttl): Promise<string>`

Cache Ollama generation.

```typescript
const response = await cache.cachedOllamaGenerate(
  'Write product description',
  { temperature: 0.7 },
  async () => {
    return await ollama.generate({ prompt: '...' })
  },
  86400 // Cache for 24 hours
)
```

##### `cachedTranslation(text, sourceLocale, targetLocale, translator, ttl): Promise<TranslationResult>`

Cache translation.

```typescript
const translation = await cache.cachedTranslation(
  'Hello world',
  'en',
  'es',
  async () => {
    return await translator.translate(...)
  },
  604800 // Cache for 7 days
)
```

##### `getStats(): Promise<CacheStats>`

Get cache statistics.

```typescript
const stats = await cache.getStats()

console.log(stats.totalKeys) // Total cached items
console.log(stats.ollamaKeys) // Ollama responses
console.log(stats.translationKeys) // Translations
console.log(stats.memoryUsage) // Redis memory usage
```

---

### Rate Limiter

#### `class APIRateLimiter`

Protect against API rate limits.

**Constructor:**

```typescript
const limiter = new APIRateLimiter(configs?: Partial<ServiceConfig>)
// Or use singleton:
const limiter = getRateLimiter()
```

**Default Limits:**

- **Ollama**: 10 requests/second
- **OpenAI**: 60 requests/minute
- **Google**: 30 requests/minute

**Methods:**

##### `execute<T>(service, operation, context): Promise<T>`

Execute with rate limiting and retry.

```typescript
const response = await limiter.execute(
  'openai',
  async () => {
    return await openai.chat.completions.create(...)
  },
  'openai-translation'
)
```

**Features:**

- Exponential backoff with jitter
- Automatic retries (up to 5 attempts)
- Token bucket algorithm
- Per-service rate limits

---

## 🌐 5. API ROUTES

### Chat API

**Endpoint:** `POST /api/chat`

**Request:**

```json
{
  "message": "How long does shipping take?",
  "conversationHistory": [
    { "role": "user", "content": "Previous message" },
    { "role": "assistant", "content": "Previous response" }
  ]
}
```

**Response:**

```json
{
  "response": "Shipping typically takes 5-7 business days...",
  "needsHuman": false,
  "model": "qwen2.5:32b"
}
```

---

### SEO Brain Campaign API

**Endpoint:** `POST /api/seo-brain/start-campaign`

**Request:**

```json
{
  "productName": "1000 Business Cards",
  "quantity": 1000,
  "size": "3.5x2",
  "material": "16pt Cardstock",
  "turnaround": "5-7 business days",
  "price": 49.99,
  "keywords": ["business cards", "printing"]
}
```

**Response:**

```json
{
  "success": true,
  "campaignId": "campaign-12345",
  "estimatedCompletionTime": "6-7 hours",
  "status": "GENERATING"
}
```

**Check Status:**
`GET /api/seo-brain/campaign-status/:campaignId`

---

### Image Generation API

**Endpoint:** `POST /api/products/generate-image`

**Request:**

```json
{
  "prompt": "Professional product photography of red skateboard",
  "productName": "skateboard-red",
  "aspectRatio": "4:3",
  "imageSize": "2K"
}
```

**Response:**

```json
{
  "success": true,
  "imageUrl": "https://yoursite.com/uploads/skateboard-red.png",
  "generatedAt": "2025-01-23T10:30:00Z"
}
```

---

## 🔐 ENVIRONMENT VARIABLES

### Required

```bash
# Ollama (Local LLM)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5:32b

# Google AI Studio (Images)
GOOGLE_AI_STUDIO_API_KEY=your-key-here

# OpenAI (Translation)
OPENAI_API_KEY=sk-your-key-here

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/db
```

### Optional

```bash
# Redis (Caching)
REDIS_URL=redis://localhost:6379

# Telegram (Notifications)
SEO_BRAIN_TELEGRAM_BOT_TOKEN=bot-token
TELEGRAM_ADMIN_CHAT_ID=chat-id

# Site Config
NEXT_PUBLIC_SITE_URL=https://yoursite.com
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

---

## 📊 PERFORMANCE BENCHMARKS

### Generation Speed

- Single page: 30 seconds
- 10 pages: 5 minutes
- 200 pages: 6-7 hours

### Cache Performance

- First request: 100ms (API call)
- Cached request: 5ms (Redis)
- **Speedup: 20x faster**

### Cost Reduction

- Without cache: $100/month
- With cache (80% hit rate): $20/month
- **Savings: 80%**

---

## 🐛 ERROR CODES

### Common Errors

| Code                  | Message                 | Solution                     |
| --------------------- | ----------------------- | ---------------------------- |
| `OLLAMA_OFFLINE`      | Ollama not responding   | Run `ollama serve`           |
| `REDIS_DISCONNECTED`  | Redis connection failed | Start Redis server           |
| `API_KEY_INVALID`     | Invalid API key         | Check `.env` file            |
| `RATE_LIMIT_EXCEEDED` | Too many requests       | Wait or upgrade tier         |
| `MODEL_NOT_FOUND`     | Model not available     | Run `ollama pull model-name` |

---

## 📚 TYPE DEFINITIONS

All TypeScript types are fully documented in the source files. Import them directly:

```typescript
import type {
  PageMetadata,
  Product,
  Category,
  OllamaGenerateOptions,
  ImageGenerationConfig,
  AutoTranslateOptions,
  ProductCampaignSpec,
} from '@/seo-llm/types'
```

---

**Last Updated: January 2025**

For more examples, see `docs/EXAMPLES.md`
