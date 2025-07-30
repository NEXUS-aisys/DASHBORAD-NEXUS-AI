const express = require('express');
const UserService = require('../services/userService.js');
const { requireUser } = require('./middleware/auth.js');
const User = require('../models/User.js');
const { generateAccessToken, generateRefreshToken } = require('../utils/auth.js');
const jwt = require('jsonwebtoken');

const router = express.Router();

router.post('/login', async (req, res) => {
  const sendError = msg => res.status(400).json({ message: msg });
  const { email, password } = req.body;

  if (!email || !password) {
    return sendError('Email and password are required');
  }

  // Mock authentication - accept any email/password for development
  const mockUser = {
    id: 'user_' + Date.now(),
    name: email.split('@')[0],
    email: email,
    role: 'trader',
    createdAt: new Date().toISOString()
  };

  // Generate mock tokens
  const accessToken = 'mock_access_token_' + Date.now();
  const refreshToken = 'mock_refresh_token_' + Date.now();

  return res.json({
    ...mockUser,
    accessToken,
    refreshToken
  });
});

router.post('/register', async (req, res, next) => {
  const sendError = msg => res.status(400).json({ message: msg });
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return sendError('Name, email, and password are required');
  }

  // Mock registration - accept any valid data for development
  const mockUser = {
    id: 'user_' + Date.now(),
    name: name,
    email: email,
    role: 'trader',
    createdAt: new Date().toISOString()
  };

  // Generate mock tokens
  const accessToken = 'mock_access_token_' + Date.now();
  const refreshToken = 'mock_refresh_token_' + Date.now();

  return res.json({
    ...mockUser,
    accessToken,
    refreshToken
  });
});

router.post('/logout', async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (user) {
    user.refreshToken = null;
    await user.save();
  }

  res.status(200).json({ message: 'User logged out successfully.' });
});

router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      message: 'Refresh token is required'
    });
  }

  try {
    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    // Find the user
    const user = await UserService.get(decoded.sub);

    if (!user) {
      return res.status(403).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.refreshToken !== refreshToken) {
      return res.status(403).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // Update user's refresh token in database
    user.refreshToken = newRefreshToken;
    await user.save();

    // Return new tokens
    return res.status(200).json({
      success: true,
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      }
    });

  } catch (error) {
    console.error(`Token refresh error: ${error.message}`);

    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({
        success: false,
        message: 'Refresh token has expired'
      });
    }

    return res.status(403).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
});

router.get('/me', requireUser, async (req, res) => {
  return res.status(200).json(req.user);
});

module.exports = router;
