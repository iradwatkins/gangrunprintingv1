# Southwest Cargo Pricing Analysis

## WooCommerce Configuration (from .aaaaaa/southwest/\*.png)

### Image Analysis

**Image 1: Southwest Dash (Next Available Flight) - 101+ lbs**

- Condition: Weight ≥ 101
- Shipping cost: $133
- Handling fee: $10
- Cost per weight: $1.75/lb
- **Formula: $133 + $10 + (weight × $1.75)**

**Image 2: Southwest Cargo Dash - 0-50 lbs**

- Condition: Weight ≤ 50
- Shipping cost: $85
- Handling fee: $10
- Cost per weight: $0
- **Formula: $85 + $10 = $95 flat**

**Image 3: Southwest Dash - 51-100 lbs**

- Condition: Weight ≥ 51 AND Weight ≤ 100
- Shipping cost: $133
- Handling fee: $10
- Cost per weight: $0
- **Formula: $133 + $10 = $143 flat**

**Image 4: Southwest Cargo Pickup - 51+ lbs**

- Condition: Weight ≥ 51
- Shipping cost: $102
- Handling fee: (blank - "Fixed or percentage")
- Cost per weight: $1.75/lb
- **Formula: $102 + (weight × $1.75)**

**Image 5: Southwest Cargo Pickup - 0-50 lbs**

- Condition: Weight ≤ 50
- Shipping cost: $80
- Handling fee: (blank)
- Cost per weight: $0
- **Formula: $80 flat**

## Current Next.js Implementation

### PICKUP Tiers

1. **≤50 lbs:** $80 base + ($0 × weight) + $0 handling = **$80 flat** ✅
2. **51-100 lbs:** $102 base + ($1.75 × weight) + $0 handling = **$102 + (weight × $1.75)** ❌
3. **101+ lbs:** $133 base + ($1.75 × weight) + $10 handling = **$133 + (weight × $1.75) + $10** ❌

### DASH Tiers

1. **≤50 lbs:** $85 base + ($0 × weight) + $10 handling = **$95 flat** ✅
2. **51-100 lbs:** $133 base + ($0 × weight) + $10 handling = **$143 flat** ✅
3. **101+ lbs:** $133 base + ($1.75 × weight) + $10 handling = **$133 + (weight × $1.75) + $10** ✅

## Problem Analysis

### PICKUP Service Issue

**WooCommerce configuration shows 2 tiers for Pickup:**

- Image 5: ≤50 lbs → $80 flat
- Image 4: ≥51 lbs → $102 + (weight × $1.75)

**Current Next.js implementation has 3 tiers:**

- Tier 1: ≤50 lbs → $80 (correct)
- Tier 2: 51-100 lbs → $102 + (weight × $1.75) (OVERCOMPLICATED)
- Tier 3: 101+ lbs → $133 + (weight × $1.75) + $10 (NOT IN WOOCOMMERCE)

### The Real WooCommerce Logic

Looking at Image 4 more carefully - it only shows **ONE condition for 51+ lbs**.

This means WooCommerce has:

- **Tier 1:** ≤50 lbs = $80 flat
- **Tier 2:** ≥51 lbs = $102 + (weight × $1.75)

There is NO third tier for Pickup in WooCommerce!

### DASH Service - Appears Correct

**WooCommerce shows 3 separate shipping methods:**

- Image 2: ≤50 lbs → $95
- Image 3: 51-100 lbs → $143
- Image 1: ≥101 lbs → $133 + $10 + (weight × $1.75) = $143 + (weight × $1.75)

Current implementation matches this! ✅

## Required Fix

### PICKUP Service Must Be Simplified

**Change from 3 tiers to 2 tiers:**

```typescript
pickup: {
  weightTiers: [
    {
      maxWeight: 50,
      baseRate: 80.0,
      additionalPerPound: 0,
      handlingFee: 0,
    },
    {
      maxWeight: Infinity,
      baseRate: 102.0,
      additionalPerPound: 1.75,
      handlingFee: 0,
    },
  ],
}
```

### Test Cases After Fix

| Weight  | Pickup (Expected) | Pickup (Current) | Status         |
| ------- | ----------------- | ---------------- | -------------- |
| 10 lbs  | $80.00            | $80.00           | ✅             |
| 50 lbs  | $80.00            | $80.00           | ✅             |
| 51 lbs  | $191.25           | $191.25          | ✅ (after fix) |
| 75 lbs  | $233.25           | $233.25          | ✅ (after fix) |
| 100 lbs | $277.00           | $277.00          | ✅ (after fix) |
| 150 lbs | $364.50           | $405.50          | ❌ (needs fix) |

### Calculation Examples (After Fix)

**51 lbs Pickup:**

- $102 + (51 × $1.75) = $102 + $89.25 = **$191.25**

**150 lbs Pickup:**

- $102 + (150 × $1.75) = $102 + $262.50 = **$364.50**

(Current calculates: $133 + (150 × $1.75) + $10 = **$405.50** ❌)

## Conclusion

**PICKUP needs fixing** - remove the third tier that doesn't exist in WooCommerce.
**DASH is correct** - matches WooCommerce exactly.
