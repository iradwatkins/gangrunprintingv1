#!/bin/bash
# ADDON DATA PROTECTION VERIFICATION
# Run this to verify Corner Rounding and all addons are intact

echo "🛡️ Verifying Addon Data Protection..."
echo "Checking Corner Rounding with ROUNDED CORNERS..."

# Run the TypeScript verification
npx tsx scripts/check-corner-rounding.ts

echo ""
echo "If Corner Rounding is missing or ROUNDED CORNERS field is gone, run:"
echo "npx tsx scripts/restore-and-protect-all-addons.ts"
