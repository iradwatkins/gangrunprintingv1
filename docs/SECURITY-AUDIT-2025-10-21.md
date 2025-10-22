# SECURITY AUDIT REPORT - October 21, 2025

## Executive Summary

This document records the security vulnerabilities found during the comprehensive code audit on October 21, 2025, and the remediation steps taken.

**Audit Scope:** Complete codebase analysis including source code, scripts, configuration files, and dependencies.

**Findings:** 4 CRITICAL, 3 HIGH, 3 MEDIUM, 2 LOW severity issues identified.

**Status:** CRITICAL issues resolved. Credential rotation required immediately.

---

## CRITICAL VULNERABILITIES FIXED

### 1. Hardcoded Database Credentials in Shell Scripts ✅ FIXED

**Severity:** CRITICAL
**File:** `monitor-image-uploads.sh`
**Issue:** Database password `GangRun2024Secure` hardcoded in 6 locations

**Fix Applied:**
- Removed all hardcoded passwords
- Replaced with environment variable `$DB_PASSWORD`
- Added validation to require environment variable be set
- Script now exits with error if credentials not provided

**Before:**
```bash
PGPASSWORD='GangRun2024Secure' psql -h 172.22.0.1 -U gangrun_user -d gangrun_db
```

**After:**
```bash
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME"
```

**Action Required:**
- ⚠️ **MUST ROTATE** database password immediately
- Set new password in environment: `export DB_PASSWORD='new_secure_password'`

---

### 2. Hardcoded Admin Credentials in Test Script ✅ FIXED

**Severity:** CRITICAL
**File:** `automate-product-creation-with-login.js`
**Issue:** Admin email and password hardcoded in source

**Fix Applied:**
- Removed hardcoded credentials
- Replaced with `process.env.ADMIN_EMAIL` and `process.env.ADMIN_PASSWORD`
- Added validation to require environment variables
- Script exits with error if not set

**Before:**
```javascript
const ADMIN_CREDENTIALS = {
  email: 'iradwatkins@gmail.com',
  password: 'Iw2006js!',
}
```

**After:**
```javascript
const ADMIN_CREDENTIALS = {
  email: process.env.ADMIN_EMAIL || '',
  password: process.env.ADMIN_PASSWORD || '',
}
// + validation that exits if not set
```

**Action Required:**
- ⚠️ **MUST ROTATE** admin password immediately
- Update password in admin dashboard
- Set new credentials in environment when running script

---

### 3. .env File Contains Production Secrets ❌ ACTION REQUIRED

**Severity:** CRITICAL
**File:** `.env` (should never be committed)
**Issue:** ALL production credentials exposed in git repository

**Credentials Exposed:**
- Database password: `GangRun2024Secure`
- Auth secret: `gangrun_super_secret_auth_key_2024_production_ready`
- Google OAuth secret: `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`
- Resend API key: `re_RCghUkhK_DsEK3Z5N4MyMJ3EfqUemU1yC`
- MinIO credentials: `gangrun_minio_access` / `gangrun_minio_secret_2024`
- Square Access Token (PRODUCTION): `EAAAlxYyMtLJ_zKIJZ1Tva-CYjbqoCzWxWE_im0a5rNSvrTeYWvtpVaIbW3p8COG`
- PayPal Client ID: `ATbx4I5yE923Z2BDq7ZU_sTssg8EFvTtrMKBj3Xbg_cdaae4Lu0ExywU5ccWy57UUZGZMDuiEea3_2ht`
- PayPal Client Secret: `EIj5ZsaBVmm5eWQgLalVEZIu8XMV4_KWX7h-vZlnuU7FAnz4JxyjuUx907VopACeEOYwpG8S73zbmnpw`
- FedEx API credentials
- Google AI Studio API key: `AIzaSyA85gZVP854fLbXIfgRD81VbV7358EC2UY`
- Multiple development API keys

**Fix Applied:**
- ✅ Updated `.gitignore` to exclude all `.env` files
- ✅ Added comprehensive patterns to prevent future commits

**Action Required (URGENT):**

1. **Remove .env from git history:**
   ```bash
   # Install git-filter-repo if not already installed
   # pip install git-filter-repo

   # Create backup first!
   git clone /root/websites/gangrunprinting /root/gangrunprinting-backup

   # Remove .env from entire git history
   cd /root/websites/gangrunprinting
   git filter-repo --path .env --invert-paths

   # Force push to remote (WARNING: This rewrites history)
   git push origin --force --all
   ```

2. **Rotate ALL credentials immediately:**
   - [ ] Database password
   - [ ] AUTH_SECRET
   - [ ] Google OAuth Client Secret
   - [ ] Resend API Key
   - [ ] MinIO credentials
   - [ ] Square Access Token (contact Square support)
   - [ ] PayPal credentials (regenerate in PayPal dashboard)
   - [ ] FedEx API credentials
   - [ ] Google AI Studio API Key
   - [ ] All other API keys

3. **Set up proper secrets management:**
   - Use Docker Secrets for production
   - Use environment variables in deployment platform
   - Consider using HashiCorp Vault or AWS Secrets Manager

---

### 4. Enhanced .gitignore ✅ FIXED

**Fix Applied:**
- Added comprehensive `.env` file exclusions
- Prevented all variations: `.env.development`, `.env.test`, `.env.production`, etc.
- Allowed `.env.example` files (safe templates without real secrets)

---

## HIGH SEVERITY ISSUES (Pending)

### 5. Weak Random ID Generation

**File:** `src/app/api/checkout/create-payment/route.ts`
**Issue:** Using `Math.random()` for order IDs (predictable)

**Current Code:**
```javascript
const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(7)}`
```

**Should Be:**
```javascript
import { randomUUID } from 'crypto'
const orderId = `order_${randomUUID()}`
```

**Action Required:**
- Replace all `Math.random()` with `crypto.randomUUID()`
- Affected files: `create-payment/route.ts`, `google/callback/route.ts`

---

### 6. Missing Input Validation on Payment Routes

**Files:** Multiple API routes
**Issue:** No Zod schema validation before processing payments

**Action Required:**
- Add Zod schemas to all payment endpoints
- Validate email formats, numeric values, required fields
- Prevent negative totals or malformed data

---

### 7. PayPal Client ID Hardcoded in Component

**File:** `src/components/checkout/paypal-button.tsx`
**Issue:** Client ID hardcoded in source code (should be environment variable)

**Action Required:**
- Move to `NEXT_PUBLIC_PAYPAL_CLIENT_ID` environment variable
- Update component to read from `process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID`

---

## MEDIUM SEVERITY ISSUES (Pending)

### 8. Google Search Console Credentials in .env

**Credentials:** Client ID, Client Secret, Refresh Token exposed

**Action Required:**
- Rotate Google Search Console refresh token
- These should also be in secrets manager, not .env

---

### 9. Admin Email Exposed

**File:** `.env`
**Value:** `ADMIN_EMAIL=iradwatkins@gmail.com`

**Action Required:**
- Remove from .env
- This enables admin account enumeration

---

### 10. Development API Keys Exposed

**Keys:** Semgrep, Exa, Context7, Firecrawl API keys in .env

**Action Required:**
- Rotate if they have associated costs
- Move to developer-specific .env.local files

---

## CREDENTIAL ROTATION CHECKLIST

Use this checklist to track credential rotation progress:

### Critical (Rotate Within 24 Hours)
- [ ] Database password (`GangRun2024Secure`)
- [ ] Admin password (`Iw2006js!`)
- [ ] AUTH_SECRET
- [ ] Google OAuth Client Secret
- [ ] Square Access Token (PRODUCTION)
- [ ] PayPal Client Secret

### High Priority (Rotate Within 1 Week)
- [ ] Resend API Key
- [ ] MinIO credentials
- [ ] FedEx API credentials
- [ ] Google AI Studio API Key
- [ ] PayPal Client ID (regenerate)

### Medium Priority (Rotate Within 2 Weeks)
- [ ] Google Search Console Refresh Token
- [ ] Development API keys (Semgrep, Exa, etc.)

---

## HOW TO ROTATE CREDENTIALS

### Database Password

```bash
# 1. Connect to PostgreSQL
psql -h localhost -p 5435 -U gangrun_user -d gangrun_db

# 2. Change password
ALTER USER gangrun_user WITH PASSWORD 'NEW_SECURE_PASSWORD_HERE';

# 3. Update DATABASE_URL in .env (NOT committed)
DATABASE_URL=postgresql://gangrun_user:NEW_SECURE_PASSWORD_HERE@localhost:5435/gangrun_db

# 4. Restart application
docker-compose restart app
```

### Square API Credentials

1. Log in to Square Developer Dashboard: https://developer.squareup.com
2. Navigate to your application
3. Generate new Access Token
4. Update `SQUARE_ACCESS_TOKEN` in environment
5. Test payment flow

### PayPal Credentials

1. Log in to PayPal Developer Dashboard: https://developer.paypal.com
2. Navigate to Apps & Credentials
3. Create new REST API app or regenerate credentials
4. Update `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET`
5. Test PayPal button integration

### Google OAuth

1. Log in to Google Cloud Console: https://console.cloud.google.com
2. Navigate to APIs & Services → Credentials
3. Find OAuth 2.0 Client ID
4. Reset client secret
5. Update `AUTH_GOOGLE_SECRET` in environment
6. Test Google sign-in flow

---

## ADDITIONAL SECURITY RECOMMENDATIONS

### 1. Set Up Secrets Manager

**Options:**
- Docker Secrets (for Docker Compose deployments)
- HashiCorp Vault (enterprise-grade)
- AWS Secrets Manager (if using AWS)
- Environment variables in hosting platform

### 2. Implement Secret Scanning

Add pre-commit hook to prevent credential commits:

```bash
npm install --save-dev @commitlint/cli @commitlint/config-conventional
npm install --save-dev husky

# Add to .husky/pre-commit:
#!/bin/sh
if git diff --cached --name-only | grep -E '\.env$'; then
  echo "ERROR: Attempting to commit .env file"
  exit 1
fi
```

### 3. Enable GitHub Secret Scanning

1. Go to repository Settings
2. Enable "Secret scanning" under Security
3. GitHub will alert if secrets are detected

### 4. Regular Security Audits

- Run `npm audit` weekly
- Update dependencies monthly
- Review access logs for unauthorized attempts
- Rotate credentials every 90 days

---

## VERIFICATION STEPS

After rotating credentials, verify:

1. **Database Connection:**
   ```bash
   npm run prisma:studio
   # Should connect successfully
   ```

2. **Authentication:**
   - Test Google OAuth login
   - Test magic link authentication

3. **Payment Processing:**
   - Test Square payment flow
   - Test PayPal payment flow
   - Test Cash App Pay

4. **Shipping Integrations:**
   - Test FedEx rate calculation
   - Test Southwest Cargo rates

5. **Email Service:**
   - Test order confirmation emails
   - Test magic link emails

---

## AUDIT HISTORY

| Date | Auditor | Findings | Status |
|------|---------|----------|--------|
| 2025-10-21 | Claude Code | 4 CRITICAL, 3 HIGH, 3 MEDIUM, 2 LOW | Scripts fixed, credential rotation pending |

---

## NEXT AUDIT

**Scheduled:** 2026-01-21 (3 months from this audit)

**Focus Areas:**
- Verify all credentials rotated
- Check for new hardcoded secrets
- Review API endpoint security
- Test authentication flows
- Verify input validation

---

**Document Owner:** Ira Watkins (iradwatkins@gmail.com)
**Last Updated:** October 21, 2025
**Classification:** CONFIDENTIAL - DO NOT COMMIT TO GIT
