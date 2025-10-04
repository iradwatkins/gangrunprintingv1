# 🔍 IMAGE UPLOAD MONITORING TOOLS

## Quick Commands

### 1. Start Real-Time Monitor
Watches database for new image uploads in real-time:
```bash
/root/websites/gangrunprinting/monitor-image-uploads.sh
```

### 2. Check Recent Activity
Shows last 5 uploads and links:
```bash
/root/websites/gangrunprinting/check-recent-uploads.sh
```

---

## What These Tools Show

### Real-Time Monitor
- ✅ Detects new Image records immediately
- ✅ Shows image details (URL, size, dimensions)
- ✅ Detects ProductImage links
- ✅ Shows which product the image was linked to
- ✅ Displays PM2 logs for upload activity

### Recent Activity Report
- 📸 Last 5 images uploaded (with timestamps)
- 🔗 Last 5 product-image links created
- 📝 Recent upload-related logs

---

## Usage Instructions

**STEP 1: Start the monitor in a terminal**
```bash
ssh root@72.60.28.175
cd /root/websites/gangrunprinting
./monitor-image-uploads.sh
```

**STEP 2: Upload an image via browser**
1. Go to: http://72.60.28.175:3002/auth/signin
2. Login with: iradwatkins@gmail.com / Iw2006js!
3. Navigate to: http://72.60.28.175:3002/admin/products
4. Click Edit on any product
5. Upload an image

**STEP 3: Watch the monitor output**
You'll see:
```
🆕 [16:45:23] NEW IMAGE DETECTED!
   Count: 5 → 6
   📸 Latest Image:
   id: cmgcu1234...
   url: https://gangrunprinting.com/minio/...
   dimensions: 800x600
   size: 245.67 KB
   
🔗 [16:45:24] NEW PRODUCT-IMAGE LINK!
   Product: Test Product
   Slug: test-product
   Is Primary: true
```

---

## Current Issue Detected

**Problem Found:** Images ARE uploading but NOT linking to products!

Evidence from recent activity:
- ✅ 4 images uploaded today (temp-product-*)
- ❌ 0 product-image links created
- ⚠️ Images are "orphaned" - not connected to any product

**This means:**
- Upload API is working ✅
- Image records are created ✅
- ProductImage links NOT created ❌
- Form might not be passing productId correctly ❌

---

## Troubleshooting Commands

### Check orphaned images
```bash
PGPASSWORD='GangRun2024Secure' psql -h 172.22.0.1 -U gangrun_user -d gangrun_db -c "
SELECT i.id, i.name, i.url, i.\"createdAt\"
FROM \"Image\" i
LEFT JOIN \"ProductImage\" pi ON i.id = pi.\"imageId\"
WHERE pi.id IS NULL
ORDER BY i.\"createdAt\" DESC
LIMIT 10;
"
```

### Check PM2 logs for errors
```bash
pm2 logs gangrunprinting --lines 50 | grep -i "error\|upload\|image"
```

### Test upload API directly
```bash
curl -X POST http://localhost:3002/api/products/upload-image \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/tmp/test-image.jpg" \
  -F "productId=2806f273-d4df-442a-b445-b4eefab32e7d" \
  -F "isPrimary=true"
```
