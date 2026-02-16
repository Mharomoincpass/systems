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
pm2 restart mharomo || pm2 start npm --name "mharomo" -- start

pm2 save

echo "Deployment complete."
