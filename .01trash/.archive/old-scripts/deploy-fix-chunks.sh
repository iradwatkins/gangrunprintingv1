#!/bin/bash

# Emergency deployment script to fix chunk loading errors
# Run this on the production server

set -e

echo "🚨 Emergency Fix for Chunk Loading Errors"
echo "========================================="

# Configuration
REPO_URL="https://github.com/iradwatkins/gangrunprinting.git"
APP_DIR="/root/gangrunprinting"
DOCKER_IMAGE="gangrunprinting:production"
CONTAINER_NAME="gangrunprinting"

echo "📍 Working directory: $APP_DIR"

# 1. Backup current deployment
echo "📦 Backing up current deployment..."
if [ -d "$APP_DIR" ]; then
  mv "$APP_DIR" "${APP_DIR}_backup_$(date +%Y%m%d_%H%M%S)"
fi

# 2. Clone fresh repository
echo "📥 Cloning repository..."
git clone "$REPO_URL" "$APP_DIR"
cd "$APP_DIR"

# 3. Create production .env file
echo "🔧 Setting up environment..."
cat > .env.production << 'EOF'
# Database
DATABASE_URL="postgresql://gangrun_user:your_password@localhost:5432/gangrun_production"

# Redis
REDIS_HOST="localhost"
REDIS_PORT="6379"

# Application
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="https://gangrunprinting.com"
PORT="3002"

# Add other required environment variables here
EOF

# 4. Build with Docker
echo "🐳 Building Docker image with fixed configuration..."
docker build -t "$DOCKER_IMAGE" .

# 5. Stop current container
echo "🛑 Stopping current container..."
docker stop "$CONTAINER_NAME" 2>/dev/null || true
docker rm "$CONTAINER_NAME" 2>/dev/null || true

# 6. Clear any cached data
echo "🧹 Clearing caches..."
# Clear Redis cache if needed
redis-cli FLUSHDB 2>/dev/null || true

# Clear nginx cache if exists
rm -rf /var/cache/nginx/* 2>/dev/null || true

# 7. Run new container
echo "🚀 Starting new container..."
docker run -d \
  --name "$CONTAINER_NAME" \
  --restart unless-stopped \
  -p 3002:3002 \
  --env-file .env.production \
  -v /root/gangrunprinting/uploads:/app/uploads \
  --network host \
  "$DOCKER_IMAGE"

# 8. Wait for container to be healthy
echo "⏳ Waiting for container to be healthy..."
sleep 10

# 9. Check container status
if docker ps | grep -q "$CONTAINER_NAME"; then
  echo "✅ Container is running"

  # Test health endpoint
  echo "🔍 Testing health endpoint..."
  curl -s http://localhost:3002/api/health/chunks | python3 -m json.tool || echo "Health check failed"

  echo "📋 Container logs:"
  docker logs --tail 20 "$CONTAINER_NAME"
else
  echo "❌ Container failed to start"
  docker logs "$CONTAINER_NAME"
  exit 1
fi

# 10. Clear CDN cache (if using Cloudflare)
echo "
⚠️  MANUAL STEPS REQUIRED:

1. Clear Cloudflare cache:
   - Log into Cloudflare
   - Go to Caching → Configuration
   - Click 'Purge Everything'

2. Update nginx configuration (if needed):
   Add proper headers for Next.js chunks:

   location /_next/static/ {
       proxy_cache_valid 365d;
       proxy_cache_key \$scheme\$proxy_host\$request_uri;
       add_header Cache-Control 'public, max-age=31536000, immutable';
   }

3. Test the site:
   - Open https://gangrunprinting.com in incognito mode
   - Check DevTools Network tab for any failed chunk loads
   - Navigate through different pages

✅ Deployment complete!
"

echo "
📊 Monitoring commands:
- Check logs: docker logs -f $CONTAINER_NAME
- Check health: curl http://localhost:3002/api/health/chunks
- Check processes: docker ps
- Check disk space: df -h
"