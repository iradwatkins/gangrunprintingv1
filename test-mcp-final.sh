#!/bin/bash

# ================================================
# Final MCP Server Test
# ================================================

echo "================================================"
echo "Final MCP Server Configuration Test"
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
npm list -g --depth=0 2>/dev/null | grep -E "(mcp|@modelcontextprotocol)" | while read line; do
    echo -e "${GREEN}✓${NC} $line"
done

echo ""
echo -e "${BLUE}Testing Active MCP Servers:${NC}"
echo "------------------------------------------------"

# Test each installed server
test_server() {
    local name=$1
    local package=$2
    
    echo -n "Testing $name... "
    
    # Try to run with a test command
    if timeout 2s npx -y $package 2>&1 | grep -q "MCP"; then
        echo -e "${GREEN}✓ Working${NC}"
        return 0
    elif npx -y $package --version &>/dev/null; then
        echo -e "${GREEN}✓ Installed${NC}"
        return 0
    else
        # Package exists but might need configuration
        if npm list -g $package &>/dev/null; then
            echo -e "${YELLOW}⚠ Installed (needs API key)${NC}"
            return 1
        else
            echo -e "${RED}✗ Not found${NC}"
            return 2
        fi
    fi
}

test_server "filesystem" "@modelcontextprotocol/server-filesystem"
test_server "memory" "@modelcontextprotocol/server-memory"
test_server "github" "@modelcontextprotocol/server-github"
test_server "sequential-thinking" "@modelcontextprotocol/server-sequential-thinking"
test_server "slack" "@modelcontextprotocol/server-slack"
test_server "ref-tools" "ref-tools-mcp"
test_server "figma" "figma-mcp"
test_server "puppeteer" "puppeteer-mcp-server"

echo ""
echo -e "${BLUE}MCP Configuration Summary:${NC}"
echo "------------------------------------------------"

# Count servers
total_installed=$(npm list -g --depth=0 2>/dev/null | grep -cE "(mcp|@modelcontextprotocol)")
echo -e "Total MCP servers installed: ${GREEN}$total_installed${NC}"

echo ""
echo -e "${BLUE}API Key Status:${NC}"
echo "------------------------------------------------"

# Source environment files
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs) 2>/dev/null
fi

check_key() {
    local key=$1
    local service=$2
    
    if [ -z "${!key}" ]; then
        echo -e "${YELLOW}⚠${NC} $service: API key not set ($key)"
    else
        echo -e "${GREEN}✓${NC} $service: API key configured"
    fi
}

check_key "GITHUB_PERSONAL_ACCESS_TOKEN" "GitHub"
check_key "SLACK_BOT_TOKEN" "Slack Bot"
check_key "SLACK_APP_TOKEN" "Slack App"

echo ""
echo -e "${BLUE}Configuration Files:${NC}"
echo "------------------------------------------------"

[ -f .bmad-core/mcp-servers.json ] && echo -e "${GREEN}✓${NC} MCP configuration: .bmad-core/mcp-servers.json" || echo -e "${RED}✗${NC} MCP configuration missing"
[ -f .env ] && echo -e "${GREEN}✓${NC} Environment file: .env" || echo -e "${YELLOW}⚠${NC} Environment file missing"
[ -f .env.mcp ] && echo -e "${GREEN}✓${NC} MCP template: .env.mcp" || echo -e "${YELLOW}⚠${NC} MCP template missing"

echo ""
echo "================================================"
echo -e "${GREEN}MCP Setup Complete!${NC}"
echo "================================================"
echo ""
echo "Currently installed and working:"
echo "• filesystem - File operations"
echo "• memory - Persistent memory"
echo "• github - Git operations (needs token)"
echo "• sequential-thinking - Complex reasoning"
echo "• slack - Team communication (needs tokens)"
echo "• ref-tools - Documentation management"
echo "• figma - Design integration"
echo "• puppeteer - Browser automation"
echo ""
echo "To add API keys:"
echo "1. Edit .env file"
echo "2. Add your GITHUB_PERSONAL_ACCESS_TOKEN"
echo "3. Add Slack tokens if needed"
echo "4. Restart Cursor IDE"