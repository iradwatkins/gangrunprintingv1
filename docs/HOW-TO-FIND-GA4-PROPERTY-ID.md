# How to Find Your Google Analytics 4 Property ID

## Quick Steps:

1. **Go to Google Analytics**
   - Visit: https://analytics.google.com
   - Sign in with your Google account

2. **Check if you have GA4 setup**
   - Look at the bottom left corner
   - You should see property name with a small icon
   - GA4 properties show as "GA4" or have a flame icon 🔥

3. **Find the Property ID**
   
   **Method 1: Property Settings**
   - Click **Admin** (gear icon, bottom left)
   - Under "Property" column, click **Property Settings**
   - Look for **Property ID**: `G-XXXXXXXXXX`
   - Copy this ID

   **Method 2: Data Streams**
   - Click **Admin** → **Data Streams**
   - Click on your web stream (usually shows your domain)
   - Look for **Measurement ID**: `G-XXXXXXXXXX`
   - This is the same as Property ID

4. **Verify it's GA4**
   - Property ID should start with `G-`
   - If you only see numbers (like `505254829`), that's Universal Analytics (old version)
   - If you see `UA-XXXXXX`, that's also Universal Analytics

## What if I only have Universal Analytics?

**Option 1: Create a GA4 Property (Recommended)**
1. In Google Analytics, click **Admin**
2. Under "Property" column, click **Create Property**
3. Follow the setup wizard
4. Choose "Web" for platform
5. Add your website: `https://gangrunprinting.com`
6. Complete setup
7. Copy the new **G-XXXXXXXXXX** Property ID

**Option 2: Use GA4 Setup Assistant (If available)**
1. In Admin → Property column
2. Look for "GA4 Setup Assistant"
3. Click "Get Started"
4. Follow the prompts to create a GA4 property
5. This will create GA4 alongside your existing Universal Analytics

## Common Issues:

**I see multiple properties:**
- Choose the one for gangrunprinting.com
- Make sure it's GA4 (has `G-` prefix)

**I don't see Property Settings:**
- Make sure you're in the "Property" column (middle column in Admin)
- You need Editor or Administrator role

**Property ID doesn't start with G-:**
- You're looking at Universal Analytics (old)
- Create a new GA4 property (see above)

## After Getting Property ID:

1. Copy the Property ID (format: `G-XXXXXXXXXX`)
2. SSH to server: `ssh root@72.60.28.175`
3. Navigate to project: `cd /root/websites/gangrunprinting`
4. Add to .env: `echo 'GOOGLE_ANALYTICS_4_PROPERTY_ID=G-XXXXXXXXXX' >> .env`
5. Restart app: `docker-compose restart app`
6. Visit dashboard: https://gangrunprinting.com/admin/seo/performance
7. Check "Traffic" tab - should show analytics data

---

**Need Help?** 
- GA4 Documentation: https://support.google.com/analytics/answer/9539598
- Property ID Help: https://support.google.com/analytics/answer/12270356
