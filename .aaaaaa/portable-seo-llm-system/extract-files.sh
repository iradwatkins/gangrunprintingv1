#!/bin/bash

# Portable SEO + LLM System - File Extraction Script
# This script copies all necessary files from gangrunprinting to the portable system

SOURCE="/root/websites/gangrunprinting"
DEST="/root/portable-seo-llm-system"

echo "🚀 Starting extraction from GangRun Printing codebase..."

# 1. Core SEO Components
echo "📊 Extracting Core SEO components..."
cp "$SOURCE/src/lib/metadata.ts" "$DEST/1-core-seo/metadata/" 2>/dev/null || echo "  - metadata.ts not found (will check other locations)"
cp -r "$SOURCE/src/app" "$DEST/1-core-seo/metadata/app-metadata-examples" 2>/dev/null || true

# 2. LLM Integrations
echo "🤖 Extracting LLM integrations..."
cp "$SOURCE/src/lib/seo-brain/ollama-client.ts" "$DEST/2-llm-integrations/ollama/"
cp "$SOURCE/src/lib/image-generation/google-ai-client.ts" "$DEST/2-llm-integrations/google-imagen/"
cp "$SOURCE/src/lib/i18n/auto-translate.ts" "$DEST/2-llm-integrations/openai/"
cp "$SOURCE/src/lib/image-compression.ts" "$DEST/2-llm-integrations/shared/"

# 3. SEO Brain System
echo "🧠 Extracting SEO Brain system..."
cp "$SOURCE/src/lib/seo-brain/city-page-generator.ts" "$DEST/3-seo-brain/campaign-generator/"
cp "$SOURCE/src/lib/seo-brain/city-content-prompts.ts" "$DEST/3-seo-brain/campaign-generator/"
cp "$SOURCE/src/lib/seo-brain/performance-analyzer.ts" "$DEST/3-seo-brain/performance-analyzer/" 2>/dev/null || true
cp "$SOURCE/src/lib/seo-brain/winner-analyzer.ts" "$DEST/3-seo-brain/winner-analyzer/" 2>/dev/null || true
cp "$SOURCE/src/lib/seo-brain/loser-improver.ts" "$DEST/3-seo-brain/loser-improver/" 2>/dev/null || true
cp "$SOURCE/src/lib/seo-brain/telegram-notifier.ts" "$DEST/3-seo-brain/telegram-notifier/" 2>/dev/null || true

# 4. API Routes
echo "🌐 Extracting API routes..."
cp -r "$SOURCE/src/app/api/chat" "$DEST/6-api-routes/" 2>/dev/null || true
cp -r "$SOURCE/src/app/api/seo-brain" "$DEST/6-api-routes/" 2>/dev/null || true
cp -r "$SOURCE/src/app/api/products/generate-image" "$DEST/6-api-routes/image-generation/" 2>/dev/null || true

# 5. N8N Workflows
echo "⚡ Extracting N8N workflows..."
cp -r "$SOURCE/.n8n-workflows"/*.json "$DEST/8-n8n-workflows/" 2>/dev/null || true

# 6. Database Schema
echo "💾 Extracting database schema..."
cp "$SOURCE/prisma/schema.prisma" "$DEST/5-database-schema/prisma-models/" 2>/dev/null || true

echo "✅ Extraction complete!"
echo "📦 Files copied to: $DEST"
