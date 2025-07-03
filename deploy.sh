#!/bin/bash

# Deployment script for Kariz app
echo "Starting deployment..."

# Navigate to project directory
cd /var/www/kalame/kalame-panel

# Pull latest changes
echo "Pulling latest changes..."
git pull origin main

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the application
echo "Building the application..."
npm run build

# Create logs directory if it doesn't exist
mkdir -p /var/log/pm2

# Stop existing PM2 process if running
echo "Stopping existing PM2 process..."
pm2 stop kariz-app 2>/dev/null || true
pm2 delete kariz-app 2>/dev/null || true

# Start PM2 with ecosystem config
echo "Starting PM2 with ecosystem config..."
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
echo "Saving PM2 configuration..."
pm2 save

# Setup PM2 startup script
echo "Setting up PM2 startup script..."
pm2 startup

# Display status
echo "PM2 Status:"
pm2 status

echo "Deployment completed successfully!"
echo "Application should now be running and will restart automatically on server reboot." 