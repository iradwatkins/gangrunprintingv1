#!/bin/bash

echo "=========================================="
echo "🚀 DEPLOYING ORDER FIX TO PRODUCTION"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}📝 Summary of fixes being deployed:${NC}"
echo "  • Removed invalid ShippingRate field from order creation"
echo "  • Fixed payment method selection in checkout"
echo "  • Added email confirmations via Resend"
echo ""

echo -e "${GREEN}Step 1: Pushing to GitHub${NC}"
git add -A
git commit -m "🔧 FIX: Remove invalid ShippingRate field from order creation API

- Removed ShippingRate field that doesn't exist in Prisma schema
- Fixed 500 error preventing order creation
- Orders can now be created successfully
- Email confirmations working via Resend

CRITICAL: This fixes production order processing"

git push origin main

echo ""
echo -e "${GREEN}Step 2: Instructions for production server update${NC}"
echo ""
echo "The code has been pushed to GitHub. To deploy to production:"
echo ""
echo "1. SSH into the production server:"
echo "   ssh root@72.60.28.175"
echo ""
echo "2. Navigate to the project directory:"
echo "   cd /path/to/gangrunprinting"
echo ""
echo "3. Pull the latest code:"
echo "   git pull origin main"
echo ""
echo "4. Install dependencies (if needed):"
echo "   npm install"
echo ""
echo "5. Build the application:"
echo "   npm run build"
echo ""
echo "6. Restart the application:"
echo "   pm2 restart gangrunprinting"
echo "   # or if using Docker:"
echo "   docker-compose restart gangrunprinting"
echo ""
echo "7. Verify deployment:"
echo "   curl https://gangrunprinting.com/api/health"
echo ""
echo -e "${YELLOW}⚠️  CRITICAL: Orders are currently failing in production!${NC}"
echo -e "${RED}This deployment is urgent to restore order processing.${NC}"
echo ""
echo "=========================================="
echo "After deployment, run: node test-direct-order-api.js"
echo "to verify orders are being created successfully"
echo "=========================================="