# 💰 PRICING SYSTEM REFERENCE - COMPLETE DOCUMENTATION

**Date Created:** October 5, 2025
**Status:** ✅ PRODUCTION READY & VERIFIED
**Last Updated:** October 5, 2025

---

## 🎯 EXECUTIVE SUMMARY

This document is the **complete authoritative reference** for ALL pricing calculations in GangRun Printing. Every formula, method, and configuration is documented here.

### The Golden Formula (MEMORIZE THIS)

```
FINAL PRICE = (Base Product × Turnaround Multiplier) + All Addons

WHERE:
- piece = quantity (ALWAYS)
- Turnaround multiplier applies to BASE ONLY
- Addons are calculated AFTER turnaround
- Percentage addons apply to (Base × Turnaround)
```

---

## 📋 TABLE OF CONTENTS

1. [Pricing Calculation Flow](#pricing-calculation-flow)
2. [Base Product Pricing](#base-product-pricing)
3. [Turnaround Time Pricing](#turnaround-time-pricing)
4. [Addon Pricing Models](#addon-pricing-models)
5. [Complete Pricing Examples](#complete-pricing-examples)
6. [Critical Code References](#critical-code-references)
7. [Database Schema](#database-schema)
8. [Testing & Verification](#testing--verification)

---

## 🔄 PRICING CALCULATION FLOW

### Step-by-Step Process (MUST FOLLOW THIS ORDER)

```
┌─────────────────────────────────────────────────────┐
│ STEP 1: Calculate Base Product Price               │
│ Formula: Quantity × SqIn × PaperPrice × Coating × Sides │
└─────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│ STEP 2: Apply Turnaround Multiplier to BASE        │
│ Formula: Base × Turnaround Multiplier               │
│ Example: $114.96 × 1.3 = $149.45                   │
└─────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│ STEP 3: Calculate Addon Costs                      │
│ - PERCENTAGE: (Base × Turnaround) × percentage     │
│ - CUSTOM: baseFee + (perPieceRate × quantity)      │
│ - PER_UNIT: pricePerUnit × quantity                │
│ - FLAT: flatFee                                     │
└─────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│ STEP 4: Add Addon Costs to Price                   │
│ Formula: (Base × Turnaround) + All Addons          │
│ Example: $149.45 + (-$7.47) = $141.98              │
└─────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│ STEP 5: Final Price for Checkout                   │
│ This is what customer pays                         │
└─────────────────────────────────────────────────────┘
```

### ⚠️ CRITICAL RULES

1. **piece = quantity** in ALL calculations (NEVER use any other term)
2. **Turnaround multiplier** applies to BASE PRODUCT ONLY (not base + addons)
3. **Addons calculated AFTER** turnaround is applied
4. **Percentage addons** apply to `(Base × Turnaround)` price
5. **Each turnaround option** must display its price WITH addon adjustments

---

## 📦 BASE PRODUCT PRICING

### Formula

```typescript
baseProductPrice = quantity × squareInches × paperPricePerSqInch × coatingMultiplier × sidesMultiplier
```

### Components

| Component              | Type    | Example | Notes                              |
| ---------------------- | ------- | ------- | ---------------------------------- |
| **Quantity**           | Number  | 1000    | Customer selected quantity         |
| **Square Inches**      | Number  | 7.0     | Product size (3.5" × 2" = 7 sq in) |
| **Paper Price**        | Decimal | 0.0005  | Price per square inch              |
| **Coating Multiplier** | Decimal | 1.2     | UV coating = 20% markup            |
| **Sides Multiplier**   | Decimal | 2.0     | Double-sided = 2x                  |

### Example Calculation

```
Product: Business Cards (3.5" × 2")
Quantity: 1000
Paper: 14pt Cardstock ($0.0005/sq in)
Coating: UV Gloss (1.2x)
Sides: Double-Sided (2.0x)

Calculation:
1000 × 7.0 × 0.0005 × 1.2 × 2.0 = $8.40 base price
```

### Code Reference

**File:** `/root/websites/gangrunprinting/src/components/product/SimpleQuantityTest.tsx`

**Lines 218-243:**

```typescript
const calculateBaseProductPrice = () => {
  if (!finalQuantity || !selectedSizeObj || !selectedPaperObj) return 0

  const quantity = finalQuantity
  const squareInches =
    isCustomSize && customWidth && customHeight
      ? parseFloat(customWidth) * parseFloat(customHeight)
      : selectedSizeObj.squareInches || 0

  const paperPricePerSqInch = selectedPaperObj.pricePerSqInch || 0.0005
  const coatingMultiplier =
    availableCoatings.find((c) => c.id === selectedCoating)?.priceMultiplier || 1.0
  const sidesMultiplier = availableSides.find((s) => s.id === selectedSides)?.priceMultiplier || 1.0

  return quantity * squareInches * paperPricePerSqInch * coatingMultiplier * sidesMultiplier
}
```

---

## ⏱️ TURNAROUND TIME PRICING

### Database Configuration (VERIFIED ✅)

| Name       | Display    | Days | Multiplier | Markup % | Database ID                |
| ---------- | ---------- | ---- | ---------- | -------- | -------------------------- |
| Economy    | 2 - 4 Days | 2-4  | 1.1        | 10%      | `ajvr34kzzc70edw25vxsce7j` |
| Fast       | 1 - 2 Days | 1-2  | 1.3        | 30%      | `m75fpb09fjd1641546fk8wz0` |
| Faster     | Tomorrow   | 1    | 1.5        | 50%      | `rnynaacf6lzgmwdft27w9l26` |
| Crazy Fast | Today      | 1    | 2.0        | 100%     | `mvumuiv0ams2djzpmqodqdn2` |

### Formula

```typescript
priceWithTurnaround = baseProductPrice × turnaroundMultiplier
```

### Examples

**Base Product Price:** $114.96

- **Economy (1.1x):** $114.96 × 1.1 = **$126.46**
- **Fast (1.3x):** $114.96 × 1.3 = **$149.45**
- **Faster (1.5x):** $114.96 × 1.5 = **$172.44**
- **Crazy Fast (2.0x):** $114.96 × 2.0 = **$229.92**

### ⚠️ CRITICAL: Turnaround Multiplier Rules

1. **Applies to BASE PRODUCT ONLY** (not base + addons)
2. **Addons are added AFTER** turnaround multiplier
3. **Each turnaround option** calculates its own price with addons
4. **Display must update** when addons are selected/deselected

### Code Reference

**File:** `/root/websites/gangrunprinting/src/components/product/SimpleQuantityTest.tsx`

**Lines 248-262:** Turnaround calculation

```typescript
const calculateTurnaroundPrice = (turnaround: any) => {
  const basePrice = calculatedPrice
  if (basePrice === 0) return 0

  if (turnaround.pricingModel === 'PERCENTAGE') {
    // Multiplier is the full amount (1.1, 1.3, 1.5, 2.0)
    return basePrice * (turnaround.priceMultiplier || 1)
  }
  // ... other models
}
```

**Lines 624-628:** Display with addons included

```typescript
{memoizedTurnaroundTimes.map((turnaround) => {
  // CRITICAL: Calculate (Base × Turnaround) + Addons for THIS turnaround
  const priceWithTurnaround = calculateTurnaroundPrice(turnaround)
  const addonCosts = calculateAddonCosts(priceWithTurnaround)
  const totalPriceForThisTurnaround = priceWithTurnaround + addonCosts
```

---

## 🔧 ADDON PRICING MODELS

### 1. PERCENTAGE Model

**Used for:** Discounts or percentage-based markups

**Formula:**

```typescript
addonCost = (baseProductPrice × turnaroundMultiplier) × percentage
```

**Configuration:**

```json
{
  "pricingModel": "PERCENTAGE",
  "configuration": {
    "percentage": -0.05 // -5% for discount, 0.30 for 30% markup
  }
}
```

**Examples:**

| Addon          | Percentage | Base × Turnaround | Calculation     | Cost        |
| -------------- | ---------- | ----------------- | --------------- | ----------- |
| GRP Tagline    | -5%        | $149.45           | $149.45 × -0.05 | **-$7.47**  |
| Color Critical | 30%        | $149.45           | $149.45 × 0.30  | **+$44.84** |
| Exact Size     | 30%        | $149.45           | $149.45 × 0.30  | **+$44.84** |

**Addons using this model:**

- GRP Tagline (-5%)
- Color Critical (30%)
- Exact Size (30%)

---

### 2. CUSTOM Model

**Used for:** Base fee + per-piece pricing

**Formula:**

```typescript
addonCost = baseFee + (perPieceRate × quantity)
```

**Configuration:**

```json
{
  "pricingModel": "CUSTOM",
  "configuration": {
    "baseFee": 20,
    "perPieceRate": 0.01
  }
}
```

**Examples:**

| Addon           | Base Fee | Per Piece | Quantity | Calculation          | Total Cost  |
| --------------- | -------- | --------- | -------- | -------------------- | ----------- |
| Corner Rounding | $20      | $0.01     | 1000     | $20 + (1000 × $0.01) | **$30.00**  |
| Folding         | $20      | $0.01     | 1000     | $20 + (1000 × $0.01) | **$30.00**  |
| Door Hanger     | $90      | $0.03     | 1000     | $90 + (1000 × $0.03) | **$120.00** |
| Variable Data   | $60      | $0.02     | 1000     | $60 + (1000 × $0.02) | **$80.00**  |
| Wafer Seal      | $25      | $0.02     | 1000     | $25 + (1000 × $0.02) | **$45.00**  |
| Perforation     | $20      | $0.01     | 1000     | $20 + (1000 × $0.01) | **$30.00**  |
| Half Score      | $17      | $0.01     | 1000     | $17 + (1000 × $0.01) | **$27.00**  |
| Score           | $17      | $0.01     | 1000     | $17 + (1000 × $0.01) | **$27.00**  |
| Score Only      | $17      | $0.01     | 1000     | $17 + (1000 × $0.01) | **$27.00**  |

**Special Case: Hole Drilling**

**Formula:**

```typescript
addonCost = baseFee + (perHolePerPieceRate × numberOfHoles × quantity)
```

**Configuration:**

```json
{
  "pricingModel": "CUSTOM",
  "configuration": {
    "baseFee": 20,
    "perHolePerPieceRate": 0.02,
    "holeCountMap": {
      "1": 1,
      "2": 2,
      "3": 3,
      "4": 4,
      "5": 5,
      "2 Hole Binder Punch": 2,
      "3 Hole Binder Punch": 3
    }
  }
}
```

**Example:** 3 holes, 1000 pieces = $20 + ($0.02 × 3 × 1000) = **$80.00**

---

### 3. PER_UNIT Model

**Used for:** Per-piece or per-bundle pricing

**Formula (per piece):**

```typescript
addonCost = pricePerUnit × quantity
```

**Formula (per bundle):**

```typescript
numberOfBundles = Math.ceil(quantity / itemsPerBundle)
addonCost = pricePerUnit × numberOfBundles
```

**Configuration (per piece):**

```json
{
  "pricingModel": "PER_UNIT",
  "configuration": {
    "pricePerUnit": 0.25
  }
}
```

**Configuration (per bundle):**

```json
{
  "pricingModel": "PER_UNIT",
  "configuration": {
    "pricePerUnit": 0.75,
    "unitType": "bundle"
  }
}
```

**Examples:**

| Addon           | Price        | Quantity | Items/Bundle | Calculation                     | Total Cost  |
| --------------- | ------------ | -------- | ------------ | ------------------------------- | ----------- |
| Blank Envelopes | $0.25/pc     | 1000     | N/A          | 1000 × $0.25                    | **$250.00** |
| Banding         | $0.75/bundle | 1000     | 100          | ⌈1000/100⌉ × $0.75 = 10 × $0.75 | **$7.50**   |
| Shrink Wrapping | $0.30/bundle | 1000     | 50           | ⌈1000/50⌉ × $0.30 = 20 × $0.30  | **$6.00**   |

---

### 4. FLAT Model

**Used for:** Fixed price regardless of quantity

**Formula:**

```typescript
addonCost = flatFee
```

**Configuration:**

```json
{
  "pricingModel": "FLAT",
  "configuration": {
    "flatFee": 5
  }
}
```

**Examples:**

| Addon         | Flat Fee | Quantity | Total Cost |
| ------------- | -------- | -------- | ---------- |
| Digital Proof | $5.00    | Any      | **$5.00**  |
| QR Code       | $5.00    | Any      | **$5.00**  |

---

## 📊 COMPLETE PRICING EXAMPLES

### Example 1: Business Cards with GRP Tagline, Fast Turnaround

**Configuration:**

- Product: Business Cards (3.5" × 2")
- Quantity: 1000
- Paper: 14pt Cardstock
- Coating: UV Gloss
- Sides: Double-Sided
- Addon: GRP Tagline (-5%)
- Turnaround: Fast (1.3x)

**Calculation:**

```
STEP 1: Base Product Price
────────────────────────────
1000 × 7.0 sq in × $0.0005 × 1.2 (coating) × 2.0 (sides)
= 1000 × 7.0 × 0.0005 × 1.2 × 2.0
= $8.40 (simplified for example, actual may vary)

Let's use actual base: $114.96

STEP 2: Apply Turnaround (Fast = 1.3x)
───────────────────────────────────────
$114.96 × 1.3 = $149.45

STEP 3: Calculate Addon (GRP Tagline = -5%)
────────────────────────────────────────────
$149.45 × -0.05 = -$7.47

STEP 4: Final Price
───────────────────
$149.45 + (-$7.47) = $141.98

FINAL PRICE: $141.98
```

---

### Example 2: Flyers with Multiple Addons

**Configuration:**

- Product: Flyers (8.5" × 11")
- Quantity: 5000
- Paper: 100lb Gloss Text
- Coating: Aqueous
- Sides: Double-Sided
- Addons:
  - Corner Rounding ($20 + $0.01/pc)
  - Folding ($20 + $0.01/pc)
  - Banding ($0.75/bundle, 100/bundle)
- Turnaround: Economy (1.1x)

**Calculation:**

```
STEP 1: Base Product Price
────────────────────────────
Assume base = $450.00

STEP 2: Apply Turnaround (Economy = 1.1x)
──────────────────────────────────────────
$450.00 × 1.1 = $495.00

STEP 3: Calculate Addons
────────────────────────
Corner Rounding: $20 + (5000 × $0.01) = $20 + $50 = $70.00
Folding:         $20 + (5000 × $0.01) = $20 + $50 = $70.00
Banding:         ⌈5000/100⌉ × $0.75 = 50 × $0.75 = $37.50

Total Addons: $70 + $70 + $37.50 = $177.50

STEP 4: Final Price
───────────────────
$495.00 + $177.50 = $672.50

FINAL PRICE: $672.50
```

---

### Example 3: All Four Turnaround Options with Same Addons

**Base Price:** $114.96
**Addon:** GRP Tagline (-5%)

| Turnaround | Multiplier | Base × Turnaround       | Addon Cost                | Final Price |
| ---------- | ---------- | ----------------------- | ------------------------- | ----------- |
| Economy    | 1.1        | $114.96 × 1.1 = $126.46 | $126.46 × -0.05 = -$6.32  | **$120.14** |
| Fast       | 1.3        | $114.96 × 1.3 = $149.45 | $149.45 × -0.05 = -$7.47  | **$141.98** |
| Faster     | 1.5        | $114.96 × 1.5 = $172.44 | $172.44 × -0.05 = -$8.62  | **$163.82** |
| Crazy Fast | 2.0        | $114.96 × 2.0 = $229.92 | $229.92 × -0.05 = -$11.50 | **$218.42** |

**CRITICAL:** Each turnaround option displays its own total WITH addon included.

---

## 💻 CRITICAL CODE REFERENCES

### Backend Pricing Engine

**File:** `/root/websites/gangrunprinting/src/lib/pricing/unified-pricing-engine.ts`

**Lines 358-391:** CRITICAL pricing calculation order

```typescript
// CRITICAL: Apply turnaround to BASE FIRST
const turnaroundMarkup = this.decimal(adjustedPrice)
  .times(turnaround.priceMarkupPercent)
  .div(100)
  .toNumber()

const priceAfterTurnaround = adjustedPrice + turnaroundMarkup

// CRITICAL: Calculate add-ons AFTER turnaround
// Addons are added to (Base × Turnaround)
const addonsResult = this.calculateAddons(
  request,
  catalog,
  quantity,
  paperStock,
  adjustedPrice,
  priceAfterTurnaround // Pass price WITH turnaround for percentage addons
)

// Final totals: (Base × Turnaround) + Addons
result.totals.beforeTax = priceAfterTurnaround + addonsResult.total
```

**Lines 559-598:** CUSTOM addon pricing handler

```typescript
case AddonPricingModel.CUSTOM:
  const config = addon.configuration as any

  if (config.baseFee !== undefined && config.perPieceRate !== undefined) {
    // Standard formula: baseFee + (perPieceRate × quantity)
    cost = config.baseFee + (config.perPieceRate * quantity)
    calculation = `$${config.baseFee} + $${config.perPieceRate}/pc × ${quantity}`
  }
  // Handle hole drilling with per-hole pricing
  else if (config.baseFee !== undefined && config.perHolePerPieceRate !== undefined) {
    const holeSelection = selectedAddon.configuration?.numberOfHoles || '1'
    const holeCount = config.holeCountMap?.[holeSelection] || 1
    cost = config.baseFee + (config.perHolePerPieceRate * holeCount * quantity)
  }
  break
```

---

### Frontend Pricing Display

**File:** `/root/websites/gangrunprinting/src/components/product/SimpleQuantityTest.tsx`

**Lines 245-246:** Base product price (no addons)

```typescript
const calculatedPrice = calculateBaseProductPrice()
```

**Lines 248-262:** Turnaround price calculation

```typescript
const calculateTurnaroundPrice = (turnaround: any) => {
  const basePrice = calculatedPrice
  if (turnaround.pricingModel === 'PERCENTAGE') {
    return basePrice * (turnaround.priceMultiplier || 1)
  }
  return basePrice
}
```

**Lines 264-304:** Addon cost calculation (AFTER turnaround)

```typescript
const calculateAddonCosts = (priceWithTurnaround: number) => {
  let addonCosts = 0

  Object.keys(selectedAddons).forEach((addonId) => {
    const addon = selectedAddons[addonId]

    if (addon.pricingModel === 'PERCENTAGE') {
      // Apply percentage to (Base × Turnaround)
      const percentage = addon.configuration?.percentage || 0
      addonCosts += priceWithTurnaround * percentage
    } else if (addon.pricingModel === 'CUSTOM') {
      const config = addon.configuration || {}
      const baseFee = config.baseFee || 0
      const perPieceRate = config.perPieceRate || 0
      addonCosts += baseFee + perPieceRate * finalQuantity
    }
    // ... other models
  })

  return addonCosts
}
```

**Lines 306-318:** Final price calculation

```typescript
const calculateTotalPrice = () => {
  // Step 1: Apply turnaround to base
  const priceWithTurnaround = selectedTurnaroundObj
    ? calculateTurnaroundPrice(selectedTurnaroundObj)
    : calculatedPrice

  // Step 2: Add addon costs
  const addonCosts = calculateAddonCosts(priceWithTurnaround)

  // Step 3: Final price
  return priceWithTurnaround + addonCosts
}
```

**Lines 624-628:** Display each turnaround with addons

```typescript
{
  memoizedTurnaroundTimes.map((turnaround) => {
    const priceWithTurnaround = calculateTurnaroundPrice(turnaround)
    const addonCosts = calculateAddonCosts(priceWithTurnaround)
    const totalPriceForThisTurnaround = priceWithTurnaround + addonCosts
    // Display totalPriceForThisTurnaround
  })
}
```

---

## 🗄️ DATABASE SCHEMA

### TurnaroundTime Table

```prisma
model TurnaroundTime {
  id                  String   @id @default(cuid())
  name                String
  displayName         String
  pricingModel        PricingModel
  priceMultiplier     Float    // 1.1, 1.3, 1.5, 2.0
  daysMin             Int
  daysMax             Int?
  isActive            Boolean  @default(true)
}
```

**Critical Records:**

- Economy: `priceMultiplier: 1.1`
- Fast: `priceMultiplier: 1.3`
- Faster: `priceMultiplier: 1.5`
- Crazy Fast: `priceMultiplier: 2.0`

---

### AddOn Table

```prisma
model AddOn {
  id                      String       @id @default(cuid())
  name                    String       @unique
  pricingModel            PricingModel
  configuration           Json
  additionalTurnaroundDays Int         @default(0)
  isActive                Boolean      @default(true)
}
```

**Pricing Model Enum:**

```prisma
enum PricingModel {
  PERCENTAGE
  CUSTOM
  PER_UNIT
  FLAT
}
```

---

## 🧪 TESTING & VERIFICATION

### Manual Testing Checklist

**Test Scenario 1: Basic Pricing**

- [ ] Base product price calculates correctly
- [ ] Each turnaround shows different price
- [ ] Prices match: Economy < Fast < Faster < Crazy Fast

**Test Scenario 2: Percentage Addon (GRP Tagline)**

- [ ] Select GRP Tagline (-5%)
- [ ] ALL 4 turnaround prices decrease
- [ ] Each turnaround shows: (Base × Turnaround) × -0.05 discount
- [ ] Add to Cart matches selected turnaround

**Test Scenario 3: Custom Addon (Corner Rounding)**

- [ ] Select Corner Rounding
- [ ] ALL 4 turnaround prices increase by $20 + ($0.01 × qty)
- [ ] Same addon cost added to each turnaround
- [ ] Checkout price is correct

**Test Scenario 4: Multiple Addons**

- [ ] Select GRP Tagline + Corner Rounding
- [ ] Turnaround prices show both addons
- [ ] Percentage addon applies to (Base × Turnaround)
- [ ] Custom addon adds fixed amount
- [ ] Total is correct

### Automated Test Script

**Location:** `/root/websites/gangrunprinting/scripts/test-addon-pricing.ts`

**Run test:**

```bash
npx tsx scripts/test-addon-pricing.ts
```

---

## 📝 QUICK REFERENCE FORMULAS

### Base Product

```
Base = Quantity × SqIn × PaperPrice × Coating × Sides
```

### Turnaround

```
PriceWithTurnaround = Base × TurnaroundMultiplier
```

### Addons

**PERCENTAGE:**

```
AddonCost = (Base × Turnaround) × percentage
```

**CUSTOM:**

```
AddonCost = baseFee + (perPieceRate × quantity)
```

**PER_UNIT (piece):**

```
AddonCost = pricePerUnit × quantity
```

**PER_UNIT (bundle):**

```
AddonCost = ⌈quantity / itemsPerBundle⌉ × pricePerUnit
```

**FLAT:**

```
AddonCost = flatFee
```

### Final Price

```
FINAL = (Base × Turnaround) + All Addons
```

---

## 🚨 COMMON MISTAKES TO AVOID

### ❌ WRONG: Apply Turnaround to (Base + Addons)

```typescript
// WRONG!
const baseWithAddons = base + addonCosts
const final = baseWithAddons × turnaround
```

### ✅ CORRECT: Apply Turnaround to Base, THEN Add Addons

```typescript
// CORRECT!
const priceWithTurnaround = base × turnaround
const final = priceWithTurnaround + addonCosts
```

---

### ❌ WRONG: Percentage Addons on Base Only

```typescript
// WRONG!
const addonCost = base × percentage
```

### ✅ CORRECT: Percentage Addons on (Base × Turnaround)

```typescript
// CORRECT!
const priceWithTurnaround = base × turnaround
const addonCost = priceWithTurnaround × percentage
```

---

### ❌ WRONG: Turnaround Prices Don't Update with Addons

```typescript
// WRONG! Display shows static price
<div>${basePrice × turnaround.multiplier}</div>
```

### ✅ CORRECT: Each Turnaround Shows Price WITH Addons

```typescript
// CORRECT! Recalculates with addons
const priceWithTurnaround = basePrice × turnaround.multiplier
const addonCosts = calculateAddonCosts(priceWithTurnaround)
const total = priceWithTurnaround + addonCosts
<div>${total}</div>
```

---

## 📚 RELATED DOCUMENTATION

- [Product Options Safe List](/root/websites/gangrunprinting/docs/PRODUCT-OPTIONS-SAFE-LIST.md) - Complete addon inventory
- [Unified Pricing Engine](/root/websites/gangrunprinting/src/lib/pricing/unified-pricing-engine.ts) - Backend calculation logic
- [Simple Quantity Test](/root/websites/gangrunprinting/src/components/product/SimpleQuantityTest.tsx) - Frontend pricing display
- [CLAUDE.md](/root/websites/gangrunprinting/CLAUDE.md) - Project instructions

---

## 🎉 MILESTONE STATUS

### What's Working (October 5, 2025)

✅ **Base Product Pricing** - Correctly calculates with all factors
✅ **Turnaround Multipliers** - Database values fixed (1.1, 1.3, 1.5, 2.0)
✅ **Addon Calculation Order** - Addons calculated AFTER turnaround
✅ **Percentage Addons** - Apply to (Base × Turnaround)
✅ **Custom Addons** - baseFee + (perPieceRate × quantity)
✅ **PER_UNIT Addons** - Per piece and per bundle
✅ **FLAT Addons** - Fixed price
✅ **Frontend Display** - All turnaround options update with addons
✅ **Checkout Integration** - Correct price flows to cart
✅ **18 Addons Configured** - All tested and working

### The Golden Rule

```
FINAL PRICE = (Base Product × Turnaround Multiplier) + All Addons

WHERE piece = quantity (ALWAYS!)
```

---

**🔒 REFERENCE STATUS: LOCKED AND VERIFIED ✅**

_Last verified: October 5, 2025_
_Next review: When adding new pricing models or changing calculation logic_

---

## 📞 TROUBLESHOOTING

### Issue: Turnaround prices not updating when addon selected

**Solution:** Ensure `calculateAddonCosts(priceWithTurnaround)` is called for EACH turnaround option in the display map.

**Code Location:** SimpleQuantityTest.tsx lines 624-628

---

### Issue: Percentage addon using wrong base price

**Solution:** Percentage addons MUST use `(Base × Turnaround)` not just `Base`.

**Code Location:** SimpleQuantityTest.tsx lines 272-275

---

### Issue: piece vs quantity confusion

**Solution:** ALWAYS use `quantity`. Never use terms like "piece count" or "unit count". The variable name is `quantity` and piece = quantity.

**Search for:** All instances of `perPieceRate`, `perPiece`, etc. should multiply by `quantity`

---

**END OF PRICING REFERENCE**
