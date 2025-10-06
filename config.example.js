// Environment Configuration for Back4App
module.exports = {
  // Server Configuration
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'production',
  
  // Google AI Configuration
  GOOGLE_AI_API_KEY: process.env.GOOGLE_AI_API_KEY || 'your_google_ai_api_key_here',
  
  // Pexels API Configuration
  PEXELS_API_KEY: process.env.PEXELS_API_KEY || 'your_pexels_api_key_here',
  
  // JWT Configuration
  JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret_here',
  
  // CORS Configuration
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'https://your-frontend-domain.com',
  
  // Back4App Configuration
  BACK4APP_APP_ID: process.env.BACK4APP_APP_ID || '0Ekd9BZY1iNYCp3tn2RGeDSbWNHCWrAWOYDcwhvM',
  BACK4APP_CLIENT_KEY: process.env.BACK4APP_CLIENT_KEY || 'b7P4SmL9NtDrPSrMdVDy91f177X7xpw8zwKJRTpn'
};
