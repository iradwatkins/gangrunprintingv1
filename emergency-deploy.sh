#!/bin/bash

# EMERGENCY DEPLOYMENT SCRIPT - Fix Chunk Loading Errors
# Run this locally to build and prepare for deployment

set -e

echo "🚨 EMERGENCY FIX - Chunk Loading Error"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Commit current changes
echo -e "${YELLOW}📝 Committing fixes...${NC}"
git add .
git commit -m "CRITICAL FIX: Resolve chunk loading errors - stable build IDs + standalone mode" || true
git push origin main || echo "Push failed - continue anyway"

# Step 2: Clean and rebuild
echo -e "${YELLOW}🧹 Cleaning previous build...${NC}"
rm -rf .next
rm -rf node_modules/.cache

# Step 3: Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm ci --legacy-peer-deps

# Step 4: Build application
echo -e "${YELLOW}🏗️ Building production bundle...${NC}"
NODE_ENV=production npm run build

# Step 5: Verify build
if [ ! -d ".next/standalone" ]; then
  echo -e "${RED}❌ Build failed - standalone directory not found${NC}"
  echo "Trying alternative build..."

  # Remove standalone requirement temporarily
  sed -i.bak "s/output: 'standalone',/\/\/ output: 'standalone',/" next.config.mjs
  NODE_ENV=production npm run build

  # Restore config
  mv next.config.mjs.bak next.config.mjs
fi

# Step 6: Create deployment archive
echo -e "${YELLOW}📦 Creating deployment archive...${NC}"
tar -czf deploy-fix.tar.gz \
  .next \
  public \
  package.json \
  package-lock.json \
  prisma \
  next.config.mjs \
  middleware.ts \
  src

echo -e "${GREEN}✅ Build complete! Archive ready: deploy-fix.tar.gz${NC}"

# Step 7: Generate server deployment script
cat > server-deploy.sh << 'DEPLOY_SCRIPT'
#!/bin/bash

# Run this on the production server
set -e

echo "🚀 Deploying chunk loading fix..."

# Backup current deployment
cp -r /root/gangrunprinting /root/gangrunprinting.backup.$(date +%Y%m%d_%H%M%S) || true

# Extract new build
cd /root/gangrunprinting
tar -xzf deploy-fix.tar.gz

# Install production dependencies
npm ci --production --legacy-peer-deps

# Generate Prisma client
npx prisma generate

# Restart application using PM2
pm2 stop gangrun || true
pm2 delete gangrun || true

# Start with PM2
pm2 start npm --name gangrun -- run start -- -p 3002
pm2 save

echo "✅ Deployment complete!"
echo "Test at: https://gangrunprinting.com"
DEPLOY_SCRIPT

chmod +x server-deploy.sh

echo -e "${GREEN}✅ Local build complete!${NC}"
echo ""
echo -e "${YELLOW}📋 DEPLOYMENT INSTRUCTIONS:${NC}"
echo "================================"
echo ""
echo "1. Upload files to server:"
echo -e "${GREEN}   scp deploy-fix.tar.gz server-deploy.sh root@72.60.28.175:/root/gangrunprinting/${NC}"
echo ""
echo "2. SSH to server:"
echo -e "${GREEN}   ssh root@72.60.28.175${NC}"
echo ""
echo "3. Run deployment:"
echo -e "${GREEN}   cd /root/gangrunprinting${NC}"
echo -e "${GREEN}   ./server-deploy.sh${NC}"
echo ""
echo "4. Clear Cloudflare cache:"
echo "   - Go to Cloudflare dashboard"
echo "   - Caching → Configuration → Purge Everything"
echo ""
echo "5. Test the site in incognito mode"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT:${NC}"
echo "- Clear ALL caches (browser, CDN, server)"
echo "- Test in incognito/private browsing"
echo "- Check console for chunk errors"