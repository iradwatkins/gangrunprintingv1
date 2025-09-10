#!/bin/bash

# Fix all remaining NextAuth references to use Clerk

echo "Fixing all auth imports in API routes..."

# Find all files with auth imports and replace them
find src/app/api -type f \( -name "*.ts" -o -name "*.tsx" \) -exec grep -l "@/auth\|getServerSession\|authOptions" {} \; | while read file; do
  echo "Fixing: $file"
  
  # Replace auth imports
  sed -i '' 's|import { auth } from "@/auth"|import { auth } from "@clerk/nextjs/server"|g' "$file"
  sed -i '' "s|import { auth } from '@/auth'|import { auth } from '@clerk/nextjs/server'|g" "$file"
  
  # Replace getServerSession imports
  sed -i '' 's|import { getServerSession } from "next-auth"|import { auth } from "@clerk/nextjs/server"|g' "$file"
  sed -i '' "s|import { getServerSession } from 'next-auth'|import { auth } from '@clerk/nextjs/server'|g" "$file"
  
  # Replace authOptions imports
  sed -i '' 's|import { authOptions } from "@/auth"|// Removed authOptions - using Clerk|g' "$file"
  sed -i '' "s|import { authOptions } from '@/auth'|// Removed authOptions - using Clerk|g" "$file"
  
  # Replace getServerSession calls
  sed -i '' 's|const session = await getServerSession(authOptions)|const { userId } = await auth()|g' "$file"
  sed -i '' 's|const session = await getServerSession()|const { userId } = await auth()|g' "$file"
  
  # Replace session checks
  sed -i '' 's|if (!session?.user)|if (!userId)|g' "$file"
  sed -i '' 's|session?.user?.id|userId|g' "$file"
  sed -i '' 's|session?.user?.email|userId|g' "$file"
  sed -i '' 's|session.user.id|userId|g' "$file"
  sed -i '' 's|session.user.email|userId|g' "$file"
  sed -i '' 's|session.user|{ id: userId }|g' "$file"
done

echo "All files fixed!"