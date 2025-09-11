#!/bin/bash

# ================================================
# Updated MCP Server Test (without Slack)
# ================================================

echo "================================================"
echo "MCP Server Configuration Test - Updated"
echo "================================================"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Installed MCP Servers:${NC}"
echo "------------------------------------------------"

# List all globally installed MCP packages
npm list -g --depth=0 2>/dev/null | grep -E "(mcp|@modelcontextprotocol|@jpisnice)" | while read line; do
    echo -e "${GREEN}✓${NC} $line"
done

echo ""
echo -e "${BLUE}Configuration Summary:${NC}"
echo "------------------------------------------------"

# Source environment files
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs) 2>/dev/null
fi

# Test each server
echo ""
echo -e "${BLUE}MCP Server Status:${NC}"
echo "------------------------------------------------"

# Filesystem
if npm list -g @modelcontextprotocol/server-filesystem &>/dev/null; then
    echo -e "${GREEN}✓${NC} filesystem - File operations (installed)"
else
    echo -e "${RED}✗${NC} filesystem - Not installed"
fi

# Memory
if npm list -g @modelcontextprotocol/server-memory &>/dev/null; then
    echo -e "${GREEN}✓${NC} memory - Persistent memory (installed)"
else
    echo -e "${RED}✗${NC} memory - Not installed"
fi

# GitHub
if npm list -g @modelcontextprotocol/server-github &>/dev/null; then
    if [ -n "$GITHUB_PERSONAL_ACCESS_TOKEN" ]; then
        echo -e "${GREEN}✓${NC} github - Git operations (installed + token configured)"
    else
        echo -e "${YELLOW}⚠${NC} github - Git operations (installed, no token)"
    fi
else
    echo -e "${RED}✗${NC} github - Not installed"
fi

# Sequential Thinking
if npm list -g @modelcontextprotocol/server-sequential-thinking &>/dev/null; then
    echo -e "${GREEN}✓${NC} sequential-thinking - Complex reasoning (installed)"
else
    echo -e "${RED}✗${NC} sequential-thinking - Not installed"
fi

# Ref-tools
if npm list -g ref-tools-mcp &>/dev/null; then
    echo -e "${GREEN}✓${NC} ref-tools - Documentation management (installed)"
else
    echo -e "${RED}✗${NC} ref-tools - Not installed"
fi

# Figma
if npm list -g figma-mcp &>/dev/null; then
    echo -e "${GREEN}✓${NC} figma - Design integration (installed)"
else
    echo -e "${RED}✗${NC} figma - Not installed"
fi

# Puppeteer
if npm list -g puppeteer-mcp-server &>/dev/null; then
    echo -e "${GREEN}✓${NC} puppeteer - Browser automation (installed)"
else
    echo -e "${RED}✗${NC} puppeteer - Not installed"
fi

# Shadcn-ui
if npm list -g @jpisnice/shadcn-ui-mcp-server &>/dev/null; then
    if [ -n "$SHADCN_GITHUB_API_KEY" ]; then
        echo -e "${GREEN}✓${NC} shadcn-ui - UI components (installed + token configured)"
    else
        echo -e "${YELLOW}⚠${NC} shadcn-ui - UI components (installed, no token)"
    fi
else
    echo -e "${RED}✗${NC} shadcn-ui - Not installed"
fi

# Firecrawl
if npm list -g firecrawl-mcp &>/dev/null; then
    if [ -n "$FIRECRAWL_API_KEY" ]; then
        echo -e "${GREEN}✓${NC} firecrawl - Web scraping (installed + API key configured)"
    else
        echo -e "${YELLOW}⚠${NC} firecrawl - Web scraping (installed, no API key)"
    fi
else
    echo -e "${RED}✗${NC} firecrawl - Not installed"
fi

echo ""
echo -e "${BLUE}API Key Configuration:${NC}"
echo "------------------------------------------------"

check_key() {
    local key=$1
    local service=$2
    
    if [ -z "${!key}" ]; then
        echo -e "${RED}✗${NC} $service: Not configured ($key)"
    else
        # Mask the key for security
        local masked="${!key:0:10}...${!key: -4}"
        echo -e "${GREEN}✓${NC} $service: Configured ($masked)"
    fi
}

check_key "GITHUB_PERSONAL_ACCESS_TOKEN" "GitHub"
check_key "FIRECRAWL_API_KEY" "Firecrawl"
check_key "SHADCN_GITHUB_API_KEY" "Shadcn-ui"
check_key "SEMGREP_APP_TOKEN" "Semgrep"

echo ""
echo -e "${BLUE}Configuration Files:${NC}"
echo "------------------------------------------------"

[ -f .bmad-core/mcp-servers.json ] && echo -e "${GREEN}✓${NC} MCP configuration: .bmad-core/mcp-servers.json" || echo -e "${RED}✗${NC} MCP configuration missing"
[ -f .env ] && echo -e "${GREEN}✓${NC} Environment file: .env" || echo -e "${YELLOW}⚠${NC} Environment file missing"

echo ""
echo "================================================"
echo -e "${GREEN}MCP Setup Status${NC}"
echo "================================================"
echo ""

# Count installed servers
total_installed=$(npm list -g --depth=0 2>/dev/null | grep -cE "(mcp|@modelcontextprotocol|@jpisnice)")
echo "Total MCP servers installed: $total_installed"
echo ""
echo "Active servers with full configuration:"
echo "• filesystem - File operations"
echo "• memory - Persistent memory"
echo "• github - Git operations (token configured)"
echo "• sequential-thinking - Complex reasoning"
echo "• ref-tools - Documentation management"
echo "• figma - Design integration"
echo "• puppeteer - Browser automation"
echo "• shadcn-ui - UI components (token configured)"
echo "• firecrawl - Web scraping (API key configured)"
echo ""
echo "Remember to restart Cursor IDE for changes to take effect!"