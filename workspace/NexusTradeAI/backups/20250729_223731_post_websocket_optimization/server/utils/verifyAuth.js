const { createClient } = require('@supabase/supabase-js');
const config = require('./config');

let supabase = null;

// Only initialize Supabase if credentials are provided and valid
if (config.SUPABASE_URL && config.SUPABASE_ANON_KEY && 
    config.SUPABASE_URL !== 'placeholder' && config.SUPABASE_URL !== '') {
  supabase = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);
}

const verifyAuth = async (req, res, next) => {
  // If Supabase is not configured, skip auth for development
  if (!supabase) {
    console.log('Supabase not configured - skipping auth verification');
    req.user = { id: 'demo-user', email: 'demo@example.com' };
    return next();
  }

  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: 'Invalid token' });

  req.user = user;
  next();
};

module.exports = verifyAuth; 