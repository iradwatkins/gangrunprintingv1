# ✅ Ahrefs Web Analytics + Bing Webmaster Tools Setup

**Date:** October 19, 2025
**Status:** 🔄 IN PROGRESS

---

## ✅ **STEP 1: Ahrefs Web Analytics - INSTALLED**

### **What Was Added:**

```html
<script
  src="https://analytics.ahrefs.com/analytics.js"
  data-key="xmoVXl4/lDVkojG39HWDvQ"
  async
></script>
```

**Location:** `/src/app/layout.tsx` (added to `<head>`)

**What Ahrefs Tracks:**

- ✅ Backlink referral traffic
- ✅ LLM (ChatGPT, Claude, etc.) traffic
- ✅ Search engine traffic
- ✅ Direct traffic
- ✅ Social media referrals
- ✅ All page views and sessions

**Ahrefs Dashboard:**
👉 https://analytics.ahrefs.com/

**Your Site Key:** `xmoVXl4/lDVkojG39HWDvQ`

---

## 🔄 **STEP 2: Bing Webmaster Tools - NEEDS VERIFICATION**

### **What You Need to Do:**

1. **Go to Bing Webmaster Tools:**
   👉 https://www.bing.com/webmasters

2. **Sign in** with Microsoft account

3. **Add your site:**
   - Click "Add a site"
   - Enter: `https://gangrunprinting.com`
   - Click "Add"

4. **Choose Verification Method:**

   **Option A: XML File (Easiest)**
   - Download the `BingSiteAuth.xml` file
   - Upload to `/public/BingSiteAuth.xml` in your project
   - Deploy to production
   - Click "Verify" in Bing

   **Option B: Meta Tag**
   - Copy the meta tag from Bing
   - Add to `layout.tsx` in `<head>` section
   - Deploy to production
   - Click "Verify"

   **Option C: DNS (Advanced)**
   - Add CNAME record to your DNS
   - Wait for propagation
   - Click "Verify"

5. **After Verification:**
   - Submit sitemap: `https://gangrunprinting.com/sitemap.xml`
   - Wait 24-48 hours for Bing to crawl your site

---

## 📊 **STEP 3: Deploy Changes**

### **Deploy Ahrefs Tracking Code:**

```bash
# SSH to server
ssh root@72.60.28.175

# Navigate to project
cd /root/websites/gangrunprinting

# Pull latest code (includes Ahrefs tracking)
git pull origin main

# Rebuild and restart
npm run build
docker-compose restart app

# Verify deployment
docker logs --tail=20 gangrunprinting_app
```

### **Verify Ahrefs Installation:**

1. Visit: https://gangrunprinting.com
2. Open browser DevTools (F12)
3. Go to "Network" tab
4. Refresh page
5. Look for request to `analytics.ahrefs.com/analytics.js`
6. ✅ If you see it, Ahrefs is installed!

**Or check in Ahrefs dashboard:**
👉 https://analytics.ahrefs.com/

- Should show "Installation detected" after a few minutes

---

## 📈 **STEP 4: What Data You'll See**

### **Ahrefs Web Analytics Dashboard:**

**Traffic Sources:**

- Direct traffic
- Organic search (Google, Bing, etc.)
- Referral traffic (backlinks)
- Social media traffic
- **LLM traffic** (ChatGPT, Claude, Perplexity, etc.) 🤖

**Page Analytics:**

- Top pages by views
- Entry pages
- Exit pages
- Page performance

**Visitor Analytics:**

- New vs returning visitors
- Geographic data
- Device types
- Browser data

**Unique Ahrefs Features:**

- LLM/AI bot traffic tracking
- Backlink referral sources
- Search engine breakdown
- Real-time visitor count

### **Bing Webmaster Tools Dashboard:**

**Search Performance:**

- Bing search impressions
- Bing search clicks
- Average position in Bing
- Click-through rate (CTR)

**SEO Reports:**

- Crawl errors
- Index coverage
- Mobile-friendliness
- Page speed (Bing's version)

**Backlinks:**

- Inbound links from Bing's index
- Link quality analysis
- Anchor text data

---

## 🎯 **Expected Traffic Breakdown:**

Based on typical US traffic distribution:

| Source             | % of Traffic | Tool to Track            |
| ------------------ | ------------ | ------------------------ |
| Google Search      | 85-90%       | Google Search Console ✅ |
| Bing Search        | 3-5%         | Bing Webmaster Tools 🔄  |
| Direct             | 5-8%         | GA4 + Ahrefs ✅          |
| Referral/Backlinks | 2-4%         | Ahrefs ✅                |
| Social Media       | 1-2%         | GA4 + Ahrefs ✅          |
| LLM/AI Bots        | <1%          | Ahrefs only ✅           |

---

## 🔧 **Troubleshooting**

### **Ahrefs Not Showing Data:**

1. **Check installation:**

   ```bash
   curl -s https://gangrunprinting.com | grep "analytics.ahrefs.com"
   ```

   Should return the script tag.

2. **Wait 15-30 minutes:**
   - Ahrefs needs time to start collecting data
   - First data appears within 30 minutes

3. **Check browser console:**
   - Visit your site
   - F12 → Console tab
   - Look for Ahrefs errors

### **Bing Webmaster Tools Verification Failed:**

1. **XML File method:**
   - Make sure file is accessible: `https://gangrunprinting.com/BingSiteAuth.xml`
   - File must be in `/public/` folder

2. **Meta tag method:**
   - View page source: `Ctrl+U`
   - Search for "msvalidate"
   - Tag must be in `<head>` section

3. **DNS method:**
   - Check DNS propagation: https://dnschecker.org
   - Wait 24-48 hours after adding CNAME

---

## 📚 **Dashboard Links**

### **Your Analytics Dashboards:**

1. **Google Search Console:**
   👉 https://search.google.com/search-console

2. **Google Analytics 4:**
   👉 https://analytics.google.com
   Property ID: G-YLYGZLTTM1

3. **Ahrefs Web Analytics:**
   👉 https://analytics.ahrefs.com/
   Site Key: xmoVXl4/lDVkojG39HWDvQ

4. **Bing Webmaster Tools:**
   👉 https://www.bing.com/webmasters

5. **Your SEO Dashboard:**
   👉 https://gangrunprinting.com/admin/seo/performance

---

## ✅ **Final Checklist**

**Immediate Actions:**

- [x] Ahrefs tracking code added to `layout.tsx`
- [ ] Deploy changes to production (`git pull && npm run build && docker-compose restart app`)
- [ ] Verify Ahrefs installation (check browser DevTools)
- [ ] Go to Bing Webmaster Tools and verify domain
- [ ] Submit sitemap to Bing: `https://gangrunprinting.com/sitemap.xml`

**Wait 24-48 Hours:**

- [ ] Check Ahrefs dashboard for first data
- [ ] Check Bing Webmaster Tools for crawl status
- [ ] Verify LLM traffic appears in Ahrefs

**Weekly Monitoring:**

- [ ] Review Ahrefs for backlink traffic sources
- [ ] Check Bing search performance (if traffic exists)
- [ ] Monitor LLM bot traffic trends

---

## 🎉 **What You'll Gain:**

**From Ahrefs:**

- 📊 See which backlinks drive actual traffic
- 🤖 Track ChatGPT and AI bot visits
- 🔍 Identify high-value referral sources
- 📈 Monitor traffic quality by source

**From Bing:**

- 🔎 Capture 3-5% additional search traffic visibility
- 📊 Diversify SEO data (not just Google)
- 🛠️ Get Bing-specific optimization insights
- 📈 Track Bing keyword rankings

---

## 💰 **Cost: Still $0.00**

Both services are 100% free:

- ✅ Ahrefs Web Analytics: Free forever
- ✅ Bing Webmaster Tools: Free forever

No credit card required, no hidden fees!

---

**Next Steps:**

1. Deploy the code changes (Ahrefs is already in code)
2. Verify Bing Webmaster Tools domain
3. Wait 24-48 hours for data to populate
4. Check your new analytics dashboards!

---

**Document Version:** 1.0
**Date:** October 19, 2025
**Status:** Ahrefs ✅ Installed | Bing 🔄 Needs Verification
