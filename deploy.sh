#!/bin/bash
set -e

cd ~/systems

echo "Pulling latest code..."
git fetch origin
git reset --hard origin/main

echo "Installing dependencies..."
npm install

echo "Building project..."
npm run build

echo "Restarting app on port 3000..."
pm2 stop mharomo-studio 2>/dev/null || true
pm2 delete mharomo-studio 2>/dev/null || true

export PORT=3000
export NODE_ENV=production

if pm2 describe mharomo >/dev/null 2>&1; then
  pm2 restart mharomo --update-env
else
  pm2 start npm --name mharomo -- start
fi

pm2 save

echo "Deployment complete."
