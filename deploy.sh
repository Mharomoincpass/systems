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

echo "Restarting app..."
if pm2 describe ai-tools-systems > /dev/null 2>&1; then
  echo "Process exists, restarting..."
  pm2 restart ai-tools-systems --update-env
else
  echo "Process not found, starting..."
  pm2 start ecosystem.config.js
fi

pm2 save

echo "Deployment complete."
