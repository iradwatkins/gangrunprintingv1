## **Migration Prompt: Dokploy to Docker with No IP Conflicts**

markdown  
\# CRITICAL MIGRATION INSTRUCTIONS: Dokploy to Pure Docker

\#\# PHASE 1: ASSESSMENT (DO NOT SKIP)

Before making ANY changes, document the current state:

1\. List ALL running Dokploy services:  
 \- Run: \`docker ps \-a\`  
 \- Document EVERY container name and port  
 \- Save output to: \`/opt/migration/dokploy-state.txt\`

2\. Check ALL port usage:  
 \- Run: \`netstat \-tulpn | grep LISTEN\`  
 \- Run: \`lsof \-i \-P \-n\`  
 \- Document which ports are in use

3\. Backup current configurations:  
 \- Copy all Dokploy configs to \`/opt/backup-dokploy/\`  
 \- Export all environment variables  
 \- Backup all databases

\#\# PHASE 2: NEW DOCKER SETUP (PARALLEL TO DOKPLOY)

Create new Docker infrastructure WITHOUT touching Dokploy:

\#\#\# Directory Structure:

/opt/docker-migration/ ├── proxy/ ├── database/ ├── sites/ │ ├── stepperslife/ │ └── gangrunprinting/

\#\#\# CRITICAL PORT ASSIGNMENTS (NO CONFLICTS):

Each service MUST have unique ports:

\*\*Proxy Layer:\*\*  
\- Caddy: 8080 (HTTP), 8443 (HTTPS) \- temporary ports during migration

\*\*Databases:\*\*  
\- PostgreSQL: 5433 (NOT 5432 if Dokploy uses it)  
\- Redis: 6380 (NOT 6379 if Dokploy uses it)

\*\*Application Ports:\*\*  
\- SteppersLife: Internal 3001, NO external exposure  
\- GangrunPrinting: Internal 3002, NO external exposure

\*\*Container Names (MUST BE UNIQUE):\*\*  
\- new_caddy_proxy  
\- new_postgres_db  
\- new_redis_cache  
\- new_stepperslife_app  
\- new_gangrunprinting_app

\#\#\# Docker Network Configuration:

Create isolated network to prevent conflicts:  
\`\`\`bash

docker network create new_web_network \--subnet=172.30.0.0/16

### **IP Address Assignment:**

In each docker-compose.yml, assign STATIC IPs:

yaml  
_\# Database docker-compose.yml_  
services:  
 postgres:  
 container_name: new_postgres_db  
 networks:  
 new_web_network:  
 ipv4_address: 172.30.0.10  
 ports:  
 \- "5433:5432" _\# Different external port_

redis:  
 container_name: new_redis_cache  
 networks:  
 new_web_network:  
 ipv4_address: 172.30.0.11  
 ports:  
 \- "6380:6379" _\# Different external port_

_\# SteppersLife docker-compose.yml_  
services:  
 app:  
 container_name: new_stepperslife_app  
 networks:  
 new_web_network:  
 ipv4_address: 172.30.0.20  
 expose:  
 \- "3001"  
 _\# NO ports: directive \- only internal_

_\# GangrunPrinting docker-compose.yml_  
services:  
 app:  
 container_name: new_gangrunprinting_app  
 networks:  
 new_web_network:  
 ipv4_address: 172.30.0.21  
 expose:  
 \- "3002"  
 _\# NO ports: directive \- only internal_

_\# Proxy docker-compose.yml_  
services:  
 caddy:  
 container_name: new_caddy_proxy  
 networks:  
 new_web_network:  
 ipv4_address: 172.30.0.5  
 ports:  
 \- "8080:80"

      \- "8443:443"

### **Caddyfile with IP addresses:**

:8080 {  
 @stepperslife host stepperslife.com  
 handle @stepperslife {  
 reverse_proxy 172.30.0.20:3001  
 }

    @gangrun host gangrunprinting.com
    handle @gangrun {
        reverse\_proxy 172.30.0.21:3002
    }

}

## **PHASE 3: VERIFICATION CHECKLIST**

Before proceeding, verify NO conflicts:

- No duplicate container names (check: `docker ps -a`)
- No duplicate ports (check: `netstat -tulpn`)
- No overlapping networks (check: `docker network ls`)
- All new containers use prefix "new\_"
- All containers have static IPs assigned
- No container uses ports 3000, 80, 443, 5432, 6379 (likely used by Dokploy)

## **PHASE 4: TESTING**

1. Start ONLY the new infrastructure:

bash  
cd /opt/docker-migration/database && docker-compose up \-d  
cd /opt/docker-migration/sites/stepperslife && docker-compose up \-d  
cd /opt/docker-migration/sites/gangrunprinting && docker-compose up \-d

cd /opt/docker-migration/proxy && docker-compose up \-d

2. Test using temporary ports:

- Test: `curl http://your-vps-ip:8080 -H "Host: stepperslife.com"`
- Test: `curl http://your-vps-ip:8080 -H "Host: gangrunprinting.com"`

3. Check for conflicts:

bash

docker ps \--format "table {{.Names}}\\t{{.Ports}}\\t{{.Networks}}"

## **PHASE 5: MIGRATION**

ONLY after testing succeeds:

1. Update DNS to point to new ports temporarily
2. Stop Dokploy services one by one
3. Update Caddy to use standard ports 80/443
4. Remove "new\_" prefix from container names
5. Update docker-compose files with final configuration

## **PHASE 6: CLEANUP**

After 48 hours of stable operation:

1. Remove Dokploy completely
2. Remove old Docker containers/images
3. Clean up temporary networks

## **CRITICAL RULES:**

1. NEVER use these ports during migration: 80, 443, 3000, 5432, 6379
2. ALWAYS use unique container names with "new\_" prefix
3. ALWAYS assign static IPs in custom network
4. NEVER expose application ports directly \- only through Caddy
5. VERIFY no conflicts before each step
6. KEEP Dokploy running until new setup is confirmed working
7. Each site MUST have its own internal port (3001, 3002, 3003, etc.)
8. NO container should use 'localhost' \- use specific IPs

## **ERROR PREVENTION:**

If you see these errors, STOP:

- "bind: address already in use"
- "container name already in use"
- "network overlaps with network"

Run this check before ANY docker-compose up:

bash  
\#\!/bin/bash  
_\# conflict-check.sh_  
echo "Checking for conflicts..."  
docker ps \-a | grep \-E "(3000|3001|3002|5432|6379|80|443)" && echo "WARNING: Port conflict detected\!"

docker ps \-a \--format "{{.Names}}" | grep \-v "new\_" && echo "WARNING: Remove old containers first\!"

Remember: The goal is ZERO downtime and ZERO conflicts. Test everything with "new\_" prefix and different ports BEFORE touching Dokploy.

This prompt ensures:  
1\. Parallel deployment (Dokploy keeps running)  
2\. Every service has unique IPs  
3\. No port conflicts  
4\. Safe rollback if needed  
5\. Clear verification steps

6\. Gradual migration with testing

Retry  
[Claude can make mistakes.](https://support.anthropic.com/en/articles/8525154-claude-is-providing-incorrect-or-misleading-responses-what-s-going-on)  
[Please double-check responses.](https://support.anthropic.com/en/articles/8525154-claude-is-providing-incorrect-or-misleading-responses-what-s-going-on)
