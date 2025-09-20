# Cloudflare Complete Setup Guide for GangRun Printing

## Overview

This guide covers the complete Cloudflare integration including R2 storage, Workers, KV, D1, Pages, and more.

## Quick Start

### 1. Get Your Cloudflare Credentials

1. **API Token (Recommended)**
   - Go to: https://dash.cloudflare.com/profile/api-tokens
   - Click "Create Token"
   - Use template: "Edit zone DNS" or create custom
   - Required permissions:
     - Account: Cloudflare Images:Edit, Cloudflare Stream:Edit, Workers R2 Storage:Edit
     - Zone: Zone:Read, DNS:Edit, SSL and Certificates:Edit, Page Rules:Edit
     - User: User Details:Read

2. **Account ID**
   - Go to any domain in Cloudflare dashboard
   - Right sidebar shows "Account ID"
   - Copy this value

3. **Zone ID**
   - Go to your domain (gangrunprinting.com)
   - Right sidebar shows "Zone ID"
   - Copy this value

### 2. R2 Storage Setup (Replaces MinIO)

1. **Create R2 Bucket**

   ```bash
   # Go to: https://dash.cloudflare.com/[account-id]/r2/overview
   # Click "Create bucket"
   # Name: gangrun-assets
   # Location: Automatic
   ```

2. **Generate R2 API Credentials**
   - In R2 Overview, click "Manage R2 API tokens"
   - Create new API token
   - Permissions: Object Read & Write
   - TTL: Permanent
   - Save the credentials:
     - Access Key ID
     - Secret Access Key
     - Endpoint URL

3. **Configure Public Access (Optional)**
   - In bucket settings, go to "Settings"
   - Enable "Public access"
   - Note the public URL

### 3. Workers Setup (Edge Functions)

1. **Create Worker**

   ```bash
   # Go to: https://dash.cloudflare.com/[account-id]/workers
   # Click "Create a Service"
   # Name: gangrun-api
   # Starter: HTTP Handler
   ```

2. **Deploy Worker**

   ```javascript
   // Example worker for image optimization
   export default {
     async fetch(request, env) {
       const url = new URL(request.url)

       // Handle R2 requests
       if (url.pathname.startsWith('/assets/')) {
         const key = url.pathname.slice(8)
         const object = await env.GANGRUN_BUCKET.get(key)

         if (object === null) {
           return new Response('Not found', { status: 404 })
         }

         const headers = new Headers()
         object.writeHttpMetadata(headers)
         headers.set('etag', object.httpEtag)

         return new Response(object.body, { headers })
       }

       return new Response('GangRun Printing API', { status: 200 })
     },
   }
   ```

### 4. KV Namespace Setup (Key-Value Storage)

1. **Create KV Namespace**

   ```bash
   # Go to: https://dash.cloudflare.com/[account-id]/workers/kv/namespaces
   # Click "Create namespace"
   # Name: gangrun-cache
   ```

2. **Bind to Worker**
   - In Worker settings, go to "Variables"
   - Add KV Namespace binding
   - Variable name: CACHE
   - KV namespace: gangrun-cache

### 5. D1 Database Setup (SQLite at Edge)

1. **Create D1 Database**

   ```bash
   # Go to: https://dash.cloudflare.com/[account-id]/workers/d1
   # Click "Create database"
   # Name: gangrun-db
   # Location: Automatic
   ```

2. **Initialize Schema**

   ```sql
   CREATE TABLE products (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     name TEXT NOT NULL,
     price REAL NOT NULL,
     category TEXT,
     image_url TEXT,
     created_at DATETIME DEFAULT CURRENT_TIMESTAMP
   );

   CREATE TABLE orders (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     customer_email TEXT NOT NULL,
     total REAL NOT NULL,
     status TEXT DEFAULT 'pending',
     created_at DATETIME DEFAULT CURRENT_TIMESTAMP
   );
   ```

### 6. Pages Setup (Static Site Hosting)

1. **Create Pages Project**

   ```bash
   # Go to: https://dash.cloudflare.com/[account-id]/pages
   # Connect to Git repository
   # Framework preset: Next.js
   # Build command: npm run build
   # Build output: .next
   ```

2. **Environment Variables**
   - Add all necessary env vars in Pages settings
   - They'll be available during build

### 7. Images Setup (Automatic Optimization)

1. **Enable Cloudflare Images**

   ```bash
   # Go to: https://dash.cloudflare.com/[account-id]/images
   # Subscribe to Images plan ($5/month for 100,000 images)
   ```

2. **Upload Images via API**

   ```javascript
   const formData = new FormData()
   formData.append('file', imageFile)

   const response = await fetch(
     `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/images/v1`,
     {
       method: 'POST',
       headers: {
         Authorization: `Bearer ${API_TOKEN}`,
       },
       body: formData,
     }
   )
   ```

### 8. Stream Setup (Video Hosting)

1. **Enable Stream**

   ```bash
   # Go to: https://dash.cloudflare.com/[account-id]/stream
   # Subscribe to Stream plan
   ```

2. **Upload Videos**
   ```javascript
   const response = await fetch(
     `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/stream`,
     {
       method: 'POST',
       headers: {
         Authorization: `Bearer ${API_TOKEN}`,
         'Content-Type': 'application/json',
       },
       body: JSON.stringify({
         url: 'https://example.com/video.mp4',
         meta: { name: 'Product Demo' },
       }),
     }
   )
   ```

## Environment Variables Checklist

Add these to your `.env` file:

```env
# Core Cloudflare
CLOUDFLARE_API_TOKEN=your_api_token_here
CLOUDFLARE_ACCOUNT_ID=your_account_id_here
CLOUDFLARE_ZONE_ID=your_zone_id_here

# R2 Storage
R2_ACCESS_KEY_ID=your_r2_access_key
R2_SECRET_ACCESS_KEY=your_r2_secret_key
R2_BUCKET_NAME=gangrun-assets
R2_ENDPOINT=https://[account-id].r2.cloudflarestorage.com
R2_PUBLIC_URL=https://pub-[random].r2.dev

# Workers
CLOUDFLARE_WORKERS_ROUTE=https://gangrun-api.workers.dev

# KV Namespace
CLOUDFLARE_KV_NAMESPACE_ID=your_kv_namespace_id

# D1 Database
CLOUDFLARE_D1_DATABASE_ID=your_d1_database_id

# Images
CLOUDFLARE_IMAGES_ACCOUNT_ID=same_as_account_id

# Stream
CLOUDFLARE_STREAM_API_TOKEN=same_as_api_token
```

## MCP Integration

The Cloudflare MCP server is now installed and configured. You can use it to:

1. **Manage DNS Records**

   ```javascript
   // List DNS records
   await cloudflare.dns.list(zoneId)

   // Create DNS record
   await cloudflare.dns.create(zoneId, {
     type: 'A',
     name: 'api',
     content: '192.0.2.1',
     ttl: 3600,
   })
   ```

2. **Manage R2 Storage**

   ```javascript
   // Upload to R2
   await cloudflare.r2.put(bucketName, key, data)

   // Get from R2
   const object = await cloudflare.r2.get(bucketName, key)

   // Delete from R2
   await cloudflare.r2.delete(bucketName, key)
   ```

3. **Deploy Workers**

   ```javascript
   // Update worker code
   await cloudflare.workers.update(scriptName, workerCode)

   // Create route
   await cloudflare.workers.createRoute(pattern, scriptName)
   ```

## Testing Cloudflare Connection

Run the test script:

```bash
./test-cloudflare.sh
```

## Next Steps

1. Fill in all Cloudflare credentials in `.env`
2. Migrate from MinIO to R2 storage
3. Set up Workers for API endpoints
4. Configure D1 for edge database
5. Deploy to Cloudflare Pages
6. Enable image optimization
7. Set up video streaming if needed

## Security Notes

- Use API tokens instead of Global API Key
- Limit token permissions to only what's needed
- Rotate tokens regularly
- Use separate tokens for different environments
- Enable 2FA on your Cloudflare account

## Support

- Cloudflare Docs: https://developers.cloudflare.com
- R2 Docs: https://developers.cloudflare.com/r2
- Workers Docs: https://developers.cloudflare.com/workers
- D1 Docs: https://developers.cloudflare.com/d1
- Pages Docs: https://developers.cloudflare.com/pages
