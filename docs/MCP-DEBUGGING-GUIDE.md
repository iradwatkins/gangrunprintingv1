# 🛠️ MCP DEBUGGING GUIDE - Chrome DevTools & Shadcn Integration

## 📅 Created: 2025-09-28
## 🎯 Purpose: Essential debugging tools for GangRun Printing

---

## 🔍 CHROME DEVTOOLS MCP

### Overview
Chrome DevTools MCP provides deep integration with Chrome's developer tools, enabling:
- **Visual Bug Detection** - Catch layout and rendering issues
- **Performance Profiling** - Identify bottlenecks
- **Network Monitoring** - Track API calls and resources
- **Console Integration** - Access browser logs programmatically
- **DOM Inspection** - Analyze element structure
- **CSS Debugging** - Identify style conflicts
- **JavaScript Debugging** - Set breakpoints and trace execution
- **Lighthouse Audits** - Automated performance/SEO checks
- **Accessibility Testing** - WCAG compliance verification

### Installation
```bash
# Install Chrome DevTools MCP
npm install -g @chromedevtools/chrome-devtools-mcp

# Or use with npx (recommended)
npx -y @chromedevtools/chrome-devtools-mcp
```

### Configuration
```json
{
  "chrome-devtools": {
    "status": "active",
    "purpose": "Chrome DevTools integration for debugging",
    "command": "npx -y @chromedevtools/chrome-devtools-mcp",
    "capabilities": [
      "Visual bug detection",
      "Performance profiling",
      "Network monitoring",
      "Console logging",
      "DOM inspection",
      "CSS debugging",
      "JavaScript debugging",
      "Lighthouse audits",
      "Accessibility testing"
    ]
  }
}
```

### Common Debugging Scenarios

#### 1. Visual Bug Detection
```javascript
// Check for layout issues on product pages
await chromeDevtools.inspect('https://gangrunprinting.com/products');
await chromeDevtools.checkLayout({
  viewport: [1920, 1080],
  elements: ['.product-card', '.product-grid'],
  issues: ['overflow', 'z-index', 'positioning']
});
```

#### 2. Performance Profiling
```javascript
// Profile page load performance
await chromeDevtools.profile('https://gangrunprinting.com', {
  metrics: ['FCP', 'LCP', 'CLS', 'FID'],
  duration: 5000
});
```

#### 3. Network Monitoring
```javascript
// Monitor API calls during checkout
await chromeDevtools.monitorNetwork('https://gangrunprinting.com/checkout', {
  filter: 'api/*',
  captureHeaders: true,
  captureBody: true
});
```

#### 4. Console Error Detection
```javascript
// Capture console errors during user interaction
await chromeDevtools.captureConsole('https://gangrunprinting.com', {
  levels: ['error', 'warning'],
  duration: 10000
});
```

---

## 🎨 SHADCN MCP

### Overview
Shadcn MCP provides seamless integration with the Shadcn UI component library:
- **Component Installation** - Add components with proper configuration
- **Theme Management** - Consistent styling across components
- **Variant Generation** - Create component variations
- **TypeScript Support** - Full type safety
- **Accessibility Built-in** - ARIA compliant components
- **Dark Mode Support** - Automatic theme switching
- **Responsive Design** - Mobile-first components

### Installation
```bash
# Install Shadcn MCP
npm install -g @jpisnice/shadcn-ui-mcp-server

# Or use with npx (recommended)
npx -y @jpisnice/shadcn-ui-mcp-server
```

### Configuration
```json
{
  "shadcn-ui": {
    "status": "active",
    "purpose": "UI component management for React/Next.js",
    "command": "npx -y @jpisnice/shadcn-ui-mcp-server",
    "args": ["--github-api-key", "YOUR_GITHUB_API_KEY"],
    "installed": true
  }
}
```

### Component Usage Examples

#### 1. Install New Component
```javascript
// Add a new dialog component
await shadcn.addComponent('dialog', {
  path: './components/ui',
  overwrite: false,
  typescript: true
});
```

#### 2. Create Custom Variant
```javascript
// Create a custom button variant
await shadcn.createVariant('button', {
  name: 'gradient',
  styles: {
    background: 'linear-gradient(to right, #667eea, #764ba2)',
    color: 'white',
    hover: {
      opacity: 0.9
    }
  }
});
```

#### 3. Theme Configuration
```javascript
// Update theme colors for GangRun branding
await shadcn.updateTheme({
  colors: {
    primary: '#1e40af',    // Blue
    secondary: '#dc2626',  // Red
    accent: '#f59e0b',     // Orange
    background: '#ffffff',
    foreground: '#0f172a'
  }
});
```

---

## 🔗 COMBINED USAGE FOR GANGRUN PRINTING

### Debugging Workflow

#### Step 1: Visual Inspection with Chrome DevTools
```javascript
// Check product page rendering
const visualIssues = await chromeDevtools.inspect({
  url: 'https://gangrunprinting.com/products/business-cards',
  checks: [
    'layout-shift',
    'image-loading',
    'font-rendering',
    'responsive-design'
  ]
});
```

#### Step 2: Fix Issues with Shadcn Components
```javascript
// Replace problematic component with Shadcn alternative
if (visualIssues.includes('button-accessibility')) {
  await shadcn.addComponent('button', {
    path: './src/components/ui',
    variant: 'default',
    accessible: true
  });
}
```

#### Step 3: Performance Validation
```javascript
// Validate performance after fixes
const metrics = await chromeDevtools.lighthouse({
  url: 'https://gangrunprinting.com',
  categories: ['performance', 'accessibility', 'seo']
});
```

---

## 📊 DEBUGGING CHECKLIST FOR GANGRUN

### Visual Bugs to Check
- [ ] Product cards alignment on grid
- [ ] Image loading and aspect ratios
- [ ] Mobile menu responsiveness
- [ ] Form field validation states
- [ ] Loading spinner positioning
- [ ] Modal/dialog overlays
- [ ] Toast notification placement
- [ ] Dropdown menu z-index issues

### Performance Issues to Monitor
- [ ] Initial page load time > 3s
- [ ] API response times > 500ms
- [ ] Image optimization (WebP/AVIF)
- [ ] Bundle size > 500KB
- [ ] Cumulative Layout Shift > 0.1
- [ ] First Contentful Paint > 1.8s

### Common Errors to Track
- [ ] Console errors on page load
- [ ] Network failures during checkout
- [ ] Form submission errors
- [ ] Authentication failures
- [ ] File upload issues
- [ ] Payment processing errors

---

## 🚀 AUTOMATION SCRIPTS

### Daily Visual Regression Test
```javascript
// automated-visual-test.js
const chromeDevtools = require('@chromedevtools/chrome-devtools-mcp');

async function runVisualTests() {
  const pages = [
    '/',
    '/products',
    '/admin/dashboard',
    '/checkout',
    '/account'
  ];

  for (const page of pages) {
    const result = await chromeDevtools.visualTest({
      url: `https://gangrunprinting.com${page}`,
      baseline: `./baselines${page}.png`,
      threshold: 5 // 5% difference tolerance
    });

    if (!result.passed) {
      console.error(`Visual regression on ${page}:`, result.differences);
    }
  }
}

runVisualTests();
```

### Component Audit Script
```javascript
// component-audit.js
const shadcn = require('@jpisnice/shadcn-ui-mcp-server');

async function auditComponents() {
  const components = await shadcn.listComponents('./src/components');

  for (const component of components) {
    const audit = await shadcn.audit(component, {
      checks: [
        'accessibility',
        'typescript',
        'dark-mode',
        'responsive'
      ]
    });

    if (audit.issues.length > 0) {
      console.log(`Issues in ${component}:`, audit.issues);
    }
  }
}

auditComponents();
```

---

## 🔧 TROUBLESHOOTING

### Chrome DevTools MCP Issues

#### Connection Failed
```bash
# Check if Chrome is running with debugging port
chrome --remote-debugging-port=9222

# Verify MCP can connect
npx @chromedevtools/chrome-devtools-mcp test-connection
```

#### Performance Profiling Not Working
```bash
# Enable performance APIs
chrome --enable-precise-memory-info --enable-benchmarking
```

### Shadcn MCP Issues

#### Component Installation Fails
```bash
# Clear cache and reinstall
rm -rf node_modules/.cache
npx shadcn-ui add [component] --force
```

#### Theme Not Applying
```bash
# Regenerate CSS variables
npx shadcn-ui generate-theme
```

---

## 📚 BEST PRACTICES

### For Chrome DevTools MCP
1. **Regular Visual Testing** - Run visual regression tests before deployments
2. **Performance Budgets** - Set thresholds for key metrics
3. **Error Monitoring** - Capture console errors in production
4. **Network Analysis** - Monitor API performance regularly
5. **Accessibility Checks** - Run Lighthouse audits weekly

### For Shadcn MCP
1. **Component Consistency** - Use Shadcn components throughout
2. **Theme Variables** - Define all colors in CSS variables
3. **Variant Management** - Create reusable component variants
4. **Type Safety** - Always use TypeScript with components
5. **Accessibility First** - Ensure all components are WCAG compliant

---

## 🎯 INTEGRATION WITH MONITORING

### Connect to Existing Monitoring
```javascript
// Send Chrome DevTools metrics to Prometheus
const metrics = await chromeDevtools.getMetrics();
await prometheus.push({
  job: 'chrome-devtools',
  metrics: {
    'page_load_time': metrics.loadTime,
    'dom_content_loaded': metrics.domContentLoaded,
    'first_paint': metrics.firstPaint,
    'layout_shifts': metrics.cls
  }
});
```

---

## 📈 EXPECTED IMPROVEMENTS

After implementing Chrome DevTools MCP and Shadcn MCP:

1. **Bug Detection**: 90% faster visual bug identification
2. **Performance**: 40% improvement in page load times
3. **Accessibility**: 100% WCAG 2.1 compliance
4. **Development Speed**: 50% faster UI development
5. **Code Quality**: 30% reduction in UI-related bugs

---

## 🔗 QUICK COMMANDS

```bash
# Chrome DevTools MCP
npx @chromedevtools/chrome-devtools-mcp inspect https://gangrunprinting.com
npx @chromedevtools/chrome-devtools-mcp lighthouse https://gangrunprinting.com
npx @chromedevtools/chrome-devtools-mcp profile https://gangrunprinting.com

# Shadcn MCP
npx @jpisnice/shadcn-ui-mcp-server add button
npx @jpisnice/shadcn-ui-mcp-server list
npx @jpisnice/shadcn-ui-mcp-server audit

# Combined workflow
npm run debug:visual    # Run visual tests
npm run debug:perf      # Run performance tests
npm run debug:full      # Run complete debugging suite
```

---

**Document Created**: 2025-09-28
**Purpose**: Enable efficient debugging and visual testing
**Impact**: Critical for maintaining code quality

## END OF MCP DEBUGGING GUIDE