#!/bin/bash

# Deploy to Production via Dokploy
# This script packages the application and deploys it through Dokploy

echo "🚀 Starting deployment to production..."

# Create a deployment package
echo "📦 Creating deployment package..."
tar -czf gangrunprinting-deploy.tar.gz \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='logs' \
  --exclude='playwright-report' \
  --exclude='*.tar.gz' \
  .

# Transfer to server
echo "📤 Transferring to server..."
sshpass -p 'Bobby321&Gloria321Watkins?' scp -o StrictHostKeyChecking=no \
  gangrunprinting-deploy.tar.gz \
  root@72.60.28.175:/tmp/

# Deploy on server
echo "🔧 Deploying on server..."
sshpass -p 'Bobby321&Gloria321Watkins?' ssh -o StrictHostKeyChecking=no root@72.60.28.175 << 'EOF'
cd /root/websites/gangrunprinting
rm -rf * .[^.]*
tar -xzf /tmp/gangrunprinting-deploy.tar.gz
rm /tmp/gangrunprinting-deploy.tar.gz

# Install dependencies and build
npm install --production=false
npm run build

# Create a simple systemd service or use pm2 if available
if command -v pm2 &> /dev/null; then
  pm2 delete gangrunprinting 2>/dev/null || true
  PORT=3001 pm2 start npm --name gangrunprinting -- start
  pm2 save
else
  # Run with nohup as fallback
  pkill -f "gangrunprinting" || true
  PORT=3001 nohup npm start > /var/log/gangrunprinting.log 2>&1 &
fi

echo "✅ Deployment complete!"
EOF

# Clean up local files
rm gangrunprinting-deploy.tar.gz

echo "🎉 Deployment to production complete!"
echo "📍 The application should be accessible via Dokploy's reverse proxy"
echo "🔗 Direct access at: http://72.60.28.175:3001"