# GangrunPrinting v1 - Containerized Print Broker Platform

A fully containerized print broker platform built with Next.js 15.5.2, featuring Square payments, image processing with Sharp, and cloud storage. Optimized for Docker deployment with external PostgreSQL and Redis.

- Any existing websites on the server must NOT be altered
- NO direct server configuration changes outside of Dokploy

### ✅ ALLOWED SHARED RESOURCES

- **N8N** (port 5678) - Workflow automation
- **Ollama** (port 11434) - AI integration
- **MinIO** - Shared object storage
- **PostgreSQL** - New databases only (do not touch existing databases)

### DEPLOYMENT RULE

- **ONLY use Dokploy** to deploy GangRun Printing
- All deployments must be isolated from existing applications

## Features

- 🔐 Authentication with Google OAuth and Magic Links
- 💳 Square payment integration (includes Cash App)
- 📁 File upload and management with MinIO
- 📧 Email notifications with SendGrid
- 📱 Progressive Web App (PWA) support
- 🎨 Modern UI with Tailwind CSS and shadcn/ui
- 🔄 Real-time order tracking
- 👨‍💼 Admin dashboard for order management
- 🐳 Docker containerization

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Auth.js v5
- **Payments**: Square SDK
- **File Storage**: MinIO
- **Email**: SendGrid
- **Styling**: Tailwind CSS + shadcn/ui
- **Deployment**: Docker & Docker Compose

## Quick Start

### Prerequisites

- Node.js 18+
- Docker and Docker Compose
- PostgreSQL (or use Docker)

### Development Setup

1. Clone the repository:

```bash
git clone https://github.com/yourusername/gangrunprinting.git
cd gangrunprinting
```

2. Install dependencies:

```bash
npm install
```

3. Copy the environment variables:

```bash
cp .env.example .env.local
```

4. Start the development database and MinIO:

```bash
docker-compose -f docker-compose.dev.yml up -d
```

5. Run database migrations:

```bash
npx prisma migrate dev
```

6. Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Production Deployment

1. Build the Docker image:

```bash
docker-compose build
```

2. Start all services:

```bash
docker-compose up -d
```

## Environment Variables

See `.env.example` for required environment variables.

Key variables:

- `AUTH_GOOGLE_ID` - Google OAuth client ID
- `AUTH_GOOGLE_SECRET` - Google OAuth client secret
- `SQUARE_ACCESS_TOKEN` - Square payment token
- `SENDGRID_API_KEY` - SendGrid API key for emails

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npx prisma studio` - Open Prisma Studio

## Docker Services

- **app** - Next.js application
- **postgres** - PostgreSQL database
- **minio** - S3-compatible object storage
- **postgres_backup** - Automated database backups
- **chatwoot** - Customer support (optional)

## License

All rights reserved. © 2024 GangRun Printing
