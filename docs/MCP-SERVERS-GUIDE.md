# MCP Servers Guide - BMad Agents

## 📋 Overview

This document provides complete information about all configured MCP (Model Context Protocol) servers available for BMad agents and Claude Code.

**Last Updated:** October 11, 2025
**Configuration File:** `/root/.config/claude-code/claude_desktop_config.json`

---

## ✅ Configured MCP Servers (7 Total)

### 1. **Chrome DevTools MCP**

- **Purpose:** Browser automation and debugging
- **Command:** `node /root/.claude-code/mcp-servers/chrome-devtools-mcp/build/src/index.js`
- **Status:** ✅ Path verified, ready to use
- **Use Cases:**
  - Automated browser testing
  - DOM inspection
  - Performance profiling
  - Network request monitoring

### 2. **Puppeteer MCP**

- **Purpose:** Headless browser automation
- **Package:** `@modelcontextprotocol/server-puppeteer` v2025.5.12
- **Status:** ✅ Package verified, ready to use
- **Use Cases:**
  - E2E testing
  - Web scraping
  - Screenshot generation
  - PDF generation from web pages

### 3. **shadcn-ui MCP**

- **Purpose:** Component library integration
- **Package:** `@jpisnice/shadcn-ui-mcp-server` v1.1.0
- **GitHub API Key:** Configured
- **Status:** ✅ Currently active
- **Use Cases:**
  - Search shadcn components
  - View component examples
  - Get installation commands
  - Access component documentation

### 4. **Firecrawl MCP**

- **Purpose:** Web scraping and crawling
- **Package:** `firecrawl-mcp` v3.4.0
- **API Key:** `fc-b8dceff8862b4da482614bcf0ff001d6`
- **Status:** ✅ Package verified, ready to use
- **Use Cases:**
  - Scrape competitor websites
  - Extract structured data from web pages
  - Monitor website changes
  - Gather market research data

### 5. **Exa.ai MCP**

- **Purpose:** AI-powered semantic search
- **Package:** `exa-mcp` v0.0.7
- **API Key:** `b85913a0-1aeb-4dcd-b21a-a83b9ec61ffd`
- **Status:** ✅ Package verified, ready to use
- **Use Cases:**
  - Semantic web search
  - Find similar content
  - Research and competitive analysis
  - Content discovery

### 6. **Context7 MCP**

- **Purpose:** Code context management and understanding
- **Package:** `@upstash/context7-mcp` v1.0.21
- **API Key:** `ctx7sk-33595c98-41f5-4adf-a9d9-72ce02dd03ce`
- **Status:** ✅ Package verified, ready to use
- **Use Cases:**
  - Codebase understanding
  - Semantic code search
  - Documentation generation
  - Code context analysis

### 7. **Ref Tools MCP**

- **Purpose:** Reference and documentation tools
- **Package:** `@taika-st/ref-tools-mcp-optimized` v1.0.0
- **API Key:** `ref-d366725e1d328f5b4270`
- **Status:** ✅ Package verified, ready to use
- **Use Cases:**
  - API documentation lookup
  - Technical reference management
  - Code examples and snippets
  - Best practices lookup

---

## 🔄 How to Activate MCPs

### Current Status

- **Active MCPs:** shadcn-ui, ide (built-in)
- **Configured but Inactive:** chrome-devtools, puppeteer, firecrawl, exa, context7, ref

### Why Some MCPs Aren't Active

MCPs are loaded when Claude Code starts. If you add new MCPs or modify the configuration, you must restart Claude Code for changes to take effect.

### Activation Steps

1. **Save all work in current Claude Code session**

2. **Close Claude Code completely:**

   ```bash
   # Exit the current session
   # Use Ctrl+D or type 'exit' if in terminal mode
   ```

3. **Restart Claude Code:**

   ```bash
   # Launch Claude Code again
   claude-code
   ```

4. **Verify MCPs loaded:**
   - Check available tools in Claude Code
   - Look for tools from each MCP server
   - Test a simple command from each server

---

## 🧪 Verification Commands

### Check MCP Configuration

```bash
# Validate JSON syntax
cat /root/.config/claude-code/claude_desktop_config.json | python3 -m json.tool

# View configured MCPs
cat /root/.config/claude-code/claude_desktop_config.json | grep -A 5 "mcpServers"
```

### Verify Package Versions

```bash
# Check all MCP packages
npm view @modelcontextprotocol/server-puppeteer version
npm view @jpisnice/shadcn-ui-mcp-server version
npm view firecrawl-mcp version
npm view exa-mcp version
npm view @upstash/context7-mcp version
npm view @taika-st/ref-tools-mcp-optimized version
```

### Test Chrome DevTools Path

```bash
# Verify chrome-devtools installation
ls -la /root/.claude-code/mcp-servers/chrome-devtools-mcp/build/src/index.js
```

---

## 📝 Usage Examples for BMad Agents

### For QA Agent (Testing)

```
Use Puppeteer MCP to:
- Run E2E tests on GangRun Printing checkout flow
- Take screenshots at each step
- Verify form validation
- Test payment integration
```

### For Analyst Agent (Research)

```
Use Exa.ai MCP to:
- Research competitor pricing strategies
- Find industry best practices
- Discover trending print products
- Analyze market positioning
```

### For Dev Agent (Development)

```
Use Context7 MCP to:
- Understand existing codebase architecture
- Find similar code patterns
- Generate documentation
- Analyze code dependencies
```

### For UX Expert (Design)

```
Use shadcn-ui MCP to:
- Search for UI components
- View component examples
- Get installation commands
- Access design patterns
```

### For SM Agent (Content/SEO)

```
Use Firecrawl MCP to:
- Scrape competitor meta tags
- Extract structured data
- Monitor ranking changes
- Gather content ideas
```

---

## 🚨 Troubleshooting

### Problem: MCP Not Available After Restart

**Solution:**

1. Check configuration syntax: `python3 -m json.tool < config.json`
2. Verify package exists on npm
3. Check API keys are correct
4. Review Claude Code logs for errors

### Problem: API Key Invalid

**Solution:**

1. Verify API key hasn't expired
2. Check API key format (no extra spaces)
3. Test API key with direct API call
4. Regenerate key from service provider

### Problem: Chrome DevTools Path Not Found

**Solution:**

1. Reinstall chrome-devtools-mcp:
   ```bash
   cd /root/.claude-code/mcp-servers
   git clone https://github.com/[repo]/chrome-devtools-mcp
   cd chrome-devtools-mcp
   npm install
   npm run build
   ```

---

## 🔐 Security Notes

### API Key Management

- All API keys stored in configuration file
- Configuration file permissions: `chmod 600`
- Never commit API keys to git repositories
- Rotate keys periodically

### Safe API Keys Storage

```bash
# Secure the config file
chmod 600 /root/.config/claude-code/claude_desktop_config.json

# Verify permissions
ls -la /root/.config/claude-code/claude_desktop_config.json
```

---

## 📚 Additional Resources

### Official Documentation

- [MCP Protocol Specification](https://modelcontextprotocol.io/)
- [Claude Code Documentation](https://docs.claude.com/)
- [BMad Methodology](./BMAD-EXECUTION-REPORT-2025-10-10.md)

### Package Documentation

- [Puppeteer MCP](https://github.com/modelcontextprotocol/servers/tree/main/src/puppeteer)
- [Firecrawl](https://firecrawl.dev/)
- [Exa.ai](https://exa.ai/)
- [Context7](https://upstash.com/context7)
- [shadcn-ui](https://ui.shadcn.com/)

---

## 🎯 BMad Integration

### Using MCPs in BMad Workflow

**1. Planning Phase (PM Agent):**

- Use Context7 to understand existing code
- Use Exa.ai for competitive research

**2. Design Phase (Architect):**

- Use shadcn-ui for component selection
- Use Firecrawl for design inspiration

**3. Development Phase (Dev Agent):**

- Use Context7 for codebase navigation
- Use Chrome DevTools for debugging

**4. Testing Phase (QA Agent):**

- Use Puppeteer for E2E testing
- Use Chrome DevTools for performance testing

**5. Deployment Phase (All Agents):**

- Verify all MCPs working before deploy
- Document any new MCP usage
- Update this guide with learnings

---

## ✅ Configuration Validation Checklist

Before using MCPs with BMad agents:

- [ ] All 7 MCPs configured in `claude_desktop_config.json`
- [ ] JSON syntax validated (no errors)
- [ ] All npm packages verified (correct versions)
- [ ] Chrome DevTools path exists
- [ ] API keys are valid and not expired
- [ ] Configuration file permissions secure (600)
- [ ] Claude Code restarted after configuration changes
- [ ] Each MCP tested with simple command
- [ ] BMad agents documented MCP capabilities
- [ ] This guide updated with any changes

---

**Maintained by:** BMad Orchestrator
**Contact:** iradwatkins@gmail.com
**Last Verification:** October 11, 2025
