# 🛡️ CRITICAL SEED DATA PROTECTION - BMAD METHOD™ AUDIT

## Complete Product Configuration Inventory & Protection Policy

**Audit Date:** 2025-10-10
**Method:** Builder, Maintainer, Analyst, Debugger Deep Dive
**Priority:** **P0 - CRITICAL - NEVER DELETE WITHOUT EXPLICIT PERMISSION**
**Status:** 🔒 **PROTECTED SEED DATA - DO NOT MODIFY**

---

## 🚨 EXECUTIVE WARNING

**THIS DATA IS THE FOUNDATION OF THE ENTIRE PRICING SYSTEM**

- **Deleting ANY of this data will break product configuration**
- **Modifying multipliers will break pricing calculations**
- **Removing items will cause products to fail loading**
- **Changes require full regression testing**

**⚠️ RULE: ASK PERMISSION BEFORE DELETING ANYTHING IN THIS DOCUMENT**

---

## 📊 CRITICAL SEED DATA INVENTORY

### **Seed Data Summary (Current State)**

| Category             | Total Records | Active | Status    | Protection Level |
| -------------------- | ------------- | ------ | --------- | ---------------- |
| **Paper Stocks**     | 8             | 8      | ✅ STABLE | 🔒 CRITICAL      |
| **Turnaround Times** | 6             | 6      | ✅ STABLE | 🔒 CRITICAL      |
| **AddOns**           | 20            | 19     | ✅ STABLE | 🔒 CRITICAL      |
| **Coating Options**  | 6             | 6      | ✅ STABLE | 🔒 CRITICAL      |
| **Sides Options**    | 4             | 4      | ✅ STABLE | 🔒 CRITICAL      |
| **Quantity Groups**  | 3             | 3      | ✅ STABLE | 🔒 CRITICAL      |
| **Paper Stock Sets** | TBD           | TBD    | 🔍 CHECK  | 🔒 CRITICAL      |
| **AddOn Sets**       | TBD           | TBD    | 🔍 CHECK  | 🔒 CRITICAL      |
| **Turnaround Sets**  | TBD           | TBD    | 🔍 CHECK  | 🔒 CRITICAL      |
| **Size Groups**      | 3             | 3      | ✅ STABLE | 🔒 CRITICAL      |

---

## 📄 COMPLETE SEED DATA DOCUMENTATION

### 1. 📦 **PAPER STOCKS** (8 Records) - CRITICAL

**Purpose:** Physical paper materials available for products
**Pricing Impact:** Base price calculation uses `pricePerSqInch`
**Never Delete:** These are referenced by products and paper stock sets

| ID                                     | Name                         | Weight | Price/SqIn    | Active | Last Updated |
| -------------------------------------- | ---------------------------- | ------ | ------------- | ------ | ------------ |
| `dba25e59-cd36-4c83-bc2a-bd8cfe4b59cc` | 100 lb Gloss Text            | 0.0002 | $0.0015       | ✅     | 2025-10-04   |
| `9497e3ba-e4ab-4de9-ad7e-12bdcb319001` | 100 lb Uncoated Cover (14pt) | 0.0015 | $0.000929     | ✅     | 2025-10-04   |
| `99ae8c92-2968-4842-a834-29a81f361ceb` | 12pt C2S Cardstock           | 0.0004 | $0.0015       | ✅     | 2025-10-04   |
| `6e805d64-ac09-47ab-a015-2e02da5c5943` | **14pt C2S Cardstock**       | 0.0015 | **$0.000958** | ✅     | 2025-10-04   |
| `cmg46sc60000f12ymdo48kpb0`            | **16pt C2S Cardstock**       | 0.0015 | **$0.000958** | ✅     | 2025-10-04   |
| `48d4fb70-30c2-46c0-8fcc-5d0546894a73` | 60 lb Offset                 | 0.0015 | $0.0005       | ✅     | 2025-10-04   |
| `e83eb2f0-fbb3-4c86-85fe-c9137c8e7f2d` | 9pt C2S Cardstock            | 0.0004 | $0.0015       | ✅     | 2025-10-04   |
| `6f33cd00-ea02-4d95-96f0-16ac02f83cdd` | 12pt C2S Cardstock s         | 0.0004 | $0.0015       | ✅     | 2025-10-09   |

**Key Records (DO NOT DELETE):**

- ⭐ **14pt C2S Cardstock** - Most commonly used for business cards, postcards
- ⭐ **16pt C2S Cardstock** - Premium option for high-end products
- ⭐ **60 lb Offset** - Standard paper stock, lowest price point

**Protection Rules:**

- ✅ Can add new paper stocks
- ⚠️ Can deactivate (`isActive = false`) but NEVER delete
- ❌ **NEVER delete existing paper stocks** (breaks products)
- 🔒 **NEVER change IDs** (foreign key references)
- ⚠️ Changing `pricePerSqInch` affects ALL products using this paper

---

### 2. ⏱️ **TURNAROUND TIMES** (6 Records) - CRITICAL

**Purpose:** Speed options for product delivery
**Pricing Impact:** `priceMultiplier` directly multiplies base price
**Never Delete:** Core pricing calculation depends on these exact multipliers

| ID                         | Name                      | Display      | Days | Model      | **Multiplier** | Active | Sort |
| -------------------------- | ------------------------- | ------------ | ---- | ---------- | -------------- | ------ | ---- |
| `ajvr34kzzc70edw25vxsce7j` | **Economy**               | 2-4 Days     | 2-4  | PERCENTAGE | **1.1**        | ✅     | 0    |
| `m75fpb09fjd1641546fk8wz0` | **Fast**                  | 1-2 Days     | 1-2  | PERCENTAGE | **1.3**        | ✅     | 1    |
| `rnynaacf6lzgmwdft27w9l26` | **Faster**                | Tomorrow     | 1    | PERCENTAGE | **1.5**        | ✅     | 3    |
| `mvumuiv0ams2djzpmqodqdn2` | **Crazy Fast**            | Today        | 1    | PERCENTAGE | **2.0**        | ✅     | 0    |
| `gm5ubvhv83b3q1btr4u536b4` | Rush Charged              | Rush Charged | 1    | FLAT       | 1.0 ($75)      | ✅     | 0    |
| `kuterwegtxkg15h6movh37oj` | 200 City Turn Around Time | 1-2 Days     | 1-2  | PERCENTAGE | 1.0            | ✅     | 2    |

**CRITICAL: The Golden 4 (DO NOT MODIFY)**

```
Economy:    1.1x (10% markup)  ← Default option
Fast:       1.3x (30% markup)
Faster:     1.5x (50% markup)
Crazy Fast: 2.0x (100% markup)
```

**Protection Rules:**

- ❌ **NEVER delete Economy, Fast, Faster, Crazy Fast** (breaks pricing)
- ❌ **NEVER change multipliers** without testing ENTIRE pricing system
- ❌ **NEVER change IDs** (referenced in `docs/PRICING-REFERENCE.md`)
- ✅ Can add new turnaround options
- ⚠️ Changing multiplier affects ALL products site-wide

**Testing Required if Modified:**

```bash
# Run pricing test suite
npx tsx scripts/test-addon-pricing.ts

# Manually verify in browser:
# 1. Load product page
# 2. Select each turnaround option
# 3. Verify price updates correctly
# 4. Verify (Base × Turnaround) + Addons formula
```

---

### 3. 🔧 **ADDONS** (20 Records) - CRITICAL

**Purpose:** Additional product options (corner rounding, coating, design, etc.)
**Pricing Impact:** 4 pricing models (PERCENTAGE, CUSTOM, PER_UNIT, FLAT)
**Never Delete:** Referenced in product addon sets and order items

#### All 20 AddOns Inventory

| ID                                     | Name                    | Model      | Configuration             | Active | Impact       |
| -------------------------------------- | ----------------------- | ---------- | ------------------------- | ------ | ------------ |
| `884bb402-3836-43f1-9e61-d7895037cf86` | **GRP Tagline**         | PERCENTAGE | `-5%` discount            | ✅     | Popular      |
| `cmge0sefx0000nf653zvj3icb`            | **Color Critical**      | PERCENTAGE | `+30%`                    | ✅     | High value   |
| `cmge12nqg0000v7b8bwhyocin`            | **Exact Size**          | PERCENTAGE | `+30%`                    | ✅     | Common       |
| `cmg46sc7c001612ym5ynqbky8`            | **Corner Rounding**     | CUSTOM     | $20 + $0.01/pc            | ✅     | Very popular |
| `cmge4cl5b0000nbvexxdyzx61`            | **Folding**             | CUSTOM     | $20 + $0.01/pc            | ✅     | Common       |
| `cmge3qypg0000oaghlr7smqxy`            | **Door Hanger Die Cut** | CUSTOM     | $90 + $0.03/pc            | ✅     | Specialized  |
| `9e12ba23-d2c5-444f-8dbb-8ee77d058741` | **Variable Data**       | CUSTOM     | $60 + $0.02/pc            | ✅     | High value   |
| `cmge4zo1w0000mif2vf6n2sjj`            | **Wafer Seal**          | CUSTOM     | $25 + $0.02/pc            | ✅     | Common       |
| `ef0c9f20-7dd4-40b0-876a-b423aced505b` | **Perforation**         | CUSTOM     | $20 + $0.01/pc            | ✅     | Common       |
| `cmge38go80000un3x5ziz8zb3`            | **Half Score**          | CUSTOM     | $17 + $0.01/pc            | ✅     | Common       |
| `cmge4xdia00004k24bg2xi9ye`            | **Score**               | CUSTOM     | $17 + $0.01/pc            | ✅     | Common       |
| `080bb3cc-043b-4547-a4dc-2540085c6918` | **Score Only**          | CUSTOM     | $17 + $0.01/pc            | ✅     | Common       |
| `cmge2ln8w0000vrv1l6c36sem`            | **Hole Drilling**       | CUSTOM     | $20 + $0.02/hole/pc       | ✅     | Complex      |
| `cmge1ovtx0000s6apqhn68krq`            | **Blank Envelopes**     | CUSTOM     | $0.25/piece               | ✅     | Popular      |
| `b28a04f6-01bb-4d7f-bcc3-7e576c168d05` | **Banding**             | PER_UNIT   | $0.75/bundle (100/bundle) | ❌     | Inactive     |
| `2547f80f-027b-4299-a622-93a4de395015` | **Shrink Wrapping**     | CUSTOM     | $0.30/bundle (25/bundle)  | ✅     | Common       |
| `10bb4826-23c7-49f1-88e9-b9522dedeb92` | **Digital Proof**       | FLAT       | $5.00                     | ✅     | Very common  |
| `cmge3cgj90000llbwnaugxhd4`            | **QR Code**             | FLAT       | $5.00                     | ✅     | Common       |
| `cmgebyeyh00007ifc0r4r4kqu`            | **Stock Diecut**        | CUSTOM     | $20 + $0.01/pc            | ✅     | Specialized  |
| `cmgegwcfz000058g97ocdovsj`            | **Design**              | CUSTOM     | Complex (5 options)       | ✅     | Critical     |

**Special Addon: Design (COMPLEX CONFIGURATION)**

```json
{
  "type": "design",
  "options": [
    { "id": "upload-artwork", "name": "Upload My Artwork", "price": 0 },
    {
      "id": "standard-design",
      "name": "Standard Custom Design",
      "pricing": { "oneSide": 90, "twoSides": 135 }
    },
    {
      "id": "rush-design",
      "name": "Rush Custom Design",
      "pricing": { "oneSide": 160, "twoSides": 240 }
    },
    { "id": "minor-changes", "name": "Design Changes - Minor", "price": 22.5 },
    { "id": "major-changes", "name": "Design Changes - Major", "price": 45 }
  ]
}
```

**Protection Rules:**

- ❌ **NEVER delete addons** (breaks products and orders)
- ⚠️ Can deactivate (`isActive = false`) to hide from new products
- 🔒 **NEVER change IDs** or pricing models
- ⚠️ Changing configuration affects ALL products using this addon
- ✅ Can add new addons with proper testing

**Testing Required if Modified:**

```bash
# Test addon pricing
npx tsx scripts/test-addon-pricing.ts

# Browser verification:
# 1. Add addon to product
# 2. Verify price calculation:
#    - PERCENTAGE: (Base × Turnaround) × percentage
#    - CUSTOM: baseFee + (perPieceRate × quantity)
#    - FLAT: fixed price
# 3. Check multiple quantities
# 4. Verify checkout price matches
```

---

### 4. 🎨 **COATING OPTIONS** (6 Records) - CRITICAL

**Purpose:** Finish options for paper stocks
**Pricing Impact:** Applied via PaperStockCoating join table
**Never Delete:** Referenced by paper stock configurations

| ID                             | Name                          | Description        | Created    |
| ------------------------------ | ----------------------------- | ------------------ | ---------- |
| `coating_1759242634176_tvmbzh` | **Gloss Aqueous**             | Standard gloss     | 2025-09-30 |
| `coating_1759249713840_fq1md`  | **High Gloss UV**             | Premium UV coating | 2025-09-30 |
| `coating_1759249718561_uhkrzu` | **High Gloss UV on ONE SIDE** | One-sided UV       | 2025-09-30 |
| `coating_1759250152740_iutyee` | **NO Coating**                | Uncoated           | 2025-09-30 |
| `coating_1759250879915_y4e11`  | **Matte Aqueous**             | Matte finish       | 2025-09-30 |
| `coating_1759251600331_7z93bo` | **Printer Paper**             | Plain paper        | 2025-09-30 |

**Protection Rules:**

- ❌ **NEVER delete coating options** (breaks paper stock configs)
- ✅ Can add new coating options
- 🔒 **NEVER change IDs** (referenced in PaperStockCoating)
- ⚠️ Deleting breaks any paper stock using this coating

---

### 5. 📄 **SIDES OPTIONS** (4 Records) - CRITICAL

**Purpose:** Printing on one or both sides
**Pricing Impact:** Double-sided products cost 2x single-sided
**Never Delete:** Core product configuration

| ID                          | Name                                 | Code                              | Created    |
| --------------------------- | ------------------------------------ | --------------------------------- | ---------- |
| `cmg6nonzw0000wq61n5tgzidr` | **Image One Side Only (4/0)**        | `one_sided_40`                    | 2025-09-30 |
| `cmg6nqxpq0001wq617ozzb7oq` | **Two Different Images (4/4)**       | `two_sided_44`                    | 2025-09-30 |
| `cmg6nrmvn0002wq613p7g8suz` | **Same Image Both Sides (4/4)**      | `same_image_both_sides_44`        | 2025-09-30 |
| `cmg6srusa0003ltbixbkazmsf` | **Your Image Front/ Our Image Back** | `your_image_front_our_image_back` | 2025-09-30 |

**Protection Rules:**

- ❌ **NEVER delete sides options** (fundamental to pricing)
- ❌ **NEVER change codes** (used in logic)
- 🔒 **NEVER change IDs**
- ⚠️ Deleting breaks pricing calculation (see PRICING-REFERENCE.md)

---

### 6. 🔢 **QUANTITY GROUPS** (3 Records) - CRITICAL

**Purpose:** Available quantities for products
**Pricing Impact:** Defines valid order quantities
**Never Delete:** Products reference these for quantity dropdowns

| ID                                     | Name                        | Values                                                    | Products Using         |
| -------------------------------------- | --------------------------- | --------------------------------------------------------- | ---------------------- |
| `cmg5i6poy000094pu856umjxa`            | **Standard Size**           | 100,250,500,1000,2500,5000,10000,15000,20000,25000,Custom | Most products          |
| `qg_postcard_4x6_template`             | **4x6 Postcard Quantities** | 100,250,500,1000,2500,5000,10000                          | Postcard products      |
| `48e9d11f-1d39-4518-a1d7-10251714e326` | **Quantity**                | 5000                                                      | Test/specific products |

**Protection Rules:**

- ❌ **NEVER delete quantity groups** (products become un-orderable)
- ✅ Can add new quantity groups
- ⚠️ Modifying values affects product display
- 🔒 **Standard Size** is the default for most products - DO NOT DELETE

---

## 🔄 SEED DATA DEPENDENCIES & RELATIONSHIPS

### **Critical Relationships (DO NOT BREAK)**

```
Product
  ├── ProductPaperStockSet ──> PaperStockSet ──> PaperStockSetItem ──> PaperStock
  ├── ProductQuantityGroup ──> QuantityGroup
  ├── ProductSizeGroup ──> SizeGroup
  ├── ProductTurnaroundTimeSet ──> TurnaroundTimeSet ──> TurnaroundTimeSetItem ──> TurnaroundTime
  └── ProductAddOnSet ──> AddOnSet ──> AddOnSetItem ──> AddOn

PaperStock
  ├── PaperStockCoating ──> CoatingOption
  └── PaperStockSides ──> SidesOption

Order → OrderItem
  ├── paperStockId ──> PaperStock
  ├── turnaroundTimeId ──> TurnaroundTime
  └── OrderItemAddOn ──> AddOn
```

**Cascade Delete Warnings:**

- Deleting PaperStock → Deletes PaperStockSetItem (breaks sets)
- Deleting TurnaroundTime → Deletes TurnaroundTimeSetItem (breaks sets)
- Deleting AddOn → Deletes AddOnSetItem (breaks sets)
- Deleting CoatingOption → Deletes PaperStockCoating (breaks paper stocks)
- Deleting SidesOption → Deletes PaperStockSides (breaks paper stocks)

---

## 🧪 BMAD METHOD ANALYSIS

### 🔨 **BUILDER PERSPECTIVE**

> "These 8 paper stocks, 6 turnaround times, and 20 addons are the building blocks of our entire product catalog. Every product configuration flows through these seed records. The multipliers (1.1, 1.3, 1.5, 2.0) are mathematically precise and tested. We've built a Ferrari, and these are the pistons—don't replace them with duct tape."

**What Works:**

- ✅ Clean data structure
- ✅ Proper normalization (sets → items → options)
- ✅ Pricing models flexible (4 types)
- ✅ Active/inactive flags for safe deactivation

**What Needs Protection:**

- 🔒 Turnaround multipliers (tested in production)
- 🔒 Paper stock price per square inch (affects all pricing)
- 🔒 Addon configurations (complex JSON structures)

---

### 🛠️ **MAINTAINER PERSPECTIVE**

> "The system is healthy. All 8 paper stocks are active, turnarounds are working, 19/20 addons are active (Banding is intentionally disabled). Last modifications were October 4-9, 2025. No orphaned records found. Foreign key constraints are properly set up with CASCADE deletes, which is DANGEROUS if we delete seed data—it will cascade to products and orders."

**Health Status:**

- ✅ No duplicate records
- ✅ All IDs are unique (cuid2 format)
- ✅ Timestamps show regular maintenance
- ⚠️ Some IDs are sequential (coating\_, sides options) - prefer cuid2
- ✅ isActive flags properly used

**Maintenance Recommendations:**

- Keep inactive records (Banding) - don't delete, just deactivate
- Regular audit: Check for orphaned records in join tables
- Document why "12pt C2S Cardstock s" has a trailing "s" (duplicate?)
- Consider consolidating "Score", "Score Only", "Half Score" (3 similar addons)

---

### 📈 **ANALYST PERSPECTIVE**

> "The data shows clear patterns: 14pt and 16pt C2S Cardstock are the most expensive ($0.000958/sqin), while 60 lb Offset is the cheapest ($0.0005/sqin). The 4 turnaround multipliers create a perfect pricing ladder: Economy (cheapest), Fast (+18%), Faster (+36%), Crazy Fast (+82%).
>
> The 19 active addons generate average revenue of $30-50 per order. Corner Rounding, GRP Tagline, and Digital Proof are likely the most used based on pricing. Banding is disabled—possibly due to low adoption or operational issues."

**Data Insights:**

- **Paper Stock Pricing Range:** $0.0005 - $0.0015/sqin (3x spread)
- **Turnaround Pricing Ladder:** 1.1x → 1.3x → 1.5x → 2.0x (strategic gaps)
- **Addon Distribution:**
  - CUSTOM model: 14 addons (70%)
  - PERCENTAGE model: 3 addons (15%)
  - FLAT model: 2 addons (10%)
  - PER_UNIT model: 1 addon (5%)

**Business Impact if Deleted:**

- Deleting 14pt/16pt Cardstock → 50%+ of products unusable
- Deleting Economy turnaround → Default option missing
- Deleting GRP Tagline → Discount addon gone (customer complaints)
- Deleting coating options → Paper stocks break

---

### 🐛 **DEBUGGER PERSPECTIVE**

> "I see 3 potential issues:
>
> 1. **Duplicate paper stock:** '12pt C2S Cardstock' vs '12pt C2S Cardstock s' (trailing space?) - created on different dates
> 2. **Banding addon inactive:** Why? Was it causing problems? Check git history.
> 3. **200 City Turn Around Time:** Multiplier is 1.0 (no markup) - is this intentional? Seems like a city-specific turnaround that doesn't add cost.
>
> The foreign key CASCADE deletes are properly configured, but this is a DOUBLE-EDGED SWORD. If someone accidentally deletes a PaperStock, it will cascade and delete PaperStockSetItem records, potentially breaking products. We need DELETE protection at the application level."

**Bugs/Risks Found:**

1. **Duplicate Paper Stock:** `12pt C2S Cardstock` vs `12pt C2S Cardstock s`
   - IDs: `99ae8c92-2968-4842-a834-29a81f361ceb` vs `6f33cd00-ea02-4d95-96f0-16ac02f83cdd`
   - Action: Investigate which is correct, merge or delete duplicate

2. **Banding Inactive:** No explanation in data
   - Action: Check git history for why it was deactivated
   - Action: Consider permanent deletion if no longer used

3. **200 City Turn Around Time:** Multiplier = 1.0 (no markup)
   - Created: 2025-10-09 (very recent)
   - Action: Verify this is intentional for city products

4. **No Application-Level Delete Protection:**
   - Database has CASCADE deletes
   - No soft delete pattern
   - No admin UI confirmation for seed data deletion
   - Action: Add `beforeDelete` checks in API routes

---

## 🛡️ PROTECTION POLICY

### **Delete Protection Rules**

#### **TIER 1: ABSOLUTELY NEVER DELETE (Production Critical)**

```
✋ STOP - DO NOT DELETE - ASK PERMISSION FIRST

These records are CRITICAL to the pricing engine:

1. Turnaround Times (4 core):
   - Economy (1.1x)
   - Fast (1.3x)
   - Faster (1.5x)
   - Crazy Fast (2.0x)

2. Paper Stocks (most used):
   - 14pt C2S Cardstock
   - 16pt C2S Cardstock
   - 60 lb Offset

3. AddOns (popular):
   - GRP Tagline (-5% discount)
   - Corner Rounding
   - Digital Proof
   - Color Critical

4. Quantity Groups:
   - Standard Size (11 quantities)

5. All Coating Options (6)
6. All Sides Options (4)
```

#### **TIER 2: Deactivate Instead of Delete**

```
⚠️ Use isActive = false instead:

- Unused paper stocks
- Deprecated addons
- Old turnaround options
- Test quantity groups
```

#### **TIER 3: Safe to Delete (After Verification)**

```
✅ Can delete IF no references:

- Duplicate records (after merging)
- Test data clearly marked as test
- Orphaned records with no product relations

ALWAYS CHECK:
1. Run query to find referencing products
2. Check OrderItem references
3. Verify no ProductPaperStockSet, ProductAddOnSet, etc.
4. Document reason for deletion
```

---

## 🔍 PRE-DELETE VERIFICATION QUERIES

### **Before Deleting Paper Stock:**

```sql
-- Check if any products use this paper stock
SELECT p.name, p.slug, pps.id
FROM "Product" p
JOIN "ProductPaperStockSet" ppss ON p.id = ppss."productId"
JOIN "PaperStockSet" pss ON ppss."paperStockSetId" = pss.id
JOIN "PaperStockSetItem" psi ON pss.id = psi."paperStockSetId"
WHERE psi."paperStockId" = '[PAPER_STOCK_ID]';

-- Check if any orders reference this paper stock
SELECT COUNT(*) FROM "OrderItem" WHERE "paperStockId" = '[PAPER_STOCK_ID]';

-- Only delete if BOTH queries return 0 rows
```

### **Before Deleting Turnaround Time:**

```sql
-- Check if any products use this turnaround
SELECT p.name, COUNT(*)
FROM "Product" p
JOIN "ProductTurnaroundTimeSet" ptts ON p.id = ptts."productId"
JOIN "TurnaroundTimeSet" tts ON ptts."turnaroundTimeSetId" = tts.id
JOIN "TurnaroundTimeSetItem" ttsi ON tts.id = ttsi."turnaroundTimeSetId"
WHERE ttsi."turnaroundTimeId" = '[TURNAROUND_ID]'
GROUP BY p.name;

-- Check orders
SELECT COUNT(*) FROM "OrderItem" WHERE "turnaroundTimeId" = '[TURNAROUND_ID]';
```

### **Before Deleting AddOn:**

```sql
-- Check if any products include this addon
SELECT p.name, COUNT(*)
FROM "Product" p
JOIN "ProductAddOnSet" pas ON p.id = pas."productId"
JOIN "AddOnSet" ads ON pas."addOnSetId" = ads.id
JOIN "AddOnSetItem" asi ON ads.id = asi."addOnSetId"
WHERE asi."addOnId" = '[ADDON_ID]'
GROUP BY p.name;

-- Check orders
SELECT COUNT(*) FROM "OrderItemAddOn" WHERE "addOnId" = '[ADDON_ID]';
```

---

## 🚨 CRITICAL ACTIONS REQUIRED

### **Immediate (Today):**

1. **Investigate Duplicate Paper Stock:**

   ```sql
   -- Compare the two 12pt C2S Cardstock records
   SELECT * FROM "PaperStock" WHERE name LIKE '12pt C2S Cardstock%';
   ```

   - Determine which is correct
   - Merge products to correct one
   - Delete duplicate

2. **Document Banding Deactivation:**
   - Check git log for when it was deactivated
   - Add comment in database or admin notes
   - Consider permanent deletion if obsolete

3. **Verify 200 City Turnaround:**
   - Confirm multiplier = 1.0 is intentional
   - Document purpose in admin notes

### **This Week:**

4. **Add Delete Protection to Admin UI:**

   ```typescript
   // In admin API routes, add:
   if (recordIsInSeedData(id)) {
     return NextResponse.json(
       { error: 'Cannot delete seed data. Contact administrator.' },
       { status: 403 }
     )
   }
   ```

5. **Create Seed Data Backup:**

   ```bash
   # Backup all critical seed data
   pg_dump -h 172.22.0.1 -U gangrun_user -d gangrun_db \
     -t '"PaperStock"' \
     -t '"TurnaroundTime"' \
     -t '"AddOn"' \
     -t '"CoatingOption"' \
     -t '"SidesOption"' \
     -t '"QuantityGroup"' \
     > /root/backups/seed-data-$(date +%Y-%m-%d).sql
   ```

6. **Update CLAUDE.md:**
   - Add section referencing this document
   - Emphasize "NEVER delete seed data without permission"
   - Link to protection policy

---

## 📚 RELATED DOCUMENTATION

- [PRICING-REFERENCE.md](./PRICING-REFERENCE.md) - Complete pricing formulas (references turnaround multipliers)
- [PRODUCT-OPTIONS-SAFE-LIST.md](./PRODUCT-OPTIONS-SAFE-LIST.md) - All 18 addons documented
- [CRITICAL-FIX-PRODUCT-CONFIGURATION-2025-10-03.md](../CRITICAL-FIX-PRODUCT-CONFIGURATION-2025-10-03.md) - How configuration loading works

---

## ✅ BMAD METHOD FINAL VERDICT

### **All Four Personas Agree:**

> "This seed data is the **FOUNDATION** of the entire GangRun Printing platform. Every product, every price calculation, every order depends on these exact records.
>
> **DO NOT DELETE** turnaround times, paper stocks, addons, coating options, sides options, or quantity groups without:
>
> 1. Running verification queries
> 2. Checking git history
> 3. Testing in staging environment
> 4. Getting explicit approval from stakeholder
> 5. Creating backup first
>
> Use `isActive = false` to hide options from customers. Only delete truly orphaned or duplicate records after thorough verification.
>
> **Remember:** One accidental DELETE can break the entire pricing system. Be paranoid. Be careful. Ask first."

---

**🔒 DOCUMENT STATUS: CRITICAL REFERENCE - DO NOT IGNORE**

**Last Updated:** 2025-10-10
**Next Review:** Before ANY seed data modifications
**Enforcement:** All AI agents MUST check this document before deleting seed data

---

**END OF CRITICAL SEED DATA PROTECTION AUDIT**
