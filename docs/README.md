# GangRun Printing Documentation

## Version: November 7, 1971, v2

**Status:** Production Ready ✅
**URL:** https://gangrunprinting.com

---

## Quick Links

- [Milestone Documentation](./milestones/november-7-1971-v2.md) - Complete system documentation
- [Architecture Overview](#architecture)
- [Recovery Procedures](#recovery)
- [Critical Commands](#commands)

---

## Architecture

### Tech Stack

- **Framework:** Next.js 15.5.2 (App Router)
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** Lucia Auth (Google OAuth + Magic Links)
- **Storage:** MinIO
- **Process:** PM2
- **Proxy:** Nginx
- **Port:** 3002

### Key Features

- ✅ Product Management with CRUD
- ✅ Advanced Add-on System (3-tier positioning)
- ✅ Dynamic Configuration API
- ✅ Shopping Cart with LocalStorage
- ✅ File Upload System
- ✅ Admin Panel with full CRUD

---

## Recovery

### Application Won't Start

```bash
npm run build
pm2 restart gangrunprinting
```

### Database Connection Issues

```bash
# Check .env file
cat .env | grep DATABASE_URL
# Restart PM2
pm2 restart gangrunprinting
```

### Add-ons Not Displaying

```bash
node scripts/update-product-addons.js
pm2 restart gangrunprinting
```

---

## Commands

### Development

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run linter
npm run type-check   # Check TypeScript
```

### Production

```bash
pm2 start ecosystem.config.js  # Start production
pm2 restart gangrunprinting     # Restart app
pm2 logs gangrunprinting        # View logs
pm2 status                      # Check status
```

### Database

```bash
npx prisma migrate dev          # Run migrations
npx prisma generate             # Generate client
npx prisma studio               # Open database GUI
```

### Scripts

```bash
node scripts/create-four-products.js    # Create test products
node scripts/update-product-addons.js   # Update add-ons
```

---

## Test URLs

### Products

- https://gangrunprinting.com/products/product-one
- https://gangrunprinting.com/products/product-two
- https://gangrunprinting.com/products/product-three
- https://gangrunprinting.com/products/product-four

### Admin Panel

- https://gangrunprinting.com/admin/products
- https://gangrunprinting.com/admin/addon-sets
- https://gangrunprinting.com/admin/turnaround-time-sets

### API Endpoints

- https://gangrunprinting.com/api/products
- https://gangrunprinting.com/api/product-categories
- https://gangrunprinting.com/api/add-ons

---

## Support

For issues or questions, refer to:

- [Milestone Documentation](./milestones/november-7-1971-v2.md)
- [CLAUDE.md](/CLAUDE.md) - AI assistant instructions
- GitHub Repository: https://github.com/iradwatkins/gangrunprinting

---

**Last Updated:** November 22, 2024
**Version:** November 7, 1971, v2
