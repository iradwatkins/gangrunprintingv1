# CLAUDE.md - AI Assistant Instructions

## 🔴 CRITICAL DEPLOYMENT RULES
### **DOCKER COMPOSE DEPLOYMENT ONLY - NO EXCEPTIONS**
### **FORBIDDEN TECHNOLOGIES: Dokploy, Clerk, Convex, Supabase**
### **USE NATIVE TECH STACK: Next.js + Lucia Auth + Prisma + PostgreSQL**

## 🚫 ABSOLUTELY FORBIDDEN TECHNOLOGIES
- **Dokploy** - Use Docker Compose instead
- **Clerk** - Use Lucia Auth (already implemented)
- **Convex** - Use Next.js API routes + Prisma
- **Supabase** - Use PostgreSQL + Prisma
- **NextAuth.js** - Use Lucia Auth (already implemented)

## ✅ APPROVED TECH STACK
- **Frontend**: Next.js 15 with App Router
- **Backend**: Next.js API routes with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Lucia Auth with Prisma adapter
- **File Storage**: MinIO
- **Email**: Resend
- **Deployment**: Docker Compose
- **Port**: 3002 for gangrunprinting.com

## 🔧 DEPLOYMENT METHOD
### **MANDATORY: Use Docker Compose for ALL deployments**
- **ALWAYS** use docker-compose.yml for deployment
- **ALWAYS** deploy on port 3002
- **ALWAYS** use PostgreSQL database
- **ALWAYS** use Lucia Auth for authentication
- **NEVER** use Dokploy, Clerk, Convex, or Supabase

## SERVER ACCESS RESTRICTIONS

### PRODUCTION SERVER: 72.60.28.175

## 🚫 ABSOLUTELY FORBIDDEN
1. **SteppersLife.com** - DO NOT:
   - Access any files belonging to SteppersLife.com
   - Modify any configurations for SteppersLife.com
   - Touch the SteppersLife.com database
   - Make any changes that could affect SteppersLife.com
   - Even view or read SteppersLife.com files unless explicitly requested

2. **Other Existing Websites**:
   - n8n.agistaffers.com - DO NOT ALTER
   - Any other existing applications - DO NOT ALTER

## ✅ ALLOWED ACTIONS

### Shared Resources You CAN Use:
- **N8N** (port 5678) - Workflow automation (existing service)
- **Ollama** (port 11434) - AI features (existing service)
- **MinIO** - File storage (create new buckets)
- **PostgreSQL** - Create NEW databases only

### Deployment Method:
- **MANDATORY: Use Docker Compose for deployment**
- **MANDATORY: Deploy on port 3002**
- **MANDATORY: Use existing PostgreSQL server for new database**
- Create isolated Docker containers via docker-compose
- Use separate database instances
- Configure unique ports to avoid conflicts

## DEPLOYMENT CHECKLIST
- [ ] Use Docker Compose deployment
- [ ] Create new PostgreSQL database (do not use existing ones)
- [ ] Configure MinIO bucket for GangRun Printing
- [ ] Set up N8N webhooks for automation
- [ ] Configure Ollama for AI chat support
- [ ] Ensure complete isolation from SteppersLife.com
- [ ] Deploy on port 3002

## VPS CREDENTIALS
- SSH: root@72.60.28.175
- Password: Bobby321&Gloria321Watkins?
- N8N: Pre-installed (port 5678)
- Ollama: Pre-installed (port 11434)

## SERVICE ARCHITECTURE
- **GangRun Printing**: Isolated Docker Compose stack on port 3002
  - Next.js application
  - PostgreSQL database (new instance)
  - MinIO file storage (new bucket)
  - Redis for caching/sessions
- **Shared Services**: Use existing services
  - N8N (workflow automation)
  - Ollama (AI services)

## GITHUB REPOSITORY
- https://github.com/iradwatkins/gangrunprinting.git

## STANDARD CONFIGURATIONS
- **Timezone**: Always use America/Chicago for all services
- **Database Naming**: Use descriptive names (e.g., gangrun_production)
- **Password Policy**: Use strong passwords with special characters

## STANDARD CREDENTIALS
- **Username**: iradwatkins
- **Email**: iradwatkins@gmail.com
- **Name**: Ira Watkins
- **Password**: Iw2006js!

## CURRENT AUTHENTICATION SYSTEM
### ✅ Lucia Auth Implementation (Correct)
- **Authentication**: Lucia Auth with Prisma adapter
- **Social Login**: Google OAuth integration
- **Magic Links**: Email-based passwordless authentication
- **Session Management**: Secure cookie-based sessions
- **Database**: User/Session tables in PostgreSQL

## RECENT FIXES & KNOWN ISSUES

### ✅ FIXED: Magic Link Authentication (2025-09-14)
- **Issue**: Magic links failing with "expired" error immediately
- **Root Cause**: Double URL encoding + cookie setting in wrong context
- **Solution**: Created API route handler at `/api/auth/verify`
- **Details**: See `/docs/bmad/fixes/magic-link-authentication-fix.md`

## REMEMBER
- **NEVER** touch SteppersLife.com or any of its resources
- **NEVER** use Dokploy, Clerk, Convex, or Supabase
- **ALWAYS** use Docker Compose for deployments
- **ALWAYS** use the existing Lucia Auth implementation
- **ALWAYS** ensure isolation from existing applications

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.