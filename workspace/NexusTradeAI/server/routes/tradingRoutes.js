const express = require('express');
const { requireUser } = require('./middleware/auth.js');
const telegramService = require('../services/telegramService');
const cryptoApiService = require('../services/cryptoApiService');
const router = express.Router();

// Mock data for development - replace with actual database calls
const mockPortfolio = {
  totalValue: 125000,
  totalGain: 15000,
  totalGainPercent: 13.6,
  positions: [
    { symbol: 'AAPL', shares: 50, currentPrice: 175.50, value: 8775, gain: 1275 },
    { symbol: 'TSLA', shares: 25, currentPrice: 245.80, value: 6145, gain: -455 },
    { symbol: 'NVDA', shares: 30, currentPrice: 420.25, value: 12607.50, gain: 2107.50 }
  ]
};

const mockTradingHistory = [
  {
    id: '1',
    symbol: 'AAPL',
    type: 'BUY',
    shares: 10,
    price: 170.25,
    date: '2024-01-15T10:30:00Z',
    total: 1702.50
  },
  {
    id: '2',
    symbol: 'TSLA',
    type: 'SELL',
    shares: 5,
    price: 248.90,
    date: '2024-01-14T14:45:00Z',
    total: 1244.50
  }
];

// Get user portfolio
router.get('/portfolio', requireUser, async (req, res) => {
  try {
    // TODO: Replace with actual database query
    // const portfolio = await PortfolioService.getByUserId(req.user.id);
    
    res.json({
      success: true,
      data: mockPortfolio
    });
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch portfolio data'
    });
  }
});

// Get trading history
router.get('/history', requireUser, async (req, res) => {
  try {
    const { page = 1, limit = 20, symbol, type } = req.query;
    
    // TODO: Replace with actual database query with filters
    let history = mockTradingHistory;
    
    if (symbol) {
      history = history.filter(trade => trade.symbol === symbol.toUpperCase());
    }
    
    if (type) {
      history = history.filter(trade => trade.type === type.toUpperCase());
    }
    
    res.json({
      success: true,
      data: {
        trades: history,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: history.length
        }
      }
    });
  } catch (error) {
    console.error('Error fetching trading history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trading history'
    });
  }
});

// Execute a trade
router.post('/execute', requireUser, async (req, res) => {
  try {
    const { symbol, type, shares, price } = req.body;
    
    // Validate input
    if (!symbol || !type || !shares || !price) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: symbol, type, shares, price'
      });
    }
    
    // TODO: Implement actual trade execution logic
    const trade = {
      id: Date.now().toString(),
      symbol: symbol.toUpperCase(),
      type: type.toUpperCase(),
      shares: parseInt(shares),
      price: parseFloat(price),
      date: new Date().toISOString(),
      total: parseInt(shares) * parseFloat(price),
      status: 'EXECUTED'
    };
    
    res.json({
      success: true,
      data: trade,
      message: 'Trade executed successfully'
    });
  } catch (error) {
    console.error('Error executing trade:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to execute trade'
    });
  }
});

// Get market data for a symbol
router.get('/market/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { timeframe = '1D' } = req.query;
    
    // TODO: Replace with actual market data API call
    const mockMarketData = {
      symbol: symbol.toUpperCase(),
      currentPrice: 175.50,
      change: 2.25,
      changePercent: 1.30,
      volume: 45678900,
      marketCap: '2.8T',
      timeframe,
      chartData: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
        price: 170 + Math.random() * 10
      }))
    };
    
    res.json({
      success: true,
      data: mockMarketData
    });
  } catch (error) {
    console.error('Error fetching market data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch market data'
    });
  }
});

// Get AI trading recommendations
router.post('/ai-recommendations', requireUser, async (req, res) => {
  try {
    const { portfolioData } = req.body;
    
    // TODO: Implement actual AI recommendation logic using OpenAI/Anthropic
    const mockRecommendations = [
      {
        symbol: 'AAPL',
        action: 'HOLD',
        confidence: 0.85,
        reason: 'Strong fundamentals and upcoming product launches',
        targetPrice: 185.00
      },
      {
        symbol: 'TSLA',
        action: 'SELL',
        confidence: 0.72,
        reason: 'Overvalued based on current market conditions',
        targetPrice: 220.00
      }
    ];
    
    res.json({
      success: true,
      data: mockRecommendations
    });
  } catch (error) {
    console.error('Error generating AI recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate AI recommendations'
    });
  }
});

// Get trading analytics
router.get('/analytics', requireUser, async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    // TODO: Calculate actual analytics from user's trading data
    const mockAnalytics = {
      period,
      totalTrades: 45,
      winRate: 0.67,
      totalReturn: 0.136,
      sharpeRatio: 1.24,
      maxDrawdown: 0.08,
      avgHoldTime: '12.5 days',
      profitFactor: 1.89
    };
    
    res.json({
      success: true,
      data: mockAnalytics
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trading analytics'
    });
  }
});

// Watchlist routes
router.get('/watchlist', requireUser, async (req, res) => {
  try {
    // TODO: Get user's watchlist from database
    const mockWatchlist = [
      { symbol: 'AAPL', addedDate: '2024-01-10T00:00:00Z' },
      { symbol: 'TSLA', addedDate: '2024-01-12T00:00:00Z' },
      { symbol: 'NVDA', addedDate: '2024-01-15T00:00:00Z' }
    ];
    
    res.json({
      success: true,
      data: mockWatchlist
    });
  } catch (error) {
    console.error('Error fetching watchlist:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch watchlist'
    });
  }
});

router.post('/watchlist', requireUser, async (req, res) => {
  try {
    const { symbol } = req.body;
    
    if (!symbol) {
      return res.status(400).json({
        success: false,
        message: 'Symbol is required'
      });
    }
    
    // TODO: Add to user's watchlist in database
    const watchlistItem = {
      symbol: symbol.toUpperCase(),
      addedDate: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: watchlistItem,
      message: 'Symbol added to watchlist'
    });
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add symbol to watchlist'
    });
  }
});

router.delete('/watchlist/:symbol', requireUser, async (req, res) => {
  try {
    const { symbol } = req.params;
    
    // TODO: Remove from user's watchlist in database
    
    res.json({
      success: true,
      message: `${symbol.toUpperCase()} removed from watchlist`
    });
  } catch (error) {
    console.error('Error removing from watchlist:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove symbol from watchlist'
    });
  }
});

// Trading journal routes
router.get('/journal', requireUser, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    // TODO: Get journal entries from database
    const mockJournalEntries = [
      {
        id: '1',
        date: '2024-01-15T00:00:00Z',
        symbol: 'AAPL',
        entry: 'Bought AAPL based on strong earnings report',
        mood: 'confident',
        tags: ['earnings', 'tech']
      }
    ];
    
    res.json({
      success: true,
      data: {
        entries: mockJournalEntries,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: mockJournalEntries.length
        }
      }
    });
  } catch (error) {
    console.error('Error fetching journal entries:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch journal entries'
    });
  }
});

router.post('/journal', requireUser, async (req, res) => {
  try {
    const { date, symbol, entry, mood, tags } = req.body;
    
    // TODO: Save to database
    const journalEntry = {
      id: Date.now().toString(),
      userId: req.user.id,
      date: date || new Date().toISOString(),
      symbol,
      entry,
      mood,
      tags: tags || []
    };
    
    res.json({
      success: true,
      data: journalEntry,
      message: 'Journal entry saved successfully'
    });
  } catch (error) {
    console.error('Error saving journal entry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save journal entry'
    });
  }
});

// Get trading signals for a single symbol (Interactive Signals with AI)
router.get('/signals/:symbol', requireUser, async (req, res) => {
  try {
    const { symbol } = req.params;
    const { refresh = false, notify = false } = req.query;
    
    // TODO: Implement actual signal generation logic with AI
    // For now, return mock data
    const mockSignal = {
      symbol: symbol.toUpperCase(),
      timestamp: new Date().toISOString(),
      error: null,
      summary: {
        signal: Math.random() > 0.5 ? 'BUY' : 'SELL',
        confidence: Math.floor(Math.random() * 40) + 60, // 60-100
        sentiment: Math.random() > 0.5 ? 'bullish' : 'bearish',
        entryPrice: { min: 4850, max: 4860 },
        targetPrice: 4920,
        stopLoss: 4810,
        riskRewardRatio: 2.5
      },
      marketData: {
        currentPrice: 4855.25,
        change: 12.50,
        changePercent: 0.26,
        volume: 1250000,
        high: 4865.50,
        low: 4840.75
      }
    };
    
    // Send Telegram notification if requested and signal is strong
    if (notify === 'true' && mockSignal.summary.confidence >= 75) {
      try {
        const telegramSignal = {
          symbol: mockSignal.symbol,
          signal: mockSignal.summary.signal,
          confidence: mockSignal.summary.confidence,
          price: mockSignal.marketData.currentPrice,
          target: mockSignal.summary.targetPrice,
          stopLoss: mockSignal.summary.stopLoss,
          strategy: 'Interactive AI Analysis',
          timestamp: mockSignal.timestamp
        };
        
        await telegramService.sendTradingSignal(telegramSignal);
        console.log(`Telegram notification sent for ${symbol} signal`);
      } catch (telegramError) {
        console.error('Telegram notification failed:', telegramError);
        // Don't fail the main request if Telegram fails
      }
    }
    
    res.json({
      success: true,
      data: mockSignal
    });
  } catch (error) {
    console.error('Error fetching signals:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch signals'
    });
  }
});

// Get batch signals for multiple symbols (Auto Signals without AI)
router.post('/signals/batch', requireUser, async (req, res) => {
  try {
    const { symbols = [], notify = false } = req.body;
    
    if (!Array.isArray(symbols) || symbols.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Symbols array is required'
      });
    }
    
    // TODO: Implement actual batch signal generation with technical analysis
    // For now, return mock data for each symbol
    const batchSignals = symbols.map(symbol => ({
      symbol: symbol.toUpperCase(),
      timestamp: new Date().toISOString(),
      error: null,
      summary: {
        signal: Math.random() > 0.5 ? 'BUY' : 'SELL',
        confidence: Math.floor(Math.random() * 40) + 60,
        sentiment: Math.random() > 0.5 ? 'bullish' : 'bearish',
        entryPrice: { min: 4850, max: 4860 },
        targetPrice: 4920,
        stopLoss: 4810,
        riskRewardRatio: 2.5
      },
      marketData: {
        currentPrice: 4855.25,
        change: 12.50,
        changePercent: 0.26,
        volume: 1250000,
        high: 4865.50,
        low: 4840.75
      }
    }));
    
    // Send Telegram notifications for strong signals if requested
    if (notify === true) {
      const strongSignals = batchSignals.filter(signal => 
        signal.summary.confidence >= 80 && !signal.error
      );
      
      for (const signal of strongSignals) {
        try {
          const telegramSignal = {
            symbol: signal.symbol,
            signal: signal.summary.signal,
            confidence: signal.summary.confidence,
            price: signal.marketData.currentPrice,
            target: signal.summary.targetPrice,
            stopLoss: signal.summary.stopLoss,
            strategy: 'Auto Technical Analysis',
            timestamp: signal.timestamp
          };
          
          await telegramService.sendTradingSignal(telegramSignal);
          console.log(`Telegram notification sent for ${signal.symbol} auto signal`);
        } catch (telegramError) {
          console.error(`Telegram notification failed for ${signal.symbol}:`, telegramError);
          // Continue with other signals even if one fails
        }
      }
    }
    
    res.json({
      success: true,
      data: batchSignals
    });
  } catch (error) {
    console.error('Error fetching batch signals:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch batch signals'
    });
  }
});

// Get market providers status
router.get('/market/providers', requireUser, async (req, res) => {
  try {
    // TODO: Implement actual provider status checking
    const mockProviders = [
      { name: 'Yahoo Finance', enabled: true, hasApiKey: false, status: 'active' },
      { name: 'Alpha Vantage', enabled: true, hasApiKey: true, status: 'active' },
      { name: 'Finnhub', enabled: true, hasApiKey: true, status: 'active' },
      { name: 'Polygon.io', enabled: false, hasApiKey: false, status: 'inactive' },
      { name: 'IEX Cloud', enabled: true, hasApiKey: true, status: 'active' }
    ];
    
    const mockCache = {
      hits: 85,
      misses: 15,
      hitRate: 0.85,
      size: '2.3MB'
    };
    
    res.json({
      success: true,
      data: {
        providers: mockProviders,
        cache: mockCache
      }
    });
  } catch (error) {
    console.error('Error fetching providers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch providers'
    });
  }
});

// Clear market data cache
router.post('/market/clear-cache', requireUser, async (req, res) => {
  try {
    // TODO: Implement actual cache clearing
    console.log('Cache cleared by user:', req.user.id);
    
    res.json({
      success: true,
      message: 'Cache cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing cache:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cache'
    });
  }
});

// Get indicator signals for a symbol
router.get('/indicators/signals/:symbol', requireUser, async (req, res) => {
  try {
    const { symbol } = req.params;
    
    // TODO: Implement actual indicator calculation
    const mockIndicatorSignals = [
      { indicator: 'RSI', signal: 'BUY', value: 35, threshold: 30 },
      { indicator: 'MACD', signal: 'SELL', value: -0.5, threshold: 0 },
      { indicator: 'Bollinger Bands', signal: 'HOLD', value: 'middle', threshold: 'upper' },
      { indicator: 'Stochastic', signal: 'BUY', value: 25, threshold: 20 }
    ];
    
    res.json({
      success: true,
      data: {
        symbol: symbol.toUpperCase(),
        signals: mockIndicatorSignals
      }
    });
  } catch (error) {
    console.error('Error fetching indicator signals:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch indicator signals'
    });
  }
});

// Telegram notification management
router.post('/telegram/activate', requireUser, async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }
    
    const result = await telegramService.activateUserNotifications(req.user.id, phoneNumber);
    
    res.json({
      success: result.success,
      message: result.message || 'Telegram notifications activated'
    });
  } catch (error) {
    console.error('Error activating Telegram notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to activate Telegram notifications'
    });
  }
});

router.get('/telegram/status', requireUser, async (req, res) => {
  try {
    const status = await telegramService.getUserActivationStatus(req.user.id);
    
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Error getting Telegram status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get Telegram status'
    });
  }
});

// Test endpoint for Telegram status (no authentication required)
router.get('/test/telegram/status', async (req, res) => {
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

// Test Telegram connection
router.post('/telegram/test', requireUser, async (req, res) => {
  try {
    const { botToken, chatId } = req.body;
    
    if (!botToken || !chatId) {
      return res.status(400).json({
        success: false,
        message: 'Bot token and chat ID are required'
      });
    }
    
    const result = await telegramService.testConnection(botToken, chatId);
    
    res.json({
      success: result.success,
      message: result.success ? 'Telegram connection successful' : result.error
    });
  } catch (error) {
    console.error('Error testing Telegram connection:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to test Telegram connection'
    });
  }
});

// Test endpoint for Interactive Signals (no authentication required)
router.get('/test/signals/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { refresh = false, notify = false } = req.query;
    
    console.log(`🔍 Generating Interactive Signal for ${symbol} (refresh: ${refresh}, notify: ${notify})`);
    
    // Generate mock Interactive Signal with AI analysis
    const mockSignal = {
      symbol: symbol.toUpperCase(),
      timestamp: new Date().toISOString(),
      error: null,
      summary: {
        signal: Math.random() > 0.5 ? 'BUY' : 'SELL',
        confidence: Math.floor(Math.random() * 40) + 60, // 60-100
        sentiment: Math.random() > 0.5 ? 'bullish' : 'bearish',
        entryPrice: { min: 4850, max: 4860 },
        targetPrice: 4920,
        stopLoss: 4810,
        riskRewardRatio: 2.5
      },
      marketData: {
        currentPrice: 4855.25,
        change: 12.50,
        changePercent: 0.26,
        volume: 1250000,
        high: 4865.50,
        low: 4840.75
      },
      aiAnalysis: {
        provider: 'Interactive AI',
        reasoning: 'Based on technical analysis and market sentiment, the AI model suggests a bullish outlook with strong momentum indicators.',
        keyFactors: [
          'RSI showing oversold conditions',
          'MACD crossover indicating bullish momentum',
          'Volume spike confirming price action',
          'Support level holding at 4850'
        ],
        riskAssessment: 'Medium risk with clear stop-loss levels'
      }
    };
    
    // Simulate Telegram notification if requested
    if (notify === 'true' && mockSignal.summary.confidence >= 75) {
      console.log(`📱 Would send Telegram notification for ${symbol} (confidence: ${mockSignal.summary.confidence}%)`);
    }
    
    console.log(`✅ Interactive Signal generated for ${symbol}: ${mockSignal.summary.signal} (${mockSignal.summary.confidence}% confidence)`);
    
    res.json({
      success: true,
      data: mockSignal,
      message: 'Interactive Signal generated successfully'
    });
  } catch (error) {
    console.error('Error generating test signal:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate test signal'
    });
  }
});

// Test endpoint for crypto API (no authentication required)
router.post('/test/crypto-api', async (req, res) => {
  try {
    const { exchange, apiKey, secretKey, passphrase } = req.body;
    
    if (!exchange || !apiKey || !secretKey) {
      return res.status(400).json({ 
        success: false, 
        message: 'Exchange, API key, and secret key are required' 
      });
    }

    console.log(`🔐 Testing ${exchange} API connection (test endpoint)...`);
    
    const result = await cryptoApiService.testApiConnection(exchange, apiKey, secretKey, passphrase);
    
    if (result.success) {
      console.log(`✅ ${exchange} API connection successful`);
      res.json({ 
        success: true, 
        message: `${exchange} API connection successful`,
        data: result.data,
        exchange: result.exchange
      });
    } else {
      console.log(`❌ ${exchange} API connection failed: ${result.error}`);
      res.status(400).json({ 
        success: false, 
        message: `${exchange} API connection failed`,
        error: result.error,
        exchange: result.exchange
      });
    }
  } catch (error) {
    console.error('Error testing crypto API:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Test Crypto API connection
router.post('/test-crypto-api', requireUser, async (req, res) => {
  try {
    const { exchange, apiKey, secretKey, passphrase } = req.body;
    
    if (!exchange || !apiKey || !secretKey) {
      return res.status(400).json({ 
        success: false, 
        message: 'Exchange, API key, and secret key are required' 
      });
    }

    console.log(`🔐 Testing ${exchange} API connection for user...`);
    
    const result = await cryptoApiService.testApiConnection(exchange, apiKey, secretKey, passphrase);
    
    if (result.success) {
      console.log(`✅ ${exchange} API connection successful`);
      res.json({ 
        success: true, 
        message: `${exchange} API connection successful`,
        data: result.data,
        exchange: result.exchange
      });
    } else {
      console.log(`❌ ${exchange} API connection failed: ${result.error}`);
      res.status(400).json({ 
        success: false, 
        message: `${exchange} API connection failed`,
        error: result.error,
        exchange: result.exchange
      });
    }
  } catch (error) {
    console.error('Error testing crypto API:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Get supported crypto exchanges
router.get('/crypto-exchanges', requireUser, async (req, res) => {
  try {
    const exchanges = cryptoApiService.getSupportedExchanges();
    res.json({ 
      success: true, 
      data: exchanges,
      message: 'Supported crypto exchanges retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting supported exchanges:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Test endpoint for crypto exchanges (no authentication required)
router.get('/test/crypto-exchanges', async (req, res) => {
  try {
    const exchanges = cryptoApiService.getSupportedExchanges();
    res.json({ 
      success: true, 
      data: exchanges,
      message: 'Supported crypto exchanges retrieved successfully - this endpoint works without authentication'
    });
  } catch (error) {
    console.error('Error getting supported exchanges:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Test endpoint for crypto API (no authentication required)
router.post('/test/crypto-api', async (req, res) => {
  try {
    const { exchange, apiKey, secretKey, passphrase } = req.body;
    
    if (!exchange || !apiKey || !secretKey) {
      return res.status(400).json({ 
        success: false, 
        message: 'Exchange, API key, and secret key are required' 
      });
    }

    console.log(`🔐 Testing ${exchange} API connection (test endpoint)...`);
    
    const result = await cryptoApiService.testApiConnection(exchange, apiKey, secretKey, passphrase);
    
    if (result.success) {
      console.log(`✅ ${exchange} API connection successful`);
      res.json({ 
        success: true, 
        message: `${exchange} API connection successful`,
        data: result.data,
        exchange: result.exchange
      });
    } else {
      console.log(`❌ ${exchange} API connection failed: ${result.error}`);
      res.status(400).json({ 
        success: false, 
        message: `${exchange} API connection failed`,
        error: result.error,
        exchange: result.exchange
      });
    }
  } catch (error) {
    console.error('Error testing crypto API:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router;
