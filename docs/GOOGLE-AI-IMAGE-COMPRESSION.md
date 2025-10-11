# Google AI Image Compression Guide

## Overview

This guide covers image compression for **Google AI APIs** (Imagen & Gemini Vision).

### API Limits

| API                  | Max Request Size | Recommended Compressed Size |
| -------------------- | ---------------- | --------------------------- |
| Google Imagen        | ~20 MB           | 15 MB (safe limit)          |
| Google Gemini Vision | 20 MB total      | 15 MB per image             |

---

## Quick Start for Google AI

### Using with Imagen (Image Generation)

```typescript
import { GoogleAIImageGenerator } from '@/lib/image-generation'
import { compressWithRetry } from '@/lib/image-compression'

// Generate image
const generator = new GoogleAIImageGenerator()
const result = await generator.generateImage({
  prompt: 'Professional product photography of a postcard',
  config: { aspectRatio: '4:3', imageSize: '2K' },
})

// Compress for further processing (optional)
const compressed = await compressWithRetry(result.buffer, {
  targetAPI: 'google-imagen', // 20 MB limit
  initialQuality: 85, // Higher quality allowed
})

console.log(`Final size: ${compressed.sizeMB} MB`)
```

### Using with Gemini Vision (Image Analysis)

```typescript
import { GoogleGenAI } from '@google/genai'
import { compressWithRetry } from '@/lib/image-compression'

const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_STUDIO_API_KEY })

// Load and compress image
const imageBuffer = fs.readFileSync('large-image.jpg')
const compressed = await compressWithRetry(imageBuffer, {
  targetAPI: 'google-gemini', // 20 MB total request limit
  maxDimension: 2048, // Gemini can handle larger images
  initialQuality: 90, // Maintain high quality
})

// Send to Gemini
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })
const result = await model.generateContent([
  {
    inlineData: {
      data: compressed.base64,
      mimeType: 'image/jpeg',
    },
  },
  'Describe this image in detail.',
])
```

---

## Configuration Options for Google AI

### Recommended Settings

```typescript
// For Google Imagen (generated images)
const imagenOptions = {
  targetAPI: 'google-imagen',
  maxDimension: 1920,
  initialQuality: 85,
  minQuality: 60,
}

// For Google Gemini Vision (image analysis)
const geminiOptions = {
  targetAPI: 'google-gemini',
  maxDimension: 2048, // Can handle larger images
  initialQuality: 90, // Maintain high quality for analysis
  minQuality: 70,
}

// For large batches (conservative)
const batchOptions = {
  targetAPI: 'google-imagen',
  maxDimension: 1536,
  initialQuality: 80,
  aggressive: true,
}
```

---

## Image Size Optimization Strategy

### 1. For Generated Images (Imagen Output)

Imagen generates high-quality images that may be large. Compress them if:

- Storing in database
- Sending to another API (e.g., Gemini for analysis)
- Serving over slow networks

```typescript
// Generate with Imagen
const result = await generator.generateImage({ prompt })

// Check if compression needed
if (result.buffer.length > 5 * 1024 * 1024) {
  // > 5 MB
  const compressed = await compressWithRetry(result.buffer, {
    targetAPI: 'google-imagen',
    initialQuality: 85,
  })
  // Use compressed.buffer
} else {
  // Use result.buffer directly
}
```

### 2. For Input Images (Sending to Gemini)

Always compress user-uploaded images before sending to Gemini:

```typescript
// User uploads large image
const userImage = await uploadHandler()

// Always compress to ensure it fits in 20 MB total request
const compressed = await compressWithRetry(userImage, {
  targetAPI: 'google-gemini',
  maxDimension: 2048,
})

// Safe to send now
await geminiModel.generateContent([compressed.base64, 'Analyze this'])
```

---

## Common Use Cases

### Use Case 1: Generate and Save Images

```typescript
import { GoogleAIImageGenerator } from '@/lib/image-generation'
import { compressWithRetry } from '@/lib/image-compression'
import fs from 'fs'

async function generateAndSave(prompt: string, outputPath: string) {
  const generator = new GoogleAIImageGenerator()

  // Generate
  console.log('Generating image...')
  const result = await generator.generateImage({ prompt })

  // Compress for storage
  console.log('Compressing for storage...')
  const compressed = await compressWithRetry(result.buffer, {
    targetAPI: 'google-imagen',
    initialQuality: 85,
  })

  // Save
  fs.writeFileSync(outputPath, compressed.buffer)
  console.log(`Saved: ${compressed.sizeMB} MB`)
}
```

### Use Case 2: Generate, Analyze, and Store

```typescript
async function generateAnalyzeStore(prompt: string) {
  const generator = new GoogleAIImageGenerator()
  const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_STUDIO_API_KEY })

  // Step 1: Generate image
  const generated = await generator.generateImage({ prompt })

  // Step 2: Compress for Gemini analysis
  const compressed = await compressWithRetry(generated.buffer, {
    targetAPI: 'google-gemini',
    maxDimension: 2048,
  })

  // Step 3: Analyze with Gemini
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })
  const analysis = await model.generateContent([
    { inlineData: { data: compressed.base64, mimeType: 'image/jpeg' } },
    'Describe this image and rate its quality 1-10.',
  ])

  console.log('Analysis:', analysis.response.text())

  // Step 4: Store if quality passes
  const qualityScore = extractScore(analysis.response.text())
  if (qualityScore >= 7) {
    await saveToDatabase(compressed.buffer, prompt)
  }
}
```

### Use Case 3: Batch Process City Images

```typescript
import { compressWithRetry, API_LIMITS } from '@/lib/image-compression'

async function batchGenerateCityImages(cities: string[]) {
  const generator = new GoogleAIImageGenerator()
  const results = []

  for (const city of cities) {
    console.log(`Processing: ${city}`)

    // Generate
    const generated = await generator.generateCityImage({
      cityName: city,
      imageType: 'hero',
    })

    // Compress
    const compressed = await compressWithRetry(generated.buffer, {
      targetAPI: 'google-imagen',
      maxDimension: 1920,
      initialQuality: 80,
    })

    results.push({
      city,
      size: compressed.sizeMB,
      dimensions: compressed.dimensions,
    })

    // Save
    fs.writeFileSync(`output/${city}.jpg`, compressed.buffer)

    // Rate limiting
    await new Promise((resolve) => setTimeout(resolve, 2000))
  }

  console.log('Batch complete:', results)
}
```

---

## Performance Tips

### 1. Skip Compression When Not Needed

```typescript
const MIN_COMPRESSION_SIZE = 3 * 1024 * 1024 // 3 MB

if (imageBuffer.length < MIN_COMPRESSION_SIZE) {
  console.log('Image already small, skipping compression')
  // Use imageBuffer directly
} else {
  const compressed = await compressWithRetry(imageBuffer)
  // Use compressed.buffer
}
```

### 2. Adjust Quality Based on Use Case

```typescript
// For display (high quality)
const displayImage = await compressWithRetry(buffer, {
  targetAPI: 'google-imagen',
  initialQuality: 90,
  minQuality: 75,
})

// For analysis (medium quality OK)
const analysisImage = await compressWithRetry(buffer, {
  targetAPI: 'google-gemini',
  initialQuality: 80,
  minQuality: 60,
})

// For thumbnails (low quality OK)
const thumbnail = await compressWithRetry(buffer, {
  maxDimension: 512,
  initialQuality: 70,
  minQuality: 40,
})
```

### 3. Parallel Processing

```typescript
const cities = ['New York', 'Los Angeles', 'Chicago']

// Generate all in parallel
const generated = await Promise.all(
  cities.map((city) => generator.generateCityImage({ cityName: city, imageType: 'hero' }))
)

// Compress all in parallel
const compressed = await Promise.all(
  generated.map((img) => compressWithRetry(img.buffer, { targetAPI: 'google-imagen' }))
)

console.log(`Processed ${compressed.length} images`)
```

---

## Error Handling

### Handle Compression Failures

```typescript
import { compressWithRetry, formatBytes } from '@/lib/image-compression'

async function safeCompress(buffer: Buffer) {
  try {
    return await compressWithRetry(buffer, {
      targetAPI: 'google-gemini',
    })
  } catch (error) {
    console.error('Compression failed:', error.message)

    // Try with more aggressive settings
    try {
      console.log('Retrying with aggressive compression...')
      return await compressWithRetry(buffer, {
        aggressive: true,
        maxDimension: 1280,
        initialQuality: 60,
        minQuality: 20,
      })
    } catch (retryError) {
      console.error('Aggressive compression also failed')
      console.log(`Original size: ${formatBytes(buffer.length)}`)
      throw new Error('Image too large to compress. Please use a smaller source image.')
    }
  }
}
```

---

## Testing

### Test Script

Run the updated test script:

```bash
npx tsx scripts/test-new-prompt.ts
```

Expected output:

```
🧪 Testing New Office/Print Shop Prompt
======================================================================

📝 NEW PROMPT:
----------------------------------------------------------------------
Professional marketing photography of a 4x6 postcard...
----------------------------------------------------------------------

🎨 Generating image with NEW prompt...
⏱️  This may take 5-10 seconds...

✅ Image generated successfully!
   Buffer size: 3.45 MB
   Generated at: 2025-10-08T...

🗜️  Compressing image for optimal size...
📊 Original image: 2048x1536, 3.45 MB
🔄 Attempt 1: Quality 85%, Size: 2.12 MB
✅ Image compressed successfully!
   Final size: 2.12 MB
   Dimensions: 1920x1440
   Quality: 85%
   Was compressed: Yes

💾 Image saved:
   /root/websites/gangrunprinting/test-outputs/new-prompt-office-style-1728...png
```

---

## API Reference

### Available APIs

```typescript
type TargetAPI =
  | 'google-imagen' // 20 MB - for Imagen generated images
  | 'google-gemini' // 20 MB - for Gemini Vision input
  | 'anthropic' // 5 MB  - for Claude API
  | 'openai' // 20 MB - for GPT-4 Vision
  | 'general' // 10 MB - general purpose
```

### Size Limits

```typescript
import { API_LIMITS } from '@/lib/image-compression'

console.log(API_LIMITS.GOOGLE_IMAGEN) // 20971520 bytes (20 MB)
console.log(API_LIMITS.GOOGLE_GEMINI) // 20971520 bytes (20 MB)
console.log(API_LIMITS.ANTHROPIC) // 5242880 bytes (5 MB)
```

---

## Best Practices

1. ✅ **Always compress user-uploaded images** before sending to any API
2. ✅ **Use `targetAPI` parameter** for automatic size limit selection
3. ✅ **Maintain higher quality for Gemini analysis** (85-90%)
4. ✅ **Use lower quality for storage/display** (75-85%)
5. ✅ **Skip compression for images < 3 MB** (already small)
6. ✅ **Log compression results** to monitor quality
7. ❌ **Don't compress Imagen output** unless you need to (already optimized)
8. ❌ **Don't use aggressive mode by default** (only for problem images)

---

## Troubleshooting

### "Unable to compress image below 20 MB"

This is very rare for Google AI. If it happens:

1. Check original image size: `ls -lh image.jpg`
2. Verify it's not a video or GIF
3. Try converting to JPEG first
4. Use aggressive mode with lower dimensions

```typescript
const compressed = await compressWithRetry(buffer, {
  aggressive: true,
  maxDimension: 1024,
  initialQuality: 50,
  minQuality: 20,
})
```

### Gemini returns "Invalid image" error

- Ensure image is JPEG, PNG, WebP, HEIC, or HEIF
- Verify base64 encoding is correct
- Check mimeType matches image format
- Try re-compressing with JPEG output

```typescript
// Force JPEG output
const compressed = await compressWithRetry(buffer, {
  targetAPI: 'google-gemini',
})
// Compressed images are always JPEG or PNG
```

---

## Related Files

- [`/src/lib/image-compression.ts`](../src/lib/image-compression.ts) - Compression utility
- [`/src/lib/image-generation/google-ai-client.ts`](../src/lib/image-generation/google-ai-client.ts) - Imagen client
- [`/scripts/test-new-prompt.ts`](../scripts/test-new-prompt.ts) - Example usage
- [`/docs/IMAGE-COMPRESSION-GUIDE.md`](./IMAGE-COMPRESSION-GUIDE.md) - General compression guide

---

## Support

For issues specific to Google AI:

- [Google AI Studio Documentation](https://ai.google.dev/gemini-api/docs)
- [Imagen API Docs](https://ai.google.dev/gemini-api/docs/image-generation)
- [Gemini Vision Docs](https://ai.google.dev/gemini-api/docs/vision)
