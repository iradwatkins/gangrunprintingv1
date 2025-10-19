#!/bin/bash

# ================================================
# MCP Server Test Script
# ================================================
# This script tests all configured MCP servers
# Created: September 2025

echo "================================================"
echo "Testing MCP Servers"
echo "================================================"
echo ""

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test function
test_mcp() {
    local name=$1
    local command=$2
    
    echo -n "Testing $name... "
    
    if $command --help &> /dev/null; then
        echo -e "${GREEN}✓ Available${NC}"
        return 0
    else
        echo -e "${RED}✗ Not found${NC}"
        return 1
    fi
}

# Counter for results
total=0
passed=0

echo "Core MCP Servers (Should be active):"
echo "------------------------------------"

# Test core MCPs
test_mcp "filesystem" "npx -y @modelcontextprotocol/server-filesystem" && ((passed++))
((total++))

test_mcp "memory" "npx -y @modelcontextprotocol/server-memory" && ((passed++))
((total++))

test_mcp "playwright" "npx -y @modelcontextprotocol/server-playwright" && ((passed++))
((total++))

test_mcp "sequential-thinking" "npx -y @modelcontextprotocol/server-sequential-thinking" && ((passed++))
((total++))

test_mcp "fetch" "npx -y @modelcontextprotocol/server-fetch" && ((passed++))
((total++))

test_mcp "git" "npx -y @modelcontextprotocol/server-git" && ((passed++))
((total++))

echo ""
echo "New High-Value MCPs (Need API keys):"
echo "------------------------------------"

# Test new MCPs
test_mcp "github" "npx -y @modelcontextprotocol/server-github" && ((passed++))
((total++))

test_mcp "selenium" "npx -y @modelcontextprotocol/server-selenium" && ((passed++))
((total++))

test_mcp "postgresql" "npx -y @modelcontextprotocol/server-postgresql" && ((passed++))
((total++))

test_mcp "notion" "npx -y @modelcontextprotocol/server-notion" && ((passed++))
((total++))

test_mcp "slack" "npx -y @modelcontextprotocol/server-slack" && ((passed++))
((total++))

test_mcp "shadcn-ui" "npx -y shadcn-ui-mcp" && ((passed++))
((total++))

test_mcp "exa" "npx -y @modelcontextprotocol/server-exa" && ((passed++))
((total++))

test_mcp "firecrawl" "npx -y @modelcontextprotocol/server-firecrawl" && ((passed++))
((total++))

test_mcp "ref-tools" "npx -y @modelcontextprotocol/server-ref" && ((passed++))
((total++))

test_mcp "context7" "npx -y @modelcontextprotocol/server-context" && ((passed++))
((total++))

echo ""
echo "================================================"
echo "Test Results"
echo "================================================"
echo ""

if [ $passed -eq $total ]; then
    echo -e "${GREEN}All $total MCP servers are available!${NC}"
else
    echo -e "${YELLOW}$passed out of $total MCP servers are available${NC}"
    echo ""
    echo "To install missing servers, run:"
    echo "./install-mcp-servers.sh"
fi

echo ""
echo "Checking for API keys in environment..."
echo "----------------------------------------"

# Check for API keys
check_env() {
    local key=$1
    local service=$2
    
    if [ -z "${!key}" ]; then
        echo -e "${YELLOW}⚠ $key not set (required for $service)${NC}"
    else
        echo -e "${GREEN}✓ $key is set${NC}"
    fi
}

# Source .env if it exists
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Source .env.mcp if it exists
if [ -f .env.mcp ]; then
    export $(cat .env.mcp | grep -v '^#' | xargs)
fi

check_env "GITHUB_PERSONAL_ACCESS_TOKEN" "GitHub MCP"
check_env "POSTGRES_CONNECTION_STRING" "PostgreSQL MCP"
check_env "EXA_API_KEY" "Exa MCP"
check_env "FIRECRAWL_API_KEY" "Firecrawl MCP"
check_env "NOTION_API_KEY" "Notion MCP"
check_env "SLACK_BOT_TOKEN" "Slack MCP"
check_env "SLACK_APP_TOKEN" "Slack MCP"

echo ""
echo "================================================"
echo "Configuration Files"
echo "================================================"
echo ""

if [ -f .bmad-core/mcp-servers.json ]; then
    echo -e "${GREEN}✓ MCP configuration found: .bmad-core/mcp-servers.json${NC}"
else
    echo -e "${RED}✗ MCP configuration not found${NC}"
fi

if [ -f .env.mcp ]; then
    echo -e "${GREEN}✓ MCP environment template found: .env.mcp${NC}"
else
    echo -e "${YELLOW}⚠ MCP environment template not found${NC}"
fi

if [ -f .env ]; then
    echo -e "${GREEN}✓ Environment file found: .env${NC}"
else
    echo -e "${YELLOW}⚠ No .env file found (copy .env.mcp to .env and add your API keys)${NC}"
fi

echo ""
echo "Done!"