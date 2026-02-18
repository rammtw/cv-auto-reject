#!/bin/bash
set -e

cd ~/cv-auto-reject
git pull origin main

# Backend
cd backend
go build -o cv-auto-reject main.go
sudo systemctl stop cv-auto-reject
sudo cp cv-auto-reject /opt/cv-auto-reject/
sudo systemctl start cv-auto-reject

# Frontend
cd ../frontend
npm install
npm run build
sudo cp -r dist/* /var/www/cv-auto-reject/

echo "✅ Deploy complete!"