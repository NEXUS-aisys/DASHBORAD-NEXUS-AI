require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 3001,
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  ML_BOT_API_KEY: process.env.ML_BOT_API_KEY,
  JWT_SECRET: process.env.JWT_SECRET || 'default-secret' // For any local JWT if needed
}; 