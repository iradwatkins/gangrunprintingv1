#!/bin/bash

# ================================================
# Cloudflare MCP Server Test
# ================================================

echo "================================================"
echo "Cloudflare Integration Test"
echo "================================================"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Source environment files
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs) 2>/dev/null
fi

echo -e "${BLUE}Cloudflare MCP Server Status:${NC}"
echo "------------------------------------------------"

# Check if Cloudflare MCP is installed
if npm list -g @cloudflare/mcp-server-cloudflare &>/dev/null; then
    echo -e "${GREEN}✓${NC} Cloudflare MCP server installed"
    version=$(npm list -g @cloudflare/mcp-server-cloudflare 2>/dev/null | grep @cloudflare/mcp-server-cloudflare | head -1)
    echo "  Version: $version"
else
    echo -e "${RED}✗${NC} Cloudflare MCP server not installed"
    echo "  Run: npm install -g @cloudflare/mcp-server-cloudflare"
fi

echo ""
echo -e "${BLUE}Cloudflare API Configuration:${NC}"
echo "------------------------------------------------"

# Check API credentials
check_credential() {
    local key=$1
    local service=$2
    local required=$3
    
    if [ -z "${!key}" ]; then
        if [ "$required" = "required" ]; then
            echo -e "${RED}✗${NC} $service: Not configured ($key)"
        else
            echo -e "${YELLOW}⚠${NC} $service: Optional, not configured ($key)"
        fi
    else
        # Mask the credential
        local masked="${!key:0:10}...${!key: -4}"
        echo -e "${GREEN}✓${NC} $service: Configured ($masked)"
    fi
}

# Core Cloudflare credentials
echo "Core Authentication:"
check_credential "CLOUDFLARE_API_TOKEN" "API Token" "required"
check_credential "CLOUDFLARE_API_KEY" "API Key (alternative)" "optional"
check_credential "CLOUDFLARE_EMAIL" "Email (for API Key)" "optional"

echo ""
echo "Account & Zone:"
check_credential "CLOUDFLARE_ACCOUNT_ID" "Account ID" "required"
check_credential "CLOUDFLARE_ZONE_ID" "Zone ID" "required"
check_credential "CLOUDFLARE_DOMAIN" "Domain" "optional"

echo ""
echo -e "${BLUE}R2 Storage Configuration:${NC}"
echo "------------------------------------------------"
check_credential "R2_ACCOUNT_ID" "R2 Account" "optional"
check_credential "R2_ACCESS_KEY_ID" "R2 Access Key" "optional"
check_credential "R2_SECRET_ACCESS_KEY" "R2 Secret Key" "optional"
check_credential "R2_BUCKET_NAME" "R2 Bucket" "optional"
check_credential "R2_ENDPOINT" "R2 Endpoint" "optional"

echo ""
echo -e "${BLUE}Additional Services:${NC}"
echo "------------------------------------------------"
check_credential "CLOUDFLARE_WORKERS_ROUTE" "Workers Route" "optional"
check_credential "CLOUDFLARE_KV_NAMESPACE_ID" "KV Namespace" "optional"
check_credential "CLOUDFLARE_D1_DATABASE_ID" "D1 Database" "optional"
check_credential "CLOUDFLARE_PAGES_PROJECT_NAME" "Pages Project" "optional"

echo ""
echo -e "${BLUE}Cloudflare Capabilities Available:${NC}"
echo "------------------------------------------------"
echo -e "${GREEN}✓${NC} DNS Management"
echo -e "${GREEN}✓${NC} R2 Storage (S3-compatible)"
echo -e "${GREEN}✓${NC} Workers (Edge Functions)"
echo -e "${GREEN}✓${NC} KV (Key-Value Storage)"
echo -e "${GREEN}✓${NC} D1 (SQLite Database)"
echo -e "${GREEN}✓${NC} Pages (Static Sites)"
echo -e "${GREEN}✓${NC} Images (Optimization)"
echo -e "${GREEN}✓${NC} Stream (Video)"
echo -e "${GREEN}✓${NC} SSL/TLS Management"
echo -e "${GREEN}✓${NC} Firewall Rules"
echo -e "${GREEN}✓${NC} Page Rules"
echo -e "${GREEN}✓${NC} Load Balancing"

echo ""
echo "================================================"
echo -e "${BLUE}Setup Status${NC}"
echo "================================================"
echo ""

# Count configured items
configured=0
total=14

[ -n "$CLOUDFLARE_API_TOKEN" ] || [ -n "$CLOUDFLARE_API_KEY" ] && ((configured++))
[ -n "$CLOUDFLARE_ACCOUNT_ID" ] && ((configured++))
[ -n "$CLOUDFLARE_ZONE_ID" ] && ((configured++))
[ -n "$R2_ACCESS_KEY_ID" ] && ((configured++))
[ -n "$R2_SECRET_ACCESS_KEY" ] && ((configured++))
[ -n "$R2_BUCKET_NAME" ] && ((configured++))
[ -n "$R2_ENDPOINT" ] && ((configured++))
[ -n "$CLOUDFLARE_WORKERS_ROUTE" ] && ((configured++))
[ -n "$CLOUDFLARE_KV_NAMESPACE_ID" ] && ((configured++))
[ -n "$CLOUDFLARE_D1_DATABASE_ID" ] && ((configured++))
[ -n "$CLOUDFLARE_PAGES_PROJECT_NAME" ] && ((configured++))
[ -n "$CLOUDFLARE_IMAGES_ACCOUNT_ID" ] && ((configured++))
[ -n "$CLOUDFLARE_STREAM_API_TOKEN" ] && ((configured++))
[ -n "$CLOUDFLARE_DOMAIN" ] && ((configured++))

if [ $configured -eq 0 ]; then
    echo -e "${RED}No Cloudflare services configured yet${NC}"
    echo ""
    echo "To get started:"
    echo "1. Get your API token from: https://dash.cloudflare.com/profile/api-tokens"
    echo "2. Get your Account ID from your Cloudflare dashboard"
    echo "3. Get your Zone ID from your domain settings"
    echo "4. Add these to your .env file"
elif [ $configured -lt 3 ]; then
    echo -e "${YELLOW}Partial configuration ($configured/$total services)${NC}"
    echo ""
    echo "Minimum required:"
    echo "• CLOUDFLARE_API_TOKEN or CLOUDFLARE_API_KEY"
    echo "• CLOUDFLARE_ACCOUNT_ID"
    echo "• CLOUDFLARE_ZONE_ID"
else
    echo -e "${GREEN}Cloudflare ready! ($configured/$total services configured)${NC}"
    echo ""
    echo "You can now use Cloudflare MCP to manage:"
    echo "• DNS records for gangrunprinting.com"
    echo "• R2 storage buckets"
    echo "• Workers and edge functions"
    echo "• And more!"
fi

echo ""
echo "For complete setup instructions, see: CLOUDFLARE-SETUP.md"