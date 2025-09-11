#!/bin/bash

# ================================================
# MCP Server Installation Script
# ================================================
# This script installs all MCP servers configured in .bmad-core/mcp-servers.json
# Created: September 2025

echo "================================================"
echo "Installing MCP Servers for BMAD System"
echo "================================================"
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "Error: npm is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "Node version: $(node --version)"
echo "npm version: $(npm --version)"
echo ""

# -------------------- CORE MCPs (Already Active) --------------------
echo "Installing Core MCP Servers (Already Active)..."
echo "------------------------------------------------"

echo "1. Installing filesystem MCP (12K+ stars)..."
npm install -g @modelcontextprotocol/server-filesystem

echo "2. Installing memory MCP..."
npm install -g @modelcontextprotocol/server-memory

echo "3. Installing playwright MCP..."
npm install -g @modelcontextprotocol/server-playwright

echo "4. Installing sequential-thinking MCP..."
npm install -g @modelcontextprotocol/server-sequential-thinking

echo "5. Installing fetch MCP..."
npm install -g @modelcontextprotocol/server-fetch

echo "6. Installing git MCP..."
npm install -g @modelcontextprotocol/server-git

echo ""
echo "Core MCPs installed successfully!"
echo ""

# -------------------- NEW HIGH-VALUE MCPs (Need Configuration) --------------------
echo "Installing New High-Value MCP Servers..."
echo "------------------------------------------------"

echo "7. Installing GitHub MCP (OAuth 2.1 + PKCE)..."
npm install -g @modelcontextprotocol/server-github

echo "8. Installing Selenium MCP (Alternative to Playwright)..."
npm install -g @modelcontextprotocol/server-selenium

echo "9. Installing PostgreSQL MCP..."
npm install -g @modelcontextprotocol/server-postgresql

echo "10. Installing Notion MCP..."
npm install -g @modelcontextprotocol/server-notion

echo "11. Installing Slack MCP..."
npm install -g @modelcontextprotocol/server-slack

echo "12. Installing shadcn-ui MCP..."
npm install -g shadcn-ui-mcp

echo "13. Installing Exa MCP (Advanced search)..."
npm install -g @modelcontextprotocol/server-exa

echo "14. Installing Firecrawl MCP (Web scraping)..."
npm install -g @modelcontextprotocol/server-firecrawl

echo "15. Installing ref-tools MCP..."
npm install -g @modelcontextprotocol/server-ref

echo "16. Installing context7 MCP..."
npm install -g @modelcontextprotocol/server-context

echo ""
echo "================================================"
echo "Installation Complete!"
echo "================================================"
echo ""
echo "Next Steps:"
echo "1. Copy .env.mcp to .env and fill in your API keys"
echo "2. Test each MCP server with: npx @modelcontextprotocol/server-NAME --help"
echo "3. Restart Cursor IDE to load the new MCP servers"
echo ""
echo "Required API Keys (see .env.mcp):"
echo "- GITHUB_PERSONAL_ACCESS_TOKEN"
echo "- POSTGRES_CONNECTION_STRING"
echo "- EXA_API_KEY"
echo "- FIRECRAWL_API_KEY"
echo "- NOTION_API_KEY"
echo "- SLACK_BOT_TOKEN"
echo "- SLACK_APP_TOKEN"
echo ""
echo "Security Note: MCP security landscape is evolving rapidly."
echo "Prioritize defense-in-depth strategies and rotate API keys regularly."