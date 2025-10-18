#!/bin/bash
# GangRun Printing - Project Organization Script
# Phase 2 of Code Cleanup (October 18, 2025)
# Run this to clean up the project structure

set -e

echo "🧹 Starting project organization (Phase 2)..."
echo ""

# Create directory structure
echo "📁 Creating directory structure..."
mkdir -p scripts/{test,debug,create,maintenance}
mkdir -p docs/{fixes,diagnostics,deployment,testing}
mkdir -p test-outputs/all
mkdir -p .archived

echo "✅ Directories created"
echo ""

# Move test scripts
echo "🧪 Moving test scripts..."
mv test-*.js scripts/test/ 2>/dev/null || true
mv test-*.ts scripts/test/ 2>/dev/null || true
echo "  → Moved test-*.{js,ts} to scripts/test/"

# Move debug scripts
echo "🐛 Moving debug scripts..."
mv debug-*.js scripts/debug/ 2>/dev/null || true
mv diagnose-*.ts scripts/debug/ 2>/dev/null || true
mv diagnose-*.js scripts/debug/ 2>/dev/null || true
echo "  → Moved debug/diagnose scripts to scripts/debug/"

# Move create scripts
echo "📝 Moving create scripts..."
mv create-*.js scripts/create/ 2>/dev/null || true
echo "  → Moved create-*.js to scripts/create/"

# Move maintenance scripts
echo "🔧 Moving maintenance scripts..."
mv check-*.js scripts/maintenance/ 2>/dev/null || true
mv check-*.ts scripts/maintenance/ 2>/dev/null || true
mv investigate-*.js scripts/maintenance/ 2>/dev/null || true
mv investigate-*.ts scripts/maintenance/ 2>/dev/null || true
mv fix-*.ts scripts/maintenance/ 2>/dev/null || true
mv cleanup-*.ts scripts/maintenance/ 2>/dev/null || true
mv generate-*.js scripts/maintenance/ 2>/dev/null || true
echo "  → Moved maintenance scripts to scripts/maintenance/"

echo ""
echo "📚 Organizing documentation..."

# Move fix documentation
mv *-FIX-*.md docs/fixes/ 2>/dev/null || true
mv *-fix-*.md docs/fixes/ 2>/dev/null || true
echo "  → Moved fix docs to docs/fixes/"

# Move diagnostic reports
mv *-DIAGNOSTIC-*.md docs/diagnostics/ 2>/dev/null || true
mv *-REPORT-*.md docs/diagnostics/ 2>/dev/null || true
mv *-CARGO-*.md docs/diagnostics/ 2>/dev/null || true
echo "  → Moved diagnostic docs to docs/diagnostics/"

# Move deployment documentation
mv *-DEPLOYMENT-*.md docs/deployment/ 2>/dev/null || true
mv PRODUCTION-*.md docs/deployment/ 2>/dev/null || true
echo "  → Moved deployment docs to docs/deployment/"

# Move testing documentation
mv *-TESTING-*.md docs/testing/ 2>/dev/null || true
mv *-STATUS-*.md docs/testing/ 2>/dev/null || true
mv PAYMENT-*.md docs/testing/ 2>/dev/null || true
mv CASH-APP-*.md docs/testing/ 2>/dev/null || true
echo "  → Moved testing docs to docs/testing/"

echo ""
echo "🗄️  Archiving unused directories..."

# Archive old directories
mv .aaaaaa .archived/ 2>/dev/null || true
echo "  → Archived .aaaaaa/"
mv serena .archived/ 2>/dev/null || true
echo "  → Archived serena/"
mv .archived-tests .archived/ 2>/dev/null || true
echo "  → Archived .archived-tests/"

echo ""
echo "📸 Consolidating test outputs..."

# Consolidate test outputs
mv test-screenshots* test-outputs/ 2>/dev/null || true
mv qa-test-screenshots test-outputs/ 2>/dev/null || true
mv screenshots test-outputs/ 2>/dev/null || true
mv playwright-report test-outputs/ 2>/dev/null || true
echo "  → Moved all test screenshots to test-outputs/"

echo ""
echo "✅ Project organization complete!"
echo ""
echo "📊 Summary:"
echo "  - Scripts organized into /scripts/"
echo "  - Documentation organized into /docs/"
echo "  - Old files archived to .archived/"
echo "  - Test outputs consolidated to test-outputs/"
echo ""
echo "⚠️  Next steps:"
echo "  1. Review moved files to ensure nothing broke"
echo "  2. Update any hardcoded paths in scripts"
echo "  3. Update package.json scripts if needed"
echo "  4. Run 'npm test' to verify everything works"
echo "  5. Test production build: 'npm run build'"
echo "  6. Commit changes: git add . && git commit -m 'Phase 2: Organize project structure'"
echo ""
echo "🎉 Phase 2 complete! Check CODE-CLEANUP-AUDIT-REPORT.md for Phase 3."
