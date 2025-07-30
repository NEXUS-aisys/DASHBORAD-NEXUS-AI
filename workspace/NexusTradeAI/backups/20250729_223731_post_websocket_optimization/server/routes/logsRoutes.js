const express = require('express');
const axios = require('axios');
const router = express.Router();

// Proxy endpoint for logs service
router.get('/logs', async (req, res) => {
  try {
    // Attempt to fetch logs from the logs service
    const response = await axios.get('http://localhost:4444/logs', {
      timeout: 5000, // 5 second timeout
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Failed to fetch logs from service:', error.message);
    
    // Return a graceful error response
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      res.status(503).json({
        error: 'Logs service unavailable',
        message: 'The logs service is currently unavailable. Please try again later.',
        timestamp: new Date().toISOString()
      });
    } else if (error.code === 'ECONNABORTED') {
      res.status(504).json({
        error: 'Logs service timeout',
        message: 'The logs service is taking too long to respond.',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({
        error: 'Internal server error',
        message: 'An unexpected error occurred while fetching logs.',
        timestamp: new Date().toISOString()
      });
    }
  }
});

// Health check endpoint for logs service
router.get('/logs/health', async (req, res) => {
  try {
    await axios.get('http://localhost:4444/health', { timeout: 3000 });
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(503).json({ 
      status: 'unhealthy', 
      error: error.message,
      timestamp: new Date().toISOString() 
    });
  }
});

module.exports = router;
