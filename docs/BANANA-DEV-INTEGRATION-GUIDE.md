# 🍌 Banana.dev API Integration Guide

## Complete Reference for GangRun Printing Image Generation

**Document Version:** 1.0
**Last Updated:** October 8, 2025
**Purpose:** Integrate Banana.dev for automated product image generation
**Tech Stack:** Node.js + TypeScript + Banana.dev REST API

---

## 📚 TABLE OF CONTENTS

1. [What is Banana.dev?](#what-is-bananadev)
2. [Why Banana.dev for GangRun](#why-bananadev-for-gangrun)
3. [Setup & Authentication](#setup--authentication)
4. [Node.js SDK Integration](#nodejs-sdk-integration)
5. [REST API Integration](#rest-api-integration)
6. [Stable Diffusion Deployment](#stable-diffusion-deployment)
7. [Image Generation for Postcards](#image-generation-for-postcards)
8. [Production Implementation](#production-implementation)
9. [Cost Analysis](#cost-analysis)
10. [Alternative Solutions](#alternative-solutions)

---

## 🎯 WHAT IS BANANA.DEV?

**Banana.dev** is a **serverless GPU infrastructure platform** for deploying and scaling machine learning models, particularly for inference tasks like image generation.

### Key Features:

- ✅ Serverless GPU autoscaling
- ✅ Pay-per-inference pricing
- ✅ Pre-built models (Stable Diffusion, etc.)
- ✅ Custom model deployment via GitHub
- ✅ REST API + SDKs (Python, Node.js)
- ✅ CI/CD integration
- ✅ Real-time monitoring & logs

### Model Types Supported:

- 🎨 **Image Generation** (Stable Diffusion, DALL-E alternatives)
- 🖼️ **Image-to-Image** (style transfer, upscaling)
- 📝 **Text Generation** (LLMs)
- 🗣️ **Speech Processing**
- 📊 **Custom ML Models**

---

## 💡 WHY BANANA.DEV FOR GANGRUN?

### Use Case: Generate Product Images for 200 City Products

**Goal:** Automatically generate 5 high-quality images per city product

- Hero image (4x6 postcard mockup)
- Gallery images (angles, in-use shots)
- City-themed backgrounds
- Professional product photography style

### Why Banana.dev vs Alternatives?

| Feature                | Banana.dev | Replicate | AWS SageMaker | Local GPU |
| ---------------------- | ---------- | --------- | ------------- | --------- |
| **Serverless**         | ✅         | ✅        | ❌            | ❌        |
| **Pay-per-use**        | ✅         | ✅        | ❌            | ❌        |
| **Pre-built SD**       | ✅         | ✅        | ❌            | ✅        |
| **Easy Deployment**    | ✅         | ✅        | ❌            | ❌        |
| **Node.js SDK**        | ✅         | ✅        | ✅            | N/A       |
| **Cost (1000 images)** | ~$10-20    | ~$10-20   | ~$50+         | Free\*    |

**Verdict:** ✅ Banana.dev is perfect for serverless, on-demand image generation.

---

## 🔐 SETUP & AUTHENTICATION

### Step 1: Create Banana.dev Account

1. Visit [https://www.banana.dev/](https://www.banana.dev/)
2. Sign up with email or GitHub
3. Navigate to **Dashboard**

### Step 2: Get API Key

1. Go to **Settings** or **API Keys** section
2. Generate new API key
3. Copy and save securely

**Format:**

```
apiKey: "banana_xxxxxxxxxxxxxxxxxxxxxxxxxx"
```

### Step 3: Deploy or Select a Model

**Option A: Use Pre-built Stable Diffusion**

- Go to Dashboard → Deploy Model
- Select "Stable Diffusion" from templates
- Deploy in ~13 seconds
- Get `modelKey` from deployment

**Option B: Deploy Custom Model**

- Fork GitHub template: [https://github.com/bananaml/serverless-template-stable-diffusion](https://github.com/bananaml/serverless-template-stable-diffusion)
- Connect GitHub to Banana
- Deploy from your repo
- Get `modelKey` from deployment

### Step 4: Store Credentials Securely

**In `.env` file:**

```bash
BANANA_API_KEY=banana_xxxxxxxxxxxxxxxxxxxxxxxxxx
BANANA_MODEL_KEY=your_model_key_here
```

**IMPORTANT:** Add `.env` to `.gitignore` - never commit API keys!

---

## 📦 NODE.JS SDK INTEGRATION

### Installation

```bash
npm install @banana-dev/banana-dev
# or
yarn add @banana-dev/banana-dev
```

**Version:** 6.2.0 (last published 2 years ago)
**Note:** Package may be dated but still functional for basic use.

### Basic Usage (JavaScript)

```javascript
const banana = require('@banana-dev/banana-dev')

const apiKey = process.env.BANANA_API_KEY
const modelKey = process.env.BANANA_MODEL_KEY

const modelInputs = {
  prompt:
    'professional 4x6 postcard mockup, New York City skyline, high quality product photography',
  num_inference_steps: 50,
  guidance_scale: 7.5,
  width: 512,
  height: 512,
}

async function generateImage() {
  try {
    const output = await banana.run(apiKey, modelKey, modelInputs)
    console.log('Image generated:', output)
    return output
  } catch (error) {
    console.error('Error generating image:', error)
    throw error
  }
}

generateImage()
```

### TypeScript Usage

```typescript
import banana = require('@banana-dev/banana-dev')

interface BananaOutput {
  id: string
  message: string
  created: number
  apiVersion: string
  modelOutputs: Array<{
    image_base64?: string
    image_url?: string
  }>
}

const apiKey: string = process.env.BANANA_API_KEY!
const modelKey: string = process.env.BANANA_MODEL_KEY!

interface StableDiffusionInput {
  prompt: string
  negative_prompt?: string
  num_inference_steps?: number
  guidance_scale?: number
  width?: number
  height?: number
  seed?: number
}

async function generatePostcardImage(cityName: string): Promise<BananaOutput> {
  const modelInputs: StableDiffusionInput = {
    prompt: `professional 4x6 postcard mockup featuring ${cityName}, product photography, high quality, studio lighting, realistic`,
    negative_prompt: 'blurry, low quality, distorted, watermark',
    num_inference_steps: 50,
    guidance_scale: 7.5,
    width: 512,
    height: 512,
    seed: Math.floor(Math.random() * 1000000),
  }

  try {
    const output = (await banana.run(apiKey, modelKey, modelInputs)) as BananaOutput
    return output
  } catch (error) {
    console.error(`Error generating image for ${cityName}:`, error)
    throw error
  }
}

// Usage
;(async () => {
  const result = await generatePostcardImage('New York')
  console.log('Generated image:', result.modelOutputs[0].image_url)
})()
```

### Response Format

```typescript
{
  "id": "12345678-1234-1234-1234-123456789012",
  "message": "success",
  "created": 1649712752,
  "apiVersion": "26 Nov 2021",
  "modelOutputs": [
    {
      "image_base64": "iVBORw0KGgoAAAANSUhEUgAA...", // Base64 encoded image
      "image_url": "https://...", // Or direct URL
      "seed": 123456,
      "nsfw_content_detected": false
    }
  ]
}
```

---

## 🌐 REST API INTEGRATION

If you prefer not to use the SDK, use the REST API directly:

### Endpoint

```
POST https://api.banana.dev/start/v4/
```

### Headers

```
Content-Type: application/json
```

### Request Body

```json
{
  "apiKey": "YOUR_API_KEY",
  "modelKey": "YOUR_MODEL_KEY",
  "modelInputs": {
    "prompt": "professional 4x6 postcard mockup, New York City",
    "num_inference_steps": 50,
    "guidance_scale": 7.5,
    "width": 512,
    "height": 512
  }
}
```

### Example with `fetch()` (TypeScript)

```typescript
async function generateImageViaAPI(prompt: string): Promise<string> {
  const response = await fetch('https://api.banana.dev/start/v4/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      apiKey: process.env.BANANA_API_KEY,
      modelKey: process.env.BANANA_MODEL_KEY,
      modelInputs: {
        prompt: prompt,
        num_inference_steps: 50,
        guidance_scale: 7.5,
        width: 1024,
        height: 768,
      },
    }),
  })

  if (!response.ok) {
    throw new Error(`Banana API error: ${response.statusText}`)
  }

  const data = await response.json()
  return data.modelOutputs[0].image_url || data.modelOutputs[0].image_base64
}
```

### Error Handling

```typescript
try {
  const imageUrl = await generateImageViaAPI(prompt)
  console.log('Success:', imageUrl)
} catch (error) {
  if (error.response) {
    // API returned an error
    console.error('API Error:', error.response.status, error.response.data)
  } else if (error.request) {
    // Request made but no response
    console.error('Network Error:', error.message)
  } else {
    // Other errors
    console.error('Error:', error.message)
  }
}
```

---

## 🚀 STABLE DIFFUSION DEPLOYMENT

### Pre-built Deployment (Fastest - 13 seconds)

1. Login to Banana Dashboard
2. Click "Deploy Model"
3. Select "Stable Diffusion" template
4. Click "Deploy"
5. Copy `modelKey` from deployment details

**That's it!** You now have a serverless Stable Diffusion API.

### Custom Deployment (Advanced)

**Step 1: Fork Template**

```bash
git clone https://github.com/bananaml/serverless-template-stable-diffusion.git
cd serverless-template-stable-diffusion
```

**Step 2: Get Hugging Face Token**

- Create account at [https://huggingface.co/](https://huggingface.co/)
- Go to Settings → Access Tokens
- Create token with "Read" permissions
- Accept Stable Diffusion model license

**Step 3: Edit Dockerfile**

```dockerfile
# Add your Hugging Face token
ENV HF_AUTH_TOKEN=your_hf_token_here
```

**Step 4: Push to GitHub**

```bash
git add .
git commit -m "Add HF token"
git push origin main
```

**Step 5: Deploy on Banana**

- Connect GitHub account to Banana
- Select your repository
- Banana will auto-detect and deploy

---

## 🎨 IMAGE GENERATION FOR POSTCARDS

### Requirements for 4x6 Postcard Images

**Specifications:**

- **Size:** 1200x800px (hero), 800x800px (gallery)
- **Format:** PNG with transparency or JPG
- **Quality:** High resolution, 300 DPI equivalent
- **Style:** Professional product photography
- **Context:** Postcard mockup with city-themed elements

### Prompt Engineering for Postcards

**Good Prompts:**

```typescript
const prompts = {
  hero: 'professional product photography of a 4x6 postcard mockup, ${cityName} iconic landmark in background, studio lighting, clean white background, high quality, ultra realistic, 4k resolution',

  gallery1:
    'close-up detail shot of ${cityName} postcard, premium cardstock texture visible, slight shadow, professional lighting, product photography',

  gallery2:
    'angled view of ${cityName} postcard on wooden desk, natural lighting, coffee cup nearby, lifestyle product photography, warm tones',

  gallery3:
    '${cityName} postcard held in hand, outdoor setting with city in soft focus background, natural light, authentic feel',

  gallery4:
    'stack of ${cityName} postcards fanned out, showing multiple designs, professional product photography, clean background',
}
```

**Negative Prompts (what to avoid):**

```typescript
const negativePrompt =
  'blurry, low quality, distorted, watermark, text overlay, logo, cartoon, illustration, painting, sketch, bad anatomy, duplicate, cropped, out of frame'
```

### Generation Script for One City

```typescript
// scripts/generate-city-images.ts
import { generatePostcardImage, uploadToMinIO } from '@/lib/image-generation'
import { prisma } from '@/lib/prisma'

interface ImageGenerationResult {
  url: string
  isPrimary: boolean
  sortOrder: number
}

async function generateImagesForCity(
  productId: string,
  cityName: string
): Promise<ImageGenerationResult[]> {
  const prompts = [
    {
      text: `professional product photography of a 4x6 postcard mockup, ${cityName} iconic landmark, studio lighting, high quality`,
      isPrimary: true,
      sortOrder: 0,
    },
    {
      text: `close-up detail shot of ${cityName} postcard, premium cardstock, professional lighting`,
      isPrimary: false,
      sortOrder: 1,
    },
    {
      text: `angled view of ${cityName} postcard on desk, natural lighting, lifestyle photography`,
      isPrimary: false,
      sortOrder: 2,
    },
    {
      text: `${cityName} postcard held in hand, outdoor setting, natural light`,
      isPrimary: false,
      sortOrder: 3,
    },
  ]

  const results: ImageGenerationResult[] = []

  for (const prompt of prompts) {
    try {
      // Generate image with Banana.dev
      const bananaOutput = await generatePostcardImage(prompt.text)
      const imageData = bananaOutput.modelOutputs[0].image_base64

      // Upload to MinIO
      const imageUrl = await uploadToMinIO(imageData, `products/${productId}/${Date.now()}.png`)

      // Save to database
      await prisma.productImage.create({
        data: {
          productId: productId,
          url: imageUrl,
          isPrimary: prompt.isPrimary,
          sortOrder: prompt.sortOrder,
          altText: `${cityName} 4x6 Postcard - ${prompt.isPrimary ? 'Main' : 'Gallery'}`,
        },
      })

      results.push({
        url: imageUrl,
        isPrimary: prompt.isPrimary,
        sortOrder: prompt.sortOrder,
      })

      console.log(`✅ Generated image ${prompt.sortOrder + 1}/4 for ${cityName}`)

      // Rate limiting - wait 2 seconds between generations
      await new Promise((resolve) => setTimeout(resolve, 2000))
    } catch (error) {
      console.error(`❌ Failed to generate image for ${cityName}:`, error)
      throw error
    }
  }

  return results
}

// Usage
const productId = 'prod_postcard_4x6_ny_new_york'
const cityName = 'New York'
generateImagesForCity(productId, cityName)
  .then((results) => console.log('All images generated:', results))
  .catch((error) => console.error('Generation failed:', error))
```

---

## 🏭 PRODUCTION IMPLEMENTATION

### Complete Integration Architecture

```typescript
// lib/image-generation/banana-client.ts
import banana = require('@banana-dev/banana-dev')

export interface BananaConfig {
  apiKey: string
  modelKey: string
}

export interface ImageGenerationOptions {
  prompt: string
  negativePrompt?: string
  width?: number
  height?: number
  steps?: number
  guidanceScale?: number
  seed?: number
}

export class BananaImageGenerator {
  private config: BananaConfig

  constructor(config: BananaConfig) {
    this.config = config
  }

  async generateImage(
    options: ImageGenerationOptions
  ): Promise<{ image_base64: string; seed: number }> {
    const modelInputs = {
      prompt: options.prompt,
      negative_prompt: options.negativePrompt || 'blurry, low quality',
      width: options.width || 1024,
      height: options.height || 768,
      num_inference_steps: options.steps || 50,
      guidance_scale: options.guidanceScale || 7.5,
      seed: options.seed || Math.floor(Math.random() * 1000000),
    }

    try {
      const output = await banana.run(this.config.apiKey, this.config.modelKey, modelInputs)

      if (output.message !== 'success') {
        throw new Error(`Banana API error: ${output.message}`)
      }

      return output.modelOutputs[0]
    } catch (error) {
      console.error('Banana image generation error:', error)
      throw new Error(`Failed to generate image: ${error.message}`)
    }
  }

  async generateBatch(prompts: string[], batchSize: number = 5): Promise<string[]> {
    const results: string[] = []

    for (let i = 0; i < prompts.length; i += batchSize) {
      const batch = prompts.slice(i, i + batchSize)
      const batchPromises = batch.map((prompt) => this.generateImage({ prompt }))

      const batchResults = await Promise.all(batchPromises)
      results.push(...batchResults.map((r) => r.image_base64))

      // Rate limiting between batches
      if (i + batchSize < prompts.length) {
        await new Promise((resolve) => setTimeout(resolve, 5000))
      }
    }

    return results
  }
}

// Usage
const generator = new BananaImageGenerator({
  apiKey: process.env.BANANA_API_KEY!,
  modelKey: process.env.BANANA_MODEL_KEY!,
})

const result = await generator.generateImage({
  prompt: 'professional 4x6 postcard mockup, New York City',
  width: 1200,
  height: 800,
})
```

### MinIO Upload Integration

```typescript
// lib/image-generation/minio-upload.ts
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

const s3Client = new S3Client({
  endpoint: process.env.MINIO_ENDPOINT,
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY!,
    secretAccessKey: process.env.MINIO_SECRET_KEY!,
  },
  forcePathStyle: true,
})

export async function uploadBase64ToMinIO(
  base64Data: string,
  fileName: string,
  bucketName: string = 'product-images'
): Promise<string> {
  // Remove data:image/png;base64, prefix if present
  const base64Image = base64Data.replace(/^data:image\/\w+;base64,/, '')
  const buffer = Buffer.from(base64Image, 'base64')

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: fileName,
    Body: buffer,
    ContentType: 'image/png',
    ACL: 'public-read',
  })

  try {
    await s3Client.send(command)
    const publicUrl = `${process.env.MINIO_PUBLIC_URL}/${bucketName}/${fileName}`
    return publicUrl
  } catch (error) {
    console.error('MinIO upload error:', error)
    throw new Error(`Failed to upload to MinIO: ${error.message}`)
  }
}
```

### Complete Script for New York Product

```typescript
// scripts/add-images-to-new-york-product.ts
import { BananaImageGenerator } from '@/lib/image-generation/banana-client'
import { uploadBase64ToMinIO } from '@/lib/image-generation/minio-upload'
import { prisma } from '@/lib/prisma'

async function addImagesToNewYorkProduct() {
  const productId = 'prod_postcard_4x6_ny_new_york'
  const cityName = 'New York'

  const generator = new BananaImageGenerator({
    apiKey: process.env.BANANA_API_KEY!,
    modelKey: process.env.BANANA_MODEL_KEY!,
  })

  const imagePrompts = [
    {
      prompt: `professional product photography of a 4x6 postcard mockup featuring New York City skyline, Empire State Building, studio lighting, white background, ultra realistic, 4k, high quality`,
      isPrimary: true,
      sortOrder: 0,
      width: 1200,
      height: 800,
    },
    {
      prompt: `close-up macro shot of New York City postcard on premium 16pt cardstock, showing texture and quality, professional product photography, soft shadow`,
      isPrimary: false,
      sortOrder: 1,
      width: 800,
      height: 800,
    },
    {
      prompt: `angled 45-degree view of New York postcard on wooden desk with coffee, natural window lighting, lifestyle product photography, warm tones`,
      isPrimary: false,
      sortOrder: 2,
      width: 800,
      height: 800,
    },
    {
      prompt: `hand holding New York City postcard with Manhattan skyline blurred in background, outdoor photography, golden hour lighting, authentic`,
      isPrimary: false,
      sortOrder: 3,
      width: 800,
      height: 800,
    },
  ]

  console.log(`🚀 Starting image generation for ${cityName} product...`)

  for (const imagePrompt of imagePrompts) {
    try {
      console.log(`📸 Generating image ${imagePrompt.sortOrder + 1}/4...`)

      // Generate with Banana.dev
      const result = await generator.generateImage({
        prompt: imagePrompt.prompt,
        negativePrompt: 'blurry, low quality, distorted, watermark, text, bad anatomy',
        width: imagePrompt.width,
        height: imagePrompt.height,
        steps: 50,
        guidanceScale: 7.5,
      })

      console.log(`💾 Uploading to MinIO...`)

      // Upload to MinIO
      const fileName = `${productId}/image-${imagePrompt.sortOrder}-${Date.now()}.png`
      const imageUrl = await uploadBase64ToMinIO(result.image_base64, fileName)

      console.log(`💿 Saving to database...`)

      // Save to database
      await prisma.productImage.create({
        data: {
          productId: productId,
          url: imageUrl,
          isPrimary: imagePrompt.isPrimary,
          sortOrder: imagePrompt.sortOrder,
          altText: `${cityName} 4x6 Postcard${imagePrompt.isPrimary ? '' : ' - Gallery Image ' + imagePrompt.sortOrder}`,
        },
      })

      console.log(`✅ Image ${imagePrompt.sortOrder + 1}/4 complete: ${imageUrl}`)

      // Rate limiting
      await new Promise((resolve) => setTimeout(resolve, 3000))
    } catch (error) {
      console.error(`❌ Failed to generate image ${imagePrompt.sortOrder + 1}:`, error)
      // Continue with next image even if one fails
    }
  }

  console.log(`✅ All images generated for ${cityName} product!`)
}

// Run the script
addImagesToNewYorkProduct()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Script failed:', error)
    process.exit(1)
  })
```

### Run the Script

```bash
npx tsx scripts/add-images-to-new-york-product.ts
```

---

## 💰 COST ANALYSIS

### Banana.dev Pricing (Estimated)

**Pricing Model:** Pay-per-inference

- **Cold start:** ~$0.002-0.005 per inference
- **Warm inference:** ~$0.001-0.003 per inference
- **GPU Time:** Billed per second

**For 200 Cities × 5 Images = 1,000 Images:**

- **Estimated Cost:** $10-30 total
- **Time:** ~30-60 minutes (with rate limiting)

**Monthly Costs (if regenerating frequently):**

- **Light usage (100 images/month):** ~$1-3
- **Medium usage (1,000 images/month):** ~$10-30
- **Heavy usage (10,000 images/month):** ~$100-300

**Free Tier:** Check Banana.dev dashboard for current free tier limits.

---

## 🔄 ALTERNATIVE SOLUTIONS

### If Banana.dev Doesn't Work Out

**1. Replicate.com**

- Similar serverless GPU platform
- Pre-built Stable Diffusion models
- Pay-per-use pricing (~$0.01/image)
- Node.js SDK available
- [https://replicate.com/](https://replicate.com/)

**2. Stability AI Official API**

- Direct from Stable Diffusion creators
- Stable Diffusion 3 API
- $0.01-0.04 per image
- [https://platform.stability.ai/](https://platform.stability.ai/)

**3. Hugging Face Inference API**

- Free tier available
- Community-hosted models
- May have rate limits
- [https://huggingface.co/inference-api](https://huggingface.co/inference-api)

**4. RunPod.io**

- Serverless GPU rentals
- Deploy your own models
- $0.0002/second pricing
- More control, more setup
- [https://www.runpod.io/](https://www.runpod.io/)

**5. Local Generation (If Budget Allows)**

- One-time GPU purchase (~$500-2000)
- Unlimited generations
- Requires setup and maintenance
- Best for high-volume needs

---

## ✅ NEXT STEPS

### Phase 1: Test Banana.dev (Today)

1. [ ] Sign up for Banana.dev account
2. [ ] Get API key and model key
3. [ ] Deploy Stable Diffusion model
4. [ ] Test with single image generation
5. [ ] Verify image quality meets standards

### Phase 2: Integrate with GangRun (Tomorrow)

1. [ ] Install `@banana-dev/banana-dev` package
2. [ ] Create `lib/image-generation/` directory
3. [ ] Implement `BananaImageGenerator` class
4. [ ] Test MinIO upload integration
5. [ ] Create test script for New York product

### Phase 3: Generate New York Images (Day 3)

1. [ ] Run `add-images-to-new-york-product.ts`
2. [ ] Verify images uploaded to MinIO
3. [ ] Check images linked to product in database
4. [ ] View product page - confirm images display
5. [ ] Validate image quality

### Phase 4: Document & Optimize (Day 4)

1. [ ] Document working prompts
2. [ ] Optimize generation parameters
3. [ ] Create reusable template
4. [ ] Test batch generation (5 cities)
5. [ ] Calculate actual costs

### Phase 5: Scale to 200 Cities (Future)

- [ ] Create bulk generation script
- [ ] Implement error handling & retries
- [ ] Add progress tracking
- [ ] Run overnight batch job
- [ ] Validate all 1,000 images

---

## 📞 SUPPORT & RESOURCES

**Banana.dev:**

- Dashboard: [https://app.banana.dev/](https://app.banana.dev/)
- Docs: [https://docs.banana.dev/](https://docs.banana.dev/)
- GitHub: [https://github.com/bananaml](https://github.com/bananaml)

**Stable Diffusion:**

- Hugging Face: [https://huggingface.co/stabilityai/stable-diffusion-2-1](https://huggingface.co/stabilityai/stable-diffusion-2-1)
- Prompt Guide: [https://stable-diffusion-art.com/prompt-guide/](https://stable-diffusion-art.com/prompt-guide/)

**Alternative APIs:**

- Replicate: [https://replicate.com/docs](https://replicate.com/docs)
- Stability AI: [https://platform.stability.ai/docs](https://platform.stability.ai/docs)

---

**End of Integration Guide**

**Status:** Ready for implementation
**Next Action:** Sign up for Banana.dev and get API keys
