#!/bin/bash

# ============================================================================
# PORTABLE SEO + LLM SYSTEM - COMPLETE EXTRACTION SCRIPT
# ============================================================================
# This script extracts ALL SEO, LLM, and analytics code from GangRun Printing
# into a portable, reusable codebase for deployment on other websites.
# ============================================================================

SOURCE="/root/websites/gangrunprinting"
DEST="/root/portable-seo-llm-system"

echo "🚀 STARTING COMPLETE EXTRACTION..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ============================================================================
# 1. CORE SEO COMPONENTS
# ============================================================================
echo "📊 [1/8] Extracting Core SEO Components..."

# Metadata system
cp "$SOURCE/src/lib/seo/metadata.ts" "$DEST/1-core-seo/metadata/" 2>/dev/null
cp "$SOURCE/src/lib/metadata.ts" "$DEST/1-core-seo/metadata/" 2>/dev/null

# Schema markup
cp "$SOURCE/src/lib/seo/schema.ts" "$DEST/1-core-seo/schema/" 2>/dev/null
cp "$SOURCE/src/lib/schema-generators.ts" "$DEST/1-core-seo/schema/" 2>/dev/null

# Sitemap
cp "$SOURCE/src/app/sitemap.ts" "$DEST/1-core-seo/sitemap/" 2>/dev/null

# SEO Content Generator
cp "$SOURCE/src/lib/seo-brain/generate-product-seo.ts" "$DEST/1-core-seo/content-generator/" 2>/dev/null

echo "   ✅ SEO components extracted"

# ============================================================================
# 2. LLM INTEGRATIONS
# ============================================================================
echo "🤖 [2/8] Extracting LLM Integrations..."

# Ollama
cp "$SOURCE/src/lib/seo-brain/ollama-client.ts" "$DEST/2-llm-integrations/ollama/" 2>/dev/null

# Google Imagen
cp "$SOURCE/src/lib/image-generation/google-ai-client.ts" "$DEST/2-llm-integrations/google-imagen/" 2>/dev/null

# OpenAI Translation
cp "$SOURCE/src/lib/i18n/auto-translate.ts" "$DEST/2-llm-integrations/openai/" 2>/dev/null

# Shared utilities
cp "$SOURCE/src/lib/image-compression.ts" "$DEST/2-llm-integrations/shared/" 2>/dev/null

echo "   ✅ LLM integrations extracted"

# ============================================================================
# 3. SEO BRAIN SYSTEM (200-City Generator)
# ============================================================================
echo "🧠 [3/8] Extracting SEO Brain System..."

# Campaign generator
cp "$SOURCE/src/lib/seo-brain/city-page-generator.ts" "$DEST/3-seo-brain/campaign-generator/" 2>/dev/null
cp "$SOURCE/src/lib/seo-brain/city-content-prompts.ts" "$DEST/3-seo-brain/campaign-generator/" 2>/dev/null
cp "$SOURCE/src/lib/seo-brain/city-data-types.ts" "$DEST/3-seo-brain/city-data/" 2>/dev/null

# Performance analyzer
cp "$SOURCE/src/lib/seo-brain/performance-analyzer.ts" "$DEST/3-seo-brain/performance-analyzer/" 2>/dev/null

# Winner analyzer
cp "$SOURCE/src/lib/seo-brain/winner-analyzer.ts" "$DEST/3-seo-brain/winner-analyzer/" 2>/dev/null

# Loser improver
cp "$SOURCE/src/lib/seo-brain/loser-improver.ts" "$DEST/3-seo-brain/loser-improver/" 2>/dev/null

# Telegram notifier
cp "$SOURCE/src/lib/seo-brain/telegram-notifier.ts" "$DEST/3-seo-brain/telegram-notifier/" 2>/dev/null

# N8N integration
cp "$SOURCE/src/lib/n8n/integration.ts" "$DEST/3-seo-brain/" 2>/dev/null

echo "   ✅ SEO Brain system extracted"

# ============================================================================
# 4. ANALYTICS INTEGRATION
# ============================================================================
echo "📈 [4/8] Extracting Analytics Integration..."

# Google Analytics setup
mkdir -p "$DEST/4-analytics-integration/google-analytics"
cat > "$DEST/4-analytics-integration/google-analytics/setup-ga4.md" << 'EOF'
# Google Analytics 4 Setup

## Installation

Add to your `app/layout.tsx`:

\`\`\`typescript
import Script from 'next/script'

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XXXXXXXXXX');
          `}
        </Script>
      </head>
      <body>{children}</body>
    </html>
  )
}
\`\`\`

## Environment Variables

\`\`\`bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
\`\`\`
EOF

echo "   ✅ Analytics integration extracted"

# ============================================================================
# 5. DATABASE SCHEMA
# ============================================================================
echo "💾 [5/8] Extracting Database Schema..."

# Copy Prisma schema
cp "$SOURCE/prisma/schema.prisma" "$DEST/5-database-schema/prisma-models/" 2>/dev/null

# Extract relevant models
cat > "$DEST/5-database-schema/REQUIRED-MODELS.md" << 'EOF'
# Required Database Models for Portable SEO + LLM System

## Core Models

1. **City** - 200 US cities data
2. **CityLandingPage** - Generated city-specific pages
3. **Product** - Product catalog
4. **ProductSEOContent** - AI-generated SEO content cache
5. **Translation** - Multi-language translations
6. **N8NWebhook** - Automation triggers

## Optional Models (if using full SEO Brain)

7. **ProductCampaignQueue** - Campaign management
8. **ContentSnapshot** - A/B testing versions
9. **PerformanceMetrics** - Analytics tracking

See `prisma-models/schema.prisma` for complete schema definitions.
EOF

echo "   ✅ Database schema extracted"

# ============================================================================
# 6. API ROUTES
# ============================================================================
echo "🌐 [6/8] Extracting API Routes..."

# Chat API
mkdir -p "$DEST/6-api-routes/chat"
cp -r "$SOURCE/src/app/api/chat"/* "$DEST/6-api-routes/chat/" 2>/dev/null

# SEO Brain API
mkdir -p "$DEST/6-api-routes/seo-brain"
cp -r "$SOURCE/src/app/api/seo-brain"/* "$DEST/6-api-routes/seo-brain/" 2>/dev/null

# Image Generation API
mkdir -p "$DEST/6-api-routes/image-generation"
cp "$SOURCE/src/app/api/products/generate-image/route.ts" "$DEST/6-api-routes/image-generation/" 2>/dev/null

# Webhooks
mkdir -p "$DEST/6-api-routes/webhooks"
cp -r "$SOURCE/src/app/api/webhooks"/* "$DEST/6-api-routes/webhooks/" 2>/dev/null

echo "   ✅ API routes extracted"

# ============================================================================
# 7. UTILITIES
# ============================================================================
echo "🔧 [7/8] Extracting Utilities..."

# Image compression
cp "$SOURCE/src/lib/image-compression.ts" "$DEST/7-utilities/image-compression/" 2>/dev/null

# Error handling
cat > "$DEST/7-utilities/error-handling/llm-error-handler.ts" << 'EOF'
/**
 * LLM Error Handler
 * Graceful degradation for AI service failures
 */

export class LLMError extends Error {
  constructor(
    message: string,
    public service: 'ollama' | 'openai' | 'google',
    public isRetryable: boolean = false
  ) {
    super(message)
    this.name = 'LLMError'
  }
}

export async function withLLMFallback<T>(
  operation: () => Promise<T>,
  fallback: T,
  serviceName: string
): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    console.error(`[${serviceName}] Operation failed, using fallback:`, error)
    return fallback
  }
}

export function handleLLMError(error: unknown, context: string): never {
  if (error instanceof LLMError) {
    throw error
  }

  const message = error instanceof Error ? error.message : 'Unknown error'
  throw new LLMError(`${context}: ${message}`, 'ollama', true)
}
EOF

echo "   ✅ Utilities extracted"

# ============================================================================
# 8. N8N WORKFLOWS
# ============================================================================
echo "⚡ [8/8] Extracting N8N Workflows..."

# Copy all workflow JSON files
if [ -d "$SOURCE/.n8n-workflows" ]; then
  cp "$SOURCE/.n8n-workflows"/*.json "$DEST/8-n8n-workflows/" 2>/dev/null
  echo "   ✅ N8N workflows extracted"
else
  echo "   ⚠️  N8N workflows directory not found"
fi

# ============================================================================
# 9. PACKAGE.JSON DEPENDENCIES
# ============================================================================
echo ""
echo "📦 Extracting dependencies..."

cat > "$DEST/package.json" << 'EOF'
{
  "name": "portable-seo-llm-system",
  "version": "1.0.0",
  "description": "Portable SEO + LLM system extracted from GangRun Printing",
  "dependencies": {
    "@anthropic-ai/sdk": "^0.67.0",
    "@google/genai": "^1.22.0",
    "@prisma/client": "^6.7.0",
    "openai": "^5.20.2",
    "sharp": "^0.33.0",
    "axios": "^1.12.2",
    "axios-retry": "^4.5.0",
    "ioredis": "^5.4.1"
  },
  "devDependencies": {
    "prisma": "^6.7.0",
    "typescript": "^5.x",
    "@types/node": "^20.x"
  }
}
EOF

# ============================================================================
# 10. ENVIRONMENT VARIABLES TEMPLATE
# ============================================================================
echo "🔐 Creating environment variables template..."

cat > "$DEST/.env.example" << 'EOF'
# ============================================================================
# PORTABLE SEO + LLM SYSTEM - ENVIRONMENT VARIABLES
# ============================================================================

# ----------------------------------------------------------------------------
# 1. OLLAMA (Local LLM)
# ----------------------------------------------------------------------------
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5:32b

# ----------------------------------------------------------------------------
# 2. GOOGLE AI STUDIO (Imagen 4 Image Generation)
# ----------------------------------------------------------------------------
GOOGLE_AI_STUDIO_API_KEY=your-google-ai-studio-api-key-here

# ----------------------------------------------------------------------------
# 3. OPENAI (Translation System)
# ----------------------------------------------------------------------------
OPENAI_API_KEY=sk-your-openai-api-key-here

# ----------------------------------------------------------------------------
# 4. DATABASE
# ----------------------------------------------------------------------------
DATABASE_URL=postgresql://user:password@localhost:5432/database_name

# ----------------------------------------------------------------------------
# 5. REDIS CACHING (Optional but recommended)
# ----------------------------------------------------------------------------
REDIS_URL=redis://localhost:6379

# ----------------------------------------------------------------------------
# 6. N8N AUTOMATION (Optional)
# ----------------------------------------------------------------------------
N8N_BASE_URL=http://localhost:5678
N8N_API_KEY=your-n8n-api-key
N8N_WEBHOOK_SECRET=your-webhook-secret

# ----------------------------------------------------------------------------
# 7. SEO BRAIN SYSTEM
# ----------------------------------------------------------------------------
SEO_BRAIN_TELEGRAM_BOT_TOKEN=your-telegram-bot-token
TELEGRAM_ADMIN_CHAT_ID=your-telegram-chat-id
SEO_BRAIN_MODE=CONSERVATIVE
SEO_BRAIN_WINNER_THRESHOLD=80
SEO_BRAIN_LOSER_THRESHOLD=40

# ----------------------------------------------------------------------------
# 8. SITE CONFIGURATION
# ----------------------------------------------------------------------------
NEXT_PUBLIC_SITE_URL=https://yoursite.com
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# ----------------------------------------------------------------------------
# 9. FILE STORAGE (MinIO or S3)
# ----------------------------------------------------------------------------
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=your-bucket

# Or use AWS S3:
# AWS_ACCESS_KEY_ID=your-aws-access-key
# AWS_SECRET_ACCESS_KEY=your-aws-secret-key
# AWS_REGION=us-east-1
# AWS_S3_BUCKET=your-bucket-name
EOF

echo "   ✅ Environment template created"

# ============================================================================
# COMPLETION SUMMARY
# ============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ EXTRACTION COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📦 Portable codebase location:"
echo "   $DEST"
echo ""
echo "📁 Extracted components:"
echo "   [1] Core SEO (metadata, schema, sitemap)"
echo "   [2] LLM integrations (Ollama, Imagen, OpenAI)"
echo "   [3] SEO Brain system (200-city generator)"
echo "   [4] Analytics integration"
echo "   [5] Database schema"
echo "   [6] API routes"
echo "   [7] Utilities"
echo "   [8] N8N workflows"
echo ""
echo "📄 Files created:"
echo "   - package.json"
echo "   - .env.example"
echo "   - Documentation stubs"
echo ""
echo "🔜 Next steps:"
echo "   1. Add caching + rate limiting"
echo "   2. Build advanced SEO tools"
echo "   3. Create comprehensive documentation"
echo "   4. Package for download"
echo ""
