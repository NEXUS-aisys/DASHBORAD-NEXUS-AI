require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 3001,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Database Configuration
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,
  
  // Payment Configuration
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  
  // AI/ML Configuration
  ML_BOT_API_KEY: process.env.ML_BOT_API_KEY,
  JWT_SECRET: process.env.JWT_SECRET || 'default-secret',
  
  // Scalability Configuration
  CLUSTER_WORKERS: process.env.CLUSTER_WORKERS || 'auto', // 'auto' or number
  CACHE_TTL: process.env.CACHE_TTL || 30000, // 30 seconds
  RATE_LIMIT_WINDOW: process.env.RATE_LIMIT_WINDOW || 900000, // 15 minutes
  RATE_LIMIT_MAX: process.env.RATE_LIMIT_MAX || 100, // requests per window
  
  // Redis Configuration (for production caching)
  REDIS_URL: process.env.REDIS_URL || null,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD || null,
  
  // Load Balancer Configuration
  LOAD_BALANCER_ENABLED: process.env.LOAD_BALANCER_ENABLED === 'true',
  HEALTH_CHECK_INTERVAL: process.env.HEALTH_CHECK_INTERVAL || 30000,
  
  // API Rate Limits
  YAHOO_FINANCE_RATE_LIMIT: process.env.YAHOO_FINANCE_RATE_LIMIT || 100, // requests per minute
  BYBIT_RATE_LIMIT: process.env.BYBIT_RATE_LIMIT || 120, // requests per minute
  
  // Performance Monitoring
  ENABLE_PERFORMANCE_MONITORING: process.env.ENABLE_PERFORMANCE_MONITORING === 'true',
  METRICS_PORT: process.env.METRICS_PORT || 9090,
  
  // Security
  CORS_ORIGINS: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:5174'],
  REQUEST_SIZE_LIMIT: process.env.REQUEST_SIZE_LIMIT || '10mb',
  
  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  ENABLE_REQUEST_LOGGING: process.env.ENABLE_REQUEST_LOGGING === 'true',
}; 