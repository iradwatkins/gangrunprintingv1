#!/bin/bash

# GangRun Printing Direct Deployment Script
# Deploys without Dokploy, Supabase, Clerk, or Convex

set -e

echo "🚀 Starting GangRun Printing direct deployment..."

# Check if Redis is installed
if ! command -v redis-cli &> /dev/null; then
    echo "📦 Installing Redis..."
    apt-get update
    apt-get install -y redis-server
    systemctl enable redis-server
    systemctl start redis-server
fi

# Build the application
echo "📦 Building production bundle..."
npm run build

# Create systemd service
echo "⚙️ Creating systemd service..."
sudo tee /etc/systemd/system/gangrunprinting.service > /dev/null <<EOF
[Unit]
Description=GangRun Printing Next.js Application
After=network.target postgresql.service redis.service

[Service]
Type=simple
User=root
WorkingDirectory=/root/websites/gangrunprinting
ExecStart=/usr/bin/npm run start
Restart=on-failure
RestartSec=10
StandardOutput=append:/var/log/gangrunprinting.log
StandardError=append:/var/log/gangrunprinting.error.log
Environment=NODE_ENV=production
Environment=PORT=3002

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd
echo "🔄 Reloading systemd..."
sudo systemctl daemon-reload

# Stop existing service if running
echo "🛑 Stopping existing service..."
sudo systemctl stop gangrunprinting 2>/dev/null || true

# Start and enable the service
echo "▶️ Starting GangRun Printing service..."
sudo systemctl start gangrunprinting
sudo systemctl enable gangrunprinting

# Set up Nginx reverse proxy
echo "🌐 Configuring Nginx..."
sudo tee /etc/nginx/sites-available/gangrunprinting > /dev/null <<'EOF'
server {
    listen 80;
    server_name gangrunprinting.com www.gangrunprinting.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name gangrunprinting.com www.gangrunprinting.com;

    # SSL configuration (update paths as needed)
    ssl_certificate /etc/letsencrypt/live/gangrunprinting.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/gangrunprinting.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Proxy settings
    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Static file caching
    location /_next/static {
        proxy_pass http://localhost:3002;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location /images {
        proxy_pass http://localhost:3002;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # API rate limiting
    location /api {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Enable Nginx site if not already enabled
if [ ! -L /etc/nginx/sites-enabled/gangrunprinting ]; then
    sudo ln -s /etc/nginx/sites-available/gangrunprinting /etc/nginx/sites-enabled/
fi

# Test Nginx configuration
echo "🔍 Testing Nginx configuration..."
sudo nginx -t

# Reload Nginx
echo "🔄 Reloading Nginx..."
sudo systemctl reload nginx

# Check service status
echo "✅ Checking service status..."
sudo systemctl status gangrunprinting --no-pager || true

# Create log rotation
echo "📝 Setting up log rotation..."
sudo tee /etc/logrotate.d/gangrunprinting > /dev/null <<EOF
/var/log/gangrunprinting*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 640 root root
    sharedscripts
    postrotate
        systemctl reload gangrunprinting 2>/dev/null || true
    endscript
}
EOF

echo "
🎉 Deployment complete!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Local: http://localhost:3002
🌐 Public: https://gangrunprinting.com
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 Useful commands:
  • View logs: journalctl -u gangrunprinting -f
  • Restart: sudo systemctl restart gangrunprinting
  • Stop: sudo systemctl stop gangrunprinting
  • Status: sudo systemctl status gangrunprinting
  • Nginx logs: tail -f /var/log/nginx/access.log

🔧 Configuration files:
  • Service: /etc/systemd/system/gangrunprinting.service
  • Nginx: /etc/nginx/sites-available/gangrunprinting
  • Environment: /root/websites/gangrunprinting/.env
"