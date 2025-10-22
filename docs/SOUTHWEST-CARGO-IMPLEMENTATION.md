# Southwest Cargo Shipping - Implementation Guide

## Overview

Southwest Cargo is a **simple weight-based shipping module** with **82 airport pickup locations** across the United States. Customers can choose between two service levels:

1. **Southwest Cargo Pickup** - Standard service with airport pickup
2. **Southwest Cargo Dash** - Premium service (next available flight)

## Reference Implementation

**Source:** WooCommerce configuration (migrated October 2025)
**Screenshots:** `.aaaaaa/southwest/*.png`
**Current Implementation:** `/src/lib/shipping/modules/southwest-cargo/`

## Pricing Structure

### Southwest Cargo Pickup (Standard Service)

Simple 2-tier pricing based on total package weight:

| Weight Range | Formula | Example (50 lbs) | Example (150 lbs) |
|--------------|---------|------------------|-------------------|
| 0-50 lbs | **$80 flat rate** | $80.00 | N/A |
| 51+ lbs | **$102 + (weight × $1.75)** | N/A | $364.50 |

**Calculation Examples:**
- 10 lbs: $80.00 (flat rate)
- 50 lbs: $80.00 (flat rate)
- 51 lbs: $102 + (51 × $1.75) = $191.25
- 100 lbs: $102 + (100 × $1.75) = $277.00
- 150 lbs: $102 + (150 × $1.75) = $364.50

### Southwest Cargo Dash (Premium Service)

3-tier pricing for faster delivery:

| Weight Range | Formula | Example (50 lbs) | Example (75 lbs) | Example (150 lbs) |
|--------------|---------|------------------|------------------|-------------------|
| 0-50 lbs | **$85 + $10 handling** | $95.00 | N/A | N/A |
| 51-100 lbs | **$133 + $10 handling** | N/A | $143.00 | N/A |
| 101+ lbs | **$133 + $10 + (weight × $1.75)** | N/A | N/A | $405.50 |

**Calculation Examples:**
- 10 lbs: $85 + $10 = $95.00
- 50 lbs: $85 + $10 = $95.00
- 51 lbs: $133 + $10 = $143.00
- 100 lbs: $133 + $10 = $143.00
- 101 lbs: $133 + $10 + (101 × $1.75) = $319.75
- 150 lbs: $133 + $10 + (150 × $1.75) = $405.50

## Markup Configuration

**Default Markup:** 5% (configurable in `/src/lib/shipping/modules/southwest-cargo/config.ts`)

All prices shown to customers include the 5% markup:
- Base price × 1.05 = Customer price

Example: $80.00 base → $84.00 displayed

## Airport Coverage

Southwest Cargo serves **82 airports** across **36 US states**.

### Serviced States

AL, AR, AZ, CA, CO, CT, DC, FL, GA, HI, IN, KY, LA, MA, MD, MI, MO, NC, NE, NH, NM, NV, NY, OH, OK, OR, PA, PR, RI, SC, TN, TX, UT, VA, WA, WI

### How It Works

1. **Automatic Availability Check** - System checks if destination state has Southwest Cargo airport
2. **No Rates if Unavailable** - If state not serviced, Southwest options don't appear
3. **Airport Selection** - Customer selects specific airport for pickup during checkout

### Database Structure

- **Table:** `Airport`
- **Operator:** `SOUTHWEST_CARGO`
- **Fields:** id, code, name, city, state, isActive
- **Seed Script:** `npx tsx src/scripts/seed-southwest-airports.ts`

## Customer Checkout Flow

### 1. Enter Shipping Address
Customer enters destination address with state.

### 2. Automatic Rate Calculation
- System checks if state has Southwest Cargo airport
- Calculates weight-based rates (Pickup & Dash)
- Applies 5% markup
- Returns rates with estimated delivery times

### 3. Select Shipping Method
Customer sees both options (if available):
- **Southwest Cargo Pickup** - $XX.XX (3 business days)
- **Southwest Cargo Dash** - $XX.XX (1 business day, guaranteed)

### 4. Select Airport Pickup Location
- Dropdown shows all airports in customer's state
- Format: "Airport Name (CODE)"
- Example: "Phoenix Sky Harbor International (PHX)"

### 5. Complete Order
Customer completes payment with selected airport for pickup.

## Code Structure

### Configuration
**File:** `/src/lib/shipping/modules/southwest-cargo/config.ts`

```typescript
export const SOUTHWEST_CARGO_RATES: SouthwestCargoRates = {
  pickup: {
    weightTiers: [
      { maxWeight: 50, baseRate: 80, additionalPerPound: 0, handlingFee: 0 },
      { maxWeight: Infinity, baseRate: 102, additionalPerPound: 1.75, handlingFee: 0 },
    ],
  },
  dash: {
    weightTiers: [
      { maxWeight: 50, baseRate: 85, additionalPerPound: 0, handlingFee: 10 },
      { maxWeight: 100, baseRate: 133, additionalPerPound: 0, handlingFee: 10 },
      { maxWeight: Infinity, baseRate: 133, additionalPerPound: 1.75, handlingFee: 10 },
    ],
  },
}
```

### Provider
**File:** `/src/lib/shipping/modules/southwest-cargo/provider.ts`

Main shipping provider class that:
- Implements `ShippingProvider` interface
- Calculates rates using weight tier logic
- Validates destination has Southwest airport
- Generates tracking numbers
- Creates shipping labels

### Airport Availability
**File:** `/src/lib/shipping/modules/southwest-cargo/airport-availability.ts`

Checks if Southwest Cargo serves a location:
- Queries database for active airports by state
- Caches results for 1 hour (performance)
- Returns empty rates if state not serviced

### UI Components

**Shipping Method Selector:**
`/src/components/checkout/shipping-method-selector.tsx`
- Displays all available shipping options
- Shows Southwest with plane icon
- "Airport Pickup" badge for Southwest rates

**Airport Selector:**
`/src/components/checkout/airport-selector.tsx`
- Dropdown of all airports in customer's state
- Searchable/filterable
- Shows airport code and location

## Testing

### Automated Tests

**Pricing Verification:**
```bash
npx tsx scripts/test-southwest-pricing.ts
```
Verifies pricing calculations match WooCommerce configuration.

**Checkout Flow:**
```bash
npx tsx scripts/test-southwest-checkout.ts
```
End-to-end test with 7 weight scenarios across different states.

### Manual Testing

1. **Add product to cart** (vary weights: 10 lbs, 51 lbs, 150 lbs)
2. **Go to checkout** and enter shipping address in serviced state (TX, CA, NY, etc.)
3. **Verify Southwest rates appear** with correct pricing
4. **Select Southwest Cargo Pickup** or **Dash**
5. **Verify airport selector** shows airports for that state
6. **Select an airport** and complete checkout
7. **Verify order confirmation** shows correct airport pickup location

### Test States for Manual Testing

**States with airports:** TX, CA, NY, FL, AZ, NV, GA, WA, OR, CO
**States without airports:** IL, MN, IA, KS, MS, MT (Southwest should not appear)

## Troubleshooting

### Southwest rates not appearing

**Check 1:** Is the destination state serviced?
```sql
SELECT * FROM "Airport" WHERE carrier = 'SOUTHWEST_CARGO' AND state = 'XX';
```

**Check 2:** Are airports seeded in database?
```sql
SELECT COUNT(*) FROM "Airport" WHERE carrier = 'SOUTHWEST_CARGO';
-- Should return 82
```

**Fix:** Run seed script
```bash
npx tsx src/scripts/seed-southwest-airports.ts
```

### Incorrect pricing

**Check 1:** Review current configuration
```bash
npx tsx scripts/test-southwest-pricing.ts
```

**Check 2:** Compare against WooCommerce screenshots (`.aaaaaa/southwest/*.png`)

**Reference:** See analysis in `/docs/SOUTHWEST-CARGO-PRICING-ANALYSIS.md`

### Airport dropdown empty

**Check 1:** Verify API endpoint
```bash
curl http://localhost:3020/api/airports | jq
```

**Check 2:** Check database airports for state
```sql
SELECT * FROM "Airport" WHERE carrier = 'SOUTHWEST_CARGO' AND state = 'TX';
```

## Maintenance

### Adding New Airports

1. **Add to database** via Prisma
```typescript
await prisma.airport.create({
  data: {
    code: 'NEW',
    name: 'New Airport Name',
    city: 'City Name',
    state: 'ST',
    carrier: 'SOUTHWEST_CARGO',
    isActive: true,
  }
})
```

2. **Clear cache** (restarts automatically after 1 hour, or restart app)

### Updating Pricing

1. **Edit config file:** `/src/lib/shipping/modules/southwest-cargo/config.ts`
2. **Update weight tiers** - modify baseRate, additionalPerPound, or handlingFee
3. **Run tests** to verify
```bash
npx tsx scripts/test-southwest-pricing.ts
npx tsx scripts/test-southwest-checkout.ts
```
4. **Restart application**

### Adjusting Markup

**File:** `/src/lib/shipping/modules/southwest-cargo/config.ts`

```typescript
export const SOUTHWEST_CARGO_CONFIG = {
  markupPercentage: 5, // Change this value (5 = 5%)
}
```

## Migration Notes (October 2025)

This module was migrated from WooCommerce conditional shipping rates to Next.js.

### Changes from WooCommerce

✅ **Preserved:**
- Exact pricing structure (2 tiers for Pickup, 3 for Dash)
- Weight-based calculations
- Airport pickup selection
- Simple customer experience

✅ **Improvements:**
- Database-driven airport data (was hardcoded)
- Cached airport lookups for performance
- TypeScript type safety
- Automated testing suite

❌ **Removed:**
- Third tier for Pickup (101+ lbs) - this was added incorrectly and removed to match WooCommerce

### Key Lesson

**WooCommerce had it simple, and that's good!** The original 2-tier Pickup structure was correct. Over-engineering with a third tier caused pricing discrepancies. Always reference the source configuration when migrating.

## Support

**Documentation:** This file + `/docs/SOUTHWEST-CARGO-PRICING-ANALYSIS.md`
**Test Scripts:** `scripts/test-southwest-*.ts`
**Source Reference:** `.aaaaaa/southwest/*.png` (WooCommerce screenshots)
