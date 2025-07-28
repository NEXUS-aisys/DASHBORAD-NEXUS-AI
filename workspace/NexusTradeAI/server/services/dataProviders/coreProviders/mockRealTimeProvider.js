const axios = require('axios');

class MockRealTimeProvider {
  constructor() {
    this.name = 'mock_realtime';
    this.displayName = 'Real-Time Mock';
    this.type = 'core';
    this.rateLimitMs = 100; // Fast updates
    this.lastRequestTime = 0;
    
    // Real market data cache (updated periodically)
    this.marketDataCache = new Map();
    this.lastCacheUpdate = 0;
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
    
    // Initialize with real market data
    this.initializeRealData();
  }

  /**
   * Initialize with real market data from public sources
   */
  async initializeRealData() {
    try {
      // Use a public API that doesn't require authentication
      const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
        params: {
          ids: 'bitcoin,ethereum',
          vs_currencies: 'usd',
          include_24hr_change: true
        },
        timeout: 5000
      });

      // Update cache with real crypto data
      if (response.data.bitcoin) {
        this.marketDataCache.set('BTCUSDT', {
          price: response.data.bitcoin.usd,
          changePercent: response.data.bitcoin.usd_24h_change || 0
        });
      }
      
      if (response.data.ethereum) {
        this.marketDataCache.set('ETHUSDT', {
          price: response.data.ethereum.usd,
          changePercent: response.data.ethereum.usd_24h_change || 0
        });
      }

      console.log('✅ Mock provider initialized with real crypto data');
    } catch (error) {
      console.log('⚠️ Using fallback mock data for initialization');
    }
  }

  /**
   * Search for symbols
   * @param {string} query - Search query
   * @param {number} limit - Maximum results
   * @returns {Promise<Array>} Symbol results
   */
  async searchSymbols(query, limit = 10) {
    await this.enforceRateLimit();
    
    const popularSymbols = [
      { symbol: 'AAPL', name: 'Apple Inc.', price: 567.94, change: 1.57, changePercent: 0.28 },
      { symbol: 'MSFT', name: 'Microsoft Corporation', price: 423.67, change: -2.33, changePercent: -0.55 },
      { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 178.45, change: 0.89, changePercent: 0.50 },
      { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 189.23, change: -1.12, changePercent: -0.59 },
      { symbol: 'TSLA', name: 'Tesla Inc.', price: 245.67, change: 3.45, changePercent: 1.42 },
      { symbol: 'META', name: 'Meta Platforms Inc.', price: 512.34, change: -5.67, changePercent: -1.09 },
      { symbol: 'NVDA', name: 'NVIDIA Corporation', price: 1234.56, change: 12.34, changePercent: 1.01 },
      { symbol: 'NFLX', name: 'Netflix Inc.', price: 678.90, change: -8.76, changePercent: -1.27 },
      { symbol: 'QQQ', name: 'Invesco QQQ Trust', price: 567.94, change: 1.57, changePercent: 0.28 },
      { symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust', price: 523.45, change: 0.89, changePercent: 0.17 },
      { symbol: 'BTCUSDT', name: 'Bitcoin', price: 117700.60, change: -1348.40, changePercent: -1.13 },
      { symbol: 'ETHUSDT', name: 'Ethereum', price: 3785.41, change: -32.92, changePercent: -0.86 }
    ];

    const filteredSymbols = popularSymbols
      .filter(symbol => 
        symbol.symbol.toLowerCase().includes(query.toLowerCase()) ||
        symbol.name.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, limit);

    return filteredSymbols.map(symbol => ({
      symbol: symbol.symbol,
      name: symbol.name,
      type: symbol.symbol.includes('USDT') ? 'crypto' : 'stock',
      exchange: symbol.symbol.includes('USDT') ? 'BYBIT' : 'NASDAQ',
      provider: this.name,
      providerDisplayName: this.displayName,
      category: symbol.symbol.includes('USDT') ? 'Cryptocurrency' : 'Technology',
      metadata: {
        isMockRealTime: true
      }
    }));
  }

  /**
   * Get real-time market data for a symbol
   * @param {string} symbol - Symbol to get data for
   * @returns {Promise<Object>} Market data
   */
  async getMarketData(symbol) {
    await this.enforceRateLimit();
    
    // Check cache first
    const cachedData = this.marketDataCache.get(symbol);
    if (cachedData && Date.now() - this.lastCacheUpdate < this.cacheExpiry) {
      return this.generateMarketData(symbol, cachedData.price, cachedData.changePercent);
    }

    // Generate realistic market data based on symbol
    const baseData = this.getBaseMarketData(symbol);
    if (!baseData) {
      throw new Error(`Symbol not supported: ${symbol}`);
    }

    // Add realistic price movement
    const priceVariation = (Math.random() - 0.5) * 0.02; // ±1% variation
    const currentPrice = baseData.price * (1 + priceVariation);
    const change = currentPrice - baseData.price;
    const changePercent = (change / baseData.price) * 100;

    // Update cache
    this.marketDataCache.set(symbol, {
      price: currentPrice,
      changePercent: changePercent
    });

    return this.generateMarketData(symbol, currentPrice, changePercent);
  }

  /**
   * Generate market data object
   * @param {string} symbol - Symbol
   * @param {number} price - Current price
   * @param {number} changePercent - Price change percent
   * @returns {Object} Market data object
   */
  generateMarketData(symbol, price, changePercent) {
    const change = price * (changePercent / 100);
    const previousClose = price - change;
    const volume = Math.floor(Math.random() * 1000000) + 100000;
    const dayHigh = price * (1 + Math.random() * 0.05);
    const dayLow = price * (1 - Math.random() * 0.05);
    const open = previousClose * (1 + (Math.random() - 0.5) * 0.02);

    return {
      symbol: symbol,
      provider: this.name,
      timestamp: new Date().toISOString(),
      price: parseFloat(price.toFixed(2)),
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat(changePercent.toFixed(2)),
      volume: volume,
      dayHigh: parseFloat(dayHigh.toFixed(2)),
      dayLow: parseFloat(dayLow.toFixed(2)),
      open: parseFloat(open.toFixed(2)),
      previousClose: parseFloat(previousClose.toFixed(2)),
      marketCap: null,
      metadata: {
        isMockRealTime: true,
        dataQuality: 'simulated'
      }
    };
  }

  /**
   * Get base market data for symbols
   * @param {string} symbol - Symbol
   * @returns {Object|null} Base market data
   */
  getBaseMarketData(symbol) {
    const baseData = {
      'AAPL': { price: 567.94, change: 1.57, changePercent: 0.28 },
      'MSFT': { price: 423.67, change: -2.33, changePercent: -0.55 },
      'GOOGL': { price: 178.45, change: 0.89, changePercent: 0.50 },
      'AMZN': { price: 189.23, change: -1.12, changePercent: -0.59 },
      'TSLA': { price: 245.67, change: 3.45, changePercent: 1.42 },
      'META': { price: 512.34, change: -5.67, changePercent: -1.09 },
      'NVDA': { price: 1234.56, change: 12.34, changePercent: 1.01 },
      'NFLX': { price: 678.90, change: -8.76, changePercent: -1.27 },
      'QQQ': { price: 567.94, change: 1.57, changePercent: 0.28 },
      'SPY': { price: 523.45, change: 0.89, changePercent: 0.17 },
      'BTCUSDT': { price: 117700.60, change: -1348.40, changePercent: -1.13 },
      'ETHUSDT': { price: 3785.41, change: -32.92, changePercent: -0.86 }
    };

    return baseData[symbol] || null;
  }

  /**
   * Get popular symbols
   * @param {string} category - Category filter
   * @returns {Promise<Array>} Popular symbols
   */
  async getPopularSymbols(category = 'stocks') {
    const popularSymbols = [
      { symbol: 'AAPL', name: 'Apple Inc.' },
      { symbol: 'MSFT', name: 'Microsoft Corporation' },
      { symbol: 'GOOGL', name: 'Alphabet Inc.' },
      { symbol: 'AMZN', name: 'Amazon.com Inc.' },
      { symbol: 'TSLA', name: 'Tesla Inc.' },
      { symbol: 'META', name: 'Meta Platforms Inc.' },
      { symbol: 'NVDA', name: 'NVIDIA Corporation' },
      { symbol: 'NFLX', name: 'Netflix Inc.' },
      { symbol: 'QQQ', name: 'Invesco QQQ Trust' },
      { symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust' },
      { symbol: 'BTCUSDT', name: 'Bitcoin' },
      { symbol: 'ETHUSDT', name: 'Ethereum' }
    ];

    return popularSymbols.map(symbol => ({
      symbol: symbol.symbol,
      name: symbol.name,
      type: symbol.symbol.includes('USDT') ? 'crypto' : 'stock',
      exchange: symbol.symbol.includes('USDT') ? 'BYBIT' : 'NASDAQ',
      provider: this.name,
      providerDisplayName: this.displayName,
      category: symbol.symbol.includes('USDT') ? 'Cryptocurrency' : 'Technology',
      metadata: {
        isMockRealTime: true
      }
    }));
  }

  /**
   * Enforce rate limiting
   * @private
   */
  async enforceRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.rateLimitMs) {
      const delay = this.rateLimitMs - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    this.lastRequestTime = Date.now();
  }

  /**
   * Test connection
   * @returns {Promise<boolean>} Connection success
   */
  async testConnection() {
    return true; // Mock provider always available
  }

  /**
   * Get provider capabilities
   * @returns {Object} Capabilities object
   */
  getCapabilities() {
    return {
      search: true,
      marketData: true,
      realTime: true,
      categories: ['stocks', 'crypto', 'etfs'],
      exchanges: ['NASDAQ', 'NYSE', 'BYBIT'],
      rateLimit: `${this.rateLimitMs}ms`,
      features: ['real_time_quotes', 'simulated_data']
    };
  }
}

module.exports = MockRealTimeProvider; 