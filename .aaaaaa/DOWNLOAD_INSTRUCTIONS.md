# GangRun Printing - Full Backup Download Instructions

**Backup Created:** October 11, 2025 at 07:30:41 CDT
**Archive File:** `gangrunprinting-full-backup-20251011-073041.tar.gz`
**Archive Size:** 218 MB
**Files Included:** 2,946 files
**MD5 Checksum:** `3f7c503e53b65e648deedd12036714fa`

---

## 📦 What's Included in This Backup

### Complete Backup Contents:

- ✅ **PostgreSQL Database** (16 MB)
  - Binary backup: `gangrun_db.backup`
  - SQL dump: `gangrun_db.sql`
  - Schema only: `schema.sql`

- ✅ **MinIO Storage** (77 MB)
  - All uploaded files from `gangrun-uploads` bucket
  - Product images
  - Customer uploaded files

- ✅ **Source Code** (153 MB)
  - Complete Next.js application
  - All custom scripts
  - Documentation
  - Tests
  - _(Excludes: node_modules, .next, .git)_

- ✅ **Configuration Files**
  - `.env` (Environment variables - **CRITICAL!**)
  - `ecosystem.config.js` (PM2 configuration)
  - `package.json` & `package-lock.json`
  - `tsconfig.json`
  - `next.config.mjs`
  - `middleware.ts`
  - `prisma/schema.prisma`

- ✅ **System Configurations**
  - Nginx configuration
  - PM2 process settings

- ✅ **Documentation**
  - Complete restore instructions
  - All project documentation
  - CLAUDE.md (AI assistant instructions)

---

## 💾 Download Methods

### Method 1: Using SCP (Recommended)

**From your local machine:**

```bash
# Download the backup archive
scp root@72.60.28.175:/root/backups/download/gangrunprinting-full-backup-20251011-073041.tar.gz ~/Downloads/

# Download the checksum file
scp root@72.60.28.175:/root/backups/download/gangrunprinting-full-backup-20251011-073041.tar.gz.md5 ~/Downloads/
```

**Server Password:** `Bobby321&Gloria321Watkins?`

---

### Method 2: Using SFTP

**From your local machine:**

```bash
# Connect to server
sftp root@72.60.28.175

# Navigate to download directory
cd /root/backups/download

# List files
ls -lh

# Download the backup
get gangrunprinting-full-backup-20251011-073041.tar.gz

# Download the checksum
get gangrunprinting-full-backup-20251011-073041.tar.gz.md5

# Exit
bye
```

---

### Method 3: Using WinSCP (Windows)

1. **Open WinSCP**
2. **Connection Settings:**
   - Protocol: `SFTP`
   - Host: `72.60.28.175`
   - Port: `22`
   - Username: `root`
   - Password: `Bobby321&Gloria321Watkins?`
3. **Navigate to:** `/root/backups/download`
4. **Download both files:**
   - `gangrunprinting-full-backup-20251011-073041.tar.gz`
   - `gangrunprinting-full-backup-20251011-073041.tar.gz.md5`

---

### Method 4: Using rsync (Advanced)

**From your local machine:**

```bash
# Download with progress and resume capability
rsync -avz --progress \
  root@72.60.28.175:/root/backups/download/gangrunprinting-full-backup-20251011-073041.tar.gz \
  ~/Downloads/
```

---

## ✅ Verify Downloaded Backup

### Step 1: Check File Size

```bash
# On your local machine (macOS/Linux)
ls -lh gangrunprinting-full-backup-20251011-073041.tar.gz

# Expected size: 218 MB (228,564,992 bytes)
```

### Step 2: Verify Checksum

```bash
# On your local machine (macOS/Linux)
md5sum gangrunprinting-full-backup-20251011-073041.tar.gz

# Expected MD5: 3f7c503e53b65e648deedd12036714fa

# Compare with checksum file
cat gangrunprinting-full-backup-20251011-073041.tar.gz.md5
```

**On macOS:**

```bash
md5 gangrunprinting-full-backup-20251011-073041.tar.gz
```

**On Windows (PowerShell):**

```powershell
Get-FileHash gangrunprinting-full-backup-20251011-073041.tar.gz -Algorithm MD5
```

### Step 3: Test Archive Integrity

```bash
# Test if archive can be extracted (doesn't actually extract)
tar -tzf gangrunprinting-full-backup-20251011-073041.tar.gz | head -20

# Count files in archive
tar -tzf gangrunprinting-full-backup-20251011-073041.tar.gz | wc -l
# Expected: 2946 files
```

---

## 📁 Extract and Explore Backup

### Extract Archive:

```bash
# Extract to current directory
tar -xzf gangrunprinting-full-backup-20251011-073041.tar.gz

# Extract to specific directory
mkdir ~/gangrun-backup
tar -xzf gangrunprinting-full-backup-20251011-073041.tar.gz -C ~/gangrun-backup
```

### Explore Contents:

```bash
cd gangrunprinting-full-backup-20251011-073041

# View backup summary
cat BACKUP_SUMMARY.txt

# View restore instructions
cat RESTORE_INSTRUCTIONS.md

# List all contents
ls -lah
```

### Directory Structure:

```
gangrunprinting-full-backup-20251011-073041/
├── BACKUP_SUMMARY.txt          # Summary of backup
├── RESTORE_INSTRUCTIONS.md     # Complete restore guide
├── database/
│   ├── gangrun_db.backup       # Binary database backup
│   ├── gangrun_db.sql          # SQL dump
│   └── schema.sql              # Database schema
├── minio/
│   ├── gangrun-uploads/        # All MinIO files
│   └── minio-config.txt        # MinIO configuration
├── source-code/                # Complete application
│   ├── src/
│   ├── public/
│   ├── prisma/
│   ├── scripts/
│   ├── docs/
│   └── ...
├── configs/
│   ├── .env                    # Environment variables
│   ├── package.json
│   ├── tsconfig.json
│   └── prisma/schema.prisma
├── pm2/
│   └── ecosystem.config.js     # PM2 configuration
├── nginx/
│   └── gangrunprinting.com     # Nginx configuration
└── docs/
    ├── CLAUDE.md
    └── ... (all documentation)
```

---

## 🔐 Security Considerations

### ⚠️ CRITICAL: This backup contains sensitive data!

**Included Secrets:**

- Database credentials
- Square payment API keys (Production)
- PayPal API keys (Production)
- Google OAuth credentials
- Resend email API key
- FedEx API keys
- MinIO access keys
- JWT secrets
- Google AI Studio API key
- All MCP API keys

### Security Best Practices:

1. **Store Securely:**
   - Keep in encrypted storage
   - Use password-protected archives
   - Store offline backups in safe location

2. **Access Control:**
   - Limit who can access the backup
   - Don't store in cloud storage unless encrypted
   - Don't commit to git repositories

3. **Rotate Keys (If Sharing):**
   - If you share this backup, rotate all API keys afterwards
   - Update production credentials
   - Regenerate authentication secrets

4. **Encryption (Recommended):**

   ```bash
   # Encrypt backup with GPG
   gpg -c gangrunprinting-full-backup-20251011-073041.tar.gz

   # Decrypt when needed
   gpg gangrunprinting-full-backup-20251011-073041.tar.gz.gpg
   ```

---

## 🔄 Restore Process (Quick Reference)

**Complete restoration guide is in:** `RESTORE_INSTRUCTIONS.md`

### Quick Restore Steps:

1. **Upload to server** (reverse of download)
2. **Extract archive:** `tar -xzf backup.tar.gz`
3. **Restore source code:** `cp -r source-code /root/websites/gangrunprinting`
4. **Restore .env:** `cp configs/.env /root/websites/gangrunprinting/`
5. **Install dependencies:** `cd /root/websites/gangrunprinting && npm install`
6. **Restore database:** `pg_restore -d gangrun_db database/gangrun_db.backup`
7. **Restore MinIO:** `docker cp minio/gangrun-uploads minio:/data/`
8. **Build & start:** `npm run build && pm2 start ecosystem.config.js`

**For detailed restore instructions, see:** `RESTORE_INSTRUCTIONS.md`

---

## 📊 Backup Statistics

| Item              | Size       | Details                  |
| ----------------- | ---------- | ------------------------ |
| **Total Archive** | 218 MB     | Compressed with gzip     |
| **Database**      | 16 MB      | PostgreSQL dump          |
| **MinIO Storage** | 77 MB      | Uploaded files           |
| **Source Code**   | 153 MB     | Without node_modules     |
| **Total Files**   | 2,946      | Including all components |
| **Backup Time**   | 11 seconds | Full backup execution    |

---

## 🆘 Troubleshooting

### Download Fails / Interrupted:

**Use rsync for resume capability:**

```bash
rsync -avz --progress --partial \
  root@72.60.28.175:/root/backups/download/gangrunprinting-full-backup-20251011-073041.tar.gz \
  ~/Downloads/
```

### Checksum Doesn't Match:

- Re-download the file
- Check file wasn't corrupted during transfer
- Verify you downloaded the complete file (check size)

### Can't Extract Archive:

```bash
# Test archive integrity
tar -tzf backup.tar.gz > /dev/null

# If corrupted, re-download
# If disk space issue, check available space
df -h
```

### Permission Denied:

```bash
# Make sure you have read permissions
chmod 600 gangrunprinting-full-backup-20251011-073041.tar.gz

# Extract with sudo if needed
sudo tar -xzf gangrunprinting-full-backup-20251011-073041.tar.gz
```

---

## 📞 Support

**Questions or issues?**

- **Email:** iradwatkins@gmail.com
- **Server:** 72.60.28.175
- **Location:** /root/backups/download/

**Backup Scripts:**

- Create backup: `/root/websites/gangrunprinting/scripts/full-backup.sh`
- View summary: `cat /root/backups/gangrunprinting-full-backup-20251011-073041/BACKUP_SUMMARY.txt`

---

## ✅ Post-Download Checklist

- [ ] Downloaded backup archive (.tar.gz)
- [ ] Downloaded checksum file (.md5)
- [ ] Verified file size (218 MB)
- [ ] Verified MD5 checksum matches
- [ ] Tested archive can be extracted
- [ ] Stored backup in secure location
- [ ] Created additional backup copy
- [ ] Documented backup location
- [ ] Read restore instructions
- [ ] Tested restore in development (optional)

---

**Backup Created:** October 11, 2025 at 07:30:41 CDT
**Valid For:** Full restoration of GangRun Printing website
**Next Backup Recommended:** Weekly or after major changes

---

_Generated by GangRun Printing Backup System_
_For internal use only - Contains sensitive production data_
