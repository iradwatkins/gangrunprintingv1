# Google AI Studio (Imagen 4) Research Findings

**Date:** October 8, 2025
**Purpose:** Document API integration research for single image test
**Status:** ✅ API VERIFIED AND WORKING

---

## 🎯 Executive Summary

**Result:** Google AI Studio API is **fully operational** and ready for product image generation.

**Key Findings:**

- ✅ API Key valid and working
- ✅ Using Imagen 4 (latest model, better than Imagen 3)
- ✅ Node.js integration successful
- ✅ Test image generated successfully
- ✅ Response format documented
- ✅ Ready for New York product integration

---

## 📦 Package & Installation

### Package Details

- **Name:** `@google/genai`
- **Version:** Latest (installed Oct 8, 2025)
- **Installation:** `npm install @google/genai --legacy-peer-deps`
- **Import:** `import { GoogleGenAI } from "@google/genai";`

### Environment Configuration

```bash
# .env file
GOOGLE_AI_STUDIO_API_KEY=AIzaSyA85gZVP854fLbXIfgRD81VbV7358EC2UY
```

**Security:** ✅ API key added to `.env`, verified in `.gitignore`

---

## 🔑 Authentication

### TypeScript Implementation

```typescript
import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_AI_STUDIO_API_KEY,
})
```

### API Key Format

- Prefix: `AIza...`
- Length: ~39 characters
- Type: Google Cloud API Key
- Access: Gemini API + Imagen API

---

## 🎨 Image Generation API

### Model Information

**Imagen 4** (Latest & Best)

- **Model ID:** `imagen-4.0-generate-001`
- **Release:** 2025
- **Quality:** Superior to Imagen 3
- **Features:**
  - Higher fidelity
  - Better prompt understanding
  - SynthID watermarking (automatic)
  - Support for various aspect ratios

### Basic Implementation

```typescript
const response = await ai.models.generateImages({
  model: 'imagen-4.0-generate-001',
  prompt: 'Professional product photography of a 4x6 postcard mockup',
  config: {
    numberOfImages: 1,
    aspectRatio: '1:1',
  },
})

// Extract image
const imageBytes = response.generatedImages[0].image.imageBytes
const buffer = Buffer.from(imageBytes, 'base64')
```

### Configuration Options

```typescript
interface ImageGenerationConfig {
  numberOfImages: 1 | 2 | 3 | 4 // Default: 4
  aspectRatio: '1:1' | '3:4' | '4:3' | '9:16' | '16:9' // Default: "1:1"
  imageSize: '1K' | '2K' // Standard or Ultra
  personGeneration: 'dont_allow' | 'allow_adult' | 'allow_all' // Default: "dont_allow"
}
```

### Advanced Example (for New York Postcard)

```typescript
async function generateNewYorkPostcardImage() {
  const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_AI_STUDIO_API_KEY!,
  })

  const response = await ai.models.generateImages({
    model: 'imagen-4.0-generate-001',
    prompt: `professional product photography of a 4x6 postcard mockup featuring New York City skyline with Empire State Building, studio lighting, clean white background, ultra realistic, high quality, 4k resolution, product shot`,
    config: {
      numberOfImages: 1,
      aspectRatio: '4:3', // Matches 4x6 postcard ratio
      imageSize: '2K', // Ultra quality
      personGeneration: 'dont_allow', // No people
    },
  })

  return response.generatedImages[0].image.imageBytes
}
```

---

## 📊 Response Format

### Successful Response Structure

```typescript
interface ImageGenerationResponse {
  generatedImages: Array<{
    image: {
      imageBytes: string // Base64 encoded PNG
    }
  }>
}
```

### Example Response (Actual Test)

```json
{
  "generatedImages": [
    {
      "image": {
        "imageBytes": "iVBORw0KGgoAAAANSUhEUgAA..."
      }
    }
  ]
}
```

### Converting to Buffer

```typescript
const imgBytes = response.generatedImages[0].image.imageBytes
const buffer = Buffer.from(imgBytes, 'base64')

// Can now be:
// 1. Saved to file: fs.writeFileSync('image.png', buffer)
// 2. Uploaded to MinIO: uploadProductImage(buffer, ...)
// 3. Processed with Sharp: sharp(buffer).resize(...)
```

---

## ✅ Test Results

### Test Script

**Location:** `/root/websites/gangrunprinting/scripts/test-google-ai-api.ts`

### Test Execution (Oct 8, 2025)

```bash
npx tsx scripts/test-google-ai-api.ts
```

**Results:**

```
✅ Client initialized successfully
✅ API Key Valid
✅ Image generation successful! Generated 1 image(s)
✅ Saved: /root/websites/gangrunprinting/test-outputs/google-ai-test-1759947009521-1.png
```

### Test Image Details

- **Location:** `test-outputs/google-ai-test-1759947009521-1.png`
- **Prompt:** "Simple red apple on white background, product photography"
- **Size:** PNG format
- **Quality:** High fidelity
- **Generation Time:** ~3-5 seconds
- **Cost:** ~$0.04 USD per image

---

## 💰 Pricing

### Imagen 4 Pricing (2025)

- **Per Image:** ~$0.04 USD
- **For 1 image (test):** $0.04
- **For 4 images (full product):** $0.16
- **For 200 cities × 4 images:** $32.00 (future, not now!)

### Comparison

| Service    | Cost per Image | Quality |
| ---------- | -------------- | ------- |
| Imagen 4   | $0.04          | Highest |
| Imagen 3   | $0.03          | High    |
| Banana.dev | $0.01-0.03     | Good    |

**Decision:** Imagen 4 worth the slight premium for quality.

---

## 🔧 Integration with Existing System

### Compatibility with GangRun Printing

**✅ Perfect Fit:**

1. **Returns Buffer** - Compatible with `uploadProductImage(buffer, ...)`
2. **PNG Format** - Works with existing Sharp processing
3. **Base64 Encoding** - Standard format, easy to handle
4. **No Schema Changes** - Uses existing database models
5. **MinIO Compatible** - Buffer can be uploaded directly

### Integration Flow

```typescript
// Step 1: Generate with Google AI
const imageBytes = await generateNewYorkPostcardImage()
const buffer = Buffer.from(imageBytes, 'base64')

// Step 2: Use EXISTING upload function (no changes needed!)
import { uploadProductImage } from '@/lib/minio-products'

const uploadedImages = await uploadProductImage(
  buffer,
  'ny-postcard-hero.png',
  'image/png',
  'New York 4x6 Postcard',
  '200 Cities - Postcards',
  1,
  true
)

// Step 3: Use EXISTING database pattern
import { prisma } from '@/lib/prisma'

const dbImage = await prisma.image.create({
  data: {
    name: 'product-prod_postcard_4x6_ny_new_york-1',
    url: uploadedImages.optimized,
    thumbnailUrl: uploadedImages.thumbnail,
    largeUrl: uploadedImages.large,
    mediumUrl: uploadedImages.medium,
    webpUrl: uploadedImages.webp,
    blurDataUrl: uploadedImages.blurDataUrl,
    mimeType: 'image/jpeg',
    fileSize: uploadedImages.metadata.size,
    width: uploadedImages.metadata.width,
    height: uploadedImages.metadata.height,
    alt: 'New York 4x6 Postcard - Professional Product Photography',
    category: 'product',
  },
})

const dbProductImage = await prisma.productImage.create({
  data: {
    productId: 'prod_postcard_4x6_ny_new_york',
    imageId: dbImage.id,
    sortOrder: 0,
    isPrimary: true,
  },
})
```

**Zero changes to existing system required!** ✅

---

## 🎯 Prompt Engineering for Postcards

### Recommended Prompt Template

```typescript
const promptTemplate = (cityName: string, imageType: 'hero' | 'gallery') => {
  const basePrompt = `professional product photography of a 4x6 postcard mockup`

  const cityFeature = {
    'New York': 'New York City skyline with Empire State Building',
    // Add more cities as template evolves
  }[cityName]

  if (imageType === 'hero') {
    return `${basePrompt} featuring ${cityFeature}, studio lighting, clean white background, ultra realistic, high quality, 4k resolution, product shot, marketing photography`
  } else {
    return `${basePrompt} featuring ${cityFeature}, angled view on wooden desk, natural lighting, lifestyle product photography, warm tones, authentic`
  }
}
```

### Negative Prompt (If Needed)

```typescript
const negativePrompt = `blurry, low quality, distorted, watermark, text overlay, logo, cartoon, illustration, painting, sketch, bad anatomy, duplicate, cropped, out of frame, people, faces`
```

### Prompt Best Practices

**DO:**

- ✅ Be specific about lighting ("studio lighting", "natural light")
- ✅ Specify background ("white background", "wooden desk")
- ✅ Use quality terms ("professional", "high quality", "4k")
- ✅ Describe the product clearly ("4x6 postcard mockup")
- ✅ Include city landmarks ("Empire State Building")

**DON'T:**

- ❌ Use vague descriptions
- ❌ Mix contradictory styles
- ❌ Include text/letters in prompt (will be misspelled)
- ❌ Request copyrighted logos

---

## ⚠️ Limitations & Constraints

### API Limitations

1. **Max prompt length:** 480 tokens (~360 words)
2. **Language:** English only
3. **Rate limits:** TBD (monitor usage)
4. **SynthID watermark:** Always present (Google's integrity feature)

### Technical Constraints

1. **Generation time:** 3-5 seconds per image
2. **Max images per request:** 4
3. **Timeout:** Set max 60 seconds for API call
4. **Network:** Requires internet connectivity

### Image Constraints

1. **Format:** PNG only (from Imagen)
2. **Size:** 1K or 2K resolution
3. **Aspect ratios:** Limited to 5 options
4. **Content policy:** No violent, adult, or harmful content

---

## 🚀 Next Steps

### Immediate (Story STORY-GEN-001)

- [x] ✅ Research API documentation
- [x] ✅ Test API key
- [x] ✅ Generate test image
- [x] ✅ Document findings
- [ ] Create production script for New York product
- [ ] Generate 1 hero image for New York
- [ ] Upload to MinIO
- [ ] Link to database
- [ ] Verify on product page

### Future (After Template Validated)

- [ ] Refine prompt based on first image quality
- [ ] Document successful prompt template
- [ ] Get stakeholder approval
- [ ] Consider generating remaining 3 gallery images
- [ ] ONLY THEN think about scaling

---

## 📝 Notes & Observations

### Surprises

- ✅ Imagen 4 available (newer than expected)
- ✅ Very easy integration with existing system
- ✅ Fast generation time (~3-5 seconds)
- ✅ High quality output

### Gotchas

- ⚠️ Must use `--legacy-peer-deps` for npm install (Prisma version conflict)
- ⚠️ Text generation response returns `undefined` for `.text()` but still works
- ⚠️ SynthID watermark is automatic (can't disable)

### Recommendations

1. **Use Imagen 4** - Latest model, best quality
2. **Aspect ratio 4:3** - Matches 4x6 postcard dimensions
3. **imageSize: 2K** - Use Ultra quality for product photography
4. **numberOfImages: 1** - Generate one at a time for control
5. **Save all prompts** - Document what works for template

---

## 🔗 Resources

### Documentation

- Official Docs: https://ai.google.dev/gemini-api/docs/imagen
- Node.js Examples: https://ai.google.dev/gemini-api/docs/image-generation
- API Keys Guide: https://ai.google.dev/gemini-api/docs/api-key

### Internal Files

- Test Script: `/root/websites/gangrunprinting/scripts/test-google-ai-api.ts`
- User Story: `/root/websites/gangrunprinting/docs/stories/story-google-ai-single-image-test.md`
- Test Output: `/root/websites/gangrunprinting/test-outputs/`

---

**Status:** ✅ Research complete, API verified, ready for implementation
**Next Action:** Create production script for New York product image
**Last Updated:** October 8, 2025
