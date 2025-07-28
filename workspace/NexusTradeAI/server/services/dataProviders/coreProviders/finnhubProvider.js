const axios = require('axios');

class FinnhubProvider {
  constructor() {
    this.name = 'finnhub';
    this.displayName = 'Finnhub';
    this.type = 'core';
    this.baseUrl = 'https://finnhub.io/api/v1';
    this.apiKey = process.env.FINNHUB_API_KEY || 'demo'; // Use demo key as fallback
    this.rateLimitMs = 1000; // 60 requests per minute
    this.lastRequestTime = 0;
  }

  /**
   * Search for symbols on Finnhub
   * @param {string} query - Search query (e.g., "AAPL", "QQQ")
   * @param {number} limit - Maximum number of results
   * @returns {Promise<Array>} Array of symbol objects
   */
  async searchSymbols(query, limit = 10) {
    try {
      await this.enforceRateLimit();
      
      const response = await axios.get(`${this.baseUrl}/search`, {
        params: {
          q: query,
          token: this.apiKey
        },
        timeout: 10000
      });

      const results = response.data?.result || [];
      
      return results.slice(0, limit).map(result => ({
        symbol: result.symbol,
        name: result.description || result.symbol,
        type: this.determineAssetType(result),
        exchange: result.primaryExchange || 'US',
        provider: this.name,
        providerDisplayName: this.displayName,
        category: this.categorizeSymbol(result),
        metadata: {
          type: result.type,
          primaryExchange: result.primaryExchange,
          isFinnhub: true
        }
      }));
    } catch (error) {
      console.error(`Finnhub search error for "${query}":`, error.message);
      return [];
    }
  }

  /**
   * Get real-time market data for a symbol
   * @param {string} symbol - Stock symbol
   * @returns {Promise<Object>} Market data object
   */
  async getMarketData(symbol) {
    try {
      await this.enforceRateLimit();
      
      const response = await axios.get(`${this.baseUrl}/quote`, {
        params: {
          symbol: symbol,
          token: this.apiKey
        },
        timeout: 10000
      });

      const quote = response.data;
      
      if (!quote || quote.c === 0) {
        throw new Error(`No data found for symbol: ${symbol}`);
      }

      const currentPrice = quote.c;
      const previousClose = quote.pc;
      const change = currentPrice - previousClose;
      const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;

      return {
        symbol: symbol,
        provider: this.name,
        timestamp: new Date().toISOString(),
        price: currentPrice,
        change: change,
        changePercent: changePercent,
        volume: quote.v || 0,
        dayHigh: quote.h || currentPrice,
        dayLow: quote.l || currentPrice,
        open: quote.o || currentPrice,
        previousClose: previousClose,
        marketCap: null, // Not available in quote endpoint
        metadata: {
          isFinnhub: true
        }
      };
    } catch (error) {
      console.error(`Finnhub market data error for ${symbol}:`, error.message);
      throw error;
    }
  }

  /**
   * Get popular symbols
   * @param {string} category - Category filter
   * @returns {Promise<Array>} Array of popular symbols
   */
  async getPopularSymbols(category = 'stocks') {
    // Popular symbols for Finnhub
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
      { symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust' }
    ];

    return popularSymbols.map(symbol => ({
      symbol: symbol.symbol,
      name: symbol.name,
      type: 'stock',
      exchange: 'NASDAQ',
      provider: this.name,
      providerDisplayName: this.displayName,
      category: 'Technology',
      metadata: {
        isFinnhub: true
      }
    }));
  }

  /**
   * Determine asset type based on symbol data
   * @param {Object} result - Symbol result data
   * @returns {string} Asset type
   */
  determineAssetType(result) {
    const type = result.type?.toLowerCase() || '';
    
    if (type.includes('etf')) return 'etf';
    if (type.includes('fund')) return 'fund';
    if (type.includes('bond')) return 'bond';
    if (type.includes('option')) return 'option';
    if (type.includes('future')) return 'future';
    
    return 'stock';
  }

  /**
   * Categorize symbol based on data
   * @param {Object} result - Symbol result data
   * @returns {string} Category
   */
  categorizeSymbol(result) {
    const description = result.description?.toLowerCase() || '';
    
    if (description.includes('etf') || description.includes('trust')) return 'ETF';
    if (description.includes('fund')) return 'Fund';
    if (description.includes('bond')) return 'Bond';
    if (description.includes('option')) return 'Options';
    if (description.includes('future')) return 'Futures';
    
    return 'Stocks';
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
   * Test connection to Finnhub API
   * @returns {Promise<boolean>} Connection success
   */
  async testConnection() {
    try {
      await this.enforceRateLimit();
      
      const response = await axios.get(`${this.baseUrl}/quote`, {
        params: {
          symbol: 'AAPL',
          token: this.apiKey
        },
        timeout: 5000
      });
      
      return response.data && response.data.c > 0;
    } catch (error) {
      console.error('Finnhub connection test failed:', error.message);
      return false;
    }
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
      categories: ['stocks', 'etfs', 'funds'],
      exchanges: ['NASDAQ', 'NYSE', 'AMEX'],
      rateLimit: `${this.rateLimitMs}ms`,
      features: ['real_time_quotes', 'historical_data', 'news']
    };
  }
}

module.exports = FinnhubProvider; 