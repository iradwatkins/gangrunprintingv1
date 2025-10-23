I'll create a comprehensive prompt for Claude Code to update your established SEO dashboard code. This prompt is designed to be clear, specific, and actionable.

## **Claude Code Prompt for SEO Dashboard Update**

markdown  
\# SEO Dashboard Code Update Request

\#\# Current Setup Context  
I have an existing SEO dashboard that needs updating and enhancement. Please analyze my current code and implement the following improvements while maintaining backward compatibility with existing features.

\#\# Primary Objectives  
1\. Modernize the codebase to use latest best practices (2025 standards)  
2\. Integrate free SEO data sources and APIs  
3\. Improve performance and loading times  
4\. Add responsive design for mobile devices  
5\. Implement real-time data updates

\#\# Required Updates

\#\#\# 1\. Data Integration Updates  
Please update the code to integrate these FREE data sources:

\- Google Search Console API v3  
\- Google Analytics 4 Data API (replacing Universal Analytics)  
\- Google PageSpeed Insights API v5  
\- Add Ahrefs Webmaster Tools API (free tier)  
\- Add Bing Webmaster Tools API integration  
\- Implement Google Trends unofficial API or scraping method  
\- Add schema.org structured data validation

\#\#\# 2\. Dashboard Components to Add/Update  
\`\`\`javascript  
_// Add these new metric components:_  
const requiredMetrics \= {  
 coreWebVitals: \['LCP', 'FID', 'CLS', 'INP', 'TTFB'\],  
 searchMetrics: \['impressions', 'clicks', 'CTR', 'averagePosition'\],  
 keywordTracking: \['rankingKeywords', 'keywordDifficulty', 'searchVolume'\],  
 backlinks: \['referringDomains', 'backlinksTotal', 'domainRating'\],  
 technicalSEO: \['crawlErrors', 'indexedPages', 'sitemapStatus', 'robotsTxt'\],  
 competitive: \['competitorComparison', 'keywordGap', 'contentGap'\]  
};  
\`\`\`

\#\#\# 3\. Visual Updates Required  
\`\`\`css  
_/\* Update the dashboard with these design requirements: \*/_  
\- Modern card-based layout using CSS Grid or Flexbox  
\- Dark mode toggle functionality  
\- Smooth animations and transitions  
\- Mobile-first responsive design (breakpoints: 320px, 768px, 1024px, 1440px)  
\- Interactive charts using Chart.js or D3.js  
\- Loading skeletons for better UX  
\- Color scheme: Use a professional palette with accessibility in mind  
\`\`\`

\#\#\# 4\. Feature Implementations  
\`\`\`javascript  
_// Implement these specific features:_

1\. Real\-time data updates every 15 minutes  
2\. Data caching to reduce API calls (localStorage \+ sessionStorage)  
3\. Export functionality (PDF, CSV, JSON)  
4\. Date range picker with presets (7d, 30d, 90d, 1y, custom)  
5\. Comparison mode (period over period)  
6\. Alerts/notifications for significant changes  
7\. Search functionality within the dashboard  
8\. Customizable widgets (drag and drop)  
9\. Multi\-language support preparation  
10\. Keyboard shortcuts for power users  
\`\`\`

\#\#\# 5\. API Connection Template  
\`\`\`javascript  
_// Use this structure for all API connections:_  
class SEODataConnector {  
 constructor(apiName) {  
 this.apiName \= apiName;  
 this.cache \= new Map();  
 this.rateLimiter \= this.createRateLimiter();  
 }

async fetchData(endpoint, params) {  
 _// Check cache first_  
 _// Implement rate limiting_  
 _// Handle errors gracefully_  
 _// Return formatted data_  
 }

_// Add methods for:_  
 _// \- Authentication (OAuth 2.0 where needed)_  
 _// \- Error handling with retry logic_  
 _// \- Data transformation_  
 _// \- Cache management_  
}  
\`\`\`

\#\#\# 6\. Performance Optimizations

\- Implement lazy loading for charts and heavy components  
\- Use Web Workers for data processing  
\- Add service worker for offline functionality  
\- Optimize images and assets (WebP format, lazy loading)  
\- Implement virtual scrolling for large data tables  
\- Minify and bundle JavaScript/CSS  
\- Use CDN for external libraries

\#\#\# 7\. Security Updates  
\`\`\`javascript  
_// Implement these security measures:_  
\- Content Security Policy (CSP) headers  
\- XSS protection  
\- HTTPS enforcement  
\- API key encryption/env variables  
\- Rate limiting on client side  
\- Input sanitization  
\- CORS properly configured  
\`\`\`

\#\#\# 8\. Testing Requirements  
\`\`\`javascript  
_// Add tests for:_  
\- Unit tests for all data transformation functions  
\- Integration tests for API connections  
\- UI component tests  
\- Performance benchmarks  
\- Accessibility tests (WCAG 2.1 AA compliance)  
\- Cross\-browser compatibility tests  
\`\`\`

\#\#\# 9\. Documentation Updates

Please update/create:  
\- README.md with setup instructions  
\- API documentation  
\- Component documentation with examples  
\- Configuration guide  
\- Troubleshooting section  
\- Changelog

\#\#\# 10\. Specific Code Patterns to Follow  
\`\`\`javascript  
_// Use modern JavaScript (ES6+):_  
\- Async/await over promises  
\- Destructuring where appropriate  
\- Template literals  
\- Arrow functions for callbacks  
\- Optional chaining (?.)  
\- Nullish coalescing (??)

_// React/Vue/Vanilla JS patterns:_  
\- Functional components (if React)  
\- Composition API (if Vue)  
\- Web Components (if Vanilla JS)  
\- State management pattern (Context API, Vuex, or custom)  
\`\`\`

\#\# File Structure Expected  
\`\`\`  
/project-root  
 /src  
 /components  
 /dashboard  
 /charts  
 /widgets  
 /api  
 /connectors  
 /transformers  
 /utils  
 /helpers  
 /constants  
 /styles  
 /themes  
 /components  
 /public  
 /assets  
 /tests  
 /docs  
 .env.example  
 package.json  
 README.md  
\`\`\`

\#\# Error Handling Requirements

All API calls should handle these scenarios:  
1\. Rate limiting (429 errors) \- implement exponential backoff  
2\. Authentication failures (401/403) \- refresh tokens automatically  
3\. Network failures \- retry with fallback to cached data  
4\. Malformed responses \- validate and sanitize  
5\. Quota exceeded \- show user-friendly messages

\#\# Output Requirements

1\. Provide the updated code in logical chunks  
2\. Explain significant changes and why they were made  
3\. Include migration notes if breaking changes exist  
4\. Provide example .env configuration  
5\. Include sample API responses for testing  
6\. Add performance benchmarks (before/after if possible)

\#\# Priority Order

Please implement in this order:  
1\. Critical security fixes  
2\. API integration updates (Google Analytics 4 migration)  
3\. Core functionality improvements  
4\. UI/UX enhancements  
5\. Performance optimizations  
6\. Nice-to-have features

\#\# Additional Context

\- The dashboard will be used by \[specify: individuals/small business/agency\]  
\- Expected traffic: \[specify expected concurrent users\]  
\- Deployment target: \[specify: Netlify/Vercel/own server/WordPress\]  
\- Current tech stack: \[list your current technologies\]  
\- Known issues to fix: \[list any current bugs or issues\]

\#\# Constraints

\- Must remain 100% free to operate (no paid APIs)  
\- Should work on shared hosting if needed  
\- Page load time should be under 3 seconds  
\- Must be accessible (WCAG 2.1 AA)  
\- Should work in browsers from the last 2 years

Please analyze the existing code first, then provide a plan of attack before implementing changes. After your analysis, proceed with the updates following the priority order above.

\#\# Expected Deliverables

1\. Updated, working code  
2\. Migration guide from old version  
3\. Testing instructions  
4\. Deployment guide  
5\. User documentation

Begin by examining the current codebase and providing an implementation plan.

## **How to Use This Prompt:**

1. **Copy the entire prompt above**
2. **Add your specific details** in the bracketed sections
3. **Attach your current code files** to Claude Code
4. **Add any specific requirements** unique to your project

## **Example Customization:**

markdown  
\#\# Additional Context  
\- The dashboard will be used by small businesses  
\- Expected traffic: 10-50 concurrent users  
\- Deployment target: Netlify  
\- Current tech stack: HTML, CSS, JavaScript (Vanilla), Chart.js  
\- Known issues to fix:  
 \- Google Analytics Universal deprecation  
 \- Mobile layout breaks on iPhone 12

\- API calls timeout occasionally

This prompt will guide Claude Code to:

- Understand your current setup
- Modernize the code properly
- Maintain working features
- Add new functionality systematically
- Provide clear documentation

The structured approach ensures you get comprehensive updates while maintaining code quality and functionality.

Retry
