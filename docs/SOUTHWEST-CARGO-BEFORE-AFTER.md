# Southwest Cargo - Before & After Comparison

## Visual Pricing Comparison

### BEFORE FIX (Incorrect - 3 Tiers for Pickup)

```
Southwest Cargo PICKUP Pricing:
┌─────────────┬──────────────────────────────────────────────┐
│ 0-50 lbs    │ $80 flat rate                                │
├─────────────┼──────────────────────────────────────────────┤
│ 51-100 lbs  │ $102 + (weight × $1.75)                      │
├─────────────┼──────────────────────────────────────────────┤
│ 101+ lbs    │ $133 + (weight × $1.75) + $10 handling  ❌   │
│             │ (This tier should NOT exist!)                │
└─────────────┴──────────────────────────────────────────────┘

Example: 150 lbs
= $133 + (150 × $1.75) + $10
= $133 + $262.50 + $10
= $405.50 ❌ OVERCHARGED
```

### AFTER FIX (Correct - 2 Tiers for Pickup)

```
Southwest Cargo PICKUP Pricing:
┌─────────────┬──────────────────────────────────────────────┐
│ 0-50 lbs    │ $80 flat rate                                │
├─────────────┼──────────────────────────────────────────────┤
│ 51+ lbs     │ $102 + (weight × $1.75)                  ✅  │
└─────────────┴──────────────────────────────────────────────┘

Example: 150 lbs
= $102 + (150 × $1.75)
= $102 + $262.50
= $364.50 ✅ CORRECT (matches WooCommerce)
```

## Southwest Cargo DASH Pricing (No Change - Already Correct)

```
┌─────────────┬──────────────────────────────────────────────┐
│ 0-50 lbs    │ $85 + $10 handling = $95                     │
├─────────────┼──────────────────────────────────────────────┤
│ 51-100 lbs  │ $133 + $10 handling = $143                   │
├─────────────┼──────────────────────────────────────────────┤
│ 101+ lbs    │ $133 + $10 + (weight × $1.75)                │
└─────────────┴──────────────────────────────────────────────┘

DASH pricing was already correct ✅
```

## Pricing Impact Chart

### Pickup Service Comparison

| Weight | Before Fix | After Fix | Savings | Status |
|--------|-----------|-----------|---------|--------|
| 10 lbs | $80.00 | $80.00 | $0.00 | No change |
| 50 lbs | $80.00 | $80.00 | $0.00 | No change |
| 51 lbs | $191.25 | $191.25 | $0.00 | No change |
| 75 lbs | $233.25 | $233.25 | $0.00 | No change |
| 100 lbs | $277.00 | $277.00 | $0.00 | No change |
| **101 lbs** | **$319.75** | **$278.75** | **-$41.00** | **FIXED** ✅ |
| **150 lbs** | **$405.50** | **$364.50** | **-$41.00** | **FIXED** ✅ |
| **200 lbs** | **$493.00** | **$452.00** | **-$41.00** | **FIXED** ✅ |

### Customer Price Impact (with 5% markup)

| Weight | Before Fix (Customer Paid) | After Fix (Customer Pays) | Overcharge Amount |
|--------|---------------------------|---------------------------|-------------------|
| 101 lbs | $335.74 | $292.69 | **-$43.05** |
| 150 lbs | $425.78 | $382.73 | **-$43.05** |
| 200 lbs | $517.65 | $474.60 | **-$43.05** |

**Customers were being overcharged $43.05 for packages 101+ lbs!**

## Code Changes

### Before Fix

```typescript
pickup: {
  weightTiers: [
    {
      // 0-50 lbs
      maxWeight: 50,
      baseRate: 80.0,
      additionalPerPound: 0,
      handlingFee: 0,
    },
    {
      // 51-100 lbs
      maxWeight: 100,
      baseRate: 102.0,
      additionalPerPound: 1.75,
      handlingFee: 0,
    },
    {
      // 101+ lbs ❌ SHOULD NOT EXIST
      maxWeight: Infinity,
      baseRate: 133.0,
      additionalPerPound: 1.75,
      handlingFee: 10.0,
    },
  ],
}
```

### After Fix

```typescript
pickup: {
  // Matches WooCommerce configuration exactly (2 tiers only)
  weightTiers: [
    {
      // 0-50 lbs: Flat rate
      maxWeight: 50,
      baseRate: 80.0,
      additionalPerPound: 0,
      handlingFee: 0,
    },
    {
      // 51+ lbs: Base rate + per-pound charge ✅
      // Formula: $102 + (weight × $1.75)
      maxWeight: Infinity,
      baseRate: 102.0,
      additionalPerPound: 1.75,
      handlingFee: 0,
    },
  ],
}
```

## WooCommerce Source Configuration

### What WooCommerce Actually Had (from screenshots)

**Image 5: Southwest Cargo Pickup (0-50 lbs)**
- Condition: Weight ≤ 50
- Shipping cost: $80
- Cost per weight: $0
- Formula: **$80 flat**

**Image 4: Southwest Cargo Pickup (51+ lbs)**
- Condition: Weight ≥ 51
- Shipping cost: $102
- Cost per weight: $1.75/lb
- Formula: **$102 + (weight × $1.75)**

**That's it! Only 2 shipping methods for Pickup!**

The third tier (101+ lbs with $133 base + $10 handling) was added incorrectly during migration and has now been removed.

## Test Results

### Before Fix
```
Weight: 150 lbs
  Pickup: $405.50  ❌ WRONG
  Dash:   $405.50  ✅ CORRECT
```

### After Fix
```
Weight: 150 lbs
  Pickup: $364.50  ✅ CORRECT (matches WooCommerce)
  Dash:   $405.50  ✅ CORRECT
```

## Summary

### What Was Wrong
- Pickup service had an **extra third tier** (101+ lbs) that didn't exist in WooCommerce
- This caused packages over 100 lbs to be **overcharged by $41.00** (base) or **$43.05** (with markup)

### What Was Fixed
- Removed the incorrect third tier
- Simplified Pickup to match WooCommerce exactly (2 tiers only)
- Now: 0-50 lbs = $80 flat, 51+ lbs = $102 + ($1.75/lb)

### Result
- ✅ Pricing now matches WooCommerce exactly
- ✅ Customers are no longer overcharged
- ✅ All automated tests passing (7/7)
- ✅ Complete documentation created

---

**The lesson:** Keep it simple! WooCommerce had the right approach with just 2 tiers for Pickup. Over-engineering with a third tier caused pricing errors.
