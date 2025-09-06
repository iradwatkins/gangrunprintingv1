# CLAUDE.md - AI Assistant Instructions

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
- **N8N** (port 5678) - Use for workflow automation
- **Ollama** (port 11434) - Use for AI features
- **MinIO** - Use shared instance for file storage
- **PostgreSQL** - Create NEW databases only

### Deployment Method:
- **ONLY use Dokploy** for deploying GangRun Printing
- Create isolated Docker containers
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
- Password: [Stored securely]
- Dokploy: Pre-installed
- N8N: Pre-installed (port 5678)
- Ollama: Pre-installed (port 11434)

## GITHUB REPOSITORY
- https://github.com/iradwatkins/gangrunprinting.git

## REMEMBER
- **NEVER** touch SteppersLife.com or any of its resources
- **ALWAYS** use Dokploy for deployments
- **ALWAYS** ensure isolation from existing applications