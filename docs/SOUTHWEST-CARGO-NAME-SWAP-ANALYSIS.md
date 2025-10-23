# Southwest Cargo - Service Name Analysis

## Problem Identified

Current pricing shows **PICKUP is more expensive than DASH** in the 51-100 lb range:

| Weight  | PICKUP  | DASH    | Issue                    |
| ------- | ------- | ------- | ------------------------ |
| 51 lbs  | $191.25 | $143.00 | ❌ Pickup MORE expensive |
| 75 lbs  | $233.25 | $143.00 | ❌ Pickup MORE expensive |
| 100 lbs | $277.00 | $143.00 | ❌ Pickup MORE expensive |

**This doesn't make logical sense!**

- PICKUP = Standard service (should be cheaper)
- DASH = Premium "next available flight" (should be more expensive)

## WooCommerce Labels Analysis

### Current Label Mapping (from screenshots)

**"Southwest Cargo Pickup" in WooCommerce:**

- ≤50 lbs: $80
- ≥51 lbs: $102 + $1.75/lb
- Result: Expensive for 51-100 lbs

**"Southwest Cargo Dash" in WooCommerce:**

- ≤50 lbs: $85 + $10 = $95
- 51-100 lbs: $133 + $10 = $143
- 101+ lbs: $133 + $10 + $1.75/lb
- Result: Cheaper for 51-100 lbs, more expensive for 101+ lbs

## Hypothesis: Names Are Swapped in WooCommerce

### What Makes Logical Sense

**PICKUP (Standard - Should Be Cheapest):**

- ≤50 lbs: $85 + $10 = $95
- 51-100 lbs: $133 + $10 = $143 (flat rate - economical)
- 101+ lbs: $133 + $10 + $1.75/lb (scales with weight)

**DASH (Premium - Should Be Most Expensive):**

- ≤50 lbs: $80 (competitive for light packages)
- ≥51 lbs: $102 + $1.75/lb (expensive - premium pricing)

### Pricing Comparison With Swap

| Weight  | PICKUP (Standard) | DASH (Premium) | Logical?                                |
| ------- | ----------------- | -------------- | --------------------------------------- |
| 10 lbs  | $95.00            | $80.00         | ⚠️ Dash cheaper (light packages promo?) |
| 50 lbs  | $95.00            | $80.00         | ⚠️ Dash cheaper (light packages promo?) |
| 51 lbs  | $143.00           | $191.25        | ✅ Dash MORE expensive                  |
| 75 lbs  | $143.00           | $233.25        | ✅ Dash MORE expensive                  |
| 100 lbs | $143.00           | $277.00        | ✅ Dash MORE expensive                  |
| 101 lbs | $319.75           | $278.75        | ⚠️ Pickup MORE expensive???             |
| 150 lbs | $405.50           | $364.50        | ⚠️ Pickup MORE expensive???             |

**Still doesn't work perfectly!**

## Alternative Theory: WooCommerce Configuration Is Correct As-Is

Maybe Southwest Cargo actually prices this way:

1. **Light packages (0-50 lbs):** PICKUP is cheaper ($80 vs $95) ✅
2. **Medium packages (51-100 lbs):** DASH is cheaper ($143 vs $191-$277) ❌ Strange!
3. **Heavy packages (101+ lbs):** DASH is more expensive ($319+ vs $278+) ✅

This suggests:

- **DASH might be flat-rate for 51-100 lbs** (good deal for heavier items in this range)
- **PICKUP uses per-pound pricing** (gets expensive in 51-100 lb range)

## Recommendation

**VERIFY WITH USER:** Which service should be MORE expensive overall?

### Option A: Names Are Correct (WooCommerce as-is)

- PICKUP = per-pound pricing (expensive 51-100 lbs)
- DASH = flat rates with premium for 101+ lbs
- **User needs to confirm if this is intentional**

### Option B: Names Are Swapped

- Current "PICKUP" → rename to "DASH" (premium)
- Current "DASH" → rename to "PICKUP" (standard)
- Makes more logical sense but changes WooCommerce labels

### Option C: Pricing Needs Adjustment

- Keep names as-is
- Adjust pricing so DASH is consistently more expensive
- Requires new pricing structure from user

## Questions for User

1. **Which service is the PREMIUM service** that should cost more?
   - DASH (next available flight - fast) = Premium?
   - PICKUP (standard airport pickup) = Economical?

2. **Is the WooCommerce pricing intentional?**
   - PICKUP more expensive for 51-100 lbs?
   - DASH cheaper in that range?

3. **What are the actual Southwest Cargo service names?**
   - Are they literally "Pickup" and "Dash"?
   - Or different names that got labeled incorrectly?

## Current Code Status

**Code currently uses WooCommerce labels exactly:**

- `SOUTHWEST_CARGO_PICKUP` = "Southwest Cargo Pickup"
- `SOUTHWEST_CARGO_DASH` = "Southwest Cargo Dash"

**Easy to swap if needed:**
Just swap the configuration objects in `/src/lib/shipping/modules/southwest-cargo/config.ts`

## Next Steps

1. User confirms which service should be premium (most expensive)
2. If names are swapped: Swap the configuration objects
3. If pricing wrong: User provides correct pricing
4. Re-test and verify
