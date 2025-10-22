#!/bin/bash
cd /root/websites/gangrunprinting/n8n-workflows/workflows
for f in *.json; do
    name=$(jq -r '.name // "NO NAME"' "$f" 2>/dev/null)
    echo "$f: $name"
done | grep -i "gangrun\|order" | sort -t: -k2
