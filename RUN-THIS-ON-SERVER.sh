#!/bin/bash

# EMERGENCY DEPLOYMENT SCRIPT - RUN THIS ON THE SERVER
# This bypasses Dokploy if needed and deploys directly

echo "🚨 EMERGENCY DEPLOYMENT - GANGRUN PRINTING"
echo "========================================="
echo ""

# Quick deployment without Dokploy
cd /root

# Clean up old attempts
docker stop gangrunprinting 2>/dev/null
docker rm gangrunprinting 2>/dev/null
rm -rf gangrun-deploy

# Clone fresh code
git clone https://github.com/iradwatkins/gangrunprinting.git gangrun-deploy
cd gangrun-deploy

# Create production env
cat > .env.production << 'EOF'
DATABASE_URL=postgresql://gangrun_user:GangRun2024Secure@host.docker.internal:5432/gangrun_db
AUTH_SECRET=MBRKOKyebhm9xOfSyP/IAPKAmTu8nGhhZx710URU6bo=
NEXTAUTH_URL=https://gangrunprinting.com
NODE_ENV=production
AUTH_TRUST_HOST=true
ADMIN_EMAIL=iradwatkins@gmail.com
SQUARE_ACCESS_TOKEN=EAAAlxUo1UKk1Lin6wHkpILz-NgqN0-OiNMWN9LBAK-axvt4gmBUCKw8PW1HZeJD
SQUARE_ENVIRONMENT=production
SQUARE_LOCATION_ID=LWMA9R9E2ENXP
SQUARE_APPLICATION_ID=sq0idp-AJF8fI5VayKCq9veQRAw5g
SENDGRID_API_KEY=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
SENDGRID_FROM_EMAIL=support@gangrunprinting.com
EOF

# Build and run
docker compose up -d --build

# Wait for startup
sleep 15

# Initialize database
docker exec gangrunprinting-app-1 npx prisma migrate deploy
docker exec gangrunprinting-app-1 npx tsx scripts/seed-all-data.ts

# Check status
docker ps | grep gangrun
echo ""
echo "✅ Deployment complete!"
echo "Test: curl http://localhost:3000"
echo "Visit: https://gangrunprinting.com"