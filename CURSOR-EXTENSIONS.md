# Cursor IDE Extensions Guide

## 🚀 Quick Install - Essential Extensions

Open Cursor and install these **TOP 15 MUST-HAVE** extensions:

### 1. **Core Development** (Install First)
```
ext install dbaeumer.vscode-eslint
ext install esbenp.prettier-vscode
ext install bradlc.vscode-tailwindcss
ext install prisma.prisma
```

### 2. **AI & Productivity** (Works with MCP)
```
ext install github.copilot
ext install github.copilot-chat
ext install Continue.continue
ext install Codeium.codeium
```

### 3. **Git & Version Control**
```
ext install eamodio.gitlens
ext install github.vscode-pull-request-github
```

### 4. **React/Next.js Development**
```
ext install dsznajder.es7-react-js-snippets
ext install pulkitgangwar.nextjs-snippets
```

### 5. **Cloudflare Integration**
```
ext install cloudflare.cloudflare-workers-vscode
```

## 📦 Installation Methods

### Method 1: Command Palette (Recommended)
1. Open Cursor
2. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
3. Type "Extensions: Install Extensions"
4. Search for each extension name

### Method 2: Extensions Panel
1. Click the Extensions icon in the sidebar (or press `Cmd+Shift+X`)
2. Search for extension names
3. Click "Install"

### Method 3: Batch Install via Terminal
```bash
# Install all recommended extensions at once
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension bradlc.vscode-tailwindcss
code --install-extension prisma.prisma
code --install-extension github.copilot
code --install-extension github.copilot-chat
code --install-extension eamodio.gitlens
code --install-extension dsznajder.es7-react-js-snippets
code --install-extension pulkitgangwar.nextjs-snippets
code --install-extension cloudflare.cloudflare-workers-vscode
code --install-extension Continue.continue
code --install-extension usernamehw.errorlens
code --install-extension gruntfuggly.todo-tree
code --install-extension christian-kohler.path-intellisense
code --install-extension PKief.material-icon-theme
```

## 🎯 Extension Categories & Purpose

### **Essential for Your Project**
| Extension | Purpose | Why You Need It |
|-----------|---------|-----------------|
| ESLint | Code quality | Catches errors before runtime |
| Prettier | Code formatting | Consistent code style |
| Tailwind CSS | CSS utilities | IntelliSense for Tailwind classes |
| Prisma | Database ORM | Schema validation & auto-complete |
| GitLens | Git superpowers | See code history inline |

### **AI Assistants** (Work alongside MCP)
| Extension | Purpose | Features |
|-----------|---------|----------|
| GitHub Copilot | AI code completion | Paid, most powerful |
| Codeium | Free AI autocomplete | Good free alternative |
| Continue | AI chat assistant | Works with local models |

### **Cloudflare Specific**
| Extension | Purpose | Features |
|-----------|---------|----------|
| Cloudflare Workers | Workers development | Syntax highlighting, deployment |

### **Productivity Boosters**
| Extension | Purpose | Shortcut |
|-----------|---------|----------|
| Error Lens | Inline errors | Shows errors right in code |
| TODO Tree | Task tracking | Collects all TODOs |
| Path Intellisense | Path autocomplete | Auto-completes file paths |
| Turbo Console Log | Quick logging | `Ctrl+Alt+L` to add console.log |

### **Testing & Quality**
| Extension | Purpose | Integration |
|-----------|---------|-------------|
| Jest | Unit testing | Works with your test files |
| Playwright | E2E testing | Integrates with MCP puppeteer |
| SonarLint | Code quality | Real-time security analysis |
| Snyk | Security scanning | Vulnerability detection |

### **Database & API**
| Extension | Purpose | Features |
|-----------|---------|----------|
| Thunder Client | API testing | Like Postman in Cursor |
| SQLTools | Database management | Query PostgreSQL directly |

### **Themes & Appearance**
| Extension | Purpose | Activation |
|-----------|---------|------------|
| Material Icon Theme | File icons | Auto-activates |
| One Dark Pro | Dark theme | `Cmd+K Cmd+T` to select |
| Night Owl | Eye-friendly theme | Great for long sessions |

## ⚙️ Extension Settings

Add these to your Cursor settings (`Cmd+,`):

```json
{
  // Prettier
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  
  // ESLint
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  
  // GitLens
  "gitlens.hovers.currentLine.over": "line",
  "gitlens.codeLens.enabled": false,
  
  // Error Lens
  "errorLens.enabledDiagnosticLevels": ["error", "warning"],
  
  // GitHub Copilot
  "github.copilot.enable": {
    "*": true,
    "yaml": true,
    "plaintext": true,
    "markdown": true
  },
  
  // Material Icon Theme
  "workbench.iconTheme": "material-icon-theme",
  
  // Tailwind CSS
  "tailwindCSS.includeLanguages": {
    "typescript": "javascript",
    "typescriptreact": "javascript"
  }
}
```

## 🔌 MCP Integration with Extensions

These extensions work especially well with your MCP setup:

1. **GitHub Pull Request** - Uses your GitHub MCP token
2. **Cloudflare Workers** - Integrates with Cloudflare MCP
3. **Thunder Client** - Test APIs managed by MCP
4. **Playwright** - Works with puppeteer MCP for testing

## 🚨 Troubleshooting

### Extension Not Working?
1. Restart Cursor: `Cmd+Q` and reopen
2. Reload Window: `Cmd+R` or `Ctrl+R`
3. Check Output: View → Output → Select extension

### Conflicts?
- Disable conflicting extensions (like Beautify if using Prettier)
- Check unwantedRecommendations in `.vscode/extensions.json`

### Performance Issues?
- Disable unused extensions
- Use workspace recommendations only
- Consider lighter alternatives

## 📝 Quick Commands

| Action | Shortcut |
|--------|----------|
| Install Extension | `Cmd+Shift+P` → "ext install" |
| Disable Extension | `Cmd+Shift+P` → "disable" |
| Show Installed | `Cmd+Shift+X` |
| Update All | Click "Update All" in Extensions panel |

## 🎯 Project-Specific Recommendations

For **GangRun Printing**, prioritize:
1. ✅ Tailwind CSS (for styling)
2. ✅ Prisma (for database)
3. ✅ ESLint/Prettier (code quality)
4. ✅ GitLens (version control)
5. ✅ Cloudflare Workers (deployment)
6. ✅ Error Lens (debugging)
7. ✅ TODO Tree (task management)

## 💡 Pro Tips

1. **Use Workspace Recommendations**: Team members will see recommended extensions when opening the project
2. **Sync Settings**: Use Settings Sync to share configs across machines
3. **Extension Packs**: Some extensions come in packs for easier installation
4. **Regular Updates**: Update extensions weekly for latest features
5. **Keyboard Shortcuts**: Learn shortcuts for frequently used extensions

---

**To install all recommended extensions**, open this folder in Cursor and you'll see a notification to install recommended extensions!