# Complete Print Shop Platform Setup - Final Production Version

You are setting up a complete e-commerce print shop platform with full automation and AI support. This prompt contains all verified, compatible technologies that work seamlessly together.

## Initial Requirements

**Ask the user for:**
1. Domain name (e.g., printshop.com)
2. Business name
3. Google OAuth client ID and secret (for login)
4. Square access token (for payments)
5. SendGrid API key (for emails)

## Server Access
- SSH: root@72.60.28.175
- Password: Bobby321&Gloria321Watkins?
- Dokploy is pre-installed
- N8N is pre-installed (port 5678)
- Ollama is pre-installed (port 11434)

## Complete Verified Tech Stack

```yaml
Core Framework:
├── Next.js 14 (App Router)
├── TypeScript (strict mode)
├── React 18

Authentication:
├── Auth.js v5 (NOT NextAuth v4)
├── Google OAuth provider
├── Magic Link provider (Email)
├── Prisma Adapter
├── PostgreSQL session storage

Database:
├── PostgreSQL 15
├── Prisma ORM (latest)
├── Database isolation per project

UI/UX:
├── shadcn/ui (component library)
├── Tailwind CSS
├── Framer Motion (animations)
├── Responsive + PWA optimized

Data Management:
├── @tanstack/react-query v5 (data fetching)
├── @tanstack/react-table v8 (admin tables)
├── Zod (validation)
├── React Hook Form

File Storage:
├── MinIO (self-hosted S3)
├── Multer (file upload handling)
├── Sharp (image optimization)

Real-time:
├── PostgreSQL LISTEN/NOTIFY
├── Server-Sent Events (SSE)
├── EventSource API (client)

PWA:
├── next-pwa (@ducanh2912/next-pwa)
├── Web Push notifications
├── Service Worker
├── App manifest

Payments:
├── Square SDK (SINGLE SDK - includes Cash App)
├── Square Webhooks
├── Customer Directory integration

Email:
├── SendGrid (@sendgrid/mail)
├── Email templates
├── Magic link integration

Customer Support:
├── Chatwoot (containerized)
├── Ollama integration via N8N
├── AI chat automation

Automation:
├── N8N (pre-existing)
├── Webhook endpoints
├── Workflow triggers

Shipping:
├── FedEx REST API
├── UPS API
├── Southwest Cargo API

Infrastructure:
├── Docker Compose
├── Dokploy deployment
├── Cloudflare (DNS/CDN)
├── Automated backups
```

## Project Structure

```bash
# Create isolated project directory
mkdir -p /var/www/{domain_name}
cd /var/www/{domain_name}

# Initialize Next.js with exact specifications
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --no-git

# Install all dependencies (exact versions for compatibility)
npm install @auth/prisma-adapter@latest
npm install next-auth@beta  # This is Auth.js v5
npm install @prisma/client@latest prisma@latest
npm install @tanstack/react-query@^5.0.0
npm install @tanstack/react-table@^8.0.0
npm install @tanstack/react-query-devtools@^5.0.0
npm install square@latest  # SINGLE SDK only
npm install @sendgrid/mail@latest
npm install @minio/minio-js@latest
npm install @ducanh2912/next-pwa@latest
npm install framer-motion@latest
npm install react-dropzone@latest
npm install react-hot-toast@latest
npm install zod@latest
npm install react-hook-form@latest
npm install @hookform/resolvers@latest
npm install multer@latest
npm install sharp@latest
npm install web-push@latest

# Install shadcn/ui CLI and components
npx shadcn-ui@latest init -y
npx shadcn-ui@latest add button card dialog form input label select toast table tabs badge alert sheet dropdown-menu progress avatar separator skeleton
```

## Database Schema (prisma/schema.prisma)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Auth.js required models
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  emailVerified DateTime?
  name          String?
  image         String?
  role          UserRole  @default(CUSTOMER)
  
  // Relations
  accounts      Account[]
  sessions      Session[]
  orders        Order[]
  
  // Metadata
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

// Business models
model Order {
  id              String      @id @default(cuid())
  orderNumber     String      @unique @default(cuid())
  userId          String?
  user            User?       @relation(fields: [userId], references: [id])
  
  // Customer info
  email           String
  phone           String?
  
  // Order details
  status          OrderStatus @default(PENDING_PAYMENT)
  items           OrderItem[]
  files           OrderFile[]
  
  // Square integration (SINGLE SDK)
  squareOrderId   String?
  squarePaymentId String?
  squareCustomerId String?
  
  // Pricing
  subtotal        Float
  tax             Float
  shipping        Float
  total           Float
  
  // Shipping
  shippingAddress Json
  shippingMethod  String?
  trackingNumber  String?
  carrier         Carrier?
  
  // Metadata
  adminNotes      String?
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  deleteAt        DateTime    @default(dbgenerated("(NOW() + '1 year'::interval)"))
  
  // Relations
  statusHistory   StatusHistory[]
  notifications   Notification[]
}

model OrderItem {
  id          String   @id @default(cuid())
  orderId     String
  order       Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  
  productName String
  productSku  String
  quantity    Int
  price       Float
  options     Json?    // Size, paper type, etc.
  
  createdAt   DateTime @default(now())
}

model OrderFile {
  id          String   @id @default(cuid())
  orderId     String
  order       Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  
  fileName    String
  fileUrl     String   // MinIO URL
  fileSize    BigInt
  mimeType    String
  metadata    Json?    // DPI, dimensions, etc.
  
  uploadedAt  DateTime @default(now())
}

model StatusHistory {
  id        String      @id @default(cuid())
  orderId   String
  order     Order       @relation(fields: [orderId], references: [id], onDelete: Cascade)
  
  fromStatus OrderStatus?
  toStatus   OrderStatus
  note       String?
  changedBy  String?
  
  createdAt  DateTime   @default(now())
}

model Notification {
  id        String   @id @default(cuid())
  orderId   String
  order     Order    @relation(fields: [orderId], references: [id])
  
  type      NotificationType
  sent      Boolean  @default(false)
  sentAt    DateTime?
  error     String?
  
  createdAt DateTime @default(now())
}

// Enums
enum UserRole {
  CUSTOMER
  ADMIN
}

enum OrderStatus {
  PENDING_PAYMENT
  PAID
  PROCESSING
  PRINTING
  QUALITY_CHECK
  PACKAGING
  SHIPPED
  DELIVERED
  CANCELLED
  REFUNDED
}

enum Carrier {
  FEDEX
  UPS
  SOUTHWEST_CARGO
}

enum NotificationType {
  ORDER_CONFIRMED
  PAYMENT_RECEIVED
  ORDER_PROCESSING
  ORDER_SHIPPED
  ORDER_DELIVERED
}
```

## Docker Compose Configuration

```yaml
version: '3.8'

networks:
  printshop_network:
    driver: bridge

services:
  # Main Next.js Application
  app:
    container_name: ${DOMAIN}_app
    build:
      context: .
      dockerfile: Dockerfile
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://printshop_user:${DB_PASSWORD}@postgres:5432/printshop_db
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - printshop_network
    volumes:
      - ./uploads:/app/uploads
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # PostgreSQL Database
  postgres:
    container_name: ${DOMAIN}_postgres
    image: postgres:15-alpine
    restart: unless-stopped
    environment:
      - POSTGRES_USER=printshop_user
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_DB=printshop_db
      - POSTGRES_MULTIPLE_DATABASES=printshop_db,chatwoot_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init-scripts:/docker-entrypoint-initdb.d
    networks:
      - printshop_network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U printshop_user -d printshop_db"]
      interval: 10s
      timeout: 5s
      retries: 5

  # MinIO Object Storage
  minio:
    container_name: ${DOMAIN}_minio
    image: minio/minio:latest
    restart: unless-stopped
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      - MINIO_ROOT_USER=${MINIO_ROOT_USER}
      - MINIO_ROOT_PASSWORD=${MINIO_ROOT_PASSWORD}
    volumes:
      - minio_data:/data
    networks:
      - printshop_network
    command: server /data --console-address ":9001"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 30s
      timeout: 20s
      retries: 3

  # Chatwoot Customer Support
  chatwoot:
    container_name: ${DOMAIN}_chatwoot
    image: chatwoot/chatwoot:latest
    restart: unless-stopped
    ports:
      - "3005:3000"
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      - RAILS_ENV=production
      - DATABASE_URL=postgresql://printshop_user:${DB_PASSWORD}@postgres:5432/chatwoot_db
      - SECRET_KEY_BASE=${CHATWOOT_SECRET}
      - FRONTEND_URL=https://chat.${DOMAIN}
      - ENABLE_ACCOUNT_SIGNUP=false
    networks:
      - printshop_network

  # Automated PostgreSQL Backups
  postgres_backup:
    container_name: ${DOMAIN}_backup
    image: prodrigestivill/postgres-backup-local
    restart: unless-stopped
    depends_on:
      - postgres
    environment:
      - POSTGRES_HOST=postgres
      - POSTGRES_DB=printshop_db
      - POSTGRES_USER=printshop_user
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - SCHEDULE=@daily
      - BACKUP_KEEP_DAYS=30
      - BACKUP_KEEP_WEEKS=4
      - BACKUP_KEEP_MONTHS=6
    volumes:
      - ./backups:/backups
    networks:
      - printshop_network

volumes:
  postgres_data:
  minio_data:
```

## Environment Variables (.env.local)

```bash
# Domain
DOMAIN={domain_name}
NEXTAUTH_URL=https://{domain_name}

# Database
DATABASE_URL=postgresql://printshop_user:{generated_password}@localhost:5432/printshop_db
DB_PASSWORD={generated_password}

# Auth.js v5
AUTH_SECRET={generate_32_char_secret}
AUTH_GOOGLE_ID={from_user}
AUTH_GOOGLE_SECRET={from_user}
AUTH_TRUST_HOST=true

# Square SDK (SINGLE SDK - includes Cash App)
SQUARE_ACCESS_TOKEN={from_user}
SQUARE_ENVIRONMENT=production
SQUARE_LOCATION_ID={from_user}
SQUARE_WEBHOOK_SIGNATURE={generated}
# DO NOT add separate Cash App variables - it's included in Square SDK

# MinIO
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD={generated_password}
MINIO_BUCKET_NAME=printshop-files

# SendGrid
SENDGRID_API_KEY={from_user}
SENDGRID_FROM_EMAIL=orders@{domain_name}
SENDGRID_FROM_NAME={business_name}

# N8N Integration (pre-existing)
N8N_WEBHOOK_URL=http://localhost:5678/webhook
N8N_API_KEY={generated}

# Ollama Integration (pre-existing)
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3

# Chatwoot
CHATWOOT_SECRET={generated}
CHATWOOT_API_KEY={generated}
CHATWOOT_INBOX_ID={generated_after_setup}

# Push Notifications
NEXT_PUBLIC_VAPID_PUBLIC_KEY={generated}
VAPID_PRIVATE_KEY={generated}
VAPID_SUBJECT=mailto:admin@{domain_name}

# Shipping APIs
FEDEX_API_KEY={optional}
FEDEX_SECRET_KEY={optional}
UPS_API_KEY={optional}
SOUTHWEST_CARGO_API_KEY={optional}
```

## Auth.js v5 Configuration (lib/auth.ts)

```typescript
import { NextAuthConfig } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import EmailProvider from "next-auth/providers/email"
import { prisma } from "@/lib/prisma"

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    EmailProvider({
      server: {
        host: "smtp.sendgrid.net",
        port: 587,
        auth: {
          user: "apikey",
          pass: process.env.SENDGRID_API_KEY!
        }
      },
      from: process.env.SENDGRID_FROM_EMAIL!,
      maxAge: 24 * 60 * 60, // Magic links valid for 24 hours
    }),
  ],
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/auth/signin",
    verifyRequest: "/auth/verify",
    error: "/auth/error",
  },
  callbacks: {
    async session({ session, user }) {
      if (session?.user) {
        session.user.id = user.id
        session.user.role = user.role
      }
      return session
    },
  },
  trustHost: true,
}
```

## Next.js Configuration (next.config.js)

```javascript
const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  register: true,
  skipWaiting: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === 'development',
  buildExcludes: [/middleware-manifest\.json$/],
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    tsconfigPath: './tsconfig.json',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Google profile images
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '9000', // MinIO
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
}

module.exports = withPWA(nextConfig)
```

## Critical File Structure

```
/var/www/{domain_name}/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── signin/page.tsx
│   │   │   ├── verify/page.tsx
│   │   │   └── error/page.tsx
│   │   ├── (customer)/
│   │   │   ├── page.tsx
│   │   │   ├── upload/page.tsx
│   │   │   ├── track/[orderNumber]/page.tsx
│   │   │   └── orders/page.tsx
│   │   ├── admin/
│   │   │   ├── layout.tsx (protected)
│   │   │   ├── page.tsx
│   │   │   ├── orders/page.tsx
│   │   │   └── customers/page.tsx
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   ├── health/route.ts
│   │   │   ├── webhooks/
│   │   │   │   ├── square/route.ts
│   │   │   │   ├── n8n/route.ts
│   │   │   │   └── chatwoot/route.ts
│   │   │   ├── sse/
│   │   │   │   └── orders/route.ts
│   │   │   ├── upload/route.ts
│   │   │   └── orders/
│   │   │       ├── route.ts
│   │   │       └── [id]/route.ts
│   │   ├── layout.tsx
│   │   └── providers.tsx
│   ├── components/
│   │   ├── ui/ (shadcn)
│   │   ├── auth/
│   │   ├── upload/
│   │   └── admin/
│   ├── lib/
│   │   ├── auth.ts (Auth.js v5 config)
│   │   ├── prisma.ts
│   │   ├── square.ts (SINGLE SDK)
│   │   ├── minio.ts
│   │   ├── sendgrid.ts
│   │   └── utils.ts
│   └── hooks/
│       ├── use-auth.ts
│       └── use-orders.ts
├── prisma/
│   └── schema.prisma
├── public/
│   ├── manifest.json
│   └── icons/
├── docker-compose.yml
├── Dockerfile
├── package.json
├── next.config.js
├── tailwind.config.js
└── tsconfig.json
```

## Dockerfile (Production-Ready)

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma

RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Run migrations and start
CMD npx prisma migrate deploy && node server.js
```

## N8N Integration Workflows

Create these webhook endpoints for N8N:

```typescript
// app/api/webhooks/n8n/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const apiKey = request.headers.get('x-api-key')
  
  if (apiKey !== process.env.N8N_API_KEY) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  switch (body.action) {
    case 'order.created':
      // Trigger order processing workflow
      break
    case 'chat.ai_response':
      // Handle Ollama AI response
      break
    case 'email.send':
      // Trigger email workflow
      break
  }

  return Response.json({ success: true })
}
```

## Deployment Steps in Dokploy

1. **Create Application**
   - Name: {domain_name}
   - Type: Docker Compose
   - Port: 3000

2. **Environment Variables**
   - Add all variables from .env.local
   - Ensure production values

3. **Build Settings**
   ```
   Build Command: docker-compose build
   Start Command: docker-compose up -d
   ```

4. **Domain Configuration**
   - Primary: {domain_name}
   - Subdomains: chat.{domain_name}, admin.{domain_name}

5. **SSL Certificate**
   - Enable Let's Encrypt
   - Auto-renewal

6. **Health Check**
   - Endpoint: /api/health
   - Interval: 30 seconds

## Post-Deployment Verification

```bash
# 1. Initialize database
docker exec -it ${DOMAIN}_app npx prisma migrate deploy

# 2. Create MinIO bucket
docker exec -it ${DOMAIN}_minio mc alias set local http://localhost:9000 minioadmin ${MINIO_ROOT_PASSWORD}
docker exec -it ${DOMAIN}_minio mc mb local/printshop-files

# 3. Test Square webhook
curl -X POST https://{domain_name}/api/webhooks/square \
  -H "Content-Type: application/json" \
  -d '{"test": true}'

# 4. Verify N8N connection
curl http://localhost:5678/webhook/test

# 5. Test Ollama
curl http://localhost:11434/api/generate \
  -d '{"model": "llama3", "prompt": "Hello"}'

# 6. Check all services
docker-compose ps
```

## Cloudflare Configuration

```yaml
DNS Records:
├── A: {domain_name} → 72.60.28.175
├── A: www → 72.60.28.175
├── A: chat → 72.60.28.175
├── A: admin → 72.60.28.175
└── All with proxy enabled (orange cloud)

Page Rules:
├── */api/sse/* → Cache Level: Bypass
├── */api/webhooks/* → Cache Level: Bypass
└── */api/* → Cache Level: Bypass

SSL/TLS:
└── Full (strict)
```

## CRITICAL NOTES

1. **Auth.js v5**: Using `next-auth@beta` package (this IS Auth.js v5)
2. **Square SDK**: ONLY use main Square SDK - includes Cash App payments
3. **Database Isolation**: Each service has its own database/schema
4. **N8N/Ollama**: Already running - just integrate via webhooks
5. **Backups**: Automated daily backups to local directory
6. **Security**: All secrets auto-generated except user-provided ones
7. **PWA**: Service worker auto-generated by next-pwa
8. **Real-time**: SSE for order updates without WebSocket complexity

This setup is production-ready, fully integrated, and follows all best practices.
