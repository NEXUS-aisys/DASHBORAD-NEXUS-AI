const express = require('express');
const { requireUser } = require('./middleware/auth.js');
const router = express.Router();

// This will be initialized when the server starts
let dataSourceManager = null;

// Initialize the data source manager (called from server.js)
const initializeDataSourceManager = (manager) => {
  dataSourceManager = manager;
};

/**
 * Test symbol search (no authentication required)
 * GET /api/symbols/test-search?q=BTC&limit=5
 */
router.get('/test-search', async (req, res) => {
  try {
    if (!dataSourceManager || !dataSourceManager.isReady()) {
      return res.status(503).json({
        success: false,
        message: 'Data source manager not ready'
      });
    }

    const { 
      q: query, 
      limit = 5, 
      providers, 
      categories 
    } = req.query;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const searchOptions = {
      limit: parseInt(limit),
      userId: null, // No user ID for test
      providers: providers ? providers.split(',') : null,
      categories: categories ? categories.split(',') : null
    };

    const results = await dataSourceManager.searchSymbols(query.trim(), searchOptions);

    res.json({
      success: true,
      data: results,
      message: 'Test search completed - this endpoint works without authentication'
    });

  } catch (error) {
    console.error('Test symbol search error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search symbols',
      error: error.message
    });
  }
});

/**
 * Test market data (no authentication required)
 * GET /api/symbols/test-market-data/:symbol?provider=yahoo_finance
 */
router.get('/test-market-data/:symbol', async (req, res) => {
  try {
    if (!dataSourceManager || !dataSourceManager.isReady()) {
      return res.status(503).json({
        success: false,
        message: 'Data source manager not ready'
      });
    }

    const { symbol } = req.params;
    const { provider = null } = req.query;

    if (!symbol || symbol.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Symbol is required'
      });
    }

    const result = await dataSourceManager.getMarketData(
      symbol.trim().toUpperCase(), 
      provider, 
      null // No user ID for test
    );

    // Handle the new response format from DataSourceManager
    if (result.status === 'success') {
      res.json({
        status: 'success',
        data: result.data,
        provider: result.provider,
        fallback: result.fallback || false,
        message: 'Test market data completed - this endpoint works without authentication'
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: 'Failed to get market data',
        error: result.error,
        symbol: result.symbol
      });
    }

  } catch (error) {
    console.error('Test market data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get market data',
      error: error.message
    });
  }
});

/**
 * Search symbols across all available providers
 * GET /api/symbols/search?q=BTC&limit=10&providers=yahoo_finance,rithmic_websocket&categories=crypto,futures
 */
router.get('/search', requireUser, async (req, res) => {
  try {
    if (!dataSourceManager || !dataSourceManager.isReady()) {
      return res.status(503).json({
        success: false,
        message: 'Data source manager not ready'
      });
    }

    const { 
      q: query, 
      limit = 10, 
      providers, 
      categories 
    } = req.query;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const searchOptions = {
      limit: parseInt(limit),
      userId: req.user.id,
      providers: providers ? providers.split(',') : null,
      categories: categories ? categories.split(',') : null
    };

    const results = await dataSourceManager.searchSymbols(query.trim(), searchOptions);

    res.json({
      success: true,
      data: results
    });

  } catch (error) {
    console.error('Symbol search error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search symbols',
      error: error.message
    });
  }
});

/**
 * Get popular symbols across providers
 * GET /api/symbols/popular?category=stocks&limit=10
 */
router.get('/popular', requireUser, async (req, res) => {
  try {
    if (!dataSourceManager || !dataSourceManager.isReady()) {
      return res.status(503).json({
        success: false,
        message: 'Data source manager not ready'
      });
    }

    const { 
      category = 'all', 
      limit = 10 
    } = req.query;

    const options = {
      category: category,
      limit: parseInt(limit),
      userId: req.user.id
    };

    const results = await dataSourceManager.getPopularSymbols(options);

    res.json({
      success: true,
      data: results
    });

  } catch (error) {
    console.error('Popular symbols error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get popular symbols',
      error: error.message
    });
  }
});

/**
 * Get real-time market data for a symbol
 * GET /api/symbols/market-data/:symbol?provider=yahoo_finance
 */
router.get('/market-data/:symbol', requireUser, async (req, res) => {
  try {
    if (!dataSourceManager || !dataSourceManager.isReady()) {
      return res.status(503).json({
        success: false,
        message: 'Data source manager not ready'
      });
    }

    const { symbol } = req.params;
    const { provider = null } = req.query;

    if (!symbol || symbol.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Symbol is required'
      });
    }

    const marketData = await dataSourceManager.getMarketData(
      symbol.trim().toUpperCase(), 
      provider, 
      req.user.id
    );

    res.json({
      success: true,
      data: marketData
    });

  } catch (error) {
    console.error('Market data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get market data',
      error: error.message
    });
  }
});

/**
 * Get available data providers for the user
 * GET /api/symbols/providers
 */
router.get('/providers', requireUser, async (req, res) => {
  try {
    if (!dataSourceManager || !dataSourceManager.isReady()) {
      return res.status(503).json({
        success: false,
        message: 'Data source manager not ready'
      });
    }

    const capabilities = await dataSourceManager.getProviderCapabilities(req.user.id);
    const availableProviders = await dataSourceManager.getAvailableProviders(req.user.id);

    const providersInfo = availableProviders.map(provider => ({
      name: provider.name,
      displayName: provider.displayName || provider.name,
      type: provider.type,
      capabilities: capabilities[provider.name] || {}
    }));

    res.json({
      success: true,
      data: {
        providers: providersInfo,
        total: providersInfo.length
      }
    });

  } catch (error) {
    console.error('Providers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get providers',
      error: error.message
    });
  }
});

/**
 * Test all provider connections
 * GET /api/symbols/test-connections
 */
router.get('/test-connections', requireUser, async (req, res) => {
  try {
    if (!dataSourceManager || !dataSourceManager.isReady()) {
      return res.status(503).json({
        success: false,
        message: 'Data source manager not ready'
      });
    }

    const testResults = await dataSourceManager.testAllConnections(req.user.id);

    res.json({
      success: true,
      data: testResults
    });

  } catch (error) {
    console.error('Connection test error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to test connections',
      error: error.message
    });
  }
});

/**
 * Get futures contracts for a base symbol (e.g., NQ -> NQU25, NQZ25, etc.)
 * GET /api/symbols/futures?base=NQ&limit=10
 */
router.get('/futures', requireUser, async (req, res) => {
  try {
    if (!dataSourceManager || !dataSourceManager.isReady()) {
      return res.status(503).json({
        success: false,
        message: 'Data source manager not ready'
      });
    }

    const { base, limit = 10 } = req.query;

    if (!base || base.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Base symbol is required'
      });
    }

    // Get Rithmic provider for futures data
    const rithmicProvider = dataSourceManager.getCoreProvider('rithmic_websocket');
    if (!rithmicProvider) {
      return res.status(404).json({
        success: false,
        message: 'Rithmic provider not available'
      });
    }

    // Search for futures contracts
    const searchQuery = base.trim().toUpperCase();
    const symbols = await rithmicProvider.searchSymbols(searchQuery, parseInt(limit));

    // Filter to only include actual contracts (with expiration months)
    const futuresContracts = symbols.filter(symbol => {
      const sym = symbol.symbol;
      return sym.match(/^[A-Z]{1,3}[FGHJKMNQUVXZ]\d{2}$/) || // Standard futures format (ESU25)
             sym.includes(searchQuery); // Or contains the base symbol
    });

    res.json({
      success: true,
      data: {
        baseSymbol: searchQuery,
        contracts: futuresContracts,
        total: futuresContracts.length
      }
    });

  } catch (error) {
    console.error('Futures contracts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get futures contracts',
      error: error.message
    });
  }
});

/**
 * Get crypto pairs for a base symbol (e.g., BTC -> BTC/USD, BTC/ETH, etc.)
 * GET /api/symbols/crypto?base=BTC&limit=10
 */
router.get('/crypto', requireUser, async (req, res) => {
  try {
    if (!dataSourceManager || !dataSourceManager.isReady()) {
      return res.status(503).json({
        success: false,
        message: 'Data source manager not ready'
      });
    }

    const { base, limit = 10 } = req.query;

    if (!base || base.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Base symbol is required'
      });
    }

    const searchQuery = base.trim().toUpperCase();
    const searchOptions = {
      limit: parseInt(limit),
      userId: req.user.id,
      categories: ['crypto', 'Cryptocurrency']
    };

    // Search across all providers for crypto pairs
    const results = await dataSourceManager.searchSymbols(searchQuery, searchOptions);

    // Aggregate all crypto results
    const cryptoPairs = [];
    Object.values(results.providers).forEach(providerResult => {
      if (providerResult.success && providerResult.results) {
        cryptoPairs.push(...providerResult.results);
      }
    });

    // Sort by relevance (exact matches first)
    cryptoPairs.sort((a, b) => {
      const aExact = a.symbol.startsWith(searchQuery);
      const bExact = b.symbol.startsWith(searchQuery);
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      return a.symbol.localeCompare(b.symbol);
    });

    res.json({
      success: true,
      data: {
        baseSymbol: searchQuery,
        pairs: cryptoPairs.slice(0, parseInt(limit)),
        total: cryptoPairs.length,
        providers: Object.keys(results.providers).filter(p => 
          results.providers[p].success && results.providers[p].resultCount > 0
        )
      }
    });

  } catch (error) {
    console.error('Crypto pairs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get crypto pairs',
      error: error.message
    });
  }
});

/**
 * Bulk symbol search for multiple queries
 * POST /api/symbols/bulk-search
 * Body: { queries: ["BTC", "AAPL", "NQ"], limit: 5 }
 */
router.post('/bulk-search', requireUser, async (req, res) => {
  try {
    if (!dataSourceManager || !dataSourceManager.isReady()) {
      return res.status(503).json({
        success: false,
        message: 'Data source manager not ready'
      });
    }

    const { queries, limit = 5, providers, categories } = req.body;

    if (!queries || !Array.isArray(queries) || queries.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Queries array is required'
      });
    }

    if (queries.length > 50) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 50 queries allowed per request'
      });
    }

    const searchOptions = {
      limit: parseInt(limit),
      userId: req.user.id,
      providers: providers ? providers : null,
      categories: categories ? categories : null
    };

    // Execute all searches in parallel
    const searchPromises = queries.map(async (query) => {
      try {
        const result = await dataSourceManager.searchSymbols(query.trim(), searchOptions);
        return {
          query: query.trim(),
          success: true,
          result: result
        };
      } catch (error) {
        return {
          query: query.trim(),
          success: false,
          error: error.message
        };
      }
    });

    const bulkResults = await Promise.all(searchPromises);

    res.json({
      success: true,
      data: {
        queries: queries,
        results: bulkResults,
        summary: {
          total: bulkResults.length,
          successful: bulkResults.filter(r => r.success).length,
          failed: bulkResults.filter(r => !r.success).length
        }
      }
    });

  } catch (error) {
    console.error('Bulk search error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to execute bulk search',
      error: error.message
    });
  }
});

/**
 * Subscribe to real-time data for a symbol (WebSocket-based providers)
 * POST /api/symbols/subscribe
 * Body: { symbol: "ESU25", provider: "rithmic_websocket" }
 */
router.post('/subscribe', requireUser, async (req, res) => {
  try {
    if (!dataSourceManager || !dataSourceManager.isReady()) {
      return res.status(503).json({
        success: false,
        message: 'Data source manager not ready'
      });
    }

    const { symbol, provider = 'rithmic_websocket' } = req.body;

    if (!symbol || symbol.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Symbol is required'
      });
    }

    const targetProvider = dataSourceManager.getCoreProvider(provider);
    if (!targetProvider) {
      return res.status(404).json({
        success: false,
        message: `Provider ${provider} not found`
      });
    }

    if (typeof targetProvider.subscribeToSymbol !== 'function') {
      return res.status(400).json({
        success: false,
        message: `Provider ${provider} does not support subscriptions`
      });
    }

    const subscribed = targetProvider.subscribeToSymbol(symbol.trim().toUpperCase());

    res.json({
      success: subscribed,
      message: subscribed 
        ? `Subscribed to ${symbol} on ${provider}` 
        : `Failed to subscribe to ${symbol} on ${provider}`,
      data: {
        symbol: symbol.trim().toUpperCase(),
        provider: provider
      }
    });

  } catch (error) {
    console.error('Subscribe error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to subscribe to symbol',
      error: error.message
    });
  }
});

/**
 * Get comprehensive analysis for a symbol (test endpoint - no auth required)
 * GET /api/symbols/test-analysis/:symbol
 */
router.get('/test-analysis/:symbol', async (req, res) => {
  try {
    if (!dataSourceManager || !dataSourceManager.isReady()) {
      return res.status(503).json({
        success: false,
        message: 'Data source manager not ready'
      });
    }

    const { symbol } = req.params;

    if (!symbol || symbol.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Symbol is required'
      });
    }

    const symbolUpper = symbol.trim().toUpperCase();
    console.log(`🔍 Generating comprehensive analysis for ${symbolUpper}`);

    // Get real-time market data
    const marketDataResult = await dataSourceManager.getMarketData(symbolUpper, null, null);
    
    if (marketDataResult.status === 'error') {
      return res.status(500).json({
        success: false,
        message: 'Failed to get market data for analysis',
        error: marketDataResult.error
      });
    }

    const marketData = marketDataResult.data;
    const currentPrice = marketData.price;
    const change = marketData.change || 0;
    const changePercent = marketData.changePercent || 0;

    // Generate technical analysis
    const technicalAnalysis = {
      trend: changePercent > 2 ? 'STRONG_BULLISH' : 
             changePercent > 0.5 ? 'BULLISH' :
             changePercent < -2 ? 'STRONG_BEARISH' :
             changePercent < -0.5 ? 'BEARISH' : 'NEUTRAL',
      momentum: Math.abs(changePercent) > 3 ? 'HIGH' :
                Math.abs(changePercent) > 1 ? 'MEDIUM' : 'LOW',
      volatility: Math.abs(changePercent),
      support: currentPrice * 0.95,
      resistance: currentPrice * 1.05,
      rsi: 30 + Math.random() * 40, // Simulated RSI between 30-70
      macd: {
        value: (Math.random() - 0.5) * 2,
        signal: Math.random() > 0.5 ? 'BUY' : 'SELL'
      }
    };

    // Generate trading signals
    const signals = {
      overall: changePercent > 1 ? 'BUY' : changePercent < -1 ? 'SELL' : 'HOLD',
      confidence: Math.min(95, 50 + Math.abs(changePercent) * 10),
      shortTerm: technicalAnalysis.momentum === 'HIGH' ? 
                 (changePercent > 0 ? 'BUY' : 'SELL') : 'HOLD',
      mediumTerm: technicalAnalysis.trend.includes('BULLISH') ? 'BUY' :
                  technicalAnalysis.trend.includes('BEARISH') ? 'SELL' : 'HOLD',
      longTerm: 'HOLD' // Conservative for long-term
    };

    // Generate risk assessment
    const riskAssessment = {
      level: Math.abs(changePercent) > 5 ? 'HIGH' :
             Math.abs(changePercent) > 2 ? 'MEDIUM' : 'LOW',
      factors: [
        `Price volatility: ${Math.abs(changePercent).toFixed(2)}%`,
        `Volume: ${marketData.volume ? 'Normal' : 'Low'}`,
        `Trend strength: ${technicalAnalysis.momentum}`
      ],
      recommendation: signals.overall === 'BUY' ? 'Consider buying with stop-loss' :
                     signals.overall === 'SELL' ? 'Consider selling or shorting' :
                     'Hold position or wait for clearer signals'
    };

    // Generate key insights
    const insights = [
      `Current price is ${changePercent >= 0 ? 'up' : 'down'} ${Math.abs(changePercent).toFixed(2)}% today`,
      `Technical trend is ${technicalAnalysis.trend.toLowerCase().replace('_', ' ')}`,
      `Market momentum is ${technicalAnalysis.momentum.toLowerCase()}`,
      `Risk level is assessed as ${riskAssessment.level.toLowerCase()}`,
      `Overall signal: ${signals.overall} with ${signals.confidence.toFixed(0)}% confidence`
    ];

    // Generate price targets
    const priceTargets = {
      immediate: {
        support: currentPrice * 0.98,
        resistance: currentPrice * 1.02
      },
      nearTerm: {
        support: currentPrice * 0.95,
        resistance: currentPrice * 1.05
      },
      longTerm: {
        support: currentPrice * 0.90,
        resistance: currentPrice * 1.15
      }
    };

    const comprehensiveAnalysis = {
      symbol: symbolUpper,
      timestamp: new Date().toISOString(),
      marketData: marketData,
      technicalAnalysis: technicalAnalysis,
      signals: signals,
      riskAssessment: riskAssessment,
      priceTargets: priceTargets,
      insights: insights,
      provider: marketDataResult.provider,
      dataQuality: marketDataResult.fallback ? 'fallback' : 'primary'
    };

    console.log(`✅ Generated comprehensive analysis for ${symbolUpper}`);

    res.json({
      success: true,
      data: comprehensiveAnalysis,
      message: `Comprehensive analysis completed for ${symbolUpper}`
    });

  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate analysis',
      error: error.message
    });
  }
});

/**
 * Get symbol categories available across providers
 * GET /api/symbols/categories
 */
router.get('/categories', requireUser, async (req, res) => {
  try {
    if (!dataSourceManager || !dataSourceManager.isReady()) {
      return res.status(503).json({
        success: false,
        message: 'Data source manager not ready'
      });
    }

    const capabilities = await dataSourceManager.getProviderCapabilities(req.user.id);
    
    const allCategories = new Set();
    Object.values(capabilities).forEach(capability => {
      if (capability.categories) {
        capability.categories.forEach(category => allCategories.add(category));
      }
    });

    const categoriesArray = Array.from(allCategories).sort();

    res.json({
      success: true,
      data: {
        categories: categoriesArray,
        total: categoriesArray.length
      }
    });

  } catch (error) {
    console.error('Categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get categories',
      error: error.message
    });
  }
});

module.exports = { router, initializeDataSourceManager }; 