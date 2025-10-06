# Back4App Deployment Guide

## 🚀 Deploying Your AI Video Generator Backend to Back4App

### Prerequisites
- Back4App account with app created
- Your app credentials:
  - App ID: `0Ekd9BZY1iNYCp3tn2RGeDSbWNHCWrAWOYDcwhvM`
  - Client Key: `b7P4SmL9NtDrPSrMdVDy91f177X7xpw8zwKJRTpn`

### Step 1: Prepare Your Code
1. Ensure all files are in the `backend/` directory
2. Make sure `package.json` has the correct start script
3. Verify `Procfile` exists with: `web: node App.mjs`

### Step 2: Install Back4App CLI
```bash
npm install -g back4app-cli
```

### Step 3: Login to Back4App
```bash
back4app login
```
Enter your Back4App credentials when prompted.

### Step 4: Initialize Your App
```bash
cd backend
back4app init
```
When prompted:
- Select your existing app
- Choose "Node.js" as the platform
- Select the region closest to your users

### Step 5: Set Environment Variables
In your Back4App dashboard or via CLI:

```bash
# Required Environment Variables
back4app env:set GOOGLE_AI_API_KEY=your_google_ai_api_key
back4app env:set PEXELS_API_KEY=your_pexels_api_key
back4app env:set JWT_SECRET=your_jwt_secret_key
back4app env:set NODE_ENV=production
back4app env:set CORS_ORIGIN=https://your-frontend-domain.com
```

### Step 6: Deploy Your App
```bash
back4app deploy
```

### Step 7: Verify Deployment
1. Check the deployment logs in Back4App dashboard
2. Test your API endpoints:
   - Health check: `GET https://your-app-name.back4app.io/api/health`
   - Video generation: `POST https://your-app-name.back4app.io/api/video/generate-video`

### Step 8: Update Frontend Configuration
Update your frontend to use the new Back4App URL:
```javascript
const API_BASE_URL = 'https://your-app-name.back4app.io';
```

### Environment Variables Reference
| Variable | Description | Required |
|----------|-------------|----------|
| `GOOGLE_AI_API_KEY` | Your Google AI API key | Yes |
| `PEXELS_API_KEY` | Your Pexels API key | Yes |
| `JWT_SECRET` | Secret for JWT tokens | Yes |
| `NODE_ENV` | Environment (production) | Yes |
| `CORS_ORIGIN` | Frontend domain for CORS | Yes |
| `PORT` | Server port (auto-set by Back4App) | No |

### Troubleshooting
1. **Build Failures**: Check Node.js version compatibility
2. **CORS Issues**: Verify CORS_ORIGIN is set correctly
3. **API Errors**: Check environment variables are set
4. **File Upload Issues**: Ensure proper file permissions

### Monitoring
- Use Back4App dashboard to monitor logs
- Set up alerts for errors
- Monitor memory and CPU usage

### Scaling
- Back4App automatically handles scaling
- Consider upgrading plan for high traffic
- Monitor performance metrics

### Security Notes
- Never commit API keys to version control
- Use environment variables for all secrets
- Enable HTTPS (automatic with Back4App)
- Regularly rotate API keys

### Support
- Back4App Documentation: https://docs.back4app.com/
- Back4App Support: https://www.back4app.com/support
