const axios = require('axios');

class AlphaVantageProvider {
  constructor() {
    this.name = 'alpha_vantage';
    this.displayName = 'Alpha Vantage';
    this.type = 'core';
    this.baseUrl = 'https://www.alphavantage.co/query';
    this.apiKey = process.env.ALPHA_VANTAGE_API_KEY || 'demo'; // Use demo key as fallback
    this.rateLimitMs = 12000; // Alpha Vantage free tier: 5 requests per minute
    this.lastRequestTime = 0;
  }

  /**
   * Search for symbols on Alpha Vantage
   * @param {string} query - Search query (e.g., "AAPL", "QQQ")
   * @param {number} limit - Maximum number of results
   * @returns {Promise<Array>} Array of symbol objects
   */
  async searchSymbols(query, limit = 10) {
    try {
      await this.enforceRateLimit();
      
      const response = await axios.get(this.baseUrl, {
        params: {
          function: 'SYMBOL_SEARCH',
          keywords: query,
          apikey: this.apiKey
        },
        timeout: 10000
      });

      const matches = response.data?.bestMatches || [];
      
      return matches.slice(0, limit).map(match => ({
        symbol: match['1. symbol'],
        name: match['2. name'],
        type: this.determineAssetType(match),
        exchange: match['4. region'],
        provider: this.name,
        providerDisplayName: this.displayName,
        currency: match['8. currency'],
        category: this.categorizeSymbol(match),
        metadata: {
          market: match['3. type'],
          region: match['4. region'],
          timezone: match['7. timezone'],
          isAlphaVantage: true
        }
      }));
    } catch (error) {
      console.error(`Alpha Vantage search error for "${query}":`, error.message);
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
      
      const response = await axios.get(this.baseUrl, {
        params: {
          function: 'GLOBAL_QUOTE',
          symbol: symbol,
          apikey: this.apiKey
        },
        timeout: 10000
      });

      const quote = response.data?.['Global Quote'];
      
      if (!quote || Object.keys(quote).length === 0) {
        throw new Error(`No data found for symbol: ${symbol}`);
      }

      const currentPrice = parseFloat(quote['05. price']);
      const previousClose = parseFloat(quote['08. previous close']);
      const change = parseFloat(quote['09. change']);
      const changePercent = parseFloat(quote['10. change percent'].replace('%', ''));

      return {
        symbol: symbol,
        provider: this.name,
        timestamp: new Date().toISOString(),
        price: currentPrice,
        change: change,
        changePercent: changePercent,
        volume: parseInt(quote['06. volume']),
        dayHigh: parseFloat(quote['03. high']),
        dayLow: parseFloat(quote['04. low']),
        open: parseFloat(quote['02. open']),
        previousClose: previousClose,
        marketCap: null, // Not available in Global Quote
        metadata: {
          lastUpdated: quote['07. latest trading day'],
          isAlphaVantage: true
        }
      };
    } catch (error) {
      console.error(`Alpha Vantage market data error for ${symbol}:`, error.message);
      throw error;
    }
  }

  /**
   * Get popular symbols
   * @param {string} category - Category filter
   * @returns {Promise<Array>} Array of popular symbols
   */
  async getPopularSymbols(category = 'stocks') {
    // Popular symbols for Alpha Vantage
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
        isAlphaVantage: true
      }
    }));
  }

  /**
   * Determine asset type based on symbol data
   * @param {Object} match - Symbol match data
   * @returns {string} Asset type
   */
  determineAssetType(match) {
    const type = match['3. type']?.toLowerCase() || '';
    
    if (type.includes('etf')) return 'etf';
    if (type.includes('fund')) return 'fund';
    if (type.includes('bond')) return 'bond';
    if (type.includes('option')) return 'option';
    if (type.includes('future')) return 'future';
    
    return 'stock';
  }

  /**
   * Categorize symbol based on data
   * @param {Object} match - Symbol match data
   * @returns {string} Category
   */
  categorizeSymbol(match) {
    const name = match['2. name']?.toLowerCase() || '';
    
    if (name.includes('etf') || name.includes('trust')) return 'ETF';
    if (name.includes('fund')) return 'Fund';
    if (name.includes('bond')) return 'Bond';
    if (name.includes('option')) return 'Options';
    if (name.includes('future')) return 'Futures';
    
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
   * Test connection to Alpha Vantage API
   * @returns {Promise<boolean>} Connection success
   */
  async testConnection() {
    try {
      await this.enforceRateLimit();
      
      const response = await axios.get(this.baseUrl, {
        params: {
          function: 'TIME_SERIES_INTRADAY',
          symbol: 'AAPL',
          interval: '1min',
          apikey: this.apiKey
        },
        timeout: 5000
      });
      
      return !response.data['Error Message'] && !response.data['Note'];
    } catch (error) {
      console.error('Alpha Vantage connection test failed:', error.message);
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
      features: ['real_time_quotes', 'historical_data', 'technical_indicators']
    };
  }
}

module.exports = AlphaVantageProvider; 