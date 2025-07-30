const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const cors = require('cors');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

// Load env vars
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(passport.initialize());

// In-memory user store (replace with DB in production)
const users = [];

// JWT Strategy
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || 'dev_secret',
};
passport.use(new JwtStrategy(jwtOptions, (payload, done) => {
  const user = users.find(u => u.id === payload.id);
  if (user) return done(null, user);
  return done(null, false);
}));

// Google OAuth2 Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID || 'GOOGLE_CLIENT_ID',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'GOOGLE_CLIENT_SECRET',
  callbackURL: process.env.BASE_URL + '/api/auth/google/callback',
}, (accessToken, refreshToken, profile, done) => {
  let user = users.find(u => u.googleId === profile.id);
  if (!user) {
    user = { id: users.length + 1, googleId: profile.id, email: profile.emails[0].value, name: profile.displayName };
    users.push(user);
  }
  return done(null, user);
}));

// GitHub OAuth2 Strategy
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID || 'GITHUB_CLIENT_ID',
  clientSecret: process.env.GITHUB_CLIENT_SECRET || 'GITHUB_CLIENT_SECRET',
  callbackURL: process.env.BASE_URL + '/api/auth/github/callback',
}, (accessToken, refreshToken, profile, done) => {
  let user = users.find(u => u.githubId === profile.id);
  if (!user) {
    user = { id: users.length + 1, githubId: profile.id, email: profile.emails[0].value, name: profile.displayName };
    users.push(user);
  }
  return done(null, user);
}));

// Helper: Generate JWT
function generateToken(user) {
  return jwt.sign({ id: user.id, email: user.email, name: user.name }, jwtOptions.secretOrKey, { expiresIn: '1d' });
}

// Register
app.post('/api/auth/register', async (req, res) => {
  const { email, password, name } = req.body;
  if (users.find(u => u.email === email)) return res.status(400).json({ error: 'User already exists' });
  const hashed = await bcrypt.hash(password, 10);
  const user = { id: users.length + 1, email, password: hashed, name };
  users.push(user);
  res.json({ token: generateToken(user), user: { id: user.id, email: user.email, name: user.name } });
});

// Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  if (!user) return res.status(400).json({ error: 'Invalid credentials' });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ error: 'Invalid credentials' });
  res.json({ token: generateToken(user), user: { id: user.id, email: user.email, name: user.name } });
});

// Google OAuth2
app.get('/api/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/api/auth/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/' }), (req, res) => {
  const token = generateToken(req.user);
  // In production, redirect with token or set cookie
  res.json({ token, user: req.user });
});

// GitHub OAuth2
app.get('/api/auth/github', passport.authenticate('github', { scope: ['user:email'] }));
app.get('/api/auth/github/callback', passport.authenticate('github', { session: false, failureRedirect: '/' }), (req, res) => {
  const token = generateToken(req.user);
  // In production, redirect with token or set cookie
  res.json({ token, user: req.user });
});

// Logout (frontend removes token)
app.post('/api/auth/logout', (req, res) => {
  res.json({ message: 'Logged out' });
});

// Get current user
app.get('/api/auth/me', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.json({ user: { id: req.user.id, email: req.user.email, name: req.user.name } });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Auth server running on port ${PORT}`)); 