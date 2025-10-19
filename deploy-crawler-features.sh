#!/bin/bash

# Deploy Crawler Features to Production
# Date: October 19, 2025

set -e

echo "🚀 Deploying Crawler Features to Production..."
echo ""

# Stop old containers
echo "📦 Stopping old containers..."
docker-compose down

# Build with no cache
echo "🔨 Building fresh containers..."
docker-compose build app --no-cache

# Start all services
echo "▶️  Starting services..."
docker-compose up -d

# Wait for app to be healthy
echo "⏳ Waiting for app to start..."
sleep 10

# Check if app is running
if docker ps | grep -q gangrunprinting_app; then
    echo "✅ App is running!"

    # Test key endpoints
    echo ""
    echo "🧪 Testing deployments..."

    echo "  - Testing robots.txt..."
    curl -s https://gangrunprinting.com/robots.txt | head -10 | grep -q "Googlebot" && echo "    ✅ robots.txt updated" || echo "    ❌ robots.txt not updated"

    echo "  - Testing FAQ pages..."
    curl -s -I https://gangrunprinting.com/faq | grep -q "200" && echo "    ✅ FAQ pages ready" || echo "    ⚠️  FAQ pages pending"

    echo "  - Testing crawler dashboard..."
    curl -s -I https://gangrunprinting.com/admin/seo/crawlers | grep -q "200" && echo "    ✅ Crawler dashboard ready" || echo "    ⚠️  Crawler dashboard pending"

    echo ""
    echo "✅ Deployment complete!"
    echo ""
    echo "📍 Access crawler dashboard at:"
    echo "   https://gangrunprinting.com/admin/seo/crawlers"
    echo ""
    echo "📍 View FAQ pages at:"
    echo "   https://gangrunprinting.com/faq"
    echo "   https://gangrunprinting.com/faq/business-cards"
    echo "   https://gangrunprinting.com/faq/flyers"

else
    echo "❌ App failed to start. Check logs:"
    echo "   docker logs --tail=50 gangrunprinting_app"
    exit 1
fi
