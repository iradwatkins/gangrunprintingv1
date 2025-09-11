#!/bin/bash

# ================================================
# Cursor Extensions Quick Installer
# ================================================

echo "================================================"
echo "📦 Installing Essential Cursor Extensions"
echo "================================================"
echo ""

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check if Cursor/Code CLI is available
if ! command -v code &> /dev/null && ! command -v cursor &> /dev/null; then
    echo -e "${YELLOW}⚠ Cursor/Code CLI not found in PATH${NC}"
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

echo "Using CLI: $CLI"
echo ""

# Essential Extensions List
declare -a ESSENTIAL=(
    "dbaeumer.vscode-eslint"
    "esbenp.prettier-vscode"
    "bradlc.vscode-tailwindcss"
    "prisma.prisma"
)

declare -a AI_PRODUCTIVITY=(
    "github.copilot"
    "github.copilot-chat"
    "Continue.continue"
)

declare -a GIT_TOOLS=(
    "eamodio.gitlens"
    "github.vscode-pull-request-github"
)

declare -a REACT_NEXTJS=(
    "dsznajder.es7-react-js-snippets"
    "pulkitgangwar.nextjs-snippets"
)

declare -a PRODUCTIVITY=(
    "usernamehw.errorlens"
    "gruntfuggly.todo-tree"
    "christian-kohler.path-intellisense"
    "chakrounanas.turbo-console-log"
)

declare -a CLOUDFLARE=(
    "cloudflare.cloudflare-workers-vscode"
)

declare -a DOCKER_VPS=(
    "ms-azuretools.vscode-docker"
    "ms-vscode-remote.remote-ssh"
    "ms-vscode-remote.remote-containers"
    "ms-vscode-remote.vscode-remote-extensionpack"
    "formulahendry.docker-explorer"
)

declare -a DATABASE=(
    "cweijan.vscode-database-client2"
    "mtxr.sqltools"
    "mtxr.sqltools-driver-pg"
)

declare -a INFRASTRUCTURE=(
    "matthewpi.caddyfile-support"
    "redis.redis"
    "redhat.vscode-yaml"
    "mikestead.dotenv"
)

declare -a API_TESTING=(
    "humao.rest-client"
    "rangav.vscode-thunder-client"
    "42Crunch.vscode-openapi"
)

declare -a THEMES=(
    "PKief.material-icon-theme"
    "zhuangtongfa.material-theme"
)

# Installation function
install_extension() {
    local ext=$1
    echo -n "Installing $ext... "
    if $CLI --install-extension $ext --force 2>/dev/null; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${YELLOW}⚠ May already be installed${NC}"
    fi
}

# Install categories
echo -e "${BLUE}🔧 Core Development Extensions:${NC}"
for ext in "${ESSENTIAL[@]}"; do
    install_extension "$ext"
done
echo ""

echo -e "${BLUE}🤖 AI & Productivity Extensions:${NC}"
for ext in "${AI_PRODUCTIVITY[@]}"; do
    install_extension "$ext"
done
echo ""

echo -e "${BLUE}📚 Git & Version Control:${NC}"
for ext in "${GIT_TOOLS[@]}"; do
    install_extension "$ext"
done
echo ""

echo -e "${BLUE}⚛️ React/Next.js Development:${NC}"
for ext in "${REACT_NEXTJS[@]}"; do
    install_extension "$ext"
done
echo ""

echo -e "${BLUE}🚀 Productivity Boosters:${NC}"
for ext in "${PRODUCTIVITY[@]}"; do
    install_extension "$ext"
done
echo ""

echo -e "${BLUE}☁️ Cloudflare Integration:${NC}"
for ext in "${CLOUDFLARE[@]}"; do
    install_extension "$ext"
done
echo ""

echo -e "${BLUE}🐳 Docker & VPS Management:${NC}"
for ext in "${DOCKER_VPS[@]}"; do
    install_extension "$ext"
done
echo ""

echo -e "${BLUE}🗄️ Database Tools:${NC}"
for ext in "${DATABASE[@]}"; do
    install_extension "$ext"
done
echo ""

echo -e "${BLUE}🏗️ Infrastructure:${NC}"
for ext in "${INFRASTRUCTURE[@]}"; do
    install_extension "$ext"
done
echo ""

echo -e "${BLUE}🔌 API Testing:${NC}"
for ext in "${API_TESTING[@]}"; do
    install_extension "$ext"
done
echo ""

echo -e "${BLUE}🎨 Themes & Icons:${NC}"
for ext in "${THEMES[@]}"; do
    install_extension "$ext"
done
echo ""

echo "================================================"
echo -e "${GREEN}✅ Installation Complete!${NC}"
echo "================================================"
echo ""
echo "Next steps:"
echo "1. Restart Cursor to activate all extensions"
echo "2. Check View → Extensions to verify installation"
echo "3. Configure settings as needed"
echo ""
echo "Optional: Install more extensions from CURSOR-EXTENSIONS.md"
echo ""

# Show installed count
installed_count=$($CLI --list-extensions 2>/dev/null | wc -l)
echo "Total extensions installed: $installed_count"