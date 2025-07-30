#!/bin/bash

# 🚀 NexusTradeAI Production Deployment Script
# Designed for 1000+ concurrent users

set -e

echo "🏗️ Starting NexusTradeAI Production Deployment..."

# Configuration
APP_NAME="nexustradeai"
DOMAIN="yourdomain.com"
SSL_EMAIL="admin@yourdomain.com"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root"
   exit 1
fi

# Update system packages
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install required packages
print_status "Installing required packages..."
sudo apt install -y curl wget git nginx certbot python3-certbot-nginx redis-server

# Install Node.js 18.x
print_status "Installing Node.js 18.x..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
print_status "Installing PM2..."
sudo npm install -g pm2

# Create application directory
print_status "Setting up application directory..."
sudo mkdir -p /var/www/$APP_NAME
sudo chown $USER:$USER /var/www/$APP_NAME

# Clone or update repository
if [ -d "/var/www/$APP_NAME/.git" ]; then
    print_status "Updating existing repository..."
    cd /var/www/$APP_NAME
    git pull origin main
else
    print_status "Cloning repository..."
    git clone https://github.com/yourusername/nexustradeai.git /var/www/$APP_NAME
    cd /var/www/$APP_NAME
fi

# Install dependencies
print_status "Installing dependencies..."
npm install
cd client && npm install && cd ..
cd server && npm install && cd ..

# Create production environment file
print_status "Creating production environment file..."
cat > /var/www/$APP_NAME/.env << EOF
NODE_ENV=production
PORT=3001
CLUSTER_WORKERS=auto
CACHE_TTL=30000
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
ENABLE_PERFORMANCE_MONITORING=true
LOG_LEVEL=info
ENABLE_REQUEST_LOGGING=true
CORS_ORIGINS=https://$DOMAIN,https://www.$DOMAIN
REQUEST_SIZE_LIMIT=10mb

# Add your actual API keys here
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
STRIPE_SECRET_KEY=your_stripe_secret_key
JWT_SECRET=your_jwt_secret_key

# Redis for production caching
REDIS_URL=redis://localhost:6379

# API Rate Limits

BYBIT_RATE_LIMIT=120
EOF

# Configure Redis for production
print_status "Configuring Redis..."
sudo systemctl enable redis-server
sudo systemctl start redis-server

# Create PM2 ecosystem file
print_status "Creating PM2 configuration..."
cat > /var/www/$APP_NAME/ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'nexustradeai-server',
      script: './server/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      max_memory_restart: '1G',
      node_args: '--max-old-space-size=1024'
    }
  ]
};
EOF

# Create logs directory
mkdir -p /var/www/$APP_NAME/logs

# Build frontend for production
print_status "Building frontend for production..."
cd /var/www/$APP_NAME/client
npm run build
cd ..

# Configure Nginx
print_status "Configuring Nginx..."
sudo tee /etc/nginx/sites-available/$APP_NAME > /dev/null << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;
    
    # Frontend static files
    location / {
        root /var/www/$APP_NAME/client/dist;
        try_files \$uri \$uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # API proxy
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Rate limiting
        limit_req zone=api burst=20 nodelay;
        limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;
    }
    
    # WebSocket proxy
    location /ws/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Health check
    location /health {
        proxy_pass http://localhost:3001/api/health;
        access_log off;
    }
}
EOF

# Enable site
sudo ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Start PM2 processes
print_status "Starting application with PM2..."
cd /var/www/$APP_NAME
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Setup PM2 to start on boot
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp /home/$USER

# Start Nginx
print_status "Starting Nginx..."
sudo systemctl enable nginx
sudo systemctl start nginx

# Setup SSL with Let's Encrypt
print_status "Setting up SSL certificate..."
sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email $SSL_EMAIL

# Setup automatic SSL renewal
sudo crontab -l 2>/dev/null | { cat; echo "0 12 * * * /usr/bin/certbot renew --quiet"; } | sudo crontab -

# Create monitoring script
print_status "Creating monitoring script..."
cat > /var/www/$APP_NAME/monitor.sh << 'EOF'
#!/bin/bash
# Monitor script for NexusTradeAI

LOG_FILE="/var/www/nexustradeai/logs/monitor.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

echo "[$DATE] Starting health check..." >> $LOG_FILE

# Check if PM2 processes are running
if ! pm2 list | grep -q "nexustradeai-server"; then
    echo "[$DATE] PM2 processes not running, restarting..." >> $LOG_FILE
    cd /var/www/nexustradeai && pm2 start ecosystem.config.js
fi

# Check if Nginx is running
if ! systemctl is-active --quiet nginx; then
    echo "[$DATE] Nginx not running, restarting..." >> $LOG_FILE
    sudo systemctl restart nginx
fi

# Check if Redis is running
if ! systemctl is-active --quiet redis-server; then
    echo "[$DATE] Redis not running, restarting..." >> $LOG_FILE
    sudo systemctl restart redis-server
fi

# Check memory usage
MEMORY_USAGE=$(free | grep Mem | awk '{printf "%.2f", $3/$2 * 100.0}')
echo "[$DATE] Memory usage: ${MEMORY_USAGE}%" >> $LOG_FILE

# Check disk usage
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
echo "[$DATE] Disk usage: ${DISK_USAGE}%" >> $LOG_FILE

# Log PM2 status
pm2 list >> $LOG_FILE 2>&1

echo "[$DATE] Health check completed" >> $LOG_FILE
echo "----------------------------------------" >> $LOG_FILE
EOF

chmod +x /var/www/$APP_NAME/monitor.sh

# Setup monitoring cron job
(crontab -l 2>/dev/null; echo "*/5 * * * * /var/www/nexustradeai/monitor.sh") | crontab -

# Create backup script
print_status "Creating backup script..."
cat > /var/www/$APP_NAME/backup.sh << 'EOF'
#!/bin/bash
# Backup script for NexusTradeAI

BACKUP_DIR="/var/backups/nexustradeai"
DATE=$(date '+%Y%m%d_%H%M%S')

mkdir -p $BACKUP_DIR

# Backup application files
tar -czf $BACKUP_DIR/app_$DATE.tar.gz -C /var/www nexustradeai

# Backup logs
tar -czf $BACKUP_DIR/logs_$DATE.tar.gz -C /var/www nexustradeai/logs

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
EOF

chmod +x /var/www/$APP_NAME/backup.sh

# Setup daily backup
(crontab -l 2>/dev/null; echo "0 2 * * * /var/www/nexustradeai/backup.sh") | crontab -

print_success "🎉 Production deployment completed!"
print_status "Your application is now running at: https://$DOMAIN"
print_status "PM2 Status: pm2 list"
print_status "Nginx Status: sudo systemctl status nginx"
print_status "Redis Status: sudo systemctl status redis-server"
print_status "Logs: tail -f /var/www/$APP_NAME/logs/combined.log"

echo ""
print_warning "⚠️  IMPORTANT: Update your domain in the Nginx configuration and SSL setup"
print_warning "⚠️  Don't forget to add your actual API keys to the .env file"
print_warning "⚠️  Monitor your application with: pm2 monit"

echo ""
print_success "🚀 Your NexusTradeAI is now ready for 1000+ users!" 