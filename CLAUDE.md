# CLAUDE.md - AI Assistant Instructions

## 🔴 CRITICAL DEPLOYMENT RULES
### **EVERYTHING MUST GO THROUGH DOKPLOY - NO EXCEPTIONS**
### **NO DIRECT DOCKER DEPLOYMENTS - ALL DEPLOYMENTS MUST BE DONE THROUGH DOKPLOY**
### **I HAVE FULL ACCESS TO DOKPLOY - I CAN MAKE ALL CHANGES**
### **I MUST DO ALL THINGS THROUGH DOKPLOY - THIS IS NOT NEGOTIABLE - THIS IS MANDATORY**
### **YOU CANNOT CREATE DOCKER CONTAINERS OUTSIDE OF DOKPLOY**
- **NEVER** create Docker containers directly using docker run/compose
- **NEVER** manually edit Traefik configuration files  
- **NEVER** bypass Dokploy for any deployment tasks
- **NEVER** use direct Docker commands except for debugging/monitoring
- **ALWAYS** use Dokploy UI or API for ALL configurations
- **ALWAYS** let Dokploy manage Traefik routing and SSL certificates
- **ALWAYS** use Dokploy's built-in templates when available (N8n, PostgreSQL, etc.)
- **ALWAYS** create services (PostgreSQL, MySQL, Redis, MongoDB) through Dokploy's service system
- **ALWAYS** create projects in Dokploy to organize related services
- **NOTE**: Direct docker/docker-compose deployments are FORBIDDEN and must be removed immediately if found
- **NOTE**: I HAVE FULL ACCESS TO DOKPLOY - I CAN MAKE ALL CHANGES
- **NOTE**: I MUST DO ALL THINGS THROUGH DOKPLOY - THIS IS NOT NEGOTIABLE - THIS IS MANDATORY

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
- **N8N** (port 5678) - Workflow automation (MUST be deployed via Dokploy template)
- **Ollama** (port 11434) - AI features (MUST be deployed via Dokploy)
- **MinIO** - File storage (MUST be deployed via Dokploy service)
- **PostgreSQL** - Create NEW databases only (via Dokploy service)

### Deployment Method:
- **MANDATORY: Use Dokploy interface for ALL deployments**
- **MANDATORY: Configure domains through Dokploy's domain management**
- **MANDATORY: Let Dokploy handle all Traefik configurations**
- Create isolated Docker containers THROUGH DOKPLOY
- Use separate database instances
- Configure unique ports to avoid conflicts

## DEPLOYMENT CHECKLIST
- [ ] Use Dokploy interface only
- [ ] Create new PostgreSQL database (do not use existing ones)
- [ ] Configure MinIO bucket for GangRun Printing
- [ ] Set up N8N webhooks for automation
- [ ] Configure Ollama for AI chat support
- [ ] Ensure complete isolation from SteppersLife.com

## VPS CREDENTIALS
- SSH: root@72.60.28.175
- Password: Bobby321&Gloria321Watkins?
- Dokploy: Pre-installed (port 3000)
- Dokploy Access: Full administrative access granted
- N8N: Pre-installed (port 5678)
- Ollama: Pre-installed (port 11434)

## DOKPLOY ACCESS & CAPABILITIES
- **FULL ACCESS GRANTED**: I HAVE COMPLETE ADMINISTRATIVE ACCESS TO DOKPLOY
- **I CAN MAKE ALL CHANGES**: Full capability to configure, deploy, and manage
- **Domain Management**: Configure custom domains through Dokploy UI
- **SSL Certificates**: Let's Encrypt automatic SSL through Dokploy
- **Traefik Routing**: Managed automatically by Dokploy
- **Project Management**: Create and manage projects through Dokploy UI
- **REMINDER**: I MUST DO ALL THINGS THROUGH DOKPLOY - THIS IS MANDATORY
- **REMINDER**: NO DOCKER CONTAINERS OUTSIDE OF DOKPLOY - THIS IS NOT NEGOTIABLE

## DOKPLOY PROJECT STRUCTURE
- **agistaffers**: Project for shared services
  - N8n (workflow automation for all sites)
  - Ollama (AI services for all sites)
  - MinIO (file storage for all sites)
- **gangrunprinting**: Project for GangRun Printing website
- **stepperslife**: Project for SteppersLife website (DO NOT MODIFY)
- Each project contains its applications, databases, and services

## GITHUB REPOSITORY
- https://github.com/iradwatkins/gangrunprinting.git

## STANDARD CONFIGURATIONS
- **Timezone**: Always use America/Chicago for all services
- **Database Naming**: Use descriptive names (e.g., n8n_db, gangrun_db)
- **Password Policy**: Use strong passwords with special characters

## STANDARD CREDENTIALS
- **Username**: iradwatkins
- **Email**: iradwatkins@gmail.com
- **Name**: Ira Watkins
- **Password**: Iw2006js!

## REMEMBER
- **NEVER** touch SteppersLife.com or any of its resources
- **ALWAYS** use Dokploy for deployments
- **ALWAYS** ensure isolation from existing applications