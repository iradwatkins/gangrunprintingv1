#!/bin/bash

echo "🔍 IMAGE UPLOAD MONITOR - Starting..."
echo "📊 Monitoring database for image uploads in real-time"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Get initial counts
INITIAL_IMAGES=$(PGPASSWORD='GangRun2024Secure' psql -h 172.22.0.1 -U gangrun_user -d gangrun_db -tAc "SELECT COUNT(*) FROM \"Image\";")
INITIAL_PRODUCT_IMAGES=$(PGPASSWORD='GangRun2024Secure' psql -h 172.22.0.1 -U gangrun_user -d gangrun_db -tAc "SELECT COUNT(*) FROM \"ProductImage\";")

echo "📈 Initial State:"
echo "   Images in database: $INITIAL_IMAGES"
echo "   ProductImage links: $INITIAL_PRODUCT_IMAGES"
echo ""
echo "👀 Watching for changes... (Press Ctrl+C to stop)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

LAST_IMAGE_COUNT=$INITIAL_IMAGES
LAST_PRODUCT_IMAGE_COUNT=$INITIAL_PRODUCT_IMAGES

while true; do
    # Check current counts
    CURRENT_IMAGES=$(PGPASSWORD='GangRun2024Secure' psql -h 172.22.0.1 -U gangrun_user -d gangrun_db -tAc "SELECT COUNT(*) FROM \"Image\";")
    CURRENT_PRODUCT_IMAGES=$(PGPASSWORD='GangRun2024Secure' psql -h 172.22.0.1 -U gangrun_user -d gangrun_db -tAc "SELECT COUNT(*) FROM \"ProductImage\";")
    
    # Check if Image table changed
    if [ "$CURRENT_IMAGES" != "$LAST_IMAGE_COUNT" ]; then
        echo "🆕 [$(date '+%H:%M:%S')] NEW IMAGE DETECTED!"
        echo "   Count: $LAST_IMAGE_COUNT → $CURRENT_IMAGES"
        
        # Get the latest image details
        PGPASSWORD='GangRun2024Secure' psql -h 172.22.0.1 -U gangrun_user -d gangrun_db << SQL
SELECT 
    '   📸 Latest Image:' as info,
    id,
    name,
    url,
    "thumbnailUrl",
    width || 'x' || height as dimensions,
    ROUND(("fileSize"::numeric / 1024), 2) || ' KB' as size,
    "createdAt"
FROM "Image"
ORDER BY "createdAt" DESC
LIMIT 1;
SQL
        echo ""
        LAST_IMAGE_COUNT=$CURRENT_IMAGES
    fi
    
    # Check if ProductImage link changed
    if [ "$CURRENT_PRODUCT_IMAGES" != "$LAST_PRODUCT_IMAGE_COUNT" ]; then
        echo "🔗 [$(date '+%H:%M:%S')] NEW PRODUCT-IMAGE LINK!"
        echo "   Count: $LAST_PRODUCT_IMAGE_COUNT → $CURRENT_PRODUCT_IMAGES"
        
        # Get the latest link details
        PGPASSWORD='GangRun2024Secure' psql -h 172.22.0.1 -U gangrun_user -d gangrun_db << SQL
SELECT 
    '   🔗 Link Details:' as info,
    pi.id as link_id,
    p.name as product_name,
    p.slug as product_slug,
    pi."isPrimary" as is_primary,
    pi."sortOrder" as sort_order,
    i.url as image_url
FROM "ProductImage" pi
JOIN "Product" p ON pi."productId" = p.id
JOIN "Image" i ON pi."imageId" = i.id
ORDER BY pi."createdAt" DESC
LIMIT 1;
SQL
        echo ""
        LAST_PRODUCT_IMAGE_COUNT=$CURRENT_PRODUCT_IMAGES
    fi
    
    # Check PM2 logs for upload activity
    NEW_LOGS=$(timeout 1 pm2 logs gangrunprinting --nostream --lines 5 2>/dev/null | grep -i "upload\|image" | tail -1)
    if [ ! -z "$NEW_LOGS" ]; then
        echo "📋 [$(date '+%H:%M:%S')] LOG: $NEW_LOGS"
    fi
    
    sleep 2
done
