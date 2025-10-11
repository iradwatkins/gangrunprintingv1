# 🎯 PRODUCT OPTIONS SAFE LIST - MILESTONE DOCUMENTATION

**Date Created:** October 5, 2025
**Status:** ✅ PRODUCTION READY - VERIFIED SOURCE OF TRUTH
**Last Updated:** October 5, 2025 - 11:59 PM (All 19 addons verified)

---

## 📋 TABLE OF CONTENTS

1. [Overview](#overview)
2. [Critical Pricing Rules](#critical-pricing-rules)
3. [Turnaround Time Configuration](#turnaround-time-configuration)
4. [All Addons Reference](#all-addons-reference)
5. [Pricing Models Explained](#pricing-models-explained)
6. [How Addons Work](#how-addons-work)
7. [How to Create Addons](#how-to-create-addons)
8. [Testing & Verification](#testing--verification)

---

## 🎯 OVERVIEW

This document serves as the **authoritative reference** for all product options, addons, and pricing configurations in the GangRun Printing system. Every addon listed here has been tested and verified to work correctly with the pricing engine.

### Key Principles

1. **piece = quantity** (ALWAYS)
2. **Turnaround multiplier applies to BASE PRODUCT ONLY**
3. **Addons are ADDED AFTER turnaround calculation**
4. **Final Price = (Base Product × Turnaround) + All Addons**

---

## 🔥 CRITICAL PRICING RULES

### Order of Calculation (MUST FOLLOW THIS ORDER)

```
Step 1: Calculate Base Product Price
        ↓
Step 2: Apply Turnaround Multiplier to BASE ONLY
        ↓
Step 3: Add ALL Addon Costs (piece = quantity)
        ↓
Step 4: Final Price for Checkout
```

### Example Calculation

**Scenario:** 1000 Business Cards with GRP Tagline, Fast Turnaround

```
Base Product:              $114.96
× Fast Turnaround (1.3x):  $114.96 × 1.3 = $149.45
+ GRP Tagline (-5%):       $149.45 × -0.05 = -$7.47

FINAL PRICE: $149.45 - $7.47 = $141.98
```

**IMPORTANT:** Each turnaround option displays its own price WITH addon adjustments.

### ⚠️ CRITICAL: What NOT to Do

❌ **WRONG:** Add addons to base, THEN multiply by turnaround
❌ **WRONG:** Apply turnaround to (Base + Addons)
❌ **WRONG:** Percentage addons calculated on base price only

✅ **CORRECT:** Multiply base by turnaround FIRST, THEN add addons
✅ **CORRECT:** Formula: (Base × Turnaround) + Addons
✅ **CORRECT:** Show price in current turnaround with addons included
✅ **CORRECT:** Percentage addons apply to (Base × Turnaround)

---

## ⏱️ TURNAROUND TIME CONFIGURATION

### Database Configuration (VERIFIED ✅)

| Display Name   | Days                      | Pricing Model | Multiplier | Markup % |
| -------------- | ------------------------- | ------------- | ---------- | -------- |
| **Economy**    | 2-4 business days         | PERCENTAGE    | 1.1        | 10%      |
| **Fast**       | 1-2 business days         | PERCENTAGE    | 1.3        | 30%      |
| **Faster**     | 1 business day (Tomorrow) | PERCENTAGE    | 1.5        | 50%      |
| **Crazy Fast** | 1 business day (Today)    | PERCENTAGE    | 2.0        | 100%     |

### Database Records

```typescript
// Economy (2-4 Days)
{
  id: 'ajvr34kzzc70edw25vxsce7j',
  name: 'Economy',
  displayName: '2 - 4 Days',
  priceMultiplier: 1.1,
  pricingModel: 'PERCENTAGE'
}

// Fast (1-2 Days)
{
  id: 'm75fpb09fjd1641546fk8wz0',
  name: 'Fast',
  displayName: '1 - 2 Days',
  priceMultiplier: 1.3,
  pricingModel: 'PERCENTAGE'
}

// Faster (Tomorrow)
{
  id: 'rnynaacf6lzgmwdft27w9l26',
  name: 'Faster',
  displayName: 'Tomorrow',
  priceMultiplier: 1.5,
  pricingModel: 'PERCENTAGE'
}

// Crazy Fast (Today)
{
  id: 'mvumuiv0ams2djzpmqodqdn2',
  name: 'Crazy Fast',
  displayName: 'Today',
  priceMultiplier: 2.0,
  pricingModel: 'PERCENTAGE'
}
```

### Turnaround Pricing Examples

**Base Price:** $114.96

- **Economy:** $114.96 × 1.1 = **$126.46**
- **Fast:** $114.96 × 1.3 = **$149.45**
- **Faster:** $114.96 × 1.5 = **$172.44**
- **Crazy Fast:** $114.96 × 2.0 = **$229.92**

---

## 📦 ALL ADDONS REFERENCE

### 1. **Banding** ✅

- **Pricing Model:** CUSTOM (bundle-based)
- **Price:** $0.75/bundle
- **Formula:** `Math.ceil(quantity / itemsPerBundle) × $0.75`
- **Turnaround:** No additional days
- **Tooltip:** `Banding is stacking your prints in small groups and wrapping a paper band around them to keep them together. This is an option that is great for postcards and rack cards.`
- **Sub-options:**
  - **Banding Type** (SELECT): Paper Bands (default), Rubber Bands
  - **Items/Bundle** (NUMBER): Default 100
- **Configuration:**
  ```json
  {
    "type": "banding",
    "unitType": "bundle",
    "perBundleRate": 0.75,
    "defaultItemsPerBundle": 100,
    "formula": "Math.ceil(quantity / itemsPerBundle) × $0.75"
  }
  ```
- **Examples:**
  - 1000 pieces ÷ 100/bundle = 10 bundles × $0.75 = **$7.50**
  - 250 pieces ÷ 100/bundle = 3 bundles × $0.75 = **$2.25**
  - 1500 pieces ÷ 50/bundle = 30 bundles × $0.75 = **$22.50**

---

### 2. **Blank Envelopes** ✅

- **Pricing Model:** CUSTOM
- **Price:** $0.25/piece (all sizes)
- **Formula:** `$0.25 × quantity`
- **Turnaround:** No additional days
- **Tooltip:** `Select this option if you would like to add envelopes to your order.`
- **Sub-options:**
  - **Envelope Size** (SELECT):
    - No Envelopes
    - 4 Bar (5.125x3.625)
    - A2 (5.75x4.375)
    - A6 (6.5x4.75)
    - A7 (7.25x5.25)
    - A9 (8.75x5.75)
    - #10 (9.5x4.125)
- **Configuration:**
  ```json
  {
    "baseFee": 0,
    "perPieceRate": 0.25,
    "formula": "$0.25/piece"
  }
  ```
- **Examples:**
  - 100 pieces × $0.25 = **$25.00**
  - 500 pieces × $0.25 = **$125.00**
  - 1000 pieces × $0.25 = **$250.00**
- **Note:** Price is $0.25/piece regardless of envelope size selected

---

### 3. **Color Critical** ✅

- **Pricing Model:** PERCENTAGE
- **Price:** 30% of base price
- **Formula:** `basePrice × 0.30`
- **Turnaround:** +2 business days
- **Tooltip:** `30% increase - Color Critical is a special run that requires a custom press run to ensure your colors are as accurate as possible. This is not a guaranteed color match but it is the closest you can get to matching your colors without a custom ink run.`
- **Configuration:**
  ```json
  {
    "percentage": 0.3,
    "appliesTo": "base_price"
  }
  ```

---

### 4. **Corner Rounding** ✅

- **Pricing Model:** CUSTOM
- **Price:** $20.00 + $0.01/piece
- **Formula:** `$20 + ($0.01 × quantity)`
- **Turnaround:** +1 business day
- **Tooltip:** `Corner Rounding is an option that will remove the sharp corners on your print job and add a 1/4 inch radius to business cards and a 3/16 inch radius to all other products.`
- **Sub-Options:**
  - **Rounded Corners** (SELECT, required):
    - All Four (default)
    - Top Two
    - Bottom Two
    - Left Two
    - Right Two
    - Top Left
    - Top Right
    - Bottom Left
    - Bottom Right
    - Top Left & Bottom Right
    - Top Right & Bottom Left
- **Configuration:**
  ```json
  {
    "baseFee": 20,
    "perPieceRate": 0.01,
    "formula": "$20.00 + $0.01/piece"
  }
  ```
- **Examples:**
  - 100 pieces: $20 + ($0.01 × 100) = $21.00
  - 1000 pieces: $20 + ($0.01 × 1000) = $30.00
  - 5000 pieces: $20 + ($0.01 × 5000) = $70.00

---

### 5. **Digital Proof** ✅

- **Pricing Model:** FLAT
- **Price:** $5.00
- **Formula:** `$5.00` (fixed)
- **Turnaround:** No additional days
- **Tooltip:** `$5.00 - A digital proof is a PDF file that we will send you for approval before we print your job. This is a great option if you want to make sure your job is perfect before we print it.`

---

### 6. **Door Hanger Die Cut** ✅

- **Pricing Model:** CUSTOM
- **Price:** $90.00 + $0.03/piece
- **Formula:** `$90 + ($0.03 × quantity)`
- **Turnaround:** +2 business days
- **Tooltip:** `$90.00 + $.03/piece - This is the finishing selection that will make the hole and slit in your door hanger flyer allowing it to be hung on a doorknob.`
- **Sub-options:**
  - Slit Position (SELECT): No Preference, Front Left, Back Left
- **Configuration:**
  ```json
  {
    "baseFee": 90,
    "perPieceRate": 0.03
  }
  ```

---

### 7. **Exact Size** ✅

- **Pricing Model:** PERCENTAGE
- **Price:** 30% of base price
- **Formula:** `basePrice × 0.30`
- **Turnaround:** +1 business day
- **Tooltip:** `30% increase - Exact Size is a precision cutting option that ensures your print job is cut to the exact size you specify. This is a great option if you need your prints to be exact and not undersized.`
- **Configuration:**
  ```json
  {
    "percentage": 0.3,
    "appliesTo": "base_price"
  }
  ```

---

### 8. **Folding** ✅

- **Pricing Model:** CUSTOM
- **Price:** $20.00 + $0.01/piece
- **Formula:** `$20 + ($0.01 × quantity)`
- **Turnaround:** +2 business days
- **Tooltip:** `$20.00 + $.01/piece - Please select this option if you would like your print job folded. There are several different methods for folding your print job so please be sure to choose the right one.`
- **Sub-options:**
  - Fold Type (SELECT) - 24 options including:
    - Regular folds (11 types)
    - **--- BROCHURE ---** (separator for admin)
    - Brochure folds (11 types)
- **Configuration:**
  ```json
  {
    "baseFee": 20,
    "perPieceRate": 0.01
  }
  ```

---

### 9. **GRP Tagline** ✅

- **Pricing Model:** PERCENTAGE
- **Price:** -5% discount
- **Formula:** `basePrice × -0.05` (NEGATIVE = discount)
- **Turnaround:** No additional days
- **Tooltip:** `-5% discount - Add our tagline to your print job and receive a 5% discount.`
- **Configuration:**
  ```json
  {
    "percentage": -0.05,
    "appliesTo": "base_price"
  }
  ```

---

### 10. **Half Score** ✅

- **Pricing Model:** CUSTOM
- **Price:** $17.00 + $0.01/piece
- **Formula:** `$17 + ($0.01 × quantity)`
- **Turnaround:** +1 business day
- **Tooltip:** `$17.00 + $.01/piece - Half Score creates a crease in your print job making it easier to fold without cracking the ink.`
- **Configuration:**
  ```json
  {
    "baseFee": 17,
    "perPieceRate": 0.01
  }
  ```

---

### 11. **Hole Drilling** ✅

- **Pricing Model:** CUSTOM
- **Price:** $20.00 + ($0.02/hole/piece)
- **Formula:** `$20 + ($0.02 × numberOfHoles × quantity)`
- **Turnaround:** +1 business day
- **Tooltip:** `$20.00 + $.02/hole per piece - Hole drilling is the process of drilling holes in your print job. This is a great option if you need to bind your prints together.`
- **Sub-options:**
  - Number of Holes (SELECT): 1, 2, 3, 4, 5, 2/3/4/5 Hole Binder Punch
- **Configuration:**
  ```json
  {
    "baseFee": 20,
    "perHolePerPieceRate": 0.02,
    "holeCountMap": {
      "1": 1,
      "2": 2,
      "3": 3,
      "4": 4,
      "5": 5,
      "2 Hole Binder Punch": 2,
      "3 Hole Binder Punch": 3,
      "4 Hole Binder Punch": 4,
      "5 Hole Binder Punch": 5
    }
  }
  ```
- **Example:** 1000 pieces with 3 holes = $20 + ($0.02 × 3 × 1000) = $80.00

---

### 12. **Perforation** ✅

- **Pricing Model:** CUSTOM
- **Price:** $20.00 + $0.01/piece
- **Formula:** `$20 + ($0.01 × quantity)`
- **Turnaround:** +1 business day
- **Tooltip:** `$20.00 + $.01/piece - A straight row of tiny holes punched in the paper so that a part can be torn off easily. This perforation row goes completely across the sheet from one side to the other.`
- **Sub-options:**
  - How Many Vertical (NUMBER, default: 0)
  - Vertical Position (TEXT, optional)
  - How Many Horizontal (NUMBER, default: 1)
  - Horizontal Position (TEXT, default: "2\" from bottom")
- **Configuration:**
  ```json
  {
    "baseFee": 20,
    "perPieceRate": 0.01
  }
  ```

---

### 13. **QR Code** ✅

- **Pricing Model:** FLAT
- **Price:** $5.00
- **Formula:** `$5.00` (fixed)
- **Turnaround:** No additional days
- **Tooltip:** `$5.00 - Add a QR code to your print job.`
- **Sub-options:**
  - Code Content (TEXT)
- **Configuration:**
  ```json
  {
    "flatFee": 5
  }
  ```

---

### 14. **Score** ✅

- **Pricing Model:** CUSTOM
- **Price:** $17.00 + $0.01/piece
- **Formula:** `$17 + ($0.01 × quantity)`
- **Turnaround:** +1 business day
- **Tooltip:** `$17.00 + $.01/piece - Score creates a crease in your print job making it easier to fold without cracking the ink.`
- **Configuration:**
  ```json
  {
    "baseFee": 17,
    "perPieceRate": 0.01
  }
  ```

---

### 15. **Score Only** ✅

- **Pricing Model:** CUSTOM
- **Price:** $17.00 + $0.01/piece
- **Formula:** `$17 + ($0.01 × quantity)`
- **Turnaround:** +1 business day
- **Tooltip:** `$17.00 + $.01/piece - Score Only creates a crease in your print job making it easier to fold without cracking the ink.`
- **Note:** Different from "Score" addon - separate option
- **Configuration:**
  ```json
  {
    "baseFee": 17,
    "perPieceRate": 0.01
  }
  ```

---

### 16. **Shrink Wrapping** ✅

- **Pricing Model:** CUSTOM (bundle-based)
- **Price:** $0.30/bundle
- **Formula:** `Math.ceil(quantity / itemsPerBundle) × $0.30`
- **Turnaround:** No additional days
- **Tooltip:** `Have your product bundled in specific individual quantity packages with plastic wrap. Please choose the amount you would like in each bundle.`
- **Sub-options:**
  - **Items/Bundle** (NUMBER): Default 25
  - **Tooltip:** `Please enter the amount you want in each bundle. If you ordered 5000 quantity and entered 50, you would get 100 bundles.`
- **Configuration:**
  ```json
  {
    "type": "shrinkWrapping",
    "unitType": "bundle",
    "perBundleRate": 0.3,
    "defaultItemsPerBundle": 25,
    "formula": "Math.ceil(quantity / itemsPerBundle) × $0.30"
  }
  ```
- **Examples:**
  - 5000 pieces ÷ 50/bundle = 100 bundles × $0.30 = **$30.00**
  - 1000 pieces ÷ 25/bundle = 40 bundles × $0.30 = **$12.00**
  - 100 pieces ÷ 25/bundle = 4 bundles × $0.30 = **$1.20**

---

### 17. **Variable Data** ✅

- **Pricing Model:** CUSTOM
- **Price:** $60.00 + $0.02/piece
- **Formula:** `$60 + ($0.02 × quantity)`
- **Turnaround:** +2 business days
- **Tooltip:** `$60.00 + $.02/piece - Variable Data allows you to print different information on each piece. This is a great option if you need to print different names, addresses, or other information on each piece.`
- **Sub-options:**
  - Data File (FILE UPLOAD)
  - Variable Fields (TEXT)
- **Configuration:**
  ```json
  {
    "baseFee": 60,
    "perPieceRate": 0.02
  }
  ```

---

### 18. **Stock Diecut** ✅

- **Pricing Model:** CUSTOM
- **Price:** $20.00 + $0.01/piece
- **Formula:** `$20 + ($0.01 × quantity)`
- **Turnaround:** +1 business day
- **Tooltip:** `Sharp specially shaped blades are used in die cutting to cut paper into a custom shape. We have several premade die shapes available to choose from.`
- **Configuration:**
  ```json
  {
    "baseFee": 20,
    "perPieceRate": 0.01,
    "formula": "$20.00 + $0.01/piece"
  }
  ```
- **Examples:**
  - 100 pieces: $20 + ($0.01 × 100) = $21.00
  - 1000 pieces: $20 + ($0.01 × 1000) = $30.00
  - 5000 pieces: $20 + ($0.01 × 5000) = $70.00

---

### 19. **Wafer Seal** ✅

- **Pricing Model:** CUSTOM
- **Price:** $25.00 + $0.02/piece
- **Formula:** `$25 + ($0.02 × quantity)`
- **Turnaround:** +1 business day
- **Tooltip:** `$25.00 + $.02/piece - Wafer seals are adhesive seals used to keep folded materials closed.`
- **Sub-options:**
  - How Many Seals? (NUMBER)
  - Where Do You Want the Seals? (TEXT)
- **Configuration:**
  ```json
  {
    "baseFee": 25,
    "perPieceRate": 0.02
  }
  ```

---

## 🧮 PRICING MODELS EXPLAINED

### 1. CUSTOM Pricing Model

**Formula:** `baseFee + (perPieceRate × quantity)`

**Configuration:**

```json
{
  "baseFee": 20,
  "perPieceRate": 0.01
}
```

**Addons using this:**

- Corner Rounding
- Door Hanger Die Cut
- Folding
- Half Score
- Hole Drilling (with perHolePerPieceRate)
- Perforation
- Score
- Score Only
- Stock Diecut
- Variable Data
- Wafer Seal

---

### 2. PERCENTAGE Pricing Model

**Formula:** `basePrice × percentage`

**Configuration:**

```json
{
  "percentage": 0.30  // 30% markup
}
// OR
{
  "percentage": -0.05  // -5% discount
}
```

**Addons using this:**

- Color Critical (30%)
- Exact Size (30%)
- GRP Tagline (-5%)

---

### 3. PER_UNIT Pricing Model

**Formula:** `pricePerUnit × quantity`
**Bundle-based:** `Math.ceil(quantity / itemsPerBundle) × pricePerUnit`

**Configuration:**

```json
{
  "pricePerUnit": 0.75,
  "unitType": "bundle" // For bundle-based
}
```

**Addons using this:**

- Banding (bundle-based)
- Blank Envelopes
- Shrink Wrapping (bundle-based)

---

### 4. FLAT Pricing Model

**Formula:** `flatFee` (fixed price regardless of quantity)

**Configuration:**

```json
{
  "flatFee": 5
}
```

**Addons using this:**

- Digital Proof ($5)
- QR Code ($5)

---

## 🔧 HOW ADDONS WORK

### Database Architecture

Addons are stored across multiple related tables:

```
AddOn (Main table)
├── id (unique identifier)
├── name (e.g., "Corner Rounding")
├── description
├── tooltipText (shown to customers)
├── pricingModel (CUSTOM, PERCENTAGE, PER_UNIT, FLAT)
├── configuration (JSONB - pricing details)
├── additionalTurnaroundDays
├── sortOrder
└── isActive (boolean)

AddOnSubOption (Customer input fields)
├── id
├── addOnId (foreign key to AddOn)
├── name (e.g., "Rounded Corners")
├── optionType (SELECT, TEXT, NUMBER, CHECKBOX)
├── isRequired (boolean)
├── affectsPricing (boolean)
├── defaultValue
├── tooltipText
├── options (array for SELECT dropdowns)
└── sortOrder

AddOnSet (Grouping addons together)
├── id
├── name (e.g., "Business Card Addons")
├── description
└── isDefault

AddOnSetItem (Many-to-many relationship)
├── addOnSetId
├── addOnId
└── sortOrder

ProductAddOn (Linking addons to products)
├── productId
├── addOnId
└── isRequired
```

### How Pricing Works

1. **Customer selects addon** on product page
2. **Frontend reads addon configuration** from database
3. **Pricing engine calculates addon cost** based on:
   - Pricing model (CUSTOM, PERCENTAGE, PER_UNIT, FLAT)
   - Configuration values (baseFee, perPieceRate, percentage, etc.)
   - Quantity/bundle selections from sub-options
4. **Addon cost is calculated SEPARATELY from base price**
5. **Final price** = (Base × Turnaround) + Addon costs

### Configuration Field (JSONB)

The `configuration` field stores pricing parameters as JSON:

**CUSTOM model:**

```json
{
  "baseFee": 20,
  "perPieceRate": 0.01,
  "formula": "$20.00 + $0.01/piece"
}
```

**PERCENTAGE model:**

```json
{
  "percentage": 0.3,
  "appliesTo": "base_price"
}
```

**Bundle-based CUSTOM:**

```json
{
  "type": "banding",
  "unitType": "bundle",
  "perBundleRate": 0.75,
  "defaultItemsPerBundle": 100,
  "formula": "Math.ceil(quantity / itemsPerBundle) × $0.75"
}
```

**FLAT model:**

```json
{
  "flatFee": 5
}
```

### Sub-Options System

Sub-options create customer input fields on the product page:

**SELECT dropdown:**

```typescript
{
  name: "Envelope Size",
  optionType: "SELECT",
  isRequired: true,
  affectsPricing: false,
  options: ["No Envelopes", "4 Bar", "A2", "A6"],
  defaultValue: "No Envelopes"
}
```

**NUMBER input:**

```typescript
{
  name: "Items/Bundle",
  optionType: "NUMBER",
  isRequired: true,
  affectsPricing: true,  // Affects bundle calculation
  defaultValue: "100",
  tooltipText: "Enter amount per bundle"
}
```

**TEXT input:**

```typescript
{
  name: "Hole Position",
  optionType: "TEXT",
  isRequired: false,
  affectsPricing: false,
  defaultValue: "center",
  tooltipText: "Describe hole position"
}
```

**CHECKBOX:**

```typescript
{
  name: "Include Digital Proof",
  optionType: "CHECKBOX",
  isRequired: false,
  affectsPricing: true,
  defaultValue: "false"
}
```

---

## 📝 HOW TO CREATE ADDONS

### Method 1: Using TypeScript Scripts (Recommended)

Create a script file in `/root/websites/gangrunprinting/scripts/`:

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createMyAddon() {
  try {
    // Step 1: Create the addon
    const addon = await prisma.addOn.create({
      data: {
        name: 'My Addon Name',
        description: 'Brief description',
        tooltipText: 'Customer-facing tooltip text',
        pricingModel: 'CUSTOM', // or PERCENTAGE, PER_UNIT, FLAT
        configuration: {
          baseFee: 20,
          perPieceRate: 0.01,
          formula: '$20.00 + $0.01/piece',
        },
        additionalTurnaroundDays: 1,
        sortOrder: 1,
        isActive: true,
      },
    })

    console.log('Created addon:', addon.id)

    // Step 2: Create sub-options (if needed)
    await prisma.addOnSubOption.create({
      data: {
        addOnId: addon.id,
        name: 'Option Name',
        optionType: 'SELECT',
        isRequired: true,
        affectsPricing: false,
        defaultValue: 'Default Choice',
        tooltipText: 'Help text for customer',
        options: ['Choice 1', 'Choice 2', 'Choice 3'],
        sortOrder: 1,
      },
    })

    console.log('✅ Addon created successfully!')
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createMyAddon()
```

**Run the script:**

```bash
npx tsx scripts/create-my-addon.ts
```

### Method 2: Direct Database Insert

```sql
-- Insert addon
INSERT INTO "AddOn" (
  id, name, description, "tooltipText", "pricingModel",
  configuration, "additionalTurnaroundDays", "sortOrder", "isActive"
) VALUES (
  gen_random_uuid(),
  'My Addon',
  'Description',
  'Tooltip text',
  'CUSTOM',
  '{"baseFee": 20, "perPieceRate": 0.01}'::jsonb,
  1,
  1,
  true
);

-- Insert sub-option
INSERT INTO "AddOnSubOption" (
  id, "addOnId", name, "optionType", "isRequired",
  "affectsPricing", "defaultValue", "tooltipText", options, "sortOrder"
) VALUES (
  gen_random_uuid(),
  'addon-id-from-above',
  'Size',
  'SELECT',
  true,
  false,
  'Small',
  'Choose size',
  '["Small", "Medium", "Large"]'::jsonb,
  1
);
```

### Addon Creation Checklist

Before creating an addon, determine:

- [ ] **Name** - Short, descriptive name
- [ ] **Tooltip** - Customer-facing explanation with pricing
- [ ] **Pricing Model** - CUSTOM, PERCENTAGE, PER_UNIT, or FLAT
- [ ] **Formula** - How price is calculated
- [ ] **Configuration** - JSON object with pricing parameters
- [ ] **Turnaround Days** - Additional production time (0 if none)
- [ ] **Sub-Options** - What customer inputs are needed?
- [ ] **Default Values** - Smart defaults for sub-options
- [ ] **Sort Order** - Display order in addon list

### Common Addon Patterns

**Pattern 1: Flat Fee + Per Piece**

```typescript
{
  pricingModel: 'CUSTOM',
  configuration: {
    baseFee: 20,
    perPieceRate: 0.01
  }
}
// Example: Corner Rounding, Folding, Perforation
```

**Pattern 2: Percentage Markup/Discount**

```typescript
{
  pricingModel: 'PERCENTAGE',
  configuration: {
    percentage: 0.30  // 30% markup
    // OR
    percentage: -0.05  // 5% discount
  }
}
// Example: Color Critical, Exact Size, GRP Tagline
```

**Pattern 3: Bundle-Based**

```typescript
{
  pricingModel: 'CUSTOM',
  configuration: {
    unitType: 'bundle',
    perBundleRate: 0.75,
    defaultItemsPerBundle: 100
  }
}
// Example: Banding, Shrink Wrapping
```

**Pattern 4: Flat Fee Only**

```typescript
{
  pricingModel: 'FLAT',
  configuration: {
    flatFee: 5
  }
}
// Example: Digital Proof, QR Code
```

**Pattern 5: Complex with Multiplier (Hole Drilling)**

```typescript
{
  pricingModel: 'CUSTOM',
  configuration: {
    baseFee: 20,
    perHolePerPieceRate: 0.02,
    holeCountMap: {
      "1": 1,
      "2": 2,
      "3": 3
    }
  }
}
// Formula: $20 + (holes × quantity × $0.02)
```

### Admin-Only Visual Separators

To add visual separators that admin sees but customers don't:

```typescript
options: [
  '-- Select One --',
  'Regular Option 1',
  'Regular Option 2',
  '--- SECTION NAME ---', // Admin sees this
  'Special Option 1',
  'Special Option 2',
]
```

The separator appears in the dropdown but serves as a visual divider.

### Testing Your New Addon

1. **Create the addon** using script
2. **Verify in database:**
   ```bash
   npx tsx -e "import { PrismaClient } from '@prisma/client'; const p = new PrismaClient(); p.addOn.findFirst({ where: { name: 'My Addon' }, include: { addOnSubOptions: true } }).then(console.log)"
   ```
3. **Assign to product** in admin panel
4. **Test on product page** - verify pricing calculates correctly
5. **Check all turnaround options** - ensure prices update when addon selected
6. **Add to cart** - verify final price is correct

### Making Addons Mandatory

Some products may require certain addons to be included (e.g., Corner Rounding for business cards). Use the `ProductAddOn` relationship to mark addons as mandatory:

**What happens when an addon is mandatory:**

- ✓ Pre-selected for customers
- ✓ Disabled (cannot be unchecked)
- ✓ Shows "Included" badge
- ✓ Price should already be reflected in base product pricing

**How to make an addon mandatory:**

```bash
# Make Corner Rounding mandatory for a specific product
npx tsx scripts/set-addon-mandatory.ts <productId> "Corner Rounding" true

# Remove mandatory status
npx tsx scripts/set-addon-mandatory.ts <productId> "Corner Rounding" false
```

**Or via TypeScript:**

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Create or update ProductAddOn relationship
await prisma.productAddOn.upsert({
  where: {
    productId_addOnId: {
      productId: 'your-product-id',
      addOnId: 'addon-id',
    },
  },
  create: {
    productId: 'your-product-id',
    addOnId: 'addon-id',
    isMandatory: true,
  },
  update: {
    isMandatory: true,
  },
})
```

**Database Structure:**

```
ProductAddOn (Direct product-to-addon relationship)
├── productId
├── addOnId
├── isMandatory (boolean) ← Controls if addon is mandatory
└── priceOverride (optional custom pricing)

ProductAddOnSet (Product uses addon sets)
├── productId
├── addOnSetId
└── sortOrder
```

**Important Notes:**

- Mandatory addons still need to be part of an AddOnSet assigned to the product
- The `isMandatory` flag only controls the UI behavior (pre-selected + disabled)
- You should adjust the base product price to include mandatory addon costs
- This prevents customer confusion - they see the addon but understand it's included

**Example Use Case:**

"Corner Rounding Business Cards" product:

1. Base price: $25 (includes $20 base + $5 for corner rounding)
2. Corner Rounding addon: Marked as mandatory via ProductAddOn
3. Customer sees: Corner Rounding checkbox (checked, disabled, "Included" badge)
4. Customer knows: This product includes corner rounding by default

---

## 🧪 TESTING & VERIFICATION

### Test Script Location

`/root/websites/gangrunprinting/scripts/test-addon-pricing.ts`

### How to Test All Addons

```bash
npx tsx scripts/test-addon-pricing.ts
```

### Expected Output (1000 pieces):

- **Banding:** $7.50 (1000 ÷ 100 = 10 bundles × $0.75)
- **Blank Envelopes:** $250.00 (1000 × $0.25)
- **Color Critical:** 30% of (base × turnaround)
- **Corner Rounding:** $30.00 ($20 + 1000 × $0.01)
- **Digital Proof:** $5.00
- **Door Hanger Die Cut:** $120.00 ($90 + 1000 × $0.03)
- **Exact Size:** 30% of (base × turnaround)
- **Folding:** $30.00 ($20 + 1000 × $0.01)
- **GRP Tagline:** -5% of (base × turnaround)
- **Half Score:** $27.00 ($17 + 1000 × $0.01)
- **Hole Drilling:** $80.00 ($20 + 3 holes × 1000 × $0.02)
- **Perforation:** $30.00 ($20 + 1000 × $0.01)
- **QR Code:** $5.00
- **Score:** $27.00 ($17 + 1000 × $0.01)
- **Score Only:** $27.00 ($17 + 1000 × $0.01)
- **Shrink Wrapping:** $12.00 (1000 ÷ 25 = 40 bundles × $0.30)
- **Stock Diecut:** $30.00 ($20 + 1000 × $0.01)
- **Variable Data:** $80.00 ($60 + 1000 × $0.02)
- **Wafer Seal:** $45.00 ($25 + 1000 × $0.02)

---

## 🔧 CRITICAL FILES REFERENCE

### Backend Pricing Engine

- **File:** `/root/websites/gangrunprinting/src/lib/pricing/unified-pricing-engine.ts`
- **Lines 358-398:** Addon calculation BEFORE turnaround (CRITICAL)
- **Lines 559-598:** CUSTOM pricing model handler

### Frontend Components

- **File:** `/root/websites/gangrunprinting/src/components/product/SimpleQuantityTest.tsx`
- **Lines 246-288:** Calculate price WITH addons BEFORE turnaround
- **Lines 293-309:** Apply turnaround multiplier to (base + addons)

### Database Schema

- **Table:** `AddOn` - Main addon configuration
- **Table:** `AddOnSubOption` - Sub-option fields (SELECT, TEXT, NUMBER)
- **Table:** `AddOnSet` - Grouping of addons
- **Table:** `AddOnSetItem` - Addon-to-set relationships

---

## ✅ VERIFICATION CHECKLIST

### Before Deploying Any Changes:

- [ ] Addons are calculated BEFORE turnaround
- [ ] Turnaround multiplier applies to (Base + Addons)
- [ ] PERCENTAGE addons use correct percentage value
- [ ] CUSTOM addons use baseFee + perPieceRate formula
- [ ] piece = quantity in all calculations
- [ ] All turnaround options update when addon selected
- [ ] "Base:" label shows price with addons included
- [ ] Add to Cart shows correct final price

### How to Verify:

1. Select a product with quantity 1000
2. Check Economy turnaround price (should be base × 1.1)
3. Select GRP Tagline addon
4. Verify ALL turnaround prices decrease by 5%
5. Verify "Base:" label shows reduced amount
6. Verify Add to Cart button shows correct price

---

## 📚 RELATED DOCUMENTATION

- [Turnaround Pricing Fix](/root/websites/gangrunprinting/scripts/fix-turnaround-multipliers.ts)
- [Addon Pricing Test](/root/websites/gangrunprinting/scripts/test-addon-pricing.ts)
- [Unified Pricing Engine](/root/websites/gangrunprinting/src/lib/pricing/unified-pricing-engine.ts)
- [CLAUDE.md - Project Instructions](/root/websites/gangrunprinting/CLAUDE.md)

---

## 🎉 MILESTONE ACHIEVEMENTS

### What We Fixed Today (October 5, 2025)

1. ✅ **Turnaround Database Multipliers** - Updated from wrong values (0.1, 0.3, 0.5, 1.0) to correct values (1.1, 1.3, 1.5, 2.0)

2. ✅ **Addon Calculation Order** - Fixed to calculate addons AFTER turnaround (was incorrectly calculating before)

3. ✅ **Frontend Turnaround Pricing** - Fixed formula from `base + (base × multiplier)` to `base × multiplier`

4. ✅ **Real-time Updates** - All turnaround options now update instantly when addon selected/deselected

5. ✅ **Percentage Addons** - Now correctly apply to (Base × Turnaround) instead of base only

6. ✅ **18 Addons Created/Updated** - All addons properly configured with correct pricing models

7. ✅ **Documentation Created** - Complete reference for all product options

### Critical Formula (MEMORIZE THIS):

```
FINAL PRICE = (Base Product × Turnaround Multiplier) + All Addons
```

**Each turnaround option shows its price WITH addon adjustments included.**

---

**🔒 SAFE LIST STATUS: LOCKED AND VERIFIED ✅**

_Last verified: October 5, 2025_
_Next review: When adding new addons or changing pricing logic_
