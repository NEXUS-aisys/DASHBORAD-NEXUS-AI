const express = require('express');
const router = express.Router();
const telegramService = require('../services/telegramService');
const verifyAuth = require('../utils/verifyAuth');

// Admin: Test Telegram bot connection
router.post('/test', verifyAuth, async (req, res) => {
  try {
    const { botToken, chatId } = req.body;
    
    if (!botToken || !chatId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Bot token and chat ID are required' 
      });
    }

    const result = await telegramService.testConnection(botToken, chatId);
    
    if (result.success) {
      res.json({ success: true, message: 'Telegram connection test successful' });
    } else {
      res.status(400).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error('Telegram test error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// User: Activate Telegram notifications
router.post('/activate', verifyAuth, async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    const userId = req.user.id;
    
    if (!phoneNumber) {
      return res.status(400).json({ 
        success: false, 
        error: 'Phone number is required' 
      });
    }

    // Store user's phone number for Telegram notifications
    // In a real app, you'd store this in the database
    const result = await telegramService.activateUserNotifications(userId, phoneNumber);
    
    if (result.success) {
      res.json({ success: true, message: 'Telegram notifications activated successfully' });
    } else {
      res.status(400).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error('Telegram activation error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// User: Get activation status
router.get('/activation-status', verifyAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const status = await telegramService.getUserActivationStatus(userId);
    res.json(status);
  } catch (error) {
    console.error('Get activation status error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Get bot information
router.get('/bot-info/:botToken', verifyAuth, async (req, res) => {
  try {
    const { botToken } = req.params;
    
    if (!botToken) {
      return res.status(400).json({ 
        success: false, 
        error: 'Bot token is required' 
      });
    }

    const result = await telegramService.getBotInfo(botToken);
    res.json(result);
  } catch (error) {
    console.error('Get bot info error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Test endpoint for Telegram status (no authentication required)
router.get('/status', async (req, res) => {
  try {
    res.json({ 
      success: true, 
      message: 'Telegram service is available',
      status: 'disabled',
      note: 'Telegram integration requires authentication'
    });
  } catch (error) {
    console.error('Telegram status error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Validate chat ID
router.post('/validate-chat', verifyAuth, async (req, res) => {
  try {
    const { botToken, chatId } = req.body;
    
    if (!botToken || !chatId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Bot token and chat ID are required' 
      });
    }

    const result = await telegramService.validateChatId(botToken, chatId);
    res.json(result);
  } catch (error) {
    console.error('Validate chat ID error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Admin: Send test signal
router.post('/test-signal', verifyAuth, async (req, res) => {
  try {
    const testSignal = {
      symbol: 'TEST',
      signal: 'BUY',
      confidence: 95,
      price: 100.00,
      target: 110.00,
      stopLoss: 95.00,
      strategy: 'Test Strategy',
      timestamp: new Date().toISOString()
    };

    const result = await telegramService.sendTradingSignal(testSignal);
    res.json(result);
  } catch (error) {
    console.error('Test signal error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Send custom message (for testing)
router.post('/send-message', verifyAuth, async (req, res) => {
  try {
    const { botToken, chatId, message } = req.body;
    
    if (!botToken || !chatId || !message) {
      return res.status(400).json({ 
        success: false, 
        error: 'Bot token, chat ID, and message are required' 
      });
    }

    const result = await telegramService.sendMessage(botToken, chatId, message);
    res.json(result);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

module.exports = router; 