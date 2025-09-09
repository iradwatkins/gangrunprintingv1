#!/bin/bash

# Dokploy API Deployment Script
# This uses Dokploy's API to configure and deploy

echo "🚀 Deploying via Dokploy API"
echo "============================"

# Dokploy server
DOKPLOY_URL="http://72.60.28.175:3000"
PROJECT_NAME="gangrunprinting"
APP_NAME="gangrunprinting"

# Environment variables
ENV_VARS='DATABASE_URL=postgresql://gangrun_user:GangRun2024Secure@postgres.gangrunprinting:5432/gangrun_db
AUTH_SECRET=MBRKOKyebhm9xOfSyP/IAPKAmTu8nGhhZx710URU6bo=
NEXTAUTH_URL=https://gangrunprinting.com
NODE_ENV=production
AUTH_TRUST_HOST=true
ADMIN_EMAIL=iradwatkins@gmail.com
AUTH_GOOGLE_ID=YOUR_GOOGLE_CLIENT_ID
AUTH_GOOGLE_SECRET=YOUR_GOOGLE_SECRET
SQUARE_ACCESS_TOKEN=EAAAlxUo1UKk1Lin6wHkpILz-NgqN0-OiNMWN9LBAK-axvt4gmBUCKw8PW1HZeJD
SQUARE_ENVIRONMENT=production
SQUARE_LOCATION_ID=LWMA9R9E2ENXP
SQUARE_APPLICATION_ID=sq0idp-AJF8fI5VayKCq9veQRAw5g
SENDGRID_API_KEY=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
SENDGRID_FROM_EMAIL=support@gangrunprinting.com'

# Create application configuration
cat > /tmp/dokploy-config.json << EOF
{
  "projectName": "${PROJECT_NAME}",
  "appName": "${APP_NAME}",
  "sourceType": "github",
  "repository": "https://github.com/iradwatkins/gangrunprinting.git",
  "branch": "main",
  "buildPath": "/",
  "dockerfilePath": "./Dockerfile",
  "composePath": "./docker-compose.yml",
  "env": "${ENV_VARS}",
  "publishDirectory": "",
  "port": 3000,
  "applicationStatus": "idle",
  "buildType": "dockerfile",
  "dockerfile": "",
  "healthCheckPath": "/api/health",
  "restartPolicy": "unless-stopped",
  "cpus": 0,
  "cpuLimit": 0,
  "memoryReservation": 0,
  "memoryLimit": 0,
  "command": "",
  "refreshToken": "",
  "sourceCommit": "",
  "autoDeploy": true
}
EOF

echo "Configuration created. To deploy:"
echo ""
echo "1. SSH to server:"
echo "   ssh root@72.60.28.175"
echo "   Password: Bobby321&Gloria321Watkins?"
echo ""
echo "2. Run this script on the server:"
echo "   bash deploy-on-server.sh"
echo ""
echo "Or use Dokploy web UI:"
echo "   http://72.60.28.175:3000"
echo ""
echo "Application settings saved to: /tmp/dokploy-config.json"