#!/bin/bash

# ================================================
# BMAD COMPLETE EXTENSION SETUP SCRIPT
# This implements BOTH documents in correct order
# ================================================

echo "🤖 BMAD Extension System Setup"
echo "=============================="
echo "THINK ULTRA HARD - Following exact sequence..."
echo ""

# ------------------------------------------------
# PHASE 1: CLEAN UNWANTED EXTENSIONS (Document 1)
# ------------------------------------------------
echo "📦 Phase 1: Cleaning unwanted extensions..."

UNWANTED_EXTENSIONS=(
  "ritwickdey.liveserver"
  "ms-python.python"
  "ms-vscode.cpptools"
  "ms-toolsai.jupyter"
  "hookyqr.beautify"
  "HookyQR.beautify"
  "msjsdiag.debugger-for-chrome"
)

for ext in "${UNWANTED_EXTENSIONS[@]}"; do
  if code --list-extensions | grep -q "$ext"; then
    echo "  ❌ Removing $ext..."
    code --uninstall-extension "$ext" --force
  fi
done

# ------------------------------------------------
# PHASE 2: INSTALL CORE EXTENSIONS (Document 1)
# ------------------------------------------------
echo ""
echo "📦 Phase 2: Installing core extensions..."

# Core Development
code --install-extension dbaeumer.vscode-eslint@3.0.10
code --install-extension esbenp.prettier-vscode@10.4.0
code --install-extension streetsidesoftware.code-spell-checker@3.0.1

# Next.js & React
code --install-extension dsznajder.es7-react-js-snippets@4.4.3
code --install-extension burkeholland.simple-react-snippets@1.2.7
code --install-extension pulkitgangwar.nextjs-snippets@0.0.2

# Tailwind CSS (Critical for shadcn-ui)
code --install-extension bradlc.vscode-tailwindcss@0.10.5
code --install-extension austenc.tailwind-docs@2.0.0

# Prisma ORM
code --install-extension Prisma.prisma@5.11.0

# Git Integration
code --install-extension eamodio.gitlens@14.9.0
code --install-extension mhutchie.git-graph@1.30.0

# ------------------------------------------------
# PHASE 3: INSTALL AGENT EXTENSIONS (Document 1)
# ------------------------------------------------
echo ""
echo "📦 Phase 3: Installing agent-specific extensions..."

# Product Manager Agent
code --install-extension bierner.markdown-mermaid@1.23.0
code --install-extension yzhang.markdown-all-in-one@3.6.2
code --install-extension davidanson.vscode-markdownlint@0.54.0

# UX Engineer Agent
code --install-extension naumovs.color-highlight@2.8.0
code --install-extension kisstkondoros.vscode-gutter-preview@0.30.0
code --install-extension pranaygp.vscode-css-peek@4.4.1

# System Architect Agent
code --install-extension usernamehw.errorlens@3.16.0
code --install-extension humao.rest-client@0.25.1
code --install-extension rangav.vscode-thunder-client@2.20.2

# Full Stack Developer Agent
code --install-extension christian-kohler.path-intellisense@2.8.5
code --install-extension formulahendry.auto-rename-tag@0.1.10
code --install-extension steoates.autoimport@1.5.4
code --install-extension wix.vscode-import-cost@3.3.0

# QA Engineer Agent
code --install-extension ms-playwright.playwright@1.0.22
code --install-extension Orta.vscode-jest@6.2.5
code --install-extension ryanluker.vscode-coverage-gutters@2.11.1

# DevOps Agent
code --install-extension ms-azuretools.vscode-docker@1.29.0
code --install-extension mikestead.dotenv@1.0.1
code --install-extension redhat.vscode-yaml@1.14.0

# AI Assistants
code --install-extension GitHub.copilot@1.180.0
code --install-extension GitHub.copilot-chat@0.14.0

# ------------------------------------------------
# PHASE 4: CREATE CONFIGURATION FILES (Document 1)
# ------------------------------------------------
echo ""
echo "📝 Phase 4: Creating VS Code configuration..."

# Create .vscode directory if it doesn't exist
mkdir -p .vscode

# Create settings.json
cat > .vscode/settings.json << 'EOF'
{
  "bmad.agentMode": true,
  "bmad.autoSelectAgent": true,
  "bmad.statusReporting": "continuous",
  "editor.fontSize": 14,
  "editor.fontFamily": "'JetBrains Mono', 'Fira Code', monospace",
  "editor.fontLigatures": true,
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.organizeImports": "explicit"
  },
  "typescript.updateImportsOnFileMove.enabled": "always",
  "javascript.updateImportsOnFileMove.enabled": "always",
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"],
    ["cn\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ],
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  "prettier.semi": false,
  "prettier.singleQuote": true,
  "prettier.trailingComma": "es5",
  "git.autofetch": true,
  "git.enableSmartCommit": true,
  "files.associations": {
    "*.css": "tailwindcss",
    "*.cursorrules": "markdown",
    "*.bmad": "markdown"
  }
}
EOF

# Create extensions.json
cat > .vscode/extensions.json << 'EOF'
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "Prisma.prisma",
    "eamodio.gitlens",
    "ms-playwright.playwright",
    "GitHub.copilot"
  ]
}
EOF

# ------------------------------------------------
# PHASE 5: CREATE INTEGRATION LAYER (Document 2)
# ------------------------------------------------
echo ""
echo "🔧 Phase 5: Setting up BMAD integration layer..."

# Create directory structure
mkdir -p .cursorrules/extensions
mkdir -p .cursorrules/agents
mkdir -p .cursorrules/workflows
mkdir -p .cursorrules/memory

# Create agent-bindings.cursorrules
cat > .cursorrules/extensions/agent-bindings.cursorrules << 'EOF'
# BMAD AGENT-EXTENSION AUTONOMOUS BINDINGS

## PRODUCT MANAGER AGENT
Auto-Activated: markdown-all-in-one, markdown-mermaid, rest-client
MCP Integration: exa→thunder-client, firecrawl→markdown, context7→git-graph

## UX ENGINEER AGENT
Auto-Activated: vscode-tailwindcss, color-highlight, css-peek
MCP Integration: shadcn-ui→tailwind, playwright→coverage, ref-tools→css-peek

## SYSTEM ARCHITECT AGENT
Auto-Activated: prisma, errorlens, docker, yaml
MCP Integration: context7→project-structure, ref-tools→patterns, git→branches

## FULL STACK DEVELOPER AGENT
Auto-Activated: path-intellisense, auto-rename-tag, import-cost, react-snippets
MCP Integration: shadcn-ui→components, git→commits, context7→code-context

## QA ENGINEER AGENT
Auto-Activated: playwright, jest, coverage-gutters, errorlens
MCP Integration: playwright-mcp→extension, ref-tools→test-cases, context7→bugs

## DEVOPS AGENT
Auto-Activated: docker, dotenv, yaml, gitlens
MCP Integration: git→deployment, context7→infrastructure, firecrawl→docs
EOF

# Create MCP bridge configuration
cat > .cursorrules/extensions/mcp-bridge.cursorrules << 'EOF'
# MCP-EXTENSION BRIDGE CONFIGURATION

## AUTOMATIC TOOL-EXTENSION COORDINATION

When shadcn-ui generates → Open in editor, Enable Tailwind, Format
When playwright runs → Open Test Explorer, Show coverage, Display trace
When git operates → Show commit graph, Display blame, Open diff
When exa searches → Create .http file, Execute requests, Generate types
When firecrawl extracts → Create markdown, Generate TOC, Open preview
EOF

# Create agent-specific JSON configs
cat > .cursorrules/agents/product-manager-extensions.json << 'EOF'
{
  "agent": "product-manager",
  "extensions": {
    "required": [
      "yzhang.markdown-all-in-one",
      "bierner.markdown-mermaid",
      "humao.rest-client"
    ],
    "autoActivate": true,
    "commands": [
      "markdown.showPreview",
      "markdown-mermaid.generateDiagram"
    ],
    "mcpIntegration": {
      "exa": ["rest-client"],
      "firecrawl": ["markdown-all-in-one"],
      "context7": ["git-graph"]
    }
  }
}
EOF

cat > .cursorrules/agents/ux-engineer-extensions.json << 'EOF'
{
  "agent": "ux-engineer",
  "extensions": {
    "required": [
      "bradlc.vscode-tailwindcss",
      "naumovs.color-highlight",
      "pranaygp.vscode-css-peek"
    ],
    "autoActivate": true,
    "commands": [
      "tailwindCSS.showOutput",
      "color-highlight.activate"
    ],
    "mcpIntegration": {
      "shadcn-ui": ["vscode-tailwindcss"],
      "playwright": ["coverage-gutters"]
    }
  }
}
EOF

cat > .cursorrules/agents/developer-extensions.json << 'EOF'
{
  "agent": "fullstack-developer",
  "extensions": {
    "required": [
      "christian-kohler.path-intellisense",
      "formulahendry.auto-rename-tag",
      "wix.vscode-import-cost"
    ],
    "autoActivate": true,
    "commands": [
      "editor.action.organizeImports",
      "import-cost.toggle"
    ],
    "mcpIntegration": {
      "shadcn-ui": ["auto-rename-tag"],
      "git": ["gitlens"],
      "context7": ["errorlens"]
    }
  }
}
EOF

cat > .cursorrules/agents/qa-engineer-extensions.json << 'EOF'
{
  "agent": "qa-engineer",
  "extensions": {
    "required": [
      "ms-playwright.playwright",
      "Orta.vscode-jest",
      "ryanluker.vscode-coverage-gutters"
    ],
    "autoActivate": true,
    "commands": [
      "testing.viewAsTree",
      "coverage-gutters.displayCoverage"
    ],
    "mcpIntegration": {
      "playwright": ["playwright-extension"],
      "ref-tools": ["test-references"]
    }
  }
}
EOF

cat > .cursorrules/agents/devops-extensions.json << 'EOF'
{
  "agent": "devops",
  "extensions": {
    "required": [
      "ms-azuretools.vscode-docker",
      "mikestead.dotenv",
      "redhat.vscode-yaml"
    ],
    "autoActivate": true,
    "commands": [
      "docker-explorer.focus",
      "git-graph.view"
    ],
    "mcpIntegration": {
      "git": ["gitlens"],
      "context7": ["docker"]
    }
  }
}
EOF

# ------------------------------------------------
# PHASE 6: CREATE BMAD SNIPPETS (Document 1)
# ------------------------------------------------
echo ""
echo "📝 Phase 6: Creating BMAD snippets..."

cat > .vscode/bmad.code-snippets << 'EOF'
{
  "BMAD Status Update": {
    "prefix": "bmad-status",
    "body": [
      "🤖 BMAD STATUS UPDATE",
      "════════════════════",
      "Current Agent: ${1:Active Agent}",
      "Task: ${2:Current Task}",
      "MCP Tools Active: ${3:Tools}",
      "Progress: [██████████░░░░░░] ${4:65}%",
      "Next Agent: ${5:Next Agent}",
      "════════════════════"
    ]
  },
  "Next.js Page Component": {
    "prefix": "bmad-page",
    "body": [
      "'use client'",
      "",
      "import { useState, useEffect } from 'react'",
      "",
      "export default function ${1:PageName}() {",
      "  const [${2:state}, set${2/(.*)/${1:/capitalize}/}] = useState(${3:initial})",
      "",
      "  return (",
      "    <div className=\"${4:container mx-auto p-4}\">",
      "      ${0:// Component content}",
      "    </div>",
      "  )",
      "}"
    ]
  }
}
EOF

# ------------------------------------------------
# PHASE 7: VERIFICATION
# ------------------------------------------------
echo ""
echo "✅ Phase 7: Verifying installation..."
echo ""

# Count extensions
TOTAL_EXT=$(code --list-extensions | wc -l)
echo "📊 Total extensions installed: $TOTAL_EXT"

# Check critical extensions
CRITICAL_EXTENSIONS=(
  "dbaeumer.vscode-eslint"
  "esbenp.prettier-vscode"
  "bradlc.vscode-tailwindcss"
  "Prisma.prisma"
  "eamodio.gitlens"
)

echo ""
echo "Verifying critical extensions:"
for ext in "${CRITICAL_EXTENSIONS[@]}"; do
  if code --list-extensions | grep -q "$ext"; then
    echo "  ✅ $ext"
  else
    echo "  ❌ $ext (MISSING)"
  fi
done

# Check directory structure
echo ""
echo "Verifying BMAD structure:"
[ -d ".cursorrules/extensions" ] && echo "  ✅ Extensions config" || echo "  ❌ Extensions config"
[ -d ".cursorrules/agents" ] && echo "  ✅ Agent configs" || echo "  ❌ Agent configs"
[ -f ".vscode/settings.json" ] && echo "  ✅ VS Code settings" || echo "  ❌ VS Code settings"
[ -f ".vscode/bmad.code-snippets" ] && echo "  ✅ BMAD snippets" || echo "  ❌ BMAD snippets"

# ------------------------------------------------
# COMPLETE
# ------------------------------------------------
echo ""
echo "=============================="
echo "🚀 BMAD Extension System Setup Complete!"
echo "=============================="
echo ""
echo "Next steps:"
echo "1. Restart VS Code/Cursor"
echo "2. Open Command Palette (Ctrl+Shift+P)"
echo "3. Run: 'BMAD: Switch Active Agent'"
echo "4. Start developing with BMAD!"
echo ""
echo "🤖 THINK ULTRA HARD - System Ready for Autonomous Operation!"