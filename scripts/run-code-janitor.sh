#!/bin/bash

# Code Janitor Execution Script
# Run this script to perform comprehensive code quality checks and fixes

echo "🧹 Gang Run Printing - Code Janitor v1.0"
echo "========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running from project root
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: Must be run from project root${NC}"
    exit 1
fi

echo "📊 Starting Code Quality Analysis..."
echo ""

# Step 1: Check for console.log statements
echo "1️⃣  Checking for console.log statements..."
CONSOLE_COUNT=$(grep -r "console\.\(log\|debug\)" --include="*.ts" --include="*.tsx" --exclude-dir=node_modules --exclude-dir=.next --exclude="*.test.*" --exclude="*.spec.*" src/ 2>/dev/null | wc -l)

if [ $CONSOLE_COUNT -gt 0 ]; then
    echo -e "${YELLOW}   ⚠️  Found $CONSOLE_COUNT console statements${NC}"
else
    echo -e "${GREEN}   ✅ No console statements found${NC}"
fi

# Step 2: Check for TypeScript any types
echo "2️⃣  Checking for 'any' types..."
ANY_COUNT=$(grep -r ": any" --include="*.ts" --include="*.tsx" --exclude-dir=node_modules --exclude-dir=.next src/ 2>/dev/null | wc -l)

if [ $ANY_COUNT -gt 0 ]; then
    echo -e "${YELLOW}   ⚠️  Found $ANY_COUNT 'any' type declarations${NC}"
else
    echo -e "${GREEN}   ✅ No 'any' types found${NC}"
fi

# Step 3: Check for large files
echo "3️⃣  Checking for oversized files (>300 lines)..."
LARGE_FILES=$(find src -name "*.tsx" -o -name "*.ts" | xargs wc -l 2>/dev/null | awk '$1 > 300 {print $2}' | wc -l)

if [ $LARGE_FILES -gt 0 ]; then
    echo -e "${YELLOW}   ⚠️  Found $LARGE_FILES oversized files${NC}"
else
    echo -e "${GREEN}   ✅ All files are properly sized${NC}"
fi

# Step 4: Check for TODO/FIXME comments
echo "4️⃣  Checking for TODO/FIXME comments..."
TODO_COUNT=$(grep -r "TODO\|FIXME\|HACK\|XXX" --include="*.ts" --include="*.tsx" --exclude-dir=node_modules --exclude-dir=.next src/ 2>/dev/null | wc -l)

if [ $TODO_COUNT -gt 0 ]; then
    echo -e "${YELLOW}   ⚠️  Found $TODO_COUNT TODO/FIXME comments${NC}"
else
    echo -e "${GREEN}   ✅ No TODO comments found${NC}"
fi

# Step 5: Check for duplicate imports
echo "5️⃣  Checking for duplicate imports..."
DUPLICATE_IMPORTS=$(find src -name "*.tsx" -o -name "*.ts" | xargs grep "^import" 2>/dev/null | sort | uniq -d | wc -l)

if [ $DUPLICATE_IMPORTS -gt 0 ]; then
    echo -e "${YELLOW}   ⚠️  Found potential duplicate imports${NC}"
else
    echo -e "${GREEN}   ✅ No duplicate imports found${NC}"
fi

echo ""
echo "🔧 Applying Auto-Fixes..."
echo ""

# Ask for confirmation
read -p "Do you want to run auto-fixes? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Step 6: Run auto-fix script if it exists
    if [ -f "scripts/code-janitor-autofix.ts" ]; then
        echo "Running TypeScript auto-fix script..."
        npx tsx scripts/code-janitor-autofix.ts
    fi

    # Step 7: Format with Prettier if available
    if [ -f ".prettierrc.json" ]; then
        echo "Formatting code with Prettier..."
        npx prettier --write "src/**/*.{ts,tsx}" --log-level error 2>/dev/null
        echo -e "${GREEN}✅ Code formatted${NC}"
    fi

    # Step 8: Fix ESLint issues if possible
    if [ -f ".eslintrc.strict.json" ]; then
        echo "Fixing ESLint issues..."
        npx eslint --fix "src/**/*.{ts,tsx}" --config .eslintrc.strict.json 2>/dev/null || true
        echo -e "${GREEN}✅ ESLint fixes applied${NC}"
    fi
fi

echo ""
echo "📈 Code Quality Score Calculation..."
echo ""

# Calculate score
SCORE=100
DEDUCTIONS=""

if [ $CONSOLE_COUNT -gt 0 ]; then
    SCORE=$((SCORE - 10))
    DEDUCTIONS="$DEDUCTIONS\n  -10: Console statements found"
fi

if [ $ANY_COUNT -gt 0 ]; then
    SCORE=$((SCORE - 15))
    DEDUCTIONS="$DEDUCTIONS\n  -15: TypeScript 'any' types found"
fi

if [ $LARGE_FILES -gt 0 ]; then
    SCORE=$((SCORE - 10))
    DEDUCTIONS="$DEDUCTIONS\n  -10: Oversized files found"
fi

if [ $TODO_COUNT -gt 0 ]; then
    SCORE=$((SCORE - 5))
    DEDUCTIONS="$DEDUCTIONS\n  -5: TODO comments found"
fi

# Display score with color
if [ $SCORE -ge 90 ]; then
    echo -e "${GREEN}🏆 Code Quality Score: $SCORE/100 (A)${NC}"
elif [ $SCORE -ge 80 ]; then
    echo -e "${GREEN}✅ Code Quality Score: $SCORE/100 (B)${NC}"
elif [ $SCORE -ge 70 ]; then
    echo -e "${YELLOW}⚠️  Code Quality Score: $SCORE/100 (C)${NC}"
else
    echo -e "${RED}❌ Code Quality Score: $SCORE/100 (D)${NC}"
fi

if [ ! -z "$DEDUCTIONS" ]; then
    echo -e "\nScore Deductions:$DEDUCTIONS"
fi

echo ""
echo "📝 Recommendations:"
echo ""

if [ $CONSOLE_COUNT -gt 0 ]; then
    echo "• Remove console.log statements: grep -r 'console\.log' src/"
fi

if [ $ANY_COUNT -gt 0 ]; then
    echo "• Replace 'any' types with proper TypeScript types"
fi

if [ $LARGE_FILES -gt 0 ]; then
    echo "• Refactor large files into smaller components"
fi

if [ $TODO_COUNT -gt 0 ]; then
    echo "• Address TODO/FIXME comments or create issues for them"
fi

echo ""
echo "📊 Report saved to: docs/CODE_JANITOR_REPORT.md"
echo "✨ Code Janitor Complete!"
echo ""

# Generate timestamp
echo "Last run: $(date)" > .code-janitor-last-run

exit 0