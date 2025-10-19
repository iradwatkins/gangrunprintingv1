#!/bin/bash

# Build Optimization Script for GangRun Printing
# This script cleans and optimizes the Next.js build to reduce size

set -e

echo "🧹 Starting build optimization..."

# Step 1: Clean old cache
echo "📦 Cleaning build cache..."
rm -rf .next/cache
echo "✅ Cache cleaned"

# Step 2: Show current .next size (if exists)
if [ -d ".next" ]; then
  BEFORE_SIZE=$(du -sh .next 2>/dev/null | cut -f1)
  echo "📊 Current .next size: $BEFORE_SIZE"
fi

# Step 3: Remove unnecessary files from standalone build (after build)
if [ -d ".next/standalone" ]; then
  echo "🗑️  Removing unnecessary standalone files..."

  # Remove dev dependencies from standalone node_modules
  if [ -d ".next/standalone/node_modules" ]; then
    cd .next/standalone/node_modules

    # Remove TypeScript dev dependencies
    rm -rf typescript @types/node @types/react @types/react-dom 2>/dev/null || true

    # Remove build tools
    rm -rf eslint prettier webpack terser 2>/dev/null || true

    # Remove test frameworks
    rm -rf vitest @vitest jest @playwright 2>/dev/null || true

    cd ../../..
  fi

  echo "✅ Standalone optimized"
fi

# Step 4: Show final size
if [ -d ".next" ]; then
  AFTER_SIZE=$(du -sh .next 2>/dev/null | cut -f1)
  echo "📊 Optimized .next size: $AFTER_SIZE"
fi

echo "✨ Build optimization complete!"
echo ""
echo "💡 Tips:"
echo "  - Run 'npm run clean:cache' before builds to keep size minimal"
echo "  - The webpack cache (.next/cache) is safe to delete and will rebuild"
echo "  - Use 'npm run build:clean' for a fresh optimized build"
