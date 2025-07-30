const AlphaVantageProvider = require('./dataProviders/coreProviders/alphaVantageProvider');
const FinnhubProvider = require('./dataProviders/coreProviders/finnhubProvider');
const MockRealTimeProvider = require('./dataProviders/coreProviders/mockRealTimeProvider');
const BybitProvider = require('./dataProviders/coreProviders/bybitProvider');
const PolygonProvider = require('./dataProviders/coreProviders/polygonProvider');

const RithmicWebSocketProvider = require('./dataProviders/coreProviders/rithmicWebSocketProvider');
const EventEmitter = require('events');
const redisCache = require('./redisCache');
const circuitBreaker = require('./circuitBreaker');

class DataSourceManager extends EventEmitter {
  constructor() {
    super();
    this.coreProviders = new Map();
    this.userProviders = new Map(); // Will store user-specific providers
    this.cache = redisCache; // Use Redis cache instead of in-memory
    this.lastCacheUpdate = 0;
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
    this.isInitialized = false;
    
    // Cache TTL configurations (in seconds)
    this.cacheTTL = {
      marketData: 30,        // Market data cache for 30 seconds
      searchResults: 300,    // Search results cache for 5 minutes
      symbolData: 3600,      // Symbol metadata cache for 1 hour
      popularSymbols: 1800   // Popular symbols cache for 30 minutes
    };
  }

  /**
   * Initialize the data source manager with core providers
   * @returns {Promise<boolean>} Initialization success
   */
  async initialize() {
    try {
      console.log('🚀 Initializing DataSourceManager...');
      
      // Initialize Redis cache
      await this.cache.initialize();
      
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
    // Alpha Vantage Provider (Real-time data - PRIMARY)
    const alphaVantageProvider = new AlphaVantageProvider();
    this.coreProviders.set('alpha_vantage', alphaVantageProvider);
    console.log('📈 Alpha Vantage provider registered (Primary - Real data)');

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

    // Check cache first
    const cachedResults = await this.getCachedSearchResults(query);
    if (cachedResults) {
      return {
        ...cachedResults,
        cached: true
      };
    }

    const results = {
      query: query,
      timestamp: new Date().toISOString(),
      providers: {},
      summary: {
        totalResults: 0,
        providersSearched: 0,
        providersAvailable: 0
      },
      cached: false
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
      await this.cacheSearchResults(query, results);

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

    // Check cache first
    const cacheKey = `popular:${category}:${userId || 'guest'}:${limit}`;
    const cachedResults = await this.cache.get(cacheKey);
    
    if (cachedResults) {
      console.log(`📦 Cache hit for popular symbols (${category})`);
      return {
        ...cachedResults,
        cached: true
      };
    }

    const results = {
      category: category,
      timestamp: new Date().toISOString(),
      providers: {},
      cached: false
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

    // Cache the results
    try {
      await this.cache.set(cacheKey, results, this.cacheTTL.popularSymbols);
      console.log(`💾 Cached popular symbols for ${category} (${this.cacheTTL.popularSymbols}s)`);
    } catch (error) {
      console.warn(`⚠️ Failed to cache popular symbols:`, error.message);
    }

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
      // Check cache first
      const cacheKey = `marketData:${symbol}:${provider || 'auto'}:${userId || 'guest'}`;
      const cachedData = await this.cache.get(cacheKey);
      
      if (cachedData) {
        console.log(`📦 Cache hit for ${symbol} market data`);
        return {
          ...cachedData,
          cached: true
        };
      }

      const availableProviders = await this.getAvailableProviders(userId);
      
      if (availableProviders.length === 0) {
        throw new Error('No data providers available');
      }

      let result;
      
      if (provider) {
        // Single provider requested
        const targetProvider = availableProviders.find(p => p.name === provider);
        if (!targetProvider) {
          throw new Error(`Provider ${provider} not available for user`);
        }
        
        result = await this.getMarketDataWithCircuitBreaker(symbol, targetProvider);
      } else {
        // Try parallel execution with circuit breaker protection
        result = await this.getMarketDataParallel(symbol, availableProviders);
      }

      if (result.status === 'success') {
        // Cache the successful result
        await this.cache.set(cacheKey, result, this.cacheTTL.marketData);
        console.log(`💾 Cached market data for ${symbol} (${this.cacheTTL.marketData}s)`);
      }
      
      return result;
    } catch (error) {
      console.error(`Market data error for ${symbol}:`, error);
      return {
        status: 'error',
        error: error.message,
        symbol: symbol,
        cached: false
      };
    }
  }

  /**
   * Get market data with circuit breaker protection
   */
  async getMarketDataWithCircuitBreaker(symbol, provider) {
    try {
      const marketData = await circuitBreaker.executeWithBreaker(
        provider.name,
        provider,
        'getMarketData',
        symbol
      );

      if (marketData) {
        return {
          status: 'success',
          data: marketData,
          provider: provider.name,
          fallback: false,
          cached: false,
          circuitBreakerProtected: true
        };
      } else {
        throw new Error(`Circuit breaker returned null for ${provider.name}`);
      }
    } catch (error) {
      throw new Error(`Provider ${provider.name} failed: ${error.message}`);
    }
  }

  /**
   * Get market data using parallel execution with circuit breaker protection
   */
  async getMarketDataParallel(symbol, availableProviders) {
    // Determine the best provider order for this symbol
    const bestProvider = await this.findBestProviderForSymbol(symbol, availableProviders);
    const otherProviders = availableProviders.filter(p => p !== bestProvider);
    
    // Prepare parallel calls - best provider first, then others
    const providerCalls = [];
    
    if (bestProvider) {
      providerCalls.push({
        providerName: bestProvider.name,
        provider: bestProvider,
        method: 'getMarketData',
        args: [symbol]
      });
    }

    // Add other providers for parallel execution
    otherProviders.forEach(provider => {
      providerCalls.push({
        providerName: provider.name,
        provider: provider,
        method: 'getMarketData',
        args: [symbol]
      });
    });

    if (providerCalls.length === 0) {
      throw new Error(`No suitable providers found for symbol ${symbol}`);
    }

    // Execute calls in parallel with circuit breaker protection
    console.log(`🚀 Executing parallel market data fetch for ${symbol} across ${providerCalls.length} providers`);
    const results = await circuitBreaker.executeInParallel(providerCalls);
    
    // Find the first successful result (prioritizing the best provider)
    for (const result of results) {
      if (result.success && result.result) {
        console.log(`✅ Parallel execution success for ${symbol} via ${result.providerName}`);
        return {
          status: 'success',
          data: result.result,
          provider: result.providerName,
          fallback: result.providerName !== (bestProvider?.name),
          cached: false,
          circuitBreakerProtected: true,
          parallelExecution: true,
          triedProviders: results.map(r => r.providerName),
          allResults: results
        };
      }
    }

    // All providers failed
    const failedProviders = results.map(r => `${r.providerName}: ${r.error}`);
    console.log(`❌ All parallel providers failed for ${symbol}`);
    throw new Error(`No real market data available for ${symbol}. All providers failed: ${failedProviders.join(', ')}`);
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

    // Check for futures patterns (NQ=F, ES=F, etc.)
    if (symbolUpper.match(/^(ES|NQ|YM|RTY|GC|CL|ZB|ZN)/) || symbolUpper.includes('=F')) {
      // For futures, try Alpha Vantage first (Polygon doesn't have futures)
      const alphaProvider = availableProviders.find(p => p.name === 'alpha_vantage');
      if (alphaProvider) {
        console.log(`✅ Selected Alpha Vantage provider for futures symbol ${symbol}`);
        return alphaProvider;
      }
      
      // Fallback to Rithmic if available
      const rithmicProvider = availableProviders.find(p => p.name === 'rithmic_websocket');
      if (rithmicProvider) return rithmicProvider;
    }

          // Stock providers - Alpha Vantage first for better coverage, then Polygon
      const stockProviders = [
        'alpha_vantage',    // Primary - Better coverage (stocks, ETFs, funds)
        'polygon'           // Backup - Your API key (stocks only)
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
  async updateSymbolCache(providerName, symbols) {
    try {
      // Cache individual symbols
      const cachePromises = symbols.map(async (symbol) => {
        const cacheKey = `symbol:${providerName}:${symbol.symbol}`;
        await this.cache.set(cacheKey, symbol, this.cacheTTL.symbolData);
      });
      
      // Cache the provider's symbol list
      const providerSymbolsKey = `symbols:${providerName}`;
      await this.cache.set(providerSymbolsKey, symbols, this.cacheTTL.symbolData);
      
      await Promise.all(cachePromises);
      
      this.lastCacheUpdate = Date.now();
      console.log(`💾 Updated Redis symbol cache for ${providerName}: ${symbols.length} symbols`);
    } catch (error) {
      console.warn(`⚠️ Failed to update symbol cache for ${providerName}:`, error.message);
    }
  }

  /**
   * Cache search results
   * @param {string} query - Search query
   * @param {Object} results - Search results
   */
  async cacheSearchResults(query, results) {
    try {
      const cacheKey = `search:${query.toLowerCase()}`;
      await this.cache.set(cacheKey, {
        results: results,
        timestamp: Date.now()
      }, this.cacheTTL.searchResults);
      
      console.log(`💾 Cached search results for "${query}" (${this.cacheTTL.searchResults}s)`);
    } catch (error) {
      console.warn(`⚠️ Failed to cache search results for "${query}":`, error.message);
    }
  }
  
  /**
   * Get cached search results
   * @param {string} query - Search query
   * @returns {Promise<Object|null>} Cached results or null
   */
  async getCachedSearchResults(query) {
    try {
      const cacheKey = `search:${query.toLowerCase()}`;
      const cached = await this.cache.get(cacheKey);
      
      if (cached) {
        console.log(`📦 Cache hit for search query "${query}"`);
        return cached.results;
      }
      
      return null;
    } catch (error) {
      console.warn(`⚠️ Failed to get cached search results for "${query}":`, error.message);
      return null;
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
    
    // Shutdown circuit breakers
    circuitBreaker.shutdown();
    
    // Close Redis connection
    await this.cache.close();
    
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

  /**
   * Get circuit breaker statistics
   */
  getCircuitBreakerStats() {
    return circuitBreaker.getStats();
  }

  /**
   * Get provider health status
   */
  getProviderHealth() {
    return circuitBreaker.getHealthStatus();
  }

  /**
   * Reset circuit breaker for a specific provider
   */
  resetCircuitBreaker(providerName) {
    return circuitBreaker.resetBreaker(providerName);
  }

  /**
   * Reset all circuit breakers
   */
  resetAllCircuitBreakers() {
    return circuitBreaker.resetAllBreakers();
  }
  
  /**
   * Get cache statistics
   * @returns {Promise<Object>} Cache statistics
   */
  async getCacheStats() {
    return await this.cache.getStats();
  }
  
  /**
   * Clear all cache entries
   * @returns {Promise<boolean>} Success status
   */
  async clearCache() {
    return await this.cache.clear();
  }
}

module.exports = DataSourceManager; 