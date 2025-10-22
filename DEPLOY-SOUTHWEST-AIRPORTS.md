# 🚀 Deploy Southwest Cargo Airports - Production

## Problem
Southwest Cargo shipping options don't appear on checkout because the 82 airports aren't in the production database yet.

## Solution
Run the airport seed script on production server.

## Steps

### Option 1: SSH to Production Server (Recommended)

```bash
# SSH into production server
ssh root@72.60.28.175

# Navigate to project directory
cd /root/websites/gangrunprinting

# Run seed script
npx tsx src/scripts/seed-southwest-airports.ts

# Expected output:
# ✅ ALL 82 AIRPORTS SUCCESSFULLY IMPORTED!
```

### Option 2: Run Locally with Production Database

**Only if production database is accessible from local machine**

```bash
# Make sure DATABASE_URL points to production
grep DATABASE_URL .env

# Should show: postgresql://gangrun:gangrun123@localhost:5435/gangrun_production

# Run seed script
npx tsx src/scripts/seed-southwest-airports.ts
```

## Verification

After seeding, verify the airports were imported:

```bash
# Check airport count
npx tsx -e "
import { prisma } from './src/lib/prisma';
const count = await prisma.airport.count({ where: { carrier: 'SOUTHWEST_CARGO', isActive: true } });
console.log('Southwest Cargo airports:', count);
await prisma.\$disconnect();
"

# Expected output: Southwest Cargo airports: 82
```

## Test on Website

1. Go to https://gangrunprinting.com/checkout/shipping
2. Enter address: 2740 W 83rd Place, Chicago, IL 60652
3. You should now see **both FedEx AND Southwest Cargo** shipping options
4. Southwest Cargo should show 2 services:
   - **Southwest Cargo Pickup** (Standard - $80-$102 base)
   - **Southwest Cargo Dash** (Premium - $100-$148 base)

## Troubleshooting

### "Can't reach database server"
- Verify DATABASE_URL in .env is correct
- Check database is running: `docker ps | grep postgres` (on production server)
- Test connection: `psql $DATABASE_URL -c "SELECT 1"`

### "Airports imported but not showing on checkout"
- Clear cache: Restart Next.js app
- Check browser console for errors
- Verify address is in supported state (IL is supported)

## Files Involved
- Seed script: `/src/scripts/seed-southwest-airports.ts`
- Provider: `/src/lib/shipping/modules/southwest-cargo/provider.ts`
- Config: `/src/lib/shipping/modules/southwest-cargo/config.ts`
- Airport availability: `/src/lib/shipping/modules/southwest-cargo/airport-availability.ts`
