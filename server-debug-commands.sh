#!/bin/bash

# Commands to run ON THE SERVER to debug and fix the 502 error

echo "=== GANGRUN PRINTING - SERVER DEBUG COMMANDS ==="
echo "Run these commands after SSH into 72.60.28.175"
echo ""

cat << 'EOF'
# 1. Check what's running on ports
echo "=== Checking ports ==="
netstat -tlnp | grep -E ':3000|:3003|:80|:443'
lsof -i :3000
lsof -i :3003

# 2. Check Docker containers
echo "=== Docker containers ==="
docker ps -a | grep -E 'gangrun|dokploy|traefik'

# 3. Check Traefik configuration
echo "=== Traefik routes ==="
docker exec $(docker ps -q -f name=traefik) cat /etc/traefik/dynamic/gangrun* 2>/dev/null || echo "No Traefik config found"

# 4. Check Dokploy containers
echo "=== Dokploy status ==="
docker ps | grep dokploy
docker logs dokploy --tail 50 2>&1 | grep -E 'error|Error|ERROR|gangrun'

# 5. Check if app container exists and is running
echo "=== GangRun app container ==="
APP_CONTAINER=$(docker ps -aq -f name=gangrun)
if [ ! -z "$APP_CONTAINER" ]; then
    echo "Found container: $APP_CONTAINER"
    docker inspect $APP_CONTAINER | grep -E 'Status|RestartCount|Error'
    docker logs $APP_CONTAINER --tail 30
else
    echo "No gangrun container found - THIS IS THE PROBLEM!"
    echo "You need to deploy via Dokploy UI"
fi

# 6. Check DNS and domain
echo "=== DNS Check ==="
dig gangrunprinting.com +short
curl -I http://localhost:3000 2>/dev/null | head -5
curl -I http://72.60.28.175:3000 2>/dev/null | head -5

# 7. Check if Dokploy database has the app
echo "=== Dokploy Database ==="
docker exec $(docker ps -q -f name=dokploy-postgres) psql -U dokploy -d dokploy -c "SELECT name, status FROM applications WHERE name LIKE '%gangrun%';" 2>/dev/null || echo "Cannot query Dokploy DB"

# 8. Quick fix attempt - restart Dokploy
echo "=== Quick Fix Options ==="
echo "Option 1: Restart Dokploy"
echo "  docker restart dokploy"
echo ""
echo "Option 2: Clear and redeploy in Dokploy UI"
echo "  1. Go to http://72.60.28.175:3000"
echo "  2. Delete existing gangrunprinting app if exists"
echo "  3. Create new application with settings:"
echo "     - Name: gangrunprinting"
echo "     - Repo: https://github.com/iradwatkins/gangrunprinting.git"
echo "     - Port: 3000"
echo "     - Build: npm ci && npm run build"
echo "     - Start: npm start"
echo ""

# 9. Emergency manual deployment (if Dokploy fails)
echo "=== Emergency Manual Deploy (ONLY if Dokploy fails) ==="
echo "cd /tmp"
echo "git clone https://github.com/iradwatkins/gangrunprinting.git gangrun-emergency"
echo "cd gangrun-emergency"
echo "docker build -t gangrun-app ."
echo "docker run -d --name gangrun-emergency -p 3000:3000 --env-file /path/to/.env gangrun-app"

EOF

echo ""
echo "Copy and run these commands on the server to diagnose the issue!"