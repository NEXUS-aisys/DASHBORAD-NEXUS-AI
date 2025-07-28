const AlphaVantageProvider = require('./dataProviders/coreProviders/alphaVantageProvider');
const FinnhubProvider = require('./dataProviders/coreProviders/finnhubProvider');
const MockRealTimeProvider = require('./dataProviders/coreProviders/mockRealTimeProvider');
const BybitProvider = require('./dataProviders/coreProviders/bybitProvider');
const PolygonProvider = require('./dataProviders/coreProviders/polygonProvider');
const YahooFinanceProvider = require('./dataProviders/coreProviders/yahooFinanceProvider');
const RithmicWebSocketProvider = require('./dataProviders/coreProviders/rithmicWebSocketProvider');
const EventEmitter = require('events');

class DataSourceManager extends EventEmitter {
  constructor() {
    super();
    this.coreProviders = new Map();
    this.userProviders = new Map(); // Will store user-specific providers
    this.symbolCache = new Map();
    this.lastCacheUpdate = 0;
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
    this.isInitialized = false;
  }

  /**
   * Initialize the data source manager with core providers
   * @returns {Promise<boolean>} Initialization success
   */
  async initialize() {
    try {
      console.log('🚀 Initializing DataSourceManager...');
      
      // Initialize core providers (always available)
      await this.initializeCoreProviders();
      
      this.isInitialized = true;
      console.log('✅ DataSourceManager initialized successfully');
      
      this.emit('initialized');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize DataSourceManager:', error);
      return false;
    }
  }

  /**
   * Initialize core data providers
   * @private
   */
  async initializeCoreProviders() {
    // Yahoo Finance Provider (Real-time data - FREE)
    const yahooFinanceProvider = new YahooFinanceProvider();
    this.coreProviders.set('yahoo_finance', yahooFinanceProvider);
    console.log('📈 Yahoo Finance provider registered (Primary - Real data)');

    // Polygon.io Provider (Your API key - Backup)
    const polygonProvider = new PolygonProvider();
    this.coreProviders.set('polygon', polygonProvider);
    console.log('🔷 Polygon.io provider registered (Backup)');

    // Bybit Provider (Real-time crypto data)
    const bybitProvider = new BybitProvider();
    this.coreProviders.set('bybit', bybitProvider);
    console.log('₿ Bybit provider registered (Crypto)');

    // Rithmic WebSocket Provider (Professional futures data)
    // NOTE: Temporarily disabled until Rithmic WebSocket server is implemented
    console.log('⚠️ Rithmic WebSocket provider temporarily disabled - will be enabled when Rithmic server is implemented');
    
    // TODO: Enable this when we implement the actual Rithmic WebSocket server
    /*
    const rithmicProvider = new RithmicWebSocketProvider({
      wsUrl: process.env.RITHMIC_WS_URL || 'ws://localhost:8080'
    });
    
    // Set up event listeners for Rithmic
    rithmicProvider.on('connected', () => {
      console.log('🔗 Rithmic WebSocket connected');
      this.emit('providerConnected', 'rithmic_websocket');
    });

    rithmicProvider.on('disconnected', () => {
      console.log('❌ Rithmic WebSocket disconnected');
      this.emit('providerDisconnected', 'rithmic_websocket');
    });

    rithmicProvider.on('symbolsUpdated', (symbols) => {
      this.updateSymbolCache('rithmic_websocket', symbols);
      this.emit('symbolsUpdated', 'rithmic_websocket', symbols);
    });

    rithmicProvider.on('marketData', (data) => {
      this.emit('marketData', data);
    });

    this.coreProviders.set('rithmic_websocket', rithmicProvider);
    console.log('⚡ Rithmic WebSocket provider registered');

    // Attempt to connect to Rithmic (non-blocking)
    rithmicProvider.connect().catch(error => {
      console.warn('⚠️ Rithmic connection failed (will retry):', error.message);
    });
    */
  }

  /**
   * Search symbols across all available providers
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Promise<Object>} Grouped search results
   */
  async searchSymbols(query, options = {}) {
    const {
      limit = 10,
      userId = null,
      providers = null, // Array of specific providers to search
      categories = null // Array of categories to filter
    } = options;

    const results = {
      query: query,
      timestamp: new Date().toISOString(),
      providers: {},
      summary: {
        totalResults: 0,
        providersSearched: 0,
        providersAvailable: 0
      }
    };

    try {
      // Get available providers for this user
      const availableProviders = await this.getAvailableProviders(userId);
      results.summary.providersAvailable = availableProviders.length;

      // Filter providers if specified
      const providersToSearch = providers 
        ? availableProviders.filter(p => providers.includes(p.name))
        : availableProviders;

      // Search each provider in parallel
      const searchPromises = providersToSearch.map(async (provider) => {
        try {
          const providerResults = await provider.searchSymbols(query, limit);
          
          // Filter by categories if specified
          const filteredResults = categories
            ? providerResults.filter(symbol => categories.includes(symbol.category))
            : providerResults;

          return {
            provider: provider.name,
            displayName: provider.displayName || provider.name,
            type: provider.type,
            results: filteredResults,
            resultCount: filteredResults.length,
            success: true
          };
        } catch (error) {
          console.error(`Search error for provider ${provider.name}:`, error);
          return {
            provider: provider.name,
            displayName: provider.displayName || provider.name,
            type: provider.type,
            results: [],
            resultCount: 0,
            success: false,
            error: error.message
          };
        }
      });

      const searchResults = await Promise.all(searchPromises);
      
      // Group results by provider
      searchResults.forEach(result => {
        results.providers[result.provider] = result;
        results.summary.totalResults += result.resultCount;
        if (result.success) {
          results.summary.providersSearched++;
        }
      });

      // Cache the results
      this.cacheSearchResults(query, results);

      return results;
    } catch (error) {
      console.error('Search symbols error:', error);
      throw error;
    }
  }

  /**
   * Get popular symbols across providers
   * @param {Object} options - Options
   * @returns {Promise<Object>} Popular symbols by provider
   */
  async getPopularSymbols(options = {}) {
    const {
      category = 'all',
      userId = null,
      limit = 10
    } = options;

    const results = {
      category: category,
      timestamp: new Date().toISOString(),
      providers: {}
    };

    const availableProviders = await this.getAvailableProviders(userId);

    const popularPromises = availableProviders.map(async (provider) => {
      try {
        if (typeof provider.getPopularSymbols === 'function') {
          const symbols = await provider.getPopularSymbols(category);
          return {
            provider: provider.name,
            displayName: provider.displayName || provider.name,
            symbols: symbols.slice(0, limit),
            success: true
          };
        } else {
          return {
            provider: provider.name,
            displayName: provider.displayName || provider.name,
            symbols: [],
            success: false,
            message: 'Popular symbols not supported'
          };
        }
      } catch (error) {
        return {
          provider: provider.name,
          displayName: provider.displayName || provider.name,
          symbols: [],
          success: false,
          error: error.message
        };
      }
    });

    const popularResults = await Promise.all(popularPromises);
    
    popularResults.forEach(result => {
      results.providers[result.provider] = result;
    });

    return results;
  }

  /**
   * Get real-time market data for a symbol
   * @param {string} symbol - Symbol to get data for
   * @param {string} provider - Specific provider to use
   * @param {string} userId - User ID for provider access
   * @returns {Promise<Object>} Market data
   */
  async getMarketData(symbol, provider = null, userId = null) {
    try {
      const availableProviders = await this.getAvailableProviders(userId);
      
      if (availableProviders.length === 0) {
        throw new Error('No data providers available');
      }

      let targetProvider;
      if (provider) {
        targetProvider = availableProviders.find(p => p.name === provider);
        if (!targetProvider) {
          throw new Error(`Provider ${provider} not available for user`);
        }
      } else {
        // Find the best provider for this symbol
        targetProvider = await this.findBestProviderForSymbol(symbol, availableProviders);
      }

      if (!targetProvider) {
        // Fallback to first available provider
        targetProvider = availableProviders[0];
      }

      if (!targetProvider || typeof targetProvider.getMarketData !== 'function') {
        throw new Error(`No suitable provider found for symbol ${symbol}`);
      }

      try {
        const marketData = await targetProvider.getMarketData(symbol);
        return {
          status: 'success',
          data: marketData,
          provider: targetProvider.name,
          fallback: false
        };
      } catch (providerError) {
        console.error(`Primary provider ${targetProvider.name} failed for ${symbol}:`, providerError.message);
        
        // Smart fallback system for stock symbols
        const symbolUpper = symbol.toUpperCase();
        
        // For crypto, try Bybit as fallback
        if (symbolUpper.includes('USDT') || symbolUpper.includes('BTC') || symbolUpper.includes('ETH')) {
          const bybitProvider = availableProviders.find(p => p.name === 'bybit');
          if (bybitProvider && bybitProvider !== targetProvider) {
            try {
              console.log(`🔄 Trying Bybit fallback for ${symbol}`);
              const fallbackData = await bybitProvider.getMarketData(symbol);
              return {
                status: 'success',
                data: fallbackData,
                provider: 'bybit',
                fallback: true
              };
            } catch (fallbackError) {
              console.error(`Bybit fallback also failed for ${symbol}:`, fallbackError.message);
            }
          }
        }

        // No fallback - only real data or error
        console.log(`❌ All real data providers failed for ${symbol}`);
        throw new Error(`No real market data available for ${symbol}. All providers are rate limited.`);
      }
    } catch (error) {
      console.error(`Market data error for ${symbol}:`, error);
      return {
        status: 'error',
        error: error.message,
        symbol: symbol
      };
    }
  }

  /**
   * Get available providers for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Array of available providers
   */
  async getAvailableProviders(userId = null) {
    const providers = [];

    // Always include core providers (including for test endpoints with null userId)
    for (const [name, provider] of this.coreProviders) {
      providers.push(provider);
    }

    // Add user-specific providers if userId is provided
    if (userId && this.userProviders.has(userId)) {
      const userProviderMap = this.userProviders.get(userId);
      for (const [name, provider] of userProviderMap) {
        providers.push(provider);
      }
    }

    return providers;
  }

  /**
   * Find the best provider for a specific symbol
   * @param {string} symbol - Symbol to find provider for
   * @param {Array} availableProviders - Available providers
   * @returns {Promise<Object>} Best provider
   */
  async findBestProviderForSymbol(symbol, availableProviders) {
    // Priority logic:
    // 1. Bybit for crypto symbols (USDT pairs)
    // 2. Rithmic for futures symbols
    // 3. Stock providers with fallback system

    const symbolUpper = symbol.toUpperCase();
    console.log(`🔍 Finding best provider for ${symbol} (${symbolUpper})`);
    console.log(`📊 Available providers:`, availableProviders.map(p => p.name));

    // Check for crypto patterns (USDT pairs)
    if (symbolUpper.includes('USDT') || symbolUpper.includes('BTC') || symbolUpper.includes('ETH')) {
      const bybitProvider = availableProviders.find(p => p.name === 'bybit');
      if (bybitProvider) {
        console.log(`✅ Selected Bybit provider for ${symbol}`);
        return bybitProvider;
      } else {
        console.log(`❌ Bybit provider not found for ${symbol}`);
      }
    }

    // Check for futures patterns
    if (symbolUpper.match(/^(ES|NQ|YM|RTY|GC|CL|ZB|ZN)/)) {
      const rithmicProvider = availableProviders.find(p => p.name === 'rithmic_websocket');
      if (rithmicProvider) return rithmicProvider;
    }

    // Stock providers - Polygon for real data (since Yahoo Finance is often rate limited)
    const stockProviders = [
      'polygon',          // Primary - Your API key (more reliable)
      'yahoo_finance'     // Backup - Free but often rate limited
    ];

    for (const providerName of stockProviders) {
      const provider = availableProviders.find(p => p.name === providerName);
      if (provider) {
        console.log(`✅ Selected ${providerName} provider for ${symbol}`);
        return provider;
      }
    }

    // Return first available provider
    console.log(`⚠️ No specific provider found, using first available:`, availableProviders[0]?.name);
    return availableProviders[0] || null;
  }

  /**
   * Test all provider connections
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Test results
   */
  async testAllConnections(userId = null) {
    const availableProviders = await this.getAvailableProviders(userId);
    
    const testPromises = availableProviders.map(async (provider) => {
      if (typeof provider.testConnection === 'function') {
        return await provider.testConnection();
      } else {
        return {
          success: false,
          provider: provider.name,
          message: 'Test connection not supported'
        };
      }
    });

    const testResults = await Promise.all(testPromises);
    
    return {
      timestamp: new Date().toISOString(),
      results: testResults,
      summary: {
        total: testResults.length,
        successful: testResults.filter(r => r.success).length,
        failed: testResults.filter(r => !r.success).length
      }
    };
  }

  /**
   * Update symbol cache for a provider
   * @param {string} providerName - Provider name
   * @param {Array} symbols - Symbols to cache
   */
  updateSymbolCache(providerName, symbols) {
    if (!this.symbolCache.has(providerName)) {
      this.symbolCache.set(providerName, new Map());
    }
    
    const providerCache = this.symbolCache.get(providerName);
    symbols.forEach(symbol => {
      providerCache.set(symbol.symbol, symbol);
    });
    
    this.lastCacheUpdate = Date.now();
    console.log(`📦 Updated symbol cache for ${providerName}: ${symbols.length} symbols`);
  }

  /**
   * Cache search results
   * @param {string} query - Search query
   * @param {Object} results - Search results
   */
  cacheSearchResults(query, results) {
    // Simple in-memory cache - can be enhanced with Redis later
    if (!this.searchCache) {
      this.searchCache = new Map();
    }
    
    this.searchCache.set(query.toLowerCase(), {
      results: results,
      timestamp: Date.now()
    });
    
    // Clean old cache entries
    if (this.searchCache.size > 1000) {
      const oldestEntries = Array.from(this.searchCache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp)
        .slice(0, 100);
      
      oldestEntries.forEach(([key]) => {
        this.searchCache.delete(key);
      });
    }
  }

  /**
   * Get provider capabilities
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Provider capabilities
   */
  async getProviderCapabilities(userId = null) {
    const availableProviders = await this.getAvailableProviders(userId);
    
    const capabilities = {};
    availableProviders.forEach(provider => {
      if (typeof provider.getCapabilities === 'function') {
        capabilities[provider.name] = provider.getCapabilities();
      }
    });

    return capabilities;
  }

  /**
   * Add user-specific provider (for crypto APIs, MT4/MT5, etc.)
   * @param {string} userId - User ID
   * @param {string} providerName - Provider name
   * @param {Object} provider - Provider instance
   */
  addUserProvider(userId, providerName, provider) {
    if (!this.userProviders.has(userId)) {
      this.userProviders.set(userId, new Map());
    }
    
    const userProviderMap = this.userProviders.get(userId);
    userProviderMap.set(providerName, provider);
    
    console.log(`✅ Added user provider ${providerName} for user ${userId}`);
    this.emit('userProviderAdded', userId, providerName);
  }

  /**
   * Remove user-specific provider
   * @param {string} userId - User ID
   * @param {string} providerName - Provider name
   */
  removeUserProvider(userId, providerName) {
    if (this.userProviders.has(userId)) {
      const userProviderMap = this.userProviders.get(userId);
      userProviderMap.delete(providerName);
      
      if (userProviderMap.size === 0) {
        this.userProviders.delete(userId);
      }
      
      console.log(`❌ Removed user provider ${providerName} for user ${userId}`);
      this.emit('userProviderRemoved', userId, providerName);
    }
  }

  /**
   * Get core provider by name
   * @param {string} name - Provider name
   * @returns {Object|null} Provider instance
   */
  getCoreProvider(name) {
    return this.coreProviders.get(name) || null;
  }

  /**
   * Check if manager is ready
   * @returns {boolean} Ready status
   */
  isReady() {
    return this.isInitialized;
  }

  /**
   * Shutdown the data source manager
   */
  async shutdown() {
    console.log('🔄 Shutting down DataSourceManager...');
    
    // Disconnect all core providers
    for (const [name, provider] of this.coreProviders) {
      if (typeof provider.disconnect === 'function') {
        provider.disconnect();
      }
    }

    // Disconnect all user providers
    for (const [userId, userProviderMap] of this.userProviders) {
      for (const [name, provider] of userProviderMap) {
        if (typeof provider.disconnect === 'function') {
          provider.disconnect();
        }
      }
    }

    this.isInitialized = false;
    console.log('✅ DataSourceManager shutdown complete');
  }
}

module.exports = DataSourceManager; 