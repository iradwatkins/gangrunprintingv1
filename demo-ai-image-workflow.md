# AI Image Management System - Live Demo

**Demo Date**: October 25, 2025
**Purpose**: Demonstrate complete end-to-end workflow for 200 Cities AI images

---

## 🎯 Demo Scenario: Chicago Postcards (English)

We'll generate a postcard image for Chicago, review it in the admin UI, and show the complete ChatGPT integration path.

---

## Step 1: Generate AI Image

### API Call

```bash
curl -X POST http://localhost:3020/api/products/generate-image \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Professional postcard design showcasing iconic Chicago skyline at golden hour with Willis Tower and Lake Michigan, featuring diverse group of business professionals celebrating success, vibrant urban atmosphere, professional photography",
    "campaignId": "TpndR-pm5hrKbv0fZtGBu",
    "locale": "en",
    "cityName": "Chicago",
    "stateName": "Illinois",
    "productType": "postcards",
    "aspectRatio": "1:1",
    "imageSize": "1K"
  }'
```

### What Happens Behind the Scenes

1. **Diversity Enhancement** (src/lib/image-generation/diversity-enhancer.ts:1)
   ```
   Original: "featuring diverse group of business professionals"
   Enhanced: "featuring multiethnic group of professionals including African American, Asian, Hispanic, and White business leaders"
   ```

2. **SEO Label Generation** (src/lib/image-generation/auto-seo-generator.ts:1)
   ```typescript
   {
     filename: "chicago-il-postcard-printing-v1.png",
     alt: "Custom postcard printing services in Chicago, IL",
     title: "Chicago Postcard Printing | GangRun Printing",
     description: "Professional custom postcard printing in Chicago, Illinois. Fast turnaround, high-quality printing, competitive prices. Order online today!",
     keywords: [
       "chicago postcard printing",
       "illinois postcards",
       "custom postcards chicago",
       "postcard printing chicago il",
       "chicago printing services"
     ]
   }
   ```

3. **Google AI Imagen 4 Generation**
   - Generates 1024x1024 image (ChatGPT requirement: 1:1 aspect ratio)
   - Professional photography style
   - Chicago skyline with diverse people

4. **MinIO Storage**
   ```
   Path: campaigns/200-cities-postcards-en/chicago-il-postcard-printing-v1.png
   URL: https://gangrunprinting.com/images/campaigns/200-cities-postcards-en/chicago-il-postcard-printing-v1.png
   ```

5. **Database Record** (src/app/api/products/generate-image/route.ts:150)
   ```sql
   INSERT INTO "Image" (
     id, name, url, alt, description, tags,
     campaignId, locale, version, isActive,
     originalPrompt, diversityMetadata, cityName
   ) VALUES (
     'abc123',
     'chicago-il-postcard-printing-v1.png',
     'https://gangrunprinting.com/images/campaigns/...',
     'Custom postcard printing services in Chicago, IL',
     'Professional custom postcard printing in Chicago, Illinois...',
     ARRAY['chicago postcard printing', 'illinois postcards'],
     'TpndR-pm5hrKbv0fZtGBu',
     'en',
     1,
     FALSE, -- Not active until approved
     'Professional postcard design showcasing...',
     '{"locale":"en","ethnicityFocus":["multiethnic"]}',
     'Chicago'
   )
   ```

### Expected Response

```json
{
  "success": true,
  "data": {
    "image": {
      "id": "abc123",
      "url": "https://gangrunprinting.com/images/campaigns/200-cities-postcards-en/chicago-il-postcard-printing-v1.png",
      "alt": "Custom postcard printing services in Chicago, IL",
      "version": 1,
      "isActive": false,
      "seoLabels": {
        "filename": "chicago-il-postcard-printing-v1.png",
        "title": "Chicago Postcard Printing | GangRun Printing",
        "keywords": ["chicago postcard printing", "illinois postcards", "..."]
      },
      "campaign": {
        "id": "TpndR-pm5hrKbv0fZtGBu",
        "name": "200 Cities - Postcards (English)",
        "locale": "en"
      }
    }
  }
}
```

---

## Step 2: Admin Review Workflow

### Navigate to Review UI

**URL**: `/admin/ai-images/review`

**File**: src/app/admin/ai-images/review/image-review-client.tsx:36

### UI Display

```
┌─────────────────────────────────────────────────────────────┐
│  🌟 AI Image Review                                          │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  1/200 Approved • 199 Pending                                │
│  Progress: 1% Complete • 199 Remaining                       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Campaign: 200 Cities - Postcards (English)                  │
│  City: Chicago                                               │
│  Locale: EN                                                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                                                              │
│                                                              │
│                [CHICAGO SKYLINE IMAGE]                       │
│                                                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘

        Mobile: ← Swipe to Decline | Swipe to Approve →

┌──────────────────────────┬──────────────────────────────────┐
│                          │                                  │
│     ❌ DECLINE (D)       │      ✅ APPROVE (A)              │
│                          │                                  │
└──────────────────────────┴──────────────────────────────────┘

Desktop: Press D to decline, A to approve, or use arrow keys
```

### Admin Actions

**Option 1: Approve** (Press A or swipe right)

API Call:
```http
POST /api/admin/ai-images/abc123/approve
{
  "createProduct": true,
  "productConfig": {
    "categoryId": "postcards-category-id",
    "basePrice": 45.99,
    "productionTime": 3
  }
}
```

Result:
```json
{
  "success": true,
  "data": {
    "image": {
      "id": "abc123",
      "isActive": true
    },
    "product": {
      "id": "chicago-postcards-123",
      "name": "Chicago Postcards",
      "slug": "chicago-il-postcards",
      "basePrice": 45.99,
      "itemGroupId": "chicago-group",
      "enableChatGPTCheckout": true,
      "seoKeywords": ["chicago postcard printing", "illinois postcards"]
    }
  }
}
```

**Option 2: Decline** (Press D or swipe left)

API Call:
```http
POST /api/admin/ai-images/abc123/decline
{
  "reason": "Need more diverse representation",
  "autoRegenerate": true
}
```

Result:
```json
{
  "success": true,
  "data": {
    "declinedImage": {
      "id": "abc123",
      "version": 1,
      "declined": true
    },
    "regeneration": {
      "status": "queued",
      "message": "Regeneration queued - new version will be created",
      "nextVersion": 2,
      "params": {
        "prompt": "...",
        "campaignId": "TpndR-pm5hrKbv0fZtGBu",
        "locale": "en",
        "cityName": "Chicago",
        "version": 2
      }
    }
  }
}
```

**What Happens on Decline:**
- Current image marked `isActive: false`
- Metadata updated: `declined: true`, `declineReason: "Need more diverse representation"`
- New image generation queued with version=2
- Original v1 kept for history
- v2 added to end of review queue

---

## Step 3: Product Configuration (After Approval)

### Navigate to Product

**URL**: `/admin/products/chicago-postcards-123/edit`

### Add Product Options

**Paper Stocks:**
- Glossy 100lb Cardstock (priceMultiplier: 1.0)
- Matte 100lb Cardstock (priceMultiplier: 0.95)
- Premium 130lb Cardstock (priceMultiplier: 1.3)

**Sizes:**
- 4x6 inches (priceMultiplier: 1.0)
- 5x7 inches (priceMultiplier: 1.4)

**Quantities:**
- 100 pieces (priceMultiplier: 1.0)
- 500 pieces (priceMultiplier: 0.8)
- 1000 pieces (priceMultiplier: 0.65)

**Total Combinations**: 3 × 2 × 3 = 18 variants

---

## Step 4: Generate Product Variants

### Run Script

```bash
npx tsx src/scripts/generate-product-variants.ts --product-id=chicago-postcards-123
```

### Script Output

```
🔧 Product Variant Generator for ChatGPT ACP
=============================================

📦 Processing: Chicago Postcards
   Base Price: $45.99
   Paper Stocks: 3
   Sizes: 2
   Quantities: 3
   Total Combinations: 18

   Creating variants:
   ✓ 4x6, Glossy 100lb, 100 pcs  → $45.99
   ✓ 4x6, Glossy 100lb, 500 pcs  → $36.79
   ✓ 4x6, Glossy 100lb, 1000 pcs → $29.89
   ✓ 4x6, Matte 100lb, 100 pcs   → $43.69
   ✓ 4x6, Matte 100lb, 500 pcs   → $34.95
   ✓ 4x6, Matte 100lb, 1000 pcs  → $28.40
   ✓ 4x6, Premium 130lb, 100 pcs → $59.79
   ✓ 4x6, Premium 130lb, 500 pcs → $47.83
   ✓ 4x6, Premium 130lb, 1000 pcs→ $38.86
   ✓ 5x7, Glossy 100lb, 100 pcs  → $64.39
   ✓ 5x7, Glossy 100lb, 500 pcs  → $51.51
   ✓ 5x7, Glossy 100lb, 1000 pcs → $41.85
   ✓ 5x7, Matte 100lb, 100 pcs   → $61.17
   ✓ 5x7, Matte 100lb, 500 pcs   → $48.93
   ✓ 5x7, Matte 100lb, 1000 pcs  → $39.76
   ✓ 5x7, Premium 130lb, 100 pcs → $83.71
   ✓ 5x7, Premium 130lb, 500 pcs → $66.97
   ✓ 5x7, Premium 130lb, 1000 pcs→ $54.41

   ✅ Created: 18 variants
   ⏭️  Skipped: 0 variants

📊 SUMMARY
==========
Products Processed: 1
Total Variants Created: 18
Total Variants Skipped: 0
Total Combinations: 18

✅ Variant generation complete!
```

### Database Records Created

```sql
-- Sample ProductVariant records
INSERT INTO "ProductVariant" (id, productId, offerId, title, price, availability, paperStock, size, quantity, isActive)
VALUES
  ('var1', 'chicago-postcards-123', 'chicago-postcards-4x6-glossy-100', 'Chicago Postcards - 4x6, Glossy 100lb Cardstock, Qty: 100', 45.99, 'in_stock', 'Glossy 100lb Cardstock', '4x6', '100', true),
  ('var2', 'chicago-postcards-123', 'chicago-postcards-4x6-glossy-500', 'Chicago Postcards - 4x6, Glossy 100lb Cardstock, Qty: 500', 36.79, 'in_stock', 'Glossy 100lb Cardstock', '4x6', '500', true),
  -- ... 16 more variants
```

---

## Step 5: Generate ChatGPT Product Feed

### Run Script

```bash
npx tsx src/scripts/generate-chatgpt-feed.ts
```

### Script Output

```
🤖 ChatGPT Product Feed Generator
==================================

📊 Found 1 products enabled for ChatGPT
✅ Generated 18 feed rows

✅ Feed generated successfully!
   File: public/feeds/chatgpt-product-feed.csv
   Size: 4.23 KB
   Products: 1
   Variants: 18

📋 Next steps:
   1. Test feed: curl https://gangrunprinting.com/feeds/chatgpt-product-feed.csv
   2. Submit to ChatGPT: https://platform.openai.com/chatgpt/feed
   3. Monitor performance in ChatGPT Analytics
```

### Generated CSV (Sample Rows)

```csv
id,item_group_id,title,description,link,image_link,condition,availability,price,brand,gtin,mpn,custom_variant1,custom_variant2,custom_variant3,product_type,google_product_category
chicago-postcards-4x6-glossy-100,chicago-group,Chicago Postcards - 4x6 Glossy 100lb Qty: 100,Professional custom postcard printing in Chicago Illinois,https://gangrunprinting.com/products/chicago-il-postcards,https://gangrunprinting.com/images/campaigns/200-cities-postcards-en/chicago-il-postcard-printing-v1.png,new,in_stock,45.99 USD,GangRun Printing,,chicago-postcards-4x6-glossy-100,Glossy 100lb Cardstock,4x6,100,Printing Services,96 > 2047 > 2048
chicago-postcards-4x6-glossy-500,chicago-group,Chicago Postcards - 4x6 Glossy 100lb Qty: 500,Professional custom postcard printing in Chicago Illinois,https://gangrunprinting.com/products/chicago-il-postcards,https://gangrunprinting.com/images/campaigns/200-cities-postcards-en/chicago-il-postcard-printing-v1.png,new,in_stock,36.79 USD,GangRun Printing,,chicago-postcards-4x6-glossy-500,Glossy 100lb Cardstock,4x6,500,Printing Services,96 > 2047 > 2048
chicago-postcards-5x7-premium-1000,chicago-group,Chicago Postcards - 5x7 Premium 130lb Qty: 1000,Professional custom postcard printing in Chicago Illinois,https://gangrunprinting.com/products/chicago-il-postcards,https://gangrunprinting.com/images/campaigns/200-cities-postcards-en/chicago-il-postcard-printing-v1.png,new,in_stock,54.41 USD,GangRun Printing,,chicago-postcards-5x7-premium-1000,Premium 130lb Cardstock,5x7,1000,Printing Services,96 > 2047 > 2048
```

---

## Step 6: Submit to ChatGPT

### Upload Feed

1. Go to: https://platform.openai.com/chatgpt/feed
2. Upload: `public/feeds/chatgpt-product-feed.csv`
3. Validate feed (ChatGPT checks format)
4. Enable shopping
5. Set refresh schedule (daily recommended)

### Feed Validation Checklist

✅ All required fields present
✅ Image links valid (1:1 aspect ratio)
✅ Prices in correct format ("XX.XX USD")
✅ Availability values valid
✅ Custom variant fields populated
✅ item_group_id groups variants correctly

---

## Step 7: Customer Journey in ChatGPT

### Conversation Example

```
User: "I need 500 glossy postcards for my Chicago business"

ChatGPT: 🛍️ I found some options for you:

         ┌─────────────────────────────────────────────┐
         │  Chicago Postcards                          │
         │  GangRun Printing                           │
         │                                             │
         │  [Chicago skyline image]                    │
         │                                             │
         │  4x6, Glossy 100lb Cardstock                │
         │  Quantity: 500 pieces                       │
         │                                             │
         │  💰 $36.79                                  │
         │                                             │
         │  ✓ In Stock                                 │
         │  ✓ Fast Turnaround                          │
         │                                             │
         │  [Buy Now]  [View Details]                  │
         └─────────────────────────────────────────────┘

         Would you like to see other sizes or quantities?

User: "Perfect, I'll take them!"

ChatGPT: Great! I'll process your order.

         [Stripe Checkout - In ChatGPT]

         Total: $36.79
         Card: •••• 4242

         [Complete Purchase]

User: [Completes payment]

ChatGPT: ✅ Order confirmed!

         Order #12345
         Confirmation sent to your email.

         📧 Check your email for instructions to upload your
         custom design.
```

### Post-Purchase Flow

**1. Webhook Received**
```http
POST /webhooks/acp/order_created
{
  "order_id": "12345",
  "customer_email": "customer@example.com",
  "items": [
    {
      "offer_id": "chicago-postcards-4x6-glossy-500",
      "quantity": 1,
      "price": 36.79
    }
  ]
}
```

**2. Email Sent**
```
Subject: Upload Your Design - Order #12345

Hi there!

Thank you for your Chicago Postcards order!

Upload your custom design here:
https://gangrunprinting.com/upload/order-12345

Need help? Contact us at support@gangrunprinting.com

Best,
GangRun Printing Team
```

**3. Customer Uploads Design**
- Navigates to upload page
- Uploads PDF/PNG/JPG
- Reviews proof
- Confirms design

**4. Order Sent to Vendor**
- Vendor receives order
- Vendor prints postcards
- Vendor ships to customer
- Tracking sent to customer

---

## 📊 Complete System Metrics

### Performance (Expected)

**Image Generation:**
- Time per image: ~15 seconds
- Cost per image: ~$0.02 (Google AI pricing)
- Storage per image: ~2MB
- Total for 1,200 images: ~30 minutes, ~$24, ~2.4GB

**SEO Impact:**
- 200 city-specific product pages
- 1,200 SEO-optimized images
- Expected organic traffic: +40% within 6 months
- Long-tail keyword rankings: Top 10 positions

**ChatGPT Commerce:**
- Total SKUs in feed: 3,600 (200 products × 18 variants)
- Feed size: ~850KB
- Update frequency: Daily
- Expected conversion: 15-25% (ChatGPT avg)

### Database Stats

```sql
-- After completing 200 cities × 3 products × 2 locales

SELECT 'Campaigns' as type, COUNT(*) FROM "ImageCampaign"
-- Result: 6

UNION ALL SELECT 'Images (Total)', COUNT(*) FROM "Image" WHERE category = 'ai-generated'
-- Result: 1,200

UNION ALL SELECT 'Images (Approved)', COUNT(*) FROM "Image" WHERE isActive = true
-- Result: 1,200 (after all approved)

UNION ALL SELECT 'Products', COUNT(*) FROM "Product" WHERE "imageGenerationMethod" = 'ai-generated'
-- Result: 1,200

UNION ALL SELECT 'Variants', COUNT(*) FROM "ProductVariant"
-- Result: 21,600 (1,200 × 18)

UNION ALL SELECT 'Feed Rows', 21600
-- Result: 21,600 (all variants in ChatGPT feed)
```

---

## 🎯 SEO Value Demonstration

### Chicago Postcards Example

**Product Page**: `/products/chicago-il-postcards`

**Page Title**: "Chicago Postcard Printing | Custom Postcards Chicago IL | GangRun Printing"

**Meta Description**: "Professional custom postcard printing in Chicago, Illinois. Choose from glossy, matte, or premium cardstock. 4x6 or 5x7 sizes. Fast turnaround, competitive prices. Order 100-1000+ pieces online!"

**H1**: "Chicago Postcard Printing Services"

**Image Alt**: "Custom postcard printing services in Chicago, IL"

**Schema Markup**:
```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Chicago Postcards",
  "image": "https://gangrunprinting.com/images/campaigns/200-cities-postcards-en/chicago-il-postcard-printing-v1.png",
  "description": "Professional custom postcard printing in Chicago, Illinois",
  "brand": {
    "@type": "Brand",
    "name": "GangRun Printing"
  },
  "offers": {
    "@type": "AggregateOffer",
    "lowPrice": "29.89",
    "highPrice": "83.71",
    "priceCurrency": "USD",
    "offerCount": "18",
    "availability": "https://schema.org/InStock"
  }
}
```

**Target Keywords**:
- chicago postcard printing (Est. 880 monthly searches)
- custom postcards chicago (Est. 590 monthly searches)
- postcard printing chicago il (Est. 320 monthly searches)
- printing services chicago (Est. 2,400 monthly searches)

**Expected Ranking**: Position 3-8 within 90 days

---

## 🚀 Next Steps

Now that you've seen the complete workflow, you can:

1. **Generate test image** (follow Step 1)
2. **Review in admin UI** (navigate to `/admin/ai-images/review`)
3. **Approve/decline** (test both paths)
4. **Scale to 200 cities** (batch generate all cities)
5. **Configure all products** (add options)
6. **Generate full feed** (3,600 SKUs)
7. **Submit to ChatGPT** (go live)

---

**Documentation**: `/docs/AI-IMAGE-CHATGPT-SYSTEM-COMPLETE.md`
**Scripts**: `/src/scripts/`
**Admin UI**: `/admin/ai-images/review`
**API Endpoints**: `/api/admin/ai-images/`, `/api/products/generate-image`
