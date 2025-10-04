#!/bin/bash

echo "📊 RECENT IMAGE UPLOAD REPORT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "📸 Last 5 Images Uploaded:"
PGPASSWORD='GangRun2024Secure' psql -h 172.22.0.1 -U gangrun_user -d gangrun_db -c "
SELECT 
    LEFT(id, 8) || '...' as id,
    name,
    url,
    width || 'x' || height as size,
    TO_CHAR(\"createdAt\", 'YYYY-MM-DD HH24:MI:SS') as uploaded_at
FROM \"Image\"
ORDER BY \"createdAt\" DESC
LIMIT 5;
"

echo ""
echo "🔗 Last 5 Product-Image Links:"
PGPASSWORD='GangRun2024Secure' psql -h 172.22.0.1 -U gangrun_user -d gangrun_db -c "
SELECT 
    p.name as product,
    p.slug,
    i.url as image_url,
    pi.\"isPrimary\" as primary,
    TO_CHAR(pi.\"createdAt\", 'YYYY-MM-DD HH24:MI:SS') as linked_at
FROM \"ProductImage\" pi
JOIN \"Product\" p ON pi.\"productId\" = p.id
JOIN \"Image\" i ON pi.\"imageId\" = i.id
ORDER BY pi.\"createdAt\" DESC
LIMIT 5;
"

echo ""
echo "📝 Recent Upload Logs (last 20 lines):"
timeout 2 pm2 logs gangrunprinting --nostream --lines 20 2>/dev/null | grep -i "upload\|image" || echo "No upload logs found"
