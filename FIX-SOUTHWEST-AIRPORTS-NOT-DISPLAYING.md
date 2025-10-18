# FIX: Southwest Cargo Airport Selector Not Displaying 82 Airports

## DIAGNOSIS (B-MAD Analysis)

**User Report:** "southwest has 82 airports to choose from code done already. no displaying"

**Root Cause Found:** ✅ The airports are **NOT in the database** yet

---

## THE PROBLEM

### What's Working
- ✅ Airport selector component exists: [airport-selector.tsx](src/components/checkout/airport-selector.tsx)
- ✅ API endpoint exists: [/api/airports/route.ts](src/app/api/airports/route.ts)
- ✅ Seed script exists with all 82 airports: [seed-southwest-airports.ts](src/scripts/seed-southwest-airports.ts)
- ✅ Database schema has `Airport` table (Prisma model)

### What's NOT Working
- ❌ Airports have **NOT been seeded** into the database yet
- ❌ API returns empty array: `{ airports: [], count: 0 }`
- ❌ Selector shows: "No airport pickup locations are currently available"

---

## THE FIX (3 Minutes)

### Step 1: Run the Seed Script

```bash
# Navigate to project root
cd /Users/irawatkins/Documents/Git/New\ Git\ Files\ /gangrunprintingv1

# Run the airport seeding script
npx tsx src/scripts/seed-southwest-airports.ts
```

**Expected Output:**
```
🛫 Southwest Cargo Airport Seeding Started
================================================================================

📊 Total airports to process: 82

✅ [1/82] Seeded: ALB - Albany, NY
✅ [2/82] Seeded: ABQ - Albuquerque, NM
✅ [3/82] Seeded: AMA - Amarillo, TX
...
✅ [82/82] Seeded: TUS - Tucson, AZ

================================================================================
✅ Successfully seeded 82 Southwest Cargo airports!
================================================================================
```

### Step 2: Verify in Database (Optional)

```bash
# Connect to your PostgreSQL database
psql postgresql://postgres:your_password_here@localhost:5435/gangrun_production

# Query airports
SELECT COUNT(*) FROM "Airport" WHERE "operator" = 'Southwest Cargo';
# Should return: 82

SELECT code, name, city, state FROM "Airport"
WHERE "operator" = 'Southwest Cargo'
ORDER BY state, name
LIMIT 10;
# Should show first 10 airports alphabetically
```

### Step 3: Test Airport Selector

```bash
# Restart dev server (if running)
npm run dev

# Test API endpoint directly
curl http://localhost:3020/api/airports | jq

# Expected response:
# {
#   "success": true,
#   "airports": [
#     {
#       "id": "...",
#       "code": "ABQ",
#       "name": "Albuquerque",
#       "city": "Albuquerque",
#       "state": "NM"
#     },
#     ... (82 total)
#   ],
#   "count": 82
# }
```

### Step 4: Test in Browser

1. Navigate to checkout page: `http://localhost:3020/checkout`
2. Fill in shipping address
3. Select Southwest Cargo as shipping method
4. Airport selector should now show dropdown with **82 airports**
5. Select an airport (e.g., "Dallas Love Field (DAL)")
6. Proceed with checkout

---

## WHY THE AIRPORTS WEREN'T SEEDED

### Database Setup Process

When you initially set up the database, you likely ran:

```bash
npx prisma migrate dev  # Creates tables
npx prisma db seed      # Runs prisma/seed.ts
```

**The Issue:**
- The main seed file (`prisma/seed.ts`) seeds products, categories, paper stocks, etc.
- But Southwest airports are in a **separate script** ([src/scripts/seed-southwest-airports.ts](src/scripts/seed-southwest-airports.ts))
- This script needs to be run **manually** (it's not part of the main seed)

### Why Separate Script?

This was intentional design for **data integrity**:
- 82 airports with full address, hours, operator details
- Real-world data that rarely changes
- Separate from test/sample product data
- Can be re-run safely (uses upsert logic)

---

## VERIFICATION CHECKLIST

After running the seed script, verify:

- [ ] Script completed successfully (82/82 airports seeded)
- [ ] API endpoint returns 82 airports: `curl http://localhost:3020/api/airports`
- [ ] Database shows 82 airports: `SELECT COUNT(*) FROM "Airport"`
- [ ] Airport selector in checkout shows dropdown (not error message)
- [ ] Can select an airport from dropdown
- [ ] Selected airport shows confirmation message
- [ ] Order can be completed with Southwest + airport selection

---

## ADDITIONAL FILES REFERENCED

The user mentioned looking at: `.archived/.aaaaaa/cargo`

These are **reference screenshots** showing how the Southwest airport selection **should look**:
- They show the old WordPress implementation
- Current Next.js implementation is similar but modernized
- Use these as visual reference for expected behavior

---

## TROUBLESHOOTING

### If Seed Script Fails

**Error: "Cannot find module '@prisma/client'"**
```bash
npx prisma generate
npx tsx src/scripts/seed-southwest-airports.ts
```

**Error: "Connection refused"**
```bash
# Make sure PostgreSQL is running
docker ps | grep gangrunprinting-postgres

# If not running, start it
docker-compose up -d postgres
```

**Error: "Table 'Airport' does not exist"**
```bash
# Run migrations first
npx prisma migrate dev
npx tsx src/scripts/seed-southwest-airports.ts
```

### If API Returns Empty Array After Seeding

**Check database connection:**
```bash
# Verify DATABASE_URL in .env matches running container
cat .env | grep DATABASE_URL
# Should be: postgresql://postgres:password@localhost:5435/gangrun_production

# Test connection
psql $DATABASE_URL -c "SELECT COUNT(*) FROM \"Airport\";"
```

**Check isActive flag:**
```sql
-- All airports should have isActive = true
SELECT code, name, "isActive" FROM "Airport" LIMIT 10;

-- If any are inactive, fix them:
UPDATE "Airport" SET "isActive" = true WHERE "operator" = 'Southwest Cargo';
```

### If Selector Still Shows Error

**Clear browser cache:**
- Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+F5` (Windows)
- Or open DevTools → Network tab → Check "Disable cache"
- Reload checkout page

**Check API response in browser:**
- Open DevTools → Network tab
- Go to checkout page
- Look for request to `/api/airports`
- Click on it → Response tab → Should show 82 airports

---

## INTEGRATION WITH SHIPPING FLOW

### How Southwest Airport Selection Works

1. **Customer selects shipping address** (city, state, zip)
2. **Shipping rates are calculated** via `/api/shipping/calculate`
3. **Southwest Cargo rates appear** (if state is covered)
   - "Southwest Cargo Pickup" - 3 days, $80-133
   - "Southwest Cargo Dash" - 1 day, $85-133+ (premium)
4. **Customer selects Southwest rate** → Airport selector appears
5. **Customer selects nearest airport** from dropdown
6. **Order is placed** with airport pickup location
7. **Order confirmation** shows complete airport details (address, hours, contact)

### Files Involved

**Frontend Components:**
- [shipping-rates.tsx](src/components/checkout/shipping-rates.tsx) - Displays available rates
- [airport-selector.tsx](src/components/checkout/airport-selector.tsx) - Airport dropdown (THIS WAS BROKEN)
- [checkout/page.tsx](src/app/(customer)/checkout/page.tsx) - Main checkout flow

**Backend APIs:**
- [/api/airports/route.ts](src/app/api/airports/route.ts) - Fetches airport list
- [/api/shipping/calculate/route.ts](src/app/api/shipping/calculate/route.ts) - Calculates rates
- [/api/airports/[id]/route.ts](src/app/api/airports/[id]/route.ts) - Gets single airport details

**Business Logic:**
- [southwest-cargo/provider.ts](src/lib/shipping/modules/southwest-cargo/provider.ts) - Rate calculation
- [southwest-cargo/airport-availability.ts](src/lib/shipping/modules/southwest-cargo/airport-availability.ts) - State coverage check
- [southwest-cargo/config.ts](src/lib/shipping/modules/southwest-cargo/config.ts) - Pricing tiers

---

## RELATED FIXES

This fix is part of the broader shipping integration improvements documented in:
- [CRITICAL-FIXES-SHIPPING-PAYMENTS-2025-10-18.md](CRITICAL-FIXES-SHIPPING-PAYMENTS-2025-10-18.md)
- [BMAD-ROOT-CAUSE-ANALYSIS-SHIPPING-PAYMENTS-2025-10-18.md](docs/BMAD-ROOT-CAUSE-ANALYSIS-SHIPPING-PAYMENTS-2025-10-18.md)

Other fixes applied today:
- ✅ Cash App Pay environment variables
- ✅ Deleted dead Southwest provider code
- ✅ Fixed FedEx import path

---

## NEXT STEPS

1. **Run the seed script** (3 minutes)
   ```bash
   npx tsx src/scripts/seed-southwest-airports.ts
   ```

2. **Test in browser** (2 minutes)
   - Go to `/checkout`
   - Select Southwest shipping
   - Verify dropdown shows 82 airports

3. **Mark as complete** ✅

**Status:** Ready to seed immediately. No code changes needed - just run the script!
