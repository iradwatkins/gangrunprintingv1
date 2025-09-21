# Product Configuration Backup

Last Updated: 2025-09-21T19:36:09.922Z

## ⚠️ CRITICAL PROTECTION NOTICE

This document serves as the human-readable backup for all product configuration data. The companion file `PRODUCT_MASTER_CONFIG.json` contains the complete machine-readable configuration that must NEVER be deleted.

## Quick Recovery Commands

If configurations are missing, the AI agent should:
1. Read `PRODUCT_MASTER_CONFIG.json`
2. Restore each section using the data provided
3. Verify all relationships between sections are intact

## Current Active Configurations

### All Products
- **Total Products**: 0
- **Status**: Empty - No products exist yet
- **Categories Available**: 4 (Business Cards, Flyers, Posters, Brochures)
- **Last Modified**: N/A
- **Implementation**: `/src/app/api/products/route.ts`

*No products have been created yet in the system*

### Categories
- **Total Categories**: 4
- **Structure**: Flat (no parent-child relationships)
- **Implementation**: `/src/app/api/product-categories/route.ts`

**Categories List:**
1. **Business Cards** (ID: zjg5ia39fjfjsva8f0oq64gl)
   - Slug: business-cards
   - Description: Professional business cards with multiple finish options
   - Sort Order: 1
   - Products: 0

2. **Flyers** (ID: bktx0lw5i7an5tlc4m5poj8c)
   - Slug: flyers
   - Description: High-quality flyers for marketing and promotions
   - Sort Order: 2
   - Products: 0

3. **Posters** (ID: wxidak74ydl2o2tzelgjg2ws)
   - Slug: posters
   - Description: Large format posters for maximum impact
   - Sort Order: 3
   - Products: 0

4. **Brochures** (ID: hc1jc8hxplz7895o4ea8gle8)
   - Slug: brochures
   - Description: Professional brochures for business presentations
   - Sort Order: 4
   - Products: 0

### Paper Stocks
- **Total Options**: 11
- **Most Used**: 16pt Premium Cover (2 products), Others (1 product each)
- **Implementation**: `/src/app/api/paper-stocks/route.ts`

**Paper Stocks List:**

1. **100% Recycled 14pt** (paper_recycled_14pt)
   - Weight: 0.014 inches
   - Price: $0.0013/sq inch
   - Tooltip: 100% post-consumer recycled content with eco-friendly coating
   - Coatings: Aqueous
   - Sides: Single (1x), Double (1.5x)

2. **100lb Gloss Text** (paper_100lb_gloss_text)
   - Weight: 0.007 inches
   - Price: $0.0008/sq inch
   - Tooltip: Standard flyer stock - good quality at an affordable price
   - Coatings: Gloss Coating
   - Sides: Single (1x), Double (1.4x)

3. **100lb Matte Text** (paper_100lb_matte_text)
   - Weight: 0.007 inches
   - Price: $0.0008/sq inch
   - Tooltip: Matte finish for reduced glare - ideal for text-heavy designs
   - Coatings: Matte Coating
   - Sides: Single (1x), Double (1.4x)

4. **12pt C2S Poster** (paper_12pt_c2s_poster)
   - Weight: 0.012 inches
   - Price: $0.001/sq inch
   - Tooltip: Standard poster stock with satin finish - good for indoor use
   - Coatings: Satin Coating
   - Sides: Single only (1x)

5. **14pt Gloss Cover** (paper_14pt_gloss_cover)
   - Weight: 0.014 inches
   - Price: $0.0012/sq inch
   - Tooltip: Our most popular business card stock - thick and durable with a glossy finish
   - Coatings: Gloss Coating
   - Sides: Single (1x), Double (1.5x)

6. **14pt Matte Cover** (paper_14pt_matte_cover)
   - Weight: 0.014 inches
   - Price: $0.0012/sq inch
   - Tooltip: Professional matte finish - no glare, easy to write on
   - Coatings: Matte Coating
   - Sides: Single (1x), Double (1.5x)

7. **16pt Premium Cover** (paper_16pt_premium_cover)
   - Weight: 0.016 inches
   - Price: $0.0015/sq inch
   - Tooltip: Extra thick premium stock with UV coating for maximum impact
   - Coatings: UV Coating (default), Gloss Coating
   - Sides: Single (1x), Double (1.5x)

8. **32pt Suede** (paper_32pt_suede)
   - Weight: 0.032 inches
   - Price: $0.003/sq inch
   - Tooltip: Luxury suede finish - ultra-thick with velvet-like texture
   - Coatings: Soft Touch
   - Sides: Single (1x), Double (1.5x)

9. **32pt UltraThick** (paper_32pt_ultrathick)
   - Weight: 0.032 inches
   - Price: $0.0028/sq inch
   - Tooltip: Ultra-thick premium cardstock for luxury business cards
   - Coatings: Matte Coating (default), Gloss Coating
   - Sides: Single (1x), Double (1.5x)

10. **80lb Gloss Cover** (paper_80lb_gloss_cover)
    - Weight: 0.009 inches
    - Price: $0.0011/sq inch
    - Tooltip: Thick cover stock for premium flyers and handouts
    - Coatings: Gloss Coating
    - Sides: Single (1x), Double (1.45x)

11. **Metallic Pearl** (paper_metallic_pearl)
    - Weight: 0.014 inches
    - Price: $0.0024/sq inch
    - Tooltip: Shimmering pearl finish for elegant designs
    - Coatings: Pearlescent
    - Sides: Single (1x), Double (1.5x)

### Add-ons
- **Total Options**: 19
- **Most Complex**: Variable Data Printing, Corner Rounding
- **Implementation**: `/src/app/api/add-ons/route.ts`

**Add-ons by Category:**

**Finishing Effects:**
1. **Corner Rounding** - $20.00 + $0.01/piece
2. **Foil Stamping** - +35% of base price
3. **Embossing** - +30% of base price
4. **Spot UV** - +25% of base price
5. **Raised Spot UV** - +40% of base price
6. **Letterpress** - +45% of base price
7. **Edge Painting** - $30.00 + $0.03/piece

**Special Features:**
8. **Variable Data Printing** - $60.00 + $0.02/piece
9. **Perforation** - $25.00 + $0.005/piece
10. **Die Cutting** - $50.00 + $0.02/piece
11. **Folding** - $20.00 + $0.01/piece
12. **Scoring** - $15.00 + $0.005/piece
13. **Hole Drilling** - $10.00 + $5.00/hole

**Card Enhancements:**
14. **Plastic Card** - +60% of base price
15. **Magnetic Strip** - $40.00 + $0.05/piece
16. **Signature Strip** - $10.00 + $0.01/piece
17. **Scratch-off Panel** - $35.00 + $0.04/piece

**Packaging:**
18. **Banding** - $15.00 + $2.00/bundle
19. **Shrink Wrapping** - $25.00 + $3.00/bundle

### Paper Stock Sets
- **Total Sets**: 0
- **Status**: ❌ INACTIVE - API Error
- **Implementation**: `/src/app/api/paper-stock-sets/route.ts`
- **Issue**: "Failed to fetch paper stock sets"

*This section needs investigation and repair*

### Quantities
- **Total Options**: 0
- **Status**: ❌ INACTIVE - Empty
- **Implementation**: `/src/app/api/quantities/route.ts`

*No quantity configurations exist - needs setup*

### Sizes
- **Total Options**: 0
- **Status**: ❌ INACTIVE - API Error
- **Implementation**: `/src/app/api/sizes/route.ts`
- **Issue**: "Failed to fetch size groups"

*This section needs investigation and repair*

### Add-on Sets
- **Total Sets**: 0
- **Status**: ❌ INACTIVE - Not Implemented
- **Implementation**: Not found

*No API endpoint exists for addon sets - needs implementation*

### Turnaround Times
- **Total Options**: 0
- **Status**: ❌ INACTIVE - Empty
- **Implementation**: `/src/app/api/turnaround-times/route.ts`

*No turnaround time configurations exist - needs setup*

### Turnaround Time Sets
- **Total Sets**: 0
- **Status**: ❌ INACTIVE - Empty
- **Implementation**: `/src/app/api/turnaround-time-sets/route.ts`

*No turnaround time set configurations exist - needs setup*

## Recovery Log

### 2025-09-21T19:36:09.922Z - Initial Protection System Setup
- **Action**: Created protection system from existing data
- **Sections Recovered**: Categories (4), Paper Stocks (11), Add-ons (19)
- **Issues Identified**: 5 sections need attention
- **Status**: Protection system established

## Critical Issues Requiring Attention

1. **Paper Stock Sets API** - Returns error, needs debugging
2. **Sizes API** - Returns error, needs debugging
3. **Quantities Configuration** - Empty, needs data setup
4. **Turnaround Times** - Empty, needs data setup
5. **Add-on Sets Implementation** - Missing API endpoint
6. **Products** - Zero products exist, normal for new system

## Manual Recovery Instructions

### If PRODUCT_MASTER_CONFIG.json is lost:

1. **Immediate Actions:**
   ```bash
   # Stop all work and assess damage
   echo "CRITICAL: PRODUCT_MASTER_CONFIG.json missing!"
   ```

2. **Data Extraction Process:**
   ```bash
   # Extract current data from APIs
   curl http://localhost:3002/api/product-categories > categories.json
   curl http://localhost:3002/api/paper-stocks > paper-stocks.json
   curl http://localhost:3002/api/add-ons > addons.json
   curl http://localhost:3002/api/products > products.json
   ```

3. **Rebuild Configuration:**
   - Use this backup document as reference
   - Recreate PRODUCT_MASTER_CONFIG.json structure
   - Import data from API extractions
   - Verify all relationships intact

4. **Verification Steps:**
   - Check all API endpoints respond correctly
   - Verify data consistency
   - Test one complete product configuration
   - Update changelog with recovery details

### Database-Level Recovery:

If APIs are non-functional, direct database queries:
```sql
-- Categories
SELECT * FROM "ProductCategory" ORDER BY "sortOrder";

-- Paper Stocks
SELECT ps.*, psc.*, pss.* FROM "PaperStock" ps
LEFT JOIN "PaperStockCoating" psc ON ps.id = psc."paperStockId"
LEFT JOIN "PaperStockSides" pss ON ps.id = pss."paperStockId";

-- Add-ons
SELECT * FROM "AddOn" WHERE "isActive" = true ORDER BY "sortOrder";
```

## Protection Protocol Summary

**SACRED FILES:**
- ✅ `PRODUCT_MASTER_CONFIG.json` - Machine-readable source of truth
- ✅ `PRODUCT_CONFIG_BACKUP.md` - Human-readable documentation

**WORKING CONFIGURATIONS:**
- ✅ Categories (4 active)
- ✅ Paper Stocks (11 active)
- ✅ Add-ons (19 active)

**BROKEN/MISSING CONFIGURATIONS:**
- ❌ Paper Stock Sets (API error)
- ❌ Sizes (API error)
- ❌ Quantities (empty)
- ❌ Turnaround Times (empty)
- ❌ Add-on Sets (not implemented)

**NEXT STEPS:**
1. Fix API errors for Paper Stock Sets and Sizes
2. Configure Quantities and Turnaround Times
3. Implement Add-on Sets functionality
4. Create first products to test system

---
*This backup document ensures all configuration data can be recovered manually if needed. Keep this file synchronized with PRODUCT_MASTER_CONFIG.json.*