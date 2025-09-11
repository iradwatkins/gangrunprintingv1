GitHub Repos:  
├── stepperslife-platform (private)  
├── gangrunprinting-platform (private)

VPS Structure:  
/opt/  
├── proxy/  
│   ├── docker-compose.yml  
│   └── Caddyfile (routes both domains)  
├── database/  
│   └── docker-compose.yml (PostgreSQL \+ Redis)  
├── sites/  
│   ├── stepperslife/  
│   │   ├── docker-compose.yml  
│   │   └── .env  
│   └── gangrunprinting/  
│       ├── docker-compose.yml  
│       └── .env

Caddyfile Configuration

stepperslife.com {  
    reverse\_proxy stepperslife\_app:3000  
}

gangrunprinting.com {  
    reverse\_proxy gangrunprinting\_app:3000  
}

Deployment Flow

1\. Code locally  
2\. Push to GitHub  
3\. SSH to VPS  
4\. Git pull in respective site folder  
5\. Docker Compose build & up  
6\. Caddy routes traffic to correct container

### **Migration from Dokploy**

**Remove:**

* Dokploy  
* Traefik  
* MinIO  
* Multiple PostgreSQL containers  
* Clerk (switching to Lucia)

**Add:**

* Direct Docker Compose  
* Caddy  
* Cloudflare R2  
* Single PostgreSQL  
* Simplified payment setup

### **Key Points**

1. **SteppersLife.com** \- Multiple payment options for event flexibility  
2. **GangrunPrinting.com** \- Square/Cash App only for simplicity  
3. **Shared Infrastructure** \- One PostgreSQL, one Redis, one Caddy  
4. **Separate Repos** \- Each site has its own GitHub repository  
5. **Independent Deployments** \- Update one without affecting the other

