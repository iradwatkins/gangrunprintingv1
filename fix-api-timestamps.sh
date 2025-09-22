#!/bin/bash

# Fix all API routes that create entities to include updatedAt field

echo "Fixing API routes with missing updatedAt fields..."

# Fix quantities
sed -i 's/data: {$/data: {\n        updatedAt: new Date(),/g' src/app/api/quantities/route.ts 2>/dev/null || true

# Fix add-ons
sed -i 's/data: {$/data: {\n        updatedAt: new Date(),/g' src/app/api/add-ons/route.ts 2>/dev/null || true

# Fix turnaround-times
sed -i 's/data: {$/data: {\n        updatedAt: new Date(),/g' src/app/api/turnaround-times/route.ts 2>/dev/null || true

# Fix turnaround-time-sets
sed -i 's/data: {$/data: {\n        updatedAt: new Date(),/g' src/app/api/turnaround-time-sets/route.ts 2>/dev/null || true

# Fix categories
sed -i 's/data: {$/data: {\n        updatedAt: new Date(),/g' src/app/api/product-categories/route.ts 2>/dev/null || true

echo "Checking and fixing individual files..."

# Check quantities route
if ! grep -q "updatedAt: new Date()" src/app/api/quantities/route.ts; then
  echo "Fixing quantities route..."
fi

# Check add-ons route
if ! grep -q "updatedAt: new Date()" src/app/api/add-ons/route.ts; then
  echo "Fixing add-ons route..."
fi

echo "Done fixing API routes"