# 🔑 Google Search Console API Setup Guide

## 📋 What You Need

To enable automated SEO tracking, you need Google Search Console API credentials. This is **100% FREE** from Google.

---

## ⏱️ Quick Setup (15 Minutes Total)

### Step 1: Verify Website in Google Search Console (5 min)

1. **Go to:** https://search.google.com/search-console

2. **Click:** "Add Property"

3. **Enter:** `https://gangrunprinting.com`

4. **Verify Ownership** (choose one method):

   **Option A: DNS Verification (Recommended)**

   ```
   Add this TXT record to your domain DNS:
   google-site-verification=abc123xyz...

   (Google will provide the exact code)
   ```

   **Option B: HTML File Upload**

   ```
   Download: googleXXXXXXXX.html
   Upload to: /public/googleXXXXXXXX.html
   ```

   **Option C: HTML Meta Tag**

   ```html
   <!-- Add to <head> of homepage -->
   <meta name="google-site-verification" content="..." />
   ```

5. **Click:** "Verify"

✅ **Success:** You should see "Ownership verified"

---

### Step 2: Create Google Cloud Project (3 min)

1. **Go to:** https://console.cloud.google.com/

2. **Click:** "Select a project" → "NEW PROJECT"

3. **Project name:** `GangRun SEO Tracking`

4. **Click:** "Create"

5. **Wait:** ~30 seconds for project to be created

---

### Step 3: Enable Google Search Console API (2 min)

1. **Go to:** https://console.cloud.google.com/apis/library

2. **Search:** "Google Search Console API"

3. **Click:** "Google Search Console API"

4. **Click:** "ENABLE"

5. **Wait:** ~10 seconds

✅ **Success:** You should see "API enabled"

---

### Step 4: Create OAuth 2.0 Credentials (5 min)

1. **Go to:** https://console.cloud.google.com/apis/credentials

2. **Click:** "CREATE CREDENTIALS" → "OAuth client ID"

3. **If prompted** to configure consent screen:

   ```
   User Type: External
   App name: GangRun SEO Tracking
   User support email: iradwatkins@gmail.com
   Developer contact: iradwatkins@gmail.com

   Click: SAVE AND CONTINUE (3 times)
   Click: BACK TO DASHBOARD
   ```

4. **Application type:** Select "Desktop app"

5. **Name:** `GangRun SEO Desktop Client`

6. **Click:** "CREATE"

7. **Download JSON:**
   - Click "DOWNLOAD JSON"
   - Save as `google-credentials.json`

8. **Copy Client ID and Client Secret:**
   ```
   Client ID: 123456789-abc.apps.googleusercontent.com
   Client Secret: GOCSPX-abc123xyz789
   ```

---

### Step 5: Get Refresh Token (Using OAuth Playground)

**Method 1: OAuth Playground (Easiest)**

1. **Go to:** https://developers.google.com/oauthplayground

2. **Click:** Settings icon (⚙️) in top right

3. **Check:** "Use your own OAuth credentials"

4. **Enter:**

   ```
   OAuth Client ID: [Your Client ID from Step 4]
   OAuth Client Secret: [Your Client Secret from Step 4]
   ```

5. **Close** settings panel

6. **In left sidebar**, find and select:

   ```
   Google Search Console API v1
   → https://www.googleapis.com/auth/webmasters.readonly
   ```

7. **Click:** "Authorize APIs"

8. **Sign in** with your Google account (iradwatkins@gmail.com)

9. **Click:** "Allow"

10. **Click:** "Exchange authorization code for tokens"

11. **Copy the Refresh Token:**
    ```
    Refresh token: 1//0abc123xyz...
    ```

✅ **Save this!** You'll need it in Step 6

---

### Step 6: Add Credentials to .env File

1. **Open:** `/root/websites/gangrunprinting/.env`

2. **Add these lines:**

   ```bash
   # Google Search Console API
   GOOGLE_SEARCH_CONSOLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
   GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET=GOCSPX-abc123xyz789
   GOOGLE_SEARCH_CONSOLE_REFRESH_TOKEN=1//0abc123xyz...

   # Admin email for SEO alerts
   ADMIN_EMAIL=iradwatkins@gmail.com
   ```

3. **Save** the file

---

### Step 7: Test the Integration

```bash
# Test if credentials work
npx tsx scripts/test-gsc-connection.ts
```

**Expected output:**

```
✅ Google Search Console connected successfully!
📊 Found 45 keywords for gangrunprinting.com
📈 Top keywords:
   - "postcard printing" (position: 12, clicks: 89)
   - "custom postcards" (position: 5, clicks: 145)
   - "business card printing" (position: 18, clicks: 67)
```

---

### Step 8: Run First SEO Check

```bash
# Run manual check
npx tsx scripts/daily-seo-check.ts
```

**Expected output:**

```
🔍 Starting daily SEO health check...
📊 Tracking SEO metrics for all products...
✅ 4x6 Postcards: 12 keywords, 2 alerts
✅ Business Cards: 8 keywords, 1 alert
📋 Generating daily report...
📊 Report Summary:
   - Critical issues: 1
   - High priority: 2
   - Improvements: 3
📧 Sending alert email...
✅ Alert email sent to iradwatkins@gmail.com
✨ Daily SEO check complete!
```

---

### Step 9: Set Up Daily Automation

```bash
# Open crontab
crontab -e

# Add this line (runs at 3am daily)
0 3 * * * cd /root/websites/gangrunprinting && npx tsx scripts/daily-seo-check.ts

# Save and exit
```

**Verify cron job:**

```bash
crontab -l
```

✅ **Success:** You should see the line you just added

---

## 📧 What You'll Receive

### Daily Email (if issues found):

**Subject:** 🚨 SEO CRITICAL: 2 issues need immediate attention

**Content:**

```
📊 Daily SEO Health Report
Friday, October 10, 2025

Critical Issues: 2
High Priority: 3
Improvements: 5

🔴 Action Required

📦 Business Cards
🔴 CRITICAL: Keyword "business card printing" dropped from #5 to #12.
             Update meta description, add related keywords, improve content quality.
🟡 HIGH: Add long-tail variations of "custom business cards" to content and meta tags.

✅ Good News
📈 Postcards: Great! "postcard printing" improved from #15 to #8. Keep current content strategy.

[View Full SEO Dashboard]
```

---

## 🐛 Troubleshooting

### Error: "Invalid credentials"

```bash
# Check .env file
cat .env | grep GOOGLE_SEARCH_CONSOLE

# Should show all 3 variables with values
```

**Fix:** Make sure you copied the credentials correctly from Step 4 and 5

---

### Error: "API not enabled"

```bash
# Go back to Step 3 and enable the API
```

---

### Error: "Refresh token expired"

```bash
# Go back to Step 5 and generate a new refresh token
# Update .env with the new token
```

---

### Error: "Site not verified"

```bash
# Go back to Step 1 and verify ownership
# Make sure gangrunprinting.com is verified
```

---

## 📊 What Gets Tracked

For each product page, the system tracks:

1. **Keywords:** All search terms people use to find your page
2. **Position:** Google ranking (#1-100)
3. **Clicks:** How many people clicked on your listing
4. **Impressions:** How many times your listing appeared
5. **CTR:** Click-through rate (clicks ÷ impressions)

**Alerts are sent when:**

- ⚠️ Ranking drops 3+ positions
- ⚠️ Traffic drops 50%+
- ⚠️ CTR drops 25%+
- ✅ Ranking improves 3+ positions (good news!)

---

## 🎯 Expected Results

### After 7 Days:

- ✅ Daily email reports
- ✅ Tracking 40-60 keywords per product
- ✅ Baseline metrics established

### After 30 Days:

- ✅ Trend analysis working
- ✅ Action recommendations accurate
- ✅ See which changes improved rankings

### After 90 Days:

- ✅ Clear SEO patterns identified
- ✅ Know which keywords to focus on
- ✅ Understand what content works

---

## 💰 Cost

**Total Cost:** $0/month (FREE forever)

**What's Free:**

- ✅ Google Search Console API (unlimited)
- ✅ OAuth credentials (unlimited)
- ✅ Data storage in your database (no extra cost)
- ✅ Email alerts via Resend (5,000/month free tier)

---

## 🆘 Need Help?

**Issue:** Can't verify website ownership
**Solution:** Use DNS verification - most reliable method

**Issue:** Don't see OAuth playground option
**Solution:** Use this direct link: https://developers.google.com/oauthplayground

**Issue:** Getting rate limit errors
**Solution:** The script waits 1 second between products - this is normal and stays within Google's limits

**Issue:** Want to test without waiting for 3am cron
**Solution:** Run manually: `npx tsx scripts/daily-seo-check.ts`

---

## ✅ Verification Checklist

Before going live, verify:

- [ ] Website verified in Google Search Console
- [ ] Google Cloud project created
- [ ] Search Console API enabled
- [ ] OAuth credentials created
- [ ] Refresh token generated
- [ ] All 3 credentials in .env file
- [ ] Test script runs successfully
- [ ] Daily cron job added
- [ ] Received first email alert

---

## 🚀 Next Steps

Once setup is complete:

1. **Wait 24 hours** for first baseline data
2. **Check admin dashboard:** https://gangrunprinting.com/admin/seo/performance
3. **Review daily email** at 6am (script runs at 3am, email arrives ~3:05am)
4. **Take action** on critical alerts within 24 hours
5. **Monitor trends** weekly to see what's working

---

**Setup complete?** Run this to verify everything works:

```bash
npx tsx scripts/daily-seo-check.ts && echo "✅ SEO tracking is live!"
```
