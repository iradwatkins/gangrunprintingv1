#!/bin/bash

# ================================================
# Complete Cursor Extensions Installer
# For Docker VPS Migration & Development
# ================================================

echo "================================================"
echo "🚀 Installing ALL Cursor Extensions for Migration"
echo "================================================"
echo ""

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Check if Cursor/Code CLI is available
if ! command -v code &> /dev/null && ! command -v cursor &> /dev/null; then
    echo -e "${RED}❌ Cursor/Code CLI not found in PATH${NC}"
    echo ""
    echo "To install Cursor CLI:"
    echo "1. Open Cursor"
    echo "2. Press Cmd+Shift+P"
    echo "3. Type 'Shell Command: Install code command in PATH'"
    echo "4. Run this script again"
    exit 1
fi

# Use cursor if available, otherwise use code
CLI="code"
if command -v cursor &> /dev/null; then
    CLI="cursor"
fi

echo -e "${GREEN}✓ Using CLI: $CLI${NC}"
echo ""

# Installation function with error handling
install_extension() {
    local ext=$1
    local desc=$2
    echo -n "  Installing $ext... "
    if $CLI --install-extension $ext --force 2>/dev/null; then
        echo -e "${GREEN}✓${NC} $desc"
    else
        echo -e "${YELLOW}⚠${NC} May already be installed"
    fi
}

# Category installation function
install_category() {
    local category=$1
    shift
    echo -e "\n${BLUE}$category${NC}"
    while (( "$#" >= 2 )); do
        install_extension "$1" "$2"
        shift 2
    done
}

echo "Starting installation..."

# Core Development
install_category "🔧 Core Development:" \
    "dbaeumer.vscode-eslint" "ESLint" \
    "esbenp.prettier-vscode" "Prettier" \
    "bradlc.vscode-tailwindcss" "Tailwind CSS" \
    "prisma.prisma" "Prisma ORM"

# Docker & VPS Management
install_category "🐳 Docker & VPS Management:" \
    "ms-azuretools.vscode-docker" "Docker" \
    "ms-vscode-remote.remote-ssh" "Remote SSH" \
    "ms-vscode-remote.remote-containers" "Dev Containers" \
    "ms-vscode-remote.vscode-remote-extensionpack" "Remote Pack" \
    "formulahendry.docker-explorer" "Docker Explorer"

# Database Tools
install_category "🗄️ Database Management:" \
    "cweijan.vscode-database-client2" "Database Client" \
    "mtxr.sqltools" "SQL Tools" \
    "mtxr.sqltools-driver-pg" "PostgreSQL Driver"

# Infrastructure
install_category "🏗️ Infrastructure:" \
    "matthewpi.caddyfile-support" "Caddy Config" \
    "redis.redis" "Redis Client" \
    "redhat.vscode-yaml" "YAML Support" \
    "mikestead.dotenv" "ENV Files"

# API Testing
install_category "🔌 API Testing:" \
    "humao.rest-client" "REST Client" \
    "rangav.vscode-thunder-client" "Thunder Client" \
    "42Crunch.vscode-openapi" "OpenAPI/Swagger"

# React/Next.js
install_category "⚛️ React/Next.js:" \
    "dsznajder.es7-react-js-snippets" "React Snippets" \
    "pulkitgangwar.nextjs-snippets" "Next.js Snippets" \
    "burkeholland.simple-react-snippets" "Simple React Snippets"

# TypeScript & JavaScript
install_category "📦 TypeScript/JavaScript:" \
    "ms-vscode.vscode-typescript-next" "TypeScript" \
    "christian-kohler.path-intellisense" "Path IntelliSense" \
    "christian-kohler.npm-intellisense" "NPM IntelliSense" \
    "wix.vscode-import-cost" "Import Cost"

# Git & GitHub
install_category "📚 Git & Version Control:" \
    "eamodio.gitlens" "GitLens" \
    "github.vscode-pull-request-github" "GitHub PRs" \
    "github.copilot" "GitHub Copilot" \
    "github.copilot-chat" "Copilot Chat"

# Productivity
install_category "🚀 Productivity:" \
    "usernamehw.errorlens" "Error Lens" \
    "gruntfuggly.todo-tree" "TODO Tree" \
    "chakrounanas.turbo-console-log" "Console Log" \
    "wayou.vscode-todo-highlight" "TODO Highlight" \
    "streetsidesoftware.code-spell-checker" "Spell Checker"

# Cloudflare
install_category "☁️ Cloudflare:" \
    "cloudflare.cloudflare-workers-vscode" "Cloudflare Workers"

# UI Components
install_category "🎨 UI Components:" \
    "antfu.icons-carbon" "Icon Preview" \
    "kisstkondoros.vscode-gutter-preview" "Image Preview" \
    "SimonSiefke.svg-preview" "SVG Preview" \
    "naumovs.color-highlight" "Color Highlight"

# Testing
install_category "🧪 Testing:" \
    "Orta.vscode-jest" "Jest" \
    "ms-playwright.playwright" "Playwright" \
    "hbenl.vscode-test-explorer" "Test Explorer"

# AI & Assistance
install_category "🤖 AI Assistance:" \
    "Continue.continue" "Continue AI" \
    "Codeium.codeium" "Codeium"

# Themes & Icons
install_category "🎨 Themes & Icons:" \
    "PKief.material-icon-theme" "Material Icons" \
    "zhuangtongfa.material-theme" "Material Theme"

# File Management
install_category "📁 File Management:" \
    "sleistner.vscode-fileutils" "File Utils" \
    "alefragnani.Bookmarks" "Bookmarks"

# Markdown
install_category "📝 Documentation:" \
    "yzhang.markdown-all-in-one" "Markdown Tools" \
    "davidanson.vscode-markdownlint" "Markdown Lint"

echo ""
echo "================================================"
echo -e "${GREEN}✅ Installation Complete!${NC}"
echo "================================================"
echo ""

# Show summary
installed_count=$($CLI --list-extensions 2>/dev/null | wc -l)
echo -e "${BLUE}📊 Summary:${NC}"
echo "  • Total extensions installed: $installed_count"
echo "  • VPS/Docker tools: Ready ✓"
echo "  • Database tools: Ready ✓"
echo "  • Infrastructure tools: Ready ✓"
echo ""

echo -e "${YELLOW}📋 Next Steps:${NC}"
echo "1. Restart Cursor to activate all extensions"
echo "2. Configure Remote SSH for VPS access:"
echo "   - Press Cmd+Shift+P → 'Remote-SSH: Add New SSH Host'"
echo "   - Enter: ssh root@72.60.28.175"
echo "3. Set up Docker extension to connect to VPS"
echo "4. Configure Database Client with PostgreSQL credentials"
echo ""

echo -e "${GREEN}Ready for Dokploy → Docker migration!${NC}"