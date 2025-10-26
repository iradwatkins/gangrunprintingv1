# AI Prompt Studio - Complete User Guide

**Last Updated:** October 25, 2025
**Version:** 1.0.0
**Status:** Production Ready ✅

---

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [System Architecture](#system-architecture)
4. [User Guide](#user-guide)
5. [Template Categories](#template-categories)
6. [Workflow Examples](#workflow-examples)
7. [Technical Reference](#technical-reference)
8. [Troubleshooting](#troubleshooting)

---

## Overview

### What is AI Prompt Studio?

AI Prompt Studio is a professional prompt management and testing system for generating high-quality product images using Google Imagen 4. It provides:

- **12 Pre-Built Templates** across 5 categories
- **Iterative Refinement** with version tracking
- **Batch Testing** - Generate 4 variations per iteration
- **Quality Rating System** - Excellent/Good/Poor ratings
- **Split-Screen Workspace** - Edit prompts while viewing results
- **Complete History** - Track all iterations and improvements

### Key Features

✅ **Template Library** - Start with professional, pre-tested prompts
✅ **Live Preview** - See full prompt composition before generating
✅ **Iteration Tracking** - Never lose your refinement history
✅ **Quality Ratings** - Quickly identify best results
✅ **Database Integration** - Seamless integration with existing product system
✅ **Non-Breaking Schema** - Extends existing PromptTemplate without breaking changes

---

## Quick Start

### 1. Access the Studio

Navigate to: `/admin/marketing/prompts`

You'll see:
- **Your Prompts** - All saved prompts you've created
- **Templates** - Pre-built professional templates
- **Stats** - Total prompts, templates, and recent tests

### 2. Create Your First Prompt

**Option A: Start from Template (Recommended)**

1. Click **"Browse Templates"**
2. Browse categories: Product, Promotional, Seasonal, Lifestyle, Environment
3. Click **"Use Template"** on any template
4. You'll be redirected to the editor with a copy

**Option B: Create from Scratch**

1. Click **"Create New Prompt"**
2. Fill in required fields:
   - Name (e.g., "Business Card Hero Shot")
   - Category (PRODUCT, PROMOTIONAL, etc.)
   - Product Type (e.g., "Business Cards")
   - Base Prompt (core description)
3. Optionally add:
   - Style Modifiers
   - Technical Specs
   - Negative Prompt
4. Click **"Create Prompt"**

### 3. Refine & Test

1. **Edit Your Prompt**
   - Modify any field in the left panel
   - Watch the "Full Prompt Preview" update live
   - Click **"Save Changes"** when ready

2. **Generate Test Images**
   - Click **"Generate 4 Test Images"**
   - Wait ~8-10 seconds
   - View results in right panel

3. **Rate Results**
   - Click menu (⋮) on each image
   - Rate: Excellent / Good / Poor
   - Delete images you don't need

4. **Iterate**
   - Refine prompt based on results
   - Generate again
   - Each generation = new iteration

### 4. View History

Click **"View History"** to see:
- All iterations chronologically
- Images grouped by iteration
- Quality ratings for each batch
- When each iteration was created

---

## System Architecture

### Database Schema

```prisma
model PromptTemplate {
  // Core fields (existing)
  id          String
  name        String
  slug        String @unique
  description String?
  category    PromptCategory (PRODUCT, PROMOTIONAL, SEASONAL, LIFESTYLE, ENVIRONMENT)
  status      PromptStatus (DRAFT, PRODUCTION, ARCHIVED)

  // Prompt content
  promptText  String @db.Text // Main prompt
  variables   Json? // Variable substitutions

  // Prompt Studio Extensions (Oct 25, 2025)
  productType     String? // "Business Cards", "Flyers", etc.
  styleModifiers  String? @db.Text // Style preferences
  technicalSpecs  String? @db.Text // Quality specs
  negativePrompt  String? @db.Text // Things to avoid
  isTemplate      Boolean @default(false) // Template vs user prompt
  currentIteration Int @default(1) // Refinement counter

  // AI Configuration
  aiProvider  String @default("google-imagen")
  aspectRatio String @default("1:1")

  // Relations
  testImages  PromptTestImage[]

  // Metadata
  isActive  Boolean @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model PromptTestImage {
  id                String
  promptTemplateId  String
  imageUrl          String @db.Text // Base64 or storage URL
  promptText        String @db.Text // Exact prompt used
  iteration         Int // Which iteration
  config            Json? // Generation config
  quality           ImageQuality (excellent, good, poor)
  notes             String?
  createdAt         DateTime
}
```

### API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/prompts` | GET | List all prompts |
| `/api/prompts` | POST | Create new prompt |
| `/api/prompts/[id]` | GET | Get single prompt |
| `/api/prompts/[id]` | PUT | Update prompt |
| `/api/prompts/[id]` | DELETE | Delete prompt |
| `/api/prompts/from-template` | POST | Copy template to user prompt |
| `/api/prompts/[id]/generate` | POST | Generate 4 test images |
| `/api/prompts/[id]/images/[imageId]/rate` | PUT | Rate an image |
| `/api/prompts/[id]/images/[imageId]` | DELETE | Delete an image |

### File Structure

```
src/
├── app/
│   ├── admin/marketing/prompts/
│   │   ├── page.tsx                    # Main library
│   │   ├── prompt-list.tsx             # Prompt table
│   │   ├── new/page.tsx                # Create new prompt
│   │   ├── templates/
│   │   │   ├── page.tsx                # Template browser
│   │   │   └── template-grid.tsx       # Template cards
│   │   └── [id]/
│   │       ├── edit/
│   │       │   ├── page.tsx            # Workspace container
│   │       │   ├── prompt-workspace.tsx # Split-screen layout
│   │       │   ├── prompt-editor.tsx   # Left panel
│   │       │   └── test-image-grid.tsx # Right panel
│   │       └── history/page.tsx        # Iteration history
│   └── api/prompts/                    # API routes (see above)
├── scripts/
│   └── seed-prompt-templates.ts        # Seed 12 templates
└── lib/
    └── image-generation/
        └── google-ai-client.ts         # Google Imagen 4 integration
```

---

## User Guide

### Understanding Prompt Components

A complete prompt has 4 parts that are combined:

1. **Base Prompt** (Required)
   - Core description of the image
   - Example: "professional product photography of business cards on white background"

2. **Style Modifiers** (Optional)
   - Aesthetic and style preferences
   - Example: "studio lighting, clean composition, professional quality"

3. **Technical Specs** (Optional)
   - Quality and technical requirements
   - Example: "4k resolution, sharp focus, high quality"

4. **Negative Prompt** (Optional)
   - Things to avoid in the image
   - Example: "blurry, low quality, poor lighting, cluttered"

**Full Prompt Preview** shows how these combine:
```
professional product photography of business cards on white background,
studio lighting, clean composition, professional quality,
4k resolution, sharp focus, high quality
```

### Best Practices

#### Writing Effective Prompts

✅ **DO:**
- Be specific and descriptive
- Use professional photography terms
- Specify lighting, composition, quality
- Include product type clearly
- Add technical quality specs

❌ **DON'T:**
- Be vague ("nice picture")
- Use conflicting terms
- Exceed 1440 characters
- Forget negative prompts

#### Iterating on Results

**Iteration Strategy:**

1. **First Iteration** - Start broad
   - Use template or basic prompt
   - Generate 4 images
   - Identify what works

2. **Second Iteration** - Refine specifics
   - Add style modifiers based on results
   - Tighten technical specs
   - Add negative prompts for problems

3. **Third+ Iterations** - Fine-tune
   - Make small adjustments
   - Test specific variations
   - Lock in the best approach

**Quality Rating Guide:**

- **Excellent** ⭐⭐⭐ - Perfect, production-ready
- **Good** ⭐⭐ - Acceptable, minor tweaks needed
- **Poor** ⭐ - Significant issues, needs major changes

---

## Template Categories

### 1. PRODUCT (3 templates)

**Best for:** E-commerce, catalog photography, product pages

**Templates:**
- Clean Product Shot - White Background
- Product Close-Up - Detail Shot
- Product on Wooden Surface

**When to use:** Need professional product photos with clear details

---

### 2. PROMOTIONAL (2 templates)

**Best for:** Marketing campaigns, sales materials, ads

**Templates:**
- Hero Banner - Bold & Eye-Catching
- Sale Promotion - Urgent & Compelling

**When to use:** Creating attention-grabbing marketing visuals

---

### 3. SEASONAL (1 template)

**Best for:** Holiday campaigns, seasonal promotions

**Templates:**
- Holiday Theme - Festive & Warm

**When to use:** Seasonal marketing, holiday campaigns

---

### 4. LIFESTYLE (3 templates)

**Best for:** Social media, blogs, real-world context

**Templates:**
- Hand Holding - Personal Connection
- Desk Scene - Professional Context
- Coffee Shop - Casual & Relatable

**When to use:** Showing products in authentic use scenarios

---

### 5. ENVIRONMENT (2 templates)

**Best for:** Factory tours, behind-the-scenes, production credibility

**Templates:**
- Print Shop Floor - Professional Production
- Quality Inspection - Premium Production

**When to use:** Building trust through production transparency

---

## Workflow Examples

### Example 1: Creating Business Card Images

**Goal:** Professional business card product photos for e-commerce

**Steps:**

1. **Start with Template**
   - Browse Templates → Product Category
   - Select "Clean Product Shot - White Background"
   - Click "Use Template"

2. **Customize**
   ```
   Name: Business Cards Hero Shot
   Product Type: Business Cards
   Base Prompt: professional product photography of business cards
                stack on white background, centered composition
   Style: studio lighting, clean background, professional quality
   Technical: 4k resolution, sharp focus, ultra high quality
   Negative: blurry, shadows, background clutter
   ```

3. **First Test**
   - Generate 4 images
   - Review results
   - Rate each image

4. **Refine** (if needed)
   - Too dark? Add "bright, well-lit" to style
   - Background not clean? Add "pure white seamless" to base
   - Not sharp? Add "macro lens, perfect focus" to technical

5. **Final Result**
   - Mark best image as "Excellent"
   - Prompt is now ready for production use

---

### Example 2: Seasonal Holiday Campaign

**Goal:** Create festive images for Thanksgiving promotion

**Steps:**

1. **Start with Template**
   - Templates → Seasonal
   - Select "Holiday Theme - Festive & Warm"

2. **Customize for Product**
   ```
   Name: Thanksgiving Flyers 2025
   Product Type: 4x6 Flyers
   Base: 4x6 flyer on rustic table with autumn decorations
   Style: warm amber lighting, cozy atmosphere, fall colors
   Technical: 4k, rich colors, professional photography
   Negative: cold tones, harsh lighting, non-festive
   ```

3. **Test & Iterate**
   - Generate → Review → Refine
   - Adjust warmth/colors as needed
   - Test different prop combinations

4. **Production**
   - Save best version
   - Use for campaign

---

## Technical Reference

### Configuration Options

**Aspect Ratios:**
- `1:1` - Square (Instagram, product shots)
- `4:3` - Standard (product photography)
- `16:9` - Landscape (banners, headers)
- `3:4` - Portrait
- `9:16` - Vertical (stories, reels)

**Image Sizes:**
- `1K` - Standard quality
- `2K` - Ultra quality (recommended)

**AI Provider:**
- `google-imagen` - Google Imagen 4 (default)

### Limits & Performance

| Metric | Value |
|--------|-------|
| Max prompt length | 1440 chars (~480 tokens) |
| Images per generation | 4 |
| Generation time | 8-10 seconds |
| Rate limit | 2 seconds between images |
| Max iterations | Unlimited |

### Integration Points

**Using Prompts in Production:**

```typescript
// Get a production-ready prompt
const prompt = await prisma.promptTemplate.findUnique({
  where: { id: promptId },
  include: { testImages: true }
})

// Build full prompt
const fullPrompt = [
  prompt.promptText,
  prompt.styleModifiers,
  prompt.technicalSpecs
].filter(Boolean).join(', ')

// Generate production image
const generator = new GoogleAIImageGenerator()
const result = await generator.generateImage({
  prompt: fullPrompt,
  negativePrompt: prompt.negativePrompt || undefined,
  config: {
    aspectRatio: prompt.aspectRatio,
    imageSize: '2K'
  }
})
```

---

## Troubleshooting

### Common Issues

#### Images Not Generating

**Symptoms:** "Generate" button doesn't work or times out

**Causes & Fixes:**

1. **Missing API Key**
   - Check: `GOOGLE_AI_STUDIO_API_KEY` in `.env`
   - Fix: Add valid API key

2. **Rate Limit Exceeded**
   - Wait 1 minute
   - Try again

3. **Prompt Too Long**
   - Max 1440 characters
   - Shorten base prompt or modifiers

#### Images Look Wrong

**Problem:** Generated images don't match expectations

**Solutions:**

1. **Add More Specifics**
   - Vague prompts = inconsistent results
   - Add details about lighting, composition, style

2. **Use Negative Prompts**
   - Explicitly exclude unwanted elements
   - Example: "blurry, dark, cluttered, amateur"

3. **Check Examples**
   - Review template prompts
   - See what works for similar products

4. **Iterate**
   - First attempt rarely perfect
   - Refine based on results

#### Saves Not Working

**Check:**
- Are you logged in as admin?
- Network connection stable?
- Browser console for errors?

---

## Support & Resources

### Documentation

- **This Guide:** Complete user reference
- **Schema Docs:** `/prisma/schema.prisma` (lines 564-632)
- **API Docs:** See [API Endpoints](#api-endpoints) above

### Code References

- **Workspace:** `src/app/admin/marketing/prompts/[id]/edit/prompt-workspace.tsx`
- **Generator:** `src/lib/image-generation/google-ai-client.ts`
- **Seed Templates:** `src/scripts/seed-prompt-templates.ts`

### Getting Help

1. **Check this guide first**
2. **Review template examples**
3. **Check console for errors**
4. **Contact development team**

---

## Changelog

### Version 1.0.0 (October 25, 2025)

**Initial Release**

✅ Complete prompt management system
✅ 12 pre-built templates across 5 categories
✅ Batch image generation (4 images)
✅ Iteration tracking and history
✅ Quality rating system
✅ Split-screen workspace
✅ Template browser
✅ Non-breaking schema extension
✅ Full integration with Google Imagen 4

---

## License & Credits

**Built for:** GangRun Printing
**AI Provider:** Google Imagen 4
**Framework:** Next.js 15 + Prisma + PostgreSQL
**Created:** October 2025
**Status:** Production Ready ✅

---

**End of Guide**
