#!/bin/bash

# Fix for Next.js Chunk Loading Error on Production
# This script rebuilds and redeploys the application with proper configuration

echo "🔧 Fixing Next.js Chunk Loading Error..."

# 1. Clean build artifacts
echo "📦 Cleaning build artifacts..."
rm -rf .next
rm -rf node_modules/.cache

# 2. Install dependencies
echo "📦 Installing dependencies..."
npm ci --legacy-peer-deps

# 3. Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# 4. Build with standalone output
echo "🏗️ Building application with standalone output..."
NODE_ENV=production npm run build

# 5. Check if build was successful
if [ ! -d ".next/standalone" ]; then
  echo "❌ Build failed: .next/standalone directory not found"
  echo "Check build logs for errors"
  exit 1
fi

echo "✅ Build successful!"

# 6. Build Docker image
echo "🐳 Building Docker image..."
docker build -t gangrunprinting:latest .

# 7. Deploy instructions
echo "
🚀 Deployment Instructions:

1. SSH into your production server:
   ssh root@72.60.28.175

2. Stop the current container:
   docker-compose -f docker-compose.yml down

3. Clear browser/CDN cache (important!):
   - Clear Cloudflare cache if using CDN
   - Clear browser cache
   - Clear any reverse proxy cache

4. Pull and deploy new image:
   docker-compose -f docker-compose.yml up -d

5. Verify deployment:
   - Check logs: docker-compose logs -f gangrunprinting
   - Test the site: https://gangrunprinting.com

6. Monitor for chunk loading errors:
   - Open browser DevTools
   - Check Network tab for any 400/404 on chunk files
   - Check Console for ChunkLoadError

✅ The chunk loading issue should now be resolved!
"

echo "
⚠️  IMPORTANT NOTES:
- Build ID is now stable (git commit hash or 'stable-build-v1')
- Standalone output is enabled for Docker deployment
- All containers must run the same build
- Clear all caches after deployment
"