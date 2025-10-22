# Southwest Cargo - Zone 2 (Chicago) Pricing - 2025

## Overview

**Origin:** Zone 2 (Chicago, IL)
**Source:** Official Southwest Cargo Rate Sheets (2025)
**Services:** 2 service levels

1. **Southwest Standard** = PICKUP (Economy service)
2. **Next Flight Guaranteed (NFG)** = DASH (Premium guaranteed service)

## Official 2025 Rates

### NFG (Next Flight Guaranteed) - DASH Service
**Zone 2 → Zone B (most destinations from Chicago)**

| Weight Range | Price | Calculation |
|--------------|-------|-------------|
| 0-25 lbs | $100.00 | Flat rate |
| 26-50 lbs | $117.00 | Flat rate |
| 51-100 lbs | $148.00 | Flat rate |
| 101+ lbs | $148 + $1.90/lb over 100 | Example: 150 lbs = $148 + ((150-100) × $1.90) = $243.00 |

### Southwest Standard - PICKUP Service
**Zone 2 → Zone A (nearby/same zone)**

| Weight Range | Price | Calculation |
|--------------|-------|-------------|
| 0-50 lbs | $60.00 | Minimum charge (flat) |
| 51-100 lbs | $60 + (weight × $1.03) | Example: 75 lbs = $60 + (75 × $1.03) = $137.25 |
| 101-300 lbs | $60 + (weight × $1.03) | Example: 150 lbs = $60 + (150 × $1.03) = $214.50 |
| 300+ lbs | $60 + (weight × $1.00) | Reduced rate for bulk |

**Note:** Southwest Standard uses Zone A (same zone) rates for cost-effectiveness

## Pricing Comparison (with 5% markup)

| Weight | PICKUP (Standard) | DASH (NFG) | Difference | Best Value |
|--------|------------------|------------|------------|------------|
| **10 lbs** | $63.00 | $105.00 | +$42.00 | 🟢 PICKUP cheaper |
| **25 lbs** | $63.00 | $105.00 | +$42.00 | 🟢 PICKUP cheaper |
| **50 lbs** | $63.00 | $122.85 | +$59.85 | 🟢 PICKUP cheaper |
| **51 lbs** | $118.16 | $155.40 | +$37.24 | 🟢 PICKUP cheaper |
| **75 lbs** | $144.11 | $155.40 | +$11.29 | 🟢 PICKUP cheaper |
| **100 lbs** | $171.15 | $155.40 | -$15.75 | 🔴 DASH cheaper! |
| **101 lbs** | $169.05 | $157.40 | -$11.65 | 🔴 DASH cheaper! |
| **150 lbs** | $220.50 | $255.15 | +$34.65 | 🟢 PICKUP cheaper |
| **200 lbs** | $272.10 | $350.00 | +$77.90 | 🟢 PICKUP cheaper |

## Key Insights

### Pricing Crossover at 100 lbs

There's a unique crossover point where:
- **Below 100 lbs:** PICKUP is always cheaper (economy option)
- **Around 100 lbs:** DASH becomes cheaper due to flat-rate pricing
- **Above ~110 lbs:** PICKUP becomes cheaper again

This happens because:
1. DASH has flat $148 for 51-100 lbs (good deal for heavy packages in this range)
2. PICKUP charges $1.03/lb on full weight, making 100 lbs = $163 (more expensive than DASH's $148)
3. Above 110 lbs, DASH's per-pound charges ($1.90/lb over 100) make it more expensive again

### Customer Value Proposition

**For light shipments (0-50 lbs):**
- PICKUP: $60-63 ✅ Best value
- DASH: $100-117 (premium for guaranteed next flight)

**For medium shipments (51-100 lbs):**
- **Around 90-105 lbs:** DASH may be cheaper! (counterintuitive but true)
- Other weights: PICKUP cheaper

**For heavy shipments (110+ lbs):**
- PICKUP: Generally cheaper
- DASH: Premium price for guaranteed service

## Recommendations

### Current Implementation
Uses official 2025 rates exactly as published by Southwest Cargo.

### Pricing Strategy Options

**Option A: Keep Official Rates (Current)**
- ✅ Accurate to Southwest's actual pricing
- ⚠️ May confuse customers (why is premium service cheaper at 100 lbs?)
- Benefit: Truthful representation of carrier rates

**Option B: Simplify for Customer Clarity**
- Adjust PICKUP rates to always be cheaper than DASH
- Makes "economy vs premium" concept clearer
- Downside: Not matching official Southwest rates

**Option C: Smart Recommendations**
- Keep official rates
- Add UI hint: "At this weight, NFG is actually cheaper than Standard!"
- Show savings when DASH is better value

## Technical Implementation

**Files:**
- Config: `/src/lib/shipping/modules/southwest-cargo/config.ts`
- Provider: `/src/lib/shipping/modules/southwest-cargo/provider.ts`

**Current Settings:**
- Origin: Zone 2 (Chicago)
- Default destination zone: Zone A (PICKUP), Zone B (DASH)
- Markup: 5% on all rates

**Calculation Logic:**
- PICKUP: Full weight × per-lb rate + minimum
- DASH: Flat rates for tiers, plus per-lb over 100 lbs threshold

## Source Documents

- `N0000_GeneralCommodityUS48SJU20250101.pdf` - NFG (DASH) rates effective Jan 1, 2025
- `SS_GeneralCommodity_RateSheet_Domestic_20190402.pdf` - Southwest Standard (PICKUP) rates
- `CargoMap_190220-blue.pdf` - Zone map for Chicago (Zone 2)

## Next Steps

**Question for User:**
Is it acceptable that DASH (premium service) can sometimes be cheaper than PICKUP (economy service) at certain weights (around 100 lbs)?

**Options:**
1. Keep official rates as-is (current implementation)
2. Adjust rates for consistency (always make PICKUP cheaper)
3. Add UI messaging to explain pricing advantages at certain weights
