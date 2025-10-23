# Crawler Management Strategy - GangRun Printing

**Date:** October 19, 2025
**Platform:** Cloudflare AI Crawl Control
**Current Status:** All crawlers showing 0 requests (past 24 hours)

---

## 🎯 Your Current Situation

**What You're Seeing:**

- 26 AI crawlers detected by Cloudflare
- ALL showing 0 requests in past 24 hours
- All currently set to "Allowed" (default)

**Why 0 Requests:**

1. **Recent Setup** - Ahrefs tracking just added today, may take 24-48 hours for bots to discover changes
2. **Robots.txt Settings** - May be blocking some crawlers (need to verify)
3. **Timing** - Crawlers don't visit every day, especially for new/smaller sites
4. **Sitemap Submission** - Need to submit sitemaps to all major search engines

---

## ✅ ALLOW List (Critical for SEO & Discovery)

### **MUST ALLOW - Search Engines (Priority 1)**

| Crawler           | Company    | Why Allow                                  | SEO Impact   |
| ----------------- | ---------- | ------------------------------------------ | ------------ |
| **Googlebot**     | Google     | #1 search engine globally                  | 🔴 CRITICAL  |
| **BingBot**       | Microsoft  | #2 search engine, powers ChatGPT search    | 🔴 CRITICAL  |
| **DuckAssistBot** | DuckDuckGo | Privacy-focused search, growing market     | 🟡 IMPORTANT |
| **Applebot**      | Apple      | Powers Siri, Spotlight, Safari suggestions | 🟡 IMPORTANT |

**Action:** ✅ Keep these ALLOWED (already correct)

---

### **RECOMMENDED ALLOW - AI Training & Discovery (Priority 2)**

These AI crawlers can drive traffic and brand visibility in AI search results:

| Crawler                  | Company    | Purpose                            | Recommendation                    |
| ------------------------ | ---------- | ---------------------------------- | --------------------------------- |
| **ChatGPT-User**         | OpenAI     | User-requested content for ChatGPT | ✅ **ALLOW** - Drives traffic     |
| **OAI-SearchBot**        | OpenAI     | SearchGPT indexing                 | ✅ **ALLOW** - Future SEO         |
| **PerplexityBot**        | Perplexity | AI search engine indexing          | ✅ **ALLOW** - Growing platform   |
| **Perplexity-User**      | Perplexity | User-requested content             | ✅ **ALLOW** - Drives traffic     |
| **ClaudeBot**            | Anthropic  | Claude AI training (indexing)      | ✅ **ALLOW** - AI visibility      |
| **Claude-SearchBot**     | Anthropic  | Claude search features             | ✅ **ALLOW** - Future traffic     |
| **Claude-User**          | Anthropic  | User-requested content             | ✅ **ALLOW** - Drives traffic     |
| **Meta-ExternalAgent**   | Meta       | Meta AI training                   | ✅ **ALLOW** - Meta AI visibility |
| **Meta-ExternalFetcher** | Meta       | Meta platforms content             | ✅ **ALLOW** - Social reach       |

**Why Allow AI Crawlers:**

- AI search is growing rapidly (Perplexity, ChatGPT Search, Claude)
- Being indexed = appearing in AI-generated answers
- Drives qualified traffic when AI cites your content
- Free brand exposure in AI platforms

---

### **RECOMMENDED ALLOW - Archival & Research (Priority 3)**

| Crawler             | Purpose                            | Recommendation                                         |
| ------------------- | ---------------------------------- | ------------------------------------------------------ |
| **archive.org_bot** | Internet Archive (Wayback Machine) | ✅ **ALLOW** - Historical record, good for SEO signals |
| **CCBot**           | Common Crawl (research dataset)    | ✅ **ALLOW** - Used by researchers, builds authority   |

---

## 🚫 CONSIDER BLOCKING (Resource Management)

### **High Resource / Low Value Crawlers**

| Crawler         | Company            | Why Consider Blocking                                | Decision                 |
| --------------- | ------------------ | ---------------------------------------------------- | ------------------------ |
| **GPTBot**      | OpenAI             | Training-only (not search), high resource use        | ⚠️ **Your Choice**       |
| **Bytespider**  | ByteDance (TikTok) | Training-only, very aggressive                       | 🔴 **BLOCK** recommended |
| **FacebookBot** | Meta               | Facebook link previews (overlaps with Meta-External) | ⚠️ **Your Choice**       |
| **PetalBot**    | Huawei             | Low visibility outside China                         | ⚠️ **Your Choice**       |
| **Amazonbot**   | Amazon             | Alexa training, limited traffic value                | ⚠️ **Your Choice**       |

### **Newer/Experimental Crawlers**

| Crawler                   | Company    | Status                              | Recommendation                 |
| ------------------------- | ---------- | ----------------------------------- | ------------------------------ |
| **Timpibot**              | Timpi      | New search engine, limited adoption | ⚠️ Monitor, allow for now      |
| **ProRataInc**            | ProRata.ai | AI startup, unknown benefit         | ⚠️ Monitor, allow for now      |
| **Novellum AI Crawl**     | Novellum   | AI startup, unknown benefit         | ⚠️ Monitor, allow for now      |
| **MistralAI-User**        | Mistral    | AI model training/requests          | ✅ Allow - growing AI platform |
| **Google-CloudVertexBot** | Google     | Google Cloud AI services            | ✅ Allow - Google ecosystem    |
| **DuckAssistBot**         | DuckDuckGo | Privacy-focused AI assistant        | ✅ Allow - privacy users       |
| **Anchor Browser**        | Anchor     | Unknown browser, low adoption       | ⚠️ Monitor, allow for now      |

---

## 🎯 Recommended Configuration (Start Here)

### **Phase 1: Maximum Discovery (Current - Next 30 Days)**

**Goal:** Let all major crawlers index your site

```
✅ ALLOW: All search engines (Googlebot, BingBot, DuckAssist, Applebot)
✅ ALLOW: All AI search crawlers (ChatGPT, Claude, Perplexity, Meta)
✅ ALLOW: Archive & research (archive.org, CCBot)
✅ ALLOW: New AI platforms (Mistral, Google Vertex, etc.)
🚫 BLOCK: Bytespider (aggressive, low value)
⚠️  MONITOR: All others for resource usage
```

**Why:** You want to be discovered by AI platforms NOW while AI search is exploding. This is a critical window.

---

### **Phase 2: Optimize Based on Data (After 30 Days)**

**Goal:** Keep high-value crawlers, block resource drains

**Decision Framework:**

1. Check Cloudflare metrics (30 days from now)
2. Identify crawlers with:
   - High requests (>100/day)
   - Low referral traffic (check GA4)
   - High bandwidth usage
3. Block low-value, high-resource crawlers

**Example Decision Tree:**

```
GPTBot (OpenAI training-only):
├─ If >500 requests/day → Check bandwidth usage
│  ├─ High bandwidth → BLOCK (training, not search)
│  └─ Low bandwidth → ALLOW (minimal cost)
└─ If <100 requests/day → ALLOW (not worth blocking)
```

---

## 📊 How to Track "Which Crawler Finds You Most"

### **Method 1: Cloudflare AI Crawl Control (What You Just Showed)**

**Dashboard:** https://dash.cloudflare.com/ → Security → Bots → AI Crawl Control

**Metrics Available:**

- Total requests per crawler (past 24 hours, 7 days, 30 days)
- Robots.txt violations
- Allowed vs unsuccessful requests
- Trending crawlers

**How to Use:**

1. Check dashboard weekly
2. Filter by date range (7 days, 30 days)
3. Sort by "Requests" column to see top crawlers
4. Export data for trend analysis

---

### **Method 2: Ahrefs Web Analytics (LLM Traffic Only)**

**Dashboard:** https://analytics.ahrefs.com/

**What It Shows:**

- Visits from AI bots (ChatGPT, Claude, Perplexity, etc.)
- Pageviews per bot
- Top pages visited by bots
- Bot traffic trends

**Setup:** ✅ Already installed (today)
**First Data:** Available 15-30 minutes after installation
**Unique Value:** ONLY platform tracking LLM bot referral traffic (not just crawling)

---

### **Method 3: Google Search Console (Googlebot Only)**

**Dashboard:** https://search.google.com/search-console

**Navigate To:** Settings → Crawl Stats

**Metrics:**

- Total crawl requests (daily)
- Kilobytes downloaded per day
- Download time per page
- Crawl by response code (200, 404, etc.)
- Crawl by file type (HTML, CSS, JS, images)

**Why Useful:** Shows Googlebot's crawl budget allocation across your site

---

### **Method 4: Server Logs (Most Detailed, Requires Setup)**

**If you have SSH access to your server:**

```bash
# Analyze nginx logs for bot traffic
cat /var/log/nginx/access.log | grep -E 'Googlebot|ClaudeBot|ChatGPT|PerplexityBot' | awk '{print $1}' | sort | uniq -c | sort -rn

# Count requests by bot
grep 'Googlebot' /var/log/nginx/access.log | wc -l
grep 'ClaudeBot' /var/log/nginx/access.log | wc -l
grep 'ChatGPT' /var/log/nginx/access.log | wc -l
```

**Why Useful:** Raw data, no filtering, 100% accurate

---

## 🚀 Immediate Action Plan (Next 48 Hours)

### **Step 1: Verify Robots.txt (Critical)**

**Check your current robots.txt:**

```bash
curl https://gangrunprinting.com/robots.txt
```

**Recommended robots.txt for Maximum Discovery:**

```txt
# Allow all major search engines
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Applebot
Allow: /

User-agent: DuckAssistBot
Allow: /

# Allow AI search crawlers (recommended for visibility)
User-agent: ChatGPT-User
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: OAI-SearchBot
Allow: /

# Block aggressive training bots
User-agent: Bytespider
Disallow: /

User-agent: GPTBot
Disallow: /

# Allow archival
User-agent: archive.org_bot
Allow: /

User-agent: CCBot
Allow: /

# Default: Allow all others
User-agent: *
Allow: /
Crawl-delay: 10

# Sitemaps
Sitemap: https://gangrunprinting.com/sitemap.xml
Sitemap: https://gangrunprinting.com/sitemap-0.xml
```

**Why This Works:**

- Explicitly allows high-value crawlers
- Blocks known resource-heavy bots (Bytespider)
- Adds crawl delay for unknown bots (prevents abuse)
- Lists all sitemaps for easy discovery

---

### **Step 2: Submit Sitemaps to All Search Engines**

**Google Search Console:**

1. Go to: https://search.google.com/search-console
2. Select property: gangrunprinting.com
3. Sitemaps → Add new sitemap → `https://gangrunprinting.com/sitemap.xml`
4. Submit

**Bing Webmaster Tools:**

1. Go to: https://www.bing.com/webmasters
2. Add/verify site: gangrunprinting.com
3. Sitemaps → Submit sitemap → `https://gangrunprinting.com/sitemap.xml`
4. Submit

**Result:** Googlebot and BingBot will start crawling within 24-48 hours

---

### **Step 3: Block Bytespider in Cloudflare (Now)**

**Why:** Bytespider (TikTok/ByteDance) is known for aggressive crawling with minimal SEO benefit

**How:**

1. Cloudflare Dashboard → Security → Bots → AI Crawl Control
2. Find "Bytespider" in the list
3. Click "Block" action
4. Save

**Expected Result:** Reduces server load, no SEO impact

---

### **Step 4: Monitor Crawler Activity (Weekly)**

**Weekly Checklist:**

- [ ] Check Cloudflare AI Crawl Control (sort by requests)
- [ ] Check Ahrefs Web Analytics (LLM bot traffic)
- [ ] Check Google Search Console (crawl stats)
- [ ] Check Bing Webmaster Tools (crawl stats)
- [ ] Review top crawlers and decide if any need blocking

**Create a spreadsheet to track trends:**

| Week   | Googlebot Requests | ClaudeBot | ChatGPT | Perplexity | Notes           |
| ------ | ------------------ | --------- | ------- | ---------- | --------------- |
| Oct 19 | 0                  | 0         | 0       | 0          | Initial setup   |
| Oct 26 | TBD                | TBD       | TBD     | TBD        | First week data |

---

## 💡 Pro Tips

### **1. Why 0 Requests Right Now is Normal**

- Crawlers don't visit every day
- Newer sites get crawled less frequently
- Takes 24-48 hours after sitemap submission
- AI crawlers prioritize high-authority sites initially

### **2. How to Accelerate Discovery**

- ✅ Submit sitemaps (Google, Bing) - DONE TODAY
- ✅ Install Ahrefs tracking - DONE TODAY
- ⏳ Verify Bing Webmaster Tools - PENDING
- ⏳ Create high-quality content that AI tools would cite
- ⏳ Build backlinks from high-authority sites
- ⏳ Share content on social media (triggers social crawlers)

### **3. The "AI Search SEO" Strategy**

**Goal:** Appear in AI-generated answers (ChatGPT, Claude, Perplexity)

**How:**

1. Allow all AI search crawlers (ChatGPT-User, ClaudeBot, PerplexityBot)
2. Create content that answers specific questions (FAQ format)
3. Use structured data (schema.org markup) - makes parsing easier
4. Create authoritative, cited content (AI prefers sources with references)
5. Monitor which pages AI bots visit most (Ahrefs Analytics)
6. Double down on content AI bots love

**Example:**
If Ahrefs shows ClaudeBot visiting your "Business Card Printing FAQ" page 50x/month:
→ That page is being used to train Claude
→ Claude may cite your site when users ask about business cards
→ Create MORE FAQ-style content on related topics

---

## 📋 Decision Matrix: Block or Allow?

Use this framework for any crawler:

```
START: New crawler detected
│
├─ Is it a major search engine? (Google, Bing, Apple, DuckDuckGo)
│  └─ YES → ✅ ALWAYS ALLOW
│
├─ Is it an AI search crawler? (ChatGPT, Claude, Perplexity)
│  └─ YES → ✅ ALLOW (drives AI search visibility)
│
├─ Is it archival/research? (archive.org, CCBot)
│  └─ YES → ✅ ALLOW (SEO authority signals)
│
├─ Is it aggressive/known bad? (Bytespider)
│  └─ YES → 🚫 BLOCK
│
└─ Unknown/New crawler?
   ├─ Check requests/day (Cloudflare)
   │  ├─ >1000/day → Monitor closely, consider blocking if no traffic
   │  └─ <100/day → Allow, minimal impact
   │
   ├─ Check bandwidth usage
   │  ├─ High (>1GB/day) → Investigate further
   │  └─ Low (<100MB/day) → Allow
   │
   └─ Check referral traffic (GA4)
      ├─ Drives traffic → ✅ ALLOW
      └─ No traffic after 30 days → Consider blocking
```

---

## 🎯 Expected Timeline

### **Week 1 (Oct 19-26)**

- Googlebot: 50-200 requests (after sitemap submission)
- BingBot: 20-100 requests
- AI crawlers: 0-10 requests (low priority for new sites)
- Archive.org: 0-5 requests

### **Week 4 (Nov 9-16)**

- Googlebot: 200-500 requests (regular crawling established)
- BingBot: 100-300 requests
- AI crawlers: 10-50 requests (starting to index)
- Perplexity/ChatGPT: First referral traffic may appear

### **Month 3 (Jan 2026)**

- Established crawl patterns for all major bots
- AI search referrals growing
- Can make informed block/allow decisions based on data

---

## 📊 Success Metrics

**Track these monthly:**

1. **Crawler Diversity** (Cloudflare)
   - Goal: 10+ unique crawlers visiting regularly
   - Indicates broad search engine visibility

2. **AI Bot Referral Traffic** (Ahrefs)
   - Goal: 50+ visits/month from AI bots by Month 3
   - Indicates AI search presence

3. **Crawl Budget Efficiency** (GSC)
   - Goal: <3 second average crawl time per page
   - Indicates healthy site performance

4. **Indexed Pages** (GSC)
   - Goal: 90%+ of submitted pages indexed
   - Indicates Google finds your content valuable

---

## 🚨 When to Block a Crawler

**Red Flags:**

- ✅ >1000 requests/day with 0 referral traffic
- ✅ Ignoring robots.txt rules
- ✅ Causing server performance issues
- ✅ Known malicious bot (check Cloudflare threat database)
- ✅ Excessive bandwidth usage (>5GB/day) with no benefit

**How to Block:**

1. Cloudflare AI Crawl Control → Click "Block"
2. Add to robots.txt: `User-agent: [BotName] | Disallow: /`
3. Monitor for 7 days to ensure no negative impacts

---

## 📚 Additional Resources

**Cloudflare Docs:**

- AI Crawl Control: https://developers.cloudflare.com/bots/ai-crawl-control/

**Search Engine Guidelines:**

- Google crawling: https://developers.google.com/search/docs/crawling-indexing/overview-google-crawlers
- Bing crawling: https://www.bing.com/webmasters/help/which-crawlers-does-bing-use-8c184ec0

**AI Crawler Documentation:**

- OpenAI GPTBot: https://platform.openai.com/docs/gptbot
- Anthropic ClaudeBot: https://www.anthropic.com/bot
- Perplexity: https://docs.perplexity.ai/docs/perplexitybot

---

## ✅ Summary: Your Immediate Actions

**Today (October 19, 2025):**

1. ✅ Verify robots.txt allows major crawlers (see Step 1)
2. ✅ Submit sitemap to Google Search Console
3. ✅ Verify Bing Webmaster Tools (meta tag already added)
4. ✅ Submit sitemap to Bing Webmaster Tools
5. 🚫 Block Bytespider in Cloudflare (see Step 3)

**This Week:**

1. Monitor Cloudflare AI Crawl Control daily
2. Check Ahrefs Analytics for first LLM bot visits
3. Verify Googlebot starts crawling (should see activity within 48 hours)

**Next 30 Days:**

1. Allow all major AI crawlers (current strategy)
2. Collect data on crawler behavior
3. Review weekly and block any obvious resource drains
4. Track which crawlers drive referral traffic

**After 30 Days:**

1. Analyze crawler data
2. Make informed block/allow decisions
3. Optimize crawl budget allocation
4. Double down on content AI bots love

---

**Questions?** Review the Decision Matrix above or check the Troubleshooting section in the main SEO Analytics documentation.
