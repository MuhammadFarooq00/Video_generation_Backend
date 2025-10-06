#!/bin/bash

# Back4App Deployment Script
echo "🚀 Starting Back4App deployment..."

# Check if back4app CLI is installed
if ! command -v back4app &> /dev/null; then
    echo "❌ Back4App CLI not found. Installing..."
    npm install -g back4app-cli
fi

# Login to Back4App
echo "🔐 Logging into Back4App..."
back4app login

# Initialize app if not already done
echo "📱 Initializing app..."
back4app init

# Set environment variables
echo "⚙️ Setting environment variables..."
back4app env:set NODE_ENV=production
back4app env:set CORS_ORIGIN=https://your-frontend-domain.com

echo "⚠️  Please set the following environment variables manually:"
echo "   - GOOGLE_AI_API_KEY"
echo "   - PEXELS_API_KEY" 
echo "   - JWT_SECRET"

# Deploy the app
echo "🚀 Deploying to Back4App..."
back4app deploy

echo "✅ Deployment complete!"
echo "🌍 Your app should be available at: https://your-app-name.back4app.io"
