# AI Image Generation Guide

## Overview

GangRun Printing now has **AI-powered image generation** built into the product creation workflow. Generate unlimited product images using Google's Imagen 4 AI model, with automatic versioning and draft management.

---

## Features

### ✨ What You Can Do

1. **Generate Product Images** - Describe what you want and AI creates it
2. **Unlimited Variations** - Generate as many versions as you need
3. **Draft Management** - All versions saved in a "drafts" folder
4. **Easy Selection** - Browse all drafts and pick your favorite
5. **Version Control** - Old images never lost, always recoverable

---

## How to Use

### Step 1: Navigate to Product Creation

1. Go to **Admin Dashboard** → **Products** → **New Product**
2. Fill in the **Product Name** (required for draft organization)

### Step 2: Generate Your First Image

1. In the **Product Image** section, click **"AI Generate"** button
2. A purple form will appear with a text area
3. Enter your image description (prompt)
4. Click **"Generate Image"**

### Example Prompts

```
Professional product photography of business cards on a wooden desk,
studio lighting, high quality, 4k resolution

Minimalist photo of flyers stacked on white background,
soft shadow, clean composition, marketing photography

Close-up of glossy brochures with professional lighting,
premium paper texture visible, product shot
```

### Step 3: View and Manage Drafts

1. Click **"Drafts"** button to see all generated versions
2. A grid view shows all your generated images
3. Each draft includes:
   - Preview thumbnail
   - **"Use This"** button - Select as product image
   - **Delete** button - Remove unwanted versions
   - Timestamp - When it was generated

### Step 4: Generate More Variations

1. Click **"AI Generate"** again
2. Modify your prompt or try something completely new
3. Each generation creates a new draft
4. All previous versions remain in drafts folder

### Step 5: Select Your Favorite

1. Browse all drafts
2. Click **"Use This"** on your favorite
3. That image becomes the product's main image
4. Continue with product creation

---

## Draft Management

### Viewing Drafts

- Click **"Drafts (X)"** button - Shows count of available versions
- Grid view displays all drafts with previews
- Sorted by newest first

### Deleting Drafts

**Individual Delete:**

- Click trash icon on any draft
- Confirms deletion
- Refreshes list automatically

**Bulk Delete:**

- Click **"Delete All"** button at top
- Confirms action (cannot be undone)
- Clears all drafts for this product

### Draft Storage

- **Location:** MinIO bucket under `drafts/` folder
- **Format:** PNG images
- **Naming:** `{product-name}-{timestamp}.png`
- **Metadata:** Prompt and generation settings stored with image

---

## Tips for Best Results

### Writing Good Prompts

✅ **DO:**

- Be specific about what you want
- Include lighting details ("studio lighting", "natural light")
- Mention quality ("high quality", "4k", "professional")
- Describe composition ("on white background", "close-up")
- Use product photography terms

❌ **DON'T:**

- Be vague ("a nice image")
- Include people (system automatically excludes)
- Exceed 480 tokens (~1440 characters)

### Prompt Formula

```
[Product Type] + [Setting/Background] + [Lighting] + [Quality/Style]

Examples:
✓ "Red business cards on rustic wooden desk, natural window lighting,
   warm tones, professional photography"

✓ "Stack of glossy brochures, white studio background, soft shadows,
   ultra sharp focus, 4k resolution"

✓ "Flyers fanned out on marble surface, golden hour lighting,
   luxury product shot, high-end photography"
```

### Aspect Ratios (Default: 4:3)

- **1:1** - Square format
- **4:3** - Standard product (default)
- **16:9** - Wide format
- **3:4** - Portrait

_Note: Aspect ratio can be customized in future updates_

---

## Technical Details

### API Endpoints

**Generate Image:**

```
POST /api/products/generate-image
Body: {
  "prompt": "Your description here",
  "productName": "Product Name",
  "aspectRatio": "4:3",
  "imageSize": "2K"
}
```

**List Drafts:**

```
GET /api/products/generate-image?productName=business-cards
```

**Delete Draft:**

```
DELETE /api/products/generate-image
Body: { "filename": "drafts/product-123456.png" }
```

**Delete All Drafts:**

```
DELETE /api/products/generate-image
Body: { "productName": "business-cards", "deleteAll": true }
```

### Configuration

**Environment Variables:**

- `GOOGLE_AI_STUDIO_API_KEY` - Required for image generation
- Get key from: https://aistudio.google.com/app/apikey

**Default Settings:**

- Model: `imagen-4.0-generate-001` (Google Imagen 4)
- Image Size: `2K` (ultra quality)
- Aspect Ratio: `4:3` (best for 4x6 postcards)
- Person Generation: `dont_allow` (product focus only)

---

## Workflow Example

### Creating a Business Card Product

1. **Start:** Go to `/admin/products/new`
2. **Name:** Enter "Premium Business Cards - Red"
3. **Generate:** Click "AI Generate"
4. **Prompt 1:** "Professional product photography of red business cards on white background"
   - Result: Clean, simple shot
5. **Prompt 2:** "Red business cards on wooden desk with coffee cup, lifestyle photography"
   - Result: Lifestyle context shot
6. **Prompt 3:** "Close-up of red business cards showing paper texture, studio lighting"
   - Result: Detailed texture shot
7. **Review:** Open "Drafts (3)" to see all versions
8. **Select:** Click "Use This" on the lifestyle shot
9. **Continue:** Fill out rest of product details
10. **Save:** Create product with selected image

---

## Troubleshooting

### Image Generation Fails

**Error: "API key not configured"**

- Check `.env` file has `GOOGLE_AI_STUDIO_API_KEY`
- Restart PM2: `pm2 restart gangrunprinting`

**Error: "Rate limit exceeded"**

- Wait 2-3 seconds between generations
- Google AI has rate limits to prevent abuse

**Error: "Prompt too long"**

- Keep prompts under 1440 characters (~480 tokens)
- Be concise but descriptive

### Drafts Not Loading

**"Product name required to view drafts"**

- Fill in Product Name field first
- Product name organizes drafts by product

**Empty drafts folder**

- Generate at least one image first
- Check MinIO is running: `docker ps | grep minio`

### Image Quality Issues

**Image looks low quality**

- System uses `2K` by default (ultra quality)
- Check if MinIO compressed the image
- Try regenerating with modified prompt

---

## Testing

**Quick Test (Terminal):**

```bash
cd /root/websites/gangrunprinting
source .env
GOOGLE_AI_STUDIO_API_KEY="${GOOGLE_AI_STUDIO_API_KEY}" \
  npx tsx scripts/test-ai-image-generation.ts
```

**Expected Output:**

```
🧪 Testing AI Image Generation
✅ Generator initialized
✅ Image generated!
   Buffer size: ~1.3MB
✨ All tests passed!
```

---

## Future Enhancements

### Planned Features

- [ ] Prompt templates for different product types
- [ ] Batch generation (4 variations at once)
- [ ] City-specific postcard generation
- [ ] Custom aspect ratio selector in UI
- [ ] Prompt history/favorites
- [ ] AI-suggested improvements to prompts

---

## Support

**Issues:**

- Report at: https://github.com/anthropics/claude-code/issues

**Documentation:**

- Google AI Imagen Docs: https://ai.google.dev/gemini-api/docs/imagen
- Library: `/src/lib/image-generation/google-ai-client.ts`

---

## Summary

The AI Image Generation feature provides:

✅ **Unlimited generations** - Create as many versions as needed
✅ **Draft versioning** - All images saved, nothing lost
✅ **Easy selection** - Visual grid to pick favorites
✅ **Professional quality** - 2K resolution, product photography optimized
✅ **Time savings** - No need for stock photos or manual editing

**Start generating images now at:** [/admin/products/new](https://gangrunprinting.com/admin/products/new)
