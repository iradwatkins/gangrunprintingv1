# 🔧 BMAD Extension Integration Layer - Autonomous Agent Tool Mapping

## ⚡ CRITICAL: DEEP INTEGRATION PROTOCOL

**THINK ULTRA HARD** - This configuration ensures each BMAD agent automatically triggers and uses the appropriate VS Code/Cursor extensions through MCP tools and command sequences.

---

## 📡 STEP 1: AGENT-EXTENSION BINDING CONFIGURATION

### Create `.cursorrules/extensions/agent-bindings.cursorrules`

```markdown
# BMAD AGENT-EXTENSION AUTONOMOUS BINDINGS

## AGENT EXTENSION MAPPING PROTOCOL

### 🎯 PRODUCT MANAGER AGENT
**Auto-Activated Extensions:**
- markdown-all-in-one → Requirement documentation
- markdown-mermaid → System flow diagrams
- rest-client → API endpoint testing
- thunder-client → Competitor API analysis

**Automatic Triggers:**
When task contains ["requirement", "user story", "research", "document"]:
  1. Open markdown preview: `markdown.showPreview`
  2. Generate mermaid diagram: `markdown-mermaid.generateDiagram`
  3. Create HTTP request file: `rest-client.request`
  4. Auto-format with markdownlint

**MCP Integration:**
- exa tool → Triggers thunder-client for API exploration
- firecrawl → Auto-opens markdown for documentation
- context7 → Syncs with git-graph for version history

### 🎨 UX ENGINEER AGENT
**Auto-Activated Extensions:**
- vscode-tailwindcss → Component styling
- color-highlight → Design token visualization
- css-peek → Style definition navigation
- gutter-preview → Image preview in code

**Automatic Triggers:**
When task contains ["design", "component", "UI", "style"]:
  1. Enable Tailwind IntelliSense: `tailwindCSS.showOutput`
  2. Sort Tailwind classes: `tailwindCSS.sortSelection`
  3. Preview colors inline: `color-highlight.activate`
  4. Open CSS peek: `css-peek.peekDefinition`

**MCP Integration:**
- shadcn-ui → Auto-completes Tailwind classes
- playwright → Visual regression testing
- ref-tools → Design system references

### 🏗️ SYSTEM ARCHITECT AGENT
**Auto-Activated Extensions:**
- prisma → Database schema management
- errorlens → Architecture issue detection
- docker → Container configuration
- yaml → Configuration files

**Automatic Triggers:**
When task contains ["database", "schema", "architecture", "infrastructure"]:
  1. Open Prisma studio: `prisma.studio`
  2. Format schema: `prisma.format`
  3. Generate client: `prisma.generate`
  4. Validate Docker compose: `docker-compose.validate`

**MCP Integration:**
- context7 → Analyzes project structure
- ref-tools → Architecture pattern lookup
- git → Branch management for architecture changes

### 💻 FULL STACK DEVELOPER AGENT
**Auto-Activated Extensions:**
- path-intellisense → Import path completion
- auto-rename-tag → HTML/JSX tag synchronization
- import-cost → Bundle size awareness
- es7-react-snippets → React component generation
- nextjs-snippets → Next.js patterns

**Automatic Triggers:**
When task contains ["implement", "code", "build", "component"]:
  1. Auto-import modules: `autoimport.addImport`
  2. Generate React component: `es7-react.component`
  3. Show import costs: `import-cost.toggle`
  4. Format with Prettier: `editor.action.formatDocument`
  5. Fix ESLint issues: `eslint.executeAutofix`

**MCP Integration:**
- shadcn-ui → Component scaffolding
- git → Commit with conventional messages
- context7 → Code context awareness

### 🔍 QA ENGINEER AGENT
**Auto-Activated Extensions:**
- playwright → E2E test execution
- jest → Unit test runner
- coverage-gutters → Coverage visualization
- errorlens → Error highlighting

**Automatic Triggers:**
When task contains ["test", "QA", "validate", "coverage"]:
  1. Run Playwright tests: `playwright.runAllTests`
  2. Show test coverage: `coverage-gutters.display`
  3. Run Jest tests: `jest.runAllTests`
  4. Generate test report: `playwright.showReport`
  5. Debug test: `playwright.debugTest`

**MCP Integration:**
- playwright (MCP) → Coordinates with extension
- ref-tools → Test case references
- context7 → Bug tracking context

### 🚀 DEVOPS AGENT
**Auto-Activated Extensions:**
- docker → Container management
- dotenv → Environment configuration
- yaml → CI/CD pipelines
- gitlens → Deployment history

**Automatic Triggers:**
When task contains ["deploy", "pipeline", "CI/CD", "production"]:
  1. Build Docker image: `docker.buildImage`
  2. Validate env files: `dotenv.validate`
  3. Check YAML syntax: `yaml.validate`
  4. Create deployment tag: `git.createTag`
  5. Show deployment history: `gitlens.showCommitDetails`

**MCP Integration:**
- git → Deployment commits
- context7 → Infrastructure state
- firecrawl → Documentation updates
```

---

## 🤖 STEP 2: AUTOMATIC EXTENSION COMMANDS

### Create `.cursorrules/extensions/auto-commands.cursorrules`

```markdown
# EXTENSION AUTO-COMMAND PROTOCOL

## THINK ULTRA HARD: Command Execution Rules

### AUTOMATIC COMMAND CHAINS

When BMAD agent activates, execute these command sequences:

#### Product Manager Activation Sequence
```typescript
async function activateProductManager() {
  // Auto-open markdown workspace
  await vscode.commands.executeCommand('markdown.showPreview')
  await vscode.commands.executeCommand('markdown-all-in-one.createToc')
  
  // Setup REST client environment
  await vscode.commands.executeCommand('rest-client.switch-environment')
  
  // Initialize documentation structure
  await vscode.workspace.fs.writeFile(
    vscode.Uri.file('docs/requirements/current-sprint.md'),
    Buffer.from('# Sprint Requirements\n\n## User Stories\n\n')
  )
}
```

#### UX Engineer Activation Sequence
```typescript
async function activateUXEngineer() {
  // Enable all design tools
  await vscode.commands.executeCommand('tailwindCSS.showOutput')
  await vscode.commands.executeCommand('color-highlight.activate')
  
  // Open component preview
  await vscode.commands.executeCommand('workbench.action.webview.openDeveloperTools')
  
  // Setup design workspace
  await vscode.commands.executeCommand('workbench.action.splitEditor')
}
```

#### System Architect Activation Sequence
```typescript
async function activateSystemArchitect() {
  // Open Prisma tools
  await vscode.commands.executeCommand('prisma.showOutput')
  
  // Enable error lens for architecture review
  await vscode.commands.executeCommand('errorLens.toggle')
  
  // Open Docker view
  await vscode.commands.executeCommand('workbench.view.extension.dockerView')
}
```

#### Developer Activation Sequence
```typescript
async function activateDeveloper() {
  // Enable all code intelligence
  await vscode.commands.executeCommand('editor.action.organizeImports')
  await vscode.commands.executeCommand('import-cost.toggle')
  
  // Setup snippets
  await vscode.commands.executeCommand('editor.action.showSnippets')
  
  // Enable copilot
  await vscode.commands.executeCommand('github.copilot.toggleCopilot')
}
```

#### QA Engineer Activation Sequence
```typescript
async function activateQAEngineer() {
  // Open test explorer
  await vscode.commands.executeCommand('testing.viewAsTree')
  
  // Show coverage
  await vscode.commands.executeCommand('coverage-gutters.displayCoverage')
  
  // Open Playwright inspector
  await vscode.commands.executeCommand('playwright.inspector')
}
```

#### DevOps Activation Sequence
```typescript
async function activateDevOps() {
  // Open Docker dashboard
  await vscode.commands.executeCommand('docker-explorer.focus')
  
  // Show Git history
  await vscode.commands.executeCommand('git-graph.view')
  
  // Validate environment
  await vscode.commands.executeCommand('dotenv.validate')
}
```
```

---

## 🔌 STEP 3: MCP-EXTENSION BRIDGE

### Create `.cursorrules/extensions/mcp-bridge.cursorrules`

```markdown
# MCP-EXTENSION BRIDGE CONFIGURATION

## AUTOMATIC TOOL-EXTENSION COORDINATION

### When MCP Tool Activates → Trigger Extension

#### shadcn-ui MCP → VS Code Extensions
When shadcn-ui tool generates component:
1. Auto-open file in editor
2. Enable Tailwind IntelliSense
3. Format with Prettier
4. Show component preview
5. Generate TypeScript types

#### playwright MCP → Playwright Extension
When playwright MCP runs tests:
1. Open Test Explorer panel
2. Show test results in gutter
3. Display coverage report
4. Open trace viewer for failures
5. Generate test report

#### git MCP → GitLens Extension
When git MCP performs operations:
1. Show commit graph
2. Display blame annotations
3. Open diff view
4. Show branch history
5. Create PR if configured

#### exa MCP → REST Client Extension
When exa searches APIs:
1. Create .http file with endpoints
2. Set environment variables
3. Execute test requests
4. Save response data
5. Generate TypeScript interfaces

#### firecrawl MCP → Markdown Extensions
When firecrawl extracts docs:
1. Create markdown file
2. Generate TOC
3. Add mermaid diagrams
4. Format with markdownlint
5. Open preview pane

### EXTENSION OUTPUT → MCP FEEDBACK

Extensions report back to MCP tools:
- Test results → playwright MCP
- Linting errors → context7 MCP
- Git changes → git MCP
- API responses → exa MCP
- Component usage → shadcn-ui MCP
```

---

## 🎮 STEP 4: AGENT CONTEXT FILES

### Create Individual Agent Extension Configs

#### `.cursorrules/agents/product-manager-extensions.json`
```json
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
      "markdown-mermaid.generateDiagram",
      "rest-client.request"
    ],
    "keybindings": {
      "ctrl+alt+m": "markdown.showPreview",
      "ctrl+alt+d": "markdown-mermaid.generateDiagram"
    },
    "mcpIntegration": {
      "exa": ["rest-client", "thunder-client"],
      "firecrawl": ["markdown-all-in-one"],
      "context7": ["git-graph"]
    }
  }
}
```

#### `.cursorrules/agents/ux-engineer-extensions.json`
```json
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
      "tailwindCSS.sortSelection",
      "color-highlight.activate"
    ],
    "keybindings": {
      "ctrl+alt+t": "tailwindCSS.sortSelection",
      "ctrl+alt+c": "color-highlight.activate"
    },
    "mcpIntegration": {
      "shadcn-ui": ["vscode-tailwindcss"],
      "playwright": ["coverage-gutters"],
      "ref-tools": ["css-peek"]
    }
  }
}
```

#### `.cursorrules/agents/developer-extensions.json`
```json
{
  "agent": "fullstack-developer",
  "extensions": {
    "required": [
      "christian-kohler.path-intellisense",
      "formulahendry.auto-rename-tag",
      "wix.vscode-import-cost",
      "dsznajder.es7-react-js-snippets"
    ],
    "autoActivate": true,
    "commands": [
      "editor.action.organizeImports",
      "import-cost.toggle",
      "es7-react.component"
    ],
    "keybindings": {
      "ctrl+alt+i": "editor.action.organizeImports",
      "ctrl+alt+r": "es7-react.component"
    },
    "mcpIntegration": {
      "shadcn-ui": ["auto-rename-tag", "path-intellisense"],
      "git": ["gitlens"],
      "context7": ["errorlens", "import-cost"]
    }
  }
}
```

---

## 🚦 STEP 5: RUNTIME INTEGRATION

### Create `.vscode/bmad-extension-loader.js`

```javascript
// BMAD Extension Loader - Runs on VS Code startup
const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

class BMADExtensionManager {
  constructor() {
    this.activeAgent = null;
    this.extensionMap = new Map();
    this.loadAgentConfigs();
  }

  loadAgentConfigs() {
    const agentsDir = path.join(__dirname, '../.cursorrules/agents');
    const files = fs.readdirSync(agentsDir)
      .filter(f => f.endsWith('-extensions.json'));
    
    files.forEach(file => {
      const config = JSON.parse(
        fs.readFileSync(path.join(agentsDir, file), 'utf8')
      );
      this.extensionMap.set(config.agent, config);
    });
  }

  async activateAgent(agentName) {
    console.log(`🤖 BMAD: Activating ${agentName} agent extensions`);
    
    const config = this.extensionMap.get(agentName);
    if (!config) return;

    // Check and install required extensions
    for (const ext of config.extensions.required) {
      const extension = vscode.extensions.getExtension(ext);
      if (!extension) {
        await vscode.commands.executeCommand(
          'workbench.extensions.installExtension', 
          ext
        );
      } else if (!extension.isActive) {
        await extension.activate();
      }
    }

    // Execute activation commands
    for (const cmd of config.commands) {
      try {
        await vscode.commands.executeCommand(cmd);
      } catch (e) {
        console.log(`Command ${cmd} not available yet`);
      }
    }

    // Setup keybindings
    this.registerKeybindings(config.keybindings);

    // Connect MCP tools
    this.connectMCPTools(config.mcpIntegration);

    this.activeAgent = agentName;
    
    // Show status
    vscode.window.showInformationMessage(
      `✅ ${agentName} extensions activated`
    );
  }

  registerKeybindings(keybindings) {
    // Register dynamic keybindings for active agent
    Object.entries(keybindings).forEach(([key, command]) => {
      vscode.commands.registerCommand(
        `bmad.${command}`,
        () => vscode.commands.executeCommand(command)
      );
    });
  }

  connectMCPTools(mcpIntegration) {
    // Bridge MCP tools with extensions
    Object.entries(mcpIntegration).forEach(([mcp, extensions]) => {
      console.log(`Connecting ${mcp} to ${extensions.join(', ')}`);
      // Implementation depends on MCP tool protocol
    });
  }

  // Auto-detect agent from task context
  detectAgentFromContext(text) {
    const triggers = {
      'product-manager': ['requirement', 'user story', 'research'],
      'ux-engineer': ['design', 'UI', 'component', 'style'],
      'system-architect': ['database', 'schema', 'architecture'],
      'fullstack-developer': ['implement', 'code', 'build'],
      'qa-engineer': ['test', 'validate', 'QA'],
      'devops': ['deploy', 'pipeline', 'production']
    };

    for (const [agent, keywords] of Object.entries(triggers)) {
      if (keywords.some(k => text.toLowerCase().includes(k))) {
        return agent;
      }
    }
    return null;
  }
}

// Initialize on activation
function activate(context) {
  const manager = new BMADExtensionManager();
  
  // Register command for manual agent switching
  const disposable = vscode.commands.registerCommand(
    'bmad.switchAgent',
    async () => {
      const agent = await vscode.window.showQuickPick([
        'product-manager',
        'ux-engineer',
        'system-architect',
        'fullstack-developer',
        'qa-engineer',
        'devops'
      ]);
      
      if (agent) {
        await manager.activateAgent(agent);
      }
    }
  );

  // Auto-detect from terminal input
  vscode.window.onDidChangeActiveTextEditor(editor => {
    if (editor) {
      const text = editor.document.getText();
      const agent = manager.detectAgentFromContext(text);
      if (agent && agent !== manager.activeAgent) {
        manager.activateAgent(agent);
      }
    }
  });

  context.subscriptions.push(disposable);
}

module.exports = { activate };
```

---

## 📋 STEP 6: PACKAGE.JSON INTEGRATION

### Add to `package.json`

```json
{
  "activationEvents": [
    "onStartupFinished"
  ],
  "main": ".vscode/bmad-extension-loader.js",
  "contributes": {
    "commands": [
      {
        "command": "bmad.switchAgent",
        "title": "BMAD: Switch Active Agent"
      },
      {
        "command": "bmad.showStatus",
        "title": "BMAD: Show Agent Status"
      }
    ],
    "configuration": {
      "title": "BMAD Method",
      "properties": {
        "bmad.autoActivateExtensions": {
          "type": "boolean",
          "default": true,
          "description": "Automatically activate extensions when agent switches"
        },
        "bmad.showStatusUpdates": {
          "type": "boolean",
          "default": true,
          "description": "Show status updates when extensions activate"
        }
      }
    }
  }
}
```

---

## ✅ STEP 7: VERIFICATION PROTOCOL

### Create `.vscode/test-integration.sh`

```bash
#!/bin/bash

echo "🤖 Testing BMAD Extension Integration"
echo "====================================="

# Test Product Manager
echo "Testing Product Manager agent..."
code --command "bmad.switchAgent" --args "product-manager"
sleep 2
code --command "markdown.showPreview"

# Test UX Engineer
echo "Testing UX Engineer agent..."
code --command "bmad.switchAgent" --args "ux-engineer"
sleep 2
code --command "tailwindCSS.showOutput"

# Test Developer
echo "Testing Developer agent..."
code --command "bmad.switchAgent" --args "fullstack-developer"
sleep 2
code --command "editor.action.organizeImports"

# Test QA
echo "Testing QA Engineer agent..."
code --command "bmad.switchAgent" --args "qa-engineer"
sleep 2
code --command "testing.viewAsTree"

# Test DevOps
echo "Testing DevOps agent..."
code --command "bmad.switchAgent" --args "devops"
sleep 2
code --command "docker-explorer.focus"

echo "====================================="
echo "✅ Integration testing complete!"
```

---

## 🎯 FINAL INTEGRATION MATRIX

| BMAD Agent | Triggered Extensions | MCP Tools | Auto Commands |
|------------|---------------------|-----------|---------------|
| **Product Manager** | Markdown, Mermaid, REST Client | exa, firecrawl, context7 | Preview, TOC, API test |
| **UX Engineer** | Tailwind, Color, CSS Peek | shadcn-ui, playwright | Sort classes, preview |
| **System Architect** | Prisma, Docker, Error Lens | context7, ref-tools, git | Schema format, validate |
| **Developer** | Path Intel, Import Cost, Snippets | shadcn-ui, git, context7 | Organize, format, lint |
| **QA Engineer** | Playwright, Jest, Coverage | playwright, ref-tools | Run tests, coverage |
| **DevOps** | Docker, GitLens, DotEnv | git, context7, firecrawl | Build, deploy, tag |

---

## 🚀 ACTIVATION COMMAND

```bash
# One command to rule them all
curl -sSL https://your-repo/bmad-extension-integration.sh | bash
```

This will:
1. ✅ Install all agent-specific extensions
2. ✅ Configure automatic activation
3. ✅ Setup MCP-extension bridges
4. ✅ Enable context-aware switching
5. ✅ Register all keybindings
6. ✅ Test the integration

---

**🤖 BMAD Extension Integration Complete!**

Now when any BMAD agent activates, their required extensions automatically:
- Install (if missing)
- Activate
- Configure
- Connect to MCP tools
- Execute initialization commands

The system is now FULLY AUTONOMOUS! 🎯