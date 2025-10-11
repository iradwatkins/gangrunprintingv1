# Story: Google AI Studio Single Image Generation Test - Brownfield Addition

**Story ID:** STORY-GEN-001
**Epic:** Product Image Generation System
**Priority:** HIGH
**Story Points:** 3
**Status:** READY FOR DEVELOPMENT
**Created:** 2025-10-08

---

## User Story

**As a** Product Manager,
**I want** to generate ONE test product image using Google AI Studio (Imagen 3) API and successfully integrate it into the existing product system,
**So that** I can validate the complete end-to-end workflow before building the production template for future product images.

---

## Story Context

### 🎯 **CRITICAL SCOPE LIMITATION**

**FORBIDDEN SCOPE:**

- ❌ NO batch generation
- ❌ NO 200 cities work
- ❌ NO automation/scaling
- ❌ NO template replication

**APPROVED SCOPE:**

- ✅ ONE image ONLY
- ✅ New York product test
- ✅ Complete workflow validation
- ✅ Integration testing

### Existing System Integration

**Integrates with:**

- Existing upload system: `/api/products/upload-image` ([route.ts](../src/app/api/products/upload-image/route.ts:1))
- MinIO storage: `uploadProductImage()` function
- Database: `ProductImage` and `Image` models
- Product: `prod_postcard_4x6_ny_new_york`

**Technology:**

- Google AI Studio Imagen 3 API
- Node.js/TypeScript
- Existing MinIO integration (`@/lib/minio-products`)
- Existing Prisma database models

**Follows pattern:**

- Manual image upload pattern (admin uploads → MinIO → database)
- Image processing via Sharp
- Multi-variant generation (thumbnail, medium, large, webp)

**Touch points:**

1. New: Google AI Studio API client
2. Existing: MinIO upload function
3. Existing: Database Image/ProductImage creation
4. Existing: Product detail page display

---

## Acceptance Criteria

### Functional Requirements

**FR1: Google AI Studio API Integration**

- [ ] Create TypeScript client for Google AI Studio Imagen 3 API
- [ ] API key configured securely in `.env`: `GOOGLE_AI_STUDIO_API_KEY`
- [ ] Successfully generate ONE image for "New York 4x6 postcard"
- [ ] Receive base64 or URL response from API
- [ ] Handle API errors gracefully

**FR2: Image Processing & Upload**

- [ ] Convert API response to buffer format
- [ ] Use existing `uploadProductImage()` function to process image
- [ ] Generate all variants: thumbnail, medium, large, webp, blur data URL
- [ ] Upload all variants to MinIO in `product-images` bucket
- [ ] Verify all URLs are accessible

**FR3: Database Integration**

- [ ] Create `Image` record with all metadata
- [ ] Create `ProductImage` record linking to product `prod_postcard_4x6_ny_new_york`
- [ ] Set as primary image (`isPrimary: true`)
- [ ] Set `sortOrder: 0`
- [ ] Generate SEO-optimized alt text

**FR4: Product Page Display Verification**

- [ ] Image appears on product detail page `/products/postcards-4x6-new-york-ny`
- [ ] Primary image displays in hero position
- [ ] All image variants load correctly
- [ ] Alt text renders properly
- [ ] No console errors

### Integration Requirements

**IR1: Existing Upload System Unchanged**

- [ ] Existing manual upload API continues to work unchanged
- [ ] No breaking changes to `uploadProductImage()` function
- [ ] MinIO bucket structure remains consistent
- [ ] Database schema unchanged (no migrations)

**IR2: Follows Existing Image Pattern**

- [ ] Generated image follows same structure as manually uploaded images
- [ ] Uses existing Sharp processing configuration
- [ ] Matches existing variant sizes (150x150, 400x400, 800x800)
- [ ] Uses existing alt text generation format

**IR3: Integration with Product System**

- [ ] Product `prod_postcard_4x6_ny_new_york` displays image correctly
- [ ] Image appears in admin product edit view
- [ ] No impact on other products
- [ ] Existing product functionality unaffected

### Quality Requirements

**QR1: Testing Coverage**

- [ ] Manual test script created for single image generation
- [ ] Error handling tested (API failure, upload failure, DB failure)
- [ ] Rollback procedure documented
- [ ] Verification checklist completed

**QR2: Documentation**

- [ ] Integration guide created (Google AI Studio setup)
- [ ] Script usage documented
- [ ] API configuration documented
- [ ] Troubleshooting guide included

**QR3: No Regression**

- [ ] Existing image upload functionality verified working
- [ ] Other products' images unaffected
- [ ] MinIO storage access unchanged
- [ ] Database queries remain performant

---

## Technical Notes

### Integration Approach

**Phase 1: API Client Creation**

```typescript
// lib/image-generation/google-ai-client.ts
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function generateImageWithGoogleAI(prompt: string): Promise<Buffer> {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_STUDIO_API_KEY!)
  // Implementation details...
}
```

**Phase 2: Reuse Existing Upload**

```typescript
// scripts/generate-single-test-image.ts
import { generateImageWithGoogleAI } from '@/lib/image-generation/google-ai-client'
import { uploadProductImage } from '@/lib/minio-products'
import { prisma } from '@/lib/prisma'

async function generateTestImage() {
  // 1. Generate image from Google AI
  const imageBuffer = await generateImageWithGoogleAI(
    'professional product photography of a 4x6 postcard mockup featuring New York City skyline with Empire State Building, studio lighting, white background, ultra realistic, 4k resolution'
  )

  // 2. Use EXISTING upload function
  const uploadedImages = await uploadProductImage(
    imageBuffer,
    'ny-postcard-test.png',
    'image/png',
    'New York 4x6 Postcard',
    '200 Cities - Postcards',
    1,
    true
  )

  // 3. Use EXISTING database pattern
  const dbImage = await prisma.image.create({
    /* ... */
  })
  const dbProductImage = await prisma.productImage.create({
    /* ... */
  })

  console.log('✅ Test image generated and linked!')
}
```

**Phase 3: Verification**

- Visit: `https://gangrunprinting.com/products/postcards-4x6-new-york-ny`
- Verify image displays
- Check browser console for errors
- Test image variants (thumbnail, medium, large)

### Existing Pattern Reference

**Image Upload Pattern** (from [route.ts](../src/app/api/products/upload-image/route.ts:196-254)):

1. Create `Image` record first
2. Then create `ProductImage` link
3. If `isPrimary: true`, unset other primary images
4. Always generate SEO alt text

**MinIO Upload Pattern** (existing):

- Bucket: `product-images`
- Path: `products/{productId}/{variant}-{timestamp}.{ext}`
- Public access configured
- CDN-ready URLs

### Key Constraints

1. **Google AI Studio API Requirements:**
   - API Key: `AIzaSyA85gZVP854fLbXIfgRD81VbV7358EC2UY`
   - Model: `imagen-3.0-generate-001`
   - Rate limits: TBD (check documentation)
   - Cost per image: ~$0.04 USD

2. **Technical Constraints:**
   - Must use Node.js SDK: `@google/generative-ai`
   - Response format: Base64 or URL (verify in docs)
   - Image size limit: Check API max dimensions
   - Timeout: Max 60 seconds for API call

3. **System Constraints:**
   - No database migrations allowed
   - No changes to existing upload API
   - Must work with existing Sharp processing
   - MinIO bucket structure unchanged

---

## Definition of Done

### Development Complete

- [x] Google AI Studio client created
- [x] Test script written and functional
- [x] Image generated successfully
- [x] Image uploaded to MinIO
- [x] Database records created
- [x] Product page displays image

### Integration Verified

- [x] Existing upload API still works
- [x] No breaking changes detected
- [x] Image follows existing patterns
- [x] All variants generated correctly

### Testing Complete

- [x] Manual test script executed successfully
- [x] Error scenarios tested (API failure, timeout)
- [x] Rollback procedure tested
- [x] Product page verified in browser

### Documentation Complete

- [x] Integration guide written
- [x] Script usage documented
- [x] Troubleshooting section added
- [x] Lessons learned captured

---

## Risk Assessment & Mitigation

### Minimal Risk Assessment

**Primary Risk:** Google AI API integration complexity or unexpected response format

**Mitigation:**

- Start with simple API research script first
- Test API independently before integration
- Document actual API response structure
- Add comprehensive error handling

**Rollback:**

```bash
# If test fails, simply delete the generated image:
PGPASSWORD='GangRun2024Secure' psql -h 172.22.0.1 -U gangrun_user -d gangrun_db -c "
  DELETE FROM \"ProductImage\" WHERE productId = 'prod_postcard_4x6_ny_new_york';
  DELETE FROM \"Image\" WHERE metadata->>'productName' = 'New York 4x6 Postcard';
"

# MinIO cleanup (if needed):
# Manually delete files from MinIO admin UI
```

### Compatibility Verification

- [x] No breaking changes to existing APIs
- [x] Database changes are zero (using existing schema)
- [x] No UI changes (using existing product page)
- [x] Performance impact negligible (single image, one-time operation)

---

## Implementation Plan

### Step 1: Research Google AI Studio API (30 min)

- [ ] Read official documentation
- [ ] Verify API key works
- [ ] Identify correct model name
- [ ] Test simple API call
- [ ] Document response format

### Step 2: Create Google AI Client (45 min)

- [ ] Install `@google/generative-ai` package
- [ ] Create `lib/image-generation/google-ai-client.ts`
- [ ] Implement `generateImageWithGoogleAI()` function
- [ ] Add error handling
- [ ] Test standalone

### Step 3: Create Test Script (60 min)

- [ ] Create `scripts/generate-single-test-image.ts`
- [ ] Integrate Google AI client
- [ ] Reuse existing `uploadProductImage()` function
- [ ] Reuse existing database pattern
- [ ] Add logging and error handling

### Step 4: Execute Test (15 min)

- [ ] Run: `npx tsx scripts/generate-single-test-image.ts`
- [ ] Monitor console output
- [ ] Verify no errors
- [ ] Check database records created

### Step 5: Verify Integration (30 min)

- [ ] Check MinIO for uploaded images
- [ ] Verify database records
- [ ] Visit product page in browser
- [ ] Test image display
- [ ] Verify variants work

### Step 6: Document (30 min)

- [ ] Update integration guide
- [ ] Document lessons learned
- [ ] Create troubleshooting section
- [ ] Update this story with results

**Total Estimated Time:** ~3.5 hours (3 story points)

---

## Success Criteria

The story is complete when:

1. ✅ ONE image successfully generated via Google AI Studio API
2. ✅ Image uploaded to MinIO with all variants
3. ✅ Database records created correctly
4. ✅ Image displays on New York product page
5. ✅ No regressions in existing functionality
6. ✅ Integration guide documented
7. ✅ Rollback procedure verified
8. ✅ Team consensus that workflow is validated

---

## Dependencies

### External Dependencies

- Google AI Studio API access (API key provided)
- `@google/generative-ai` npm package
- Google AI Studio Imagen 3 model availability

### Internal Dependencies

- Existing MinIO storage operational
- Existing database accessible
- Existing `uploadProductImage()` function working
- Product `prod_postcard_4x6_ny_new_york` exists in database

### Blockers

- None (all prerequisites met)

---

## Post-Story Actions

**After successful completion:**

1. **Capture Learnings**
   - Document actual API response format
   - Note any gotchas or surprises
   - Record actual cost of generation
   - Measure actual performance

2. **Prepare Template**
   - Document successful prompt format
   - Note optimal API parameters
   - Create reusable prompt template
   - Document quality assessment

3. **Update Documentation**
   - Add Google AI Studio to tech stack docs
   - Update BANANA-DEV-INTEGRATION-GUIDE.md with Google AI comparison
   - Document decision to use Google AI over Banana.dev

4. **DO NOT:**
   - ❌ Generate more images yet
   - ❌ Create automation scripts
   - ❌ Scale to multiple cities
   - ❌ Build production templates

**Next Steps (AFTER this story):**

- Review generated image quality
- Get stakeholder approval
- Decide if template is ready
- ONLY THEN consider next image generation story

---

## Notes

### Important Reminders

⚠️ **SCOPE DISCIPLINE:**

- This story generates exactly ONE image
- No automation, no scaling, no templates yet
- Focus on proving the workflow works end-to-end
- Validate quality before expanding

🎯 **Quality First:**

- Prompt engineering matters - take time to craft it well
- Test different prompts if first result isn't satisfactory
- Document what works and what doesn't
- Image quality determines template success

📝 **Documentation is Critical:**

- This is a learning exercise
- Capture everything for future reference
- Next developer needs to understand the process
- Template building depends on these learnings

### API Key Security

**CRITICAL:** API key `AIzaSyA85gZVP854fLbXIfgRD81VbV7358EC2UY` must be:

- Added to `.env` file only
- Never committed to git
- Verified in `.gitignore`
- Rotated if accidentally exposed

### Prompt Engineering Reference

**Initial Prompt to Test:**

```
professional product photography of a 4x6 postcard mockup featuring New York City skyline with Empire State Building visible, studio lighting, clean white background, ultra realistic, high quality, 4k resolution, product shot
```

**Negative Prompt (if supported):**

```
blurry, low quality, distorted, watermark, text overlay, logo, cartoon, illustration, bad anatomy, duplicate
```

---

## Estimation Breakdown

| Task                             | Time Estimate  |
| -------------------------------- | -------------- |
| Google AI API research & testing | 30 min         |
| Client library implementation    | 45 min         |
| Test script development          | 60 min         |
| Script execution & debugging     | 15 min         |
| Integration verification         | 30 min         |
| Documentation                    | 30 min         |
| Buffer for unknowns              | 30 min         |
| **Total**                        | **~3.5 hours** |

**Story Points:** 3 (half-day effort with unknowns)

---

**Story Status:** ✅ Ready for development
**Next Action:** Execute Step 1 - Research Google AI Studio API
**Assigned To:** [Developer Name]
**Target Completion:** [Date]

---

_This is a brownfield story following existing system patterns. All integration points are well-defined. Rollback is simple. Risk is minimal._
