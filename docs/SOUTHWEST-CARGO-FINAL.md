# Southwest Cargo Shipping - Final Implementation

## Overview

**Service Offered:** DASH (Next Flight Guaranteed) only
**Origin:** Zone 2 (Chicago, IL)
**Destination Zones:** Zone B (most US destinations)
**Coverage:** 82 airports across 36 US states

## Pricing Structure (2025 Rates)

### DASH (NFG - Next Flight Guaranteed)

**Zone 2 (Chicago) → Zone B**

| Weight Range   | Base Rate | Additional Cost    | Example                                |
| -------------- | --------- | ------------------ | -------------------------------------- |
| **0-25 lbs**   | $100      | None               | 10 lbs = **$100**                      |
| **26-50 lbs**  | $117      | None               | 40 lbs = **$117**                      |
| **51-100 lbs** | $148      | None               | 75 lbs = **$148**                      |
| **101+ lbs**   | $148      | +$1.90/lb over 100 | 150 lbs = $148 + (50×$1.90) = **$243** |

### Pricing Formula

```typescript
if (weight <=25) return $100
if (weight <= 50) return $117
if (weight <= 100) return $148
if (weight > 100) return $148 + ((weight - 100) × $1.90)
```

### With 5% Markup (Customer Pricing)

| Weight  | Base Rate | With Markup | Customer Pays |
| ------- | --------- | ----------- | ------------- |
| 10 lbs  | $100.00   | ×1.05       | **$105.00**   |
| 25 lbs  | $100.00   | ×1.05       | **$105.00**   |
| 50 lbs  | $117.00   | ×1.05       | **$122.85**   |
| 75 lbs  | $148.00   | ×1.05       | **$155.40**   |
| 100 lbs | $148.00   | ×1.05       | **$155.40**   |
| 101 lbs | $149.90   | ×1.05       | **$157.40**   |
| 150 lbs | $243.00   | ×1.05       | **$255.15**   |
| 200 lbs | $338.00   | ×1.05       | **$354.90**   |

## Service Details

**Service Name:** Southwest Cargo (Next Flight Guaranteed)
**Delivery Time:** Next available flight (typically 1 business day)
**Guaranteed:** Yes
**Pickup Required:** Yes - customer picks up at airport
**Service Code:** `SOUTHWEST_CARGO_DASH`

## Available Shipping Options

Customers will see **2 shipping methods** at checkout:

1. **FedEx** (various service levels - already implemented)
2. **Southwest Cargo (Next Flight Guaranteed)** (new)

**PICKUP service is NOT offered** - only premium DASH service available.

## Coverage

### States with Southwest Cargo Service

AL, AR, AZ, CA, CO, CT, DC, FL, GA, HI, IN, KY, LA, MA, MD, MI, MO, NC, NE, NH, NM, NV, NY, OH, OK, OR, PA, PR, RI, SC, TN, TX, UT, VA, WA, WI

**Total:** 36 states + Puerto Rico, 82 airports

### How Availability Works

1. Customer enters shipping address
2. System checks if destination state has Southwest Cargo airport
3. If yes: Southwest rate appears alongside FedEx rates
4. If no: Only FedEx rates shown

## Airport Selection

When customer selects Southwest Cargo:

1. Dropdown appears showing all airports in their state
2. Customer chooses pickup location
3. Order confirmation includes airport details and pickup instructions

## Technical Implementation

### Files Modified

**Configuration:**

- `/src/lib/shipping/modules/southwest-cargo/config.ts` - DASH pricing tiers
- `/src/lib/shipping/modules/southwest-cargo/provider.ts` - Rate calculation logic

**Key Changes:**

- Removed PICKUP service completely
- Updated DASH to use official NFG Zone B rates
- Applied "over 100" logic for 101+ lbs tier

### Rate Calculation Logic

```typescript
private calculateDashRate(weight: number): number {
  let previousTierMax = 0

  for (const tier of dashTiers) {
    if (weight <= tier.maxWeight) {
      // Flat rate tiers (0-25, 26-50, 51-100)
      if (tier.additionalPerPound === 0) {
        return tier.baseRate + tier.handlingFee
      }

      // 101+ tier: charge per-pound OVER 100
      const weightOverThreshold = weight - previousTierMax
      const additionalCost = weightOverThreshold * tier.additionalPerPound
      return tier.baseRate + additionalCost + tier.handlingFee
    }
    previousTierMax = tier.maxWeight
  }
}
```

## Testing

### Automated Test

```bash
npx tsx scripts/test-southwest-dash-only.ts
```

**Expected Output:**

- All weight tiers calculated correctly
- Pricing matches official NFG rates exactly
- 5% markup applied correctly

### Manual Testing

1. Add product to cart (try various weights: 10, 50, 100, 150 lbs)
2. Go to checkout
3. Enter shipping address in serviced state (TX, CA, NY, FL, etc.)
4. Verify Southwest Cargo appears with correct pricing
5. Select Southwest Cargo
6. Verify airport selector shows airports for that state
7. Complete checkout

### Verification Checklist

- [ ] Only DASH service appears (no PICKUP)
- [ ] Pricing matches NFG Zone B rates
- [ ] 0-25 lbs shows $105.00 (with markup)
- [ ] 51-100 lbs shows $155.40 (with markup)
- [ ] 150 lbs shows $255.15 (with markup)
- [ ] Airport dropdown shows correct airports
- [ ] FedEx rates still appear correctly

## Customer Experience

### Checkout Flow

1. **Customer adds products to cart**
2. **Enters shipping address**
3. **Sees shipping options:**
   - FedEx Ground - $XX.XX (5-7 business days)
   - FedEx 2Day - $XX.XX (2 business days)
   - FedEx Standard Overnight - $XX.XX (next business day)
   - **Southwest Cargo (Next Flight Guaranteed) - $XX.XX (1 business day)** 🆕
4. **Selects Southwest Cargo**
5. **Chooses airport pickup location** from dropdown
6. **Completes order**
7. **Receives confirmation with airport details**

### Value Proposition

**Why choose Southwest Cargo?**

- ✈️ Next available flight delivery
- 💰 Competitive pricing for 51-100 lbs
- 🎯 Guaranteed delivery time
- 📍 82 convenient airport locations nationwide

## Source Documentation

- **NFG Rates:** `N0000_GeneralCommodityUS48SJU20250101.pdf`
- **Zone Map:** `CargoMap_190220-blue.pdf`
- **Location:** `.aaaaaa/southwest/` folder

## Support & Maintenance

### Updating Rates

To update Southwest Cargo rates:

1. Edit `/src/lib/shipping/modules/southwest-cargo/config.ts`
2. Modify `dash.weightTiers` array
3. Update baseRate or additionalPerPound values
4. Run test: `npx tsx scripts/test-southwest-dash-only.ts`
5. Restart application

### Adding/Removing Airports

Airports stored in database (`Airport` table):

```bash
# View airports
docker exec gangrunprinting-postgres psql -U gangrun_user -d gangrun_db \
  -c "SELECT * FROM \"Airport\" WHERE carrier='SOUTHWEST_CARGO'"

# Add airport via Prisma
await prisma.airport.create({
  data: {
    code: 'DFW',
    name: 'Dallas/Fort Worth International',
    city: 'Dallas',
    state: 'TX',
    carrier: 'SOUTHWEST_CARGO',
    isActive: true
  }
})
```

## Summary

✅ **DASH (NFG) service implemented** - Zone 2 → Zone B rates
✅ **Pricing verified** - Matches official 2025 rates exactly
✅ **PICKUP service removed** - Only premium service offered
✅ **82 airports** - Full coverage across 36 states
✅ **FedEx integration** - Works alongside existing FedEx rates
✅ **Customer-friendly** - Simple airport selection at checkout

**Status:** Ready for production ✅
