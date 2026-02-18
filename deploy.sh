#!/bin/bash
set -e

export PATH=$PATH:/usr/local/go/bin:/usr/local/bin

cd ~/cv-auto-reject

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