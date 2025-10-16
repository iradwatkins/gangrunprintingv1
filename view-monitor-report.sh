#!/bin/bash

# Stop monitoring and generate report

echo "🛑 Stopping monitor..."
pkill -SIGINT -f "monitor-product-detailed.js"

sleep 2

echo ""
echo "📊 Generating report..."
echo ""

# Find the latest log file
LATEST_LOG=$(ls -t product-activity-detailed-*.log 2>/dev/null | head -1)
LATEST_ANALYSIS=$(ls -t product-activity-analysis-*.json 2>/dev/null | head -1)

if [ -z "$LATEST_LOG" ]; then
    echo "❌ No log files found!"
    exit 1
fi

echo "=========================================="
echo "📝 Latest Log File: $LATEST_LOG"
echo "📊 Analysis File: $LATEST_ANALYSIS"
echo "=========================================="
echo ""

# Show summary from log
echo "📋 LOG SUMMARY:"
echo "----------------------------------------"
grep -E "\[REPORT\]" "$LATEST_LOG" 2>/dev/null || echo "Report not yet generated"
echo ""

# Show last 20 events
echo "📜 LAST 20 EVENTS:"
echo "----------------------------------------"
tail -20 "$LATEST_LOG"
echo ""

# Count events by type
echo "📈 EVENT STATISTICS:"
echo "----------------------------------------"
echo "Total Events: $(wc -l < "$LATEST_LOG")"
echo "API Calls: $(grep -c "api_" "$LATEST_LOG" 2>/dev/null || echo 0)"
echo "Errors: $(grep -c "\[error\]" "$LATEST_LOG" 2>/dev/null || echo 0)"
echo "Image Uploads: $(grep -c "image_upload" "$LATEST_LOG" 2>/dev/null || echo 0)"
echo "Auth Events: $(grep -c "auth_event" "$LATEST_LOG" 2>/dev/null || echo 0)"
echo ""

# Show errors if any
ERROR_COUNT=$(grep -c "❌" "$LATEST_LOG" 2>/dev/null || echo 0)
if [ "$ERROR_COUNT" -gt 0 ]; then
    echo "❌ ERRORS FOUND ($ERROR_COUNT):"
    echo "----------------------------------------"
    grep "❌" "$LATEST_LOG" | head -10
    echo ""
fi

# Show analysis file if exists
if [ -f "$LATEST_ANALYSIS" ]; then
    echo "📊 DETAILED ANALYSIS:"
    echo "----------------------------------------"
    cat "$LATEST_ANALYSIS" | head -100
    echo ""
    echo "Full analysis in: $LATEST_ANALYSIS"
fi

echo ""
echo "=========================================="
echo "✅ Report complete!"
echo "=========================================="
echo ""
echo "View full logs: cat $LATEST_LOG"
echo "View analysis: cat $LATEST_ANALYSIS"
