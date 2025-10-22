#!/bin/bash
cd /root/websites/gangrunprinting/n8n-workflows/workflows

# List of duplicate workflow files to delete (random IDs)
DUPLICATES=(
    "6i2QbrDx9n4G37GT.json"
    "tnhQscRnoKvn5Urh.json"
    "5sfIci32NfKd5jmr.json"
    "Ol5KypbWIdPYibha.json"
    "Ja6CXnSXTRkpsREr.json"
    "VcH7XwlmUZ1btfVr.json"
    "AL8RNNst0LyZPgVH.json"
    "APjLUAwjaY7aN1F6.json"
    "AIDT8GwdBAGd19Ts.json"
    "EdWbtkJRoi5ESoGg.json"
    "FRtcriojfUNBXYGz.json"
    "aHVjUwU5JdYeJ1kI.json"
    "9WEN8CXGaYs76vMS.json"
    "ka86L9LlL5tIHf4W.json"
    "0SVCkZg03r6RR4qW.json"
    "Z0jmFM8cjCfsXttF.json"
)

echo "=== DELETING 16 DUPLICATE WORKFLOWS ==="
echo ""

for file in "${DUPLICATES[@]}"; do
    workflow_id=$(jq -r '.id' "$file" 2>/dev/null)
    workflow_name=$(jq -r '.name' "$file" 2>/dev/null)

    if [ -n "$workflow_id" ] && [ "$workflow_id" != "null" ]; then
        echo "Deleting: $workflow_name (ID: $workflow_id)"
        # Note: n8n doesn't have a delete command via CLI, must use API or UI
        # We'll note the IDs for manual deletion
        echo "  File: $file"
        echo "  ID: $workflow_id"
        echo ""
    fi
done

echo "=== SUMMARY ==="
echo "Total duplicates found: ${#DUPLICATES[@]}"
echo ""
echo "To delete these from n8n, you must:"
echo "1. Log into n8n UI at http://n8n.agistaffers.com:5678"
echo "2. Delete workflows with the IDs listed above"
echo ""
echo "OR use the n8n API to delete programmatically."
