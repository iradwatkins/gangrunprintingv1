#!/bin/bash

# MCP Servers Verification Script
# Purpose: Verify all MCP servers are properly configured and packages exist
# Last Updated: October 11, 2025

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Config file location
CONFIG_FILE="/root/.config/claude-code/claude_desktop_config.json"

echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}   MCP Servers Verification Script${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""

# Function to print success
success() {
    echo -e "${GREEN}✓${NC} $1"
}

# Function to print error
error() {
    echo -e "${RED}✗${NC} $1"
}

# Function to print warning
warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Function to print info
info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Check if config file exists
echo -e "\n${BLUE}[1/8]${NC} Checking configuration file..."
if [ -f "$CONFIG_FILE" ]; then
    success "Configuration file exists: $CONFIG_FILE"
else
    error "Configuration file not found: $CONFIG_FILE"
    exit 1
fi

# Validate JSON syntax
echo -e "\n${BLUE}[2/8]${NC} Validating JSON syntax..."
if python3 -m json.tool "$CONFIG_FILE" > /dev/null 2>&1; then
    success "JSON syntax is valid"
else
    error "JSON syntax error in configuration file"
    exit 1
fi

# Check file permissions
echo -e "\n${BLUE}[3/8]${NC} Checking file permissions..."
PERMS=$(stat -c "%a" "$CONFIG_FILE")
if [ "$PERMS" == "600" ]; then
    success "File permissions are secure (600)"
else
    warning "File permissions are $PERMS (recommended: 600)"
    info "Run: chmod 600 $CONFIG_FILE"
fi

# Verify Chrome DevTools path
echo -e "\n${BLUE}[4/8]${NC} Verifying Chrome DevTools MCP..."
CHROME_PATH="/root/.claude-code/mcp-servers/chrome-devtools-mcp/build/src/index.js"
if [ -f "$CHROME_PATH" ]; then
    success "Chrome DevTools path exists"
else
    error "Chrome DevTools path not found: $CHROME_PATH"
    info "Reinstallation may be required"
fi

# Verify npm packages
echo -e "\n${BLUE}[5/8]${NC} Verifying npm packages..."

packages=(
    "@modelcontextprotocol/server-puppeteer"
    "@jpisnice/shadcn-ui-mcp-server"
    "firecrawl-mcp"
    "exa-mcp"
    "@upstash/context7-mcp"
    "@taika-st/ref-tools-mcp-optimized"
)

echo ""
for package in "${packages[@]}"; do
    if npm view "$package" version > /dev/null 2>&1; then
        version=$(npm view "$package" version 2>/dev/null)
        success "$package ($version)"
    else
        error "$package - not found on npm"
    fi
done

# Check API keys
echo -e "\n${BLUE}[6/8]${NC} Checking API keys..."

# Extract API keys from config
FIRECRAWL_KEY=$(python3 -c "import json; print(json.load(open('$CONFIG_FILE'))['mcpServers']['firecrawl']['env']['FIRECRAWL_API_KEY'])" 2>/dev/null)
EXA_KEY=$(python3 -c "import json; print(json.load(open('$CONFIG_FILE'))['mcpServers']['exa']['env']['EXA_API_KEY'])" 2>/dev/null)
CONTEXT7_KEY=$(python3 -c "import json; print(json.load(open('$CONFIG_FILE'))['mcpServers']['context7']['env']['CONTEXT7_API_KEY'])" 2>/dev/null)
REF_KEY=$(python3 -c "import json; print(json.load(open('$CONFIG_FILE'))['mcpServers']['ref']['env']['REF_API_KEY'])" 2>/dev/null)

if [ ! -z "$FIRECRAWL_KEY" ]; then
    success "Firecrawl API key configured"
else
    error "Firecrawl API key missing"
fi

if [ ! -z "$EXA_KEY" ]; then
    success "Exa.ai API key configured"
else
    error "Exa.ai API key missing"
fi

if [ ! -z "$CONTEXT7_KEY" ]; then
    success "Context7 API key configured"
else
    error "Context7 API key missing"
fi

if [ ! -z "$REF_KEY" ]; then
    success "Ref Tools API key configured"
else
    error "Ref Tools API key missing"
fi

# Count configured MCPs
echo -e "\n${BLUE}[7/8]${NC} Counting configured MCPs..."
MCP_COUNT=$(python3 -c "import json; print(len(json.load(open('$CONFIG_FILE'))['mcpServers']))" 2>/dev/null)
success "Total MCPs configured: $MCP_COUNT"

# Summary
echo -e "\n${BLUE}[8/8]${NC} Summary"
echo -e "${BLUE}=========================================${NC}"

# List all configured MCPs
echo -e "\n${GREEN}Configured MCP Servers:${NC}"
python3 -c "import json; mcps = json.load(open('$CONFIG_FILE'))['mcpServers']; print('\n'.join(f'  • {name}' for name in mcps.keys()))"

echo -e "\n${YELLOW}Next Steps:${NC}"
echo "  1. Restart Claude Code to activate all MCPs"
echo "  2. Test each MCP with a simple command"
echo "  3. Review documentation: docs/MCP-SERVERS-GUIDE.md"

echo -e "\n${GREEN}Verification complete!${NC}"
echo ""

exit 0
